package egovframework.azon.admin.moneybank.operation.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.admin.moneybank.operation.mapper.ManageMapper;

@Service
public class ManageService{
    @Autowired
    ManageMapper manageMapper;

    public ArrayList<HashMap<String,Object>> getPrizmItemList(HashMap<String,Object> params){
        ArrayList<HashMap<String,Object>> itemListData = manageMapper.selectPrizmItemList(params);
        ArrayList<HashMap<String,Object>> itemList = new ArrayList<HashMap<String,Object>>();
        System.out.println("======================================");
        System.out.println(itemListData);
        for(int i=0; i<itemListData.size(); i++) {
            HashMap<String,Object> itemRowData = new HashMap<String, Object>();
            itemRowData.put("ITEM_NM", itemListData.get(i).get("ITEM_NM"));
            itemRowData.put("ITEM_WEIGHT", itemListData.get(i).get("ITEM_WEIGHT"));
            itemRowData.put("DIVISION", itemListData.get(i).get("DIVISION"));
            itemRowData.put("SUBJECT_NO", itemListData.get(i).get("SUBJECT_NO"));
            itemRowData.put("ITEM_NO", itemListData.get(i).get("ITEM_NO"));
            String[] itemScore=String.valueOf(itemListData.get(i).get("ITEM_SCORE")).split(",");
            for(int j=0; j<itemScore.length; j++) {
                itemRowData.put("ITEM_SCORE"+j, itemScore[j]);
            }
            String[] itemStandard1=String.valueOf(itemListData.get(i).get("ITEM_STANDARD1")).split(",");
            String[] operator1=String.valueOf(itemListData.get(i).get("OPERATOR1")).split(",");
            String[] itemStandard2=String.valueOf(itemListData.get(i).get("ITEM_STANDARD2")).split(",");
            String[] operator2=String.valueOf(itemListData.get(i).get("OPERATOR2")).split(",");

            System.out.println("ITEM_STANDARD1 : "+itemStandard1);
            System.out.println("OPERATOR1 : "+operator1);
            System.out.println("ITEM_STANDARD2 : "+itemStandard2);
            System.out.println("OPERATOR2 : "+operator2);

            itemRowData.put("ITEM_STANDARD1", itemStandard1);
            itemRowData.put("OPERATOR1", operator1);
            itemRowData.put("ITEM_STANDARD2", itemStandard2);
            itemRowData.put("OPERATOR2", operator2);

			/*itemRowData.put("ITEM_STANDARD1", itemListData.get(i).get("ITEM_STANDARD1"));
			itemRowData.put("OPERATOR1", itemListData.get(i).get("OPERATOR1"));
			itemRowData.put("ITEM_STANDARD2", itemListData.get(i).get("ITEM_STANDARD2"));
			itemRowData.put("OPERATOR2", itemListData.get(i).get("OPERATOR2"));*/

            itemList.add(itemRowData);
        }
        return itemList;
    }

    public ArrayList<HashMap<String, Object>> getPrizmItemGradeList(HashMap<String, Object> params){
        return manageMapper.selectPrizmItemGradeList(params);
    }
}