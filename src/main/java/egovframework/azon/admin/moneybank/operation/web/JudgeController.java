package egovframework.azon.admin.moneybank.operation.web;

import java.util.ArrayList;
import java.util.HashMap;

import egovframework.azon.admin.prizm.PrizmService;
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

import egovframework.azon.admin.moneybank.operation.service.JudgeService;
import egovframework.azon.cmmn.CmmMessage;

@Controller
public class JudgeController {

	Logger logger = LoggerFactory.getLogger(JudgeController.class);

	@Autowired
	JudgeService judgeService;

	@Autowired
	PrizmService prizmService;

	@RequestMapping(value="/admin/moneybank/approval_tab1", method=RequestMethod.GET)
	public ModelAndView approval_tab1() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/operation/approval_tab1");
		
		HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
		mav.addObject("standardDate", String.valueOf(defaultDate.get("todayDate")));
		mav.addObject("fromDate", String.valueOf(defaultDate.get("fromDate")));
		mav.addObject("toDate", String.valueOf(defaultDate.get("todayDate")));

		return mav;
	}

	@RequestMapping(value="/admin/moneybank/approvallist", method=RequestMethod.POST)
	public ModelAndView loadApprovalList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			ArrayList<HashMap<String, Object>> approvalList = judgeService.loadApprovalList(paramMap);
			mav.addObject("approvalCount", judgeService.approvalCount(paramMap));
			mav.addObject("dataPerPage", Integer.parseInt(String.valueOf(paramMap.get("dataPerPage"))));
			mav.addObject("currentPage",  Integer.parseInt(String.valueOf(paramMap.get("currentPage"))));
			mav.addObject("dataCnt",  Integer.parseInt(String.valueOf(paramMap.get("dataCnt"))));
			mav.addObject("approvalList", approvalList);

		} catch(Exception ex){
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/approvallist ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value="/admin/moneybank/approvaldetail", method=RequestMethod.GET)
	public ModelAndView loadApprovalDetail(@RequestParam String mbid) {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/operation/approvalDetail");
		mav.addObject("loadApprovalDetail", judgeService.loadApprovalDetail(mbid));
		return mav;
	}

	@RequestMapping(value="/admin/moneybank/historyofusage", method=RequestMethod.POST)
	public ModelAndView getMbHistoryOfUsage(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		mav.addObject("pageName", "/admin/moneybank/operation/approvalDetail");

		int resultCode = 0;

		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode =88;
				logger.debug("[ ERROR ] [ /admin/moneybank/historyofusage ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("mbHistoryOfUsage", judgeService.getHistoryOfUsage(paramMap));
			}
		}catch (Exception ex) {
			resultCode = 99;
			logger.error(" [ ERROR ] [ /admin/moneybank/historyofusage ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value="/admin/moneybank/conditionAccept", method=RequestMethod.POST)
	public ModelAndView conditionAcceptReject(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/conditionAccept ] " + CmmMessage.parameter_relay_error);
			} else {
				String mbStatus = "04";
				paramMap.put("mb_status", mbStatus);

				judgeService.inputAdjustment(paramMap);
				judgeService.modifyMbStatus(paramMap);
			}
		}catch(Exception ex){
			resultCode = 99;
			logger.error(" [ ERROR ] [ /admin/moneybank/conditionAcceptReject ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value="/admin/moneybank/conditionReject", method=RequestMethod.POST)
	public ModelAndView conditionReject(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/conditionReject ] " + CmmMessage.parameter_relay_error);
			} else {
				String mbStatus = "41";
				paramMap.put("mb_status", mbStatus);

				judgeService.modifyMbStatus(paramMap);
			}
		}catch(Exception ex){
			resultCode = 99;
			logger.error(" [ ERROR ] [ /admin/moneybank/conditionReject ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value="/admin/moneybank/approval_tab2", method=RequestMethod.GET)
	public ModelAndView approval_tab2() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/moneybank/operation/approval_tab2");

		HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
		mav.addObject("standardDate", String.valueOf(defaultDate.get("todayDate")));
		mav.addObject("fromDate", String.valueOf(defaultDate.get("fromDate")));
		mav.addObject("toDate", String.valueOf(defaultDate.get("todayDate")));

		return mav;
	}

	@RequestMapping(value="/admin/moneybank/contractlist", method=RequestMethod.POST)
	public ModelAndView contractlist(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			ArrayList<HashMap<String, Object>> contractList = judgeService.loadContractList(paramMap);
			mav.addObject("contractCount", judgeService.contractCount(paramMap));
			mav.addObject("dataPerPage", Integer.parseInt(String.valueOf(paramMap.get("dataPerPage"))));
			mav.addObject("currentPage",  Integer.parseInt(String.valueOf(paramMap.get("currentPage"))));
			mav.addObject("dataCnt",  Integer.parseInt(String.valueOf(paramMap.get("dataCnt"))));
			mav.addObject("contractList", contractList);

		} catch(Exception ex){
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/contractlist ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 프리즘 상세내역 > 페이지로
	@RequestMapping(value="/admin/moneybank/pcsDetail", method=RequestMethod.GET)
	public ModelAndView loadPcsDetail(@RequestParam String mbid) {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);

		mav.addObject("pageName","/admin/moneybank/operation/pcsDetail");

		int resultCode = 0;

		try {
			if(mbid == null || mbid.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/pcsDetail ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
				mav.addObject("standardDate", String.valueOf(defaultDate.get("toDate")));
				mav.addObject("userInfo", judgeService.loadApprovalDetail(mbid));
				/**
				 * PRIZM MODAL 데이터 조회
				 */
				mav.addObject("result", prizmService.getPcs(mbid));
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/pcsDetail ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	@RequestMapping(value="/admin/moneybank/makeContract", method=RequestMethod.POST)
	public ModelAndView makeContract(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			judgeService.makeContract(String.valueOf(paramMap.get("mbid")));
		} catch (IllegalStateException e){
			mav.addObject("description", e.getMessage());
		} catch (Exception e) {
			resultCode = 88;
			logger.debug("[ /admin/moneybank/makeContract ]"+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
}
