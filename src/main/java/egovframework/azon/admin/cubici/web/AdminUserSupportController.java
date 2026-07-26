package egovframework.azon.admin.cubici.web;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.AdminUserSupportService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.exception.FileException;
import egovframework.azon.front.cubici.service.CubiciCmmService;

@Controller
public class AdminUserSupportController {

	Logger logger = LoggerFactory.getLogger(AdminUserSupportController.class);
	
	@Autowired
	AdminUserSupportService adminUserSupportService;
	
	@Autowired
	CubiciCmmService cubiciCmmService;
	
	@RequestMapping(value="/admin/cubici/supportMember/manageInquiry", method=RequestMethod.GET)
	public ModelAndView manageInquiryAdmin() {
		logger.debug("[ 큐빅아이 관리자 고객관리 고객문의 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageInquiry");
		
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageBoard_tab1", method=RequestMethod.GET)
	public ModelAndView manageBoardNotice() {
		logger.debug("[ 큐빅아이 관리자 고객관리 고객문의 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageBoard_tab1");
		
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageBoard_tab1/write", method=RequestMethod.GET)
	public ModelAndView boardNoticeWrite(@RequestParam HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageBoard_tab1_Write");
		
		int resultCode = 0;
		
		try {
			if(!paramMap.isEmpty()) {
				HashMap<String, Object> resultList = adminUserSupportService.selectBoardDetail(paramMap);
				mav.addObject("resultList", resultList);
			}
			mav.addObject("DIVISION","03");
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/notice/write] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageBoard_tab2", method=RequestMethod.GET)
	public ModelAndView manageBoardFaq() {
		logger.debug("[ 큐빅아이 관리자 고객관리 고객문의 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageBoard_tab2");
		
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageBoard_tab2/detail", method=RequestMethod.GET)
	public ModelAndView manageBoardFaqDetail(@RequestParam HashMap<String, Object> params) {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageBoard_tab2_Detail");
				
		int resultCode = 0;
		
		try {
			 HashMap<String, Object> resultList = adminUserSupportService.selectBoardDetail(params);
			 mav.addObject("resultList", resultList);
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/supportMember/manageBoard_tab2_Detail ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageBoard_tab2/write", method=RequestMethod.GET)
	public ModelAndView boardfaqWrite() {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageBoard_tab2_Write");
		
		mav.addObject("DIVISION","02");

		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageSms", method=RequestMethod.GET)
	public ModelAndView manageSmsPage() {
		logger.debug("[ 큐빅아이 관리자 고객관리 고객문의 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageSms");
		
		return mav;
	}

	@RequestMapping(value="/admin/cubici/supportMember/manageEmail", method=RequestMethod.GET)
	public ModelAndView manageEmailPage() {
		logger.debug("[ 큐빅아이 관리자 고객관리 고객문의 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageEmail");
		
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageSms/write", method=RequestMethod.GET)
	public ModelAndView manageSMSWrite(@RequestParam HashMap<String, Object> params) {
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageSms_Write");
		
		int resultCode = 0;
		
		try {
			 if(!params.isEmpty()) { 
				 HashMap<String, Object> resultList = adminUserSupportService.SMSBoardDetail(params);
				 mav.addObject("resultList", resultList);
			 }
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/supportMember/manageSms_Write] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/supportMember/manageEmail/modal", method =RequestMethod.POST)
	public ModelAndView manageSMSMailModal(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] /admin/board/manageInquiry/detail" + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultList = adminUserSupportService.SMSBoardDetail(paramMap);
				mav.addObject("resultList", resultList);
			}	
		}catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] /admin/board/manageInquiry/detail" + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
		
	}
	
	@RequestMapping(value="/admin/board/manageInquiry/detail", method=RequestMethod.GET)
	public ModelAndView manageInquiryDetail(@RequestParam HashMap<String, Object> params) {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageInquiry_detail");

		int resultCode = 0;
		try {
			if (params == null || params.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] /admin/board/manageInquiry/detail" + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = adminUserSupportService.selectBoardDetailList(params);
				mav.addObject("resultList", resultList);
			}
				
		}catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] /admin/board/manageInquiry/detail" + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
		
	}
	
	@RequestMapping(value="/admin/board/manageInquiry/write", method=RequestMethod.GET)
	public ModelAndView manageInquiryWrite(@RequestParam HashMap<String, Object> params) {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/supportMember/manageInquiry_write");

		int resultCode = 0;
		try {
			if (params == null || params.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] /admin/board/manageInquiry/detail" + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = adminUserSupportService.selectBoardDetailList(params);
				mav.addObject("resultList", resultList);
			}
				
		}catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] /admin/board/manageInquiry/detail" + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
		
	}
	
	@RequestMapping(value="/admin/board/manageInquiry/CommentWrite", method=RequestMethod.POST)
	public ModelAndView manageInquiryCommentWrite(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/board/manageInquiry/CommentWrite ] " + CmmMessage.parameter_relay_error);
			} else {
				adminUserSupportService.boardCommentInsert(paramMap);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/manageInquiry/CommentWrite ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/board/manageInquiry/CommentUpdate", method=RequestMethod.POST)
	public ModelAndView manageInquiryCommentUpdate(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/board/manageInquiry/CommentUpdate ] " + CmmMessage.parameter_relay_error);
			} else {
				adminUserSupportService.boardCommentUpdate(paramMap);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/manageInquiry/CommentUpdate ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/sms/list", method = RequestMethod.POST)
	public ModelAndView manageSMSBoardList(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {			
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] /admin/sms/list " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = adminUserSupportService.SMSBoardList(paramMap);
				mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
				mav.addObject("currentPage",  Integer.parseInt(paramMap.get("currentPage").toString()));
				mav.addObject("resultList", resultList);
			}			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/sms/list ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
		
	@RequestMapping(value="/admin/sms/insert", method=RequestMethod.POST)
	public ModelAndView manageSMSInsert(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		

		mav.addObject("FormCheck", paramMap.get("SMS_KEY").toString());
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/sms/Insert ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> CodeCheck = adminUserSupportService.SMSCodeCheck(paramMap);
				if(Integer.parseInt(CodeCheck.get("CODE_CHECK").toString()) == 0) {
					adminUserSupportService.SMSInsert(paramMap);
				}else {
					mav.addObject("CheckResultCode", 25);
				}
			}		
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/sms/Insert ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/sms/update", method=RequestMethod.POST)
	public ModelAndView manageSMSUpdate(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		mav.addObject("FormCheck", paramMap.get("SMS_KEY").toString());
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/sms/update ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> CodeCheck = adminUserSupportService.SMSCodeCheck(paramMap);
				if(Integer.parseInt(CodeCheck.get("SMS_CODE").toString()) == Integer.parseInt(paramMap.get("SMS_CODE").toString())) {
					adminUserSupportService.SMSUpdate(paramMap);
				}else if(Integer.parseInt(CodeCheck.get("CODE_CHECK").toString()) == 0) {
					adminUserSupportService.SMSUpdate(paramMap);
				}else {
					mav.addObject("CheckResultCode", 25);
				}
			}		
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/sms/update ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/sms/delete", method=RequestMethod.POST)
	public ModelAndView manageSMSDelete(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");

		mav.addObject("FormCheck", paramMap.get("SMS_KEY").toString());
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/sms/delete ] " + CmmMessage.parameter_relay_error);
			} else {
				adminUserSupportService.SMSDelete(paramMap);
			}		
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/sms/delete ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/board/list/get", method = RequestMethod.POST)
	public ModelAndView adminBoardList(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {			
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] admin/board/list " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = adminUserSupportService.selectBoardList(paramMap);
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
	
	@RequestMapping(value="/admin/board/list/Insert", method=RequestMethod.POST)
	public ModelAndView boardInsert(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/board/Insert ] " + CmmMessage.parameter_relay_error);
			} else {
				// 게시글 저장
				adminUserSupportService.boardInsert(paramMap);
				// 현재 게시판 알림
				int thisDiv = Integer.parseInt(paramMap.get("DIVISION").toString());
				mav.addObject("DIVISION", thisDiv);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/Insert ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/board/list/file/Insert", method=RequestMethod.POST)
	public ModelAndView boardFileInsert(
			@RequestPart(value = "data") HashMap<String, Object> paramMap,
			@RequestPart(value = "file", required = false) List<MultipartFile> fileList) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/board/file/Insert ] " + CmmMessage.parameter_relay_error);
			} else {
				adminUserSupportService.boardInsert(paramMap, fileList);
				int thisDiv = Integer.parseInt(paramMap.get("DIVISION").toString());
				mav.addObject("DIVISION", thisDiv);
			}
		} catch (FileException e) {
			logger.debug(e.getFileErrorCode().FileErrorCodeLog(" [ ERROR ] [ /admin/board/file/Insert ] "));
			mav.addObject("description", e.getFileErrorCode().getDescription());
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/file/Insert ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/board/list/Update", method=RequestMethod.POST)
	public ModelAndView boardUpdate(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/board/Update ] " + CmmMessage.parameter_relay_error);
			} else {
				adminUserSupportService.boardUpdate(paramMap);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/Update ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/board/list/file/Update", method=RequestMethod.POST)
	public ModelAndView boardFileUpdate(
			@RequestPart(value = "data") HashMap<String, Object> paramMap,
			@RequestPart(value = "file", required = false) List<MultipartFile> fileList) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/board/file/Update ] " + CmmMessage.parameter_relay_error);
			} else {
				adminUserSupportService.boardUpdate(paramMap, fileList);
			}
		} catch (FileException e) {
			logger.debug(e.getFileErrorCode().FileErrorCodeLog(" [ ERROR ] [ /admin/board/file/Update ] "));
			mav.addObject("description", e.getFileErrorCode().getDescription());
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/file/Update ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	
	@RequestMapping(value="/admin/board/list/Delete", method=RequestMethod.POST)
	public ModelAndView boardDelete(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");
		
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/board/Delete ] " + CmmMessage.parameter_relay_error);
			}else {
				adminUserSupportService.boardDelete(paramMap);	
			}
	
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/board/Delete ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
		
}
