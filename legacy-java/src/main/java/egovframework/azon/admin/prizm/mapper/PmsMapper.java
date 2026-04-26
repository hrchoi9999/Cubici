package egovframework.azon.admin.prizm.mapper;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

import java.util.ArrayList;
import java.util.HashMap;

@Mapper
public interface PmsMapper {

    void accountChangeStatus();

    ArrayList<HashMap<String, Object>> selectPmsResultDetail(String mbid);

    ArrayList<HashMap<String, Object>> selectPmsCoreRiskDetail(String mbid);

    ArrayList<HashMap<String,Object>> selectPmsMBUserRequest();

    ArrayList<HashMap<String,Object>> selectPmsShopList(HashMap<String, Object> param);

    HashMap<String,Object> selectPmsShopData(HashMap<String,Object> param);

    int insertPmsResult (HashMap<String, Object> params);

    int selectPmsDate();

    int selectPmsCount();
}
