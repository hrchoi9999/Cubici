package egovframework.azon.admin.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface AdminMoneyBankMapper {
	
	//현황 종합 상단에 누적 값을 가져옴
	HashMap<String, Object> MoneyBankAccumulateValue(HashMap<String, Object> param);
	
	//머니뱅크 회원 현황 차트
	ArrayList<HashMap<String, Object>> MoneyBankUserChart(HashMap<String, Object> param);
	
	//머니뱅크 이용 현황 차트
	ArrayList<HashMap<String, Object>> MoneyBankUsageChart(HashMap<String, Object> param);
	
	//머니뱅크 서비스 이용률 차트
	ArrayList<HashMap<String, Object>> MoneyBankServiceChart(HashMap<String, Object> param);
	
	//운영지표 상단에 누적 값을 가져옴
	HashMap<String, Object> MoneyBankOperationValue(HashMap<String, Object> param);
	
	//운영지표 운영건수 날짜 값
	ArrayList<HashMap<String, Object>> MoneyBankOperationCount(HashMap<String, Object> param);
	
	//운영지표 차트(누적 계약)
	ArrayList<HashMap<String, Object>> MoneyBankContractChart(HashMap<String, Object> param);
	
	//운영지표 차트(수수료 및 상환누적)
	ArrayList<HashMap<String, Object>> MoneyBankRepaymentChart(HashMap<String, Object> param);
	
	// API 전달용 사용자 정보
	public ArrayList<HashMap<String, Object>> selectUserCaseData (HashMap<String, Object> params);
	
	
	// *** 머니뱅크 관리 (MKC 2021.05.30) *** // 
	// 머니뱅크 관리 > 통합현황 > 상단통계 정보
	public ArrayList<HashMap<String, Object>> selectMainInfo(HashMap<String, Object> params);
	
	// 머니뱅크 관리 > 회원현황 그래프 
	public ArrayList<HashMap<String, Object>> selectMemberGraphData(HashMap<String, Object> params);
	
	// 머니뱅크 관리 > 운영지표 > 상단통계 정보
	public ArrayList<HashMap<String, Object>> selectOperationInfo(HashMap<String, Object> params);
	
	// 머니뱅크 관리 > 운영지표 그래프
	public ArrayList<HashMap<String, Object>> selectOperationGraphData(HashMap<String, Object> params);
	
	// 머니뱅크 관리 > 이용상세
	public ArrayList<HashMap<String, Object>> selectMoneybankDetail(HashMap<String, Object> params);
	// *** 머니뱅크 관리 END *** //
	
}
