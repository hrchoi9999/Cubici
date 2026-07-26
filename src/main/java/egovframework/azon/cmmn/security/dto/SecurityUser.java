package egovframework.azon.cmmn.security.dto;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Data;

@Data
public class SecurityUser implements UserDetails{
	
	private static final long serialVersionUID = 1L;
	
	private int user_no;
	private String user_id;
	private String user_code;
	private String username;
	private String password;
	private String user_type;
	private String firm_id;
	private String firm_nm;
	private String business_type;
	private String coupang_settlement_type;
	private String reg_date;
	private String withdraw;
	private String money_bank;
	private String mb_product_code;
	private String mb_status;
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
