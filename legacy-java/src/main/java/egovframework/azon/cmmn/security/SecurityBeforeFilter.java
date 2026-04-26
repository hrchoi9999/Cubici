package egovframework.azon.cmmn.security;

import java.io.IOException;
import java.util.Arrays;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;


@Component
public class SecurityBeforeFilter extends GenericFilterBean {

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		String uri = ((HttpServletRequest)request).getRequestURI();
		String division = String.valueOf(((HttpServletRequest) request).getSession().getAttribute("division")); 
		
		if(!division.equals("null")) {
			String[] uriArray = uri.split("/");
			String uriCheck = (uriArray.length == 0) ? "main" : uriArray[1];
			if(uriCheck.equals("admin") && division.equals("user")) {
				((HttpServletRequest) request).getSession().invalidate();
			} else if(!uriCheck.equals("admin") && division.equals("admin")) {
				AdminSessionCondition(uriCheck, request);
			}
		}
		
		chain.doFilter(request, response);
	}
	
	private void AdminSessionCondition(String param, ServletRequest request) {
		String[] exceptionUri = {"selectBoxList", "checkBizOverlap", "401", "logout", "addrSearch", "file"};
		boolean findUri = Arrays.stream(exceptionUri).anyMatch(value -> value.equals(param));
		
		if(!findUri) {
			((HttpServletRequest) request).getSession().invalidate();
		}
		
	}
}
