package egovframework.azon.cmmn.security;

import java.io.IOException;

import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import egovframework.azon.cmmn.component.CubiciUtils;

@Component
public class AuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler{

	Logger logger = LoggerFactory.getLogger(AuthSuccessHandler.class);
	
	private final int sessionTime = 60 * 60;//60 * 60; 
	
	@Autowired
	SecurityService securityService;
	
	@Autowired
	SecurityUtils securityUtils;
	
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException {
		request.getSession().setMaxInactiveInterval(sessionTime);
		
		HashMap<String, Object> securityUser =  CubiciUtils.ObjectToHashMap(authentication.getPrincipal());
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		JSONObject jObject = securityUtils.SecurityErrorCodeJsonParser("LoginSuccess");
		String cookieName = "";
		String cookieValue = "";
		
		String ip = CubiciUtils.getClientIp(request);
		securityUser.put("ip", ip);

		String division = String.valueOf(securityUser.get("division"));
		if(division.equals("user")) {
			cookieValue = String.valueOf(securityUser.get("user_id"));
			cookieName = "LID";
			
			UserSuccessHandlerlog(securityUser);
		}else if(division.equals("admin")) {
			String type = String.valueOf(securityUser.get("admin_type"));
			cookieValue = String.valueOf(securityUser.get("admin_id"));
			cookieName = type + "AID";
			
			resultMap.put("type", type);
			
			jObject = CubiciUtils.JObjectAddHashMap(jObject, resultMap);
			AdminSuccessHandlerlog(securityUser);
		}
		HttpSession session = request.getSession();
		session.setAttribute("division", division);
		CreateIdSaveCookie(response, securityUser, cookieName, cookieValue);
		
		securityUtils.ResponseJSONObject(response, jObject);
	}
	
	private void UserSuccessHandlerlog(HashMap<String, Object> params) {
		StringBuilder logBuilder = new StringBuilder();
		String[] paramKey = {"ip", "user_id", "username", "user_type", "user_code"};
		
		for(String key : paramKey) {
			String value = String.valueOf(params.get(key));
			logBuilder.append(key).append(" : ").append(value).append(" ");
		}
		logger.debug(logBuilder.toString());
	}
	
	private void AdminSuccessHandlerlog(HashMap<String, Object> params) {
		StringBuilder logBuilder = new StringBuilder();
		String[] paramKey = {"ip", "admin_id", "username", "admin_type", "admin_grade"};
		
		for(String key : paramKey) {
			String value = String.valueOf(params.get(key));
			logBuilder.append(key).append(" : ").append(value).append(" ");
		}
		logger.debug(logBuilder.toString());		
	}
	
	private void CreateIdSaveCookie(HttpServletResponse response, HashMap<String, Object> securityUser, String name, String value) {
		String idSave = String.valueOf(securityUser.get("idSave"));
		if(idSave.equals("true")) {
			CubiciUtils.setCookie(response, name, value, 60 * 60 * 24 * 7);
		}
	}
}
