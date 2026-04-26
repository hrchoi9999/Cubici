package egovframework.azon.front.cubici.web;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.azon.cmmn.moneybank.service.MoneybankCmmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.front.cubici.service.BillingService;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.cubici.service.MemberService;

// 회원 controller
@Controller
public class BillingController {

	Logger logger = LoggerFactory.getLogger(BillingController.class);

	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	MemberService memberService;
	
	@Autowired
	BillingService billingService;

	@Autowired
	MoneybankCmmService moneybankCmmService;


	@RequestMapping(value = "/cubici/mypage/myCharge", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView myCharge() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "myPage/myCharge");
		try {

			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
			mav.addObject("userInfo", userInfo);
			ArrayList<HashMap<String, Object>> userChargeList = billingService.selectUserChargeInfo(userInfo);
			HashMap<String, Object> userUsingChargeMap = billingService.selectUsingChargeInfo(userInfo);
			HashMap<String, Object> userSBChargeMap = billingService.selectSBChargeInfo(userInfo);
			mav.addObject("userChargeList", userChargeList);
			mav.addObject("userUsingChargeMap", userUsingChargeMap);
			mav.addObject("userSBChargeMap", userSBChargeMap);
			ArrayList<HashMap<String, Object>> chargeInfo = billingService.selectChargeList();
			mav.addObject("chargeInfo", chargeInfo);
			ArrayList<HashMap<String, Object>> bankInfo = cubiciCmmService.getBankInfo();
			mav.addObject("bankInfo", bankInfo);
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		return mav;
	}
	
	@RequestMapping(value="/m/cubici/mypage/m_myCharge", method = RequestMethod.GET)
	public ModelAndView mobileMyCharge() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "myPage/m_myCharge");
		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
			mav.addObject("userInfo", userInfo);
			ArrayList<HashMap<String, Object>> userChargeList = billingService.selectUserChargeInfo(userInfo);
			HashMap<String, Object> userUsingChargeMap = billingService.selectUsingChargeInfo(userInfo);
			HashMap<String, Object> userSBChargeMap = billingService.selectSBChargeInfo(userInfo);
			mav.addObject("userChargeList", userChargeList);
			mav.addObject("userUsingChargeMap", userUsingChargeMap);
			mav.addObject("userSBChargeMap", userSBChargeMap);
			ArrayList<HashMap<String, Object>> chargeInfo = billingService.selectChargeList();
			mav.addObject("chargeInfo", chargeInfo);
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		return mav;
	}
	
	/* 프로모션 코드 확인 */
	@RequestMapping(value="/cubici/mypage/myCharge/checkPromoCode", method = RequestMethod.POST)
	public ModelAndView selectPromotionInfo (@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug(" [ ERROR ] [ /cubici/mypage/myCharge/checkPromoCode ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
				HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
				paramMap.putAll(userInfo);
				HashMap<String, Object> promotionMap = billingService.selectPromotionInfo(paramMap);
				mav.addObject("promotionMap",promotionMap);
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
		} 
		mav.addObject("resultCode", 0);
		return mav;
	}
	
	/* 날짜 설정 시 차액 계산 */
	@RequestMapping(value = "/cubici/mypage/myCharge/calChargeAmount", method = RequestMethod.POST)
	public ModelAndView calChargeAmount(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/mypage/myCharge/calChargeAmount ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
				HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
				paramMap.putAll(userInfo);
				HashMap<String, Object> chargeMap = billingService.preCalAmount(paramMap);
				mav.addObject("chargeMap",chargeMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	/* 결제 요청시 계산 */
	@RequestMapping(value = "/cubici/mypage/myCharge/billingRequest", method = RequestMethod.POST)
	public ModelAndView billingRequest(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/mypage/myCharge/billingRequest ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
				HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
				paramMap.putAll(userInfo);
				HashMap<String, Object> chargeMap = billingService.billingCalAmount(paramMap);
				mav.addObject("chargeMap",chargeMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}	

	/* 결제 검증 */
	@RequestMapping(value = "/cubici/mypage/myCharge/payments/complete", method = RequestMethod.POST)
	public ModelAndView paymentsComplete(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug(" [ ERROR ] [ /cubici/mypage/myCharge/payments/complete ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = billingService.paymentVerification(paramMap);
				mav.addObject("resultMap", resultMap);
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
		}		
		return mav;
	}
	
	/* 결제데이터 불러오기 */
	@RequestMapping(value = "/cubici/mypage/myCharge/selectReceiptId", method = RequestMethod.POST)	
	public ModelAndView selectReceiptId(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/mypage/myCharge/selectReceiptId ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> paymentList = billingService.selectPaymentDetail(paramMap);
				mav.addObject("paymentList",paymentList);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	/* 환급 신청 데이터 저장 */
	@RequestMapping(value = "/cubici/mypage/myCharge/refundRequest", method = RequestMethod.POST)
	public ModelAndView refundRequest(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/mypage/myCharge/refundRequest ] " + CmmMessage.parameter_relay_error);
			} else {
				billingService.refundRequest(paramMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	/* ********** 마이페이지 > 나의 요금 끝 ********** */	


	/* *********** 서비스 해지 ********** */
	@RequestMapping(value = "/cubici/mypage/withdraw", method = RequestMethod.GET)
	public ModelAndView withdraw() {

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "/myPage/withdraw");
		
		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
			mav.addObject("userInfo", userInfo);
			HashMap<String, Object> userUsingChargeMap = billingService.selectUsingChargeInfo(userInfo);
			HashMap<String, Object> userSBChargeMap = billingService.selectSBChargeInfo(userInfo);
			mav.addObject("userUsingChargeMap", userUsingChargeMap);
			mav.addObject("userSBChargeMap", userSBChargeMap);
			ArrayList<HashMap<String, Object>> userMBList = billingService.selectMBList(principal);
			mav.addObject("userMBList", userMBList);

			// 머니뱅크 정보
			HashMap<String, Object> mbankInfo = moneybankCmmService.getMoneybankRequestInfo(userInfo);
			mav.addObject("mbankInfo", mbankInfo);
		} catch (Exception e) {
			logger.error(e.getMessage());
		} 

		return mav;
	}
	
	/*  [모바일] 서비스 해지 */
	@RequestMapping(value = "/m/cubici/mypage/withdraw", method = RequestMethod.GET)
	public ModelAndView mobileWithdraw() {
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "myPage/m_withdraw");
		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
			mav.addObject("userInfo", userInfo);
			ArrayList<HashMap<String, Object>> userChargeList = billingService.selectUserChargeInfo(principal);
			mav.addObject("userChargeList", userChargeList);
			ArrayList<HashMap<String, Object>> userMBList = billingService.selectMBList(principal);
			mav.addObject("userMBList", userMBList);
		} catch (Exception e) {
			logger.error(e.getMessage());
		} 
		return mav;
	}
	
	@RequestMapping(value = "/cubici/mypage/withdraw/moneybankCheck", method = RequestMethod.POST)
	public ModelAndView moneybankCheck(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug(" [ ERROR ] [ /cubici/mypage/withdraw/moneybankCheck ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> MbBalanceMap = billingService.selectMbBalance(paramMap);
				mav.addObject("MbBalanceMap", MbBalanceMap);
			}
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /cubici/mypage/withdraw/moneybankCheck ] " + e.getMessage());
		}

		mav.addObject("resultCode", 0);
		return mav;
	}
	
	@RequestMapping(value = "/cubici/mypage/withdraw/requestCancel", method = RequestMethod.POST)
	public ModelAndView requestCancel(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug(" [ ERROR ] [ /cubici/mypage/withdraw/requestCancel ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
				paramMap.putAll(memberService.selectUserInfo(principal));
				billingService.requestCancel(paramMap);
			}
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /cubici/mypage/withdraw/requestCancel ] " + e.getMessage());
		}

		mav.addObject("resultCode", 0);
		return mav;
	}

    @PreAuthorize("Authenticated")
	@RequestMapping(value = "/cubici/mypage/withdraw/cancelSBCharge", method = RequestMethod.POST)
	public ModelAndView cancelSBCharge(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug(" [ ERROR ] [ /cubici/mypage/withdraw/cancelSBCharge ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> cancel = billingService.cancelSBCharge(paramMap);
				mav.addObject("cancel",cancel);
			}
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /cubici/mypage/withdraw/cancelSBCharge ] " + e.getMessage());
		}

		mav.addObject("resultCode", 0);
		return mav;
	}
}
