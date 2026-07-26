package egovframework.azon.front.cubici.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.front.cubici.mapper.InfoIntegratedMapper;

/* 큐빅아이 > 통합정보 서비스
 * 2021. 01. 18
 * by KJC */
@Service
public class InfoIntegratedService {

	@Autowired
	InfoIntegratedMapper infoIntegratedMapper;

	// 당월현황 - 매출액, 판매 수량
	public HashMap<String, Object> callSales(HashMap<String, Object> params) {
		return infoIntegratedMapper.callSales(params);
	}

	// 당월현황 - 정산입금액
	public HashMap<String, Object> callSettlement(HashMap<String, Object> params) {
		return infoIntegratedMapper.callSettlement(params);
	}

	// 당월현황 - 최근 1개월 판매추세(그래프)
	public ArrayList<HashMap<String, Object>> selectSalesGraph(HashMap<String, Object> params) {
		return infoIntegratedMapper.selectSalesGraph(params);
	}

	// 당월현황, 상품분석
	public ArrayList<HashMap<String, Object>> selectInvento(HashMap<String, Object> params) {
		return infoIntegratedMapper.selectInvento(params);
	}

}
