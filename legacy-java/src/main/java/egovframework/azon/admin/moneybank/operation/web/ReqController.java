package egovframework.azon.admin.moneybank.operation.web;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import egovframework.azon.cmmn.component.CubiciUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.MBReqShopService;
import egovframework.azon.admin.moneybank.operation.service.ReqService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.exception.MoneyBankException;


@Controller
public class ReqController {

	Logger logger = LoggerFactory.getLogger(ReqController.class);

	@Autowired
	ReqService reqService;

	@Autowired
	MBReqShopService MBReqShopService;
	
	@RequestMapping(value = "/admin/moneybank/request", method = RequestMethod.GET)
	public ModelAndView totalRequestStatus() {

		logger.debug("[ /admin/moneybank/request ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);

		mav.addObject("pageName", "/admin/moneybank/operation/requestState");

		int resultCode = 0;

		try {
			// Default 날짜 & 기준일자
			HashMap<String, Object> defaultTime = CubiciUtils.defaultSetDate();
			mav.addObject("fromDate", defaultTime.get("fromDate"));
			mav.addObject("toDate", defaultTime.get("todayDate"));
			mav.addObject("standardDate", defaultTime.get("todayDate"));
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/request ] " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}

	@RequestMapping(value = "/admin/moneybank/request/list", method = RequestMethod.POST)
	public ModelAndView getMBRequest(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /admin/moneybank/request/list ]");
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/request/list ] "+CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> requestList = reqService.selectMBRequestList(paramMap);
				HashMap<String, Object> requestSum = reqService.selectMBRequestSum(paramMap);
				mav.addObject("requestList", requestList);
				mav.addObject("requestSum", requestSum);
				mav.addObject("currentPage", paramMap.get("NOWPAGENO").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/request/list ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@Secured("ROLE_ADMIN_CUBICI")
	@RequestMapping(value = "/admin/cubici/subStateDetail", method = RequestMethod.GET)
	public ModelAndView setsubStateDetail(@RequestParam HashMap<String, Object> param) {
		logger.debug("[ /admin/cubici/subStateDetail ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/operation/submissionState");
		int resultCode = 0;		
		
		try {
			HashMap<String, Object> requestMap = reqService.getMBRequestDetail(param);
			mav.addObject("requestMap", requestMap);

			HashMap<String, Object> subMap = reqService.getMBSubDocDetail(param);
			mav.addObject("subMap", subMap);

			HashMap<String, Object> fileMap = reqService.getFileList(param);
			mav.addObject("fileMap", fileMap);

			ArrayList<HashMap<String, Object>> shopList = MBReqShopService.getMBRequestShopList(param);
			mav.addObject("shopList", shopList);

			ArrayList<HashMap<String, Object>> infoCallList = reqService.getInfoCallList(param);
			mav.addObject("infoCallList", infoCallList);
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/subStateDetail ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/moneybank/addCBInfo", method = RequestMethod.POST)
	public ModelAndView addCBInfo(
			@RequestPart(value = "data") HashMap<String, Object> paramMap,
			@RequestPart(value = "file", required = false) List<MultipartFile> fileList) {
		logger.debug("[ /admin/moneybank/addCBInfo ]");
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/addCBInfo ] "+CmmMessage.parameter_relay_error);
			} else {
				reqService.addCBInfo(paramMap, fileList);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/addCBInfo ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/moneybank/addInfoCallDetail", method = RequestMethod.POST)
	public ModelAndView addInfoCallDetail(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ /admin/moneybank/addInfoCallDetail ]");
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/addInfoCallDetail ] "+CmmMessage.parameter_relay_error);
			} else {
				reqService.addInfoCallDetail(paramMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/addInfoCallDetail ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/moneybank/subComplete", method = RequestMethod.POST)
	public ModelAndView subComplete(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ /admin/moneybank/subComplete ]");
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/subComplete ] "+CmmMessage.parameter_relay_error);
			} else {
				reqService.setSubComplete(paramMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/subComplete ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/moneybank/calcPrizmScore", method = RequestMethod.POST)
	public ModelAndView calcPrizmScore(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /admin/moneybank/calcPrizmScore ]");
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;
		boolean status = false;

		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/calcPrizmScore ] "+CmmMessage.parameter_relay_error);
			} else {
				reqService.calcPrizmScore(paramMap);
				status = true;
			}
		} catch(MoneyBankException e) {
			mav.addObject("description", e.getMoneybankErrorCode().getDescription());
			logger.debug(" [ ERROR ] [ /admin/moneybank/calcPrizmScore ] " + e.getMessage());
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/calcPrizmScore ] "+e.getMessage());
		} finally {
			mav.addObject("status", status);
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
}
