package egovframework.azon.cmmn.exception;

import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import lombok.Getter;

public class MoneyBankException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	@Getter
	private MoneyBankErrorCode moneybankErrorCode;
	
	public MoneyBankException(MoneyBankErrorCode moneybankErrorCode) {
		super(moneybankErrorCode.getMessage());
		this.moneybankErrorCode = moneybankErrorCode;
	}
	
	public MoneyBankException(MoneyBankErrorCode moneybankErrorCode, String message) {
		super(message);
		this.moneybankErrorCode = moneybankErrorCode;
	}
	
	public MoneyBankException(MoneyBankErrorCode moneybankErrorCode, Throwable cause) {
		super(cause);
		this.moneybankErrorCode = moneybankErrorCode;
	}
}
