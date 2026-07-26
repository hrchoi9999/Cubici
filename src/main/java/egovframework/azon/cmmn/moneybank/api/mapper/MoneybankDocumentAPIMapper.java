package egovframework.azon.cmmn.moneybank.api.mapper;

import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface MoneybankDocumentAPIMapper {

	HashMap<String, Object> findAddress(String param);
	
	void inputDocument(HashMap<String, Object> paramMap);

	HashMap<String, Object> getRegNo(String param);

	HashMap<String, Object> getFirmInfo(String param);
}
