package egovframework.azon.cmmn.util;

import java.io.File;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@Component
public class FileUtilReceipt {
	private static final Logger logger = LoggerFactory.getLogger(FileUtilReceipt.class);
	
	Properties prop;
	String localImagePath;
	
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
		
		String userNo = String.valueOf(map.get("user_no"));
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
				int SHOP_TYPE = 0;
				
				if (logger.isDebugEnabled()) {
		    		logger.debug("itemName--->> "+itemName);
		    		logger.debug("originalFileName--->> "+originalFileName);
		    		logger.debug("originalFileExtension--->> "+originalFileExtension);
				}				
				
				if("daepyoingam".equals(itemName)) {
					storedFileName = "daepyoingam"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "daepyoingam"; // 대표인감증명원본
					SHOP_TYPE = 0; // 무의미한값
				}
				if("daepyojumindeungrok_gaein".equals(itemName)) {					
					storedFileName = "daepyojumindeungrok_gaein"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "daepyojumindeungrok_gaein"; // 대표주민등록등본원본
					SHOP_TYPE = 0;
				}
				if("bubiningam".equals(itemName)) {
					storedFileName = "bubiningam"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "bubiningam"; // 법인인감증명원본
					SHOP_TYPE = 0;
				}
				if("daepyojumindeungrok".equals(itemName)) {
					storedFileName = "daepyojumindeungrok"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "daepyojumindeungrok"; // 대표주민등록등본원본
					SHOP_TYPE = 0;
				}
				if("bubindeunggibu".equals(itemName)) {
					storedFileName = "bubindeunggibu"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "bubindeunggibu"; // 법인등기부등록원본
					SHOP_TYPE = 0;
				}
				if("isahwoi".equals(itemName)) {
					storedFileName = "isahwoi"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "isahwoi"; // 이사회 회의록
					SHOP_TYPE = 0;
				}
				if("sunjungsan".equals(itemName)) {
					storedFileName = "sunjungsan"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "sunjungsan"; // 선정산신청서
					SHOP_TYPE = 0;
				}
				if("gaeinjungbojohoi".equals(itemName)) {
					storedFileName = "gaeinjungbojohoi"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "gaeinjungbojohoi"; // 개인정보조회동의서
					SHOP_TYPE = 0;
				}
				if("chaemujaihaeng".equals(itemName)) {
					storedFileName = "chaemujaihaeng"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaemujaihaeng"; // 대표자채무이행확인서
					SHOP_TYPE = 0;
				}
				if("guksewannab".equals(itemName)) {
					storedFileName = "guksewannab"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "guksewannab"; // 국세완납증명서
					SHOP_TYPE = 0;
				}
				if("jibangsewannab".equals(itemName)) {
					storedFileName = "jibangsewannab"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "jibangsewannab"; // 지방세완납증명서
					SHOP_TYPE = 0;
				}
				if("gongranbochung".equals(itemName)) {
					storedFileName = "gongranbochung"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "gongranbochung"; // 공란보충용위임장
					SHOP_TYPE = 0;
				}
				if("juguraetongjang".equals(itemName)) {
					storedFileName = "juguraetongjang"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "juguraetongjang"; // 주거래통장(입금용)
					SHOP_TYPE = 0;
				}
				
				if("yegeumguraetongjang1".equals(itemName)) {
					storedFileName = "yegeumguraetongjang1"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "yegeumguraetongjang1"; // 예금거래통장(농협)
					SHOP_TYPE = 0;
				}
				if("yegeumguraetongjang2".equals(itemName)) {
					storedFileName = "yegeumguraetongjang2"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "yegeumguraetongjang2"; // 예금거래통장(추가)
					SHOP_TYPE = 0;
				}
				if("chaegwonyangdoyangsu1".equals(itemName)) {
					storedFileName = "chaegwonyangdoyangsu1"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdoyangsu1"; // 채권양도양수계약서(interpark)
					SHOP_TYPE = 1;
				}
				if("panmaedaegeumjigubboryu1".equals(itemName)) {
					storedFileName = "panmaedaegeumjigubboryu1"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "panmaedaegeumjigubboryu1"; // 팬매대금지급보류신청서(interpark)
					SHOP_TYPE = 1;
				}
				if("chaegwonyangdo1".equals(itemName)) {
					storedFileName = "chaegwonyangdo1"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdo1"; // 채권양도통지서(interpark)
					SHOP_TYPE = 1;
				}
				
				if("chaegwonyangdoyangsu2".equals(itemName)) {
					storedFileName = "chaegwonyangdoyangsu2"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdoyangsu2"; // 채권양도양수계약서(gmarket)
					SHOP_TYPE = 2;
				}
				if("panmaedaegeumjigubboryu2".equals(itemName)) {
					storedFileName = "panmaedaegeumjigubboryu2"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "panmaedaegeumjigubboryu2"; // 팬매대금지급보류신청서(gmarket)
					SHOP_TYPE = 2;
				}
				if("chaegwonyangdo2".equals(itemName)) {
					storedFileName = "chaegwonyangdo2"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdo2"; // 채권양도통지서(gmarket)
					SHOP_TYPE = 2;
				}
				if("chaegwonyangdoyangsu3".equals(itemName)) {
					storedFileName = "chaegwonyangdoyangsu3"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdoyangsu3"; // 채권양도양수계약서(auction)
					SHOP_TYPE = 3;
				}
				if("panmaedaegeumjigubboryu3".equals(itemName)) {
					storedFileName = "panmaedaegeumjigubboryu3"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "panmaedaegeumjigubboryu3"; // 팬매대금지급보류신청서(auction)
					SHOP_TYPE = 3;
				}
				if("chaegwonyangdo3".equals(itemName)) {
					storedFileName = "chaegwonyangdo3"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdo3"; // 채권양도통지서(auction)
					SHOP_TYPE = 3;
				}				
				if("chaegwonyangdoyangsu4".equals(itemName)) {
					storedFileName = "chaegwonyangdoyangsu4"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdoyangsu4"; // 채권양도양수계약서(11st)
					SHOP_TYPE = 4;
				}
				if("panmaedaegeumjigubboryu4".equals(itemName)) {
					storedFileName = "panmaedaegeumjigubboryu4"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "panmaedaegeumjigubboryu4"; // 팬매대금지급보류신청서(11st)
					SHOP_TYPE = 4;
				}
				if("chaegwonyangdo4".equals(itemName)) {
					storedFileName = "chaegwonyangdo4"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdo4"; // 채권양도통지서(11st)
					SHOP_TYPE = 4;
				}
				if("chaegwonyangdoyangsu11".equals(itemName)) {
					storedFileName = "chaegwonyangdoyangsu11"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdoyangsu11"; // 채권양도양수계약서(naver)
					SHOP_TYPE = 11;
				}
				if("panmaedaegeumjigubboryu11".equals(itemName)) {
					storedFileName = "panmaedaegeumjigubboryu11"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "panmaedaegeumjigubboryu11"; // 팬매대금지급보류신청서(naver)
					SHOP_TYPE = 11;
				}
				if("chaegwonyangdo11".equals(itemName)) {
					storedFileName = "chaegwonyangdo11"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdo11"; // 채권양도통지서(naver)
					SHOP_TYPE = 11;
				}
				if("chaegwonyangdoyangsu14".equals(itemName)) {
					storedFileName = "chaegwonyangdoyangsu14"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdoyangsu14"; // 채권양도양수계약서(naver)
					SHOP_TYPE = 14;
				}
				if("panmaedaegeumjigubboryu14".equals(itemName)) {
					storedFileName = "panmaedaegeumjigubboryu14"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "panmaedaegeumjigubboryu14"; // 팬매대금지급보류신청서(naver)
					SHOP_TYPE = 14;
				}
				if("chaegwonyangdo14".equals(itemName)) {
					storedFileName = "chaegwonyangdo14"+"_"+userNo+"_"+curDate+originalFileExtension;
					GUBUN = "chaegwonyangdo14"; // 채권양도통지서(naver)
					SHOP_TYPE = 14;
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
				listMap.put("SHOP_TYPE", SHOP_TYPE);
				listMap.put("FILE_SIZE", multipartFile.getSize());
				list.add(listMap);
			}
		}
		return list;
	}

}
