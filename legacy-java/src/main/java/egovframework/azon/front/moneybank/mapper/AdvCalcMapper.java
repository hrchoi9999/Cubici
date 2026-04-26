package egovframework.azon.front.moneybank.mapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface AdvCalcMapper {
	public HashMap<String, Object> advanceRequestCheck(String Param);
	
	public HashMap<String, Object> advanceRequest(HashMap<String, Object> paramMap);

	public void advanceReqeustInsert(HashMap<String, Object> paramMap);
	
	public String findMBId(String param);
	
	public void requestShopInsert(HashMap<String, Object> paramMap);
	
	public void MBReqeustInsert(HashMap<String, Object> paramMap);
	
	public HashMap<String, Object> RequestAcceptCheck(String param);
	
	// 머니뱅크 신청 정보
	public HashMap<String, Object> getMoneybankRequestInfo(HashMap<String, Object> params);

	int modifyRequestStatusByMbStatus(HashMap<String, Object> params);

    ArrayList<HashMap<String, Object>> getRedemDetailList(HashMap<String, Object> paramMap);

	HashMap<String, Object> getRedemDetailSum(HashMap<String, Object> paramMap);

	List<HashMap<String, Object>> findAccountList(HashMap<String, Object> paramMap);
}
