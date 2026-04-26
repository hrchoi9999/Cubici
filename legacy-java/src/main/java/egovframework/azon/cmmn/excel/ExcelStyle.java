package egovframework.azon.cmmn.excel;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Component;

@Component
class ExcelStyle {

	public CellStyle workbookSheetStyle(SXSSFWorkbook workbook, String param) {
		Font fontSelect = (param.equals("headerStyle") || param.equals("totalStyle") ||
				param.equals("totalValueStyle")) ? ExcelFont(workbook, "header") : ExcelFont(workbook, "body");// font style 선택
		
		CellStyle cellStyle = ExcelCellStyle(workbook, param, fontSelect);//cellstyle생성
		
		return cellStyle;
	}
	
	private Font ExcelFont(SXSSFWorkbook workbook, String param) {
		Font font = workbook.createFont();
		
		font.setFontName("Arial");
		font.setFontHeightInPoints((short) 10);
		
		if(param.equals("header")) {
			font.setBold(true);
		}
		
		return font;
	}
	
	@SuppressWarnings("static-access")
	private CellStyle ExcelCellStyle(SXSSFWorkbook workbook, String param, Font font) {
		
		CellStyle cellStyle = workbook.createCellStyle();
		cellStyle.setFont(font);
		cellStyle.setAlignment(HorizontalAlignment.CENTER);
		cellStyle.setBorderTop(BorderStyle.THIN);
		cellStyle.setBorderBottom(BorderStyle.THIN);
		cellStyle.setBorderLeft(BorderStyle.THIN);
		cellStyle.setBorderRight(BorderStyle.THIN);
		if(!param.equals("mainBodyStyle")) {
			cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
		}
		
		short  groundColor = (param.equals("headerStyle")) ? IndexedColors.PALE_BLUE.getIndex() : IndexedColors.GREY_25_PERCENT.getIndex();
		
		if (param.equals("headerStyle") || param.equals("mainBodyStyle") || param.equals("totalStyle")) {
			cellStyle.setFillForegroundColor(groundColor); // 배경색
			cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		}
		
		DataFormat format = workbook.createDataFormat();
		
		if (param.equals("bodyValueStyle") || param.equals("totalValueStyle")) {
			cellStyle.setDataFormat(format.getFormat("#,##0"));
		}

		return cellStyle;
	}
}
