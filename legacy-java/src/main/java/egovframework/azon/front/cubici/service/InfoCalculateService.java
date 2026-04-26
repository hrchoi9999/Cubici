package egovframework.azon.front.cubici.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.front.cubici.mapper.InfoCalculateMapper;

@Service
public class InfoCalculateService {
	
	Logger logger = LoggerFactory.getLogger(InfoCalculateService.class);
	
	@Autowired
	InfoCalculateMapper infoCalculateMapper;

	// 공휴일
	public ArrayList<HashMap<String, Object>> selectHoliday(HashMap<String, Object> params) {
		return infoCalculateMapper.selectHoliday(params);
	}
	
	// 정산 캘린더 - 정산 예정금 합계(주간, 월간)
	public HashMap<String, Object> sumCalculatePreList(HashMap<String, Object> params) {
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		// 월요일
		Calendar monday = Calendar.getInstance();
		monday.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
 		String mondayStr = sdf.format(monday.getTime());

 		// 일요일
 		Calendar sunday = Calendar.getInstance();
 		sunday.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
 		sunday.add(Calendar.DATE, 7); // sunday.DATE
 		String sundayStr = sdf.format(sunday.getTime());
 		
 		//System.out.println("이번주 월요일, 일요일 날짜 ::: "+mondayStr+" ~ "+sundayStr);
 		
 		int weeklySum = 0;
		int monthSum = 0;

		ArrayList<HashMap<String, Object>> resultList = infoCalculateMapper.selectCalculatePreList(params);
		
		try {
			Date startDate = sdf.parse(mondayStr);
			Date endDate = sdf.parse(sundayStr);

			for (int i = 0; i < resultList.size(); i++) {
				HashMap<String, Object> getData = resultList.get(i);
				monthSum += (int) Double.parseDouble(getData.get("SETTLEMENT_AMOUNT").toString());

				Date compareDate = sdf.parse(getData.get("SETTLEMENT_DATE").toString());
				// 해당 날짜가 이번주에 속하면 => 금주 정산예정 금액 계산
				if (startDate.compareTo(compareDate) <= 0 && endDate.compareTo(compareDate) >= 0) {
					//System.out.println("이번주 정산예정 날짜 ::: "+getData.get("SETTLEMENT_DATE").toString());
					weeklySum += (int) Double.parseDouble(getData.get("SETTLEMENT_AMOUNT").toString());
				} else {
					continue;
				}
			}
		} catch (ParseException e) {
			logger.error(e.getMessage()); 
		}

		HashMap<String, Object> resultMap = new HashMap<>();
		if(resultList == null || resultList.isEmpty()) {
			resultMap.put("totalCount", 0);
		} else if (resultList != null && resultList.size() > 0) {
			resultMap.put("totalCount", resultList.get(0).get("TOTAL_COUNT"));
		}
		resultMap.put("weeklySum", weeklySum);
		resultMap.put("monthSum", monthSum);
		return resultMap;
	}
	
	// 정산 입금액 목록
	public ArrayList<HashMap<String, Object>> selectSettlementList(HashMap<String, Object> params) {
		return infoCalculateMapper.selectSettlementList(params);
	}
	
	// 정산 예정금 목록
	public ArrayList<HashMap<String, Object>> selectCalculatePreList(HashMap<String, Object> params) {
		return infoCalculateMapper.selectCalculatePreList(params);
	}

	// 엑셀 합계 구하기 (MKC 2021.04.13 수정)
	public ArrayList<HashMap<String, Object>> setSumMapList(
			ArrayList<HashMap<String, Object>> settleList, ArrayList<HashMap<String, Object>> preList) {
			
		// 예정금을 result에 추가
		settleList.forEach( map -> {
			String thisShop = map.get("SHOP").toString();

			preList.forEach(preMap -> {
				if(thisShop.equals(preMap.get("SHOP").toString())) {
					map.put("PRE_SETTLE_AMOUNT", preMap.get("PRE_SETTLE_AMOUNT").toString());
				}
			});
		});
		return settleList;
	}
}
