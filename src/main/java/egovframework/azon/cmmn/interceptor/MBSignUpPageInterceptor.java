package egovframework.azon.cmmn.interceptor;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.FlashMap;
import org.springframework.web.servlet.FlashMapManager;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;
import org.springframework.web.servlet.support.RequestContextUtils;

import egovframework.azon.cmmn.component.CubiciComponent;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.component.MoneybankUtils;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.MoneyBankException;

public class MBSignUpPageInterceptor extends HandlerInterceptorAdapter {
	
	@Autowired
	CubiciComponent cubiciComponent;
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
		try {
			if(request.getMethod().equals("GET") && !principal.isEmpty()) {
				if(MoneybankUtils.isSessionContainsAuth("ROLE_USER_MB")) {
					throw new MoneyBankException(MoneyBankErrorCode.MoneyBankServiceOverlap);
				}
			} else {
				throw new MoneyBankException(MoneyBankErrorCode.UserTermination);
			}
		} catch(MoneyBankException e) {
			MBSignUpPageExcepRedirect(request, response, e.getMoneybankErrorCode().getDescription());
		} 
		return true;
	}	
	
	private void MBSignUpPageExcepRedirect(HttpServletRequest request, HttpServletResponse response, String description) throws IOException {
		FlashMap flashMap = new FlashMap();
		flashMap.put("description", description);
		FlashMapManager flashMapManager = RequestContextUtils.getFlashMapManager(request);
		flashMapManager.saveOutputFlashMap(flashMap, request, response);
		response.sendRedirect("/moneybank/intro/advpay");
	}
}
