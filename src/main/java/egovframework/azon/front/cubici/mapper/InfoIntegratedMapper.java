package egovframework.azon.front.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

/* 큐빅아이 > 통합정보 mapper
 * 2021. 01. 18
 * by KJC */
@Mapper
public interface InfoIntegratedMapper {
	
	// 당월현황 - 매출액, 판매 수량
	public HashMap<String, Object> callSales(HashMap<String, Object> params);
	
	// 당월현황 - 정산입금액
	public HashMap<String, Object> callSettlement(HashMap<String, Object> params);
	
	// 당월현황 - 최근 1개월 판매추세(그래프)
	public ArrayList<HashMap<String, Object>> selectSalesGraph(HashMap<String, Object> params);
	
	// 당월현황, 상품분석
	public ArrayList<HashMap<String, Object>> selectInvento(HashMap<String, Object> params);
	
}
