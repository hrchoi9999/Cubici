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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.AdminBillingService;
import egovframework.azon.cmmn.CmmMessage;

@Controller
public class AdminBillingController {

	Logger logger = LoggerFactory.getLogger(AdminCubiciController.class);

	@Autowired
	AdminBillingService adminBillingService;

	// 큐빅아이 회원관리 결제관리 결제 현황
	@RequestMapping(value = "/admin/cubici/manageMember/payment_tab1", method = RequestMethod.GET)
	public ModelAndView managePayment() {
		logger.debug("[ 큐빅아이 관리자 회원관리 결제관리 결제 현황 ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/manageMember/payment_tab1");
		
		try {
			HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultDate.get("fromDate").toString());
			mav.addObject("toDate", defaultDate.get("todayDate").toString());
		} catch (Exception ex) {
			logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/payment_tab1 ] " + ex.getMessage());
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/cubici/manageMember/paymentList", method = RequestMethod.POST)
	public ModelAndView selectPaymentList(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ 큐빅아이 관리자 회원관리 결제관리 결제 현황 리스트 조회 ]");

		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {

			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug("[ /admin/cubici/manageMember/manageMember/paymentList ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> paymentList = adminBillingService.selectPaymentList(paramMap);
				HashMap<String, Object> paymentSumMap = adminBillingService.selectPaymentSumMap(paramMap);
				mav.addObject("paymentList", paymentList);
				mav.addObject("paymentSumMap", paymentSumMap);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/paymentList ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;

	}

	// 큐빅아이 회원관리 > 결제관리 > 요금변경 관리
	@RequestMapping(value = "/admin/cubici/manageMember/payment_tab2", method = RequestMethod.GET)
	public ModelAndView manageChangePayment(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 관리자 회원관리 결제관리 요금변경 관리 ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/manageMember/payment_tab2");

		try {
			HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultDate.get("fromDate").toString());
			mav.addObject("toDate", defaultDate.get("todayDate").toString());			
		} catch (Exception ex) {
			logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/member_tab1 ] " + ex.getMessage());
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/cubici/manageMember/changeChargeList", method = RequestMethod.POST)
	public ModelAndView selectChangeChargeList(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ 큐빅아이 관리자 회원관리 결제관리 요금변경 리스트 조회 ]");

		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {

			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug("[ /admin/cubici/manageMember/manageMember/changeChargeList ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> changeChargeList = adminBillingService.selectChangeChargeList(paramMap);
				mav.addObject("currentPage", paramMap.get("currentPage").toString());
				mav.addObject("changeChargeList", changeChargeList);
			}
			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/changeChargeList ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;

	}
	
	@RequestMapping(value="/admin/cubici/manageMember/refund", method = RequestMethod.POST)
	public ModelAndView refund(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		try {

			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug("[ /admin/cubici/manageMember/manageMember/refund ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> refundMap = adminBillingService.selectRefundData(paramMap);
				mav.addObject("refundMap",refundMap);
			}
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/refund ] " + e.getMessage());
		}
		mav.addObject("resultCode", 0);
		return mav;
	}

	@RequestMapping(value="/admin/cubici/manageMember/refundFinish", method = RequestMethod.POST)
	public ModelAndView refundFinish(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		try {

			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug("[ /admin/cubici/manageMember/manageMember/refundFinish ] " + CmmMessage.parameter_relay_error);
			} else {
				adminBillingService.updateRefundData(paramMap);
			}
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/refundFinish ] " + e.getMessage());
		}
		mav.addObject("resultCode", 0);
		return mav;
	}

	@RequestMapping(value="/admin/cubici/manageMember/cancelCardPayment", method = RequestMethod.POST)
	public ModelAndView cancelCardPayment(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug("[ /admin/cubici/manageMember/manageMember/cancelCardPayment ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> cancelMap = adminBillingService.cancelCardPayment(paramMap);
				mav.addObject("cancelMap", cancelMap);
			}
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/cancelCardPayment ] " + e.getMessage());
		}
		mav.addObject("resultCode", 0);
		return mav;
	}
}