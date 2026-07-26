package egovframework.azon.cmmn.errorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public enum CmmErrorCode {
	UserAuthenticationError("C001", "큐빅아이 유틸 유저 정보 GET 값 오류", "test");	
	private String code;
	private String description;
	private String message;
}