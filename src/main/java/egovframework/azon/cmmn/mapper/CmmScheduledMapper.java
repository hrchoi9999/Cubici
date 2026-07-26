package egovframework.azon.cmmn.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface CmmScheduledMapper {
	
	// 스케쥴 리포트 보내기
	void insertScheduledReport(HashMap<String, Object> params);
	// 신규회원 리스트 ( 시나리오 실행 완료 + 메일전송 X )
	ArrayList<HashMap<String, Object>> selectNewEmailList();
	// 회원 쇼핑몰 리스트
	ArrayList<HashMap<String, Object>> selectNewEmailListShopList(String param);
	// 신규회원 SEND_MAIL 업데이트
	void updateSendMail(HashMap<String, Object> params);
	
	// 쇼핑몰 로그인 실패 회원 리스트 가져오기 알림 3미만
	ArrayList<HashMap<String, Object>> selectShopLoginFailUser();
	
	// 쇼핑몰 로그인 실패 회원 리스트 알림 3이상
	HashMap<String, Object> selectNoticeOverList();
	
	void updateNoticeCount(HashMap<String, Object> params);
	
	// 구글 애널리틱스 이용자 Value Insert
	void insertAnalytics(HashMap<String, Object> params);
	
	// 구글 애널리틱스 ErrorReport
	void insertAnalyticsErrorReport(HashMap<String, Object> params);
	
	// 자정마다 usertype update
	void updateUserTypeByExpireDate();
	void updateUserTypeByprePayment();
}
