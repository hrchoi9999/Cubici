package egovframework.azon.admin.cubici.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface MBReqShopMapper {
	
	// 머니뱅크 신청 쇼핑몰
	ArrayList<HashMap<String, Object>> getMBRequestShopList(HashMap<String, Object> params);

	ArrayList<HashMap<String, Object>> getInterparkAccInfo(HashMap<String, Object> params);
	ArrayList<HashMap<String, Object>> getCoupangAccInfo(HashMap<String, Object> params);
	ArrayList<HashMap<String, Object>> getNaverAccInfo(HashMap<String, Object> params);
	ArrayList<HashMap<String, Object>> getGmarketAccInfo(HashMap<String, Object> params);
	ArrayList<HashMap<String, Object>> getAuctionAccInfo(HashMap<String, Object> params);
	ArrayList<HashMap<String, Object>> get11stAccInfo(HashMap<String, Object> params);
	
}
