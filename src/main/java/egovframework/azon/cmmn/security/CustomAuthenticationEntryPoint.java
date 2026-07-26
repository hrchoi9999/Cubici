package egovframework.azon.cmmn.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint{
	
	Logger logger = LoggerFactory.getLogger(CustomAuthenticationEntryPoint.class);
	
	@Autowired
	SecurityUtils securityUtils;
	
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {
		String Uri = securityUtils.EntryPointSendRedirectUri(request);
		String isAjaxHeader = String.valueOf(request.getHeader("AJAX"));
		
		if(isAjaxHeader.equals("true")) {
			securityUtils.AjaxDeniedResponse(response, Uri);
		}else {
			response.sendRedirect(Uri);
		}
	}
}
