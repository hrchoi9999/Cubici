package egovframework.azon.front.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

/* 큐빅아이 > 정산정보 mapper
 * 2021. 01. 18
 * by KJC */
@Mapper
public interface InfoCalculateMapper {
	
	// 공휴일
	public ArrayList<HashMap<String, Object>> selectHoliday(HashMap<String, Object> params);
	
	// 캘린더 > 정산 예정금
	public ArrayList<HashMap<String, Object>> calendarCalculatePre(HashMap<String, Object> params);
	
	// 정산 캘린더 - 정산 입금액
	public ArrayList<HashMap<String, Object>> selectSettlementList(HashMap<String, Object> params);
	
	// 정산 예정금 목록
	public ArrayList<HashMap<String, Object>> selectCalculatePreList(HashMap<String, Object> params);
}
