package egovframework.azon.admin.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface PreferencesMapper {
	
	/* ********** 관리자 등록/관리 시작 ********** */
	// 관리자 신청
	void requestAdmin(HashMap<String, Object> params);
	// 관리자 전체 갯수
	HashMap<String, Object> selectAdminCount();
	// 관리자 리스트 가져오기
	ArrayList<HashMap<String, Object>> selectAdminAccountList(HashMap<String, Object> params);
	// 관리자 아이디 중복확인
	HashMap<String,Object> adminIdCheck(HashMap<String, Object> params);
	// 관리자 승인
	void approvalAdmin(HashMap<String, Object> params);
	// 관리자 정보 수정하기
	void updateAdmin(HashMap<String, Object> params);
	// 관리자 삭제
	void deleteAdmin(HashMap<String, Object> params);
	/* ********** 관리자 등록/관리 끝 ********** */
	
	/* ********** 프리즘 지표 관리 시작 ********** */
	// 프리즘 평가 항목 리스트
	ArrayList<HashMap<String, Object>> selectPrizmEvalList(HashMap<String, Object> params);
	// 평가주제 리스트
	ArrayList<HashMap<String, Object>> selectSubjectList(HashMap<String, Object> resultMap);
	// 평가항목 리스트 
	ArrayList<HashMap<String, Object>> selectItemList(HashMap<String, Object> resultMap);
	// 프리즘 평가 항목 업데이트 기록 불러오기
	ArrayList<HashMap<String, Object>> selectPrizmUpdRecord(HashMap<String, Object> param);
	// 프리즘 업데이트 기록 seq 값 조회
	int selectPrizmUpdSeq(HashMap<String, Object> param);
	// 프리즘 세부지표 업데이트 (평가항목 -> 지표정의, 척도 가중비)
	void prizmEvalItemUpdate(HashMap<String, Object> params);
	// 프리즘 세부지표 업데이트 (세부 리스트)
	void prizmEvalDetailUpdate(HashMap<String, Object> params);
	// 프리즘 세부지표 업데이트 기록
	void insertPrizmEvalUpdRecord(HashMap<String, Object> params);
	// 프리즘 세부지표 업데이트 상세내역
	void insertPrizmEvalUpdDetail(HashMap<String, Object> params);
	// 프리즘 세부지표 업데이트 상세내역 불러오기
	public ArrayList<HashMap<String, Object>> selectPrizmUpdDetailList(HashMap<String, Object> param);
	/* ********** 프리즘 지표 관리 끝 ********** */
	
	/* ********** 프리즘 RawData ************ */
	public ArrayList<HashMap<String, Object>> rawDataColList(HashMap<String, Object> param);
	
	public ArrayList<HashMap<String, Object>> rawDataListSelect(HashMap<String,Object> params);
	
	void rawDataCalculInsert(HashMap<String, Object> params);
	
	void rawDataCalculUpdate(HashMap<String, Object> params);
	
	void rawDataCalculDelete(HashMap<String, Object> params);
	
	public ArrayList<HashMap<String, Object>> rawDataExcelList(String param);

	ArrayList<HashMap<String, Object>> chargeList(HashMap<String, Object> params); 
	
	HashMap<String, Object> chargeCount(HashMap<String, Object> params);
	
	String chargeCodeList(HashMap<String, Object> params);
	
	HashMap<String, Object> chargeDetail(HashMap<String, Object> params);
	
	void chargeinsert(HashMap<String, Object> params);
	
	void chargeupdate(HashMap<String, Object> params);
	
	void chargedelete(HashMap<String, Object> param);

	ArrayList<HashMap<String, Object>> promotionlist(HashMap<String, Object> params); 
	
	HashMap<String, Object> promotionCount(HashMap<String, Object> params);
	
	HashMap<String, Object> promotionDetail(HashMap<String, Object> params);

	ArrayList<HashMap<String, Object>> partnerDivisionSelect(HashMap<String, Object> params);
	ArrayList<HashMap<String, Object>> chargeNameSelect();
	ArrayList<HashMap<String, Object>> partnerCodeSelect(HashMap<String, Object> params);

	void promotionInsert(HashMap<String, Object> params);
	String promotionCodeSelect(HashMap<String, Object> params);

	void promotionUpdate(HashMap<String, Object> params);
	
	void promotionDelete(HashMap<String, Object> params);

	void connectionInsert(HashMap<String, Object> params);
	
	void connectionDelete(String param);
	
	/* ********** 연계 코드 관리 ************ */
	// 연계 코드 등록하기
	void insertLinkedCode(HashMap<String, Object> params);
	// 연계 코드 수정하기
	void updateLinkedCode(HashMap<String, Object> params);
	// 연계 코드 가져오기
	ArrayList<HashMap<String, Object>> selectLinkedCode(HashMap<String, Object> params);
	// 데이터 넘기기
	HashMap<String, Object> gotoTab2(HashMap<String, Object> params);
	/* ********** 연계 코드 관리 끝 ************ */
	
	/* ********** 머니뱅크 관리 ************ */
	ArrayList<HashMap<String, Object>> selectMoneybankList(HashMap<String, Object> params);
	// 머니뱅크 상품 등록
	void insertMoneybankProduct(HashMap<String, Object> params);
	HashMap<String, Object> selectMoneybankFirmNo(HashMap<String, Object> params);
	void insertMoneybankPartner(HashMap<String, Object> params);
	// 머니뱅크 상품 수정
	void updateMoneybankProudct(HashMap<String, Object> params);
	void updateMoneybankPartner(HashMap<String, Object> params);
	HashMap<String, Object> gotoMoneybankTab2(HashMap<String, Object> params);
	
	/* ********** 머니뱅크 관리 끝 ************ */
	
	ArrayList<HashMap<String, Object>> partnerList(HashMap<String, Object> params);
	
	HashMap<String, Object> partnerCodeCount(HashMap<String, Object> params);
	
	int divisionCodeAuth(String param);
	
	ArrayList<HashMap<String, Object>> partnerDetail(HashMap<String, Object> params);

	void partnerInsert(HashMap<String, Object> params);
	
	//void managerInsert(HashMap<String, Object> params);
	
	void partnerUpdate(HashMap<String, Object> params);
	
	void managerInsertUpdate(HashMap<String, Object> params);

	void partnerDelete(HashMap<String, Object> param);
	
	// 평가 object_no update
	void EvalUpdate(HashMap<String, Object> params);
	
	// 평가 INSERT
	void partnerEvalInsert(HashMap<String, Object> params);
	
	// 평가 수정
	void partnerEvalUpdate(HashMap<String, Object> params);
	
	// 평가 삭제
	void partnerEvalDelete(HashMap<String, Object> params);
	
	// 평가 리스트
	ArrayList<HashMap<String, Object>> partnerEvalList(HashMap<String, Object> params);
	
	/* ********** 협력사 코드 관리 끝 ************* */

	/* ********** 요금제 관리 ************* */

	// 요금제 목록
	ArrayList<HashMap<String, Object>> selectChargeList();

	/* ********** 요금제 관리 끝 ************* */

	/* ********** 이벤트 관리 ************* */
	// 이벤트 목록
	ArrayList<HashMap<String, Object>> selectPromotionList();

	/* ********** 이벤트 관리 끝 ************* */
}
