package egovframework.azon.admin.cubici.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.cubici.mapper.MBReqShopMapper;
import egovframework.azon.admin.moneybank.operation.mapper.ReqMapper;
import egovframework.azon.admin.moneybank.operation.service.ReqService;
import egovframework.azon.front.cubici.service.CubiciCmmService;

@Service
public class MBReqShopService {

	@Autowired
	ReqService adminMBReqService;
	
	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	MBReqShopMapper MBReqShopMapper;
	
	@Autowired
	ReqMapper adminMBReqMapper;
	

	String demand_acc_no_origin = "";
	String demand_acc_no_first = "";
	String demand_acc_no_second = "";

	
	public ArrayList<HashMap<String, Object>> getMBReqCompleteShopList(HashMap<String, Object> params){
		ArrayList<HashMap<String, Object>> shopList = MBReqShopMapper.getMBRequestShopList(params);
		return shopList;
	}
	
	public ArrayList<HashMap<String, Object>> getMBRequestShopList(HashMap<String, Object> params){
		ArrayList<HashMap<String, Object>> shopList = MBReqShopMapper.getMBRequestShopList(params);
		HashMap<String, Object> changeResultMap = isReqeustShopAccChange(params);
		for(int i=0; i<shopList.size(); i++) {
			shopList.get(i).put("result", changeResultMap.get(String.valueOf(shopList.get(i).get("SHOP_TYPE"))));
		}
		return shopList;
	}
	
	public String getShopAccChangeResult(HashMap<String, Object> params) {
		HashMap<String, Object> changeResultMap = isReqeustShopAccChange(params);
		String result = "N";
		for(int i=0; i<changeResultMap.size(); i++) {
			result = changeResultMap.containsValue("N") ? "N" : "Y";
		}
		return result;
	}
	
	private HashMap<String, Object> isReqeustShopAccChange(HashMap<String, Object> params) {
		ArrayList<HashMap<String, Object>> shopList = MBReqShopMapper.getMBRequestShopList(params);
		
		HashMap<String, Object> accInfoMap = adminMBReqMapper.selectMBRequestDetail(params);
		HashMap<String, Object> shopIdMap = cubiciCmmService.inUserShop(String.valueOf(accInfoMap.get("USER_CODE")));
		demand_acc_no_origin = String.valueOf(accInfoMap.get("mb_demand_acc_number"));
		params.put("request_date", String.valueOf(accInfoMap.get("mb_request_date")));
		
		ArrayList<HashMap<String, Object>> shopAccList = new ArrayList<HashMap<String,Object>>();
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String shopType = "";
		String shopId = "";
		
		for(int i=0; i<shopList.size(); i++) {
			
			shopType = String.valueOf(shopList.get(i).get("SHOP_TYPE"));
			shopId = String.valueOf(shopIdMap.get("SHOP_"+shopType));
			params.put("shop_id", shopId);
			
			switch(shopType) {
			case "1" :
				shopAccList = MBReqShopMapper.getInterparkAccInfo(params);
				demand_acc_no_first = demand_acc_no_origin;
				break;
			case "11" :
				shopAccList = MBReqShopMapper.getCoupangAccInfo(params);
				demand_acc_no_first = demand_acc_no_origin.substring(0, 6);
				break;
			case "14" :
				shopAccList = MBReqShopMapper.getNaverAccInfo(params);
				demand_acc_no_first = demand_acc_no_origin.substring(0, demand_acc_no_origin.length() - 8);
				break;
			case "2" :
				shopAccList = MBReqShopMapper.getGmarketAccInfo(params);
				demand_acc_no_first = demand_acc_no_origin.substring(2);
				break;
			case "3" :
				shopAccList = MBReqShopMapper.getAuctionAccInfo(params);
				demand_acc_no_first = demand_acc_no_origin.substring(0, 2);
				demand_acc_no_second = demand_acc_no_origin.substring(demand_acc_no_origin.length() - 3, demand_acc_no_origin.length());
				break;
			case "4" :
				shopAccList = MBReqShopMapper.get11stAccInfo(params);
				demand_acc_no_first = demand_acc_no_origin;
				break;			
			}

			resultMap.put(shopType, isReqeustShopAccChange(shopAccList));
		}
		
		return resultMap;
	}
	
	private String isReqeustShopAccChange(ArrayList<HashMap<String, Object>> shopAccList) {
		String result = "N";
		for(int j=0; j<shopAccList.size(); j++) {
			result = (String.valueOf(shopAccList.get(j).get("acc_no")).equals(demand_acc_no_first)) ? "Y" : "N";
			if(shopAccList.get(j).containsKey("acc_second")) {
				result = (String.valueOf(shopAccList.get(j).get("acc_no")).equals(demand_acc_no_second)) ? "Y" : "N";
			}
			if(result.equals("N")) break; // 아이디 하나라도 변경안되어 있으면 실패
		}
		return result;
	}
}
