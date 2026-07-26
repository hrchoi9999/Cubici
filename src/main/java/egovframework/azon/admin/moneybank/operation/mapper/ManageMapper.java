package egovframework.azon.admin.moneybank.operation.mapper;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper
public interface ManageMapper {
    //프리즘 평가지표 Select
    ArrayList<HashMap<String, Object>> selectPrizmItemList(HashMap<String, Object> params);

    //프리즘 평가등급 Select
    ArrayList<HashMap<String, Object>> selectPrizmItemGradeList(HashMap<String, Object> params);

    //프리즘 아이템 Update
    void updatePrizmItem(HashMap<String, Object> params);

    //프리즘 아이템상세 Update
    void updatePrizmItemDetail(HashMap<String, Object> params);

    //프리즘 아이템 등급 Update
    void updatePrizmItemGrade(HashMap<String, Object> params);



}
