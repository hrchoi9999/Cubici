package egovframework.azon.admin.moneybank.operation.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;

import egovframework.azon.admin.moneybank.operation.mapper.CmmMapper;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.MoneyBankException;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.moneybank.operation.mapper.JudgeMapper;

@Service
public class JudgeService {

	@Autowired
	CmmService cmmService;

	@Autowired
	JudgeMapper judgeMapper;

	@Autowired
	CmmMapper cmmMapper;

	public ArrayList<HashMap<String, Object>> loadApprovalList(HashMap<String, Object> paramMap) {
		String status = String.valueOf(paramMap.get("selectDocSearch"));

		paramMap.put("status", findMbStatus(status));
		paramMap.put("adj_yn", findAdjYn(status));

		return cmmService.modifyDataByMbStatus(judgeMapper.loadApprovalList(paramMap));
	}

	private String findMbStatus(String param) {
		String result = "'03', '04', '05', '41'";
		if (param.equals("wait")) {
			result = "'03'";
		} else if (param.equals("accept") || param.equals("adjust")) {
			result = "'04', '05'";
		} else if (param.equals("refuse")) {
			result = "'41'";
		}
		return result;
	}

	private String findAdjYn(String param) {
		String result = "'Y', 'N'";
		if (param.equals("accept")) {
			result = "'N'";
		} else if (param.equals("adjust")) {
			result = "'Y'";
		}
		return result;
	}

	public HashMap<String, Object> approvalCount(HashMap<String, Object> paramMap) {
		return judgeMapper.approvalCount(paramMap);
	}

	public HashMap<String, Object> loadApprovalDetail(String mbid) {
		HashMap<String, Object> detailMap = judgeMapper.loadApprovalDetail(mbid);
		detailMap.put("shop_list", judgeMapper.findByRequestShops(mbid));
		String mbStatus = String.valueOf(detailMap.get("mb_status"));
		detailMap.put("mb_status", MbStatus.findByMbStatus(mbStatus).getMbStatusName());
		return judgeMapper.loadApprovalDetail(mbid);
	}

	public ArrayList<HashMap<String, Object>> getHistoryOfUsage(HashMap<String, Object> paramMap) {
		ArrayList<HashMap<String, Object>> mbHistoryOfUsage = judgeMapper.getHistoryOfUsage(cmmMapper.findUserCodeByMBID(paramMap));
		mbHistoryOfUsage.forEach(v -> v.put("service_period",
				calculateMonth(String.valueOf(v.get("contract_date")), String.valueOf(v.get("expire_date")))));
		return mbHistoryOfUsage;
	}

	private String calculateMonth(String startDate, String endDate) {
		if(startDate.equals("null") || endDate.equals("null")) {
			return "0";
		}
		return String.valueOf(ChronoUnit.MONTHS.between(LocalDate.parse(startDate), LocalDate.parse(endDate)));
	}

	public void inputAdjustment(HashMap<String, Object> paramMap){
		String adjFeeRate = String.valueOf(paramMap.get("adj_fee_rate"));
		String adjPaymentRate = String.valueOf(paramMap.get("adj_payment_rate"));
		String adjSalesLimitPerCase = String.valueOf(paramMap.get("adj_sales_limit_per_case"));
		String adjReason = String.valueOf(paramMap.get("adj_reason"));
		String adjYn = "";

		if(adjFeeRate.equals("") || adjFeeRate.equals("null")) {
			adjFeeRate = "0";
		}

		if(adjPaymentRate.equals("") || adjPaymentRate.equals("null")) {
			adjPaymentRate = "0";
		}

		if(adjSalesLimitPerCase.equals("") || adjSalesLimitPerCase.equals("null")) {
			adjSalesLimitPerCase = "0";
		}else if(adjSalesLimitPerCase != null) {
			adjSalesLimitPerCase += "000";
		}

		if(adjReason.equals("") || adjReason.equals("null")) {
			adjYn = "N";
		} else {
			adjYn = "Y";
		}

		paramMap.put("adj_fee_rate", adjFeeRate);
		paramMap.put("adj_payment_rate", adjPaymentRate);
		paramMap.put("adj_sales_limit_per_case",Integer.parseInt(adjSalesLimitPerCase));
		paramMap.put("adj_yn", adjYn);

		judgeMapper.inputAdjustment(paramMap);
	}

	public void modifyMbStatus(HashMap<String, Object> paramMap) {
		cmmMapper.modifyMbStatus(paramMap);
	}

	public ArrayList<HashMap<String, Object>> loadContractList (HashMap<String, Object> paramMap){
		String status = String.valueOf(paramMap.get("selectDocSearch"));
		paramMap.put("status", MbStatus.findByStatusNm(status));
		return cmmService.modifyDataByMbStatus(judgeMapper.loadContractList(paramMap));
	}

	public HashMap<String, Object> contractCount(HashMap<String, Object> paramMap) {
		return judgeMapper.contractCount(paramMap);
	}

	public void makeContract(String mbid) {
		HashMap<String, Object> detail = judgeMapper.loadApprovalDetail(mbid);
		if(String.valueOf(detail.get("mb_status")).equals("05")) {
			detail.put("mb_status", "81");
			cmmMapper.modifyMbStatus(detail);
		} else {
			throw new IllegalStateException("이용자가 이용조건에 동의하지 않았습니다. 이용자가 동의 후 계약을 체결할 수 있습니다.");
		}
	}
}
