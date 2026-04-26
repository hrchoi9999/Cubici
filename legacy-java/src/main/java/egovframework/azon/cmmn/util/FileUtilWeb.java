package egovframework.azon.cmmn.util;

import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@Component
public class FileUtilWeb {
	private static final Logger logger = LoggerFactory.getLogger(FileUtilWeb.class);
	
	Properties prop;
	String localImagePath;
	
	// 파일업로드
	public List<HashMap<String, Object>>  getFileUpload(HashMap<String, Object> map, HttpServletRequest request) throws Exception  {
		prop = new Properties();
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream is = classLoader.getResourceAsStream("egovframework/globals.properties");
		try {		
			prop.load(is);
		}catch(Exception e) {
			logger.error(e.getMessage());
		}
		this.localImagePath = prop.getProperty("FILE_ROOT_PATH");
		
		String userNo = String.valueOf(map.get("userNo"));
		String userNum = String.format("%07d", Integer.parseInt(userNo));
		
		final String filePath = localImagePath+userNum+"/";
		
		MultipartHttpServletRequest multipartHttpServletRequest = (MultipartHttpServletRequest) request;
		Iterator<String> iterator = multipartHttpServletRequest.getFileNames();
		
		MultipartFile multipartFile = null;
		String itemName = null;
		String originalFileName = null;
		String originalFileExtension = null;
		String storedFileName = null;
		
		List<HashMap<String, Object>> list = new ArrayList<HashMap<String, Object>>();
		HashMap<String, Object> listMap = null;

		
		File file = new File(filePath);
		if(file.exists() == false) {
			file.mkdirs();			
		}
		
		Date ct = new Date();
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmm", Locale.getDefault());
		String curDate = dateFormat.format(ct);
		
		while(iterator.hasNext()) {
			multipartFile = multipartHttpServletRequest.getFile(iterator.next());
			if(multipartFile.isEmpty() == false) {
				originalFileName = multipartFile.getOriginalFilename();
				
				itemName = multipartFile.getName();
				originalFileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
				String GUBUN = new String();
				
				if (logger.isDebugEnabled()) {
		    		logger.debug("itemName--->> "+itemName);
		    		logger.debug("originalFileName--->> "+originalFileName);
		    		logger.debug("originalFileExtension--->> "+originalFileExtension);
				}				
				
				if("saubjadeungrokj".equals(itemName)) {
					storedFileName = "saubjadeungrokj"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "saubjadeungrokj"; // 사업자등록증
				}
				if("daepyojasinbunj".equals(itemName)) {					
					storedFileName = "daepyojasinbunj"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "daepyojasinbunj"; // 대표자 신분증
				}
				if("bubindeunggibu".equals(itemName)) {
					storedFileName = "bubindeunggibu"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "bubindeunggibu"; // 법인등기부 등록증
				}		
				
				file = new File(filePath + storedFileName);
				if(file.exists()) {  // delete temp file
					file.delete();
				}		
				
				multipartFile.transferTo(file);
				
				listMap = new HashMap<String, Object>();
				listMap.put("ITEM_NAME", itemName);
				listMap.put("ORIGINAL_FILE_NAME", originalFileName);
				listMap.put("STORED_FILE_NAME", storedFileName);
				listMap.put("FILE_PATH_NAME", userNum);
				listMap.put("GUBUN", GUBUN);
				listMap.put("FILE_SIZE", multipartFile.getSize());
				list.add(listMap);
			}
		}
		return list;
	}

	// 파일 다운로드
	public void  getFileDownload(HashMap<String, Object> hm, HttpServletResponse response) throws Exception  {
		
		prop = new Properties();
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream is = classLoader.getResourceAsStream("egovframework/globals.properties");
		try {		
			prop.load(is);
		}catch(Exception e) {
			logger.error(e.getMessage());
		}
		this.localImagePath = prop.getProperty("FILE_ROOT_PATH");		
		
		String filename = String.valueOf(hm.get("DOC_FILE")).trim();
		StringBuffer sb = new StringBuffer();
		sb.append(localImagePath);
		sb.append("doc");
		sb.append("/");
		sb.append(filename);	
		
		
		System.out.println("hm--->> "+hm);
		System.out.println("response--->> "+response);
		System.out.println("sb.toString()--->> "+sb.toString());
		
		// URL to File
	//	URL url = new URL(sb.toString()+"?time="+System.currentTimeMillis());
//		URL url = new URL(sb.toString());
		URL url = new URL("http://175.196.88.178:8080/files/lawBizDoc.zip");
		String tDir = System.getProperty("java.io.tmpdir");
		String path = tDir + "tmp" + ".zip";
		File file = new File(path);
		file.deleteOnExit();
		FileUtils.copyURLToFile(url, file);
		byte fileByte[] = FileUtils.readFileToByteArray(file);				
		response.setContentType("application/octet-stream");
		response.setContentLength(fileByte.length);
		response.setHeader("Content-Disposition", "attachment; fileName=\"" +URLEncoder.encode(filename, "UTF-8") +"\";"); 
		response.setHeader("Content-Transfer-Encoding", "binary");
		response.getOutputStream().write(fileByte);
		response.getOutputStream().flush();
		response.getOutputStream().close();	
	}


}
