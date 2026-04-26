package egovframework.azon.admin.cubici.web;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.AdminMoneyBankOpsService;
import egovframework.azon.admin.prizm.PrizmService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.moneybank.service.MoneybankCmmService;
import egovframework.azon.front.cubici.service.CubiciCmmService;

@Controller
public class AdminMoneyBankOpsController {

	Logger logger = LoggerFactory.getLogger(AdminMoneyBankOpsController.class);

	@Autowired
	AdminMoneyBankOpsService adminMoneyBankService;

	
	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	MoneybankCmmService moneybankCmmService;

	@Autowired
	PrizmService prizmService;

	/*
	 * 머니뱅크 관리자 > 머니뱅크 운영현황 수정 2021. 08. 20 by MKC
	 */
	// 운영현황 > 신청현황 페이지
	@RequestMapping(value = "/admin/moneybank/cubici/ops/request", method = RequestMethod.GET)
	public ModelAndView totalRequestStatus() {

		logger.debug("[ /admin/moneybank/cubici/ops/requestState ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);

		mav.addObject("pageName", "/admin/moneybank/operation/requestState");

		int resultCode = 0;

		try {
			// Default 날짜 & 기준일자
			HashMap<String, Object> defaultTime = moneybankCmmService.getTimeInfo();
			mav.addObject("fromDate", defaultTime.get("fromDate"));
			mav.addObject("toDate", defaultTime.get("toDate"));
			mav.addObject("standardDate", defaultTime.get("toDate").toString());
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/requestState ] " + e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}

	// 운영현황 > 신청현황 데이터
	@RequestMapping(value = "/admin/moneybank/cubici/ops/request/get", method = RequestMethod.POST)
	public ModelAndView selectMoneybankRequest(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /admin/moneybank/cubici/ops/requestState/get ]");
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/request/get ] "+CmmMessage.parameter_relay_error);
			}else {
				
				// 신청 상태
				paramMap.put("progressStatus", "00, 01");
				
				// toDate를 오늘 날짜로
				Date todayDate = new Date();
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				paramMap.put("toDate", sdf.format(todayDate).toString());
				
				// 신청자 목록
				ArrayList<HashMap<String, Object>> requestList = adminMoneyBankService.selectRequestList(paramMap);
				mav.addObject("requestList", requestList);
				
				// 합계 리스트
				HashMap<String, Object> sumMap = adminMoneyBankService.selectRequestSum(paramMap);
				mav.addObject("sumData", sumMap);
				
			}
			
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/request/get ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
	
		return mav;
	}

	// 확인전화 리스트 업데이트
	@RequestMapping(value = "/admin/moneybank/cubici/ops/modalConfirmTel", method = RequestMethod.POST)
	public ModelAndView modalConfirmTel(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug("[ /admin/moneybank/cubici/ops/modalConfirmTel ]");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/modalConfirmTel ] "+CmmMessage.parameter_relay_error);
			}else {
				
				// 확인전화 리스트
				// adminMoneyBankService.insertConfirmTel(paramMap);
				
				// 데이터 입력
//				HashMap<String, Object> selectInsertTelData = adminMoneyBankService.selectInsertTelData(paramMap);
//				mav.addObject("selectInsertTelData", selectInsertTelData);
			
			}
			
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/modalConfirmTel ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	
	
	// ***** 여기부터 상환 관리 (MKC 2021.05.12) ***** //

	// 운영현황 > 상환현황 페이지
	@RequestMapping("/admin/moneybank/cubici/ops/repay")
	public ModelAndView totalRepay() {

		logger.debug("[ /admin/moneybank/cubici/ops/repay ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);

		mav.addObject("pageName", "/admin/moneybank/operation/repayState");

		int resultCode = 0;

		try {
			// Default 날짜 & 기준일자
			HashMap<String, Object> defaultTime = moneybankCmmService.getTimeInfo();
			mav.addObject("fromDate", defaultTime.get("fromDate"));
			mav.addObject("toDate", defaultTime.get("toDate"));
			mav.addObject("standardDate", defaultTime.get("toDate").toString());
			mav.addObject("todayDateStr", defaultTime.get("todayDate").toString());
			// 서비스 종류
			ArrayList<HashMap<String, Object>> productList = new ArrayList<HashMap<String, Object>>();
			mav.addObject("productList", productList);
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/repay ]"+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 운영현황 > 상환현황 페이지 내용 가져오기
	@RequestMapping("/admin/moneybank/cubici/ops/repay/get")
	public ModelAndView selectRepayments(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /admin/moneybank/cubici/ops/repayState/get ]");
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/repayState/get ] " + CmmMessage.parameter_relay_error);
			} else {
				// 상환리스트
				ArrayList<HashMap<String, Object>> repayList = adminMoneyBankService.selectMoneybankRepay(paramMap);
				mav.addObject("repayList", repayList);
				
				// 합계 리스트
				paramMap.put("flag", "sum");
				HashMap<String, Object> sumMap = adminMoneyBankService.selectMoneybankRepay(paramMap).get(0);
				mav.addObject("sumData", sumMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/repayState/get ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}

	// 상환상세 모달
	@RequestMapping("/admin/moneybank/cubici/ops/repayDetail")
	public ModelAndView getRepayDetail(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug("[ /admin/moneybank/cubici/operation/repayDetail ]");
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/repayDetail ] " + CmmMessage.parameter_relay_error);
			}else {	
				// 상환정보 가져오기
//				HashMap<String, Object> infoMap = moneybankCmmService.getMoneybankUserInfo(paramMap);
//				mav.addObject("infoMap", infoMap);
			}
		}catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/repayDetail ] "+e.getMessage());
		}finally{
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 상환상세 현황
	@RequestMapping("/admin/moneybank/cubici/ops/getRepayHistory")
	public ModelAndView getRepayHistory(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /admin/moneybank/cubici/ops/getRepayHistory ]");
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/getRepayHistory ] " + CmmMessage.parameter_relay_error);
			} else {
				// 상환이력 가져오기
//				ArrayList<HashMap<String, Object>> repayHistoryList = adminMoneyBankService.selectMoneybankRepayDetail(paramMap);
//				mav.addObject("historyList", repayHistoryList);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/getRepayHistory ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 상환상세 평가
	@RequestMapping("/admin/moneybank/cubici/ops/getRepayEval")
	public ModelAndView getRepayReview(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug("[ /admin/moneybank/cubici/ops/getRepayEval ]");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/getRepayEval ] " + CmmMessage.parameter_relay_error);
			} else {
				// 평가 목록 가져오기
//				ArrayList<HashMap<String, Object>> evalList = moneybankCmmService.selectMoneybankRepayEval(paramMap);
//				mav.addObject("evalList", evalList);
			}
		}catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/getRepayEval ] "+e.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 상환건 평가 insert
	@RequestMapping("/admin/moneybank/cubici/ops/repayEvalInsert")
	public ModelAndView insertRepayEval(@RequestBody HashMap<String, Object> paramMap) {
		
		logger.debug("[ /admin/moneybank/cubici/ops/repayEvalInsert ]");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/repayEvalInsert ] " + CmmMessage.parameter_relay_error);
			}else {
				adminMoneyBankService.insertRepayEval(paramMap);
			}
		} catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/repayEvalInsert ] "+e.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 상환 모달내 쇼핑몰별 상환 케이스
	
	// ***** 상환 관리 END ***** //

	// 회원정보 MODAL
	@RequestMapping("/admin/moneybank/cubici/ops/getUserModal")
	public ModelAndView getModalInfo(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /admin/moneybank/cubici/ops/getModal ]");
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/getModal ] " + CmmMessage.parameter_relay_error);
			}else {
				// 회원정보 가져오기
				/*
				HashMap<String, Object> infoList = moneybankCmmService.getMoneybankUserInfo(paramMap);
				mav.addObject("infoList", infoList);
				// 프리즘 데이터
				if (paramMap.get("MODAL_FLAG").toString().equals("prizm")) {
					HashMap<String, Object> prizmRequest = moneybankCmmService.getPrizmRequest(paramMap);
					mav.addObject("prizmRequest", prizmRequest);
				} else {
					// 등록 B2B 도매몰 리스트
//					ArrayList<HashMap<String, Object>> B2BRequestList = adminMoneyBankService.selectB2BRequestList(paramMap);
//					mav.addObject("B2BRequestList", B2BRequestList);
				}
				// 확인전화 리스트
//				ArrayList<HashMap<String, Object>> selectTelConfirmList = adminMoneyBankService.selectTelConfirmList(paramMap);
//				mav.addObject("selectTelConfirmList", selectTelConfirmList);
				*/
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/moneybank/cubici/ops/getModal ] "+e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
}
