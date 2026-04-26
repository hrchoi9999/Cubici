package egovframework.azon.admin.moneybank.operation.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface JudgeMapper {
	
	ArrayList<HashMap<String, Object>> loadApprovalList (HashMap<String, Object> paramMap);
	
	HashMap<String, Object> approvalCount (HashMap<String, Object> params);

	HashMap<String, Object> loadApprovalDetail(String mbid);

	String findByRequestShops(String mbid);

	ArrayList<HashMap<String, Object>> getHistoryOfUsage(HashMap<String, Object> paramMap);
	
	void inputAdjustment(HashMap<String, Object> params);
	
	ArrayList<HashMap<String, Object>> loadContractList (HashMap<String, Object> paramMap);
	
	HashMap<String, Object> contractCount (HashMap<String, Object> params);

}
