package egovframework.azon.cmmn.moneybank.mapper;

import java.util.HashMap;
import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface MoneybankCmmMapper {
	
	public void modifyUserTypeByMbStatus(HashMap<String, Object> params);

}
