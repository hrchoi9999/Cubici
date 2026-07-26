package egovframework.azon.front.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface InfoSalesMapper {
	
	// 매출 목록
	public ArrayList<HashMap<String, Object>> selectSalesList(HashMap<String, Object> params);
	
	// 반품 목록
	public ArrayList<HashMap<String, Object>> selectReturnList(HashMap<String, Object> params);
	
}
