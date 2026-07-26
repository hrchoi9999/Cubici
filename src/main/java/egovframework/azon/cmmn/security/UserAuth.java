package egovframework.azon.cmmn.security;

import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import egovframework.azon.cmmn.security.dto.AdminSecurityUser;
import egovframework.azon.cmmn.security.dto.SecurityUser;

public class UserAuth extends UsernamePasswordAuthenticationToken{
	private static final long serialVersionUID = 1L;

	SecurityUser securityuser;
	
	AdminSecurityUser adminSecurityUser;
	
	public UserAuth(SecurityUser securityuser, String password, List<GrantedAuthority> grantedAuthorityList) {
		super(securityuser, password, grantedAuthorityList);
		this.securityuser = securityuser;
	}
	
	public UserAuth(AdminSecurityUser adminsecurityuser, String password, List<GrantedAuthority> grantedAuthorityList) {
		super(adminsecurityuser, password, grantedAuthorityList);
		this.adminSecurityUser = adminsecurityuser;
	}
}
