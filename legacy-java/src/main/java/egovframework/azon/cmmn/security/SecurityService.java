package egovframework.azon.cmmn.security;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.security.core.userdetails.UserDetailsService;

import egovframework.azon.cmmn.security.dto.AdminSecurityUser;
import egovframework.azon.cmmn.security.dto.SecurityUser;

public interface SecurityService extends UserDetailsService  {
	
	SecurityUser loadUserByUsername(String id);
	
	AdminSecurityUser AdminloadUserByUsername(String id);
	
	ArrayList<HashMap<String, Object>> loadUserByRole(HashMap<String, Object> params);
	
	String[] getUri(String Param);
}
