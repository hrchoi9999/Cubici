package egovframework.azon.admin.moneybank.management.web;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.azon.cmmn.component.CubiciUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cmmn.service.ManageMemberService;
import egovframework.azon.cmmn.CmmMessage;

@Controller
public class MbMemberController {
	
	Logger logger = LoggerFactory.getLogger(MbMemberController.class);
	
	@Autowired
	ManageMemberService manageMemberService;
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value="/admin/moneybank/management/usageList", method=RequestMethod.GET)
	public ModelAndView usageListGet() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/management/usageList");
		
		HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
		mav.addObject("standardDate", String.valueOf(defaultDate.get("todayDate")));
		mav.addObject("fromDate", String.valueOf(defaultDate.get("fromDate")));
		mav.addObject("toDate", String.valueOf(defaultDate.get("toDate")));
		
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value="/admin/moneybank/management/usageList", method=RequestMethod.POST)
	public ModelAndView usageListPost(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/usageList ] " + CmmMessage.parameter_relay_error);
			}else {
				ArrayList<HashMap<String, Object>> usageList = manageMemberService.findUsageList(paramMap);
				mav.addObject("usageList", usageList);

				HashMap<String, Object> getUsageListCount = manageMemberService.getUsageListCount(paramMap);
				mav.addObject("getUsageListCount", getUsageListCount);
				
				mav.addObject("dataPerPage", Integer.parseInt(String.valueOf(paramMap.get("dataPerPage"))));
				mav.addObject("currentPage",  Integer.parseInt(String.valueOf(paramMap.get("currentPage"))));
				mav.addObject("dataCnt",  Integer.parseInt(String.valueOf(paramMap.get("dataCnt"))));
			}
		} catch(Exception ex) {
			resultCode = 99; 
			logger.debug(" [ ERROR ] [ /admin/moneybank/management/usageList ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/moneybank/management/usageDetail", method = RequestMethod.GET)
	public ModelAndView usageDetail(@RequestParam HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/management/usageDetail");
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/usageDetail ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
				mav.addObject("standardDate", String.valueOf(defaultDate.get("toDate")));

				String userCode = String.valueOf(paramMap.get("code"));
				mav.addObject("userDetail", manageMemberService.userDetail(userCode));
				mav.addObject("userStatusRateDetail", manageMemberService.userStatusRateDetail(userCode));
				mav.addObject("userStatusRateTotalDate", manageMemberService.userStatusRateTotalDate(userCode));
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /admin/moneybank/management/usageDetail ] " + ex.getMessage());
			
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/moneybank/management/userInfo", method = RequestMethod.GET)
	public ModelAndView userInfoGet(@RequestParam HashMap<String, Object> paramMap) {
		
		logger.debug("[머니뱅크 관리 이용상세 기본정보]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cmmn/userInfo");
		
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/moneybank/management/userInfo", method = RequestMethod.POST)
	public ModelAndView userInfoPost(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/userInfo ] " + CmmMessage.parameter_relay_error);
			} else {
				manageMemberService.userEvaluateEnroll(paramMap);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /admin/moneybank/management/userInfo ] " + ex.getMessage());
			
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/moneybank/management/tabInfo", method = RequestMethod.POST)
	public ModelAndView tabInfo(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/tabInfo ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("findMbTab", manageMemberService.findMbTab(paramMap));
				mav.addObject("history", manageMemberService.findHistoryList(paramMap));
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /admin/moneybank/management/tabInfo ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/moneybank/management/history/{id}", method = RequestMethod.POST)
	public ModelAndView history(@RequestBody HashMap<String, Object> paramMap, @PathVariable("id") String id) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/management/history ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
				mav.addObject("currentPage",  Integer.parseInt(paramMap.get("currentPage").toString()));
				mav.addObject("dataCnt",  Integer.parseInt(paramMap.get("dataCnt").toString()));
				
				ArrayList<HashMap<String, Object>> history = manageMemberService.findHistoryList(paramMap);
				mav.addObject("history", history);
				mav.addObject("id", id);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /admin/moneybank/management/history ] " + ex.getMessage());
			
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
}
