package egovframework.azon.admin.moneybank.operation.mapper;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Mapper
public interface RedemMapper {

	ArrayList<HashMap<String, Object>> findRedemList(HashMap<String, Object> params);

	HashMap<String, Object> findRedemAmountTotal(HashMap<String, Object> params);

	HashMap<String, Object> findRedemCountTotal(HashMap<String, Object> params);

	ArrayList<HashMap<String, Object>> findRedemDetailList(HashMap<String, Object> paramMap);

	HashMap<String, Object> findRedemDetailSum(HashMap<String, Object> paramMap);

	HashMap<String,Object> getRedemInfo(String mbid);

	HashMap<String, Object> getEvalInfo(String evalNo);

	List<HashMap<String, Object>> getEvalInfoList(HashMap<String, Object> params);

	int evalCountTotal(String mbid);

	void evalEnroll(HashMap<String, Object> params);

}
