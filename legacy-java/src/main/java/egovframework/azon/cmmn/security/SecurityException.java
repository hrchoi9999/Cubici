package egovframework.azon.cmmn.security;

import org.springframework.security.core.AuthenticationException;

import egovframework.azon.cmmn.errorCode.SecurityErrorCode;
import lombok.Getter;

public class SecurityException extends AuthenticationException{
	
	private static final long serialVersionUID = 1L;
	
	@Getter
	private SecurityErrorCode securityErrorCode;
	
	public SecurityException(String msg) {
		super(msg);
	}
	public SecurityException(String msg, SecurityErrorCode securityErrorCode) {
		super(msg);
		this.securityErrorCode = securityErrorCode;
	}
}
