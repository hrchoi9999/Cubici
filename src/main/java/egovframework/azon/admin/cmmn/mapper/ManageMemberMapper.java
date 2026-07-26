package egovframework.azon.admin.cmmn.mapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface ManageMemberMapper {
	ArrayList<HashMap<String, Object>> userStatusList(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> userStatusSum(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> userStatusDetail(String userCode);
	
	HashMap<String, Object> userStatusRateDetail(String param);
	
	HashMap<String, Object> userStatusRateTotalDate(String param);
	
	HashMap<String, Object> totalSales(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> totalCalculate(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> totalSku(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> findEvaluateByObjectNo(String param);
	
	void userEvaluateEnroll(HashMap<String, Object> paramMap);
	
	void userEvaluateModify(HashMap<String, Object> paramMap);
	
	ArrayList<HashMap<String, Object>> findPaymentList(HashMap<String, Object> paramMap);
	
	ArrayList<HashMap<String,Object>> findUsageList(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> getUsageListCount(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> findMbFirstRegDate(HashMap<String, Object> paramMap);
	
	HashMap<String, Object> findMbInfo(HashMap<String, Object> paramMap);
	
	ArrayList<HashMap<String, Object>> findHistoryList(HashMap<String, Object> paramMap);

	HashMap<String, Object> findFileCheck(HashMap<String, Object> paramMap);
}
