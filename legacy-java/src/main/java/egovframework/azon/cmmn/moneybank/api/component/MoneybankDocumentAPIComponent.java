package egovframework.azon.cmmn.moneybank.api.component;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.moneybank.api.mapper.MoneybankDocumentAPIMapper;

@Component
public class MoneybankDocumentAPIComponent {
	
	@Autowired
	MoneybankDocumentAPIMapper moneybankDocumentAPIMapper;

	public HashMap<String, Object> createBizMap(HashMap<String, Object> paramMap, HashMap<String, Object> bizMap){
		HashMap<String, Object> resultMap = new HashMap<>();

		resultMap.put("loginMethod", "CERT");
		resultMap.put("firm_id", String.valueOf(CubiciUtils.UserAuthentication().get("firm_id")));
		resultMap.put("firm_nm", String.valueOf(bizMap.get("FIRM_NM")));
		resultMap.putAll(paramMap);
		
		return resultMap;
	}
	
	public HashMap<String, Object> createNationMap(HashMap<String, Object> paramMap){
		HashMap<String, Object> resultMap = new HashMap<>();
		resultMap.put("loginMethod", "CERT");
		resultMap.put("bizNo", String.valueOf(CubiciUtils.UserAuthentication().get("firm_id")));
		resultMap.putAll(paramMap);
		
		return resultMap;
	}
	
	public HashMap<String, Object> createLocalTaxMap(HashMap<String, Object> paramMap){
		HashMap<String, Object> resultMap = new HashMap<>();
		String user_code = String.valueOf(CubiciUtils.UserAuthentication().get("user_code"));
		HashMap<String, Object> addressMap = moneybankDocumentAPIMapper.findAddress(user_code);

		resultMap.put("loginMethod", "CERT");
		resultMap.put("nonMemberYn", "N");
		resultMap.put("purpose", "01");
		resultMap.put("bigo", "01");
		resultMap.put("recvId", "voisys");
		resultMap.put("recvNm", "주식회사 큐빅아이");
		resultMap.put("recvTel1", "02");
		resultMap.put("recvTel2", "6925");
		resultMap.put("recvTel3", "6373");
		resultMap.putAll(paramMap);
		resultMap.putAll(addressMap);
		
		return resultMap;
	}

	public HashMap<String, Object> createHealthMap(HashMap<String, Object> paramMap, String regNo){
		HashMap<String, Object> resultMap = new HashMap<>();

		resultMap.put("bizNo", regNo);
		resultMap.put("pdfYn", "N");
		resultMap.putAll(paramMap);

		return resultMap;
	}
}
