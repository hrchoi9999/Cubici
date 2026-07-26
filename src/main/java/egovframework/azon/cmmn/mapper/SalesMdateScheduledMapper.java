package egovframework.azon.cmmn.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface SalesMdateScheduledMapper {
	public ArrayList<HashMap<String, Object>> interparkSalesList();
	
	void interparkSalesExactUpdate(HashMap<String, Object> params);
	
	public ArrayList<HashMap<String, Object>> gmarketSalesList();
	
	void gmarketSalesExactUpdate(HashMap<String, Object> params);
	
	public ArrayList<HashMap<String, Object>> auctionSalesList();
	
	void auctionSalesExactUpdate(HashMap<String, Object> params);
	
	public ArrayList<HashMap<String, Object>> elevenSalesList();
	
	void elevenSalesExactUpdate(HashMap<String, Object> params);
	
	public ArrayList<HashMap<String, Object>> naverSalesList();
	
	void naverSalesExactUpdate(HashMap<String, Object> params);
	
	// 현재 미사용
	void insertLogScheduler(HashMap<String, Object> params);
	
	void insertLogError(HashMap<String, Object> params);
	
	public ArrayList<HashMap<String, Object>> ShopList();
}
