package egovframework.azon.admin.moneybank.operation.mapper;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

import java.util.ArrayList;
import java.util.HashMap;


@Mapper
public interface CmmMapper {

	void modifyMbStatus(HashMap<String, Object> paramMap);

	void modifyUserType(HashMap<String, Object> paramMap);

	HashMap<String, Object> findUserCodeByMBID(HashMap<String, Object> params);

	void modifyMbStatusByAgreeDate();

}
