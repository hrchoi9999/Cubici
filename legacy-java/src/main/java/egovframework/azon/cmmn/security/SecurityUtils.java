package egovframework.azon.cmmn.security;

import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import egovframework.azon.admin.moneybank.operation.service.MbStatus;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.component.MoneybankUtils;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.errorCode.SecurityErrorCode;
import egovframework.azon.cmmn.exception.MoneyBankException;

@Component
class SecurityUtils {
	Logger logger = LoggerFactory.getLogger(SecurityUtils.class);
	
	JSONObject SecurityErrorCodeJsonParser(String ErrorMsg) {
		JSONParser parser = new JSONParser();
		JSONObject jObject = new JSONObject();
		try {
			String ErrorCode = SecurityErrorCode.valueOf(ErrorMsg).JsonString();
			jObject = (JSONObject) parser.parse(ErrorCode);
		} catch(Exception e) {
			logger.error(e.getMessage());
		}
		return jObject;
	}
	
	void ResponseJSONObject(HttpServletResponse response, JSONObject jObject) {
		try {
			response.setCharacterEncoding("utf-8");
			response.setContentType("text/html; charset=UTF-8");
			  
			PrintWriter out = response.getWriter();
			  
			out.print(jObject); 
			out.close();
		}catch(Exception e) {
			logger.error(e.getMessage());
		}
	}
	
	void AjaxDeniedResponse(HttpServletResponse response, String Uri) {
		HashMap<String, Object> paramMap = new HashMap<>();
		paramMap.put("resultCode", 57); // 추후 삭제요망
		paramMap.put("Uri", Uri);
		
		JSONObject jObject = new JSONObject(paramMap);
		ResponseJSONObject(response, jObject);
	}
	
	String EntryPointSendRedirectUri(HttpServletRequest request) {
		String uriCheck = UriCheck(request);
		String Uri = "";
		
		Uri = setSendRedirectUriByUriCheck(uriCheck);
		
		return Uri;
	}
	
	String DeniedSendRedirectUri(HttpServletRequest request) {
		String uriCheck = UriCheck(request);
		String Uri = "";
		
		if (uriCheck.equals("moneybank") ) {
			Uri = String.valueOf(MBDenidParamByUserStatus().get("uri"));
		} else if (uriCheck.equals("cubici") ) {
			Uri = "/";
		} else {
			Uri = "denied";
		}
	
		return Uri;
	}
	
	HashMap<String, Object> DeniedModalType(HttpServletRequest request) {
		String uriCheck = UriCheck(request);
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String value = "";
		
		if (uriCheck.equals("moneybank") ) {
			value = String.valueOf(MBDenidParamByUserStatus().get("value"));
		} else if (uriCheck.equals("cubici") ) {
			value = "serviceForbidden";
		} 
		
		resultMap.put("Type", value);
		
		return resultMap;
	}
	
	private String UriCheck(HttpServletRequest request) {
		String[] uriArray = request.getRequestURI().split("/");
		String uriCheck = (uriArray[1].equals("m")) ? uriArray[2] : uriArray[1];
		
		if(uriCheck.equals("admin") && uriArray[2].equals("moneybank")) {
			uriCheck = uriCheck + uriArray[3];
		}
		
		return uriCheck;
	}
	
	String LogoutSendRedirectUri(HttpServletRequest request) throws MalformedURLException {
		String headerUri = request.getHeader("referer");
		String uriCheck = "";
		String Uri = "";
		
		if(!CubiciUtils.StringEmpty(headerUri)) {
			URL url = new URL(request.getHeader("referer"));
			String[] uriArray = url.getPath().split("/");
			
			if(uriArray.length == 0) {
				uriCheck = "cubici";
			}else {
				uriCheck = (uriArray[1].equals("m")) ? uriArray[2] : uriArray[1];
			}
			
			if(uriCheck.equals("admin") && uriArray[2].equals("moneybank")) {
				uriCheck = uriCheck + uriArray[3];
			}
			
			Uri = setSendRedirectUriByUriCheck(uriCheck);
		}
		return Uri;
	}
	
	private HashMap<String,Object> MBDenidParamByUserStatus() {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String uri = "";
		String value = "";
		
		HashMap<String, Object> userMap = CubiciUtils.UserAuthentication();
		String userType = String.valueOf(userMap.get("user_type"));
		
		if (MoneybankUtils.isSessionContainsAuth("ROLE_MB_EVALUATE") || MoneybankUtils.isSessionContainsAuth("ROLE_MB_CONTRACT") || MoneybankUtils.isSessionContainsAuth("ROLE_MB_REQUEST")) { //계약진행중
			uri = "/moneybank/intro/advpay";
			value = "mbProgress";
		} else if(MoneybankUtils.isSessionContainsAuth("ROLE_MB_ADVANCE")) { //진행중계약없음
			uri = "/moneybank/advcalc/request";
		} else if(MoneybankUtils.isSessionContainsAuth("ROLE_USER_MB")) { //머뱅현황으로
			uri = "/moneybank/current";
		} else if (MoneybankUtils.isSessionContainsAuth("ROLE_MB_ERROR")) { //상태값 이상
			uri = "/moneybank/intro/advpay";
			value = "error";
		} else if(userType.equals("97")) {
			uri = "/cubici/mypage/myCharge";
			value = "rejoinBenefit";			
		} else {
			uri = "/moneybank/intro/advpay";
			value = "mbSignUp";
		}
		
		resultMap.put("uri", uri);
		resultMap.put("value", value);
		
		return resultMap;
	}
	
	private String setSendRedirectUriByUriCheck(String uriCheck) {
		String Uri = "";
		if (uriCheck.equals("admin") || uriCheck.equals("admincubici")) {
			Uri = "/admin/cubici/signIn";
		} else if (uriCheck.equals("cubici") || uriCheck.equals("board") || uriCheck.equals("moneybank")) {
			Uri = "/login";
		} else if (uriCheck.equals("adminFI32") || uriCheck.equals("adminhellopay")) {
			Uri = "/admin/hellopay/signIn";
		} else if (uriCheck.equals("adminFI33") ) {
			Uri = "/admin/together/signIn";
		}
		return Uri;
	}	

	public static String setAuthByUserStatus(HashMap<String, Object> params) {
		String mbStatus = String.valueOf(params.get("mb_status")).equals("-") ? "99" : String.valueOf(params.get("mb_status"));
		String userType = String.valueOf(params.get("type"));
		String changeAuth = MbStatus.findByMbStatus(mbStatus).getAuth();

		if (userType.equals("00")) {
			changeAuth = "ROLE_USER_ADMIN";
		} else if(userType.equals("01") && changeAuth.equals("ROLE_USER_MB")) {
			changeAuth = "ROLE_MB_ERROR";
		} else if(userType.equals("02") && !changeAuth.equals("ROLE_USER_MB")){
			changeAuth = "ROLE_MB_ERROR";
		}

		return changeAuth;
	}
}
