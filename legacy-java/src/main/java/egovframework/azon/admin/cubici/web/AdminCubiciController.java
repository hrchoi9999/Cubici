package egovframework.azon.admin.cubici.web;

import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.AdminCubiciService;
import egovframework.azon.admin.cubici.service.AdminExcelDownloadService;

import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;

@Controller
public class AdminCubiciController {
	
	Logger logger = LoggerFactory.getLogger(AdminCubiciController.class);
	
	@Autowired
	AdminCubiciService adminCubiciService;

	@Autowired
	AdminExcelDownloadService serviceExcel;
	
	// 큐빅아이 통합정보 메인페이지
	@RequestMapping(value="/admin/cubici/infoIntegrated/cubici_tab1", method=RequestMethod.GET)
	public ModelAndView cubiciAdminMain() {
		logger.debug("[ 큐빅아이 관리자 메인 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/infoIntegrated/cubici_tab1");
    	int resultCode = 0;
        
        try {
			HashMap<String, Object> standardDate = CubiciUtils.defaultSetDate();
			mav.addAllObjects(standardDate);
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/admin/index ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	//tab1 상단 데이터
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/tab1Data", method = RequestMethod.POST)
	public ModelAndView tab1Data(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/tab1Data ] " + CmmMessage.parameter_relay_error);
			} else {
		        HashMap<String, Object> param = adminCubiciService.topData(paramMap);
		        mav.addAllObjects(param);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	//회원 차트 데이터
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/memChartData", method = RequestMethod.POST)
	public ModelAndView memChartData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/memChartData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.memChartData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	//가입기간 차트 데이터
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/regiPeriodChartData", method = RequestMethod.POST)
	public ModelAndView regiPeriodChartData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/regiPeriodChartData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.regiPeriodData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	//제휴 데이터
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/regiPartnerData", method = RequestMethod.POST)
	public ModelAndView regiPartnerData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/regiPartnerData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.regiPartnerData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	// 큐빅아이 통합정보 매출지표
	@RequestMapping(value="/admin/cubici/infoIntegrated/cubici_tab2", method=RequestMethod.GET)
	public ModelAndView integratedSalesAdmin(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 관리자 매출지표 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/infoIntegrated/cubici_tab2");
    	int resultCode = 0;
        
        try {
        	// 기준 날짜
			HashMap<String, Object> standardDate = CubiciUtils.defaultSetDate();
			mav.addAllObjects(standardDate);
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab2 ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}

	//매출현황 그래프
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/salesChartData", method = RequestMethod.POST)
	public ModelAndView salesChartData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/salesChartData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.salesChartData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
				mav.addObject("optionFlag",paramMap.get("optionFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	//회원 평균매출 그래프
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/avgSalesChartData", method = RequestMethod.POST)
	public ModelAndView avgSalesChartData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/avgSalesChartData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.avgSalesChartData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	//등록 쇼핑몰 그래프
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/regiShopChartData", method = RequestMethod.POST)
	public ModelAndView regiShopChartData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/avgSalesChartData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.regiShopData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	// 쇼핑몰 판매 비교
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/shopSalesChartData", method = RequestMethod.POST)
	public ModelAndView shopSalesChartData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/avgSalesChartData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.shopSalesChartData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}

	//SKU 그래프
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab1/skuChartData", method = RequestMethod.POST)
	public ModelAndView skuChartData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/skuChartData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = adminCubiciService.skuChartData(paramMap);
				mav.addAllObjects(resultMap);
				mav.addObject("dateFlag",paramMap.get("dateFlag"));
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	// 큐빅아이 통합정보 활동지표
	@RequestMapping(value="/admin/cubici/infoIntegrated/cubici_tab3", method=RequestMethod.GET)
	public ModelAndView integratedActivityAdmin(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 관리자 활동지표 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/infoIntegrated/cubici_tab3");
    	int resultCode = 0;
        
        try {
        	// 날짜 값 가져오기
        	HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultDate.get("fromDate").toString());
			mav.addObject("toDate", defaultDate.get("toDate").toString());
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab3 ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 활동지표 데이
	@RequestMapping(value = "/admin/cubici/infoIntegrated/cubici_tab3/activityIndicatorData", method=RequestMethod.POST)
	public ModelAndView activityIndicatorData(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab3/activityIndicatorData ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> ActivityList = adminCubiciService.selectActivityIndicator(paramMap);
				mav.addObject("ActivityList", ActivityList);
			}
		} catch (Exception e) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}		
		return mav;
	}
	
	// 큐빅아이 통합정보 이용료 지표
	@RequestMapping(value="/admin/cubici/infoIntegrated/cubici_tab4", method=RequestMethod.GET)
	public ModelAndView integratedChargeAdmin(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 관리자 이용료 지표 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/infoIntegrated/cubici_tab4");
    	int resultCode = 0;
        
        try {
        	// 날짜 값 가져오기
        	HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultDate.get("fromDate").toString());
			mav.addObject("toDate", defaultDate.get("toDate").toString());
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab4 ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
}
