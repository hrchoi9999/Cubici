package egovframework.azon.cmmn.service;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import egovframework.azon.cmmn.cbc.CBCComponent;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.errorCode.FileErrorCode;
import egovframework.azon.cmmn.exception.FileException;
import egovframework.azon.cmmn.mapper.FileMapper;

@Service
public class FileService {
	
	Logger logger = LoggerFactory.getLogger(FileService.class);
	
	final String[] reg = {"jpg", "jpeg", "png", "hwp", "pdf"};
	
	@Autowired
	FileMapper fileMapper;
	
	@Autowired
	CBCComponent cbcComponent;
	
	public void fileUpload(HashMap<String, Object> paramMap, List<MultipartFile> fileList, String fileFolder) throws FileException, IOException {
		String encType = String.valueOf(paramMap.get("enc_type"));
		
		if(!(encType.equals("Y") || encType.equals("N"))) {
			throw new FileException(FileErrorCode.EncTypeNotDefined);
		}
		
		HashMap<String, Object> fileMap = new HashMap<String, Object>();
		fileMap.putAll(paramMap);

		fileFolder(fileFolder);
		
		for(MultipartFile file: fileList) {
			fileMap = fileMap(file, fileMap, fileFolder);
			String filePath = String.valueOf(fileMap.get("file_path"));
			File saveFile = new File(filePath);

			if(!filePath.equals("null")) {
				saveFile.createNewFile();
				byte fileData[] = encType.equals("Y") ? cbcComponent.toFileEncryption(file.getBytes()) : file.getBytes(); 
				FileOutputStream fos = new FileOutputStream(saveFile);
				fos.write(fileData);
				fos.close();
				
				fileMapper.fileUpload(fileMap);
			} else {
				throw new FileException(FileErrorCode.FilePathNotExist);
			}
		}
		
		List<String> deluuid = CubiciUtils.toArrayList(String.valueOf(paramMap.get("delfile")));
		uploadFileDelete(deluuid);
	}
	
	private void fileFolder(String param) {
		File fileFolder = new File(param);
		
		if(!fileFolder.exists()) {
			fileFolder.mkdirs();
		}
	}
	
	private HashMap<String, Object> fileMap(MultipartFile file, HashMap<String, Object> resultMap, String fileFolder) {
		String uuid = UUID.randomUUID().toString();
		
		String fileName = file.getOriginalFilename();
		String originFileName = fileName.substring(0, fileName.lastIndexOf("."));
		String storeFileName = uuid + "_" + fileName;
		String fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);
		String fileSize = Long.toString(file.getSize());
		String filePath = fileFolder + File.separator + storeFileName;
		
		resultMap.put("uuid", uuid);
		resultMap.put("origin_file_name", originFileName);
		resultMap.put("store_file_name", storeFileName);
		resultMap.put("file_ext", fileExt);
		resultMap.put("file_size", fileSize);
		resultMap.put("file_path", filePath);
		
		fileVaildator(fileExt, Integer.parseInt(fileSize));
		
		return resultMap;
	}
	
	private void fileVaildator(String ext, int size) {
		boolean isExt = false;
		boolean isSize = false;
		
		ext = ext.toLowerCase();
		for(String param : reg) {
			if(param.equals(ext)) {
				isExt = true;
				break;
			}
		}
		
		if(size > 5242880) {
			isSize = true;
		}
		
		if(!isExt) {
			throw new FileException(FileErrorCode.InvalidExt);
		} else if(isSize) {
			throw new FileException(FileErrorCode.FileOversize);
		}
	}

	private void uploadFileDelete(List<String> paramList) {
		HashMap<String, Object> filePath = new HashMap<>();
		for(String param : paramList) {
			filePath = fileMapper.FilePath(param);
			File file = new File(String.valueOf(filePath.get("file_path")));
			
			if(file.exists()) {
				file.delete();
				logger.debug(filePath.get("file_name") + " Delete Files");
			}else {
				logger.debug(filePath.get("file_name") + " that do not exist");
			}
			
			fileMapper.fileDelete(param);
		}
	}

	
	public ArrayList<HashMap<String, Object>> fileList(HashMap<String, Object> paramMap){
		return fileMapper.fileList(paramMap);
	}
	
	public void fileDownload(HttpServletRequest request, HttpServletResponse response, HashMap<String, Object> paramMap) throws FileException, IOException{
		String userKey = String.valueOf(paramMap.get("userKey"));
		String encType = String.valueOf(paramMap.get("enc_type"));
		
		if(!(encType.equals("Y") || encType.equals("N"))) {
			throw new FileException(FileErrorCode.EncTypeNotDefined);
		} else if(!cbcComponent.isFilePBUserKey(userKey) && encType.equals("Y")) {
			throw new FileException(FileErrorCode.InvalidKey);
		}
		
		String uuid = String.valueOf(paramMap.get("uuid"));
		HashMap<String, Object> filePath = fileMapper.FilePath(uuid);
		
		File file = new File(String.valueOf(filePath.get("file_path")));
		if(file.exists() && file.isFile()) {
			BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
			BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream());
			
			byte[] data = new byte[bis.available()];
			bis.read(data);
			
			for(int i = 0; i < data.length; i++) {
				data[i] = (byte) data[i];
			}
			
			data = (encType.equals("Y")) ? cbcComponent.toFileDecryption(data) : data;
			
			fileDownloadResponse(response, request, data.length, String.valueOf(filePath.get("file_name")));
			
			bos.write(data);
			bos.flush();

			bis.close();
			bos.close();
		} else {
			logger.debug(filePath.get("file_name") + "File not found");
		}
	}
	
	private void fileDownloadResponse(HttpServletResponse response, HttpServletRequest request, int length, String fileName) throws UnsupportedEncodingException {
		response.setContentType("application/octet-stream; charset=utf-8");
		response.setContentLength(length);
		String browser = getBrowser(request);
		String disposition = getDisposition(fileName, browser);
		response.setHeader("Content-Disposition", disposition);
		response.setHeader("Content-Transfer-Encoding", "binary");
	}
	
	private String getBrowser(HttpServletRequest request) {
		String header = request.getHeader("User-Agent");
		if (header.indexOf("Chrome") > -1) {
			return "Chrome";
		}
		return "Chrome";
	}
	
	private String getDisposition(String filename, String browser) throws UnsupportedEncodingException {
		String dispositionPrefix = "attachment;filename=";
		String encodedFilename = null;
		if (browser.equals("Chrome")) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < filename.length(); i++) {
				char c = filename.charAt(i);
				if (c > '~') {
					sb.append(URLEncoder.encode("" + c, "UTF-8"));
				} else {
					sb.append(c);
				}
			}
			encodedFilename = sb.toString();
		}
		return dispositionPrefix + encodedFilename;
	}
	
	public void StringOutputStream(HttpServletResponse response, String param) throws IOException {
		BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream());
		byte[] bt = param.getBytes("UTF-8");
		bos.write(bt);
		bos.flush();
		bos.close();
	}
	
	public void fileDelete(HashMap<String, Object> paramMap) {
		ArrayList<HashMap<String, Object>> fileDelList = fileMapper.fileDelList(paramMap);
		
		for(HashMap<String, Object> fileMap : fileDelList) {
			String filePath = String.valueOf(fileMap.get("file_path"));
			File file = new File(filePath);
			
			if(file.exists()) {
				file.delete();
				logger.debug(fileMap.get("file_name") + " Delete Files");
			}else {
				logger.debug(fileMap.get("file_name") + " that do not exist");
			}
			
			String param = String.valueOf(fileMap.get("uuid"));
			fileMapper.fileDelete(param);
		}
	}
	
	public boolean isFile(HashMap<String, Object> paramMap) {
		return fileMapper.isFile(paramMap);
	}
}
