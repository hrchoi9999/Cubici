package egovframework.azon.front.cubici.web;

import java.util.ArrayList;
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
import egovframework.azon.front.cubici.service.InfoIntegratedService;
import egovframework.azon.front.cubici.service.InfoSalesService;

/* 큐빅아이 > 통합정보 컨트롤러
 * 2021. 01. 15
 * by KJC */
@Controller
public class InfoIntegratedController {

	Logger logger = LoggerFactory.getLogger(InfoIntegratedController.class);

	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	InfoIntegratedService integratedInformationService;

	@Autowired
	InfoSalesService infoSalesService;
	
	@Autowired
	ExcelComponent excelComponent;
	
	
	// 통합정보 > 당월현황(tab1) 메인
	@RequestMapping(value = "/cubici/integratedInfo/tab1", method = RequestMethod.GET)
	public ModelAndView integratedInfoTab1() {

		logger.debug(" [ /cubici/integratedInfo/tab1 ] ");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "infoIntegrated/tab1");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);

			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);

			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/integratedInfo/tab1 ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
				// 기준 날짜
				HashMap<String, Object> standardDate = CubiciUtils.defaultSetDate();
				mav.addObject("standardDate", standardDate.get("toDate").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// [모바일] 통합정보 > 당월현황(tab1) 메인
	@RequestMapping(value = "/m/cubici/integratedInfo/tab1", method = RequestMethod.GET)
	public ModelAndView mobileIntegratedInfoTab1() {

		logger.debug(" [ /m/cubici/integratedInfo/tab1 ] ");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "infoIntegrated/m_tab1");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);

			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);

			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /m/cubici/integratedInfo/tab1 ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
				// 기준 날짜
				HashMap<String, Object> standardDate = CubiciUtils.defaultSetDate();
				mav.addObject("standardDate", standardDate.get("toDate").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 통항정보 > 당월현황 > 매출액, 판매수량(합계)
	@RequestMapping(value = "/cubici/integratedInfo/tab1/sales", method = RequestMethod.POST)
	public ModelAndView integratedInfoSales(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/integratedInfo/tab1/sales ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/integratedInfo/tab1/sales ] " + CmmMessage.parameter_relay_error);
			} else {

				HashMap<String, Object> salesMap = integratedInformationService.callSales(paramMap);
				mav.addAllObjects(salesMap);

			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 통합정보 > 당월현황 > 정산입금액(합계)
	@RequestMapping(value = "/cubici/integratedInfo/tab1/settlement", method = RequestMethod.POST)
	public ModelAndView integratedInfoSettlement(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/integratedInfo/tab1/settlement ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(
						" [ ERROR ] [ /cubici/integratedInfo/tab1/settlement ] " + CmmMessage.parameter_relay_error);
			} else {

				HashMap<String, Object> settlementMap = integratedInformationService.callSettlement(paramMap);
				mav.addAllObjects(settlementMap);

			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 통합정보 > 매출분석(tab2) 메인
	@RequestMapping(value = "/cubici/integratedInfo/tab2", method = RequestMethod.GET)
	public ModelAndView integratedInfoTab2() {

		logger.debug(" [ /cubici/integratedInfo/tab2 ] ");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "infoIntegrated/tab2");

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
				logger.debug(" [ ERROR ] [ /cubici/integratedInfo/tab2 ] " + CmmMessage.DB_request_error);
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

	// [모바일] 통합정보 > 매출분석(tab2) 메인
	@RequestMapping(value = "/m/cubici/integratedInfo/tab2", method = RequestMethod.GET)
	public ModelAndView mobileIntegratedInfoTab2() {

		logger.debug(" [ /m/cubici/integratedInfo/tab2 ] ");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "infoIntegrated/m_tab2");

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
				logger.debug(" [ ERROR ] [ /m/cubici/integratedInfo/tab2 ] " + CmmMessage.DB_request_error);
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

	// 통합정보 > 상품분석(tab3) 메인
	@RequestMapping(value = "/cubici/integratedInfo/tab3", method = RequestMethod.GET)
	public ModelAndView integratedInfoTab3() {

		logger.debug(" [ /cubici/integratedInfo/tab3 ] ");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "infoIntegrated/tab3");

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
				logger.debug(" [ ERROR ] [ /cubici/integratedInfo/tab3 ] " + CmmMessage.DB_request_error);
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

	// [모바일] 통합정보 > 상품분석(tab3) 메인
	@RequestMapping(value = "/m/cubici/integratedInfo/tab3", method = RequestMethod.GET)
	public ModelAndView mobileIntegratedInfoTab3() {

		logger.debug(" [ /m/cubici/integratedInfo/tab3 ] ");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "infoIntegrated/m_tab3");

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
				logger.debug(" [ ERROR ] [ /m/cubici/integratedInfo/tab3 ] " + CmmMessage.DB_request_error);
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

	// 통합정보 (매출 그래프) > 당월현황(tab1) - 당월, 전월 . 매출분석(tab2), 쇼핑몰 판매 비중(tab3)
	@RequestMapping(value = "/cubici/integratedInfo/salesGraph", method = RequestMethod.POST)
	public ModelAndView integratedInfoSalesGraph(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/integratedInfo/salesGraph ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/integratedInfo/salesGraph ] " + CmmMessage.parameter_relay_error);
			} else {

				// 통합정보 > 당월현황
				if (paramMap.get("FLAG").toString().equals("tab1")) {
					// 이번달
					paramMap.putAll(CubiciUtils.defaultSetDate());
					paramMap.put("salesGraphFlag", "dailySum");
					ArrayList<HashMap<String, Object>> thisMonthSalesGraph = infoSalesService
							.selectSalesList(paramMap);
					mav.addObject("thisMonthSalesGraph", thisMonthSalesGraph);

					// 저번달
					paramMap.putAll(CubiciUtils.defaultSetDate());
					paramMap.put("toDate", paramMap.get("fromDate"));
					paramMap.put("fromDate", paramMap.get("fromDate2"));
					paramMap.put("salesGraphFlag", "dailySum");
					ArrayList<HashMap<String, Object>> beforeMonthSalesGraph = infoSalesService
							.selectSalesList(paramMap);
					mav.addObject("beforeMonthSalesGraph", beforeMonthSalesGraph);

				} // 통합정보 > 매출분석
				else if (paramMap.get("FLAG").toString().equals("tab2")) {
					paramMap.put("salesGraphFlag", "dailyShopSum");
					ArrayList<HashMap<String, Object>> salesGraph = infoSalesService.selectSalesList(paramMap);
					mav.addObject("salesGraph", salesGraph);
					mav.addObject("selectCondition", paramMap.get("SELECT_CONDITION").toString());
				} // 통합정보 > 상품분석(쇼핑몰 판매비중, 쇼핑몰 가격할인 및 판촉)
				else if (paramMap.get("FLAG").toString().equals("tab3_promotion")) {
					paramMap.put("salesGraphFlag", "tab3_promotion");
					ArrayList<HashMap<String, Object>> salesGraph = infoSalesService.selectSalesList(paramMap);
					mav.addObject("salesGraph", salesGraph);
					mav.addObject("selectCondition", paramMap.get("SELECT_CONDITION").toString());
				} // 통합정보 > 상품분석(TOP 10 매출상품)
				else if (paramMap.get("FLAG").toString().equals("tab3_top10")) {
					paramMap.put("salesGraphFlag", "tab3_top10");
					ArrayList<HashMap<String, Object>> salesGraph = infoSalesService.selectSalesList(paramMap);
					mav.addObject("salesGraph", salesGraph);
					mav.addObject("selectCondition", paramMap.get("SELECT_CONDITION").toString());
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

	// 통합정보 (반품/교환 그래프) > 매출분석(tab2)
	@RequestMapping(value = "/cubici/integratedInfo/returnGraph", method = RequestMethod.POST)
	public ModelAndView integratedInfoReturnGraph(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/integratedInfo/returnGraph ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/integratedInfo/returnGraph ] " + CmmMessage.parameter_relay_error);
			} else {

				paramMap.put("returnGraphFlag", "dailySum");
				ArrayList<HashMap<String, Object>> returnGraph = infoSalesService.selectReturnList(paramMap);
				mav.addObject("returnGraph", returnGraph);
				mav.addObject("selectCondition", paramMap.get("SELECT_CONDITION").toString());

			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 통합정보 (재고정보) > 당월현황(tab1), 상품분석(tab3)
	@RequestMapping(value = "/cubici/integratedInfo/invento", method = RequestMethod.POST)
	public ModelAndView integratedInfoInvento(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/integratedInfo/invento ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/integratedInfo/invento ] " + CmmMessage.parameter_relay_error);
			} else {

				ArrayList<HashMap<String, Object>> inventoTotal = integratedInformationService.selectInvento(paramMap);
				mav.addObject("inventoTotal", inventoTotal);

				if (paramMap.get("FLAG").toString().equals("tab3"))
					mav.addObject("selectCondition", paramMap.get("SELECT_CONDITION").toString());

			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// === EXCEL DOWNLOAD (MKC 2021.02.16) === //
	@RequestMapping(value = "/cubici/integratedInfo/excelDownload", method = RequestMethod.POST)
	public void integratedExcelDownload(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (logger.isDebugEnabled()) {
			logger.debug(" [ /cubici/integratedInfo/excelDownload ] ");
		}

		try {
			
			// === PARAMETER 세팅
			HashMap<String, Object> excelParams = new HashMap<String, Object>();
			// 회원번호
			excelParams.put("USER_NO", request.getParameter("userNo").toString());
			// 쇼핑몰 정보
			excelParams.put("COUPANG_SETTLEMENT_TYPE", request.getParameter("coupang_settle_type").toString());
			excelParams.put("SHOP_TYPE_LIST", request.getParameter("shop_type_list").toString());
			excelParams.put("INTERPARK_ID", request.getParameter("interpark_id").toString());
			excelParams.put("GMARKET_ID", request.getParameter("gmarket_id").toString());
			excelParams.put("AUCTION_ID", request.getParameter("auction_id").toString());
			excelParams.put("COUPANG_ID", request.getParameter("coupang_id").toString());
			excelParams.put("ELEVEN_ID", request.getParameter("eleven_id").toString());
			excelParams.put("NAVER_ID", request.getParameter("naver_id").toString());
			excelParams.put("PRODUCT_NAME", "%%");
			// 보기설정
			if (request.getParameter("selectOrderBy") == null || request.getParameter("selectOrderBy").equals("")) {
				excelParams.put("ORDER_BY", "SHOP_TYPE");
			} else {
				excelParams.put("ORDER_BY", request.getParameter("selectOrderBy").toString());
			}
			// 쇼핑몰 리스트 for workbook
			excelParams.put("SHOP_NAME_LIST", request.getParameter("shop_name_list").toString());
			// 날짜 범위 설정
			excelParams.put("fromDate", request.getParameter("fromDate").toString());
			excelParams.put("toDate", request.getParameter("toDate").toString());
			// FLAG에 따라 데이터 리스트 저장
			int excelFlag = Integer.parseInt(request.getParameter("excelFlag").toString());
			
			
			// === Flag에 따라 데이터 가져오기
			ArrayList<HashMap<String, Object>> resultList = new ArrayList<HashMap<String, Object>>(); // main data
			ArrayList<HashMap<String, Object>> sumList = new ArrayList<HashMap<String, Object>>(); // 합계 데이터 OR 반품합계 데이터
			ArrayList<HashMap<String, Object>> exchSumList = new ArrayList<HashMap<String, Object>>(); // 교환합계 데이터
			List<String> headerList = new ArrayList<String>();
			List<String> colList = new ArrayList<String>();

			if (excelFlag == 1) {

				// 판매금액
				excelParams.put("salesFlag", "excelSales");
				resultList = infoSalesService.selectSalesList(excelParams); // list

				excelParams.put("salesFlag", "excelSum");
				sumList = infoSalesService.selectSalesList(excelParams); // sum

				headerList.add("상품명"); // 해당 그래프는 컬럼이 정해져 있음 (컬럼 변경 X)
				headerList.add("판매금액");
				headerList.add("판매수량");

				colList.add("PRODUCT_NAME");
				colList.add("ORDER_PRICE");
				colList.add("QUANTITY");

				SXSSFWorkbook workbook = excelComponent.salesWorkbook(excelParams, resultList, sumList, headerList,
						colList); // worksheet
				excelParams.put("workbookName", "큐빅아이 통합정보_매출분석");
				excelParams.put("workbook", workbook);

			} else if (excelFlag == 2) {

				// 반품교환
				excelParams.put("returnFlag", "excelReturn");
				resultList = infoSalesService.selectReturnList(excelParams); // list

				excelParams.put("returnFlag", "excelSum");
				sumList = infoSalesService.selectReturnSum(excelParams, "반품"); // 반품 sum
				exchSumList = infoSalesService.selectReturnSum(excelParams, "교환"); // 교환 sum

				headerList.add("상품명"); // 해당 그래프는 컬럼이 정해져 있음 (컬럼 변경 X)
				headerList.add("주문금액");
				headerList.add("판매수량");

				colList.add("PRODUCT_NAME");
				colList.add("ORDER_PRICE");
				colList.add("QUANTITY");

				SXSSFWorkbook workbook = excelComponent.returnWorkbook(excelParams, resultList, sumList, exchSumList,
						headerList, colList); // worksheet
				excelParams.put("workbookName", "큐빅아이 통합정보_반품&교환");
				excelParams.put("workbook", workbook);

			} else if (excelFlag == 3) {

				// 할인 및 판촉
				excelParams.put("salesFlag", "excelPromo");
				resultList = infoSalesService.selectSalesList(excelParams); // list

				excelParams.put("salesFlag", "excelPromoSum");
				sumList = infoSalesService.selectSalesList(excelParams); // sum

				SXSSFWorkbook workbook = excelComponent.salesPromoWorkbook(excelParams, resultList, sumList); // worksheet
				excelParams.put("workbookName", "큐빅아이 통합정보_할인&판촉");
				excelParams.put("workbook", workbook);

			} else if (excelFlag == 4) {

				// 10위 매출상품
				excelParams.put("salesGraphFlag", "tab3_top10");
				excelParams.put("STANDARD", request.getParameter("standard").toString());
				resultList = infoSalesService.selectSalesList(excelParams); // list

				SXSSFWorkbook workbook = excelComponent.topSalesWorkbook(excelParams, resultList); // worksheet
				excelParams.put("workbookName", "큐빅아이 통합정보_Top10매출상품");
				excelParams.put("workbook", workbook);

			} else if (excelFlag == 5) {

				// 10위 재고상품
				excelParams.put("FLAG", "tab3");
				resultList = integratedInformationService.selectInvento(excelParams); // list

				SXSSFWorkbook workbook = excelComponent.topStockWorkbook(excelParams, resultList); // worksheet
				excelParams.put("workbookName", "큐빅아이 통합정보_Top10재고상품");
				excelParams.put("workbook", workbook);

			}

			// === 엑셀 파일 생성 & export
			cubiciCmmService.excelExport(excelParams, request, response);

		} catch (Exception ex) {
			logger.debug(" [ ERROR ] [ /cubici/integratedInfo/excelDownload ] " + ex.getMessage());
		}
	}
}
