package egovframework.azon.cmmn.security;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.azon.cmmn.security.dto.AdminSecurityUser;
import egovframework.azon.cmmn.security.dto.SecurityUser;
import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface CustomUserDetailMapper {
	SecurityUser getUser(String id);
	
	AdminSecurityUser AdmingetUser(String id);

	ArrayList<HashMap<String, Object>> getRole(HashMap<String, Object> params);
	
	String[] getUri(String param);
}
