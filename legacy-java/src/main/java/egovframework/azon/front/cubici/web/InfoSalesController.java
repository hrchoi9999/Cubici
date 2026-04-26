package egovframework.azon.front.cubici.web;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.excel.ExcelComponent;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.cubici.service.InfoSalesService;

/* 큐빅아이 > 매출정보 controller
 * 2021. 02. 17
 * by KJC */
@Controller
public class InfoSalesController {

	Logger logger = LoggerFactory.getLogger(InfoSalesController.class);

	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	InfoSalesService infoSalesService;
	
	@Autowired
	ExcelComponent excelComponent;

	// 매출정보 > 매출 페이지
	@RequestMapping(value = "/cubici/salesInfo/sales", method = RequestMethod.GET)
	public ModelAndView salesPage() {

		logger.debug(" [ /cubici/salesInfo/sales ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "infoSales/sales");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);

			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);
			
			// 사용자의 쇼핑몰 정보는 없으면 안됨
			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/salesInfo/sales ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
				
				// 기본 날짜 설정
				HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
				mav.addObject("fromDate", defaultDate.get("fromDate").toString());
				mav.addObject("toDate", defaultDate.get("toDate").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// [모바일] 매출정보 > 매출 페이지
	@RequestMapping(value = "/m/cubici/salesInfo/sales", method = RequestMethod.GET)
	public ModelAndView mobileSalesPage() {

		logger.debug(" [ /m/cubici/salesInfo/sales ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "infoSales/m_sales");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);

			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);
			
			// 사용자의 쇼핑몰 정보는 없으면 안됨
			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /m/cubici/salesInfo/sales ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
				
				// 기본 날짜 설정
				HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
				mav.addObject("fromDate", defaultDate.get("fromDate").toString());
				mav.addObject("toDate", defaultDate.get("toDate").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 매출 목록
	@RequestMapping(value = "/cubici/salesInfo/sales/get", method = RequestMethod.POST)
	public ModelAndView selectSales(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/salesInfo/sales/get ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/salesInfo/sales/get ] " + CmmMessage.parameter_relay_error);
			} else {
				// 매출 목록
				ArrayList<HashMap<String, Object>> salesList = infoSalesService.selectSalesList(paramMap);
				mav.addObject("currentPage", paramMap.get("NOWPAGENO").toString());
				mav.addObject("salesList", salesList);
				// 매출 합계
				paramMap.put("salesFlag", "sum");
				ArrayList<HashMap<String, Object>> salesSum = infoSalesService.selectSalesList(paramMap);
				mav.addObject("totalCount", salesSum.get(0).get("TOTAL_COUNT"));
				mav.addObject("quantity", salesSum.get(0).get("QUANTITY"));
				mav.addObject("orderPrice", salesSum.get(0).get("ORDER_PRICE"));
				mav.addObject("cnt", salesSum.get(0).get("CNT"));
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 상세주문번호 조회
	@RequestMapping(value = "/cubici/salesInfo/sales/detailOrderNo", method = RequestMethod.POST)
	public ModelAndView selectSalesdetailOrderNo(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/salesInfo/sales/detailOrderNo ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		  try {
			  if (paramMap == null || paramMap.isEmpty()) { 
				  resultCode = 88;
				  logger.debug(" [ ERROR ] [ /cubici/salesInfo/sales/get ] " + CmmMessage.parameter_relay_error); 
			  } else {
				  ArrayList<HashMap<String, Object>> salesList = infoSalesService.selectSalesList(paramMap); 
				  mav.addObject("salesList",salesList); 
			  } 
		  } catch (Exception e) { 
			  resultCode = 99; 
			  logger.error(e.getMessage());
		  } finally {
			  mav.addObject("resultCode", resultCode); 
		  }

		return mav;
	}

	// 매출정보 > 반품/교환 페이지
	@RequestMapping(value = "/cubici/salesInfo/return", method = RequestMethod.GET)
	public ModelAndView returnPage() {

		logger.debug(" [ /cubici/salesInfo/return ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "infoSales/return");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);

			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);
			
			// 사용자의 쇼핑몰 정보는 없으면 안됨
			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/salesInfo/return ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);

				// 기본 날짜 설정
				HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
				mav.addObject("fromDate", defaultDate.get("fromDate").toString());
				mav.addObject("toDate", defaultDate.get("toDate").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// [모바일] 매출정보 > 반품/교환 페이지
	@RequestMapping(value = "/m/cubici/salesInfo/return", method = RequestMethod.GET)
	public ModelAndView mobileReturnPage() {

		logger.debug(" [ /m/cubici/salesInfo/return ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "infoSales/m_return");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);

			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);
			
			// 사용자의 쇼핑몰 정보는 없으면 안됨
			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /m/cubici/salesInfo/return ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);

				// 기본 날짜 설정
				HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
				mav.addObject("fromDate", defaultDate.get("fromDate").toString());
				mav.addObject("toDate", defaultDate.get("toDate").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 반품 목록
	@RequestMapping(value = "/cubici/salesInfo/return/get", method = RequestMethod.POST)
	public ModelAndView selectReturn(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/salesInfo/return/get ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/salesInfo/return/get ] " + CmmMessage.parameter_relay_error);
			} else {
				// 반품 목록
				ArrayList<HashMap<String, Object>> returnList = infoSalesService.selectReturnList(paramMap);
				mav.addObject("returnList", returnList);
				
				if(!String.valueOf(paramMap.get("FLAG")).equals("orderDetail")) {
					// 반품 합계
					paramMap.put("returnFlag", "sum");
					ArrayList<HashMap<String, Object>> returnSum = infoSalesService.selectReturnList(paramMap);
					mav.addObject("returnSum", returnSum);
					mav.addObject("currentPage", paramMap.get("NOWPAGENO").toString()); 
				}
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// *** SALESLIST EXCEL DOWNLOAD (MKC 2021.02.26) ***//
	@RequestMapping(value = "/cubici/salesInfo/salesList/excelDownload", method = RequestMethod.POST)
	public void salesExcelDownload(HttpServletRequest request, HttpServletResponse response) {
		
		logger.debug(" [ /cubici/salesInfo/salesList/excelDownload ] ");

		try {
			// Parameters 저장
			HashMap<String, Object> excelParams = new HashMap<String, Object>();
			HashMap<String, Object> timeInfo = CubiciUtils.defaultSetDate();
			
			excelParams.put("USER_NO", request.getParameter("userNo").toString());
			
			// check headers
			List<String> headList = Arrays.asList(request.getParameter("this_header").toString().split(","));
			List<String> columnList = excelComponent.setVariedColumns(headList);
			
			// 날짜 설정 (날짜 추가되면 수정예정)
			excelParams.put("fromDate", request.getParameter("fromDate"));
			excelParams.put("toDate", request.getParameter("toDate"));

			if (excelParams.get("fromDate") == null || excelParams.get("fromDate").equals("")) {
				excelParams.put("fromDate", timeInfo.get("fromDate"));
			}

			if (excelParams.get("toDate") == null || excelParams.get("toDate").equals("")) {
				excelParams.put("toDate", timeInfo.get("toDate"));
			}
			
			// 선택 기준 (통합정보 only)
			if(request.getParameter("standard") != null) {
				excelParams.put("SELECT_CONDITION", request.getParameter("standard").toString());
			}
			
			// EXCEL FLAG(0 : 판매현황 , 1 : 반품교환)
			int excelFlag = Integer.parseInt(request.getParameter("excel_flag").toString());
			
			// 쇼핑몰 정보 for QUERY
			excelParams.put("COUPANG_SETTLEMENT_TYPE", request.getParameter("coupang_settle_type").toString());
			excelParams.put("SHOP_TYPE_LIST", request.getParameter("shop_type_list").toString());
			excelParams.put("INTERPARK_ID", request.getParameter("interpark_id").toString());
			excelParams.put("GMARKET_ID", request.getParameter("gmarket_id").toString());
			excelParams.put("AUCTION_ID", request.getParameter("auction_id").toString());
			excelParams.put("COUPANG_ID", request.getParameter("coupang_id").toString());
			excelParams.put("ELEVEN_ID", request.getParameter("eleven_id").toString());
			excelParams.put("NAVER_ID", request.getParameter("naver_id").toString());
			excelParams.put("SHOP_NAME_LIST", request.getParameter("shop_name_list").toString());
			excelParams.put("ORDER_BY", request.getParameter("selectOrderBy").toString());
			excelParams.put("STATUS", request.getParameter("selectDivision").toString());
			excelParams.put("PRODUCT_NAME", "%%");
			
			ArrayList<HashMap<String, Object>> resultList = new ArrayList<HashMap<String, Object>>(); // 메인 데이터
			ArrayList<HashMap<String, Object>> sumMapList = new ArrayList<HashMap<String, Object>>(); // 합계 데이터
			ArrayList<HashMap<String, Object>> exchSumList = new ArrayList<HashMap<String, Object>>(); // 교환 합계 데이터
			
			if(excelFlag == 0) {
				// 판매현황
				excelParams.put("salesFlag", "excelSales");
				resultList = infoSalesService.selectSalesList(excelParams);
	
				// 합계 리스트
				excelParams.put("salesFlag", "excelSum");
				sumMapList = infoSalesService.selectSalesList(excelParams);
				
				// workbook 생성 & 저장
				SXSSFWorkbook workbook = excelComponent.salesWorkbook(excelParams, resultList, sumMapList, headList, columnList);
				excelParams.put("workbook", workbook);
				excelParams.put("workbookName", "큐빅아이 통합정보_판매현황");
				
			}else if(excelFlag ==1) {
				// 반품교환
				excelParams.put("returnFlag", "excelReturn");
				resultList = infoSalesService.selectReturnList(excelParams); // list
				
				// 합계 리스트
				excelParams.put("returnFlag", "excelSum");
				sumMapList = infoSalesService.selectReturnSum(excelParams, "반품"); // 반품 sum
				exchSumList = infoSalesService.selectReturnSum(excelParams, "교환"); // 교환 sum
				
				// workbook 생성 & 저장
				SXSSFWorkbook workbook = excelComponent.returnWorkbook(excelParams, resultList, sumMapList, exchSumList, headList, columnList);
				excelParams.put("workbookName", "큐빅아이 통합정보_반품&교환");
				excelParams.put("workbook", workbook);
			}
			
			// excel export
			cubiciCmmService.excelExport(excelParams, request, response);
			
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /cubici/salesInfo/salesList/excelDownload ] : " + e.getMessage());
		}
	}

}
