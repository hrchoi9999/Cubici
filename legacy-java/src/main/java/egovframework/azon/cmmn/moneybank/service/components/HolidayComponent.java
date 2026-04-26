package egovframework.azon.cmmn.moneybank.service.components;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.ibm.icu.util.ChineseCalendar;

@Component
public class HolidayComponent {
	
	/**
	 * @Title 공휴일 판별 후 다음 영업일 가져오는 FUNC
	 * @Explain 선지급 정산일 목요일부터 계산 시작
	 * @param 날짜("yyyy-MM-dd" 형식)
	 * @return String 형식으로 다음 영업일자
	 * @throws ParseException 
	*/
	public Date getDateAfterHoliday(String date) throws ParseException {
		
		// *** Setting *** //
		Date resultDate = new Date();
		String resultDateStr = "";
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd"); // function 안에서 자르기 편한 형식
	
		// 공휴일 Array 가져오기
		ArrayList<String> holidayArr = getHolidayDateArr(date);
		
		// tracker date ( 요청 날짜에서 시작 )
		Calendar cal = Calendar.getInstance();
		
		// date 형태로 넣어줘야됨
		String dateStr = date.replace("-", "");
		cal.set(Calendar.YEAR, Integer.parseInt(dateStr.substring(0, 4).toString()));
		cal.set(Calendar.MONTH, Integer.parseInt(dateStr.substring(4, 6).toString())-1);
		cal.set(Calendar.DAY_OF_MONTH, Integer.parseInt(dateStr.substring(6).toString()));
		
		// *** Calculate *** //
		// 더할 날짜 count
		int dateCnt = 0;
		// 날짜 MMdd 형식으로
		String dateMD = sdf.format(cal.getTime()).substring(4);
		
		// 루프 체크
		String dateFlag = "N";
		
		while(dateFlag.equals("N")) {
			
			// 공휴일 리스트에 해당 날짜가 있으면
			if(holidayArr.indexOf(dateMD) > 0) { 
				dateCnt+=1; // 다음날로 세야되고
			}else { // 공휴일 해당 아닌 경우
			
				// 해당날짜가
				if(cal.get(Calendar.DAY_OF_WEEK)==1) { // 일요일이면
					dateCnt+=1; // 하루를 더 세고
				}else if(cal.get(Calendar.DAY_OF_WEEK)==7) { // 토요일이면
					dateCnt+=2; // 이틀을 더 세며
				}else {
					dateFlag = "Y"; // 평일 & 영업일이라면 루프 끝내기
				}
			}
			
			if(dateCnt > 0) { // 앞으로 더해야할 날이 0일 이상이면
			
				// 날짜를 더해주고 카운트는 0으로 초기화 후 새로운 날짜 저장
				cal.add(Calendar.DATE, dateCnt);
				dateCnt-=dateCnt;
				dateMD = sdf.format(cal.getTime()).substring(4);
					
			}else if(dateCnt == 0){ // 앞으로 더해야할 날짜가 0이면 영업이란 뜻이니 빠져나감
				dateFlag = "Y";
			}
		}
		
		// 계산된 영업일자
		SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd"); // return 할 날짜 형식
		resultDateStr = sdfDate.format(cal.getTime());
		resultDate = sdfDate.parse(resultDateStr);
		
		return resultDate;
	}
	
	/**
	 * 특정 날짜가 있는 연도의 모든 공휴일 Array 생성
	 * 
	 * @Explain getDateAfterHoliday 함수를 서포트
	 * @param 날짜("yyyy-MM-dd" 형식)
	 * @return 공휴일 & 대체휴일 arraylist 반환
	 * @throws ParseException 
	*/
	public ArrayList<String> getHolidayDateArr(String dateFormat) throws ParseException {
		
		// *** Setting *** //
		// 파라미터 날짜의 연도
		String thisYear = dateFormat.replaceAll("-", "").substring(0, 4);
		// 모든 공휴일 array
		ArrayList<String> resultArr = new ArrayList<String>();
		
		
		// *** 대체공휴일 대상 아님 *** //
		// *** 양력 법정공휴일 Case
		resultArr.add("0101"); // 신정
		resultArr.add("0606"); // 현충일
		resultArr.add("0815"); // 광복절
		resultArr.add("1225"); // 성탄절
		// *** 음력 법정공휴일 Case ( 음력 공휴일은 양력으로 전환하여 저장 )
		// 음력 작년 말일 양력으로
		String lunarLastYearDate = getlastLunarToSolar(dateFormat);
		resultArr.add(lunarLastYearDate); // 설날 전날
		resultArr.add(getLunarToSolar(thisYear+"0102").substring(4)); // 설날 다음날
		resultArr.add(getLunarToSolar(thisYear+"0408").substring(4)); // 초파일
		resultArr.add(getLunarToSolar(thisYear+"0814").substring(4)); // 추석 전날
		resultArr.add(getLunarToSolar(thisYear+"0816").substring(4)); // 추석 다음날
		
		
		// *** 대체공휴일 대상 *** //
		// *** 양력 법정공휴일 Case
		resultArr.add("0301"); // 3.1절
		resultArr.add("0505"); // 어린이날
		resultArr.add("1003"); // 개천절
		resultArr.add("1009"); // 한글날
		// *** 음력 법정공휴일 Case ( 음력 공휴일은 양력으로 전환하여 저장 )
		// 음력 작년 말일 양력으로
		resultArr.add(getLunarToSolar(thisYear+"0101").substring(4)); // 설날 당일
		resultArr.add(getLunarToSolar(thisYear+"0815").substring(4)); // 추석 당일
		
		
		// *** 대체공휴일 추가 ( 설날, 추석, 어린이날, 3.1절, 광복절, 개천절, 한글날 ) *** //
		Calendar checkCal = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		
		int dayOfWk = 0;
		
		// 3.1절
		checkCal.setTime(sdf.parse(thisYear+"0301"));
		dayOfWk = checkCal.get(Calendar.DAY_OF_WEEK);
		if(dayOfWk == 7) { // 토요일
			resultArr.add("0303");
		}else if(dayOfWk == 1) { // 일요일
			resultArr.add("0302");
		}
		
		// 어린이날
		checkCal.setTime(sdf.parse(thisYear+"0505"));
		dayOfWk = checkCal.get(Calendar.DAY_OF_WEEK);
		if(dayOfWk == 7) { // 토요일
			resultArr.add("0507");
		}else if(dayOfWk == 1) { // 일요일
			resultArr.add("0506");
		}
		
		// 개천절
		checkCal.setTime(sdf.parse(thisYear+"1003"));
		dayOfWk = checkCal.get(Calendar.DAY_OF_WEEK);
		if(dayOfWk == 7) { // 토요일
			resultArr.add("1005");
		}else if(dayOfWk == 1) { // 일요일
			resultArr.add("1004");
		}
		
		// 한글날
		checkCal.setTime(sdf.parse(thisYear+"1009"));
		dayOfWk = checkCal.get(Calendar.DAY_OF_WEEK);
		if(dayOfWk == 7) { // 토요일
			resultArr.add("1011");
		}else if(dayOfWk == 1) { // 일요일
			resultArr.add("1010");
		}
		
		// 설날
		checkCal.setTime(sdf.parse(thisYear+getLunarToSolar(thisYear+"0101")));
		dayOfWk = checkCal.get(Calendar.DAY_OF_WEEK);
		if(dayOfWk == 7) { // 토요일
			resultArr.add(getLunarToSolar(thisYear+"0103").substring(4));
		}
		
		// 추석
		checkCal.setTime(sdf.parse(thisYear+getLunarToSolar(thisYear+"0815")));
		dayOfWk = checkCal.get(Calendar.DAY_OF_WEEK);
		if(dayOfWk == 7) { // 토요일
			resultArr.add(getLunarToSolar(thisYear+"0817").substring(4));
		}
		
		return resultArr;
	}
	
	/**
	 * 음력일자 양력으로 전환 FUNC
	 * 
	 * @Explain getHolidayDateArr 함수를 서포트
	 * @param 음력일자("yyyy-MM-dd" 형식)
	 * @return 해당 연도의 양력 전환 후 일자 반환
	*/
	public String getLunarToSolar(String dateParam) {
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		
		String yyyyMMdd = dateParam.replaceAll("-", "");
		
		if(yyyyMMdd == null || yyyyMMdd.equals("")) {
			return "undefined";
		}
		// 파라미터 날짜 파트별로 분해
		String lunarYr = yyyyMMdd.substring(0, 4);
		String lunarMth = yyyyMMdd.substring(4, 6);
		String lunarDay = yyyyMMdd.substring(6);
		
		// 음력 캘린더에 해당 날짜 저장
		ChineseCalendar lunarCal = new ChineseCalendar();
		lunarCal.set(ChineseCalendar.EXTENDED_YEAR, Integer.parseInt(lunarYr)+2637);
		lunarCal.set(ChineseCalendar.MONTH, Integer.parseInt(lunarMth)-1);
		lunarCal.set(ChineseCalendar.DAY_OF_MONTH, Integer.parseInt(lunarDay));
		
		// 양력 캘린더 생성하여 음력 캘린더 날짜를 전환
		Calendar solarCal = Calendar.getInstance();
		solarCal.setTimeInMillis(lunarCal.getTimeInMillis());
		String newSolarDate = sdf.format(solarCal.getTime());
		
		return newSolarDate;
	}
	
	/** 
	 * 작년 마지막 음력일자 양력으로 가져오기 FUNC
	 * 
	 * @Explanation 상단의 getHolidayDateArr 함수에서 음력 말일 계산을 위해 사용하는 함수. 
	 * 				음력의 말일은 29일 or 30일을 번갈아감.
	 * @param 날짜("yyyy-MM-dd" 형식)
	 * @return 해당 연도 기준 작년 말일을 양력날짜로 반환
	*/
	public String getlastLunarToSolar(String dateParam) {
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		
		String yyyyMMdd = dateParam.replaceAll("-", "");
		
		// 파라미터 날짜 파트별로 분해
		String thisYear = yyyyMMdd.substring(0, 4);
		String thisMonth = yyyyMMdd.substring(4, 6);
		String thisDay = yyyyMMdd.substring(6);
		
		//음력 말일을 구해도 계산상 의미 있는 것은 금년 날짜이므로 2월 이전이면 6월로 설정
		if(Integer.parseInt(thisMonth)<=2) {
			thisMonth = "06";
		}
		
		// 정확한 date 위해 양력 캘린더 설정
		Calendar solarCal = Calendar.getInstance();
		solarCal.set(Calendar.YEAR, Integer.parseInt(thisYear));
		solarCal.set(Calendar.MONTH, Integer.parseInt(thisMonth)-1);
		solarCal.set(Calendar.DAY_OF_MONTH, Integer.parseInt(thisDay));
		
		// 해당 날짜 음력캘린더에 세팅
		ChineseCalendar lunarCal = new ChineseCalendar();
		lunarCal.setTimeInMillis(solarCal.getTimeInMillis());
		
		// 작년 말일 구하고 리턴
		lunarCal.set(ChineseCalendar.DAY_OF_YEAR, 1);
		lunarCal.add(ChineseCalendar.DATE, -1);
		
		String resultStr = sdf.format(lunarCal.getTime()).substring(4);
		
		return resultStr;
	}

}
