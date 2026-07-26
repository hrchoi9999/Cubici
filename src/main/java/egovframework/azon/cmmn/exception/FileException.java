package egovframework.azon.cmmn.exception;

import egovframework.azon.cmmn.errorCode.FileErrorCode;
import lombok.Getter;

public class FileException extends RuntimeException{

	private static final long serialVersionUID = 1L;
	
	@Getter
	private FileErrorCode fileErrorCode;

	public FileException(FileErrorCode fileErrorCode) {
		super(fileErrorCode.getMessage());
		this.fileErrorCode = fileErrorCode;
	}
	
	public FileException(FileErrorCode fileErrorCode, String message) {
		super(message);
		this.fileErrorCode = fileErrorCode;
	}
	
	public FileException(FileErrorCode fileErrorCode, Throwable cause) {
		super(cause);
		this.fileErrorCode = fileErrorCode;
	}
}
