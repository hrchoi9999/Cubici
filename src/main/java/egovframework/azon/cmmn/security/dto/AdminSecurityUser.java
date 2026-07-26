package egovframework.azon.cmmn.security.dto;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Data;

@Data
public class AdminSecurityUser implements UserDetails{
	
	private static final long serialVersionUID = 1L;
	
	private String admin_type;
	private String username;
	private String password;
	private String admin_firm_no;
	private String admin_grade;
	private String admin_id;
	private String idSave;
	private String division;
	
	private Collection<? extends GrantedAuthority> authorities;
	private boolean isAccountNonExpired;
	private boolean isAccountNonLocked;
	private boolean isCredentialsNonExpired;
	private boolean isEnabled;
	
	public void setAuthFilterDto(String idSave, String division) {
		this.password = null;
		this.idSave = idSave;
		this.division = division;
	}
}
