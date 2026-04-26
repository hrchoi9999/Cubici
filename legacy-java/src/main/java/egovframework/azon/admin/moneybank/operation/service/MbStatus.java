package egovframework.azon.admin.moneybank.operation.service;

import java.util.Arrays;

import lombok.Getter;

@Getter
public enum MbStatus {
	advance_pass("00", "", "사전심사 완료", "ROLE_MB_REQUEST"),
	request("01", "", "신청", "ROLE_MB_EVALUATE"),
	submission_pass("02", "", "서류확인", "ROLE_MB_EVALUATE"),
	prizm_complete("03", "sColorY", "심사대기", "ROLE_MB_EVALUATE"),
	conditions_accept("04", "sColorY", "조건", "ROLE_MB_EVALUATE"),
	use_agree("05", "sColorGN", "동의", "ROLE_MB_CONTRACT"),
	normal("06", "sColorLS", "계약체결", "ROLE_USER_MB"),
	expi_normal("07", "sColorY", "계약만료", "ROLE_MB_ADVANCE"),
	cancel("31", "", "중도해지", "ROLE_MB_ADVANCE"),
	conditions_refuse("41", "sColorP", "조건거부", "ROLE_MB_ADVANCE"),
	use_refunse("51", "", "동의거부", "ROLE_MB_ADVANCE"),
	contract_reject("61","", "계약거부", "ROLE_MB_ADVANCE"),
	attention("62", "sColorY", "주의", "ROLE_USER_MB"),
	warning("63", "sColorP", "경고", "ROLE_USER_MB"),
	expi_request("71", "sColorG", "해지신청", "ROLE_USER_MB"),
	expi_stop("72", "sColorG", "본인해지", "ROLE_USER_MB"),
	expi_late_payment("73", "sColorP", "강제해지", "ROLE_MB_ERROR"),
	account_stand_by("81", "sColorP", "계좌대기", "ROLE_MB_CONTRACT"),
	account_fail("82", "sColorP", "계좌해지", "ROLE_USER_MB"),
	all("", "", "", "ROLE_MB_ADVANCE"),

	// 조건승인 임시로 처리
	conditions_accept_adjN("401", "sColorPP", "조건승인", "ROLE_MB_EVALUATE"),
	conditions_accept_adjY("402", "sColorGN", "조건조정", "ROLE_MB_EVALUATE");
	
	
	private String mbStatus;
	private String color;
	private String mbStatusName;
	private String auth;
	
	MbStatus(String mbStatus, String color, String mbStatusName, String auth) {
		this.mbStatus = mbStatus;
		this.color = color;
		this.mbStatusName = mbStatusName;
		this.auth = auth;
	}
	
	public static String findByStatusNm(String mbStatusName) {
		return Arrays.stream(MbStatus.values())
				.filter(status -> status.name().equals(mbStatusName))
				.findFirst().get().mbStatus;
	}
	
	public static MbStatus findByMbStatus(String mbStatus) {
		return Arrays.stream(MbStatus.values())
				.filter(status -> status.mbStatus.equals(mbStatus))
				.findFirst()
				.orElse(all);
	}
}
