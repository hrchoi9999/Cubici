package egovframework.azon.cmmn.security;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.component.MoneybankUtils;
import egovframework.azon.cmmn.security.dto.AdminSecurityUser;
import egovframework.azon.cmmn.security.dto.AuthFilterDto;
import egovframework.azon.cmmn.security.dto.SecurityUser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AuthProvider implements AuthenticationProvider{
	
	Logger logger = LoggerFactory.getLogger(AuthProvider.class);
	
	@Autowired
	SecurityService securityService;
	
	@Autowired
	MoneybankUtils moneybankUtils;

	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		Object principal = authentication.getPrincipal();
		String password = authentication.getCredentials().toString();
		return authenticate(principal, password);
	}

	private Authentication authenticate(Object principal, String password) {
		Authentication userauth = null;
		AuthFilterDto principalDto = (AuthFilterDto) principal;
		
		String division = principalDto.getDivision();
		
		if(division.equals("user")) {
			userauth = UserAuthenticateUserAuth(principalDto, password);
		}else if(division.equals("admin")){
			userauth = AdminAuthenticateUserAuth(principalDto, password);
		}
		
		if(userauth == null) {
			throw new SecurityException("AuthProviderUserAuthNull");
		}

		return userauth;
	}
	
	private Authentication UserAuthenticateUserAuth(AuthFilterDto principalDto, String password) {
		SecurityUser securityUser = securityService.loadUserByUsername(principalDto.getUserId());
		String UserTypeChange = principalDto.getUsertype();
		
		if(!CubiciUtils.StringEmpty(UserTypeChange)){
			securityUser.setUser_type(UserTypeChange);
		}
		
		if(securityUser == null) {
			throw new SecurityException("UsernameNotFound");
		} else if(securityUser != null) {
			if(!securityUser.getPassword().equals(password)) {
				throw new SecurityException("BadCredentials");
			}else if(securityUser.getWithdraw().equals("Y")) {
				throw new SecurityException("UserSecession");
			}
		}
		
		securityUser.setAuthFilterDto(principalDto.getIdSave(), principalDto.getDivision());
		
		String type = securityUser.getUser_type();
		String division = securityUser.getDivision();
		
		List<GrantedAuthority> grantedAuthorityList = principalDto.getAuthorities();
		
		if(principalDto.getAuthorities() == null) {			
			HashMap<String, Object> authorityHashMap = AuthorityHashMap(type, division);
			authorityHashMap.put("mb_status", securityUser.getMb_status());
			grantedAuthorityList = grantedAuthorityList(authorityHashMap);
			securityUser.setAuthorities(grantedAuthorityList);
		} 
		
		return new UserAuth(securityUser, password, grantedAuthorityList);
	}
	
	private Authentication AdminAuthenticateUserAuth(AuthFilterDto principalDto, String password) {
		AdminSecurityUser securityUser = securityService.AdminloadUserByUsername(principalDto.getUserId());
		String adminType = principalDto.getAdmintype();

		if(CubiciUtils.StringEmpty(adminType)) {
			throw new SecurityException("ForntAdminTypeisNull");
		}
		
		if(securityUser == null) {
			throw new SecurityException("AdminUsernameNotFound");
		} else if(!securityUser.getPassword().equals(password)) {
			throw new SecurityException("AdminBadCredentials");
		} else if(!securityUser.getAdmin_type().equals(adminType)) {
			throw new SecurityException("AdminLoginTypeDiscrepancy");
		}
		
		securityUser.setAuthFilterDto(principalDto.getIdSave(), principalDto.getDivision());
		
		String type = securityUser.getAdmin_type();
		String grade = securityUser.getAdmin_grade();
		String division = securityUser.getDivision();
		
		HashMap<String, Object> authorityHashMap = AuthorityHashMap(type, division);
		List<GrantedAuthority> grantedAuthorityList = grantedAuthorityList(authorityHashMap);
		
		authorityHashMap = AuthorityHashMap(grade, "admingrade");
		grantedAuthorityList.addAll(grantedAuthorityList(authorityHashMap));
		
		return new UserAuth(securityUser, password, grantedAuthorityList);
	}
	
	private HashMap<String, Object> AuthorityHashMap(String type, String division){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();

		if(CubiciUtils.StringEmpty(type)) {
			throw new SecurityException("AuthTypeisNull");
		}
		
		resultMap.put("type", type);
		resultMap.put("division", division);
		
		return resultMap;
	}
	
	private List<GrantedAuthority> grantedAuthorityList(HashMap<String, Object> params){
		List<GrantedAuthority> roleList = new ArrayList<GrantedAuthority>();
		try {
			ArrayList<HashMap<String, Object>> roleMap = securityService.loadUserByRole(params);		
			
			for(HashMap<String, Object> resultMap : roleMap) {
				String role = resultMap.get("auth_role").toString();
				roleList.add(new SimpleGrantedAuthority(role));
				if(role.equals("ROLE_USER")){
					String add_role = SecurityUtils.setAuthByUserStatus(params);
					roleList.add(new SimpleGrantedAuthority(add_role));
				}
			}
		}catch(Exception e) {
			throw new SecurityException("RoleUndefined");
		}
		
		if(roleList.isEmpty()) {
			throw new SecurityException("GrantedAuthorityEmpty");
		}
		
		return roleList;
	}
	
	@Override
	public boolean supports(Class<?> authentication) {
		return authentication.equals(UsernamePasswordAuthenticationToken.class);
	}	
}
