package egovframework.azon.front.cubici.service;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.cubici.mapper.AdminCubiciMapper;
import egovframework.azon.admin.cubici.mapper.AdminUserSupportMapper;
import egovframework.azon.cmmn.component.CubiciApiComponent;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.component.MailComponent;
import egovframework.azon.cmmn.component.SMSComponent;
import egovframework.azon.cmmn.dto.SmsDto;
import egovframework.azon.cmmn.security.dto.AuthFilterDto;
import egovframework.azon.cmmn.security.dto.SecurityUser;
import egovframework.azon.front.cubici.mapper.CubiciCmmMapper;

@Service
public class CubiciCmmService {
	
	Logger logger = LoggerFactory.getLogger(CubiciCmmService.class);

	@Autowired
	CubiciCmmMapper cubiciCmmMapper;
	
	@Autowired
	MailComponent mailComponent; // 이메일 전송
	
	@Autowired
	SMSComponent smsComponent; // 문자 전송
	
	@Autowired
	AdminCubiciMapper adminCubiciMapper; // 지급 요청
	
	@Autowired
	CubiciApiComponent cubiciApiComponent;

	@Autowired
	AdminUserSupportMapper adminUserSupportMapper;
	
	// 쇼핑몰 리스트 (renewal)
	public HashMap<String, Object> selectShopInfo(HashMap<String, Object> param) {
		return cubiciCmmMapper.selectShopInfo(param);
	}

	public HashMap<String, Object> bizDay() {
		HashMap<String, Object> resultMap = new HashMap<>();

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.KOREA);
		SimpleDateFormat sdf2 = new SimpleDateFormat("yy/MM/dd HH:mm", Locale.KOREA);

		int diff = 1;

		// 내일
		Calendar tomorrow = Calendar.getInstance();
		tomorrow.add(Calendar.DATE, diff);
		String tomorrowStr = sdf.format(tomorrow.getTime());
		resultMap.put("dateStr", tomorrowStr);
		while(cubiciCmmMapper.isBizDay(resultMap).equals(true)) {
			tomorrow.add(Calendar.DATE, diff);
			diff += 1;
		}

		String resultStr = sdf2.format(tomorrow.getTime());

		resultMap.put("tomorrow", resultStr);

		return resultMap;
	}
	
	// 캘린더 기본 날짜 설정
	public HashMap<String, Object> calendarDefaultDate(String flag) {

		HashMap<String, Object> resultMap = new HashMap<>();

		// 이번달 시작일, 마지막일
		DecimalFormat df = new DecimalFormat("00");
		Calendar currentCalendar = Calendar.getInstance();
		String strYear = Integer.toString(currentCalendar.get(Calendar.YEAR));
		String strMonth = df.format(currentCalendar.get(Calendar.MONTH) + 1);
		String minMM = df.format(currentCalendar.getMinimum(Calendar.DATE));
		String maxMM = df.format(currentCalendar.getActualMaximum(Calendar.DAY_OF_MONTH));
		String monthStartDate = strYear + "-" + strMonth + "-" + minMM;
		String monthEndDate = strYear + "-" + strMonth + "-" + maxMM;

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

		// 저번달
		Calendar beforeMonth = Calendar.getInstance();
		// 이전달 동일 날짜
		beforeMonth.add(beforeMonth.MONTH, -1);
		beforeMonth.add(beforeMonth.DATE, -1);
		String beforeMonthDate = sdf.format(beforeMonth.getTime());
		int beforeMonthLastDay = beforeMonth.getActualMaximum(Calendar.DAY_OF_MONTH);
		// 이전달 1일
		beforeMonth.set(Calendar.DAY_OF_MONTH, 1);
		String beforeMonthFirst = sdf.format(beforeMonth.getTime());
		// 이전달 말일
		beforeMonth.set(Calendar.DAY_OF_MONTH, beforeMonthLastDay);
		String beforeMonthLast = sdf.format(beforeMonth.getTime());

		// 어제
		Calendar yesterday = Calendar.getInstance();
		yesterday.add(Calendar.DATE, -1);
		String yesterdayStr = sdf.format(yesterday.getTime());

		if (flag.equals("settlement")) { // 정산 입금은 1일 ~ 어제
			resultMap.put("fromDate", monthStartDate);
			resultMap.put("toDate", yesterdayStr);
		} else if (flag.equals("pre")) { // 정산 예정은 오늘 ~ 말일
			// 오늘
			Date today = new Date();
			String todayStr = sdf.format(today);

			resultMap.put("fromDate", todayStr);
			resultMap.put("toDate", monthEndDate);
		} else if (flag.equals("beforeMonth")) {
			resultMap.put("toDate", beforeMonthDate);
			resultMap.put("fromDate", beforeMonthFirst);
		} else if (flag.equals("cubiciDefault")) {
			if (yesterdayStr.equals(beforeMonthLast)) { // 어제가 마지막날이면 저번달 1일 ~ 말일
				resultMap.put("fromDate", beforeMonthFirst);
				resultMap.put("toDate", beforeMonthLast);
			} else {
				resultMap.put("fromDate", monthStartDate);
				resultMap.put("toDate", yesterdayStr);
			}
		}
		return resultMap;
	}

	// CBCI_ERR_REPORT
	public void insertErrorReport(HashMap<String, Object> params) {
		cubiciCmmMapper.insertErrorReport(params);
	}
	
	// CBCI_NOTICE_REPORT
	public void insertNoticeReport(HashMap<String, Object> params) {
		cubiciCmmMapper.insertNoticeReport(params);
	}
	
	// CBCI_ACCESS_RECORD
	public void insertAccessRecord(HashMap<String, Object> params) {
		cubiciCmmMapper.insertAccessRecord(params);
	}
	
	public HashMap<String, Object> BizOverlap(HashMap<String, Object> paramMap) throws Exception {
		String flag = String.valueOf(paramMap.get("flag"));
		String firmId = String.valueOf(paramMap.get("FIRM_ID"));
		
		HashMap<String, Object> resultMap = new HashMap<>();
		
		if (flag.equals("user")) {
			resultMap = cubiciCmmMapper.userBizOverlap(paramMap);
		}else if(flag.equals("partner")) {
			resultMap = cubiciCmmMapper.partnerBizOverlap(paramMap);
		}else {
			return resultMap;
		}
		
		resultMap.putAll(bizAuthCheck(firmId));
		
		return resultMap;
	}
	
	public HashMap<String, Object> bizAuthCheck(String param) throws Exception {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		ArrayList<String> bizNumList = new ArrayList<>();
		bizNumList.add(param);
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("b_no", bizNumList);
		
		JSONObject json = new JSONObject(map);

		resultMap.put("bizNumAuth", cubiciApiComponent.bizNumAuth(json.toString()));
		
		return resultMap;
	}
	
	/* 2021 10 19 PHJ */
	/* 사업자유형, 업종, 쇼핑몰, 협력사 selectbox data */
    // 사업자유형 
	public HashMap<Integer, String> selectBizType() throws Exception{     
        
		ArrayList<HashMap<String, Object>> bizTypeList = cubiciCmmMapper.selectBizType();
		HashMap<Integer, String> bizTypeMap = new HashMap<Integer, String>();
		for(int i =0;i<bizTypeList.size(); i++) {
			bizTypeMap.put(Integer.parseInt(String.valueOf(bizTypeList.get(i).get("TYPE_NO"))),String.valueOf(bizTypeList.get(i).get("TYPE_NAME")));
		}
		return bizTypeMap;
	}
	// 업종
	public HashMap<Integer, String> selectSector() throws Exception{
		HashMap<Integer, String> sectorMap = new HashMap<Integer, String>();
		ArrayList<HashMap<String, Object>> sectorList = cubiciCmmMapper.selectSector();
		for(int i =0;i<sectorList.size(); i++) {
			sectorMap.put(Integer.parseInt(String.valueOf(sectorList.get(i).get("SEC_NO"))),String.valueOf(sectorList.get(i).get("SEC_NAME")));
		}
		return sectorMap;
	}
	// 쇼핑몰
	public HashMap<Integer, String> selectShop() throws Exception{
		HashMap<Integer, String> shopMap = new HashMap<Integer, String>();
		ArrayList<HashMap<String, Object>> shopList = cubiciCmmMapper.selectShop();
		for(int i =0;i<shopList.size(); i++) {
			shopMap.put(Integer.parseInt(String.valueOf(shopList.get(i).get("CODE_ID"))),String.valueOf(shopList.get(i).get("CODE_NM")));
		}		
		return shopMap;
	}
	// 협력사
	public HashMap<String, String> selectPartner(){
		HashMap<String, String> partnerMap = new HashMap<String, String>();
		ArrayList<HashMap<String, Object>> partnerList = cubiciCmmMapper.selectPartner();
		for(int i=0;i<partnerList.size(); i++) {
			partnerMap.put(String.valueOf(partnerList.get(i).get("FIRM_NO")),String.valueOf(partnerList.get(i).get("FIRM_NM")));
		}
		return partnerMap;
	}
	
	public String sendSms(HashMap<String, Object> paramMap, String[] sms) {
		paramMap.put("SMS_KEY", "00");
		
		HashMap<String, Object> smsMap = cubiciCmmMapper.findSmsTemplate(paramMap);
		String toUser = String.valueOf(paramMap.get("USER_PHONE"));
		String subject = String.valueOf(smsMap.get("SMS_TITLE"));
		String content = String.valueOf(smsMap.get("SMS_CONTENT"));
		
		content = replaceContent(paramMap, sms, content);
		
		String sSend = smsComponent.send(toUser, subject, content);

		logger.debug("[ SMS RESULT ] : " + sSend);

		return sSend;
	}
	
	public boolean sendMail(HashMap<String, Object> paramMap, String[] mail) {
		paramMap.put("SMS_KEY", "01");
		
		HashMap<String, Object> mailMap = cubiciCmmMapper.findSmsTemplate(paramMap);
		String toUser = String.valueOf(paramMap.get("toUser"));
		String subject = String.valueOf(mailMap.get("SMS_TITLE"));
		String content = String.valueOf(mailMap.get("SMS_CONTENT"));
		
		content = replaceContent(paramMap, mail, content);
		
		boolean isSend = mailComponent.send(toUser ,subject, content);
		
		return isSend;
	}
	
	public String replaceContent(HashMap<String, Object> paramMap, String[] arr, String content) {
		for(String str : arr) {
			content = content.replace("{"+ str +"}", String.valueOf(paramMap.get(str)));
		}
		return content;
	}
	
	// EXCEL 파일 생성 & export FUNC
	public void excelExport(Map<String, Object> params, HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		// 로컬 & 파일명
		Locale locale = Locale.KOREA;
		String workbookName = (String) params.get("workbookName");

		// 겹치는 파일 이름 중복을 피하기 위해 시간을 이용해서 파일 이름에 추가
		Date date = new Date();
		SimpleDateFormat dayformat = new SimpleDateFormat("yyyyMMdd", locale);
		SimpleDateFormat hourformat = new SimpleDateFormat("hhmmss", locale);
		String day = dayformat.format(date);
		String hour = hourformat.format(date);
		String fileName = workbookName + "_" + day + "_" + hour + ".xlsx";

		// 여기서부터는 각 브라우저에 따른 파일이름 인코딩작업
		String browser = request.getHeader("User-Agent");
		if (browser.indexOf("MSIE") > -1) {
			fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.indexOf("Trident") > -1) { // IE11
			fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.indexOf("Firefox") > -1) {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.indexOf("Opera") > -1) {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.indexOf("Chrome") > -1) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < fileName.length(); i++) {
				char c = fileName.charAt(i);
				if (c > '~') {
					sb.append(URLEncoder.encode("" + c, "UTF-8"));
				} else {
					sb.append(c);
				}
			}
			fileName = sb.toString();
		} else if (browser.indexOf("Safari") > -1) {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		} else {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		}

		response.setContentType("application/download;charset=utf-8");
		response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\";");
		response.setHeader("Content-Transfer-Encoding", "binary");
		
		OutputStream os = null;
		SXSSFWorkbook workbook = null;
		
		try {
			workbook = (SXSSFWorkbook) params.get("workbook");

			os = response.getOutputStream();
			// 파일생성
			workbook.write(os);
		} catch (Exception e) {
			logger.error(e.getMessage());
		} finally {
			if (workbook != null) {
				try {
					workbook.close();
				} catch (Exception e) {
					logger.error(e.getMessage());
				}
			}
			if (os != null) {
				try {
					os.close();
				} catch (Exception e) {
					logger.error(e.getMessage());
				}
			}
		}
	}
	/* ********** Excel worksheets 끝 ********** */

	// Select LogData
	public ArrayList<HashMap<String, Object>> selectErrorLogData(HashMap<String, Object> paramsMap) {
		return cubiciCmmMapper.errorData(paramsMap);
	}
	
	// Select linked wholesalers
	public HashMap<String, Object> selectWholesalers() {
		return cubiciCmmMapper.selectLinkedWholesale();
	}
	
	// Select bar List
	public ArrayList<HashMap<String, Object>> selectCodeList(String string) {
		return cubiciCmmMapper.selectCodeList(string);
	}
	
	public String AdminMoneyBankTypeName() {
		//DB미구현
		/*
		HashMap<String, Object> principal = CubiciUtils.AdminAuthentication();
		String adminType = String.valueOf(principal.get("admin_type"));
		return cubiciCmmMapper.AdminMoneyBankTypeName(adminType);
		*/
		HashMap<String, Object> principal = CubiciUtils.AdminAuthentication();
		String adminType = String.valueOf(principal.get("admin_type"));
		String result = "";
		
		if(adminType.equals("00")) {
			result = "cubici";
		}else if(adminType.equals("01")) {
			result = "together";
		}else if(adminType.equals("02")) {
			result = "hellopay";
		}
		
		return result;
	}
	
	@Autowired
	AuthenticationManager authenticationManager;
	
	public void UserSessionTypeChange(String usertype) {
		SecurityUser securityUser = (SecurityUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		String userCode = securityUser.getUser_code();
		
		HashMap<String, Object> userSessionTypePw = cubiciCmmMapper.UserSessionTypePw(userCode);
		String dbUserType = String.valueOf(userSessionTypePw.get("user_type"));
		String password = String.valueOf(userSessionTypePw.get("user_pw"));
		
		AuthFilterDto authFilterDto = new AuthFilterDto(securityUser.getIdSave(), securityUser.getUser_id(), securityUser.getDivision(), usertype);
		
		if (usertype.equals(dbUserType)) {
			Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authFilterDto, password));
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}
	}
	
	public ArrayList<HashMap<String, Object>> authSelectBox(String param){
		return cubiciCmmMapper.authSelectBox(param);
	}
	
	public ArrayList<HashMap<String, Object>> chargeSelectBox(){
		return cubiciCmmMapper.chargeSelectBox();
	}
	
	public ArrayList<HashMap<String, Object>> useShop(String param){
		return cubiciCmmMapper.isUseShop(param);
	}
	
	public HashMap<String, Object> inUserShop(String param){
		HashMap<String, Object> resultMap = new HashMap<>();
		ArrayList<HashMap<String, Object>> valueArr = cubiciCmmMapper.inUserShop(param);

		for(HashMap<String, Object> map : valueArr){
			String shopType = String.valueOf(map.get("shop_type"));
			String shopId = String.valueOf(map.get("shop_id"));
			shopId = (shopId.equals("null")) ? "''" : "'" + shopId + "'";
			resultMap.put(shopType, shopId);
		}
		
		return resultMap;
	}
	
	public ArrayList<HashMap<String, Object>> modalId(String param) {
		ArrayList<HashMap<String, Object>> paramMap = new ArrayList<HashMap<String, Object>>();
		HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
		String userCode = String.valueOf(principal.get("user_code"));
		String userType = String.valueOf(principal.get("user_type"));
		
		if(userCode.equals("null")) {
			return paramMap;
		}
		
		if(userType.equals("97") && param.equals("main")) {
			paramMap.add(rejoinBenefit(principal));
		}else if(param.equals("main")) {
			paramMap.add(cubiciCmmMapper.freePeriodEnd(userCode));
			paramMap.add(cubiciCmmMapper.periodEnd(userCode));
		}else if(param.equals("mb")) {
			paramMap.add(cubiciCmmMapper.MBPeriodEnd(userCode));
		}
		
		return paramMap;
	}
	
	private HashMap<String, Object> rejoinBenefit(HashMap<String, Object> paramMap){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("userName", String.valueOf(paramMap.get("username")));
		resultMap.put("modalId", "rejoinBenefit");
		
		return resultMap;
	}
	
	public String findUserPhone(String param) {
		return cubiciCmmMapper.findUserPhone(param);
	}
	
	public HashMap<String, Object> findSmsTemplate(HashMap<String, Object> paramMap){
		return cubiciCmmMapper.findSmsTemplate(paramMap);
	}
	
	public ArrayList<HashMap<String, Object>> getBankInfo(){
		return cubiciCmmMapper.getBankInfo();
	}
}