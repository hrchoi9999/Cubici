package egovframework.azon.cmmn.security.dto;

import java.util.List;

import org.springframework.security.core.GrantedAuthority;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AuthFilterDto {
	private String idSave;
	private String userId;
	private String userPw;
	private String division;
	private String admintype;
	private String usertype;
	private List<GrantedAuthority> authorities;
	
	public AuthFilterDto(String idSave, String userId, String division, String usertype) {
		this.idSave = idSave;
		this.userId = userId;
		this.division = division;
		this.usertype = usertype;
	}
	
	public AuthFilterDto(String idSave, String userId, String division, List<GrantedAuthority> authorities) {
		this.idSave = idSave;
		this.userId = userId;
		this.division = division;
		this.authorities = authorities;
	}
	
	public AuthFilterDto() {
		
	}
}
