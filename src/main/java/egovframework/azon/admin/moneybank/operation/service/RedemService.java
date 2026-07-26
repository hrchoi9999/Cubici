package egovframework.azon.admin.moneybank.operation.service;

import egovframework.azon.admin.moneybank.operation.mapper.CmmMapper;
import egovframework.azon.admin.moneybank.operation.mapper.RedemMapper;
import egovframework.azon.cmmn.cbc.CBCComponent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


@Service
public class RedemService {

	@Autowired
	CmmService cmmService;

	@Autowired
	RedemMapper redemMapper;

	@Autowired
	CmmMapper cmmMapper;

	@Autowired
	CBCComponent cbcComponent;

	// 상환현황 list
	public ArrayList<HashMap<String, Object>> findRedemList(HashMap<String, Object> params){
		params.put("mb_product_code", MbProductCode.findByMbProductCode(String.valueOf(params.get("service"))));
		params.put("mb_status", MbStatus.findByStatusNm(String.valueOf(params.get("status"))));
		params.put("orderBy", OrderByValue.findByOrderByValue(String.valueOf(params.get("orderBy"))));
		return cmmService.modifyDataByMbStatus(redemMapper.findRedemList(params));
	}

	// 상환현황 sum
	public HashMap<String, Object> findRedemAmountTotal(HashMap<String, Object> params){
		return redemMapper.findRedemAmountTotal(params);
	}

	public HashMap<String, Object> findRedemCountTotal(HashMap<String, Object> params) {
		return redemMapper.findRedemCountTotal(params);
	}

	// 기본정보, 상품정보
	public HashMap<String,Object> getRedemInfo(String mbid){
		HashMap<String,Object> resultMap = redemMapper.getRedemInfo(mbid);
		resultMap.put("main_acc",cbcComponent.toDecryption(String.valueOf(resultMap.get("main_acc"))));
		resultMap.put("demand_acc",cbcComponent.toDecryption(String.valueOf(resultMap.get("demand_acc"))));
		return resultMap;
	}


	//tab1 상환상세
	public ArrayList<HashMap<String, Object>> findRedemDetailList(HashMap<String, Object> paramMap) {
		String status = String.valueOf(paramMap.get("status"));
		if(status.equals("redem")) status = "상환";
		else if (status.equals("deposit")) status = "입금";
		else status = "";
		paramMap.put("status", status);
		return redemMapper.findRedemDetailList(paramMap);
	}

	public HashMap<String, Object> findRedemDetailSum(HashMap<String, Object> paramMap) {
		return redemMapper.findRedemDetailSum(paramMap);
	}

	//tab2 평가하기
	public List<HashMap<String,Object>> getEvalInfoList(HashMap<String,Object> params){
		List<HashMap<String, Object>> resultList = redemMapper.getEvalInfoList(params);
		resultList.forEach(this::convertEvalCode);
		return resultList;
	}

	private void convertEvalCode(HashMap<String,Object> map){
		String result = "";
		switch (String.valueOf(map.get("eval_subject"))){
			case "01": result= "신청"; break;
			case "02": result = "서류"; break;
			case "03": result = "심사"; break;
			case "06": result = "계약"; break;
			case "07": result = "상환"; break;
			case "71": result = "해지"; break;
		}
		map.put("eval_subject", result);
	}

	public int evalCountTotal(String mbid){
		return redemMapper.evalCountTotal(mbid);
	}

	public HashMap<String,Object> getEvalInfo(String evalNo) {
		return redemMapper.getEvalInfo(evalNo);
	}

	public void evalEnroll(HashMap<String,Object> params){
		redemMapper.evalEnroll(params);
	}

	public String updateStatus(HashMap<String,Object> params){
		String mbStatus = MbStatus.findByStatusNm(String.valueOf(params.get("status")));
		params.put("mb_status", mbStatus);
		cmmMapper.modifyMbStatus(params);

		if(mbStatus.equals("73")) {
			params.put("userType", "97");
			params.putAll(cmmMapper.findUserCodeByMBID(params));
			cmmMapper.modifyUserType(params);
		}

		return getMsg(String.valueOf(params.get("status")));
	}

	private String getMsg(String status){
		String result = "";
		if(status.equals(MbStatus.expi_stop.getMbStatus())) {
			result = "본인해지가 완료되었습니다";
		} else if (status.equals(MbStatus.expi_late_payment.getMbStatus())) {
			result = "강제해지가 완료되었습니다";
		}
		return result;
	}
}
