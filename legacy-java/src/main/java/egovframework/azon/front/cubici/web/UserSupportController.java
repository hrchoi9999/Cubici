package egovframework.azon.front.cubici.web;

import java.util.ArrayList;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.cubici.service.UserSupportService;

@Controller
public class UserSupportController {
	
	Logger logger = LoggerFactory.getLogger(UserSupportController.class);
	
	@Autowired
	UserSupportService supportService;
	
	@Autowired
	CubiciCmmService cubiciCmmService;
	
	@RequestMapping(value="/board/qa/index", method=RequestMethod.GET)
	public ModelAndView boardqaMain() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "userSupport/boardIndex");

		return mav;
	}

	@RequestMapping(value="/m/board/qa/index", method=RequestMethod.GET)
	public ModelAndView mobileBoardqaMain() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "userSupport/m_boardIndex");

		return mav;
	}

	@RequestMapping(value="/board/qa/write", method=RequestMethod.GET)
	public ModelAndView boardqaWrite() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "userSupport/boardWrite");
		mav.addObject("DIVISION","01");
		
		return mav;
	}
	
	@RequestMapping(value="/m/board/qa/write", method=RequestMethod.GET)
	public ModelAndView mobileBoardqaWrite() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "userSupport/m_boardWrite");
		mav.addObject("DIVISION","01");
		
		return mav;
	}
	
	@PostAuthorize("returnObject.getModel().get(\"selfFlag\").toString() == \"self\" or returnObject.getModel().get(\"selfFlag\").toString() == \"N\"")
	@RequestMapping(value ="/board/qa/detail", method = RequestMethod.GET)
	public ModelAndView boardqadetail(@RequestParam HashMap<String, Object> params) {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "userSupport/boardDetail");
		
		int resultCode = 0;
		
		try {
			if (params == null || params.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] board/qa/detail " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = supportService.selectBoardDetailList(params);
				
				String selfFlag = resultList.get(0).get("selfFlag").toString();
				mav.addObject("selfFlag", selfFlag);
				resultList.get(0).remove("selfFlag");

				mav.addObject("resultList", resultList);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /board/qa/detail ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PostAuthorize("returnObject.getModel().get(\"selfFlag\").toString() == \"self\" or returnObject.getModel().get(\"selfFlag\").toString() == \"N\"")
	@RequestMapping(value ="/m/board/qa/detail", method = RequestMethod.GET)
	public ModelAndView mobileBoardqadetail(@RequestParam HashMap<String, Object> params) {
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "userSupport/m_boardDetail");
		
		int resultCode = 0;
		
		try {
			if (params == null || params.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] board/qa/detail " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = supportService.selectBoardDetailList(params);
				
				String selfFlag = resultList.get(0).get("selfFlag").toString();
				mav.addObject("selfFlag", selfFlag);
				resultList.get(0).remove("selfFlag");

				mav.addObject("resultList", resultList);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /m/board/qa/detail ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value = "/board/faq/index", method = RequestMethod.GET)
	public ModelAndView boardfaqMain() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "userSupport/faqIndex");

		return mav;
	}
	
	@RequestMapping(value = "/m/board/faq/index", method = RequestMethod.GET)
	public ModelAndView mobileBoardfaqMain() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "userSupport/m_faqIndex");

		return mav;
	}
	
	@RequestMapping(value = "/faq/detail/get", method = RequestMethod.POST)
	public ModelAndView boardDetail(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /faq/detail/get ] " + CmmMessage.parameter_relay_error);
			}else {
				HashMap<String, Object> resultList = supportService.selectBoardDetail(paramMap);
				mav.addObject("resultList", resultList);
			}			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /faq/detail/get ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	@RequestMapping(value="/board/notice/index", method = RequestMethod.GET)
	public ModelAndView noticeMain() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "userSupport/noticeIndex");

		return mav;
	}
	
	@RequestMapping(value="/m/board/notice/index", method = RequestMethod.GET)
	public ModelAndView mobileNoticeMain() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "userSupport/m_noticeIndex");

		return mav;
	}
	
	@RequestMapping(value="/board/notice/detail", method=RequestMethod.GET)
	public ModelAndView boardNoticeDetail(@RequestParam HashMap<String, Object> params) {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "userSupport/noticeDetail");
				
		int resultCode = 0;
		
		try {
			HashMap<String, Object> resultList = supportService.selectBoardDetail(params);
			mav.addObject("resultList", resultList);
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /board/faq/detail] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	@RequestMapping(value="/m/board/notice/detail", method=RequestMethod.GET)
	public ModelAndView mobileBoardNoticeDetail(@RequestParam HashMap<String, Object> params) {
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "userSupport/m_noticeDetail");
				
		int resultCode = 0;
		
		try {
			HashMap<String, Object> resultList = supportService.selectBoardDetail(params);
			mav.addObject("resultList", resultList);
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /m/board/faq/detail] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}

	@RequestMapping(value="/chargeInfo", method=RequestMethod.GET)
	public ModelAndView chargeInfo() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "userSupport/chargeInfo");
		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			mav.addObject("User", principal);
		} catch (Exception e) {
			logger.debug(" [ ERROR ] [ /chargeInfo ] " + e.getMessage());
		}
				
		return mav;
	}
	
	@RequestMapping(value="m/chargeInfo", method=RequestMethod.GET)
	public ModelAndView mobileChargeInfo() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "userSupport/m_chargeInfo");
				
		int resultCode = 0;
		
		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			mav.addObject("User", principal);
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /m/chargeInfo ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	/* ********** 공통 Controller ********** */
	// Ajax 게시판 List 가져오기
	@RequestMapping(value="/board/list/get", method = RequestMethod.POST)
	public ModelAndView boardList(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {			
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] board/list " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = supportService.selectBoardList(paramMap);
				mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
				mav.addObject("currentPage",  Integer.parseInt(paramMap.get("currentPage").toString()));
				mav.addObject("resultList", resultList);
			}			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /board/list ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/board/list/Insert", method=RequestMethod.POST)
	public ModelAndView boardInsert(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /board/Insert ] " + CmmMessage.parameter_relay_error);
			} else {
				supportService.boardInsert(paramMap);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /board/Insert ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/board/list/Update", method=RequestMethod.POST)
	public ModelAndView boardUpdate(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /board/Update ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = supportService.selectBoardDetailList(paramMap);
				
				if(Integer.parseInt(resultList.get(0).get("COMMENT_CNT").toString()) == 2) {
					int cntResultCode = 25;
					mav.addObject("cntResultCode", cntResultCode);
				}else {
					supportService.boardUpdate(paramMap);
				}
			}
			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /board/Update ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/board/list/Delete", method=RequestMethod.POST)
	public ModelAndView boardDelete(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /board/Delete ] " + CmmMessage.parameter_relay_error);
			}
			else {
				ArrayList<HashMap<String, Object>> resultList = supportService.selectBoardDetailList(paramMap);

				if(Integer.parseInt(resultList.get(0).get("COMMENT_CNT").toString()) == 2) {
					int cntResultCode = 25;
					mav.addObject("cntResultCode", cntResultCode);
				}else {
					supportService.boardDelete(paramMap);
				}
			}
			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /board/Delete ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
}