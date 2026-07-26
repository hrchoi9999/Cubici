package egovframework.azon.admin.cubici.web;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.azon.cmmn.component.CubiciUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.AdminMoneyBankService;
import egovframework.azon.cmmn.CmmMessage;

@Controller
public class AdminMoneyBankController {

	Logger logger = LoggerFactory.getLogger(AdminMoneyBankController.class);
	
	@Autowired
	AdminMoneyBankService adminMoneyBankService;
	
	/* 큐빅아이 관리자 메인
	 * 수정 2021. 06. 04.
	 * by MKY */
	
	// 큐빅아이 통합정보 머니뱅크 종합지표
	@RequestMapping(value="/admin/cubici/infoIntegrated/moneybank_tab1", method=RequestMethod.GET)
	public ModelAndView integratedMoneybankMain() {
		logger.debug("[ 큐빅아이 통합정보 머니뱅크 종합지표 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/infoIntegrated/moneybank_tab1");
    	int resultCode = 0;
        
        try {
        	
        	// 날짜 값 가져오기
        	HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
        	HashMap<String, Object> resultList = adminMoneyBankService.MoneyBankAccumulateValue(defaultDate);
        	mav.addObject("resultList", resultList);
			// 기본 날짜 설정
			mav.addObject("fromDate", defaultDate.get("fromDate").toString());
			mav.addObject("toDate", defaultDate.get("toDate").toString());
			
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/moneybank_tab1 ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 큐빅아이 통합정보 머니뱅크 차트통합
	@RequestMapping(value="/admin/cubici/infoIntegrated/moneybank_tab1/totalchart", method=RequestMethod.POST)
	public ModelAndView integratedMoneybankTotalChart(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ 큐빅아이 통합정보 머니뱅크 차트통합 ]");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
		 	//회원현황 차트
        	ArrayList<HashMap<String, Object>> resultListUser = adminMoneyBankService.MoneyBankUserChart(paramMap);
        	mav.addObject("resultListUser", resultListUser);
        	//이용현황 차트
        	ArrayList<HashMap<String, Object>> resultListUsage = adminMoneyBankService.MoneyBankUsageChart(paramMap);
        	mav.addObject("resultListUsage", resultListUsage);
        	//서비스 이용율 차트
        	ArrayList<HashMap<String, Object>> resultListService = adminMoneyBankService.MoneyBankServiceChart(paramMap);
        	mav.addObject("resultListService", resultListService);
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/moneybank_tab1/totalchart ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 큐빅아이 통합정보 머니뱅크 운영지표
	@RequestMapping(value="/admin/cubici/infoIntegrated/moneybank_tab2", method=RequestMethod.GET)
	public ModelAndView integratedMoneybankOperation() {
		logger.debug("[ 큐빅아이 통합정보 머니뱅크 운영지표 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/infoIntegrated/moneybank_tab2");
    	int resultCode = 0;
        
        try {
        	// 날짜 값 가져오기
        	HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
        	HashMap<String, Object> resultList = adminMoneyBankService.MoneyBankOperationValue(defaultDate);
        	mav.addObject("resultList", resultList);
        	// 운영건수 가져오기
        	int MoneyBankOperationCount = adminMoneyBankService.MoneyBankOperationCount(defaultDate);
        	mav.addObject("resultListOperCount", MoneyBankOperationCount);
			// 기본 날짜 설정
			mav.addObject("fromDate", defaultDate.get("fromDate").toString());
			mav.addObject("toDate", defaultDate.get("toDate").toString());
	    	
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/moneybank_tab2 ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 큐빅아이 통합정보 머니뱅크 운영지표 차트통합
	@RequestMapping(value="/admin/cubici/infoIntegrated/moneybank_tab2/totalchart", method=RequestMethod.POST)
	public ModelAndView integratedMoneybankOperationTotalChart(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ 큐빅아이 통합정보 머니뱅크 운영지표 차트통합 ]");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
		 	//운영지표 차트(누적 계약)
        	ArrayList<HashMap<String, Object>> resultListContract = adminMoneyBankService.MoneyBankContractChart(paramMap);
        	mav.addObject("resultListContract", resultListContract);
        	//운영지표 차트(수수료 및 상환누적)
        	ArrayList<HashMap<String, Object>> resultListRepayment = adminMoneyBankService.MoneyBankRepaymentChart(paramMap);
        	mav.addObject("resultListRepayment", resultListRepayment);
	    } catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/moneybank_tab2/totalchart ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	
	// ***** 머니뱅크 관리 NAVI-TAB (MKC 2021.05.30) ***** //
	// 통합현황 페이지
	@RequestMapping(value = "/admin/moneybank/cubici/management/info_tab1", method = RequestMethod.GET)
	public ModelAndView cubiciAdminStatusTab1() {
		logger.debug("[ Admin together 통합현황 > 현황종합 ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);

		mav.addObject("pageName", "/admin/moneybank/management/info_tab1");

		int resultCode = 0;

		try {
			// Default 날짜 & 기준일자
			HashMap<String, Object> defaultTime = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultTime.get("fromDate"));
			mav.addObject("toDate", defaultTime.get("toDate"));
			mav.addObject("standardDate", defaultTime.get("toDate").toString());

			// *** 통합현황 상단 데이터
			HashMap<String, Object> mainInfo = adminMoneyBankService.getMainInfo(defaultTime);
			mav.addObject("mainInfo", mainInfo);
			
			// *** 경고회원 리스트 (PRIZM MONITOR)
			
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/management/info_tab1 ::: cubici ]");
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 통합현황 > 현황종합 데이터 가져오기
	@RequestMapping(value = "/admin/moneybank/cubici/management/info_tab1/get", method = RequestMethod.POST)
	public ModelAndView getCubiciAdminStatusTab1(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ Admin together 통합현황 > 현황종합 ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {

			if (paramMap.isEmpty() || paramMap == null) {

				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/info_tab1/get ] " + CmmMessage.parameter_relay_error);

			} else {

				// **** 회원현황 GRAPH 데이터
				paramMap.put("flag", "member");
				ArrayList<HashMap<String, Object>> memberData = adminMoneyBankService.getGraphData(paramMap);
				mav.addObject("memberData", memberData);

				// 해지회원 GRAPH 데이터
				paramMap.put("flag", "withdraw");
				ArrayList<HashMap<String, Object>> withdrawData = adminMoneyBankService.getGraphData(paramMap);
				mav.addObject("withdrawData", withdrawData);

				// 이용자 GRAPH 데이터
				paramMap.put("flag", "user");
				ArrayList<HashMap<String, Object>> userData = adminMoneyBankService.getGraphData(paramMap);
				mav.addObject("userData", userData);

				// 재사용자 GRAPH 데이터
				paramMap.put("flag", "re_user");
				ArrayList<HashMap<String, Object>> reuserData = adminMoneyBankService.getGraphData(paramMap);
				mav.addObject("reuserData", reuserData);

			}

		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/management/info_tab1 ::: cubici ] " + e.getMessage());

		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 통합현황 > 운영지표 페이지
	@RequestMapping(value = "/admin/moneybank/cubici/management/info_tab2", method = RequestMethod.GET)
	public ModelAndView cubiciAdminStatusTab2() {
		logger.debug("[ Admin together 통합현황 > 이용상세 ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);

		mav.addObject("pageName", "/admin/moneybank/management/info_tab2");

		int resultCode = 0;

		try {
			// Default 날짜 & 기준일자
			HashMap<String, Object> defaultTime = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultTime.get("fromDate"));
			mav.addObject("toDate", defaultTime.get("toDate"));
			mav.addObject("standardDate", defaultTime.get("toDate").toString());
			
			// 운영지표 상단 데이터
			HashMap<String, Object> paramsMap = new HashMap<String, Object>();
			paramsMap.put("prevDate", defaultTime.get("toDate"));
			HashMap<String, Object> operationInfo = adminMoneyBankService.getOperationInfo(paramsMap);
			mav.addObject("operationInfo", operationInfo);

			// 기준 상품 현황 -> 차후 추가 예정
			mav.addObject("thisProduct", "전체");
			
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/management/info_tab2 ::: cubici ]" + e.getMessage());

		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 통합현황 > 운영지표 데이터 가져오기
	@RequestMapping(value = "/admin/moneybank/cubici/management/info_tab2/get", method = RequestMethod.POST)
	public ModelAndView getCubiciAdminStatusTab2(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ Admin together 통합현황 > 현황종합 ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/info_tab2/get ] " + CmmMessage.parameter_relay_error);

			}else {
				
				// 신규신청금액 GRAPH 데이터
				paramMap.put("flag", "request");
				ArrayList<HashMap<String, Object>> requestData = new ArrayList<HashMap<String, Object>>();
				mav.addObject("requestData", requestData);
	
				// 심사금액 GRAPH 데이터
				paramMap.put("flag", "evaluate");
				ArrayList<HashMap<String, Object>> evalData = new ArrayList<HashMap<String, Object>>();
				mav.addObject("evalData", evalData);
	
				// 계약금액 GRAPH 데이터
				paramMap.put("flag", "approval");
				ArrayList<HashMap<String, Object>> approvalData = new ArrayList<HashMap<String, Object>>();
				mav.addObject("approvalData", approvalData);
	
				// 누적상환 GRAPH 데이터
				paramMap.put("flag", "principal");
				ArrayList<HashMap<String, Object>> originalData = new ArrayList<HashMap<String, Object>>();
				mav.addObject("originalData", originalData);
	
				// 헬로페이 선지급 수수료 GRAPH 데이터
				paramMap.put("flag", "feeAmount");
				ArrayList<HashMap<String, Object>> feeData = new ArrayList<HashMap<String, Object>>();
				mav.addObject("feeData", feeData);
	
				// *** 헬로의 경우 심사금액은 정산예정금, 계약금액은 80프로 구한 금액으로 정의 ***//
			}
			
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/management/info_tab2/get ::: cubici ]" + e.getMessage());

		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 머니뱅크 관리 > 이용상세 페이지
	@RequestMapping(value = "/admin/moneybank/cubici/management/details", method = RequestMethod.GET)
	public ModelAndView cubiciAdminDetailTab() {
		logger.debug("[ Admin together 통합현황 > 이용상세 ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);

		mav.addObject("pageName", "/admin/moneybank/management/details");

		int resultCode = 0;

		try {
			// Default 날짜 & 기준일자
			HashMap<String, Object> defaultTime = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultTime.get("fromDate"));
			mav.addObject("toDate", defaultTime.get("toDate"));
			mav.addObject("standardDate", defaultTime.get("toDate").toString());

		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/management/details ::: cubici ]" + e.getMessage());

		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 이용상세 데이터 가져오기
	@RequestMapping(value = "/admin/moneybank/cubici/management/details/get", method = RequestMethod.POST)
	public ModelAndView getMoneyBankDetails(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ Admin MoneyBank 관리 > 이용상세 ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {

			if (paramMap.isEmpty() || paramMap == null) {

				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/details/get ] " + CmmMessage.parameter_relay_error);

			}else {
			
				// 데이터 가져오기
				ArrayList<HashMap<String, Object>> detailData = adminMoneyBankService.getMoneybankDetails(paramMap);
				mav.addObject("detailData", detailData);
	
				// 합계 데이터 가져오기
				HashMap<String, Object> sumData = adminMoneyBankService.getMoneybankDetailSum(paramMap);
				mav.addObject("sumData", sumData);
				
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/management/details/get ::: cubici ]" + e.getMessage());

		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	// ***** 머니뱅크 관리 NAVI-TAB END ***** //
	
}
