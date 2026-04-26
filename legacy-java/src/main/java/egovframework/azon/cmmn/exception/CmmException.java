package egovframework.azon.cmmn.exception;

import egovframework.azon.cmmn.errorCode.CmmErrorCode;
import lombok.Getter;

public class CmmException extends RuntimeException{
	
	@Getter
	private CmmErrorCode cmmErrorCode;
	
	public CmmException(String msg) {
		super(msg);
	}
	
	public CmmException(String msg, CmmErrorCode cmmErrorCode) {
		super(msg);
		this.cmmErrorCode = cmmErrorCode;
	}
	
}
