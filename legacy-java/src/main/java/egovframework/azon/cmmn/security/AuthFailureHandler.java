package egovframework.azon.cmmn.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

@Component
public class AuthFailureHandler implements AuthenticationFailureHandler {

	Logger logger = LoggerFactory.getLogger(AuthFailureHandler.class);

	@Autowired
	SecurityService securityService;
	
	@Autowired
	SecurityUtils securityUtils;

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, ServletException {
		String exceptionMsg = exception.getMessage();
		
		JSONObject jObject = securityUtils.SecurityErrorCodeJsonParser(exceptionMsg);	  
			
		if(jObject.size() == 0) {
			jObject = securityUtils.SecurityErrorCodeJsonParser("SecurityParseError");
		}
		
		logger.debug(jObject.toString());
		
		securityUtils.ResponseJSONObject(response, jObject);
	}
}
