package egovframework.azon.cmmn.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface CoupangScheduledMapper {

	// 쿠팡 회원 목록
	ArrayList<HashMap<String, Object>> selectCoupangUserList();
	// 신규회원 -> 기존회원으로 변경
	void updateNewUser(HashMap<String, Object> param);
	
	/* 매출 */
	// 발주서 목록 조회 API insert
	void insertSales(HashMap<String, Object> params);
	// 매출내역 조회 API insert
	void mergeSales(HashMap<String, Object> params);
	// 매출내역에만 데이터가 존재하는 주문번호는 주문번호별 상세조회로 다시 조회해야됨
	ArrayList<HashMap<String, Object>> selectDetailSalesUser(HashMap<String, Object> param);
	// 매출내역에만 데이터가 존재하는 주문번호는 주문번호별 따로 insert
	void insertDetailSales(HashMap<String, Object> params);
	
	/* 정산 */
	// 지급내역 조회 API insert
	void insertSettlement(HashMap<String, Object> params);
	
	/* 반품/취소 */
	// 반품 조회 API insert
	void insertReturn(HashMap<String, Object> params);
	// 반품 철회 조회 API insert or merge
	void insertReturnWithdraw(HashMap<String, Object> params);
	// 업데이트할 반품 목록
	ArrayList<HashMap<String, Object>> selectReturnList();
	// 반품 CBCI_COUPANG_SALES에 업데이트
	void updateReturnList(HashMap<String, Object> params);
	
	/* 교환 */
	// 교환 목록 API insert
	void insertExchange(HashMap<String, Object> params);
	
}
