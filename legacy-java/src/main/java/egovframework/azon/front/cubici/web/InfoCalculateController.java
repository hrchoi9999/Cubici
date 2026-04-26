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
import egovframework.azon.front.cubici.service.InfoCalculateService;

/* 큐빅아이 > 정산정보 controller
 * 2021. 01. 21
 * by KJC */
@Controller
public class InfoCalculateController {
	
	Logger logger = LoggerFactory.getLogger(InfoCalculateController.class);
	
	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	InfoCalculateService infoCalCulateService;
	
	@Autowired
	ExcelComponent excelComponent;
	
	// 정산정보 > 캘린더
	@RequestMapping(value = "/cubici/calculateInfo/calendar", method = RequestMethod.GET)
	public ModelAndView calculateInfoCalendar() {
		
		logger.debug(" [ /cubici/calculateInfo/calendar ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "infoCalculate/calendar");
		
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
				logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
			}

		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// [모바일] 정산정보 > 캘린더 
	@RequestMapping(value = "/m/cubici/calculateInfo/calendar", method = RequestMethod.GET)
	public ModelAndView mobileCalculateInfoCalendar() {
		
		logger.debug(" [ /m/cubici/calculateInfo/calendar ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "/infoCalculate/m_calendar");
		
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
				logger.debug(" [ ERROR ] [ /m/cubici/calculateInfo/calendar ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
			}

		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /m/cubici/calculateInfo/calendar ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// 정산정보 캘린더 > 정산 예정금액 합계(주간, 월간)
	@RequestMapping(value = "/cubici/calculateInfo/calendar/calculatePre", method = RequestMethod.POST)
	public ModelAndView calculatePre(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug(" [ /cubici/calculateInfo/calendar/calculatePre ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/calculatePre ] " + CmmMessage.parameter_relay_error);
			} else {

				// 정산 예정 내역
				paramMap.putAll(cubiciCmmService.calendarDefaultDate("pre"));
				paramMap.put("calculatePreFlag", "calendar");
				HashMap<String, Object> calculatePreMap = infoCalCulateService.sumCalculatePreList(paramMap);
				mav.addAllObjects(calculatePreMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/calculatePre ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 정산정보 캘린더 > 정산 입금액 합계
	@RequestMapping(value = "/cubici/calculateInfo/calendar/settlementAmount", method = RequestMethod.POST)
	public ModelAndView settlementAmount(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug(" [ /cubici/calculateInfo/calendar/settlementAmount ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/settlementAmount ] " + CmmMessage.parameter_relay_error);
			} else {

				// 정산 입금 내역 > 이번달 합계
				paramMap.putAll(cubiciCmmService.calendarDefaultDate("settlement"));
				paramMap.put("settlementFlag", "sum");
				ArrayList<HashMap<String, Object>> thisMonthSettlement = infoCalCulateService.selectSettlementList(paramMap);
				if(thisMonthSettlement == null || thisMonthSettlement.isEmpty() || thisMonthSettlement.get(0) == null) {
					mav.addObject("thisMonthSettlement", 0);
				} else {
					mav.addObject("thisMonthSettlement", thisMonthSettlement.get(0).get("SETTLEMENT_AMOUNT"));
				}
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/settlementAmount ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 정산정보 캘린더 > 데이터 가져오기
	@RequestMapping(value = "/cubici/calculateInfo/calendar/get", method = RequestMethod.POST)
	public ModelAndView calendarDataGet(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug(" [ /cubici/calculateInfo/calendar/get ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/get ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("yearMonth", paramMap.get("yearMonth").toString()); // 캘린더 초기화 날짜
				
				ArrayList<HashMap<String, Object>> holidayList = infoCalCulateService.selectHoliday(paramMap);
				mav.addObject("holidayList", holidayList);
				
				ArrayList<HashMap<String, Object>> resultList = new ArrayList<>();
				
				// 이번달 데이터 가져올 때는 둘 다
				if(Integer.parseInt(paramMap.get("dateFlag").toString()) == 0) {
					// 정산 입금 리스트
					paramMap.remove("fromDate");
					paramMap.remove("toDate");
					paramMap.putAll(cubiciCmmService.calendarDefaultDate("settlement"));
					paramMap.put("settlementFlag", "calendar");
					ArrayList<HashMap<String, Object>> settlementList = infoCalCulateService.selectSettlementList(paramMap);
					resultList.addAll(settlementList);
					
					// 정산 예정 리스트
					paramMap.remove("fromDate");
					paramMap.remove("toDate");
					paramMap.putAll(cubiciCmmService.calendarDefaultDate("pre"));
					paramMap.put("calculatePreFlag", "calendar");
					ArrayList<HashMap<String, Object>> calculatePreList = infoCalCulateService.selectCalculatePreList(paramMap);
					resultList.addAll(calculatePreList);
					
				} else if(Integer.parseInt(paramMap.get("dateFlag").toString()) > 0) { // 이전 달
					// 정산 입금 리스트
					paramMap.put("settlementFlag", "calendar");
					ArrayList<HashMap<String, Object>> settlementList = infoCalCulateService.selectSettlementList(paramMap);
					resultList.addAll(settlementList);
					
				} else if(Integer.parseInt(paramMap.get("dateFlag").toString()) < 0) { // 다음 달
					// 정산 예정 리스트
					paramMap.put("calculatePreFlag", "calendar");
					ArrayList<HashMap<String, Object>> calculatePreList = infoCalCulateService.selectCalculatePreList(paramMap);
					resultList.addAll(calculatePreList);
					
				} else {
					System.out.println("[ 예외처리 ]");
				}
				
				mav.addObject("settlementList", resultList);
				
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/get ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// 캘린더 일일 정산 상세내역 modal
	@RequestMapping(value = "/cubici/calculateInfo/calendar/detailModal", method = RequestMethod.POST)
	public ModelAndView detailModal(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug(" [ /cubici/calculateInfo/calendar/detailModal ] ");

		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/detailModal ] " + CmmMessage.parameter_relay_error);
			} else {

				ArrayList<HashMap<String, Object>> resultList = new ArrayList<>();
				
				if(Integer.parseInt(paramMap.get("dateFlag").toString()) <= 0) { // 정산예정
					// 정산 예정 리스트
					paramMap.put("calculatePreFlag", "dailyDetail");
					ArrayList<HashMap<String, Object>> calculatePreList = infoCalCulateService.selectCalculatePreList(paramMap);
					resultList.addAll(calculatePreList);
				} else if(Integer.parseInt(paramMap.get("dateFlag").toString()) > 0) { // 정산입금
					// 정산 입금 리스트
					paramMap.put("settlementFlag", "dailyDetail");
					ArrayList<HashMap<String, Object>> settlementList = infoCalCulateService.selectSettlementList(paramMap);
					resultList.addAll(settlementList);
				}
				
				mav.addObject("resultList", resultList);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/calculateInfo/calendar/detailModal ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// 정산정보 > 상세내역
	@RequestMapping(value = "/cubici/calculateInfo/details", method = RequestMethod.GET)
	public ModelAndView calculateInfoDetails() {
		
		logger.debug(" [ /cubici/calculateInfo/details ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "infoCalculate/details");
		
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
				logger.debug(" [ ERROR ] [ /cubici/calculateInfo/details ] " + CmmMessage.DB_request_error);
			} else {
				
				mav.addObject("shopInfoMap", shopInfoMap);
				mav.addAllObjects(cubiciCmmService.calendarDefaultDate("pre"));
				
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/calculateInfo/details ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// [모바일] 정산정보 > 상세내역
	@RequestMapping(value = "/m/cubici/calculateInfo/details", method = RequestMethod.GET)
	public ModelAndView mobileCalculateInfoDetails() {
		
		logger.debug(" [ /m/cubici/calculateInfo/details ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "infoCalculate/m_details");

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
				logger.debug(" [ ERROR ] [ /m/cubici/calculateInfo/details ] " + CmmMessage.DB_request_error);
			} else {
				
				mav.addObject("shopInfoMap", shopInfoMap);
				mav.addAllObjects(cubiciCmmService.calendarDefaultDate("pre"));
				
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /m/cubici/calculateInfo/details ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 정산정보 > 상세내역 목록, 테이블
	@RequestMapping(value = "/cubici/calculateInfo/details/get", method = RequestMethod.POST)
	public ModelAndView calculateInfoDetailsGet(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/calculateInfo/details/get ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/calculateInfo/details/get ] " + CmmMessage.parameter_relay_error);
			} else {
				if (paramMap.get("FLAG").toString().equals("pre")) { // 정산예정
					ArrayList<HashMap<String, Object>> calculatePreList = infoCalCulateService.selectCalculatePreList(paramMap);
					mav.addObject("settlementList", calculatePreList);
					// 정산예정액 합계(캘린더꺼 사용)
					paramMap.put("calculatePreFlag", "calendar");
					HashMap<String, Object> calculatePreMap = infoCalCulateService.sumCalculatePreList(paramMap);
					mav.addObject("settlementSum", calculatePreMap.get("monthSum"));
					mav.addObject("totalCount", calculatePreMap.get("totalCount"));
				}
				else { // 정산입금
					ArrayList<HashMap<String, Object>> settlementList = infoCalCulateService.selectSettlementList(paramMap);
					mav.addObject("settlementList", settlementList);
					// 정산입금액 합계(캘린더꺼 사용)
					paramMap.remove("calculatePreFlag"); // 정산입금액 합계는 LIMIT 들어가면 안됨
					paramMap.put("settlementFlag", "sum");
					ArrayList<HashMap<String, Object>> thisMonthSettlement = infoCalCulateService.selectSettlementList(paramMap);
					if (thisMonthSettlement == null || thisMonthSettlement.isEmpty() || thisMonthSettlement.get(0) == null) {
						mav.addObject("settlementSum", 0);
						mav.addObject("totalCount", 0);
					} else {
						mav.addObject("settlementSum", thisMonthSettlement.get(0).get("SETTLEMENT_AMOUNT"));
						mav.addObject("totalCount", thisMonthSettlement.get(0).get("TOTAL_COUNT"));
					}
				}
				mav.addObject("currentPage", paramMap.get("NOWPAGENO").toString());
				mav.addObject("FLAG", paramMap.get("FLAG").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/calculateInfo/details/get ] : " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	// 상세주문번호 조회
	@RequestMapping(value = "/cubici/calculateInfo/details/detailOrderNo", method = RequestMethod.POST)
	public ModelAndView selectSalesdetailOrderNo(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug(" [ /cubici/calculateInfo/details/detailOrderNo ] ");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		  try { 
			  if (paramMap == null || paramMap.isEmpty()) { 
				  resultCode = 88;
				  logger.debug(" [ ERROR ] [ /cubici/calculateInfo/details/detailOrderNo ] " + CmmMessage.parameter_relay_error); 
			  } else {
				  if (paramMap.get("FLAG").toString().equals("pre")) { // 정산예정
					  ArrayList<HashMap<String, Object>> calculatePreList = infoCalCulateService.selectCalculatePreList(paramMap);
						mav.addObject("detailResultList", calculatePreList);
				  }
				  else {
					  ArrayList<HashMap<String, Object>> settlementList = infoCalCulateService.selectSettlementList(paramMap); // 정산입금
						mav.addObject("detailResultList", settlementList);
				  }
			  } 
		  } catch (Exception e) { 
			  resultCode = 99; 
			  logger.debug(" [ ERROR ] [ /cubici/calculateInfo/details/detailOrderNo ] : " + e.getMessage());
		  } finally {
			  mav.addObject("resultCode", resultCode); 
		  }

		return mav;
	}

	//*** CALENDAR EXCEL DOWNLOAD (MKC 2021.04.20)  ***//
	@RequestMapping(value="/cubici/calculateInfo/settlement/excelDownload", method = RequestMethod.POST)
	public void calendarExcelDownload(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		logger.debug(" [ /cubici/calculateInfo/settlement/excelDownload ] ");
		
		try {
			// Parameters for Query
			HashMap<String, Object> excelParams = new HashMap<String, Object>(); 
						
			// 회원번호
			excelParams.put("USER_NO", request.getParameter("userNo").toString());
			
			// 쇼핑몰 정보
			excelParams.put("COUPANG_SETTLEMENT_TYPE", request.getParameter("coupang_settle_type").toString());
			excelParams.put("AUCTION_ONLINE_REMIT_DATE", request.getParameter("auction_online_remit_date").toString());
			excelParams.put("ELEVEN_SHOP_GRADE_DATE", request.getParameter("eleven_shop_grade_date").toString());
			excelParams.put("SHOP_TYPE_LIST", request.getParameter("shop_type_list").toString());
			excelParams.put("INTERPARK_ID", request.getParameter("interpark_id").toString());
			excelParams.put("GMARKET_ID", request.getParameter("gmarket_id").toString());
			excelParams.put("AUCTION_ID", request.getParameter("auction_id").toString());
			excelParams.put("COUPANG_ID", request.getParameter("coupang_id").toString());
			excelParams.put("ELEVEN_ID", request.getParameter("eleven_id").toString());
			excelParams.put("NAVER_ID", request.getParameter("naver_id").toString());
			excelParams.put("PRODUCT_NAME", "%%");
			
			// 쇼핑몰 리스트 for workbook
			excelParams.put("SHOP_NAME_LIST", request.getParameter("shop_name_list").toString());
			
			// 날짜
			String fromDate = request.getParameter("fromDate").toString(); // 검색하는 달 1일
			String toDate = request.getParameter("toDate").toString(); // 검색하는 달 말일
			
			// MAIN DATA LIST
			ArrayList<HashMap<String, Object>> resultList = new ArrayList<HashMap<String, Object>>(); // main data
						
			// SUM LIST
			ArrayList<HashMap<String, Object>> sumMapList = new ArrayList<HashMap<String, Object>>();
			
			// Flag ( 정산캘린더 or 정산상세 )
			String excelFlag = request.getParameter("excelFlag").toString();
			
			if(excelFlag.equals("calendar")) { // 정산 캘린더
				String todayDate = request.getParameter("todayDate").toString(); // 오늘 날짜
				String yesterDate = request.getParameter("yesterDate").toString(); // 전일 날짜
				
				// 날짜 flag (과거:0 , 현재:1 , 미래:2)
				int dateFlag = Integer.parseInt(request.getParameter("dateFlag").toString());
				excelParams.put("dateFlag", dateFlag);
				
				excelParams.put("ORDER_BY", "SHOP_TYPE");
				
				if(dateFlag == 0) {
					
					//** 과거 월 리스트 (정산입금)
					excelParams.put("settlementFlag", "excel");
					excelParams.put("fromDate", fromDate);
					excelParams.put("toDate", toDate); 
					resultList = infoCalCulateService.selectSettlementList(excelParams);
					
					// 합계 리스트
					excelParams.put("calculatePreFlag", "excelSum");
					sumMapList = infoCalCulateService.selectSettlementList(excelParams);
									
				} else if(dateFlag == 1) {
					
					//** 이번달 오늘 이전 (정산입금)
					excelParams.put("settlementFlag", "excel");
					excelParams.put("fromDate", fromDate);
					excelParams.put("toDate", yesterDate); 
					ArrayList<HashMap<String, Object>> beforeList = infoCalCulateService.selectSettlementList(excelParams);
					resultList.addAll(beforeList);
					
					// 합계 리스트 (정산입금)
					excelParams.put("settlementFlag", "excelSum");
					ArrayList<HashMap<String, Object>> settlementSumList = infoCalCulateService.selectSettlementList(excelParams);
					
					//** 이번달 오늘 이후 (정산예정)
					excelParams.put("calculatePreFlag", "excel");
					excelParams.put("fromDate", todayDate);
					excelParams.put("toDate", toDate);
					ArrayList<HashMap<String, Object>> afterList = infoCalCulateService.selectCalculatePreList(excelParams);
					resultList.addAll(afterList);
					
					// 합계 리스트 (정산예정)
					excelParams.put("calculatePreFlag", "excelSum");
					ArrayList<HashMap<String, Object>> preCalcSumList = infoCalCulateService.selectCalculatePreList(excelParams);
					
					// 합계 리스트 통합
					sumMapList = infoCalCulateService.setSumMapList(settlementSumList, preCalcSumList);
					
				} else if(dateFlag == 2) {
					
					//** 미래 월 리스트 (정산예정)
					excelParams.put("calculatePreFlag", "excel");
					excelParams.put("fromDate", fromDate);
					excelParams.put("toDate", toDate);
					resultList = infoCalCulateService.selectCalculatePreList(excelParams);
					
					// 합계 리스트
					excelParams.put("calculatePreFlag", "excelSum");
					sumMapList = infoCalCulateService.selectCalculatePreList(excelParams);
				}
				
				// 원래 날짜로 재설정 (for workbook)
				excelParams.put("fromDate", fromDate);
				excelParams.put("toDate", toDate);
				
				// workbook 생성 & 저장
				SXSSFWorkbook workbook = excelComponent.calendarWorkbook(excelParams, resultList, sumMapList);
				excelParams.put("workbook", workbook);
				excelParams.put("workbookName", "큐빅아이 정산캘린더");
			
			}else if(excelFlag.equals("detail")) { // 정산상세
				
				// 구분
				String listFlag = request.getParameter("selectDiv").toString();
				excelParams.put("listFlag", listFlag);
				
				// 날짜 범위
				excelParams.put("fromDate", fromDate);
				excelParams.put("toDate", toDate);
				
				// 보기설정
				excelParams.put("ORDER_BY", request.getParameter("selectOrderBy").toString());
				
				// 지정 header
				List<String> headerList = Arrays.asList(request.getParameter("this_header").toString().split(","));
				List<String> colList = excelComponent.setVariedColumns(headerList);
				
				if(listFlag.equals("pre")) {
					excelParams.put("calculatePreFlag", "excelDetail");
					resultList = infoCalCulateService.selectCalculatePreList(excelParams); // list
					excelParams.put("calculatePreFlag", "excelSum");
					sumMapList = infoCalCulateService.selectCalculatePreList(excelParams); // sum
				}else if(listFlag.equals("settlement")) {
					excelParams.put("settlementFlag", "excelDetail");
					resultList = infoCalCulateService.selectSettlementList(excelParams); // list
					excelParams.put("settlementFlag", "excelSum");
					sumMapList = infoCalCulateService.selectSettlementList(excelParams); // sum
				}
				
				// workbook 생성 & 저장
				SXSSFWorkbook workbook = excelComponent.settleDetailWorkbook(excelParams, resultList, sumMapList,  headerList, colList);
				excelParams.put("workbook", workbook);
				excelParams.put("workbookName", "큐빅아이 정산상세내역");
				
			}
			
			// 엑셀 파일 생성 & export
			cubiciCmmService.excelExport(excelParams, request, response);

		} catch (Exception ex) {
			logger.info(" [ ERROR ] [ /cubici/calculateInfo/cubici/excelDownload ] " + ex.getMessage());
		}
	}

}
