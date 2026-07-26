package egovframework.azon.front.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface CubiciCmmMapper {
	
	// 쇼핑몰 목록 조회 (신버전)
	HashMap<String, Object> selectShopInfo(HashMap<String, Object> param);
	
	// CBCI_ERR_REPORT insert
	public void insertErrorReport(HashMap<String, Object> params);
	
	// CBCI_NOTICE_REPORT insert
	public void insertNoticeReport(HashMap<String, Object> params);

	// CBCI_ACCESS_RECORD insert
	public void insertAccessRecord(HashMap<String, Object> params);
	
	HashMap<String, Object> userBizOverlap(HashMap<String, Object> params);
	
	HashMap<String, Object> partnerBizOverlap(HashMap<String, Object> paramMap);
	
	// 사업자 유형
	ArrayList<HashMap<String, Object>> selectBizType();
	
	// 업종
	ArrayList<HashMap<String, Object>> selectSector();

	// 쇼핑몰 리스트
	ArrayList<HashMap<String, Object>> selectShop();

	// error-Report
	ArrayList<HashMap<String, Object>> errorData(HashMap<String, Object> params);

	// 도매업체 리스트
	HashMap<String, Object> selectLinkedWholesale();
	
	// 셀렉트바 리스트
	ArrayList<HashMap<String, Object>> selectCodeList(String string);
	
	// 파트너 리스트
	ArrayList<HashMap<String, Object>> selectPartner();
	
	HashMap<String, Object> UserSessionTypePw(String param);
	
	String UserSessionRole(String param);

	String AdminMoneyBankTypeName(String param);
	
	ArrayList<HashMap<String, Object>> authSelectBox(String param);
	
	ArrayList<HashMap<String, Object>> chargeSelectBox();
	
	ArrayList<HashMap<String, Object>> isUseShop(String param);
	
	ArrayList<HashMap<String, Object>> inUserShop(String param);
	
	// 이용자 모달
	HashMap<String, Object> freePeriodEnd(String param);
	
	HashMap<String, Object> periodEnd(String param);
	
	HashMap<String, Object> MBPeriodEnd(String param);
	
	String findUserPhone(String param);
	
	HashMap<String, Object> findSmsTemplate(HashMap<String, Object> paramMap);
	
	ArrayList<HashMap<String, Object>> getBankInfo();

    String isBizDay(HashMap<String, Object> tomorrowStr);
}
