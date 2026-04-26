package egovframework.azon.cmmn.moneybank.web;

import java.util.HashMap;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.prizm.PrizmService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciComponent;
import egovframework.azon.cmmn.exception.MoneyBankException;
import egovframework.azon.cmmn.moneybank.service.MoneybankCmmService;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.admin.cubici.service.MBReqShopService;

@Controller
public class MoneybankCmmController {
	
	Logger logger = LoggerFactory.getLogger(MoneybankCmmController.class);
	
	@Autowired
	CubiciCmmService cubiciCmmService;
	
	@Autowired
	MoneybankCmmService mbankCmmService;
	
	@Autowired
	MBReqShopService MBReqShopService;
	
	@Autowired
	PrizmService prizmService;
	
	@Autowired
	CubiciComponent cubiciComponent;
	
	// 선지급 서비스 소개 페이지
	@RequestMapping(value="/moneybank/intro/advpay", method=RequestMethod.GET)
	public ModelAndView advancePayIntro() {

		logger.debug("[ /moneybank/intro/advpay ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "moneybank/advPayIntro");

		return mav;
	}
	
	// 선정산 서비스 소개 페이지
	@RequestMapping(value="/moneybank/intro/advcalc", method=RequestMethod.GET)
	public ModelAndView advanceCalcIntro() {

		logger.debug("[ /moneybank/intro/advcalc ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "moneybank/advCalcIntro");

		return mav;
	}
	
	// 신용대출 서비스 소개 페이지
	@RequestMapping(value="/moneybank/intro/creditpay", method=RequestMethod.GET)
	public ModelAndView creditPayIntro() {

		logger.debug("[ /moneybank/intro/creditpay ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "moneybank/creditIntro");

		return mav;
	}
	
	// 서비스 소개 페이지 (Mobile Ver.)
	@RequestMapping(value="/m/moneybank/advPay/intro", method=RequestMethod.GET)
	public ModelAndView mobileAdvancePayIntro() {

		logger.debug("[ /m/moneybank/intro ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "moneybank/m_advPayIntro");

		return mav;
	}
	
	// 선정산 서비스 소개 페이지 (Mobile Ver.)
	@RequestMapping(value="/m/moneybank/advCalc/intro", method=RequestMethod.GET)
	public ModelAndView mobileAdvanceCalcIntro() {

		logger.debug("[ /moneybank/advanceSettle ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		//mav.addObject("pageName", "moneybank/m_advCalcIntro");

		return mav;
	}
	
	// 신용대출 서비스 소개 페이지 (Mobile Ver.)
	@RequestMapping(value="/m/moneybank/creditPay/intro", method=RequestMethod.GET)
	public ModelAndView mobileCreditPayIntro() {

		logger.debug("[ /moneybank/creditPay ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		//mav.addObject("pageName", "moneybank/m_creditIntro");

		return mav;
	}
	
	@RequestMapping(value="/moneybank/request", method=RequestMethod.GET)
	public ModelAndView MBrequestRedirect() {
		
		logger.debug("[ /moneybank/request ]");

		ModelAndView mav = new ModelAndView();
		try {
			mav.setViewName("redirect:" + mbankCmmService.setUrlByMbStatus());
		} catch(MoneyBankException e) {
			mav.setViewName(CmmMessage.cubiciFrame);
			mav.addObject("pageName", "moneybank/advPayIntro");
			mav.addObject("description", e.getMoneybankErrorCode().getDescription());
			logger.debug(" [ ERROR ] [ /moneybank/request ] " + e.getMessage());
		} catch (Exception e) {
			logger.debug("[ /moneybank/request ]"+e.getMessage());
		} 		
		return mav;
	}
	
	// 계약 진행
	@RequestMapping(value="/moneybank/processContinue", method=RequestMethod.GET)
	public ModelAndView MBProcessContinue() {
		
		logger.debug("[ /moneybank/processContinue ]");

		ModelAndView mav = new ModelAndView();
		try {
			mav.setViewName("redirect:" + mbankCmmService.setUrlByMbStatus());
		} catch (Exception e) {
			logger.debug("[ /moneybank/processContinue ]"+e.getMessage());
		} 		
		return mav;
	}
	
	// 계약 중도 취소
	@RequestMapping(value="/moneybank/processEnd", method=RequestMethod.POST)
	public ModelAndView makeContract(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug("[ /moneybank/processEnd ]");

		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			mbankCmmService.processEnd(paramMap);
		} catch(MoneyBankException e) {
			mav.addObject("description", e.getMoneybankErrorCode().getDescription());
			logger.debug(" [ ERROR ] [ /moneybank/processEnd ] " + e.getMessage());
		} catch (Exception e) {
			resultCode = 88;
			logger.debug("[ /moneybank/processEnd ]"+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// ===================== Moneybank Scheduled Process ===================== //
	// 데이터 수집 확인( 오전 3시 실행 )
	//@Scheduled(cron = "0 0 3 * * *")
	/*
	public void processDataCollectCheck() {
		logger.debug("[ User Data Collection Progress Check START ]");
		
		try {
			
			// 신청완료 회원만 불러올 것
			HashMap<String, Object> params = new HashMap<String, Object>();
			params.put("progressStatus", "00"); 
			
			// 데이터수집 여부 확인 후 프리즘 산출 및 신청상태 업데이트
			mbankCmmService.dataCollectCheck(params);
			
		}catch(Exception ex) {
			logger.debug("[ User Data Collection Progress Check ERROR ]"+ex.getMessage());
		}
		
		logger.debug("[ User Data Collection Progress Check END ]");
	}
	*/
	// ===================== Moneybank Scheduled Process ===================== //
}
