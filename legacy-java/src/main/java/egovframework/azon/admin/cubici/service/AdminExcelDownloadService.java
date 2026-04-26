package egovframework.azon.admin.cubici.service;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AdminExcelDownloadService {
	
	Logger logger = LoggerFactory.getLogger(AdminExcelDownloadService.class);
	
	// *** 큐빅아이 통합정보
	// * 종합지표
	// * 매출지표 (그래프별)
	// * 활동지표

	// *** 머니뱅크 통합정보
	// * 현황종합
	// * 운영지표

	// *** 회원관리
	// * 회원현황 종합
	// * 회원상세
	// * 해지상세

	// ***** HEADER & SUMHEADER 공통함수 START (MKC 2021.02.16) ***** //
	/* HEADER 함수 2021. 02 .02 by MKC */
	private Row excelHeaderFunc(SXSSFSheet sheet, CellStyle headerStyle, CellStyle bodyStyle,
			HashMap<String, Object> params, String dataTitle) {

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
		cell.setCellValue(todayMethod());
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

		if (!dataTitle.equals("재고현황")) {
			String dateStr = params.get("fromDate").toString() + " ~ " + params.get("toDate").toString();
			cell.setCellValue(dateStr);
		} else {
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

	// 현재 시간
	private String todayMethod() {

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date now = new Date();
		String nowStr = sdf.format(now);

		return nowStr;
	}

	// 합계 Map 생성 (category == 칼럼명)
	public HashMap<String, Object> getSumMapData(ArrayList<HashMap<String, Object>> sumList, String category) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();

		int iparkVal = 0;
		int elevenVal = 0;
		int gmrktVal = 0;
		int aucVal = 0;
		int naverVal = 0;
		int cpangVal = 0;

		for (int i = 0; i < sumList.size(); i++) {
			if (sumList.get(i).get(category) != null) {
				if (sumList.get(i).get("SHOP").equals("인터파크")) {
					iparkVal = Integer.parseInt(sumList.get(i).get(category).toString());
					continue;
				} else if (sumList.get(i).get("SHOP").equals("11번가")) {
					elevenVal = Integer.parseInt(sumList.get(i).get(category).toString());
					continue;
				} else if (sumList.get(i).get("SHOP").equals("지마켓")) {
					gmrktVal = Integer.parseInt(sumList.get(i).get(category).toString());
					continue;
				} else if (sumList.get(i).get("SHOP").equals("옥션")) {
					aucVal = Integer.parseInt(sumList.get(i).get(category).toString());
					continue;
				} else if (sumList.get(i).get("SHOP").equals("네이버")) {
					naverVal = Integer.parseInt(sumList.get(i).get(category).toString());
					continue;
				} else if (sumList.get(i).get("SHOP").equals("쿠팡")) {
					cpangVal = Integer.parseInt(sumList.get(i).get(category).toString());
					continue;
				}
			} else {
				continue;
			}
		}
		resultMap.put("인터파크", iparkVal);
		resultMap.put("11번가", elevenVal);
		resultMap.put("11ST", elevenVal);
		resultMap.put("지마켓", gmrktVal);
		resultMap.put("옥션", aucVal);
		resultMap.put("네이버", naverVal);
		resultMap.put("쿠팡", cpangVal);

		return resultMap;
	}

	// 쇼핑몰별 합계리스트를 전체 합계로 합치는 FUNC
	private HashMap<String, Object> getTotalSumMap(ArrayList<HashMap<String, Object>> sumList, String shops[],
			String flag) {

		HashMap<String, Object> resultMap = new HashMap<String, Object>();

		for (int i = 0; i < shops.length; i++) {
			String thisShop = shops[i];
			int getSettleVal = 0;
			int getPreVal = 0;
			int getTotalVal = 0;

			for (int j = 0; j < sumList.size(); j++) {
				if (sumList.get(j).get("SHOP").equals(thisShop)) {
					if (flag.equals("calendar")) {
						getSettleVal += sumList.get(j).get("SETTLE_AMOUNT") == null ? 0
								: Integer.parseInt(sumList.get(j).get("SETTLE_AMOUNT").toString());
						getPreVal += sumList.get(j).get("PRE_SETTLE_AMOUNT") == null ? 0
								: Integer.parseInt(sumList.get(j).get("PRE_SETTLE_AMOUNT").toString());
						getTotalVal = getSettleVal + getPreVal;
					} else if (flag.equals("stock")) {
						getSettleVal += sumList.get(j).get("MATCHED_SUM") == null ? 0
								: Integer.parseInt(sumList.get(j).get("MATCHED_SUM").toString());
						getPreVal += sumList.get(j).get("NONMATCHED_SUM") == null ? 0
								: Integer.parseInt(sumList.get(j).get("NONMATCHED_SUM").toString());
						getTotalVal = getSettleVal + getPreVal;
					}
				}
				resultMap.put(thisShop, getTotalVal);
			}
		}
		return resultMap;
	}

	// 합계 Header 쇼핑몰 부분 FUNC (행과 열 번호 입력)
	private Row setSumHeaderFunc(SXSSFSheet sheet, int rowNum, int colnum, String[] shopNames, int shopnums,
			String excelFlag, CellStyle headerStyle, String flag) {

		Row row = sheet.getRow(rowNum);

		if (excelFlag.equals("calendar")) {

			for (int i = 0; i < shopNames.length * 2 - 1; i++) {

				Cell cell = row.createCell(i + 4);
				if (i % 2 == 0) {
					for (int s = 0; s < shopNames.length; s++) {
						if (flag.equals("shops")) {
							cell.setCellStyle(headerStyle);
							cell.setCellValue(shopNames[i / 2].toString());

							cell = row.createCell(i + 5);
							cell.setCellStyle(headerStyle);

						} else if (flag.equals("sums")) {
							int settleVal = (int) sheet.getRow(rowNum + 1).getCell(colnum).getNumericCellValue();
							int preVal = (int) sheet.getRow(rowNum + 2).getCell(colnum).getNumericCellValue();

							cell.setCellStyle(headerStyle);
							cell.setCellValue(settleVal + preVal);

							cell = row.createCell(i + 5);
							cell.setCellStyle(headerStyle);

						}
					}
				} else {
					cell.setCellStyle(headerStyle);
				}
				if (i % 2 == 0) {
					sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, i + 4, i + 5));
				}
			}

		} else if (excelFlag.equals("sales")) {
			for (int i = 0; i < shopNames.length; i++) {
				Cell cell = row.createCell(i + 3);
				if (flag.equals("shops")) {
					cell.setCellStyle(headerStyle);
					cell.setCellValue(shopNames[i].toString());
				}
			}
		}

		return row;
	}

	// 등록 쇼핑몰 합계 데이터 입력 FUNC (행 번호 입력)
	private Row shopSumDisplayFunc(SXSSFSheet sheet, int rowNum, String shopList, CellStyle cellStyle,
			HashMap<String, Object> sumMap, String excelFlag) {

		Row row = sheet.getRow(rowNum);

		String shops[] = shopList.split(",");

		if (excelFlag.equals("sales")) {

			for (int i = 0; i < shops.length; i++) {

				Cell cell = row.createCell(i + 3);
				cell.setCellStyle(cellStyle);
				int thisVal = sumMap.get(shops[i]) == null ? 0 : Integer.parseInt(sumMap.get(shops[i]).toString());
				cell.setCellValue(thisVal);
			}

		} else if (excelFlag.equals("calendar")) { // calendar sum

			for (int i = 0; i < shops.length * 2 - 1; i++) {
				Cell cell = row.createCell(i + 4);
				cell.setCellStyle(cellStyle);

				if (i % 2 == 0) {
					for (int s = 0; s < shops.length; s++) {
						int thisVal = sumMap.get(shops[i / 2]) == null ? 0
								: Integer.parseInt(sumMap.get(shops[i / 2]).toString());
						cell.setCellValue(thisVal);

					}
				}
				cell = row.createCell(i + 5);
				cell.setCellStyle(cellStyle);

				if (i % 2 == 0) {
					sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, i + 4, i + 5));
				}
			}

		} else if (excelFlag.equals("totalSum")) { // calendar total sum

			for (int i = 0; i < shops.length * 2 - 1; i++) {
				Cell cell = row.createCell(i + 4);
				cell.setCellStyle(cellStyle);

				if (i % 2 == 0) {
					for (int s = 0; s < shops.length; s++) {

						int thisVal = sumMap.get(shops[i / 2]) == null ? 0
								: Integer.parseInt(sumMap.get(shops[i / 2]).toString());
						cell.setCellValue(thisVal);
					}
				}

				cell = row.createCell(i + 5);
				cell.setCellStyle(cellStyle);

				if (i % 2 == 0) {
					sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, i + 4, i + 5));
				}
			}
		}

		return row;
	}
	// ***** HEADER & SUMHEADER 공통함수 END ***** //

	// ***** Style 공통 함수 2021.03.09 by MKC ***** //
	@SuppressWarnings("static-access")
	private CellStyle workbookSheetStyle(SXSSFWorkbook workbook, String param) {

		// 폰트
		Font headerFont = workbook.createFont();
//		headerFont.setFontName("맑은 고딕");
		headerFont.setFontName("Arial");
		headerFont.setBold(true);
		headerFont.setFontHeightInPoints((short) 10);
		Font bodyFont = workbook.createFont();
//		bodyFont.setFontName("맑은 고딕");
		bodyFont.setFontName("Arial");
		bodyFont.setFontHeightInPoints((short) 10);

		// ** 숫자 아닌 Data 들어가는 셀 STYLE **//
		// Header Style
		CellStyle headerStyle = workbook.createCellStyle();
		headerStyle.setFont(headerFont);
		headerStyle.setAlignment(HorizontalAlignment.CENTER); // 가로 가운데 정렬
		headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
		headerStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex()); // 배경색
		headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		headerStyle.setBorderTop(BorderStyle.THIN);
		headerStyle.setBorderBottom(BorderStyle.THIN);
		headerStyle.setBorderLeft(BorderStyle.THIN);
		headerStyle.setBorderRight(BorderStyle.THIN);

		// Data Body Style
		CellStyle mainBodyStyle = workbook.createCellStyle();
		mainBodyStyle.setFont(bodyFont);
		mainBodyStyle.setAlignment(HorizontalAlignment.CENTER); // 가운데 정렬
		mainBodyStyle.setBorderTop(BorderStyle.THIN);
		mainBodyStyle.setBorderBottom(BorderStyle.THIN);
		mainBodyStyle.setBorderLeft(BorderStyle.THIN);
		mainBodyStyle.setBorderRight(BorderStyle.THIN);

		// 합계 표시 Style
		CellStyle totalStyle = workbook.createCellStyle();
		totalStyle.setFont(headerFont);
		totalStyle.setAlignment(HorizontalAlignment.CENTER); // 가로 가운데 정렬
		totalStyle.setVerticalAlignment(VerticalAlignment.CENTER);
		totalStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex()); // 배경색
		totalStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		totalStyle.setBorderTop(BorderStyle.THIN);
		totalStyle.setBorderBottom(BorderStyle.THIN);
		totalStyle.setBorderLeft(BorderStyle.THIN);
		totalStyle.setBorderRight(BorderStyle.THIN);

		// ** 숫자 들어가는 셀 STYLE **//
		DataFormat format = workbook.createDataFormat();
		// Data Body 숫자 셀
		CellStyle bodyValueStyle = workbook.createCellStyle();
		bodyValueStyle.setFont(bodyFont);
		bodyValueStyle.setAlignment(HorizontalAlignment.CENTER); // 가운데 정렬
		bodyValueStyle.setVerticalAlignment(VerticalAlignment.CENTER);
		bodyValueStyle.setBorderTop(BorderStyle.THIN);
		bodyValueStyle.setBorderBottom(BorderStyle.THIN);
		bodyValueStyle.setBorderLeft(BorderStyle.THIN);
		bodyValueStyle.setBorderRight(BorderStyle.THIN);
		bodyValueStyle.setDataFormat(format.getFormat("#,##0"));

		// 합계 style 셀
		CellStyle totalValueStyle = workbook.createCellStyle();
		totalValueStyle.setFont(headerFont);
		totalValueStyle.setAlignment(HorizontalAlignment.CENTER); // 가로 가운데 정렬
		totalValueStyle.setVerticalAlignment(VerticalAlignment.CENTER);
		totalValueStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex()); // 배경색
		totalValueStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		totalValueStyle.setBorderTop(BorderStyle.THIN);
		totalValueStyle.setBorderBottom(BorderStyle.THIN);
		totalValueStyle.setBorderLeft(BorderStyle.THIN);
		totalValueStyle.setBorderRight(BorderStyle.THIN);
		totalValueStyle.setDataFormat(format.getFormat("#,##0"));

		if (param.equals("headerStyle")) {
			return headerStyle;
		} else if (param.equals("mainBodyStyle")) {
			return mainBodyStyle;
		} else if (param.equals("totalStyle")) {
			return totalStyle;
		} else if (param.equals("bodyValueStyle")) {
			return bodyValueStyle;
		} else if (param.equals("totalValueStyle")) {
			return totalValueStyle;
		} else {
			System.out.println(" [ ERROR ] [ Excel Style 생성 Fail ] ");
			return null;
		}
	}

	// EXCEL 파일 생성 & export FUNC
	public void excelExport(Map<String, Object> params, HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		// 로컬 & 파일명
		Locale locale = Locale.KOREA;
		String workbookName = (String) params.get("workbookName");

		// 겹치는 파일 이름 중복을 피하기 위해 시간을 이용해서 파일 이름에 추가
		Date date = new Date();
		SimpleDateFormat dayformat = new SimpleDateFormat("yyyyMMdd", locale);
		SimpleDateFormat hourformat = new SimpleDateFormat("hhmmss", locale);
		String day = dayformat.format(date);
		String hour = hourformat.format(date);
		String fileName = workbookName + "_" + day + "_" + hour + ".xlsx";

		// 여기서부터는 각 브라우저에 따른 파일이름 인코딩작업
		String browser = request.getHeader("User-Agent");
		if (browser.indexOf("MSIE") > -1) {
			fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.indexOf("Trident") > -1) { // IE11
			fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.indexOf("Firefox") > -1) {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.indexOf("Opera") > -1) {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.indexOf("Chrome") > -1) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < fileName.length(); i++) {
				char c = fileName.charAt(i);
				if (c > '~') {
					sb.append(URLEncoder.encode("" + c, "UTF-8"));
				} else {
					sb.append(c);
				}
			}
			fileName = sb.toString();
		} else if (browser.indexOf("Safari") > -1) {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		} else {
			fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
		}

		response.setContentType("application/download;charset=utf-8");
		response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\";");
		response.setHeader("Content-Transfer-Encoding", "binary");

		OutputStream os = null;
		SXSSFWorkbook workbook = null;

		try {
			workbook = (SXSSFWorkbook) params.get("workbook");

			os = response.getOutputStream();
			// 파일생성
			workbook.write(os);
		} catch (Exception e) {
			logger.error(e.getMessage());
		} finally {
			if (workbook != null) {
				try {
					workbook.close();
				} catch (Exception e) {
					logger.error(e.getMessage());
				}
			}
			if (os != null) {
				try {
					os.close();
				} catch (Exception e) {
					logger.error(e.getMessage());
				}
			}
		}
	}
	// ***** Style 공통 함수 END *****//
}
