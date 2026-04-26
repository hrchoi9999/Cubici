package egovframework.azon.front.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface BillingMapper {
	
	// 요금제 리스트
	ArrayList<HashMap<String, Object>> selectChargeList();

	// 현재 유저의 전체 요금 정보
	ArrayList<HashMap<String, Object>> selectUserChargeInfo(HashMap<String, Object> params);

	// 현재 유저의 요금 정보
	HashMap<String, Object> selectChargeInfo(HashMap<String, Object> params);

	// 이벤트 코드 정보 확인
	HashMap<String, Object> selectPromotionInfo(HashMap<String, Object> params);
	
	// 요금제 정보 확인
	HashMap<String, Object> checkChargeInfo(HashMap<String, Object> params);

	// 환급신청 데이터 insert
	void refundRequest(HashMap<String, Object> paramsMap);

	// 결제내역 데이터 insert
	void insertPaymentsData(HashMap<String, Object> params);
	
	// 결제내역 데이터 update
	void updatePaymentsData(HashMap<String, Object> params);
	
	// 무료요금제 정보
	HashMap<String, Object> freeChargeInfo(HashMap<String, Object> params);
	
	// 오늘날짜 결제내역 갯수
	HashMap<String, Object> selectPayementDetailCount();

	// pg 결제 id 조회
	ArrayList<HashMap<String, Object>> selectPaymentDetail(HashMap<String, Object> paramsMap);

	//머니뱅크 이용 현황
	ArrayList<HashMap<String, Object>> selectMBList(HashMap<String, Object> params);
	
	// 머니뱅크 잔액 확인
	HashMap<String, Object> selectMbBalance(HashMap<String, Object> paramsMap);
	
	// 취소요청 데이터 insert 
	void insertRequestCancel(HashMap<String, Object> params);
	
	// 유저타입 update
	void updateUserType(HashMap<String, Object> params);
}