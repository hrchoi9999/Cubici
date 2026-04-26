package egovframework.azon.admin.moneybank.operation.web;

import egovframework.azon.admin.moneybank.operation.service.RedemService;
import egovframework.azon.admin.prizm.PmsService;
import egovframework.azon.cmmn.CmmMessage;
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

import java.util.HashMap;

@Controller
public class RedemController {
	
	Logger logger = LoggerFactory.getLogger(RedemController.class);

	@Autowired
	RedemService redemService;

	@Autowired
	PmsService pmsService;

	@RequestMapping(value = "/admin/moneybank/redemption", method = RequestMethod.GET)
	public ModelAndView redemState() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/operation/redemState");
		try {
			HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
			mav.addObject("standardDate", String.valueOf(defaultDate.get("toDate")));
			mav.addObject("fromDate", String.valueOf(defaultDate.get("fromDate")));
			mav.addObject("toDate", String.valueOf(defaultDate.get("toDate")));
		} catch (Exception e){
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemption ] " + e.getMessage());
		}
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/redemption/list", method = RequestMethod.POST)
	public ModelAndView loadRedemList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/redemption/get ] "+CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("redemList", redemService.findRedemList(paramMap));
				mav.addObject("redemAmountTotal", redemService.findRedemAmountTotal(paramMap));
				mav.addObject("redemTotal", redemService.findRedemCountTotal(paramMap));
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemption/get ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/moneybank/redemdetail", method = RequestMethod.GET)
	public ModelAndView redemdetail(@RequestParam HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/operation/redemDetail");
		try {
			HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", String.valueOf(defaultDate.get("fromDate")));
			mav.addObject("toDate", String.valueOf(defaultDate.get("toDate")));
			mav.addObject("todayDate", String.valueOf(defaultDate.get("todayDate")));

			HashMap<String, Object> principal = CubiciUtils.AdminAuthentication();
			mav.addObject("admin_nm", String.valueOf(principal.get("username")));
			mav.addObject("redemInfo", redemService.getRedemInfo(String.valueOf(paramMap.get("mbid"))));
		} catch (Exception e){
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail ] " + e.getMessage());
		}
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/redemdetail/list", method = RequestMethod.POST)
	public ModelAndView redemDetailList(@RequestBody HashMap<String, Object> paramMap){
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/post ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("RedemDetailList", redemService.findRedemDetailList(paramMap));
				mav.addObject("RedemDetailSum", redemService.findRedemDetailSum(paramMap));
				mav.addObject("currentPage", paramMap.get("pageNo").toString());
				mav.addObject("dataLimit", paramMap.get("data_limit").toString());
				mav.addObject("resultCode", resultCode);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/post ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/redemdetail/pms", method = RequestMethod.POST)
	public ModelAndView pmsList(@RequestBody HashMap<String, Object> paramMap){
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/pms ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("pmsResultDetailList",pmsService.selectPmsResultDetail(paramMap.get("mbid").toString()));
				mav.addObject("pmsCoreRiskList",pmsService.selectPmsCoreDetail(paramMap.get("mbid").toString()));
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/pms ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/redemdetail/eval-list", method = RequestMethod.POST)
	public ModelAndView evalInfoList(@RequestBody HashMap<String,Object> paramMap){
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try{
			if(paramMap.isEmpty() || paramMap == null){
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/eval-list ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("evalInfoList", redemService.getEvalInfoList(paramMap));
				mav.addObject("total", redemService.evalCountTotal(String.valueOf(paramMap.get("mbid"))));
				mav.addObject("currentPage",paramMap.get("pageNo"));
			}
		} catch (Exception e){
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/eval-list ] " + e.getMessage());
		} finally {
			mav.addObject("resultCode",resultCode);
		}
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/redemdetail/eval-detail", method = RequestMethod.POST)
	public ModelAndView getEvalInfo(@RequestBody HashMap<String,Object> paramMap){
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try{
			if(paramMap.isEmpty() || paramMap == null){
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/eval-detail ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("evalInfo", redemService.getEvalInfo(String.valueOf(paramMap.get("eval_no"))));
			}
		} catch (Exception e){
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/eval-detail ] " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/redemdetail/eval-enroll", method = RequestMethod.POST)
	public ModelAndView evalEnroll(@RequestBody HashMap<String,Object> paramMap){
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null){
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/eval-enroll ] " + CmmMessage.parameter_relay_error);
			} else {
				redemService.evalEnroll(paramMap);
			}
		} catch (Exception e){
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/eval-enroll ] " + e.getMessage());
		} finally {
			mav.addObject("resultCode",resultCode);
		}
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/redemdetail/update/status", method = RequestMethod.POST)
	public ModelAndView updateStatus(@RequestBody HashMap<String,Object> paramMap){
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null){
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/update/status ] " + CmmMessage.parameter_relay_error);
			}else {
				mav.addObject("msg", redemService.updateStatus(paramMap));
			}
		} catch (Exception e){
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/redemdetail/update/status ] " + e.getMessage());
		} finally {
			mav.addObject("resultCode",resultCode);
		}
		return mav;
	}
}