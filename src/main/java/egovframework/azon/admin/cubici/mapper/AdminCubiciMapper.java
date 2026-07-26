package egovframework.azon.admin.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface AdminCubiciMapper {
	
	// 현재 회원 수
	HashMap<String, Object> selectUserCount();

	/* 통합정보 > 큐빅아이 > 종합지표 21.05.12 */
	// 신규가입
	ArrayList<HashMap<String, Object>> selectNewMemCount(HashMap<String, Object> param);
	// 해지회원
	ArrayList<HashMap<String, Object>> selectWdMemCount(HashMap<String, Object> param);
	// 가입기간
	ArrayList<HashMap<String, Object>> selectUserRegiPeriod(HashMap<String, Object> param);
	// 매출
	ArrayList<HashMap<String, Object>> selectSalesCount(HashMap<String, Object> param);
	// 반품+교환
	ArrayList<HashMap<String, Object>> selectReturnCount(HashMap<String, Object> param);
	// 정산예정
	ArrayList<HashMap<String, Object>> selectSettlementPre(HashMap<String, Object> param);
	// 정산입금
	ArrayList<HashMap<String, Object>> selectSettlement(HashMap<String, Object> param);
	// 등록쇼핑몰
	ArrayList<HashMap<String, Object>> selectRegiShopCount(HashMap<String, Object> param);	
	// cubici SKU
	ArrayList<HashMap<String, Object>> selectCubiciSKUCount(HashMap<String, Object> param);
	// moneybank SKU
	ArrayList<HashMap<String, Object>> selectMbSKUCount(HashMap<String, Object> param);
	// 운영
	ArrayList<HashMap<String, Object>> selectOperShopCount(HashMap<String, Object> param);
	
	// 제휴 가입
	ArrayList<HashMap<String, Object>> selectRegiPartner(HashMap<String, Object> param);
	
	/*** 큐빅아이 관리자 메인페이지 MKC 2020.11.19 ***/
	// 사용자 정보 가져오기 (일 단위)
	ArrayList<HashMap<String, Object>> selectMemberInfo(HashMap<String, Object> params);
	// 사용자 정보 가져오기 (월 단위)
	ArrayList<HashMap<String, Object>> monthGraphUserCount(HashMap<String, Object>params);
	// 회원 그래프 정보 가져오기
	ArrayList<HashMap<String, Object>> selectMemberData(HashMap<String, Object>params);
	// 쇼핑몰 아이디 수 가져오기
	int selectAccount(HashMap<String, Object>params);
	// 쇼핑몰 아이디 정보 리스트 가져오기
	ArrayList<HashMap<String, Object>> selectShopAccounts (HashMap<String, Object>params);
	// 반품교환 리스트 가져오기
	ArrayList<HashMap<String, Object>> returnExchangeList(HashMap<String, Object> params);
	/*** 큐빅아이 관리자 메인페이지 END ***/
	
	/*** 지급요청 리스트 가져오기 (현재 위치 임시) ***/
	// 승인 리스트 가져오기
	ArrayList<HashMap<String, Object>> selectAdvCalPaymentList();
	// 지급요청할 정보 가져오기
	HashMap<String,Object> selectAdvCalPaySend(HashMap<String, Object> params);
	// DB에 전달 기록 저장
	int insertPayment(HashMap<String, Object>params);
	/*** 지급요청 리스트 가져오기 END ***/
	
	/*** 회원 관리 ***/
	// tab1 누적 데이터
	int cumulateUserData(HashMap<String, Object> params);
	// 상세 모달 머니뱅크
	ArrayList<HashMap<String, Object>> moneybankList(HashMap<String, Object> params);
	// tab3 해지 상세
	ArrayList<HashMap<String, Object>> selectWithdrawDetailList(HashMap<String, Object> params);
	// 해지 확인 수정
	void updateWithdraw(HashMap<String, Object> param);

	
	/***** 활동지표 *****/
	ArrayList<HashMap<String, Object>> selectActivityIndicator(HashMap<String, Object> params);

}
