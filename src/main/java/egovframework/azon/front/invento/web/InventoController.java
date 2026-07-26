package egovframework.azon.front.invento.web;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.excel.ExcelComponent;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.invento.service.InventoService;

/* 재고관리 컨트롤러
 * 2021. 01. 04
 * by KJC */
/* 재고관리 2021. 02. 09 PHJ */
@Controller
public class InventoController {

	Logger logger = LoggerFactory.getLogger(InventoController.class);

	@Autowired
	private InventoService inventoService;

	@Autowired
	CubiciCmmService cubiciCmmService;

	
	@Autowired
	ExcelComponent excelComponent;

	@RequestMapping(value = "/invento/rpaCompleteJSP", method = RequestMethod.GET)
	public ModelAndView togetherAdminMain() {
		logger.debug("[ 재고관리 RPA 페이지 ]");

		ModelAndView mav = new ModelAndView("/cubici/invento/rpaComplete");

		return mav;
	}

	// 상품재고 시나리오 후 parameter 전송할 JSP
	@RequestMapping(value = "/rpa/invento/post", method = RequestMethod.POST)
	public ModelAndView togetherAdminMain(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 재고관리 시나리오 성공 여부 컨트롤러 ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			inventoService.cubiciCodeList(params); // cubici_code 생성
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			if (resultCode != 0) {
				HashMap<String, Object> err_param = new HashMap<String, Object>();
				err_param.put("SHOP_ID", "");
				err_param.put("CODE_ID", params.get("shopCode"));
				err_param.put("CODE_NM", params.get("shopNm"));
				err_param.put("CAUSE", "CUBICI_CODE 생성 실패 / resultCode :: " + resultCode);
				cubiciCmmService.insertErrorReport(err_param);
			}
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 재고관리 메인페이지
	@RequestMapping("/cubici/invento/index")
	public ModelAndView inventoMain() {

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "invento/inventoIndex");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);
			
			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);

			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /invento/inventoMain ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
				mav.addAllObjects(CubiciUtils.defaultSetDate());
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /invento/inventoMain ] " + ex.toString());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// [모바일] 재고관리 메인페이지
	@RequestMapping("/m/cubici/invento/index")
	public ModelAndView mobileInventoMain() {

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "invento/m_invento");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> shopInfoMap = cubiciCmmService.selectShopInfo(principal);
			
			// 사용자 확인
			String userNo = principal.get("user_no").toString();
			mav.addObject("userCheck", userNo);
			
			if (shopInfoMap == null || shopInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /m/invento/inventoMain ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("shopInfoMap", shopInfoMap);
				mav.addAllObjects(CubiciUtils.defaultSetDate());
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /m/invento/inventoMain ] " + ex.toString());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 기준일자 (해당 id 상품 중 마지막 update 날짜)
	@RequestMapping(value = "/cubici/invento/lastUpdDate", method = RequestMethod.POST)
	public ModelAndView lastUpdDate(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/invento/lastUpdDate ] " + CmmMessage.parameter_relay_error);
			} else {
				String lastUpdDate = inventoService.selectLastUpdDate(paramMap);
				mav.addObject("lastUpdDate", lastUpdDate);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 상품목록
	@RequestMapping(value = "cubici/invento/productList", method = RequestMethod.POST)
	public ModelAndView productList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ cubici/invento/productList ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> inventoList = inventoService.selectProductList(paramMap);
				mav.addObject("currentPage", paramMap.get("currentPage").toString());
				mav.addObject("inventoList", inventoList);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 상품상세정보
	@RequestMapping(value = "cubici/invento/inventoModal", method = RequestMethod.POST)
	public ModelAndView inventoModal(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ cubici/invento/productList ] " + CmmMessage.parameter_relay_error);
			} else {
				// 해당 상품 정보
				ArrayList<HashMap<String, Object>> inventoList = inventoService.selectProductDetail(paramMap);
				// 해당 상품 매칭 정보
				ArrayList<HashMap<String, Object>> matchList = inventoService.selectMatchedList(paramMap);
				mav.addObject("inventoList", inventoList);
				mav.addObject("matchList", matchList);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 상품상세정보
	@RequestMapping(value = "/m/cubici/invento/detail", method = RequestMethod.GET)
	public ModelAndView mInventoDetail(@RequestParam HashMap<String, Object> params) {

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "invento/m_invento_detail");

		int resultCode = 0;

		try {
			
			if (params == null || params.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ cubici/invento/detail ] " + CmmMessage.parameter_relay_error);
			} else {
				// 해당 상품 정보
				ArrayList<HashMap<String, Object>> inventoList = inventoService.selectProductDetail(params);
				// 해당 상품 매칭 정보
				ArrayList<HashMap<String, Object>> matchList = inventoService.selectMatchedList(params);
				mav.addObject("inventoList", inventoList);
				mav.addObject("matchList", matchList);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 매칭상품목록
	@RequestMapping(value = "cubici/invento/matchList", method = RequestMethod.POST)
	public ModelAndView matchList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ cubici/invento/matchList ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> matchList = inventoService.selectMatchedList(paramMap);
				mav.addObject("matchList", matchList);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 선택 매칭 작업
	@RequestMapping(value = "/cubici/invento/matchingCode", method = RequestMethod.POST)
	public ModelAndView newMatchingCode(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ cubici/invento/matchingCode ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = inventoService.matchingCode(paramMap);
				mav.addObject("resultMap", resultMap);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 매칭 해제 작업
	@RequestMapping(value = "/cubici/invento/removeMatching", method = RequestMethod.POST)
	public ModelAndView removeMatching(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/invento/removeMatching ] " + CmmMessage.parameter_relay_error);
			} else {
				inventoService.removeMatching(paramMap);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 엑셀 다운로드
	@RequestMapping(value = "/cubici/invento/excelDownload", method = RequestMethod.POST)
	public void salesExcelDownload(HttpServletRequest request, HttpServletResponse response) {

		logger.debug(" [ /cubici/invento/excelDownload ] ");

		try {
			// === 파라미터 Setting === //
			HashMap<String, Object> excelParams = new HashMap<String, Object>();
			// 쇼핑몰 아이디
			excelParams.put("INTERPARK_ID", request.getParameter("interpark_id").toString());
			excelParams.put("GMARKET_ID", request.getParameter("gmarket_id").toString());
			excelParams.put("AUCTION_ID", request.getParameter("auction_id").toString());
			excelParams.put("ELEVEN_ID", request.getParameter("eleven_id").toString());
			excelParams.put("COUPANG_ID", request.getParameter("coupang_id").toString());
			excelParams.put("NAVER_ID", request.getParameter("naver_id").toString());
			// 쇼핑몰 리스트
			excelParams.put("SHOP_TYPE_LIST", request.getParameter("shop_type_list").toString());
			excelParams.put("SHOP_NAME_LIST", request.getParameter("shop_name_list").toString());
			
			// 판매상태 검색
			excelParams.put("sale_status", request.getParameter("sale_status").toString());
			// 상품명 검색
			excelParams.put("searchName", request.getParameter("searchName").toString());
			
			// === Data 가져오기 === //
			// MATCH LIST
			excelParams.put("excelFlag", "MATCH");
			ArrayList<HashMap<String, Object>> matchList = inventoService.getInventoExcelList(excelParams);
			// NON-MATCH LIST
			excelParams.put("excelFlag", "NON");
			ArrayList<HashMap<String, Object>> nonmatchList = inventoService.getInventoExcelList(excelParams);
			// 합계 리스트 가져오기
			ArrayList<HashMap<String, Object>> sumMapList = inventoService.getGoodsSumMapList(excelParams);
			// 선택한 Header 저장
			List<String> headList = Arrays.asList(request.getParameter("this_header").toString().split(","));
			
			// === Workbook 생성 및 Export === //
			SXSSFWorkbook workbook = excelComponent.stockWorkbook(excelParams, matchList, nonmatchList, sumMapList,
					headList);
			excelParams.put("workbookName", "큐빅아이 재고정보");
			excelParams.put("workbook", workbook);

			cubiciCmmService.excelExport(excelParams, request, response);

		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /cubici/invento/excelDownload ] "+e.getMessage());
		}

	}
}
