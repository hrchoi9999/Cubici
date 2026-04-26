package egovframework.azon.cmmn.security;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map.Entry;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomDeniedHandler implements AccessDeniedHandler{
	
	Logger logger = LoggerFactory.getLogger(CustomDeniedHandler.class);
	
	@Autowired
	SecurityUtils securityUtils;
	
	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException, ServletException {
		String Uri = securityUtils.DeniedSendRedirectUri(request);
		String isAjaxHeader = String.valueOf(request.getHeader("AJAX"));
		
		Uri = (Uri.equals("denied")) ? "/401" : ModalTypeUri(request, Uri);
		
		if(isAjaxHeader.equals("true")) {
			securityUtils.AjaxDeniedResponse(response, Uri);
		}else {
			response.sendRedirect(Uri);
		}
	}
	
	private String ModalTypeUri(HttpServletRequest request, String param) {
		HashMap<String, Object> paramMap = securityUtils.DeniedModalType(request);
		
		String key = "";
		String value = "";
		
		for(Entry<String, Object> entry : paramMap.entrySet()) {
			key = entry.getKey();
			value = entry.getValue().toString();
		}
		
		return param + "?" + key + "=" + value;
	}
	

}
