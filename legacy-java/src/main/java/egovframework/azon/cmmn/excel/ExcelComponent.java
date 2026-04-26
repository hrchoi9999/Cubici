package egovframework.azon.cmmn.excel;


import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


/* 엑셀 통합
 * 수정 2022. 01. 27.
 * by MKY */
@Component
public class ExcelComponent {
	
	@Autowired
	ExcelStyle excelstyle;
	
	// === RawData Excel === //
	public SXSSFWorkbook rawDataExcel(ArrayList<HashMap<String, Object>> rawDataExcelList, ArrayList<String> headerList, HashMap<String, Object> headerInfoList) {
		SXSSFWorkbook workbook = new SXSSFWorkbook();// ExcelWorkbook
		SXSSFSheet sheet = workbook.createSheet("프리즘 데이터");// sheet create
		
		HashMap<String, CellStyle> CellStyleMap = ExcelCellStyle(workbook);// cellstyle 가져오기
		
		Row row = rawDataExcelHeaderInfo(sheet, CellStyleMap, headerInfoList);//header생성
		row = rawDataExcelBodyInfo(sheet, CellStyleMap, row, rawDataExcelList, headerList);//body생성
		
		return workbook;
	}
	
	private HashMap<String, CellStyle> ExcelCellStyle(SXSSFWorkbook workbook){
		String[] CellStyle = {"headerStyle", "mainBodyStyle", "bodyValueStyle", "totalValueStyle", "totalStyle"};
		HashMap<String, CellStyle> CellStyleMap = new HashMap<>();

		for(String key: CellStyle) {
			CellStyleMap.put(key, excelstyle.workbookSheetStyle(workbook, key));//CellStyle 생성
		}
		
		return CellStyleMap;
	}
	
	private Row rawDataExcelHeaderInfo(SXSSFSheet sheet, HashMap<String, CellStyle> CellStyleMap, HashMap<String, Object> headerInfoList) {
		
		LinkedHashMap<String, Object> headerMap = new LinkedHashMap<String, Object>();
		headerMap.put("tableName", "테이블코드");
		headerMap.put("tableComment", "테이블명");
		headerMap.put("fromDate", "시작일자");
		headerMap.put("toDate", "종료일자");
		
		Row row = null;
		Cell cell = null;
		
		int rowCnt = 0;
		for(String key: headerMap.keySet()) {
			String headerContent = headerInfoList.get(key).toString();
			String headerTitle = headerMap.get(key).toString();
			row = sheet.createRow(rowCnt++);
			for(int i = 0; i < 4; i++) {
				cell = row.createCell(i);
				if(i < 2) {
					cell.setCellStyle(CellStyleMap.get("headerStyle"));
				}else {
					cell.setCellStyle(CellStyleMap.get("bodyStyle"));
				}
				if(i == 0) {
					cell.setCellValue(headerTitle);
				}else if(i == 2) {
					cell.setCellValue(headerContent);
				}
			}
		}// header 생성
		
		// Excel 병합
		for(int i = 0; i < 4; i ++) {
			sheet.addMergedRegion(new CellRangeAddress(i, i, 0, 1));
			sheet.addMergedRegion(new CellRangeAddress(i, i, 2, 3));
		}
		return row;
	}
	
	private Row rawDataExcelBodyInfo(SXSSFSheet sheet, HashMap<String, CellStyle> CellStyleMap, Row row,
			ArrayList<HashMap<String, Object>> rawDataExcelList, ArrayList<String> headerList) {
		row = sheet.createRow(5);
		Cell cell = null;
		int headerRowCnt = 0;
		for(String key: headerList) {
			sheet.setColumnWidth(headerRowCnt, 4000);
			cell = row.createCell(headerRowCnt++);
			cell.setCellStyle(CellStyleMap.get("headerStyle"));
			cell.setCellValue(key);
		}//header 부분 name insert
		
		int rawDataExcelListCnt = rawDataExcelList.size();
		for(int i = 0; i<rawDataExcelListCnt; i++) {
			HashMap<String, Object> rawData = rawDataExcelList.get(i);
			row = sheet.createRow(6+i);
			int rawDataCnt = 0;
			for(String key: rawData.keySet()) {
				String value = String.valueOf(rawData.get(key)); //NPE 대비 String.valueOf
				value = (value == null || value.length() == 0 || value.equals("null")) ? "" : value;//null 일시 빈값
				if(key.equals("NO")) value = String.format("%d", (long) Double.parseDouble(value)); // No string .0제거
				cell = row.createCell(rawDataCnt++);
				cell.setCellStyle(CellStyleMap.get("bodyValueStyle"));
				cell.setCellValue(value);
			}
		}
		return row;
	}
	
	
	// === Cubici Excel worksheets (2022.01.27 MKC) === //
	
	// 통합정보 > 매출분석 > 판매금액 & 반품교환 -> 하단 매출정보 엑셀과 동일
	
	// 통합정보 > 상품분석 > 가격할인 및 판촉
	public SXSSFWorkbook salesPromoWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList,
			ArrayList<HashMap<String, Object>> sumMapList) throws Exception {
		
		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("할인 및 판촉");
		
		sheet.setColumnWidth(2, 5000);
		sheet.setColumnWidth(3, 3000); // 쇼핑몰칸의 크기 유지
		sheet.setColumnWidth(4, 3000);
		sheet.setColumnWidth(5, 3000);
		sheet.setColumnWidth(6, 3000);
		sheet.setColumnWidth(7, 3000);
		sheet.setColumnWidth(8, 3000);
		sheet.setColumnWidth(10, 4000);

		// 시트 스타일
		CellStyle headerStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle");
		CellStyle mainBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle");
		CellStyle bodyValueStyle = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle");
		CellStyle bodyTotalStyle = excelstyle.workbookSheetStyle(workbook, "totalStyle");
		CellStyle totalValueStyle = excelstyle.workbookSheetStyle(workbook, "totalValueStyle");

		// Header 생성
		Row row = excelHeaderFunc(sheet, headerStyle, mainBodyStyle, params, "할인 및 판촉");

		// 합계 Header
		List<String> shopList = Arrays.asList(params.get("SHOP_NAME_LIST").toString().split(","));
		int shopNum = shopList.size();
		
		row = sheet.createRow(5);

		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰 비중");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("합계");

		// 쇼핑몰 분포는 쇼핑몰 개수에 따라 조정
		for (int i = 0; i < shopNum; i++) {
			cell = row.createCell(i + 3);
			cell.setCellStyle(headerStyle);
			cell.setCellValue("쇼핑몰 분포");
		}
		if(shopNum > 1) {
			sheet.addMergedRegion(new CellRangeAddress(5, 5, 3, 3+shopNum-1));
		}
		
		// 해당 쇼핑몰만 표시
		row = sheet.createRow(6);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);

		row = setSumHeaderFunc(sheet, headerStyle, 6, shopList, 0);
		
		// 합계 리스트
		row = sheet.createRow(7);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("판매가격");
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D8:I8)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 7, shopList, sumMapList, "SALE_PRICE", 0);

		row = sheet.createRow(8);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("실판매액");
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D9:I9)");
		
		row = shopSumDisplayFunc(sheet, totalValueStyle, 8, shopList, sumMapList, "ORDER_PRICE", 0);

		row = sheet.createRow(9);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("할인/판촉율");
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);

		row = shopSumDisplayFunc(sheet, totalValueStyle, 9, shopList, sumMapList, "RATE", 0);
		
		// 쇼핑몰 전체 매출 표
		row = sheet.createRow(11);
		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문일");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문번호");
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("상품번호");
		cell = row.createCell(4);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("상품명");
		cell = row.createCell(5);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(6);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(7);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(8);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("판매가격");
		cell = row.createCell(9);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("실판매액");
		cell = row.createCell(10);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("할인/판촉율(%)");
		
		sheet.addMergedRegion(new CellRangeAddress(5, 9, 0, 0));
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 1, 1));
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 2, 2));
		sheet.addMergedRegion(new CellRangeAddress(11, 11, 4, 7));
		
		for(int i = 0; i<resultList.size(); i++){
			HashMap<String, Object> getData = resultList.get(i);
			row = sheet.createRow(i + 12);
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("STD_DATE").toString());
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("SHOP").toString());
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("ORDER_NO").toString());
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("PRODUCT_NO").toString());
			cell = row.createCell(4);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("PRODUCT_NAME").toString());
			cell = row.createCell(5);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(6);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(7);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(8);
			cell.setCellStyle(bodyValueStyle);
			cell.setCellValue(Integer.parseInt(getData.get("SALE_PRICE").toString()));
			cell = row.createCell(9);
			cell.setCellStyle(bodyValueStyle);
			cell.setCellValue(Integer.parseInt(getData.get("ORDER_PRICE").toString()));
			cell = row.createCell(10);
			cell.setCellStyle(bodyValueStyle);
			cell.setCellValue(Integer.parseInt(getData.get("RATE").toString()));
			
			sheet.addMergedRegion(new CellRangeAddress(i+12, i+12, 4, 7));
		}
		
		return workbook;
	}
	
	// 통합정보 > 상품분석 > Top10 매출상품
	public SXSSFWorkbook topSalesWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList
			) throws Exception {
		
		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("Top10 매출상품");
	
		sheet.setColumnWidth(1, 4000);
		sheet.setColumnWidth(2, 4000);
		sheet.setColumnWidth(3, 4000);

		// 시트 스타일
		CellStyle headerStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle");
		CellStyle mainBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle");
		CellStyle bodyValueStyle = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle");
		
		// Header 생성
		Row row = excelHeaderFunc(sheet, headerStyle, mainBodyStyle, params, "Top10 매출상품");
		
		// main data header
		row = sheet.createRow(5);
		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("순위");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("상품명");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(4);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("판매가격");
		cell = row.createCell(5);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("수량");
		
		sheet.addMergedRegion(new CellRangeAddress(5, 5, 1, 3));
		
		for(int i=0; i<resultList.size(); i++) {
			row = sheet.createRow(i+6);
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(i+1);
			
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(resultList.get(i).get("PRODUCT_NAME").toString());
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(4);
			cell.setCellStyle(bodyValueStyle);
			cell.setCellValue(Integer.parseInt(resultList.get(i).get("SUM_PRICE").toString()));
			cell = row.createCell(5);
			cell.setCellStyle(bodyValueStyle);
			cell.setCellValue(Integer.parseInt(resultList.get(i).get("SUM_QUANTITY").toString()));
			
			sheet.addMergedRegion(new CellRangeAddress(i+6, i+6, 1, 3));
		}
		
		return workbook;
	}
	
	// 통합정보 > 상품분석 > Top10 재고상품
	public SXSSFWorkbook topStockWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList
			) throws Exception {
		
		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("Top10 재고상품");
		
		sheet.setColumnWidth(1, 4000);
		sheet.setColumnWidth(2, 4000);
		sheet.setColumnWidth(3, 4000);
		// sheet.trackAllColumnsForAutoSizing(); // 나머지 칸은 넓이 자동 맞춤

		// 시트 스타일
		CellStyle headerStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle");
		CellStyle mainBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle");
		CellStyle bodyValueStyle = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle");
		
		// Header 생성
		Row row = excelHeaderFunc(sheet, headerStyle, mainBodyStyle, params, "Top10 재고상품");
		
		// main data header
		row = sheet.createRow(5);
		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("순위");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("상품명");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(4);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("재고량");
		
		sheet.addMergedRegion(new CellRangeAddress(5, 5, 1, 3));
		
		for(int i=0; i<resultList.size(); i++) {
			row = sheet.createRow(i+6);
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(i+1);
			
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(resultList.get(i).get("PRODUCT_NAME").toString());
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			
			cell = row.createCell(4);
			cell.setCellStyle(bodyValueStyle);
			cell.setCellValue(Integer.parseInt(resultList.get(i).get("QUANTITY").toString()));
			
			sheet.addMergedRegion(new CellRangeAddress(i+6, i+6, 1, 3));
		}
		
		return workbook;
	}
	
	// 매출정보 > 판매현황
	public SXSSFWorkbook salesWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList,
			ArrayList<HashMap<String, Object>> sumMapList, List<String> addHeaderList, List<String> addColList) throws Exception {

		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("매출정보");
		
		// 시트 스타일
		CellStyle headerStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle");
		CellStyle mainBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle");
		CellStyle bodyValueStyle = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle");
		CellStyle bodyTotalStyle = excelstyle.workbookSheetStyle(workbook, "totalStyle");
		CellStyle totalValueStyle = excelstyle.workbookSheetStyle(workbook, "totalValueStyle");

		// Header 생성
		Row row = excelHeaderFunc(sheet, headerStyle, mainBodyStyle, params, "매출정보");

		// 합계 Header
		List<String> shopList = Arrays.asList(params.get("SHOP_NAME_LIST").toString().split(","));
		int shopNum = shopList.size();
		
		row = sheet.createRow(5);

		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰 비중");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("합계");

		// 쇼핑몰 분포는 쇼핑몰 개수에 따라 조정
		for (int i = 0; i < shopNum; i++) {
			cell = row.createCell(i + 3);
			cell.setCellStyle(headerStyle);
			cell.setCellValue("쇼핑몰 분포");
		}
		if(shopNum>1) { // merge는 한 칸 이상을 설정해야 제대로 수행됨
			sheet.addMergedRegion(new CellRangeAddress(5, 5, 3, 3+shopNum-1));
		}
		
		// 해당 쇼핑몰만 표시
		row = sheet.createRow(6);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);

		row = setSumHeaderFunc(sheet, headerStyle, 6, shopList, 0);
		
		// 합계 리스트
		row = sheet.createRow(7);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("판매금액");
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D8:I8)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 7, shopList,  sumMapList, "ORDER_PRICE", 0);

		row = sheet.createRow(8);

		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("판매수량");
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D9:I9)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 8, shopList, sumMapList, "QUANTITY", 0);

		// MAIN DATA HEADER
		row = sheet.createRow(10);
		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문일자");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문번호");
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("진행상태"); // *** 여기까지 FIX
		
		if(addHeaderList.contains("상품명") == true) {
		
			cell = row.createCell(4);
			cell.setCellStyle(headerStyle);
			cell.setCellValue("상품명");
			cell = row.createCell(5);
			cell.setCellStyle(headerStyle);
			cell = row.createCell(6);
			cell.setCellStyle(headerStyle);
			cell = row.createCell(7);
			cell.setCellStyle(headerStyle);
			
			sheet.addMergedRegion(new CellRangeAddress(10, 10, 4, 7)); // 상품명
			
			for(int h = 0; h<addHeaderList.size(); h++) {
				String thisHead = addHeaderList.get(h).toString();
				if(!thisHead.equals("상품명")) {
					int StartCell = 7+h;
					cell = row.createCell(StartCell);
					cell.setCellStyle(headerStyle);
					cell.setCellValue(thisHead);
				}
			}
		}else {
			for(int h = 0; h<addHeaderList.size(); h++) {
				String thisHead = addHeaderList.get(h).toString();
				int StartCell = 4+h;
				cell = row.createCell(StartCell);
				cell.setCellStyle(headerStyle);
				cell.setCellValue(thisHead);
			}
		}
		
		// MAIN DATA
		for(int i = 0; i < resultList.size(); i++) {
		
			HashMap<String, Object> getData = resultList.get(i);
			
			row = sheet.createRow(11+i);
			
			// 고정 칼럼 데이터
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("STD_DATE").toString());
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("SHOP").toString());
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("ORDER_NO").toString());
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("STATUS").toString()); 
			
			// 변동 칼럼 데이터
			row = variedColumnData(sheet, mainBodyStyle, bodyValueStyle, 11+i, i, getData, addColList, 1);
			
		}
		
		// MERGE CELL
		sheet.addMergedRegion(new CellRangeAddress(5, 8, 0, 0)); // 쇼핑몰 비중
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 1, 1)); // 구분
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 2, 2)); // 합계
		
		sheet.setColumnWidth(2, 3000); // 합계 & 쇼핑몰칸의 넓이는 유지
		sheet.setColumnWidth(3, 3000); 
		sheet.setColumnWidth(4, 3000);
		sheet.setColumnWidth(5, 3000);
		sheet.setColumnWidth(6, 3000);
		sheet.setColumnWidth(7, 3000);
		sheet.setColumnWidth(8, 3000);
		
		return workbook;
	}
	
	// 매출정보 > 반품교환
	public SXSSFWorkbook returnWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList,
			ArrayList<HashMap<String, Object>> sumMapList, ArrayList<HashMap<String, Object>> exchSumList, List<String> addHeaderList, List<String> addColList) throws Exception {
		
		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("반품 및 교환");

		// 시트 스타일
		CellStyle headerStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle");
		CellStyle mainBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle");
		CellStyle bodyValueStyle = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle");
		CellStyle bodyTotalStyle = excelstyle.workbookSheetStyle(workbook, "totalStyle");
		CellStyle totalValueStyle = excelstyle.workbookSheetStyle(workbook, "totalValueStyle");

		// 기본 Header 생성
		Row row = excelHeaderFunc(sheet, headerStyle, mainBodyStyle, params, "반품 및 교환");

		// 합계 Header
		List<String> shopList = Arrays.asList(params.get("SHOP_NAME_LIST").toString().split(","));
		int shopNum = shopList.size();
		
		row = sheet.createRow(5);

		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰 비중");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("총액");

		// 쇼핑몰 분포는 쇼핑몰 개수에 따라 조정
		for (int i = 0; i < shopNum; i++) {
			cell = row.createCell(i + 3);
			cell.setCellStyle(headerStyle);
			cell.setCellValue("쇼핑몰 분포");
		}
		if(shopNum > 1) {
			sheet.addMergedRegion(new CellRangeAddress(5, 5, 3, 3+shopNum-1));
		}
		
		// 해당 쇼핑몰만 표시
		row = sheet.createRow(6);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);

		row = setSumHeaderFunc(sheet, headerStyle, 6, shopList, 0);
		
		// 합계 리스트
		row = sheet.createRow(7);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("반품");
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D8:I8)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 7, shopList, sumMapList, "PRICE", 0);

		row = sheet.createRow(8);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("교환");
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D9:I9)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 8, shopList, exchSumList, "PRICE", 0);

		sheet.addMergedRegion(new CellRangeAddress(5, 8, 0, 0));
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 1, 1));
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 2, 2));
		
		// Main Data Header 
		row = sheet.createRow(10);
		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문일자");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰");
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문번호"); // *** 여기까지 FIX
		
		// 상품명이 항목에 있으면 무조건 fix 다음 제일 먼저 나오도록 설정
		if(addHeaderList.contains("상품명")) { 
			
			cell = row.createCell(4);
			cell.setCellStyle(headerStyle);
			cell.setCellValue("상품명");
			cell = row.createCell(5);
			cell.setCellStyle(headerStyle);
			cell = row.createCell(6);
			cell.setCellStyle(headerStyle);
			cell = row.createCell(7);
			cell.setCellStyle(headerStyle);
			
			sheet.addMergedRegion(new CellRangeAddress(10, 10, 4, 7)); // 상품명 4칸 merge
			
			for(int h = 0; h<addHeaderList.size(); h++) {
				String thisHead = addHeaderList.get(h).toString();
				if(!thisHead.equals("상품명")) {
					int StartCell = 7+h;
					cell = row.createCell(StartCell);
					cell.setCellStyle(headerStyle);
					cell.setCellValue(thisHead);
				}
			}
			
		}else {
			for(int h = 0; h<addHeaderList.size(); h++) {
				String thisHead = addHeaderList.get(h).toString();
				int StartCell = 4+h;
				cell = row.createCell(StartCell);
				cell.setCellStyle(headerStyle);
				cell.setCellValue(thisHead);
			}
		}
		
		// Main Data
		for(int i = 0; i < resultList.size(); i++) {
			
			HashMap<String, Object> getData = resultList.get(i);
			
			// 고정 칼럼 데이터
			row = sheet.createRow(11+i);
			
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("STD_DATE").toString());
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("DIVISION").toString());
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("SHOP").toString());
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("ORDER_NO").toString());
			
			// 변동 칼럼 데이터
			row = variedColumnData(sheet, mainBodyStyle, bodyValueStyle, 11+i, i, getData, addColList , 0);
		
		}
			
		sheet.setColumnWidth(3, 3500); // 쇼핑몰칸의 넓이는 유지
		sheet.setColumnWidth(4, 3500);
		sheet.setColumnWidth(5, 3500);
		sheet.setColumnWidth(6, 3500);
		sheet.setColumnWidth(7, 3500);
		sheet.setColumnWidth(8, 3500);
		
		return workbook;
	}
	
	// 정산정보 > 정산캘린더
	public SXSSFWorkbook calendarWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList,
			ArrayList<HashMap<String, Object>> sumMapList) throws Exception {

		// === Setting === //
		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("정산 캘린더");
		
		// 셀 스타일
		CellStyle calHeaderStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle"); // 헤더 스타일
		CellStyle calBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle"); // 헤더 내용 스타일
		CellStyle calPriceBody = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle"); // 보통
		CellStyle totalValueStyle = excelstyle.workbookSheetStyle(workbook, "totalValueStyle"); // 회색 바탕 숫자
		CellStyle calTotalStyle = excelstyle.workbookSheetStyle(workbook, "totalStyle"); // 회색 바탕 진한 글씨

		// Header 생성
		Row row = excelHeaderFunc(sheet, calHeaderStyle, calBodyStyle, params, "정산 캘린더");
		
		// === 합계 Header === //
		List<String> shopList = Arrays.asList(params.get("SHOP_NAME_LIST").toString().split(","));
		int shopNum = shopList.size();

		row = sheet.createRow(5);

		Cell cell = row.createCell(0);
		cell.setCellStyle(calHeaderStyle);
		cell.setCellValue("쇼핑몰 비중");
		cell = row.createCell(1);
		cell.setCellStyle(calHeaderStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(calHeaderStyle);
		cell.setCellValue("총액");
		cell = row.createCell(3);
		cell.setCellStyle(calHeaderStyle);

		// 쇼핑몰 분포는 쇼핑몰 개수에 따라 조정
		for (int i = 0; i < shopNum * 2 - 1; i++) {
			cell = row.createCell(i + 4);
			cell.setCellStyle(calHeaderStyle);
			cell.setCellValue("쇼핑몰 정산");
			cell = row.createCell(i + 5);
			cell.setCellStyle(calHeaderStyle);
		}
		sheet.addMergedRegion(new CellRangeAddress(5, 5, 4, 4 + (shopNum * 2) - 1));

		// 해당 쇼핑몰만 표시
		row = sheet.createRow(6);

		cell = row.createCell(0);
		cell.setCellStyle(calHeaderStyle);
		cell = row.createCell(1);
		cell.setCellStyle(calHeaderStyle);
		cell = row.createCell(2);
		cell.setCellStyle(calHeaderStyle);
		cell = row.createCell(3);
		cell.setCellStyle(calHeaderStyle);

		row = setSumHeaderFunc(sheet, calHeaderStyle, 6, shopList, 1);

		// 전체 합계
		row = sheet.createRow(7);

		cell = row.createCell(0);
		cell.setCellStyle(calHeaderStyle);

		cell = row.createCell(1);
		cell.setCellStyle(calTotalStyle);
		cell.setCellValue("전체");

		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=SUM(" + "C9:C10" + ")");
		cell = row.createCell(3);
		cell.setCellStyle(totalValueStyle);
		
		sheet.addMergedRegion(new CellRangeAddress(7, 7, 2, 3));
		
		// 쇼핑몰별 전체 합계 DATA
		row = shopSumDisplayFunc(sheet, totalValueStyle, 7, shopList, sumMapList, "TOTAL", 1);
		
		// *** 정산입금 합계
		row = sheet.createRow(8);

		cell = row.createCell(0);
		cell.setCellStyle(calHeaderStyle);

		cell = row.createCell(1);
		cell.setCellStyle(calTotalStyle);
		cell.setCellValue("정산 입금");

		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=SUM(" + "E9:P9" + ")");
		cell = row.createCell(3);
		cell.setCellStyle(calTotalStyle);

		sheet.addMergedRegion(new CellRangeAddress(8, 8, 2, 3));
		
		// 쇼핑몰별 정산입금 DATA
		row = shopSumDisplayFunc(sheet, totalValueStyle, 8, shopList, sumMapList, "SETTLE_AMOUNT", 1);
		
		// *** 정산 예정 합계
		row = sheet.createRow(9);

		cell = row.createCell(0);
		cell.setCellStyle(calHeaderStyle);

		cell = row.createCell(1);
		cell.setCellStyle(calTotalStyle);
		cell.setCellValue("정산 예정");

		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=SUM(" + "E10:P10" + ")");
		cell = row.createCell(3);
		cell.setCellStyle(totalValueStyle);

		sheet.addMergedRegion(new CellRangeAddress(9, 9, 2, 3));
		
		// 쇼핑몰별 정산예정 합계
		row = shopSumDisplayFunc(sheet, totalValueStyle, 9, shopList, sumMapList, "PRE_SETTLE_AMOUNT", 1);
		
		// 합계 표시
		row = sheet.createRow(11);

		cell = row.createCell(0);
		cell.setCellStyle(calHeaderStyle);
		cell.setCellValue("날짜");
		cell = row.createCell(1);
		cell.setCellStyle(calHeaderStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(calHeaderStyle);
		cell.setCellValue("쇼핑몰");
		cell = row.createCell(3);
		cell.setCellStyle(calHeaderStyle);
		cell.setCellValue("주문번호");

		row = setSumHeaderFunc(sheet, calHeaderStyle, 11, shopList, 1);
		
		row = sheet.createRow(12);

		cell = row.createCell(0);
		cell.setCellStyle(calHeaderStyle);
		cell = row.createCell(1);
		cell.setCellStyle(calHeaderStyle);
		cell = row.createCell(2);
		cell.setCellStyle(calHeaderStyle);
		cell = row.createCell(3);
		cell.setCellStyle(calHeaderStyle);
		
		// HEADER 반복 부분 생성 (시작 셀 번호, 쇼핑몰 갯수)
		headerRepeatFunc(row, cell, 4, shopNum, calHeaderStyle);
		
		// === MAIN DATA === //
		// LOOP WITH MAIN INPUT DATA
		for (int i = 0; i < resultList.size(); i++) {
			
			row = sheet.createRow(i + 13);
			
			String thisShop = resultList.get(i).get("SHOP").toString();
			
			// 날짜
			cell = row.createCell(0);
			cell.setCellStyle(calBodyStyle);
			cell.setCellValue(resultList.get(i).get("SETTLEMENT_DATE").toString());

			// 구분
			cell = row.createCell(1);
			cell.setCellStyle(calBodyStyle);
			cell.setCellValue(resultList.get(i).get("STATUS").toString());

			// 쇼핑몰
			cell = row.createCell(2);
			cell.setCellStyle(calBodyStyle);
			cell.setCellValue(thisShop);

			// 주문번호
			cell = row.createCell(3);
			cell.setCellStyle(calBodyStyle);
			cell.setCellValue(resultList.get(i).get("ORDER_NO").toString());
			
			// DATA
			int settleAmnt = Integer.parseInt(resultList.get(i).get("SETTLEMENT_AMOUNT").toString());		
			int settleQty = Integer.parseInt(resultList.get(i).get("QUANTITY").toString());
			
			int possibleCells = 0;
		
			for(int s = 0; s<shopNum; s++) {
				possibleCells = 4+(2*s);
				
				String thisColShop = shopList.get(s);
				
				if(thisColShop.equals(thisShop)) {
					
					cell = row.createCell(possibleCells);
					cell.setCellStyle(calPriceBody);
					cell.setCellValue(settleAmnt);
					
					cell = row.createCell(possibleCells+1);
					cell.setCellStyle(calPriceBody);
					cell.setCellValue(settleQty);
					
				}else {
					
					cell = row.createCell(possibleCells);
					cell.setCellStyle(calPriceBody);
					
					cell = row.createCell(possibleCells+1);
					cell.setCellStyle(calPriceBody);
					
				}
			}
		}

		// 날짜, 구분, 총액, 쇼핑몰 분포
		sheet.addMergedRegion(new CellRangeAddress(5, 9, 0, 0)); // 쇼핑몰 비중
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 1, 1)); // 구분
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 2, 3)); // 총액

		// MAIN DATA Header
		sheet.addMergedRegion(new CellRangeAddress(11, 12, 0, 0));
		sheet.addMergedRegion(new CellRangeAddress(11, 12, 1, 1));
		sheet.addMergedRegion(new CellRangeAddress(11, 12, 2, 2));
		sheet.addMergedRegion(new CellRangeAddress(11, 12, 3, 3));

		// 시트 열 너비 설정
		sheet.setColumnWidth(1, 3000);
		sheet.setColumnWidth(2, 3000);
		sheet.setColumnWidth(3, 6000);
		
		return workbook;
	}

	// CALENDAR RESULT HEADER 반복구간 FUNC (쇼핑몰 개수에 따라)
	private Row headerRepeatFunc(Row row, Cell cell, int cellNum, int numOfShop, CellStyle calHeaderStyle) {

		int firstCell = cellNum;
		int secondCell = 0;

		for (int i = 1; i <= numOfShop; i++) {

			secondCell = firstCell + 1;

			cell = row.createCell(firstCell);
			cell.setCellStyle(calHeaderStyle);
			cell.setCellValue("금액");
			cell = row.createCell(secondCell);
			cell.setCellStyle(calHeaderStyle);
			cell.setCellValue("수량");

			firstCell += 2;
		}
		return row;
	}
	
	// 정산정보 > 정산상세
	public SXSSFWorkbook settleDetailWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList,
			ArrayList<HashMap<String, Object>> sumMapList, List<String> addHeaderList, List<String> addColList) throws Exception {
		
		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("정산 상세내역");

		sheet.setColumnWidth(3, 3000); // 쇼핑몰칸의 크기 유지
		sheet.setColumnWidth(4, 3000);
		sheet.setColumnWidth(5, 3000);
		sheet.setColumnWidth(6, 3000);
		sheet.setColumnWidth(7, 3000);
		sheet.setColumnWidth(8, 3000);
	
		// 시트 스타일
		CellStyle headerStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle");
		CellStyle mainBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle");
		CellStyle bodyValueStyle = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle");
		CellStyle bodyTotalStyle = excelstyle.workbookSheetStyle(workbook, "totalStyle");
		CellStyle totalValueStyle = excelstyle.workbookSheetStyle(workbook, "totalValueStyle");

		// Header 생성
		Row row = excelHeaderFunc(sheet, headerStyle, mainBodyStyle, params, "정산 상세내역");

		// 합계 Header
		List<String> shopList = Arrays.asList(params.get("SHOP_NAME_LIST").toString().split(","));
		int shopNum = shopList.size();
		
		row = sheet.createRow(5);

		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰 비중");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("합계");

		// 쇼핑몰 분포는 쇼핑몰 개수에 따라 조정
		for (int i = 0; i < shopNum; i++) {
			cell = row.createCell(i + 3);
			cell.setCellStyle(headerStyle);
			cell.setCellValue("쇼핑몰 정산");
		}
		if(shopNum > 1) {
			sheet.addMergedRegion(new CellRangeAddress(5, 5, 3, 3+shopNum-1));
		}
		
		// 해당 쇼핑몰만 표시
		row = sheet.createRow(6);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);

		row = setSumHeaderFunc(sheet, headerStyle, 6, shopList, 0);
		
		// 합계 리스트
		row = sheet.createRow(7);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);

		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("정산입금액");

		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D8:I8)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 7, shopList, sumMapList, "SETTLE_AMOUNT", 2);
		
		row = sheet.createRow(8);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);

		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("정산예정액");

		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D9:I9)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 8, shopList, sumMapList, "PRE_SETTLE_AMOUNT", 2);
		
		// MAIN DATA HEADER
		row = sheet.createRow(10);
		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문일자");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("주문번호");
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("진행상태");  // *** 여기까지 FIX
		
		// 변경 가능 column 중 상품명은 4칸을 merge
		if(addHeaderList.contains("상품명") == true) {
			
			cell = row.createCell(4); 
			cell.setCellStyle(headerStyle);
			cell.setCellValue("상품명");
			cell = row.createCell(5);
			cell.setCellStyle(headerStyle);
			cell = row.createCell(6);
			cell.setCellStyle(headerStyle);
			cell = row.createCell(7);
			cell.setCellStyle(headerStyle);
			
			sheet.addMergedRegion(new CellRangeAddress(10, 10, 4, 7)); // 상품명
			
			for(int i = 0; i<addHeaderList.size(); i++) {
				String thisHead = addHeaderList.get(i).toString();
				if(!thisHead.equals("상품명")) {
					int startRow = 7+i;
					cell = row.createCell(startRow);
					cell.setCellStyle(headerStyle);
					cell.setCellValue(thisHead);
				}
			}
		}else {
			for(int i = 0; i<addHeaderList.size(); i++) {
				String thisHead = addHeaderList.get(i).toString();
				int startRow = 4+i;
				cell = row.createCell(startRow);
				cell.setCellStyle(headerStyle);
				cell.setCellValue(thisHead);
			}
		}
		
		// MAIN DATA
		for (int i = 0; i < resultList.size(); i++) {
			HashMap<String, Object> getData = resultList.get(i);
			row = sheet.createRow(i + 11);
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			String thisDate = getData.get("STD_DATE").toString();
			cell.setCellValue(thisDate);
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			String thisShop = getData.get("SHOP").toString();
			cell.setCellValue(thisShop);
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("ORDER_NO").toString());
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("STATUS").toString()); // *** 여기까지 FIX
			
			// 변경 가능 column 중 상품명이 있으면 우선 나오게 하고 4칸을 merge
			if(addColList.contains("PRODUCT_NAME") == true) {
				
				cell = row.createCell(4);
				cell.setCellStyle(mainBodyStyle);
				cell.setCellValue(getData.get("PRODUCT_NAME").toString());
				cell = row.createCell(5);
				cell.setCellStyle(mainBodyStyle);
				cell = row.createCell(6);
				cell.setCellStyle(mainBodyStyle);
				cell = row.createCell(7);
				cell.setCellStyle(mainBodyStyle);
				
				sheet.addMergedRegion(new CellRangeAddress(i+11, i+11, 4, 7)); // 상품명
				
				// 숫자의 경우 comma가 들어가는 Style로 출력
				for(int j = 0; j<addColList.size(); j++) {
					String thisCol = addColList.get(j).toString();
					if(!thisCol.equals("PRODUCT_NAME")) {
						int startCell = 7+j;
						cell = row.createCell(startCell);
						
						cell = setColumnValue(cell, bodyValueStyle, mainBodyStyle, thisCol, getData);
						
					}
				}
			}else {
				for(int j = 0; j<addColList.size(); j++) {
					String thisCol = addColList.get(j).toString();
					int startCell = 4+j;
					cell = row.createCell(startCell);
					
					cell = setColumnValue(cell, bodyValueStyle, mainBodyStyle, thisCol, getData);
					
				}
			}
		}
		
		// MERGE CELL
		sheet.addMergedRegion(new CellRangeAddress(5, 8, 0, 0)); // 쇼핑몰 비중
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 1, 1)); // 구분
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 2, 2)); // 합계
		
		return workbook;
	}
	// === 정산정보 엑셀 END === //
	
	// 재고정보 > 재고현황
	public SXSSFWorkbook stockWorkbook(HashMap<String, Object> params, ArrayList<HashMap<String, Object>> resultList,
			ArrayList<HashMap<String, Object>> nonMatchList, ArrayList<HashMap<String, Object>> sumMapList, List<String> addHeaderList) throws Exception {

		// 시트 생성
		SXSSFWorkbook workbook = new SXSSFWorkbook();
		SXSSFSheet sheet = workbook.createSheet("재고현황");
		
		// 시트 스타일
		CellStyle headerStyle = excelstyle.workbookSheetStyle(workbook, "headerStyle");
		CellStyle mainBodyStyle = excelstyle.workbookSheetStyle(workbook, "mainBodyStyle");
		CellStyle bodyValueStyle = excelstyle.workbookSheetStyle(workbook, "bodyValueStyle");
		CellStyle bodyTotalStyle = excelstyle.workbookSheetStyle(workbook, "totalStyle");
		CellStyle totalValueStyle = excelstyle.workbookSheetStyle(workbook, "totalValueStyle");

		sheet.setColumnWidth(1, 4000); // 합계 구분
		sheet.setColumnWidth(2, 3500); // 합계
		sheet.setColumnWidth(3, 3000); // 합계 & 쇼핑몰칸의 넓이는 유지
		sheet.setColumnWidth(4, 3000); 
		sheet.setColumnWidth(5, 3000);
		sheet.setColumnWidth(6, 3000);
		sheet.setColumnWidth(7, 3000);
		sheet.setColumnWidth(8, 3000);
		
		// Header 항목을 바탕으로 칼럼명 리스트 생성
		List<String> addColList = setVariedColumns(addHeaderList);
		
		// Header 생성
		Row row = excelHeaderFunc(sheet, headerStyle, mainBodyStyle, params, "재고현황");

		// 합계 Header
		List<String> shopList = Arrays.asList(params.get("SHOP_NAME_LIST").toString().split(","));
		int shopNum = shopList.size();
		
		row = sheet.createRow(5);

		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰 비중");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("구분");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("합계");

		// 쇼핑몰 분포는 쇼핑몰 개수에 따라 조정
		for (int i = 0; i < shopNum; i++) {
			cell = row.createCell(i + 3);
			cell.setCellStyle(headerStyle);
			cell.setCellValue("쇼핑몰 분포");
		}
		if(shopNum>1) { // merge는 한 칸 이상을 설정해야 제대로 수행됨
			sheet.addMergedRegion(new CellRangeAddress(5, 5, 3, 3+shopNum-1));
		}
		
		// 해당 쇼핑몰만 표시
		row = sheet.createRow(6);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);

		row = setSumHeaderFunc(sheet, headerStyle, 6, shopList, 0);
		
		// 매칭상품건 합계 리스트
		row = sheet.createRow(7);
		
		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("매칭건수");
		
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D8:I8)");
		
		row = shopSumDisplayFunc(sheet, totalValueStyle, 7, shopList, sumMapList, "MATCHED_SUM", 0);
		
		// NON매칭상품건 합계 리스트
		row = sheet.createRow(8);

		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("Non매칭건수");
		
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D9:I9)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 8, shopList, sumMapList, "NONMATCHED_SUM", 0);
		
		// 총 합계 리스트
		row = sheet.createRow(9);

		cell = row.createCell(0);
		cell.setCellStyle(bodyTotalStyle);
		
		cell = row.createCell(1);
		cell.setCellStyle(bodyTotalStyle);
		cell.setCellValue("전체 상품건수");
		
		cell = row.createCell(2); // 총액
		cell.setCellStyle(totalValueStyle);
		cell.setCellFormula("=sum(D10:I10)");

		row = shopSumDisplayFunc(sheet, totalValueStyle, 9, shopList, sumMapList, "TOTAL", 0);
		
		// MAIN DATA HEADER
		row = sheet.createRow(11);
		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("매칭여부");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("상품등록일자");
		cell = row.createCell(2);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰");
		cell = row.createCell(3);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("상품명"); 
		cell = row.createCell(4);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(5);
		cell.setCellStyle(headerStyle); // *** 여기까지 FIX
		
		sheet.addMergedRegion(new CellRangeAddress(11, 11, 3, 5));
	
		for(int h = 0; h<addHeaderList.size(); h++) {
			String thisHead = addHeaderList.get(h).toString();
			int StartCell = 5+h;
			cell = row.createCell(StartCell);
			cell.setCellStyle(headerStyle);
			cell.setCellValue(thisHead);
		}
		
		// MAIN DATA
		// 매칭 상품
		for(int i = 0; i < resultList.size(); i ++) {
			
			HashMap<String, Object> getData = resultList.get(i);
			
			// 고정 칼럼 데이터
			row = sheet.createRow(12+i);
			
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			String thisDate = getData.get("MATCH_CHECK")==null? "-" : getData.get("MATCH_CHECK").toString();
			cell.setCellValue(thisDate);
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			String thisShop = getData.get("REG_DATE")==null? "-" : getData.get("REG_DATE").toString();
			cell.setCellValue(thisShop);
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("SHOP").toString());
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("PRODUCT_NAME").toString());
			cell = row.createCell(4);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(5);
			cell.setCellStyle(mainBodyStyle); 
			
			sheet.addMergedRegion(new CellRangeAddress(i + 12, i + 12, 3, 5));
			
			// 변동 칼럼 데이터
			row = variedColumnData(sheet, mainBodyStyle, bodyValueStyle, i+12, i, getData, addColList, 2);
			
		}
		
		// 매칭 상품 끝나는 row number
		int matchEndRow = resultList.size()+12;
		
		// Non매칭 상품
		for(int j = 0; j<nonMatchList.size(); j++) {	
			
			HashMap<String, Object> getData = nonMatchList.get(j);
			
			// 고정 칼럼 데이터
			row = sheet.createRow(matchEndRow+j);
			
			cell = row.createCell(0);
			cell.setCellStyle(mainBodyStyle);
			String thisDate = getData.get("MATCH_CHECK")==null? "-" : getData.get("MATCH_CHECK").toString();
			cell.setCellValue(thisDate);
			cell = row.createCell(1);
			cell.setCellStyle(mainBodyStyle);
			String thisShop = getData.get("REG_DATE")==null? "-" : getData.get("REG_DATE").toString();
			cell.setCellValue(thisShop);
			cell = row.createCell(2);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("SHOP").toString());
			cell = row.createCell(3);
			cell.setCellStyle(mainBodyStyle);
			cell.setCellValue(getData.get("PRODUCT_NAME").toString());
			cell = row.createCell(4);
			cell.setCellStyle(mainBodyStyle);
			cell = row.createCell(5);
			cell.setCellStyle(mainBodyStyle); 
			
			sheet.addMergedRegion(new CellRangeAddress(j+matchEndRow, j+matchEndRow, 3, 5));
			
			// 변동 칼럼 데이터
			row = variedColumnData(sheet, mainBodyStyle, bodyValueStyle, matchEndRow+j, j, getData, addColList, 2);
		}
		
		sheet.addMergedRegion(new CellRangeAddress(5, 9, 0, 0)); // 쇼핑몰 비중
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 1, 1)); // 구분
		sheet.addMergedRegion(new CellRangeAddress(5, 6, 2, 2)); // 합계
		
		return workbook;
	}
	// === 재고정보 엑셀 END === //
	
	// ===== Cubici Excel 공통 ===== //
	/**
	 * Cubici 공통 HEADER 생성 FUNC
	 * @Param : SXSSFSheet , Header명 스타일 , Header내용 스타일 , Header내용 HashMap{ 쇼핑몰 , 기간 } , 엑셀명
	*/
	private Row excelHeaderFunc(SXSSFSheet sheet, CellStyle headerStyle, CellStyle bodyStyle, HashMap<String, Object> params, String dataTitle) {

		Row row = sheet.createRow(0);

		Cell cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("자료명");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(2);
		cell.setCellStyle(bodyStyle);
		cell.setCellValue(dataTitle);
		cell = row.createCell(3);
		cell.setCellStyle(bodyStyle);

		row = sheet.createRow(1);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("기준일자");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(2);
		cell.setCellStyle(bodyStyle);
		cell.setCellValue(LocalDate.now().toString());
		cell = row.createCell(3);
		cell.setCellStyle(bodyStyle);

		row = sheet.createRow(2);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("검색조건");
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("쇼핑몰");
		cell = row.createCell(2);
		cell.setCellStyle(bodyStyle);
		
		// 쇼핑몰 리스트
		String shopList = params.get("SHOP_NAME_LIST").toString();
		cell.setCellValue(shopList);

		cell = row.createCell(3);
		cell.setCellStyle(bodyStyle);

		row = sheet.createRow(3);

		cell = row.createCell(0);
		cell.setCellStyle(headerStyle);
		cell = row.createCell(1);
		cell.setCellStyle(headerStyle);
		cell.setCellValue("분석기간");
		cell = row.createCell(2);
		cell.setCellStyle(bodyStyle);
		
		if(!dataTitle.equals("재고현황")){
			String dateStr = params.get("fromDate").toString()+" ~ "+params.get("toDate").toString();
			cell.setCellValue(dateStr);
		}else {
			cell.setCellValue("전체");
		}
		
		cell = row.createCell(3);
		cell.setCellStyle(bodyStyle);

		// Merge Cells
		sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1)); // 자료명
		sheet.addMergedRegion(new CellRangeAddress(0, 0, 2, 3)); // 자료명 data
		sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 1)); // 기준일자
		sheet.addMergedRegion(new CellRangeAddress(1, 1, 2, 3)); // 기준일자 data
		sheet.addMergedRegion(new CellRangeAddress(2, 3, 0, 0)); // 검색조건
		sheet.addMergedRegion(new CellRangeAddress(2, 2, 2, 3)); // 쇼핑몰 data
		sheet.addMergedRegion(new CellRangeAddress(3, 3, 2, 3)); // 분석기간 data
		
		return row;
	}
	
	/** 
	 * 칼럼에 따라 body Value 설정 func
	 * 
	 * @Param 대상 Cell, 금액cell 스타일, 데이터cell 스타일, 칼럼명, 데이터Map
	 * @Return 데이터가 입련된 Cell
	*/
	public Cell setColumnValue(Cell cell, CellStyle valueStyle, CellStyle bodyStyle, String columnName, HashMap<String, Object> dataMap) {
			
		// 숫자는 comma 찍어주기 위해 style을 따로
		if(columnName.equals("ORDER_PRICE") || columnName.equals("UNIT_PRICE") || columnName.equals("PRODUCT_PRICE") || columnName.equals("SALES_PRICE") || 
				columnName.equals("QUANTITY") || columnName.equals("SETTLEMENT_AMOUNT_PRE") || columnName.equals("SETTLEMENT_AMOUNT")) {
			
			cell.setCellStyle(valueStyle);
			if(dataMap.get(columnName) == null || Integer.parseInt(dataMap.get(columnName).toString()) == 0) {
				cell.setBlank();
			}else {
				cell.setCellValue(Integer.parseInt(dataMap.get(columnName).toString()));
			}
		}else {
			cell.setCellStyle(bodyStyle);
			String thisVal = (dataMap.get(columnName) == null) ? "-" : dataMap.get(columnName).toString();
			cell.setCellValue(thisVal);
		}
		return cell;
	}
	
	/**
	 * 합계 Header 쇼핑몰 부분 생성 FUNC
	 * 
	 * @Explain 엑셀 상단 합계 부분 쇼핑몰 개수에 따라 칸 수 조정
	 * @Param : SXSSFSheet , String cell 스타일 , int cell 스타일 , 생성시작 row번호 , 데이터 List , Header칼럼명 리스트 , 엑셀구분( 일반 : 0 , 캘린더 : 1 , 재고 : 2 )
	*/
	private Row setSumHeaderFunc(SXSSFSheet sheet, CellStyle headerStyle, int rowNum, List<String> shopNames, int excelFlag) {

		Row row = sheet.getRow(rowNum);

		if (excelFlag == 1) {
			
			for (int i = 0; i < shopNames.size() * 2 - 1; i++) {

				Cell cell = row.createCell(i + 4);
				
				if(i%2==0) {
					for(int s = 0; s < shopNames.size(); s++) {
						cell.setCellStyle(headerStyle);
						cell.setCellValue(shopNames.get(i/2).toString());
						cell = row.createCell(i+5);
						cell.setCellStyle(headerStyle);
					}
					
				}else {
					cell.setCellStyle(headerStyle);
				}
				if(i%2==0) {	
					sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, i+4, i+5));
				}
			}
			
		}else if(excelFlag == 0) {
			for (int i = 0; i < shopNames.size(); i++) {
				Cell cell = row.createCell(i + 3);
				cell.setCellStyle(headerStyle);
				cell.setCellValue(shopNames.get(i).toString());
			}
		}
		return row;
	}
	
	/** 
	 * 등록쇼핑몰별 합계 Row 생성 FUNC
	 * 
	 * @Explain 엑셀 Body목록 상단 등록쇼핑몰에 따라 칸 수 조정
	 * @Param SXSSFSheet , 셀 스타일 , 시작되는 row번호, 쇼핑몰 리스트, 합계 데이터, 엑셀구분( 일반 : 0 , 캘린더 : 1 , 캘린더 전체합계 : 2 ) 
	 * @Return 합계 데이터가 입력된 Row
	*/
	private Row shopSumDisplayFunc(SXSSFSheet sheet, CellStyle cellStyle, int rowNum, List<String> shopList, 
			ArrayList<HashMap<String, Object>> sumList, String category, int excelFlag) {
	
		Row row = sheet.getRow(rowNum);
		
		// Map Setting
		HashMap<String, Object> sumMap = new HashMap<String, Object>();
		if(!category.equals("TOTAL")) {
			for(int i = 0; i<sumList.size(); i++ ) {
				String thisShop = sumList.get(i).get("SHOP").toString();
				int thisCategoryVal = (sumList.get(i).get(category) == null) ? 0 : Integer.parseInt(sumList.get(i).get(category).toString());
				sumMap.put(thisShop, thisCategoryVal);	
			}
		}else {
			sumMap = getTotalSumMap(sumList, shopList, excelFlag);
		}
		
		// Row Create
		if (excelFlag == 0 || excelFlag == 2) { // 일반 엑셀
		
		for (int i = 0; i < shopList.size(); i++) {
			Cell cell = row.createCell(i + 3);
			cell.setCellStyle(cellStyle);
			int thisVal = sumMap.get(shopList.get(i)) == null? 0 : Integer.parseInt(sumMap.get(shopList.get(i).toString()).toString());
			cell.setCellValue(thisVal);
		}
		
		} else if (excelFlag == 1) { // 캘린더 엑셀
		
			for (int i = 0; i < shopList.size() * 2 - 1; i++) {
				Cell cell = row.createCell(i + 4);
				cell.setCellStyle(cellStyle);
				if(i%2==0) {
					for(int s = 0; s < shopList.size(); s++) {
						int thisVal= sumMap.get(shopList.get(i/2))==null? 0 : Integer.parseInt(sumMap.get(shopList.get(i/2)).toString());
						cell.setCellValue(thisVal);
					}
				}
				cell = row.createCell(i + 5);
				cell.setCellStyle(cellStyle);
				
				if(i%2==0) {
					sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, i+4, i+5));
				}
			}
		
		}
		return row;
	}
	
	/**
	 * 전체 합계 구한 후 Map 생성 FUNC
	 * 
	 * @Explain : 캘린더와 재고정보 엑셀에서는 전체 합계를 상단에 표시하는데 이를 가져온 list에서 산출한 후 맵에 저장한다. 
	 * @Param : 합계 리스트 , 쇼핑몰 리스트 , 엑셀구분( 캘린더 : 0 , 재고 : 1 )
	*/
	private HashMap<String, Object> getTotalSumMap (ArrayList<HashMap<String, Object>> sumList, List<String> shopList, int flag){
		
		HashMap<String, Object> resultMap = new	HashMap<String, Object>();
			
		sumList.forEach( mem -> {
			
			int getSettleVal = 0;			
			int getPreVal = 0;
			int getTotalVal = 0;
			
			String thisShop = mem.get("SHOP").toString();
			
			if(shopList.contains(thisShop)) {
				
				if(flag == 1) {
					
					getSettleVal += mem.get("SETTLE_AMOUNT") == null ? 0 : Integer.parseInt(mem.get("SETTLE_AMOUNT").toString());
					getPreVal += mem.get("PRE_SETTLE_AMOUNT") == null ? 0 : Integer.parseInt(mem.get("PRE_SETTLE_AMOUNT").toString());
					getTotalVal = getSettleVal + getPreVal;
				}
				
				if(flag == 0) {
					getSettleVal += mem.get("MATCHED_SUM") == null ? 0 : Integer.parseInt(mem.get("MATCHED_SUM").toString());
					getPreVal += mem.get("NONMATCHED_SUM") == null ? 0 : Integer.parseInt(mem.get("NONMATCHED_SUM").toString());
					getTotalVal = getSettleVal + getPreVal;
				}
				
				resultMap.put(thisShop, getTotalVal);
			}
		});
		return resultMap;
	}
	
	/** 
	 * Main Data 변동 칼럼 데이터 
	 * 
	 * @Explain : 웹페이지에서 셀러가 선택한 칼럼 데이터만 엑셀 출력이 될 수 있도록 한다.
	 * @Param : 엑셀 시트 , 일반데이터 셀스타일 , 수 데이터 셀스타일 , 시작하는 행 번호 , 데이터 순번 , 데이터 HashMap , 변동칼럼 리스트 , 엑셀 구분
	 * @Return : 변동 칼럼 데이터가 채워진 row
	*/
	private Row variedColumnData(SXSSFSheet sheet, CellStyle bodyStyle, CellStyle valueStyle, int rowNum, int dataInt,
									HashMap<String, Object> dataMap, List<String> columnList, int excelFlag) {
		
		Row row = sheet.getRow(rowNum);
		
		int startCell = 0;
		
		// 변경 칼럼 data
		// 상품명(PRODUCT_NAME)이 항목에 있으면 무조건 fix 항목들 다음에 나오도록 설정
		if(columnList.contains("PRODUCT_NAME") == true && excelFlag != 2) {
			
			Cell cell = row.createCell(4);
			cell.setCellStyle(bodyStyle);
			cell.setCellValue(dataMap.get("PRODUCT_NAME").toString());
			cell = row.createCell(5);
			cell.setCellStyle(bodyStyle);
			cell = row.createCell(6);
			cell.setCellStyle(bodyStyle);
			cell = row.createCell(7);
			cell.setCellStyle(bodyStyle);
			
			sheet.addMergedRegion(new CellRangeAddress(dataInt + 11, dataInt + 11, 4, 7)); // 상품명 4칸 merge
			
			startCell = 7;
			
		} else {
		
			startCell = 5;
		}
		
		for(int c = 0; c<columnList.size(); c++) {
			
			String thisCol = columnList.get(c).toString();
			
			if(!thisCol.equals("PRODUCT_NAME")) {
				Cell cell = row.createCell(startCell+c);
				cell = setColumnValue(cell, valueStyle, bodyStyle, thisCol, dataMap);
			}
		}
		
		return row;
	}
	
	/** 
	 * 페이지에서 가져온 Header 항목을 Data 칼럼명으로 변경 FUNC
	 * 
	 * @Explain : 웹페이지에서 Header 항목 변경시 엑셀에서도 똑같이 출력이 되야하는데, String으로 페이지에서 받아온 Header 항목들을 
	 * 엑셀 구성시 데이터 세트 컬럼명에 통일해준다.
	 * 
	 * @Param : Header 항목 String list
	 * @Return : 데이터 칼럼명 String 리스트 
	*/
	public List<String> setVariedColumns(List<String> headList) {
		
		List<String> resultList = new ArrayList<String>();
		resultList.addAll(headList);
		
		for(int i=0; i<resultList.size(); i++) {
			
			String colName = resultList.get(i).toString();
			
			if(colName.equals("상품명")) {
				resultList.set(i, "PRODUCT_NAME");
				continue;
			} else if(colName.equals("쇼핑몰상품번호") || colName.equals("상품번호")) {
				resultList.set(i, "PRODUCT_NO");
				continue;
			} else if(colName.equals("판매단가")) {
				resultList.set(i, "UNIT_PRICE");
				continue;
			} else if(colName.equals("판매수량")) {
				resultList.set(i, "QUANTITY");
				continue;
			} else if(colName.equals("주문금액")) {
				resultList.set(i, "ORDER_PRICE");
				continue;
			} else if(colName.equals("택배사")) {
				resultList.set(i, "DELIVERY_COMPANY_NAME");
				continue;
			}else if(colName.equals("구매확정일자") || colName.equals("구매결정일자")) {
				resultList.set(i, "CONFIRM_DATE");
				continue;
			}else if(colName.equals("배송완료일자") || colName.equals("배송완료일")) {
				resultList.set(i, "DELIVERED_DATE");
				continue;
			}else if(colName.equals("내부관리번호")) {
				resultList.set(i, "MANAGE_CODE");
				continue;
			}else if(colName.equals("수령자")) {
				resultList.set(i, "RECEIVER_NAME");
				continue;
			}else if(colName.equals("수거송장번호")) {
				resultList.set(i, "COLLECTION_INVOICE_NO");
				continue;
			}else if(colName.equals("재배송송장번호")) {
				resultList.set(i, "REDELIVERY_INVOICE_NO");
				continue;
			}else if(colName.equals("주문일자")) {
				resultList.set(i, "ORDERED_AT");
				continue;
			}else if(colName.equals("(반품/교환)신청일") || colName.equals("신청일자")) {
				resultList.set(i, "REQUEST_DATE");
				continue;
			}else if(colName.equals("구매자명")) {
				resultList.set(i, "CUSTOM_NAME");
				continue;
			}else if(colName.equals("구매자 ID") || colName.equals("구매자ID")) {
				resultList.set(i, "CUSTOM_ID");
				continue;
			}else if(colName.equals("판매가격")) {
				resultList.set(i, "SALE_PRICE");
				continue;
			}else if(colName.equals("반품/교환 수량")) {
				resultList.set(i, "QUANTITY");
				continue;
			}else if(colName.equals("송장번호")) {
				resultList.set(i, "INVOICE_NO");
				continue;
			}else if(colName.equals("정산예정일") || colName.equals("정산예상일")) {
				resultList.set(i, "SETTLEMENT_DATE_PRE");
				continue;
			}else if(colName.equals("정산예정액")) {
				resultList.set(i, "SETTLEMENT_AMOUNT_PRE");
				continue;
			}else if(colName.equals("정산입금일")) {
				resultList.set(i, "SETTLEMENT_DATE");
				continue;
			}else if(colName.equals("카테고리")) {
				resultList.set(i, "CATEGORY");
				continue;
			}else if(colName.equals("브랜드")) {
				resultList.set(i, "BRAND");
				continue;
			}else if(colName.equals("쇼핑몰 상품 #")) {
				resultList.set(i, "PRODUCT_NO");
				continue;
			}else if(colName.equals("내부 상품 #")) {
				resultList.set(i, "MANAGE_CODE");
				continue;
			}else if(colName.equals("Cubici 상품 #")) {
				resultList.set(i, "CUBICI_CODE");
				continue;
			}else if(colName.equals("옵션1")) {
				resultList.set(i, "OPTION1");
				continue;
			}else if(colName.equals("옵션2")) {
				resultList.set(i, "OPTION2");
				continue;
			}else if(colName.equals("옵션3")) {
				resultList.set(i, "OPTION3");
				continue;
			}else if(colName.equals("본사재고")) {
				resultList.set(i, "HEAD_INVEN");
				continue;
			}else if(colName.equals("쇼핑몰 재고")) {
				resultList.set(i, "STOCK_QUANTITY");
				continue;
			}else if(colName.equals("판매등록 일시")) {
				resultList.set(i, "REG_DATE");
				continue;
			}else if(colName.equals("배송비")) {
				resultList.set(i, "D_CHARGE");
				continue;
			}
		}
		return resultList;
	}
	
}
