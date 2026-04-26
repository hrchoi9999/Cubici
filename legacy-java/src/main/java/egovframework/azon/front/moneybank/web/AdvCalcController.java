package egovframework.azon.front.moneybank.web;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.MBReqShopService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.exception.MoneyBankException;
import egovframework.azon.cmmn.moneybank.service.MoneybankCmmService;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.moneybank.service.AdvCalcService;

@Controller
public class AdvCalcController {

    @Autowired
    CubiciCmmService cubiciCmmService;

    @Autowired
    MoneybankCmmService mbankCmmService;

    @Autowired
    AdvCalcService advCalcService;

    @Autowired
    MBReqShopService MBReqShopService;


    Logger logger = LoggerFactory.getLogger(AdvCalcController.class);

    @RequestMapping(value = "/moneybank/advcalc/request", method = RequestMethod.GET)
    public ModelAndView calcRequestGet() {
        logger.debug("[ /moneybank/advcalc/requestget ]");

        ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
        mav.addObject("pageName", "moneybank/hellopayCal/requestForm");
        int resultCode = 0;

        try {
            HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
            mav.addObject("user", principal);
        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/get ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    @RequestMapping(value = "/moneybank/advcalc/request", method = RequestMethod.POST)
    public ModelAndView calcRequestPost() {
        logger.debug("[ /moneybank/advcalc/requestpost ]");

        ModelAndView mav = new ModelAndView("jsonView");
        int resultCode = 0;

        try {
            advCalcService.calcRequestPost();
        } catch (MoneyBankException e) {
            mav.addObject("description", e.getMoneybankErrorCode().getDescription());
            mav.addObject("code", e.getMoneybankErrorCode().getCode());
        } catch (Exception e) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/post ] " + e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    @PreAuthorize("(hasAnyRole('ROLE_MB_ADVANCE', 'ROLE_MB_REQUEST')) and (principal.user_code == #paramMap['code'])")
    @RequestMapping(value = "/moneybank/advcalc/request/get", method = RequestMethod.POST)
    public ModelAndView calcRequestget(@RequestBody HashMap<String, Object> paramMap) {
        logger.debug("[ /moneybank/advcalc/request/get ]");

        ModelAndView mav = new ModelAndView("jsonView");
        int resultCode = 0;

        try {
            String user_code = String.valueOf(paramMap.get("code"));
            ArrayList<HashMap<String, Object>> useShop = cubiciCmmService.useShop(user_code);
            mav.addObject("shop", useShop);

            ArrayList<HashMap<String, Object>> bankList = cubiciCmmService.getBankInfo();
            mav.addObject("bank", bankList);
        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/request ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 계약신청 페이지
    @RequestMapping(value = "/m/moneybank/advCalc/request", method = RequestMethod.GET)
    public ModelAndView mobileHellopayRequest() {

        logger.debug("[ /m/moneybank/advCalc/request ]");

        ModelAndView mav = new ModelAndView("jsonView");
        int resultCode = 0;

        try {
            advCalcService.calcRequestPost();
        } catch (MoneyBankException e) {
            mav.addObject("description", e.getMoneybankErrorCode().getDescription());
            mav.addObject("code", e.getMoneybankErrorCode().getCode());
        } catch (Exception e) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /m/moneybank/advCalc/request ] " + e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 자격 요건 확인
    @RequestMapping(value = "/moneybank/advcalc/request/advance", method = RequestMethod.POST)
    public ModelAndView requestAdvance(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug("[ /moneybank/advcalc/advancerequest ]");
        ModelAndView mav = new ModelAndView("jsonView");

        boolean isSuccess = false;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/advance ] " + CmmMessage.parameter_relay_error);
            } else {
                isSuccess = advCalcService.isAdvanceRequest(paramMap);
            }
        } catch (MoneyBankException e) {
            mav.addObject("description", e.getMoneybankErrorCode().getDescription());
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/advance ] " + e.getMessage());
        } catch (Exception e) {
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/advance ] " + e.getMessage());
        } finally {
            mav.addObject("isSuccess", isSuccess);
            mav.addObject("resultCode", 0);
        }
        return mav;
    }

    @RequestMapping(value = "/moneybank/advcalc/request/settle-sendsms")
    public ModelAndView settleAccSendSms() {
        logger.debug("[ /moneybank/advcalc/request/settle-sendsms ]");
        ModelAndView mav = new ModelAndView("jsonView");
        int resultCode = 0;

        try {
            advCalcService.settleAccSendSms();
        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/settle-sendsms ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 신청 접수
    @RequestMapping(value = "/moneybank/advcalc/request/accept", method = RequestMethod.POST)
    public ModelAndView requestAccept(
            @RequestPart(value = "data") HashMap<String, Object> paramMap,
            @RequestPart(value = "file", required = false) List<MultipartFile> fileList) {

        logger.debug(" [ /moneybank/advCalc/request/accept ] ");

        ModelAndView mav = new ModelAndView("jsonView");

        boolean isSuccess = false;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/accept ] " + CmmMessage.parameter_relay_error);
            } else {
                advCalcService.requestAccept(paramMap, fileList);
                isSuccess = true;
            }
        } catch (MoneyBankException e) {
            mav.addObject("description", e.getMoneybankErrorCode().getDescription());
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/request/accept ] " + e.getMessage());
        } catch (Exception e) {
            logger.debug(" [ ERROR ] [ /moneybank/advCalc/request/accept ] " + e.getMessage());
        } finally {
            mav.addObject("isSuccess", isSuccess);
        }
        return mav;
    }

    // 계약심사 페이지
    @RequestMapping(value = "/moneybank/advcalc/evaluate", method = RequestMethod.GET)
    public ModelAndView hellopayEvaluate() {

        logger.debug("[ /moneybank/advcalc/evaluate ]");

        // 현재는 모든 선정산 신청 & 현황페이지는 공통
        ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
        mav.addObject("pageName", "moneybank/hellopayCal/evaluate");

        // 프로세스 성공 여부
        int resultCode = 0;

        try {

            // 회원 정보
            HashMap<String, Object> params = CubiciUtils.UserAuthentication();
            mav.addObject("info", params);

            // 기준날짜
            HashMap<String, Object> defaultDate = mbankCmmService.getTimeInfo();
            params.put("standard_date", defaultDate.get("toDate").toString());
            mav.addObject("standard_date", defaultDate.get("toDate").toString());

            // 머니뱅크 정보
            HashMap<String, Object> mbankInfo = mbankCmmService.getMoneybankRequestInfo(params);
            mav.addObject("mbankInfo", mbankInfo);

            // 신청 쇼핑몰 목록
            ArrayList<HashMap<String, Object>> shopList = MBReqShopService.getMBRequestShopList(mbankInfo);
            mav.addObject("shopList", shopList);

        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/evaluate ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 이용조건 승인/거절
    @RequestMapping(value = "/moneybank/advcalc/evaluate/termsCheck", method = RequestMethod.POST)
    public ModelAndView isApprovalTermsOfUse(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug("[ /moneybank/advcalc/evaluate/termsCheck ]");

        ModelAndView mav = new ModelAndView("jsonView");

        int resultCode = 0;
        boolean status = false;

        try {
            advCalcService.isApprovalTermsOfUse(paramMap);
            status = true;
        } catch (MoneyBankException e) {
            mav.addObject("description", e.getMoneybankErrorCode().getDescription());
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/evaluate/termsCheck ] " + e.getMessage());
        } catch (Exception e) {
            resultCode = 88;
            logger.debug("[ /moneybank/advcalc/evaluate/termsCheck ]" + e.getMessage());
        } finally {
            mav.addObject("status", status);
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 계약심사 페이지
    @RequestMapping(value = "/m/moneybank/advcalc/evaluate", method = RequestMethod.GET)
    public ModelAndView mobileHellopayEvaluate() {

        logger.debug("[ /m/moneybank/advCalc/evaluate ]");

        // 현재는 모든 선정산 신청 & 현황페이지는 공통
        ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
        mav.addObject("pageName", "moneybank/hellopayCal/m_helloBizEval");

        // 프로세스 성공 여부
        int resultCode = 0;

        try {

            // 회원 정보
            HashMap<String, Object> params = CubiciUtils.UserAuthentication();
            mav.addObject("info", params);

            // 기준날짜
            HashMap<String, Object> defaultDate = mbankCmmService.getTimeInfo();
            params.put("standard_date", defaultDate.get("toDate").toString());
            mav.addObject("standard_date", defaultDate.get("toDate").toString());

            // 머니뱅크 정보
            HashMap<String, Object> mbankInfo = mbankCmmService.getMoneybankRequestInfo(params);
            mav.addObject("mbankInfo", mbankInfo);

        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /moneybank/hellopay/evaluate ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 계약전사서명 페이지
    @RequestMapping(value = "/moneybank/advcalc/contract", method = RequestMethod.GET)
    public ModelAndView hellopayContract() {

        logger.debug("[ /moneybank/advcalc/contract ]");

        // 현재는 모든 선정산 신청 & 현황페이지는 공통
        ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
        mav.addObject("pageName", "moneybank/hellopayCal/contract");

        // 프로세스 성공 여부
        int resultCode = 0;

        try {
            // 회원 정보
            HashMap<String, Object> params = CubiciUtils.UserAuthentication();
            mav.addObject("info", params);

            // 머니뱅크 정보
            HashMap<String, Object> mbankInfo = mbankCmmService.getMoneybankRequestInfo(params);
            mav.addObject("mbankInfo", mbankInfo);

        } catch (MoneyBankException e) {
            mav.addObject("description", e.getMoneybankErrorCode().getDescription());
            logger.debug(" [ ERROR ] [ /moneybank/advcalc/contract ] " + e.getMessage());
        } catch (Exception e) {
            resultCode = 88;
            logger.debug("[ /moneybank/advcalc/contract ]" + e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

		return mav;
	}

	// 이용현황 페이지
	@PreAuthorize("hasRole('ROLE_USER_MB')")
	@RequestMapping(value="/moneybank/current", method=RequestMethod.GET)
	public ModelAndView hellopayCurrent() {
		
		logger.debug("[ /moneybank/current ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "moneybank/hellopayCal/viewCurrent");
		
		int resultCode = 0;
		
		try {
			
			// 기준날짜 & default 날짜 범위
			HashMap<String, Object> defaultDate = mbankCmmService.getTimeInfo();
			mav.addObject("standard_date", defaultDate.get("toDate").toString());
			mav.addObject("fromDate", defaultDate.get("fromDate").toString());
			mav.addObject("toDate", defaultDate.get("toDate").toString());

            // 기본 회원정보
            HashMap<String, Object> userInfo = CubiciUtils.UserAuthentication();
            userInfo.put("standard_date", defaultDate.get("toDate").toString());
            mav.addObject("info", userInfo);

            // 머니뱅크 정보
            HashMap<String, Object> mbankInfo = mbankCmmService.getMoneybankRequestInfo(userInfo);
            mav.addObject("mbankInfo", mbankInfo);

            // 신청 쇼핑몰 목록
            mbankInfo.put("id", String.valueOf(mbankInfo.get("mbid")));
            ArrayList<HashMap<String, Object>> shopList = MBReqShopService.getMBReqCompleteShopList(mbankInfo);
            mav.addObject("shopList", shopList);

        } catch (Exception ex) {
            resultCode = 99;
            logger.debug("[ /moneybank/current ]" + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }
        return mav;
    }

    // 이용현황 모바일 페이지
    @RequestMapping(value = "/m/moneybank/advCalc/current", method = RequestMethod.GET)
    public ModelAndView mobilehellopayCurrent() {

        logger.debug("[ /m/moneybank/advCalc/current ]");

        ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
        mav.addObject("pageName", "moneybank/hellopayCal/m_viewCurrent");

        int resultCode = 0;

        try {

            // 기준날짜 & default 날짜 범위
            HashMap<String, Object> defaultDate = mbankCmmService.getTimeInfo();
            mav.addObject("standard_date", defaultDate.get("toDate").toString());
            mav.addObject("fromDate", defaultDate.get("fromDate").toString());
            mav.addObject("toDate", defaultDate.get("toDate").toString());

            // 기본 회원정보
            HashMap<String, Object> userInfo = CubiciUtils.UserAuthentication();
            userInfo.put("standard_date", defaultDate.get("toDate").toString());
            mav.addObject("info", userInfo);

            // 머니뱅크 정보
            HashMap<String, Object> mbankInfo = mbankCmmService.getMoneybankRequestInfo(userInfo);
            mav.addObject("mbankInfo", mbankInfo);

        } catch (Exception ex) {
            resultCode = 99;
            logger.debug("[ /moneybank/advCalc/helloBizCurrent ]" + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }
        return mav;
    }

    // 이용현황 데이터 가져오기
    @RequestMapping(value = "/moneybank/advCalc/current/get", method = RequestMethod.POST)
    public ModelAndView getCurrentExecuteList(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug("[ /moneybank/advCalc/current/get ]");

		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			mav.addObject("RedemDetailList", advCalcService.getRedemDetailList(paramMap));
			mav.addObject("RedemDetailSum", advCalcService.getRedemDetailSum(paramMap));
			mav.addObject("currentPage", paramMap.get("pageNo").toString());
			mav.addObject("dataLimit", paramMap.get("data_limit").toString());
		} catch (Exception ex) {
			resultCode = 88;
			logger.debug("[ /moneybank/advCalc/current/get ]"+ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}	
}
