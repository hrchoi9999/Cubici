package egovframework.azon.cmmn.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

import egovframework.azon.cmmn.mapper.SalesMdateScheduledMapper;

@Service
public class SalesMdateScheduledService {
	
	@Autowired
	SalesMdateScheduledMapper salesmdatescheduledmapper;
	
	Logger logger = LoggerFactory.getLogger(SalesMdateScheduledService.class);
	
	private StopWatch stopwatch = new StopWatch();

	//@Scheduled(cron = "0 0,30 * * * *")
	public void Shop_sales_mdate_col() {
		stopwatch = new StopWatch();
		
		ArrayList<HashMap<String, Object>> resultLog = new ArrayList<HashMap<String, Object>>(); // 결과 로그 리스트
		
		ArrayList<HashMap<String,Object>> shopResult = ShopList(); // SHOP 리스트 출력
		int shopResultLength = shopResult.size();
		
		// SHOP 별로 COL추가작업 
		for(int i = 0; i < shopResultLength; i++) {
			HashMap<String, Object> rowData = shopResult.get(i);
			resultLog.add(shopSalesResult(rowData.get("SHOP_CODE").toString(), rowData.get("SHOP_NAME").toString()));//결과 리스트에 저장
		}
		
		int resultLogLength = resultLog.size();

		for(int i = 0; i < resultLogLength; i++) {
			// 성공 여부에 따른 LOG INSERT
			if(resultLog.get(i).get("successYN").equals("N")) {
				salesmdatescheduledmapper.insertLogError(resultLog.get(i));
			}
		}
		logger.trace(stopwatch.prettyPrint());
	}
	
	// SHOP EXACT UPDATE
	private HashMap<String, Object> shopSalesResult(String SHOP_CODE, String SHOP_NAME) {
		
		logger.trace("[" + SHOP_NAME + " 최종 정산 예정일 칼럼] [시작]");
		stopwatch.start(SHOP_NAME); // 시간 체크
		String ResultName = "[" + SHOP_NAME + " 최종 정산 예정일 칼럼] [성공]";
		StringBuilder ResultCause = new StringBuilder("LOG : ,");
		int ExactNullCount = 0; //ERROR 갯수 체크
		int count = 0; // 갯수 체크
		int runtime = (int) Math.round(stopwatch.getTotalTimeSeconds()); // 시간 체크
		HashMap<String, Object> resultparam = new HashMap<>(); // 로그 리턴
		
		try {
			ArrayList<HashMap<String, Object>> resultList = SalesResultSelect(SHOP_CODE); // CODE에 따른 쇼핑몰 리스트 값 
			int resultListLength = resultList.size(); 
			
			for(int i = 0; i < resultListLength; i++) {
				HashMap<String, Object> rowData = resultList.get(i);
				
				if (rowData.get("EXACT_DATE_VAL") == null || (String.valueOf(rowData.get("EXACT_DATE_VAL"))).length() == 0) {
					// 첫 NULL 찾을 시 실패 변경
					if (ExactNullCount == 0) {
						ResultCause.deleteCharAt(ResultCause.lastIndexOf(",")); // BUILDER 마지막 "," 삭제
						ResultName = "[" + SHOP_NAME + " 최종 정산 예정일 칼럼] [일부 실패]";
					}
					ResultCause.append(rowData.get("ORDER_NO").toString());
					ResultCause.append(",");
					ExactNullCount++;
				}else {
					count++; // 성공 갯수 체크
					SalesResultUpdate(rowData, SHOP_CODE); // DATA와 CODE로 UPDATE SQL 실행
				}
			}
		}catch(Exception e) {
			ResultCause.delete(0,ResultCause.length()); // try문 오류시 Builder 초기화
			ResultCause.append("[ 최종 정산 예정일 ] [ " + SHOP_NAME + " ] [ Exception ]");
			ResultName = "[" + SHOP_NAME + " 최종 정산 예정일 칼럼] [실패]";
			logger.error(SHOP_NAME + " SALES 에러 ::: ", e.getMessage());
		}finally {
			logger.trace("[ 최종 정산 예정일 ][ " + SHOP_NAME + " ] 끝 ::: " + ResultCause + " COUNT ::: (" + count + ")  ExactNullCount ::: (" + ExactNullCount + ")");
			stopwatch.stop();
			runtime = (int) Math.round(stopwatch.getTotalTimeSeconds()) - runtime; // 시간체크 결과 값
			ResultCause.deleteCharAt(ResultCause.lastIndexOf(",")); // BUILDER 마지막 "," 삭제
			resultparam = insertLogHashmap(SHOP_CODE, SHOP_NAME, ResultName, ResultCause.toString(), runtime);
		}
		return resultparam;
	}
	
	// SHOP LIST SELECT 문
	private ArrayList<HashMap<String, Object>> SalesResultSelect(String SHOP_CODE){
		ArrayList<HashMap<String, Object>> resultList = new ArrayList<HashMap<String, Object>>();
		switch (SHOP_CODE) {
			case "1":resultList = salesmdatescheduledmapper.interparkSalesList();
				break;
			case "2":resultList = salesmdatescheduledmapper.gmarketSalesList();
				break;
			case "3":resultList = salesmdatescheduledmapper.auctionSalesList();
				break;
			case "4":resultList = salesmdatescheduledmapper.elevenSalesList();
				break;
			case "14":resultList = salesmdatescheduledmapper.naverSalesList();
				break;
		}
		return resultList;
	}
	
	// COL UPDATE 문
	private void SalesResultUpdate(HashMap<String, Object> rowData, String SHOP_CODE){
		switch (SHOP_CODE) {
			case "1":salesmdatescheduledmapper.interparkSalesExactUpdate(rowData);
				break;
			case "2":salesmdatescheduledmapper.gmarketSalesExactUpdate(rowData);
				break;
			case "3":salesmdatescheduledmapper.auctionSalesExactUpdate(rowData);
				break;
			case "4":salesmdatescheduledmapper.elevenSalesExactUpdate(rowData);
				break;
			case "14":salesmdatescheduledmapper.naverSalesExactUpdate(rowData);
				break;
		}
	}
	
	// LOG 셋팅
	private HashMap<String, Object> insertLogHashmap(String shoptype, String shopname, String ResultName, String ResultCause, int runtime){
		HashMap<String, Object> Logparam = new HashMap<>();
		String successYN = "N";
		
		if(ResultName.indexOf("[성공]") != -1) {
			successYN = "Y";
		}
		
		Logparam.put("successYN", successYN);
		Logparam.put("SHOP_TYPE", shoptype);
		Logparam.put("SHOP_NM", shopname);
		Logparam.put("SCHEDULED_NAME", ResultName);
		Logparam.put("CAUSE", ResultCause);
		Logparam.put("RUNTIME", runtime);
		
		return Logparam;
	}
	
	//CBCI_CODE에서 추출 원하는 쇼핑몰 SQL 쿼리에서 수정
	private ArrayList<HashMap<String, Object>> ShopList(){
		ArrayList<HashMap<String, Object>> ShopListResult = salesmdatescheduledmapper.ShopList();
		return ShopListResult;
	}
}
