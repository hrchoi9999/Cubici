package egovframework.azon.admin.cubici.service;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.cubici.mapper.AdminBillingMapper;
import egovframework.azon.front.cubici.service.BillingService;

@Service
public class AdminBillingService {

	Logger logger = LoggerFactory.getLogger(AdminBillingService.class);
	
	@Autowired
	BillingService billingService;
	
	@Autowired
	private AdminBillingMapper adminBillingMapper;

	// 결제현황
	public ArrayList<HashMap<String, Object>> selectPaymentList(HashMap<String, Object> params) {	
		return adminBillingMapper.selectPaymentList(params);
	}
	
	// 합계
	public HashMap<String, Object> selectPaymentSumMap(HashMap<String, Object> params) {
		params.put("sum", true);
		return adminBillingMapper.selectPaymentList(params).get(0);
	}
	
	// 결제관리
	public ArrayList<HashMap<String, Object>> selectChangeChargeList(HashMap<String, Object> params) {
		return adminBillingMapper.selectChangeChargeList(params);
	}
	
	// 결제관리 - 환급 모달
	public HashMap<String, Object> selectRefundData(HashMap<String, Object> params) {
		return adminBillingMapper.selectRefundData(params);
	}
	
	// 결제관리 - 환급 완료
	public void updateRefundData(HashMap<String, Object> params) {
		adminBillingMapper.updateRefundData(params);
		adminBillingMapper.updateDetailData(params);
	}

	// 카드 취소
	public HashMap<String, Object> cancelCardPayment(HashMap<String, Object> params) {
		String imp_uid = String.valueOf(params.get("imp_uid"));
		BigDecimal amount = BigDecimal.valueOf(Integer.parseInt(String.valueOf(params.get("amount"))));
		HashMap<String, Object> resultMap = billingService.cancelPayment(imp_uid, amount);
		if(String.valueOf(resultMap.get("resultCode")).equals("0")) {
			logger.trace("[ 결제취소 성공 ] [ imp_uid : " + imp_uid + " ] ");
		} else if (String.valueOf(resultMap.get("resultCode")).equals("1")) {
			logger.trace("[ 결제취소 실패 ] [ " + String.valueOf(resultMap.get("result")) + " / imp_uid : " + imp_uid + " ] ");
		}
		return resultMap;
	}
}
