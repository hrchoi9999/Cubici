package egovframework.azon.cmmn.security;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import egovframework.azon.cmmn.component.CubiciUtils;

@Component
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler{

	@Autowired
	SecurityUtils securityUtils;
	
	@Override
	public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException {
		
		String uri = securityUtils.LogoutSendRedirectUri(request);
		if(CubiciUtils.StringEmpty(uri)) {
			uri = LogoutSendRedirectUri(authentication);
		}
		
		if(authentication != null) {
			request.getSession().invalidate();
		}
		
		response.setStatus(HttpServletResponse.SC_OK);
		response.sendRedirect(uri);
	}
	
	private String LogoutSendRedirectUri(Authentication authentication) {
		HashMap<String, Object> securityUser =  CubiciUtils.ObjectToHashMap(authentication.getPrincipal());
		String division = String.valueOf(securityUser.get("division"));
		String Uri = "";
		if(division.equals("user")) {
			Uri = "/";
		}else if(division.equals("admin")) {
			String adminType = String.valueOf(securityUser.get("admin_type"));
			if(adminType.equals("00")) {
				Uri = "/admin/cubici/signIn";
			}else if(adminType.equals("01")) {
				Uri = "/admin/together/signIn";
			}else if(adminType.equals("02")) {
				Uri = "/admin/hellopay/signIn";
			}
		}
		return Uri;
	}
}
