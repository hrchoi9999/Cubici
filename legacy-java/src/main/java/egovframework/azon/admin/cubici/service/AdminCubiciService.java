package egovframework.azon.admin.cubici.service;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.cubici.mapper.AdminCubiciMapper;
import egovframework.azon.front.cubici.mapper.CubiciCmmMapper;
import egovframework.rte.fdl.cmmn.EgovAbstractServiceImpl;

@Service
public class AdminCubiciService extends EgovAbstractServiceImpl	{
	
	@Autowired
	private AdminCubiciMapper adminCubiciMapper;
	
	@Autowired
	private CubiciCmmMapper cubiciCmmMapper;
	
	/*** 큐빅아이 관리자 메인페이지 MKC 2020.11.19 ***/
	// 시간 설정
	public HashMap<String, Object> setThisMonthDate (){
		HashMap<String, Object> dateInfo = new HashMap<>();
		//*** 전일 날짜와 시간 찾기 (현황 표시 하는 기준 날짜)
		// 전일 일자
		Calendar dcal = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		dcal.add(Calendar.DATE, -1);
		String yesterDate = sdf.format(dcal.getTime());
		dateInfo.put("forDate", yesterDate);
		
		//*** 이번달 일자와 시간 (표시할 현황들의 범위)
		DecimalFormat df = new DecimalFormat("00");
		String thisYear = Integer.toString(dcal.get(Calendar.YEAR));
		String thisMonth = df.format(dcal.get(Calendar.MONTH)+1);
		String startDay = df.format(dcal.getMinimum(Calendar.DAY_OF_MONTH));
		String endDay = df.format(dcal.getActualMaximum(Calendar.DAY_OF_MONTH));		
		
		// 당월 시작일 일자
		String startDate = thisYear+"-"+thisMonth+"-"+startDay;
		dateInfo.put("fromDate", startDate);
		
		// 당월 마지막 일자
		String endDate = thisYear+"-"+thisMonth+"-"+endDay;
		dateInfo.put("toDate", endDate);
		
		return dateInfo;
	}
	
	/****** 통합정보 > 큐빅아이 > 종합지표 시작 ******/
	/****** 20210512 PHJ ******/
	// 날짜
	public HashMap<String, String> setDate() {
		HashMap<String, String> resultMap = new HashMap<String, String>();
		
		//금일~ 전월 날짜 설정
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Calendar cal = Calendar.getInstance();
		// 전일 기준
		cal.add(Calendar.DATE, -1);
		String thisYearMonth = sdf.format(cal.getTime()).substring(0, 7); // 연도 + 당월
		resultMap.put("yday", sdf.format(cal.getTime())); // 전일
		resultMap.put("thisMonthFirstDay", thisYearMonth + "-01"); // 당월 시작일
		resultMap.put("thisMonthLastDay", thisYearMonth + "-" + cal.getActualMaximum(Calendar.DAY_OF_MONTH)); // 당월 종료일
		// 전월 기준
		cal.add(Calendar.MONTH, -1);
		cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH));
		String lastYearMonth = sdf.format(cal.getTime()).substring(0, 7); // 연도 + 전월
		resultMap.put("lastMonthFirstDay", lastYearMonth + "-01"); // 전월 시작일
		resultMap.put("lastMonthLastDay", lastYearMonth + "-" + cal.get(Calendar.DAY_OF_MONTH)); // 전월 종료일	
		
		return resultMap;
	}
	
	// 상단 데이터
	public HashMap<String, Object> topData(HashMap<String, Object> param){
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		HashMap<String, String> dateMap = setDate();
		
		//금일
		param.put("fromDate", dateMap.get("yday"));
		param.put("toDate", dateMap.get("yday"));
		param.put("PARTNER", "");
		param.put("PRODUCT_TYPE", "");
		//신규회원
		ArrayList<HashMap<String, Object>> newMemMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("todayNewMem", newMemMap.get(0).get("COUNT").toString());
		//해지회원
		ArrayList<HashMap<String, Object>> wdMemMap = adminCubiciMapper.selectWdMemCount(param);
		resultMap.put("todayWdMem", wdMemMap.get(0).get("COUNT").toString());
		//매출금액
		ArrayList<HashMap<String, Object>> salesMap = adminCubiciMapper.selectSalesCount(param);
		if(salesMap.get(0).get("ORDER_PRICE").toString().equals("0") || salesMap.get(0).get("QUANTITY").toString().equals("0")) {
			resultMap.put("todaySales", "0");
			resultMap.put("todayQuantity", "0");
		} else {
			String todayPrice = salesMap.get(0).get("ORDER_PRICE").toString();
			resultMap.put("todaySales", Math.round(Integer.parseInt(todayPrice) / 100000));
			resultMap.put("todayQuantity", Integer.parseInt(salesMap.get(0).get("QUANTITY").toString()));
		}
		//정산금액
		ArrayList<HashMap<String, Object>> settlementMap = adminCubiciMapper.selectSettlement(param);
		ArrayList<HashMap<String, Object>> settlemenPretMap = adminCubiciMapper.selectSettlementPre(param);
		int todaySettlement = Integer.parseInt(settlementMap.get(0).get("SETTLEMENT_AMOUNT").toString());
		int todaySettlementPre = Integer.parseInt(settlemenPretMap.get(0).get("SETTLEMENT_AMOUNT").toString());
		String todayTotalSet = (todaySettlement + todaySettlementPre) + "";
		if(todayTotalSet.equals("0")) {
			resultMap.put("todaySetAmount", "0");
		} else {
			resultMap.put("todaySetAmount", Math.round(Integer.parseInt(todayTotalSet) / 100000));
		} 
		//SKU
		ArrayList<HashMap<String, Object>> SKUMap = adminCubiciMapper.selectCubiciSKUCount(param);
		if(SKUMap.size() != 0) {
			resultMap.put("todaySKU", SKUMap.get(0).get("COUNT"));
		}else {
			resultMap.put("todaySKU", "0");
		}
		
		
		//당월
		param.put("fromDate", dateMap.get("thisMonthFirstDay"));
		param.put("toDate", dateMap.get("thisMonthLastDay"));
		//신규회원
		ArrayList<HashMap<String, Object>> thisMonthNewMemMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("thisMonthNewMem", thisMonthNewMemMap.get(0).get("COUNT").toString());
		//해지회원
		ArrayList<HashMap<String, Object>> thisMonthWdMemMap = adminCubiciMapper.selectWdMemCount(param);
		resultMap.put("thisMonthWdMem", thisMonthWdMemMap.get(0).get("COUNT").toString());
		//매출금액
		ArrayList<HashMap<String, Object>> thisMonthSalesMap = adminCubiciMapper.selectSalesCount(param);
		String thisMonthPrice = thisMonthSalesMap.get(0).get("ORDER_PRICE").toString();
		resultMap.put("thisMonthSales", Math.round(Integer.parseInt(thisMonthPrice)/100000));
		resultMap.put("thisMonthQuantity", Integer.parseInt(thisMonthSalesMap.get(0).get("QUANTITY").toString()));
		//정산금액
		ArrayList<HashMap<String, Object>> thisMonthSettMap = adminCubiciMapper.selectSettlement(param);
		ArrayList<HashMap<String, Object>> thisMonthSetPretMap = adminCubiciMapper.selectSettlementPre(param);
		int thisMonthSettlement = Integer.parseInt(thisMonthSettMap.get(0).get("SETTLEMENT_AMOUNT").toString());
		int thisMonthSettlementPre = Integer.parseInt(thisMonthSetPretMap.get(0).get("SETTLEMENT_AMOUNT").toString());
		String thisMonthTotalSet = (thisMonthSettlement + thisMonthSettlementPre) + "";
		resultMap.put("thisMonthSetAmount", Math.round(Integer.parseInt(thisMonthTotalSet)/100000));
		//SKU
		ArrayList<HashMap<String, Object>> thisMonthSKUMap = adminCubiciMapper.selectCubiciSKUCount(param);
		resultMap.put("thisMonthSKU", thisMonthSKUMap.get(0).get("COUNT"));
		
		
		//전월
		param.put("fromDate", dateMap.get("lastMonthFirstDay"));
		param.put("toDate", dateMap.get("lastMonthLastDay"));
		//신규회원
		ArrayList<HashMap<String, Object>> lastMonthNewMemMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("lastMonthNewMem", lastMonthNewMemMap.get(0).get("COUNT").toString());
		//해지회원
		ArrayList<HashMap<String, Object>> lastMonthWdMemMap = adminCubiciMapper.selectWdMemCount(param);
		resultMap.put("lastMonthWdMem", lastMonthWdMemMap.get(0).get("COUNT").toString());
		//매출금액
		ArrayList<HashMap<String, Object>> lastMonthSalesMap = adminCubiciMapper.selectSalesCount(param);
		String lastMonthPrice = lastMonthSalesMap.get(0).get("ORDER_PRICE").toString();
		resultMap.put("lastMonthSales", Math.round(Integer.parseInt(lastMonthPrice)/100000));
		resultMap.put("lastMonthQuantity", Integer.parseInt(lastMonthSalesMap.get(0).get("QUANTITY").toString()));
		//정산금액
		ArrayList<HashMap<String, Object>> lastMonthSetMap = adminCubiciMapper.selectSettlement(param);
		ArrayList<HashMap<String, Object>> lastMonthSetPretMap = adminCubiciMapper.selectSettlementPre(param);
		int lastMonthSettlement = Integer.parseInt(lastMonthSetMap.get(0).get("SETTLEMENT_AMOUNT").toString());
		int lastMonthSettlementPre = Integer.parseInt(lastMonthSetPretMap.get(0).get("SETTLEMENT_AMOUNT").toString());
		String lastMonthTotalSet = (lastMonthSettlement + lastMonthSettlementPre) + "";
		resultMap.put("lastMonthSetAmount", Math.round(Integer.parseInt(lastMonthTotalSet)/100000));
		//SKU
		ArrayList<HashMap<String, Object>> lastMonthSKUMap = adminCubiciMapper.selectCubiciSKUCount(param);
		resultMap.put("lastMonthSKU", lastMonthSKUMap.get(0).get("COUNT"));
		
		return resultMap;
	}
	
	//회원가입 그래프
	public HashMap<String, Object> memChartData(HashMap<String, Object> param){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		//신규
		ArrayList<HashMap<String, Object>> newMemMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("newMemMap", newMemMap);
		//해지
		ArrayList<HashMap<String, Object>> wdMemMap = adminCubiciMapper.selectWdMemCount(param);
		resultMap.put("wdMemMap", wdMemMap);

		param.put("flag", "topData"); // fromData 이전일까지의 합
		ArrayList<HashMap<String, Object>> memTotalMap = adminCubiciMapper.selectNewMemCount(param);
		ArrayList<HashMap<String, Object>> wdMemTotalMap = adminCubiciMapper.selectWdMemCount(param);
		resultMap.put("memTotal", memTotalMap.get(0).get("TOTAL"));
		resultMap.put("wdMemTotal", wdMemTotalMap.get(0).get("TOTAL"));
		
		return resultMap;
	}
	//가입기간 그래프
	public HashMap<String, Object> regiPeriodData(HashMap<String, Object> param) throws ParseException {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		//큐빅아이 가입기간
		param.put("flag","cubici");
		ArrayList<HashMap<String, Object>> cubiciPeriodMap = adminCubiciMapper.selectUserRegiPeriod(param);
		resultMap.put("cubiciPeriodMap", cubiciPeriodMap);
		
		//머니뱅크 가입기간
		param.put("flag","moneybank");
		ArrayList<HashMap<String, Object>> moneyPeriodMap = adminCubiciMapper.selectUserRegiPeriod(param);
		resultMap.put("moneyPeriodMap", moneyPeriodMap);
		//큐빅아이 평균가입기간
		return resultMap;
	}
	//가입채널 그래프
	public HashMap<String, Object> regiPartnerData(HashMap<String, Object> param){
		
		HashMap<String, Object> resultMap = new HashMap<String,Object>();
		ArrayList<HashMap<String, Object>> partnerList = cubiciCmmMapper.selectPartner();
		

		param.put("PARTNER", "");
		ArrayList<HashMap<String, Object>> regiPartnerMap = adminCubiciMapper.selectRegiPartner(param);
		resultMap.put("regiPartnerMap", regiPartnerMap);
		
		for (int i =0; i<partnerList.size(); i++) {
			param.put("PARTNER", partnerList.get(i).get("FIRM_NO"));
			regiPartnerMap = adminCubiciMapper.selectRegiPartner(param);
			resultMap.put("regiPartnerMap" + i, regiPartnerMap);
		}
		return resultMap;
	}
	
	/****** 통합정보 > 큐빅아이 > 종합지표 종료 ******/
	

	/****** 통합정보 > 큐빅아이 > 매출지표 시작 ******/
	//매출현황 그래프
	public HashMap<String, Object> salesChartData(HashMap<String, Object> param){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		ArrayList<HashMap<String, Object>> salesMap = adminCubiciMapper.selectSalesCount(param);
		resultMap.put("salesMap", salesMap);

		ArrayList<HashMap<String, Object>> returnMap = adminCubiciMapper.selectReturnCount(param);
		resultMap.put("returnMap", returnMap);
		
		return resultMap;
	}
	
	//회원 평균 매출
	public HashMap<String, Object> avgSalesChartData(HashMap<String, Object> param) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		// 매출금액 
		ArrayList<HashMap<String, Object>> salesMap = adminCubiciMapper.selectSalesCount(param);
		resultMap.put("salesMap", salesMap);
		
		// 회원수
		ArrayList<HashMap<String, Object>> newMemMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("newMemMap", newMemMap);
		param.put("flag", "topData"); // fromData 이전일까지의 합
		ArrayList<HashMap<String, Object>> memTotalMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("memTotal", memTotalMap.get(0).get("TOTAL"));

		// sku수 (daily)
		ArrayList<HashMap<String, Object>> skuMap = adminCubiciMapper.selectCubiciSKUCount(param);
		resultMap.put("skuMap", skuMap);
		
		// sku수 ( 현재날짜 이전 )
		param.put("skuFlag", "preSum");
		ArrayList<HashMap<String, Object>> preSumSkuMap = adminCubiciMapper.selectCubiciSKUCount(param);
		resultMap.put("preSumSkuMap", preSumSkuMap);
		
		
		return resultMap;
	}
	
	//등록쇼핑몰
	public HashMap<String, Object> regiShopData(HashMap<String, Object> param) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		// 이전 합
		param.put("flag","sum");
		ArrayList<HashMap<String, Object>> sumMap = adminCubiciMapper.selectOperShopCount(param);
		resultMap.put("sumMap", sumMap);

		param.put("flag","total");
		ArrayList<HashMap<String, Object>> totalMap = adminCubiciMapper.selectOperShopCount(param);
		resultMap.put("totalMap", totalMap);
		
		// 날짜 별
		ArrayList<HashMap<String, Object>> regiShopMap = adminCubiciMapper.selectRegiShopCount(param);
		resultMap.put("regiShopMap", regiShopMap);
		
		// 회원수
		ArrayList<HashMap<String, Object>> newMemMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("newMemMap", newMemMap);
		param.put("flag", "topData"); // fromData 이전일까지의 합
		ArrayList<HashMap<String, Object>> memTotalMap = adminCubiciMapper.selectNewMemCount(param);
		resultMap.put("memTotal", memTotalMap.get(0).get("TOTAL"));

		
		return resultMap;
	}
	
	//쇼핑몰 판매 비교
	public HashMap<String, Object> shopSalesChartData(HashMap<String, Object> param) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		// 운영
		ArrayList<HashMap<String, Object>> operMap = adminCubiciMapper.selectOperShopCount(param);
		resultMap.put("operMap", operMap);
		
		//total 운영
		param.put("flag", "total");
		ArrayList<HashMap<String, Object>> operTotalMap = adminCubiciMapper.selectOperShopCount(param);
		resultMap.put("operTotalMap", operTotalMap);
		
		//total 매출
		param.put("flag", "topData");
		ArrayList<HashMap<String, Object>> totalMap = adminCubiciMapper.selectSalesCount(param);
		resultMap.put("totalMap", totalMap);
		
		//쇼핑몰 별 매출
		param.put("sortType", "shop");
		ArrayList<HashMap<String, Object>> shopSalestMap = adminCubiciMapper.selectSalesCount(param);
		resultMap.put("shopSalestMap", shopSalestMap);

		return resultMap;
	}
	
	//등록SKU수
	public HashMap<String, Object> skuChartData(HashMap<String, Object> param) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		HashMap<String, Object> userMap = adminCubiciMapper.selectUserCount();
		
		//전체
		ArrayList<HashMap<String, Object>> skuMap = adminCubiciMapper.selectCubiciSKUCount(param);
		resultMap.put("skuMap", skuMap);

		//오늘 이전까지의 데이터 (큐빅아이)
		param.put("skuFlag", "preSum");
		ArrayList<HashMap<String, Object>> preSumSkuMap = adminCubiciMapper.selectCubiciSKUCount(param);
		resultMap.put("preSumSkuMap", preSumSkuMap);	

		param.put("skuFlag", "avg");
		//큐빅아이평균
		String CUBICI_USER = userMap.get("CUBICI_USER").toString();
		param.put("COUNT", CUBICI_USER);  // 큐빅아이 회원수 
		
		ArrayList<HashMap<String, Object>> cubiciSkuMap = adminCubiciMapper.selectCubiciSKUCount(param);
		resultMap.put("cubiciSkuMap", cubiciSkuMap);

		//오늘 이전까지의 데이터 (머니뱅크)
		String MONEY_USER = userMap.get("MONEY_USER").toString();
		if(MONEY_USER.equals("0")) {
			param.put("COUNT", "0"); 
		}
		param.put("COUNT", MONEY_USER);
		param.put("skuFlag", "preSum");
		ArrayList<HashMap<String, Object>> preSumMbSkuMap = adminCubiciMapper.selectMbSKUCount(param);
		resultMap.put("preSumMbSkuMap", preSumMbSkuMap);

		//머니뱅크평균
		param.put("skuFlag", "avg");
		ArrayList<HashMap<String, Object>> moneySkuMap = adminCubiciMapper.selectMbSKUCount(param);
		resultMap.put("moneySkuMap", moneySkuMap);

		return resultMap;
	}
	
	/** 큐빅아이 메인페이지 상단 현황표  **/
	// 회원 정보 가져오기
	public ArrayList<HashMap<String, Object>> selectUsers(HashMap<String, Object>params) {
		return adminCubiciMapper.selectMemberData(params);
	}
	
	public ArrayList<HashMap<String, Object>> selectMemberInfo(HashMap<String, Object>params){
		return adminCubiciMapper.selectMemberInfo(params);
	}
	
	//** 그래프 데이터 **//
	//** 회원 그래프
	public ArrayList<HashMap<String, Object>> memberGraphData (HashMap<String, Object> params){
		return adminCubiciMapper.selectMemberData(params);
	}
	
	public ArrayList<HashMap<String, Object>> totalMemberCount(ArrayList<HashMap<String, Object>> paramList, int totalCount){
		
		ArrayList<HashMap<String, Object>> resultList = new ArrayList<HashMap<String, Object>>();
		
		int counter = totalCount;
		
		for(int i=0; i<paramList.size(); i++) {
			if(paramList.get(i).get("FLAG").equals("MEM")) {
				
				counter+=Integer.parseInt(paramList.get(i).get("MEM_COUNT").toString());
				HashMap<String, Object> memMap = new HashMap<String, Object>();
				memMap.put("COUNT", Integer.toString(counter));
				memMap.put("STD_DATE", paramList.get(i).get("REG_DATE").toString());
				resultList.add(i, memMap);
				
			}else if(paramList.get(i).get("FLAG").equals("WD")) {
				
				counter-=Integer.parseInt(paramList.get(i).get("MEM_COUNT").toString());
				HashMap<String, Object> wdMap = new HashMap<String, Object>();
				wdMap.put("COUNT", Integer.toString(counter));
				wdMap.put("STD_DATE", paramList.get(i).get("REG_DATE").toString());
				resultList.add(i, wdMap);
			}
		}
		return resultList;
	}
	
	//*** 관리자 페이지 END ***//
	
	/*** 지급요청 정보 가져오기 MKC 2020.11.24 (임시 위치로 이후 adminHellopayService로 이동) ***/
	// 지급요청 페이지 표시내용 가져오기
	public ArrayList<HashMap<String, Object>> selectAdvCalPaymentList(){
		return  adminCubiciMapper.selectAdvCalPaymentList();
	}
	// 지급요청 전달할 내용 가져오기
	public HashMap<String, Object> selectAdvCalPaySend(HashMap<String, Object> params){
		HashMap<String, Object> paymentList = adminCubiciMapper.selectAdvCalPaySend(params);
		
		return paymentList;
	}
	// 데이터 테이블에 저장
	public int insertPayment(HashMap<String, Object>params) {
		int result = adminCubiciMapper.insertPayment(params);
		return result;
	}
	/*** 지급요청 END ***/
	
	// 서비스 누적 데이터 by SMS
	public int cumulateUserData(HashMap<String, Object> params) {
		return adminCubiciMapper.cumulateUserData(params);
	}
	
	// 모달 머니뱅크 데이터 by SMS
	public ArrayList<HashMap<String, Object>> moneybankList(HashMap<String, Object> params) {
		return adminCubiciMapper.moneybankList(params);
	}
	// 해지 상세 by SMS
	public ArrayList<HashMap<String, Object>> selectWithdrawDetailList(HashMap<String, Object> params) {
		return adminCubiciMapper.selectWithdrawDetailList(params);
	}
	// 해지 확인 by SMS
	public void updateWithdraw(HashMap<String, Object> param) {
		adminCubiciMapper.updateWithdraw(param);
	}
	
	// 활동지표
	public ArrayList<HashMap<String, Object>> selectActivityIndicator(HashMap<String, Object> params){
		return adminCubiciMapper.selectActivityIndicator(params);
	}
}
