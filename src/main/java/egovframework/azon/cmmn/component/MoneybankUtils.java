package egovframework.azon.cmmn.component;

import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.MoneyBankException;

@Component
public class MoneybankUtils {

	Logger logger = LoggerFactory.getLogger(MoneybankUtils.class);
	
	public static boolean isSessionContainsAuth(String auth) {
		Object authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
		ArrayList<HashMap<String, Object>> authorityList = CubiciUtils.ObjectToArrayList(authorities);
		boolean result = false;
		
		for (int i=0; i<authorityList.size(); i++) {
			result = authorityList.get(i).containsValue(auth);
			if (result) {
				break;
			}
		}
		return result;
	}
}
