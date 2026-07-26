package egovframework.azon.cmmn.security;

import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import egovframework.azon.cmmn.security.dto.AdminSecurityUser;
import egovframework.azon.cmmn.security.dto.SecurityUser;

@Service
public class CustomUserDetailService implements SecurityService {
	
	Logger logger = LoggerFactory.getLogger(CustomUserDetailService.class);
	
	@Autowired
	CustomUserDetailMapper customUserDetailMapper;
	
	@Override
	public SecurityUser loadUserByUsername(String id) {
		return customUserDetailMapper.getUser(id);
	}
	
	@Override 
	public AdminSecurityUser AdminloadUserByUsername(String id) {
		return customUserDetailMapper.AdmingetUser(id);
	}
	
	@Override
	public ArrayList<HashMap<String, Object>> loadUserByRole(HashMap<String, Object> params) {
		return customUserDetailMapper.getRole(params);
	}

	@Override
	public String[] getUri (String param){ 
		return customUserDetailMapper.getUri(param);
	}
}
