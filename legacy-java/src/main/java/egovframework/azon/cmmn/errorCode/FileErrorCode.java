package egovframework.azon.cmmn.errorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public enum FileErrorCode {
	EncTypeNotDefined("F001", "관리자에게 문의해주세요.", "enc_type is not defined."),
	FilePathNotExist("F002", "관리자에게 문의해주세요.", "The specified file path does not exist"),
	InvalidKey("F003", "올바르지 않은 키값입니다. 다시 시도해 주세요.", "Invalid key value."),
	InvalidExt("F004", "파일 확장자가 올바르지 않습니다.", "Invalid file extension"),
	FileOversize("F005", "5MB 이하의 파일만 업로드 가능합니다.", "You can only upload files that are less than 5MB.");
	
	private String code;
	private String description;
	private String message;
	
	public String FileErrorCodeLog(String msg) {
		return msg + " ErrorCode : " + getCode() + " message : " + getMessage();
	}
}
