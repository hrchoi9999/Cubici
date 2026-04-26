package egovframework.azon.admin.cubici.service;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.cubici.mapper.AdminMoneyBankMapper;
import egovframework.azon.admin.cubici.mapper.AdminUserSupportMapper;
import egovframework.azon.admin.cubici.web.AdminMoneyBankController;

/* 큐빅아이 관리자 메인
 * 수정 2021. 06. 04.
 * by MKY */

@Service
public class AdminMoneyBankService {
	
	Logger logger = LoggerFactory.getLogger(AdminMoneyBankController.class);
	
	@Autowired
	private AdminMoneyBankMapper adminMoneyBankMapper ;
	
	//상단에 누적 값을 가져옴
	public HashMap<String, Object> MoneyBankAccumulateValue(HashMap<String, Object> param) {
		
		HashMap<String, Object> paramMap = adminMoneyBankMapper.MoneyBankAccumulateValue(param);
		//백만원 소숫점 첫째자리까지 치환
		paramMap.put("MONEYBANK_TODAY_SERVICE", Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_TODAY_SERVICE").toString())/100000))/10);
		paramMap.put("MONEYBANK_ACCUM_SERVICE", Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_ACCUM_SERVICE").toString())/100000))/10);
		paramMap.put("MONEYBANK_TODAY_PRIN", Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_TODAY_PRIN").toString())/100000))/10);
		paramMap.put("MONEYBANK_ACCUM_PRIN", Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_ACCUM_PRIN").toString())/100000))/10);
		paramMap.put("MONEYBANK_ACCUM_BALANCE",  Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_ACCUM_BALANCE").toString())/100000))/10);
		
		return paramMap;
	}
	
	//머니뱅크 회원 현황 차트
	public ArrayList<HashMap<String, Object>> MoneyBankUserChart(HashMap<String, Object> param){
		return adminMoneyBankMapper.MoneyBankUserChart(param);
	}
	
	//머니뱅크 이용 현황 차트
	public ArrayList<HashMap<String, Object>> MoneyBankUsageChart(HashMap<String, Object> param){
		return adminMoneyBankMapper.MoneyBankUsageChart(param);
	}
	
	//머니뱅크 서비스 이용률 차트
	public ArrayList<HashMap<String, Object>> MoneyBankServiceChart(HashMap<String, Object> param){
		return adminMoneyBankMapper.MoneyBankServiceChart(param);
	}
	
	//머니뱅크 운영지표 상단값
	public HashMap<String, Object> MoneyBankOperationValue(HashMap<String, Object> param) {
		HashMap<String, Object> paramMap = adminMoneyBankMapper.MoneyBankOperationValue(param);
		//머니뱅크 운영지표 상단 값
		paramMap.put("MONEYBANK_TODAY_PRIN", Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_TODAY_PRIN").toString())/100000))/10);
		paramMap.put("MONEYBANK_ACCUM_BALANCE",  Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_ACCUM_BALANCE").toString())/100000))/10);
		paramMap.put("MONEYBANK_FEE", Double.valueOf(Math.round(Double.valueOf(paramMap.get("MONEYBANK_FEE").toString())/100000))/10);

		return paramMap;
	}
	//머니뱅크 운영건수 카운트
	public int MoneyBankOperationCount(HashMap<String, Object> param){
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		ArrayList<HashMap<String, Object>> MoneyBankOperationCount = adminMoneyBankMapper.MoneyBankOperationCount(param);
		int OperationCount = 0;
		try {
			// 운영건수 날짜비교로 운영건수 값 가져오기
			if(!MoneyBankOperationCount.isEmpty()) {
				Date appDay = null;
				Date expDay = null;
				Date toDay = dateFormat.parse(param.get("toDate").toString());
				
				for(int i=0; i < MoneyBankOperationCount.size(); i++) {
					HashMap<String, Object> OperMap = MoneyBankOperationCount.get(i);
					
					appDay = dateFormat.parse(OperMap.get("APPROVAL_DATE").toString());
					expDay = dateFormat.parse(OperMap.get("EXPIRATION_DATE").toString());
					
					int compareApp = appDay.compareTo(toDay);
					int compareExp = expDay.compareTo(toDay);
					if(compareApp <= 0 && compareExp >= 0) {
						OperationCount += 1;
					}
				}
			}
		}catch (Exception ex) {
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/moneybank_tab2 ] " + ex.getMessage());
		}
		return OperationCount;
	}
	
	//운영지표 차트(누적 계약)
	public ArrayList<HashMap<String, Object>> MoneyBankContractChart(HashMap<String, Object> param){
		return adminMoneyBankMapper.MoneyBankContractChart(param);
	}
	
	//운영지표 차트(수수료 및 상환누적)
	public ArrayList<HashMap<String, Object>> MoneyBankRepaymentChart(HashMap<String, Object> param){
		return adminMoneyBankMapper.MoneyBankRepaymentChart(param);
	}
	
	
	// ***** 머니뱅크 관리 NAVI-TAB (MKC 2021.05.30) ***** //
	// 머니뱅크 상단현황 데이터
	public HashMap<String, Object> getMainInfo(HashMap<String, Object> params) {
		
		// 데이터 Map 가져오기
		ArrayList<HashMap<String, Object>> resultList = adminMoneyBankMapper.selectMainInfo(params);
		HashMap<String, Object> resultMap = resultList.get(0);
		
		return resultMap;
	}
	
	// 머니뱅크 관리 > 현황종합 그래프 데이터 가져오기
	public ArrayList<HashMap<String, Object>> getGraphData(HashMap<String, Object> params){
		return adminMoneyBankMapper.selectMemberGraphData(params);
	}
	
	// 머니뱅크 관리 > 운영지표 상단 데이터 가져오기
	public HashMap<String, Object> getOperationInfo(HashMap<String, Object> params){
		
		// 데이터 Map 가져오기
		ArrayList<HashMap<String, Object>> resultList = adminMoneyBankMapper.selectOperationInfo(params);
		HashMap<String, Object> resultMap = resultList.get(0);
		
		return resultMap;
	}
	
	// 머니뱅크 관리 > 운영지표 그래프 데이터 가져오기
	public ArrayList<HashMap<String, Object>> getOperationGraphData(HashMap<String, Object> params){
		return adminMoneyBankMapper.selectOperationGraphData(params);
	}
	
	// 머니뱅크 관리 > 이용상세 데이터 가져오기
	public ArrayList<HashMap<String, Object>> getMoneybankDetails(HashMap<String, Object> params){
		return adminMoneyBankMapper.selectMoneybankDetail(params);
	}
	
	// 이용상세 합계 리스트
	public HashMap<String, Object> getMoneybankDetailSum(HashMap<String, Object> params) {
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		params.put("flag", "sum");
		ArrayList<HashMap<String, Object>> resultList = adminMoneyBankMapper.selectMoneybankDetail(params);
		resultMap = resultList.get(0);
		
		return resultMap;
	}
	
	// 시간 설정하기 ( 필요한 날짜는 3개 )
	public HashMap<String, Object> getTimeInfo(){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
				
		Calendar thisMonth = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		DecimalFormat df = new DecimalFormat("00");
		
		// 전일 날짜
		thisMonth.add(Calendar.DATE, -1);
		String yesterDate = sdf.format(thisMonth.getTime());
		resultMap.put("yesterDate", yesterDate);
		
		// 전일 포함 달 첫째날
		String thisYearStr = Integer.toString(thisMonth.get(Calendar.YEAR));
		String thisMonthStr = df.format(thisMonth.get(Calendar.MONTH)+1);
		String thisDayStr = df.format(thisMonth.getActualMinimum(Calendar.DAY_OF_MONTH));
		String startDate = thisYearStr+"-"+thisMonthStr+"-"+thisDayStr;
		resultMap.put("startDate", startDate);
		
		// 전일로부터 한달 전 일자
		thisMonth.add(Calendar.DATE, -30);
		String lastYearStr = Integer.toString(thisMonth.get(Calendar.YEAR));
		String lastMonthStr = df.format(thisMonth.get(Calendar.MONTH) + 1);
		String lastDayStr = df.format(thisMonth.getActualMaximum(Calendar.DAY_OF_MONTH));
		String beforeDate = lastYearStr + "-" + lastMonthStr + "-" + lastDayStr;
		resultMap.put("beforeDate", beforeDate);
		
		return resultMap;
	}
	// ***** 머니뱅크 관리 NAVI-TAB END ***** //
	
}
