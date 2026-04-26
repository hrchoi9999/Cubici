package egovframework.azon.front.cubici.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.front.cubici.mapper.InfoSalesMapper;

/* 큐빅아이 매출정보 service
 * 2021. 02. 18
 * by KJC */
@Service
public class InfoSalesService {
	
	@Autowired
	InfoSalesMapper infoSalesMapper;
	
	// 매출 목록
	public ArrayList<HashMap<String, Object>> selectSalesList(HashMap<String, Object> params) {
		return infoSalesMapper.selectSalesList(params);
	}
	
	public ArrayList<HashMap<String, Object>> selectReturnList(HashMap<String, Object> params){
		return infoSalesMapper.selectReturnList(params);
	}
	
	// 반품교환 합계 목록 (MKC 2021.04.12)
	public ArrayList<HashMap<String, Object>> selectReturnSum(HashMap<String, Object> params, String division){
		
		ArrayList<HashMap<String, Object>> resultList = new ArrayList<HashMap<String, Object>>();
		
		ArrayList<HashMap<String, Object>> dataList = infoSalesMapper.selectReturnList(params);
		
		for(int i = 0; i<dataList.size(); i++) {
			
			if(dataList.get(i).get("DIVISION").equals(division)) {
				resultList.add(dataList.get(i));
			}
		}
		return resultList;
	}
	
}
