package egovframework.azon.cmmn.errorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@AllArgsConstructor
public enum SecurityErrorCode {
	CustomErrorCodeError("S001", "관리자에게 문의해주세요."),
	UserSecession("S002" , "탈퇴 계정입니다."),
	UsernameNotFound("S003", "아이디가 존재하지 않거나 비밀번호가 틀립니다."),
	BadCredentials("S004", "아이디가 존재하지 않거나 비밀번호가 틀립니다."),
	RoleUndefined("S005", "관리자에게 문의해주세요."),
	GrantedAuthorityEmpty("S006", "관리자에게 문의해주세요."),
	SecurityParseError("S007", "관리자에게 문의해주세요."),
	AdminUsernameNotFound("S008", "아이디가 존재하지 않거나 비밀번호가 틀립니다."),
	AdminBadCredentials("S009", "아이디가 존재하지 않거나 비밀번호가 틀립니다."),
	AuthProviderUserAuthNull("S010", "관리자에게 문의해주세요."),
	AuthTypeisNull("S011", "미확인된 관리자 타입입니다. 관리자에게 문의해주세요."),
	AdminLoginTypeDiscrepancy("S012", "아이디와 비밀번호를 다시 한번 확인해주세요."),
	ForntAdminTypeisNull("S013", "관리자에게 문의해주세요"),
	LoginSuccess("S100", "로그인 성공");
	
	private String code;
	private String description;
	
	//Json 형식
	public String JsonString() {
		return "{\"Code\":\"" + getCode() + "\" \"description\":\"" + getDescription() + "\" \"resultCode\":0}" ;
	}
}