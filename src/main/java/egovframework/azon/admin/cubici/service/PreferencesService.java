package egovframework.azon.admin.cubici.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;

import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import egovframework.azon.admin.cubici.mapper.PreferencesMapper;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.dto.SearchDto;
import egovframework.azon.cmmn.excel.ExcelComponent;

/* 환경설정 service
 * 2021. 03. 18
 * by KJC */
@Service
public class PreferencesService {
	
	@Autowired
	PreferencesMapper preferencesMapper;
	
	@Autowired
	ExcelComponent excelcomponent;
	
	/* 관리자 등록 */
	
	/* ********** 관리자 등록/관리 시작 2021.06.02 PHJ ********** */
	// 관리자 신청
	public void requestAdmin(HashMap<String, Object> params) {
		HashMap<String, Object> adminCount = preferencesMapper.selectAdminCount();
		int num = Integer.parseInt(adminCount.get("COUNT").toString()) + 1 ;
		params.put("ADMIN_ID", "temp_id_"+num);
		preferencesMapper.requestAdmin(params);
	}
	
	// 관리자 리스트 가져오기
	public HashMap<String, Object> selectAdminAccountList(HashMap<String, Object> params){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		ArrayList<HashMap<String, Object>> resultList = preferencesMapper.selectAdminAccountList(params);
		resultMap.put("resultList", resultList);
		
		params.put("flag", "total");
		ArrayList<HashMap<String, Object>> countList = preferencesMapper.selectAdminAccountList(params);
		resultMap.put("TOTAL", countList.get(0).get("COUNT"));
		
		return resultMap;
	}
	// 관리자 아이디 중복확인
	public HashMap<String, Object> adminIdCheck(HashMap<String, Object> params){
		HashMap<String, Object> resultMap = preferencesMapper.adminIdCheck(params);
		return resultMap;
	}
	
	// 승인
	public void approvalAdmin(HashMap<String, Object> params) {
		preferencesMapper.approvalAdmin(params);
	}
	
	// 업데이트
	public ArrayList<HashMap<String, Object>> updateAdmin(HashMap<String, Object> params) {
		preferencesMapper.updateAdmin(params);
		return null;
	}
	
	// 삭제
	public void deleteAdmin(HashMap<String, Object> params) {
		preferencesMapper.deleteAdmin(params);
	}
	
	// 관리자 평가관리에서 보여주는 데이터 업데이트
	public void adminReviseSave(HashMap<String, Object> params) {
		preferencesMapper.updateAdmin(params);
	}
	
	/* ********** 관리자 등록/관리 끝 ********** */
	
	/* ********** 프리즘 지표관리 ********** */
	// 지표관리 목록
	public HashMap<String, Object> selectEvalList(HashMap<String, Object> param){
		
		// 프리즘 평가 리스트
		ArrayList<HashMap<String, Object>> prizmEvalList = preferencesMapper.selectPrizmEvalList(param);
		// 평가주제 리스트
		ArrayList<HashMap<String, Object>> subjectList = preferencesMapper.selectSubjectList(param);
		// 평가항목 리스트
		ArrayList<HashMap<String, Object>> itemList = preferencesMapper.selectItemList(param);
		// 프리즘 세부지표 업데이트 기록
		ArrayList<HashMap<String, Object>> prizmEvalUpdRecord = preferencesMapper.selectPrizmUpdRecord(param);
		
		// 결과값 저장
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("prizmEvalList", prizmEvalList);
		resultMap.put("subjectList", subjectList);
		resultMap.put("itemList", itemList);
		resultMap.put("prizmEvalUpdRecord", prizmEvalUpdRecord);
		
		return resultMap;
	}
	
	// 프리즘 지표 업데이트
	@Transactional(isolation=Isolation.READ_COMMITTED, propagation=Propagation.REQUIRES_NEW, rollbackFor = {RuntimeException.class, Exception.class})
	public void prizmEvalUpdate(HashMap<String, Object> params) {
		
		try {
			// 이전 세부지표 데이터 가져오기
			params.put("detail", "Y");
			ArrayList<HashMap<String, Object>> beforePrizmEvalList = preferencesMapper.selectPrizmEvalList(params);

			// 프리즘 세부지표 업데이트 내역 시퀀스
			int UPD_SEQ = preferencesMapper.selectPrizmUpdSeq(params) + 1;
			params.put("UPD_SEQ", UPD_SEQ);
			// 프리즘 세부지표 업데이트 (평가항목 -> 지표정의, 척도 가중비)
			preferencesMapper.prizmEvalItemUpdate(params);
			
			// 프리즘 세부지표 업데이트 (세부 리스트)
			for (int i = 0; i < Integer.parseInt(params.get("ITEM_LENGTH").toString()); i++) {
				HashMap<String, Object> getData = new HashMap<>(); // 업데이트할 때 가져갈 map
				HashMap<String, Object> beforeData = beforePrizmEvalList.get(i); // 만약 세부지표 스코어를 추가, 삭제하게 되면 null 처리 필요
				
				getData.put("UPD_SEQ", UPD_SEQ);
				getData.put("SUBJECT_NO", params.get("SUBJECT_NO"));
				getData.put("ITEM_NO", params.get("ITEM_NO"));
				
				if(params.get("ITEM_DETAIL_LIST["+i+"][ITEM_SCORE]") == null) {
					getData.put("ITEM_SCORE", 0);
				}else {
					getData.put("ITEM_SCORE", params.get("ITEM_DETAIL_LIST["+i+"][ITEM_SCORE]"));
				}
				
				if(params.get("ITEM_DETAIL_LIST["+i+"][ITEM_STANDARD1]") == null ||params.get("ITEM_DETAIL_LIST["+i+"][ITEM_STANDARD1]").toString().equals("-")) {
					getData.put("ITEM_STANDARD1", "null");
				}else {
					getData.put("ITEM_STANDARD1", params.get("ITEM_DETAIL_LIST["+i+"][ITEM_STANDARD1]"));
				}
				if(params.get("ITEM_DETAIL_LIST["+i+"][OPERATOR1]") == null) {
					getData.put("OPERATOR1", "");
				}else {
					getData.put("OPERATOR1", params.get("ITEM_DETAIL_LIST["+i+"][OPERATOR1]"));
				}
				
				if(params.get("ITEM_DETAIL_LIST["+i+"][ITEM_STANDARD2]") == null || params.get("ITEM_DETAIL_LIST["+i+"][ITEM_STANDARD2]").toString().equals("-")) {
					getData.put("ITEM_STANDARD2", "null");
				}else {
					getData.put("ITEM_STANDARD2", params.get("ITEM_DETAIL_LIST["+i+"][ITEM_STANDARD2]"));
				}
				if(params.get("ITEM_DETAIL_LIST["+i+"][OPERATOR2]") == null) {
					getData.put("OPERATOR2", "");
				}else {
					getData.put("OPERATOR2", params.get("ITEM_DETAIL_LIST["+i+"][OPERATOR2]"));
				}
				
				// CBCI_PRIZM_ITEM_DETAIL 업데이트
				getData.put("DIVISION", params.get("DIVISION"));
				if ((params.get("DIVISION").toString().equals("1") && !params.get("SUBJECT_NO").toString().equals("6"))
						|| ( params.get("DIVISION").toString().equals("2") && !params.get("SUBJECT_NO").toString().equals("1") )) {
					preferencesMapper.prizmEvalDetailUpdate(getData);
				}

				// CBCI_PRIZM_UPD_DETAIL 상세내역 기록
				// 이전 데이터 불러오기
				getData.put("ITEM_DEFINITION", params.get("ITEM_DEFINITION"));
				getData.put("ITEM_WEIGHT", params.get("ITEM_WEIGHT"));
				getData.put("ITEM_DEFINITION_BEFORE", beforeData.get("ITEM_DEFINITION"));
				getData.put("ITEM_WEIGHT_BEFORE", beforeData.get("ITEM_WEIGHT"));
				
				if(beforeData.get("ITEM_STANDARD1").toString().equals("-")) {
					getData.put("ITEM_STANDARD1_BEFORE", "null");
				}else {
					getData.put("ITEM_STANDARD1_BEFORE", beforeData.get("ITEM_STANDARD1"));
				}
				getData.put("OPERATOR1_BEFORE", beforeData.get("OPERATOR1"));
				
				if(beforeData.get("ITEM_STANDARD2").toString().equals("-")) {
					getData.put("ITEM_STANDARD2_BEFORE", "null");
				}else {
					getData.put("ITEM_STANDARD2_BEFORE", beforeData.get("ITEM_STANDARD2"));
				}
				getData.put("OPERATOR2_BEFORE", beforeData.get("OPERATOR2"));
				
				preferencesMapper.insertPrizmEvalUpdDetail(getData);
			}
			
			// 두 개 다 업데이트 되면
			preferencesMapper.insertPrizmEvalUpdRecord(params);
			
		}catch(Exception ex) {
			System.out.println(" [ ERROR ] [ AdminCubiciService ] [ prizmEvalUpdate ] [ "+ex.toString()+" ]");
		}
	}
	// 프리즘 세부지표 업데이트 상세 내역
	public ArrayList<HashMap<String, Object>> selectPrizmUpdDetailList(HashMap<String, Object> param) {
        return preferencesMapper.selectPrizmUpdDetailList(param);
    }	
	/* ********** 프리즘 지표관리  끝 ********** */	
	/* ********** 프리즘 RawData ************ */
	public ArrayList<HashMap<String, Object>> rawDataColList(HashMap<String, Object> param){
		return preferencesMapper.rawDataColList(param);
	}
	
	public ArrayList<HashMap<String, Object>> rawDataListSelect(HashMap<String,Object> params){
		return preferencesMapper.rawDataListSelect(params);
	}
	
	public void rawDataCalculInsert(HashMap<String, Object> params){
		preferencesMapper.rawDataCalculInsert(params);
	}
	
	public void rawDataCalculUpdate(HashMap<String, Object> params){
		preferencesMapper.rawDataCalculUpdate(params);
	}
	
	public void rawDataCalculDelete(HashMap<String, Object> params){
		preferencesMapper.rawDataCalculDelete(params);
	}

	public SXSSFWorkbook rawDataExcelList(HashMap<String, Object> params) throws Exception{
		ObjectMapper mapper = new ObjectMapper();
		HashMap<String, Object> dataHashMap = new HashMap<>();
		ArrayList<String> selectList = new ArrayList<>();// Select COLUMN
		ArrayList<String> headerList = new ArrayList<>();// Header KEY
 		HashMap<String, Object> headerInfoList = new HashMap<>(); // 상단정보
		StringBuilder rawDataQuery = new StringBuilder();// RAWDATQUERY
		
		for(String key: params.keySet()) {
			String value = params.get(key).toString();
			if(!key.equals("data")) {
				headerInfoList.put(key, value);
			}
		}// 상단정보 담기
		
		String dataString = params.get("data").toString(); // "data" to String
		dataString = dataString.substring(1, dataString.length()-1); // String "[]" delete
		dataHashMap = mapper.readValue(dataString, new TypeReference<LinkedHashMap<String, Object>>() {});// json 타입 해쉬맵 전환
		
		headerList.add("NO");
		for(String key: dataHashMap.keySet()) {
			String value = dataHashMap.get(key).toString();
			headerList.add(value);
			selectList.add(key);
		}// haeder or select list saves

		int selectListCnt = selectList.size();
		rawDataQuery.append("SELECT @rownum:=@rownum+1 AS NO, ");
		for(int i = 0; i < selectListCnt; i++) {
			rawDataQuery.append(selectList.get(i));
			if(i != selectListCnt-1)rawDataQuery.append(",");
		}
		rawDataQuery.append(" FROM ");
		rawDataQuery.append(params.get("tableName").toString());
		rawDataQuery.append(", (SELECT @rownum:=0) TMP");// 쿼리 생성
		
		ArrayList<HashMap<String, Object>> rawDataExcelList = preferencesMapper.rawDataExcelList(rawDataQuery.toString()); // 리스트 추출
		
		return excelcomponent.rawDataExcel(rawDataExcelList, headerList, headerInfoList);
	}
	/* ************************************ */
	
	/* ********** 요금제 관리 시작 ********** */
	public ArrayList<HashMap<String,Object>> chargeList(HashMap<String, Object> params){
		return preferencesMapper.chargeList(params);
	}
	
	public HashMap<String, Object> chargeCount(HashMap<String, Object> params) {
		return preferencesMapper.chargeCount(params);
	}
	
	public HashMap<String, Object> chargeDetail(HashMap<String, Object> params){
		return preferencesMapper.chargeDetail(params);
	}
	
	public void chargeinsert(HashMap<String, Object> params) {
		String codeType = params.get("charge_type").toString();
		String subPeriod= params.get("sub_period").toString();
		String chargeCode = preferencesMapper.chargeCodeList(params);
		
		if(CubiciUtils.StringEmpty(chargeCode)) {
			chargeCode = "01";
		}else{
			chargeCode = chargeCode.substring(3,5);
			int StringToInt = Integer.parseInt(chargeCode) + 1;
			chargeCode = String.valueOf(StringToInt);

			if(chargeCode.length() <= 1) {
				chargeCode = "0" + chargeCode;
			}
		}
		
		params.put("charge_code", codeType + subPeriod + chargeCode);
		preferencesMapper.chargeinsert(params);
	}
	
	public void chargeUpdate(HashMap<String, Object> params){
		preferencesMapper.chargeupdate(params);
	}
	
	public void chargeDelete(HashMap<String, Object> param) {
		preferencesMapper.chargedelete(param);
	}
	/* ************************************ */
	
	/* 관리자 연계코드 */
	public ArrayList<HashMap<String,Object>> promotionlist(HashMap<String, Object> params){
		String[] PromoSearchKey = SearchDto.PromoSearchKey.getSearchkey();
		params = CubiciUtils.QuotesReplace(PromoSearchKey, params);
		return preferencesMapper.promotionlist(params);
	}
	
	public HashMap<String, Object> promotionCount(HashMap<String, Object> params) {
		return preferencesMapper.promotionCount(params);
	}
	
	public HashMap<String, Object> promotionDetail(HashMap<String, Object> params){
		return preferencesMapper.promotionDetail(params);
	}
	
	public ArrayList<HashMap<String, Object>> partnerDivisionSelect(HashMap<String, Object> params){
		return preferencesMapper.partnerDivisionSelect(params);
	} 
	
	public ArrayList<HashMap<String, Object>> chargeNameSelect(){
		return preferencesMapper.chargeNameSelect();
	} 
	
	public ArrayList<HashMap<String, Object>> partnerCodeSelect(HashMap<String, Object> params){
		return preferencesMapper.partnerCodeSelect(params);
	}
	
	public void promotionInsert(HashMap<String, Object> params) {
		Date nowDate = new Date();
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("YY");
		
		String promoYear = simpleDateFormat.format(nowDate);
		String promoTarget= String.valueOf(params.get("promo_target"));
		String partner_division = String.valueOf(params.get("partner_division"));
		String partnerCode = String.valueOf(params.get("partner_code"));
		String promoCode = preferencesMapper.promotionCodeSelect(params);
		
		String promo_code = "";
		
		if(CubiciUtils.StringEmpty(promoCode)) {
			promoCode = "01";
		}else{
			int StringToInt = Integer.parseInt(promoCode) + 1;
			promoCode = String.valueOf(StringToInt);

			if(promoCode.length() <= 1) {
				promoCode = "0" + promoCode;
			}
		}
		
		if(partner_division.equals("CBCI")) {
			partnerCode = "CBCI";
			params.put("partnerCode", partnerCode);
		}
		promo_code = promoYear + promoTarget + partnerCode + promoCode;
			
		params.put("promo_code", promo_code);
		preferencesMapper.promotionInsert(params);
		
		chargeCodeInsert(params);
	}
	
	public void promotionUpdate(HashMap<String, Object> params){
		chargeCodeDelete(params);
		chargeCodeInsert(params);
		preferencesMapper.promotionUpdate(params);
	}
	
	public void promotionDelete(HashMap<String, Object> params) {
		preferencesMapper.promotionDelete(params);
		chargeCodeDelete(params);
	}
	
	private void chargeCodeInsert(HashMap<String, Object> params) {
		String charge_code = String.valueOf(params.get("charge_code"));
		charge_code = charge_code.substring(0, charge_code.length()-1);
		charge_code = charge_code.substring(1);
		String[] chargeArr = charge_code.split(",");
		
		for(String key : chargeArr) {
			params.put("charge_code", key.trim());
			preferencesMapper.connectionInsert(params);
		}
	}
	
	private void chargeCodeDelete(HashMap<String, Object> params) {
		String promo_code = String.valueOf(params.get("promo_code"));
		preferencesMapper.connectionDelete(promo_code);
	}
	
	/* ********** 연계코드 시작 ********** */
	public void insertLinkedCode(HashMap<String, Object> params) {
		preferencesMapper.insertLinkedCode(params);
	}
	public ArrayList<HashMap<String, Object>> selectLinkedCode(HashMap<String, Object> params) {
		return preferencesMapper.selectLinkedCode(params);
	}
	public HashMap<String, Object> gotoTab2(HashMap<String, Object> params) {
		return preferencesMapper.gotoTab2(params);
	}
	public void updateLinkedCode(HashMap<String, Object> params) {
		preferencesMapper.updateLinkedCode(params);
	}
	/* ********** 연계코드 끝 ********** */
	
	/* ********** 머니뱅크 관리 시작 ********** */
	public ArrayList<HashMap<String, Object>> selectMoneybankList(HashMap<String, Object> params) {
		return preferencesMapper.selectMoneybankList(params);
	}
	// 머니뱅크 상품 등록
	public void insertMoneybankProduct(HashMap<String, Object> params) {
		preferencesMapper.insertMoneybankProduct(params);
	}
	public void insertMoneybankPartner(HashMap<String, Object> params) {
		preferencesMapper.insertMoneybankPartner(params);
	}
	// 머니뱅크 상품 수정
	public void updateMoneybankProduct(HashMap<String, Object> params) {
		preferencesMapper.updateMoneybankProudct(params);
	}
	public HashMap<String, Object> selectMoneybankFirmNo(HashMap<String, Object> params) {
		return preferencesMapper.selectMoneybankFirmNo(params);
	}
	public void updateMoneybankPartner(HashMap<String, Object> params) {
		preferencesMapper.updateMoneybankPartner(params);
	}
	public HashMap<String, Object> gotoMoneybankTab2(HashMap<String, Object> params) {
		return preferencesMapper.gotoMoneybankTab2(params);
	}
	
	
	/* ********** 머니뱅크 관리 끝 ********** */
	
	public ArrayList<HashMap<String,Object>> partnerList(HashMap<String, Object> params){
		return preferencesMapper.partnerList(params);
	}
	
	public HashMap<String, Object> partnerCodeCount(HashMap<String, Object> params) {
		return preferencesMapper.partnerCodeCount(params);
	}
	
	public int divisionCodeAuth(String param) { 
		return preferencesMapper.divisionCodeAuth(param);
	}
	
	public ArrayList<HashMap<String, Object>> partnerDetail(HashMap<String, Object> params){
		return preferencesMapper.partnerDetail(params);
	}
	
	public void partnerInsert(HashMap<String, Object> paramMap) {
		String partnerCode = String.valueOf(paramMap.get("partner_code"));
		int divisionCodeAuth = divisionCodeAuth(partnerCode);
		
		if(divisionCodeAuth == 0) {
			preferencesMapper.partnerInsert(paramMap);
			managerInsertUpdate(paramMap);
		}
	}
	
	public void partnerUpdate(HashMap<String, Object> paramMap){
		preferencesMapper.partnerUpdate(paramMap);
		managerInsertUpdate(paramMap);
	}
	
	@SuppressWarnings("unchecked")
	private void managerInsertUpdate(HashMap<String, Object> params) {
		ArrayList<HashMap<String, Object>> dataList = (ArrayList<HashMap<String, Object>>) params.get("data");
		String partner_code = String.valueOf(params.get("partner_code"));
		
		for(HashMap<String, Object> data : dataList) {
			data.put("partner_code", partner_code);
			preferencesMapper.managerInsertUpdate(data);
		}
	}

	public void partnerDelete(HashMap<String, Object> paramMap) {
		preferencesMapper.partnerDelete(paramMap);
	}
	
	public void EvalUpdate(HashMap<String, Object> params) {
		preferencesMapper.EvalUpdate(params);
	}
	
	public ArrayList<HashMap<String,Object>> partnerEvalList(HashMap<String, Object> params){
		return preferencesMapper.partnerEvalList(params);
	}
	
	public void partnerEvalInsert(HashMap<String, Object> params) {
		preferencesMapper.partnerEvalInsert(params);
	}
	
	public void partnerEvalUpdate(HashMap<String, Object> params) {
		preferencesMapper.partnerEvalUpdate(params);
	}
	
	public void partnerEvalDelete(HashMap<String, Object> params) {
		preferencesMapper.partnerEvalDelete(params);
	}
	/* ********** 협력사 코드 관리 끝************* */

	
	/* ********** 요금제 관리 ********** */
	public ArrayList<HashMap<String, Object>> selectChargeList() {
		return preferencesMapper.selectChargeList();
	
	}
	/* ********** 요금제 관리 끝 ********** */
	
	/* ********** 이벤트 관리 ********** */
	public ArrayList<HashMap<String, Object>> selectPromotionList() {
		return preferencesMapper.selectPromotionList();
	}
	/* ********** 이벤트 관리 끝 ********** */
}
