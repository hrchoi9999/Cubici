package egovframework.azon.admin.cubici.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.cubici.mapper.AdminMoneyBankOpsMapper;

@Service
public class AdminMoneyBankOpsService {

	@Autowired
	AdminMoneyBankOpsMapper adminMoneyBankOpsMapper;
	
	//머니뱅크 운영 => 신청 접수
	public ArrayList<HashMap<String, Object>> selectRequestList(HashMap<String, Object> params) {
		
		ArrayList<HashMap<String, Object>> resultList = adminMoneyBankOpsMapper.selectRequestList(params);
		
		resultList.forEach( req -> {
			
			// 등록 쇼핑몰 개수
			int shopCount = req.get("REQUEST_SHOP").toString().split(",").length;
			req.put("SHOP_COUNT", shopCount);
			
			// 서류제출 여부
			req.put("REQ_DOCS", "Y");

			// 결제계좌 입력 여부
			req.put("SETTLE_ACCOUNT", "Y");
			
			// 신용정보
			req.put("CREDIT_AVERAGE", "Y");
			
			// 확인전화 여부
			req.put("CALL_CHECK", "Y");
			
		});
		
		return resultList;
	}
	
	// 머니뱅크 운영 => 신청 접수 합계
	public HashMap<String, Object> selectRequestSum(HashMap<String, Object> params) {
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		params.put("flag", "sum");
		ArrayList<HashMap<String, Object>> resultList = selectRequestList(params);
		
		int size = resultList.size();
		int totalSales = 0;
		int shopsAverage = 0;
		int salesAverage = 0;
		
		if(size > 0) {
		
			// 매출합계
			totalSales = resultList.stream()
							.mapToInt( req -> Integer.parseInt(req.get("SALES_AMOUNT").toString()) )
							.sum();
			
			// 매출평균
			salesAverage = totalSales/size;
						
			// 총 등록 쇼핑몰 수 구한 뒤 평균 산출
			int totalShops = resultList.stream()
							.mapToInt( req -> Integer.parseInt(req.get("SHOP_COUNT").toString()) )
							.sum();
			shopsAverage = totalShops/size;
				
		}
		
		resultMap.put("TOTAL_REQ", size);
		resultMap.put("TOTAL_AMOUNTS", totalSales);
		resultMap.put("SHOPCOUNT_AVG", shopsAverage);
		resultMap.put("SALE_AVG", salesAverage);
		
		return resultMap;
	}
	
	// 상환 이력
	public ArrayList<HashMap<String, Object>> selectMoneybankRepay (HashMap<String, Object> params){
		return adminMoneyBankOpsMapper.selectMoneybankRepay(params);
	}

	// 상환 현황리스트
//	public ArrayList<HashMap<String, Object>> selectMoneybankRepayDetail (HashMap<String, Object> params){
//		return adminMoneyBankOpsMapper.selectRepayHistory(params);
//	}
	
	// 상환 평가 입력
	public void insertRepayEval(HashMap<String, Object> params) {
		adminMoneyBankOpsMapper.insertRepayEval(params);
	}
	
	// 전화 확인 데이터 insert
//	public void insertConfirmTel(HashMap<String, Object> params) {
//		adminMoneyBankOpsMapper.insertConfirmTel(params);
//	}
	
	// 상세모달 확인 데이터 리스트
//	public ArrayList<HashMap<String, Object>> selectTelConfirmList(HashMap<String, Object> params) {
//		return adminMoneyBankOpsMapper.selectTelConfirmList(params);
//	}
	
	// 확인 데이터 추가
//	public HashMap<String, Object> selectInsertTelData(HashMap<String, Object> params) {
//		return adminMoneyBankOpsMapper.selectInsertTelData(params);
//	}

}
