package egovframework.azon.admin.cubici.web;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.admin.cubici.service.PreferencesService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.front.cubici.service.CubiciCmmService;

/* 환경설정 controller
 * 2021. 03. 18
 * by KJC */
@Controller
public class PreferencesController {
	
	Logger logger = LoggerFactory.getLogger(PreferencesController.class);
	
	@Autowired
	CubiciCmmService cubiciCmmService;
	
	@Autowired
	PreferencesService preferencesService;
	
	// ***** AFTER RENEWAL START *****//
	// 관리자 신청 
	@RequestMapping(value="/admin/cubici/adminPreference/requestAdmin", method=RequestMethod.POST)
	public ModelAndView requestAdmin(@RequestBody HashMap<String, Object> paramMap) {
	
		logger.debug("[ 큐빅아이 관리자 신청 ]");
		
		ModelAndView mav = new ModelAndView("jsonView");
    	int resultCode = 0;
		
    	try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/requestAdmin ] " + CmmMessage.parameter_relay_error);
			} else {
				preferencesService.requestAdmin(paramMap);
			}
    	}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/requestAdmin ] " + ex.getMessage());
    	}finally {
    		mav.addObject("resultCode", resultCode);
    	}
    	
    	return mav;
	}
	
	// 관리자 설정 화면
	@RequestMapping(value="/admin/cubici/adminPreference/adminRegister_tab1", method=RequestMethod.GET)
	public ModelAndView adminPreference(@RequestParam HashMap<String, Object> params) {
	
		logger.debug("[ 큐빅아이 환경설정 관리자 등록 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/adminRegister_tab1");
    	
    	return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/adminRegister_tab1/getAdminList", method=RequestMethod.POST)
	public ModelAndView getAdminList(@RequestBody HashMap<String, Object> paramMap) {
	
		logger.debug("[ 큐빅아이 환경설정 관리자 목록 ]");
		ModelAndView mav = new ModelAndView("jsonView");
    	int resultCode = 0;
		
    	try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/cubici_tab1/regiPartnerData ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultList = preferencesService.selectAdminAccountList(paramMap);
				mav.addObject("params", paramMap);
				mav.addAllObjects(resultList);
			}
    	}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/admin/adminPreference/adminRegister_tab1/getAdminList ] " + ex.getMessage());
    	}finally {
    		mav.addObject("resultCode", resultCode);
    	}
    	
    	return mav;
	}
	
	//관리자 아이디 중복확인
	@RequestMapping(value="/admin/cubici/adminPreference/adminRegister_tab1/adminIdCheck", method=RequestMethod.POST)
	public ModelAndView adminIdCheck(@RequestBody HashMap<String, Object> paramMap) {
	
		logger.debug("[ 큐빅아이 환경설정 관리자 수정 ]");
		ModelAndView mav = new ModelAndView("jsonView");
    	int resultCode = 0;
		
    	try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/adminRegister_tab1/adminIdCheck ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> resultMap = preferencesService.adminIdCheck(paramMap);
				mav.addObject(resultMap);
			}
    	}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/admin/adminPreference/adminRegister_tab1/adminIdCheck ] " + ex.getMessage());
    	}finally {
    		mav.addObject("resultCode", resultCode);
    	}
    	return mav;
	}
	
	//관리자 승인
	@RequestMapping(value="/admin/cubici/adminPreference/adminRegister_tab1/approvalAdmin", method=RequestMethod.POST)
	public ModelAndView approvalAdmin(@RequestBody HashMap<String, Object> paramMap) {
	
		logger.debug("[ 큐빅아이 환경설정 관리자 수정 ]");
		ModelAndView mav = new ModelAndView("jsonView");
    	int resultCode = 0;
		
    	try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/adminRegister_tab1/updateAdmin ] " + CmmMessage.parameter_relay_error);
			} else {
				preferencesService.approvalAdmin(paramMap);
			}
    	}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/admin/adminPreference/adminRegister_tab1/updateAdmin ] " + ex.getMessage());
    	}finally {
    		mav.addObject("resultCode", resultCode);
    	}
    	
    	return mav;
	}
	
	//관리자 정보 수정
	@RequestMapping(value="/admin/cubici/adminPreference/adminRegister_tab1/updateAdmin", method=RequestMethod.POST)
	public ModelAndView updateAdmin(@RequestBody HashMap<String, Object> paramMap) {
	
		logger.debug("[ 큐빅아이 환경설정 관리자 수정 ]");
		ModelAndView mav = new ModelAndView("jsonView");
    	int resultCode = 0;
		
    	try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/infoIntegrated/adminRegister_tab1/updateAdmin ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = preferencesService.updateAdmin(paramMap);
				mav.addObject("resultList",resultList);
			}
    	}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/admin/adminPreference/adminRegister_tab1/updateAdmin ] " + ex.getMessage());
    	}finally {
    		mav.addObject("resultCode", resultCode);
    	}
    	
    	return mav;
	}
	
	//관리자 정보 수정
	@RequestMapping(value="/admin/cubici/adminPreference/adminRegister_tab1/deleteAdmin", method=RequestMethod.POST)
	public ModelAndView deleteAdmin(@RequestBody HashMap<String, Object> paramMap) {
	
		logger.debug("[ 큐빅아이 환경설정 관리자 수정 ]");
		ModelAndView mav = new ModelAndView("jsonView");
    	int resultCode = 0;
		
    	try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/adminRegister_tab1/deleteAdmin ] " + CmmMessage.parameter_relay_error);
			} else {
				preferencesService.deleteAdmin(paramMap);
			}
    	}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/adminRegister_tab1/deleteAdmin ] " + ex.getMessage());
    	}finally {
    		mav.addObject("resultCode", resultCode);
    	}
    	
    	return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/adminRegister_tab2", method=RequestMethod.GET)
	public ModelAndView adminAuthPreference(@RequestParam HashMap<String, Object> params) {
	
		logger.debug("[ 큐빅아이 환경설정 관리자 접근권한 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/adminRegister_tab2");
    	
    	return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/manageMoneybank_tab1", method=RequestMethod.GET)
	public ModelAndView moneybankPreference(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 환경설정 머니뱅크 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/manageMoneybank_tab1");
    	
    	return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/manageMoneybank_tab2", method=RequestMethod.GET)
	public ModelAndView moneybankPlanPreference(@RequestParam HashMap<String, Object> params) {
	
		logger.debug("[ 큐빅아이 환경설정 머니뱅크 상품등록 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/manageMoneybank_tab2");
    	int resultCode = 0;
		
    	try {

    		HashMap<String, Object> b2bList = cubiciCmmService.selectWholesalers();
    		mav.addObject("b2bCodeList", b2bList.get("CODE_LIST").toString());
    		mav.addObject("b2bFirmList", b2bList.get("FIRM_LIST").toString());
    		
    	}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/admin/adminPreference/manageMoneybank_tab2 ] " + ex.getMessage());
    	}finally {
    		mav.addObject("resultCode", resultCode);
    	}
    	
    	return mav;
	}
	
	// 환경설정 - 머니뱅크 관리 - 테이블
		@RequestMapping(value = "/admin/cubici/adminPreference/manageMoneybank_tab1_Select", method = RequestMethod.POST)
		public ModelAndView moneybankSelect(@RequestBody HashMap<String, Object> paramMap) {
			logger.debug(" [ /admin/cubici/adminPreference/manageMoneybank_tab1_Select ] ");
			
			ModelAndView mav = new ModelAndView("jsonView");
			
			int resultCode = 0;
			
			try {
				if (paramMap == null || paramMap.isEmpty()) {
					resultCode = 88;
					logger.debug("[ ERROR ] [ /admin/cubici/adminPreference/manageMoneybank_tab1_Select ]" + CmmMessage.parameter_relay_error);
				} else {
					ArrayList<HashMap<String, Object>> moneybankListMap = preferencesService.selectMoneybankList(paramMap);
					mav.addObject("moneybankListMap", moneybankListMap);
				 
					// 건수 합계 
					paramMap.put("FLAG", "COUNT"); 
					ArrayList<HashMap<String, Object>> sumCount = preferencesService.selectMoneybankList(paramMap);
					mav.addObject("sumCount", sumCount);
					
				}
			} catch (Exception e) {
				resultCode = 99;
				logger.error(e.getMessage());
			} finally {
				mav.addObject("resultCode", resultCode);
			}
			
			return mav;
		}
		
		// 환경설정 - 머니뱅크 등록, 수정
		@RequestMapping(value = "/admin/cubici/adminPreference/managerMoneybank_tab2_regist", method = RequestMethod.POST)
		public ModelAndView moneybankRegist(@RequestBody HashMap<String, Object> paramMap) {
			logger.debug(" [ /admin/cubici/adminPreference/managerMoneybank_tab2_regist ] ");
			
			ModelAndView mav = new ModelAndView("jsonView");
			
			int resultCode = 0;
			
			try {
				if (paramMap == null || paramMap.isEmpty()) {
					resultCode = 88;
					logger.debug("[ ERROR ] [ /admin/cubici/adminPreference/managerMoneybank_tab2_regist ]" + CmmMessage.parameter_relay_error);
				
				} else {
					
					  if(paramMap.get("FLAG").toString().equals("INSERT")) { // insert 실행
					  preferencesService.insertMoneybankPartner(paramMap);
					  HashMap<String, Object> FIRM_NO = preferencesService.selectMoneybankFirmNo(paramMap);
					  paramMap.put("FIRM_NO", FIRM_NO.get("FIRM_NO").toString());
					  preferencesService.insertMoneybankProduct(paramMap); 
					  }
					  else if(paramMap.get("FLAG").toString().equals("UPDATE")) { // update 실행
					  preferencesService.updateMoneybankPartner(paramMap);
					  HashMap<String, Object> FIRM_NO = preferencesService.selectMoneybankFirmNo(paramMap);
					  paramMap.put("FIRM_NO", FIRM_NO.get("FIRM_NO").toString());
					  preferencesService.updateMoneybankProduct(paramMap);
					  }
				}
				
			} catch (Exception e) {
				resultCode = 99;
				logger.error(e.getMessage());
			} finally {
				mav.addObject("resultCode", resultCode);
			}
			
			return mav;
		}
	
		// 환경설정 - 머니뱅크 - TAB1 TO TAB2
		@RequestMapping(value = "/admin/cubici/adminPreference/manageMoneybank_tab1_gotoTab2", method = RequestMethod.POST)
		public ModelAndView gotoMoneyBankTab2(@RequestBody HashMap<String, Object> paramMap) {
			logger.debug(" [ /admin/cubici/adminPreference/manageMoneybank_tab1_gotoTab2 ] ");
			
			ModelAndView mav = new ModelAndView("jsonView");
			
			int resultCode = 0;
			
			try {
				if (paramMap == null || paramMap.isEmpty()) {
					resultCode = 88;
					logger.debug("[ ERROR ] [ /admin/cubici/adminPreference/manageMoneybank_tab1_gotoTab2 ]" + CmmMessage.parameter_relay_error);
				} else {
					
					// 테이블 데이터
					HashMap<String, Object> gototTab2Data = preferencesService.gotoMoneybankTab2(paramMap);
					mav.addObject("gototTab2Data", gototTab2Data);
				
				}
			} catch (Exception e) {
				resultCode = 99;
				logger.error(e.getMessage());
			} finally {
				mav.addObject("resultCode", resultCode);
			}
			
			return mav;
		}
		
	@RequestMapping(value="/admin/cubici/adminPreference/manageCode_tab1", method=RequestMethod.GET)
	public ModelAndView codePreference(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 환경설정 연계코드 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/manageCode_tab1");
    	
    	return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/manageCode_tab2", method=RequestMethod.GET)
	public ModelAndView codeRegistPreference(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 환경설정 연계코드 등록 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/manageCode_tab2");
    	
    	return mav;
	}
	
	// 환경설정 - 연계코드 등록, 수정
	@RequestMapping(value = "/admin/cubici/adminPreference/manageCode_tab2_regist", method = RequestMethod.POST)
	public ModelAndView linkedCodeRegist(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug(" [ /admin/cubici/adminPreference/manageCode_tab2_regist ] ");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug("[ ERROR ] [ /admin/cubici/adminPreference/manageCode_tab2_regist ]" + CmmMessage.parameter_relay_error);
			} else {
				
				if(paramMap.get("FLAG").toString().equals("INSERT")) {
					// insert 실행
					preferencesService.insertLinkedCode(paramMap);
				}else if(paramMap.get("FLAG").toString().equals("UPDATE")) {
					// update 실행
					preferencesService.updateLinkedCode(paramMap);
				}
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 환경설정 - 연계코드 - 테이블
	@RequestMapping(value = "/admin/cubici/adminPreference/manageCode_tab1_Select", method = RequestMethod.POST)
	public ModelAndView linkedCodeSelect(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug(" [ /admin/cubici/adminPreference/manageCode_tab1_Select ] ");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug("[ ERROR ] [ /admin/cubici/adminPreference/manageCode_tab1_Select ]" + CmmMessage.parameter_relay_error);
			} else {
				
				ArrayList<HashMap<String, Object>> linkedCodeMap = preferencesService.selectLinkedCode(paramMap);
				mav.addObject("linkedCodeMap", linkedCodeMap);
				
				// 건수 합계
				paramMap.put("FLAG", "COUNT");
				ArrayList<HashMap<String, Object>> sumCount = preferencesService.selectLinkedCode(paramMap);
				mav.addObject("sumCount", sumCount);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
	
	// 환경설정 - 연계코드 - TAB1 TO TAB2
	@RequestMapping(value = "/admin/cubici/adminPreference/manageCode_tab1_gotoTab2", method = RequestMethod.POST)
	public ModelAndView gotoTab2(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug(" [ /admin/cubici/adminPreference/manageCode_tab1_gotoTab2 ] ");
		
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug("[ ERROR ] [ /admin/cubici/adminPreference/manageCode_tab1_gotoTab2 ]" + CmmMessage.parameter_relay_error);
			} else {
				
				// 테이블 데이터
				HashMap<String, Object> gototTab2Data = preferencesService.gotoTab2(paramMap);
				mav.addObject("gototTab2Data", gototTab2Data);
			
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
		return mav;
	}
		
	
	// PRIZM 페이지
	@RequestMapping(value="/admin/cubici/adminPreference/prizmConfig", method=RequestMethod.GET)
	public ModelAndView prizmModPreference(@RequestParam HashMap<String, Object> params) {
		logger.debug("[ 큐빅아이 환경설정 프리즘 ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/prizmConfig");
    	
    	return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/craConfig", method=RequestMethod.GET)
	public ModelAndView craModPreference(@RequestParam HashMap<String, Object> params) {
	
		logger.debug("[ 큐빅아이 환경설정 CRA ]");
		
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/craConfig");
    	
    	return mav;
	}
	// ***** AFTER RENEWAL END *****//
	
	// Prizm 지표 관리
    @RequestMapping(value="/admin/cubici/adminPreference/prizmModify", method=RequestMethod.GET)
    public ModelAndView prizmModify() {
    	
    	logger.debug(" [ prizmModify Controller ] ");
        
    	ModelAndView mav = new ModelAndView("/admin/cubici/adminPreference/prizmModify");
		
		HashMap<String, Object> param = new HashMap<>();
		param.put("DIVISION", 1);
		
        HashMap<String, Object> resultMap = preferencesService.selectEvalList(param);
        mav.addAllObjects(resultMap);
        
    	return mav;
    }
    
    /* Prizm 세부지표 업데이트
     * 2020. 10. 13
     * by KJC */
    @RequestMapping(value="/admin/cubici/adminPreference/prizmEvalUpdate", method=RequestMethod.POST)
    public ModelAndView prizmEvalUpdate(@RequestParam HashMap<String, Object> params) throws Exception {
		
    	logger.debug(" [ prizmEvalUpdate Controller ] ");

    	ModelAndView mav = new ModelAndView("jsonView");
        
        int resultCode = 0;
        
		try {
			// 프리즘 세부지표 업데이트
			preferencesService.prizmEvalUpdate(params);
			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/prizmEvalUpdate ] [ " + ex.getMessage() + " ] ");
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		
    	return mav;
    }
    
	@RequestMapping(value = "/admin/cubici/adminPreference/prizmEvalUpdList", method = RequestMethod.POST)
	public ModelAndView prizmEvalUpdList(@RequestParam HashMap<String, Object> param) {
		if (logger.isDebugEnabled()) {
			logger.debug(" [ prizmEvalUpdList Controller ] ");
		}

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			// 프리즘 세부지표 업데이트 상세내역
			ArrayList<HashMap<String, Object>> resultList = preferencesService.selectPrizmUpdDetailList(param);
			mav.addObject("prizmUpdDetailList", resultList);
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/prizmEvalUpdList ] [ " + ex.getMessage() + " ] ");
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	@RequestMapping(value = "/admin/cubici/adminPreference/craModify", method = RequestMethod.GET)
	public ModelAndView craModify() {
		
		logger.debug(" [ craModify Controller ] ");

		ModelAndView mav = new ModelAndView("/admin/cubici/adminPreference/craModify");
		
		HashMap<String, Object> param = new HashMap<>();
		param.put("DIVISION", 2);
		
        HashMap<String, Object> resultMap = preferencesService.selectEvalList(param);
		mav.addAllObjects(resultMap);

		return mav;
	}
	
	/* 프리즘 RawData 
	 * 2021. 12. 29
	 * by YMK*/
	@RequestMapping(value= "/admin/cubici/adminPreference/prizmRawData", method = RequestMethod.GET)
	public ModelAndView rawDataPage() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/prizmRawData");
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/rawDataList", method = RequestMethod.POST)
	public ModelAndView rawDataList(@RequestBody HashMap<String, Object> paramMap) {
		
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			ArrayList<HashMap<String, Object>> List = new ArrayList<HashMap<String, Object>>();
			
			switch(paramMap.get("flag").toString()) {
				case "colList":
					List = preferencesService.rawDataColList(paramMap);
					break;
				case "calcul": case "content": case "type":
					List = preferencesService.rawDataListSelect(paramMap);
					break;
				default:
					resultCode = 98;
					break;
			}
			mav.addObject("selectedId", String.valueOf(paramMap.get("selectedId")));
			mav.addObject("List", List);
		}catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/rawDataList ] [ " + e.getMessage() + " ] ");
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
		
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/rawDataCalculInsert", method = RequestMethod.POST)
	public ModelAndView rawDataCalculInsert(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			preferencesService.rawDataCalculInsert(paramMap);
		}catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/rawDataCalculInsert ] [ " + e.getMessage() + " ] ");
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/rawDataCalculUpdate", method = RequestMethod.POST)
	public ModelAndView rawDataCalculUpdate(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			String rawDataNoCheck = paramMap.get("raw_data_no").toString();
			if(rawDataNoCheck == null || rawDataNoCheck.isEmpty()) {
				resultCode = 97;
			}else {
				preferencesService.rawDataCalculUpdate(paramMap);
			}
		}catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/rawDataCalculUpdate ] [ " + e.getMessage() + " ] ");
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/rawDataCalculDelete", method = RequestMethod.POST)
	public ModelAndView rawDataCalculDelete(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		
		try {
			String rawDataNoCheck = paramMap.get("raw_data_no").toString();
			if(rawDataNoCheck == null || rawDataNoCheck.isEmpty()) {
				resultCode = 97;
			}else {
				preferencesService.rawDataCalculDelete(paramMap);
			}
		}catch(Exception e) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/rawDataCalculDelete ] [ " + e.getMessage() + " ] ");
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/rawDataExcel", method = RequestMethod.POST)
	public void rawDataExcel(HttpServletRequest request, HttpServletResponse response, @RequestParam HashMap<String, Object> params) {
		try {
			HashMap<String, Object> excelParams = new HashMap<>();
			
			SXSSFWorkbook workbook = preferencesService.rawDataExcelList(params);// 엑셀 workbook
			excelParams.put("workbookName", "프리즘 데이터");
			excelParams.put("workbook", workbook);
			
			cubiciCmmService.excelExport(excelParams, request, response);
		}catch(Exception e) {
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/rawDataExcel ] [ " + e.getMessage() + " ] ");
		}finally {
		}
	}
	
	
	// 환경설정 - 요금제 설정
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value="/admin/cubici/adminPreference/manageCharge", method=RequestMethod.GET)
	public ModelAndView manageCharge() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/manageCharge");
		
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/chargeList", method = RequestMethod.POST)
	public ModelAndView chargeList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargeList ] " + CmmMessage.parameter_relay_error);
			}else {
				ArrayList<HashMap<String, Object>> chargeList = preferencesService.chargeList(paramMap);
				HashMap<String, Object> chargeCount = preferencesService.chargeCount(paramMap);
				
				mav.addObject("chargeCount", chargeCount);
				mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
				mav.addObject("currentPage",  Integer.parseInt(paramMap.get("currentPage").toString()));
				mav.addObject("dataCnt",  Integer.parseInt(paramMap.get("dataCnt").toString()));
				mav.addObject("chargeList", chargeList);
			}
		} catch(Exception ex) {
			resultCode = 99; 
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargeList ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/chargeDetail", method = RequestMethod.POST)
	public ModelAndView chargeDetail(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;
		
		try {
			HashMap<String, Object> chargeDetail = preferencesService.chargeDetail(paramMap);

			mav.addObject("chargeDetail", chargeDetail);
			
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /adminPreference/chargeDetail ] " + ex.getMessage());
			
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/chargeinsert", method = RequestMethod.POST)
	public ModelAndView chargeinsert(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargeinsert ] " + CmmMessage.parameter_relay_error);
			} else {
				String chargeCode = paramMap.get("charge_code").toString();		
				preferencesService.chargeinsert(paramMap);
				
				mav.addObject("charge_code", chargeCode);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargeinsert ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/chargeupdate", method = RequestMethod.POST)
	public ModelAndView chargeUpdate(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
				
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargeupdate ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.chargeUpdate(paramMap);
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargeupdate ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value="/admin/cubici/adminPreference/chargedelete", method=RequestMethod.POST)
	public ModelAndView chargeDelete(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargedelete ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.chargeDelete(paramMap);
			}
			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/chargedelete ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
// 환경설정 - 연계코드 설정
	@RequestMapping(value="/admin/cubici/adminPreference/managePromotion", method=RequestMethod.GET)
	public ModelAndView managepromotion() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/managePromotion");
		
		return mav;
	}
	
	@RequestMapping(value = "/admin/cubici/adminPreference/promotionlist", method = RequestMethod.POST)
	public ModelAndView promotionlist(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
			
		int resultCode = 0;
			
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotionlist ] " + CmmMessage.parameter_relay_error);
			}else {
				ArrayList<HashMap<String, Object>> promotionlist = preferencesService.promotionlist(paramMap);
				HashMap<String, Object> promotionCount = preferencesService.promotionCount(paramMap);
				
				mav.addObject("promotionCount", promotionCount);
				mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
				mav.addObject("currentPage",  Integer.parseInt(paramMap.get("currentPage").toString()));
				mav.addObject("dataCnt",  Integer.parseInt(paramMap.get("dataCnt").toString()));
				mav.addObject("promotionlist", promotionlist);
			}
		} catch(Exception ex) {
			resultCode = 99; 
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotionlist ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/cubici/adminPreference/promotiondetail", method = RequestMethod.POST)
	public ModelAndView promotiondetail(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotiondetail ] " + CmmMessage.parameter_relay_error);
			}else {
				HashMap<String, Object> promotionDetail = preferencesService.promotionDetail(paramMap);
				ArrayList<HashMap<String, Object>> chargeNameSelect = preferencesService.chargeNameSelect();
				
				String checked = String.valueOf(promotionDetail.get("charge_code_group"));
				String checkArr[] = checked.split(",");
				
				String partner_division = String.valueOf(promotionDetail.get("partner_division"));
				
				if(partner_division == null || partner_division == "") {
					partner_division = "자체";
				}
				
				mav.addObject("checkArr", checkArr);
				mav.addObject("chargeNameSelect", chargeNameSelect);
				mav.addObject("promotiondetail", promotionDetail);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /adminPreference/promotiondetail ] " + ex.getMessage());
			
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/promoCodeSelect", method=RequestMethod.POST)
	public ModelAndView promoCodeSelect(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
	
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promoCodeSelect ] " + CmmMessage.parameter_relay_error);
			}else {
				ArrayList<HashMap<String, Object>> partnerDivisionSelect = preferencesService.partnerDivisionSelect(paramMap);
				ArrayList<HashMap<String, Object>> chargeNameSelect = preferencesService.chargeNameSelect();
				
				mav.addObject("partnerDivisionSelect", partnerDivisionSelect);
				mav.addObject("chargeNameSelect", chargeNameSelect);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /adminPreference/managePromotion ] " + ex.getMessage());
			
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/partnerCodeSelect", method=RequestMethod.POST)
	public ModelAndView partnerCodeSelect(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerCodeSelect ] " + CmmMessage.parameter_relay_error);
			}else {
				ArrayList<HashMap<String, Object>> partnerCodeSelect = preferencesService.partnerCodeSelect(paramMap);
				
				mav.addObject("partnerCodeSelect", partnerCodeSelect);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /adminPreference/managePromotion ] " + ex.getMessage());
			
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/cubici/adminPreference/promotioninsert", method = RequestMethod.POST)
	public ModelAndView promotioninsert(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotioninsert ] " + CmmMessage.parameter_relay_error);
			} else {
				String promoCode = String.valueOf(paramMap.get("promo_code"));
				preferencesService.promotionInsert(paramMap);
				
				mav.addObject("promo_code", promoCode);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotioninsert ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value = "/admin/cubici/adminPreference/promotionupdate", method = RequestMethod.POST)
	public ModelAndView promotionUpdate(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
				
		int resultCode = 0;

		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotionupdate ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.promotionUpdate(paramMap);
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotionupdate ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@RequestMapping(value="/admin/cubici/adminPreference/promotiondelete", method=RequestMethod.POST)
	public ModelAndView promotionDelete(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotiondelete ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.promotionDelete(paramMap);
			}
			
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/promotiondelete ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}	
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/managePartner", method = RequestMethod.GET)
	public ModelAndView managePartner() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
		mav.addObject("pageName", "/admin/cubici/adminPreference/managePartner");
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerList", method = RequestMethod.POST)
	public ModelAndView PartnerList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerList ] " + CmmMessage.parameter_relay_error);
			}else {

				ArrayList<HashMap<String, Object>> partnerList = preferencesService.partnerList(paramMap);
				HashMap<String, Object> partnerCodeCount = preferencesService.partnerCodeCount(paramMap);

				mav.addObject("partnerCodeCount", partnerCodeCount);
				mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
				mav.addObject("currentPage",  Integer.parseInt(paramMap.get("currentPage").toString()));
				mav.addObject("dataCnt",  Integer.parseInt(paramMap.get("dataCnt").toString()));

				mav.addObject("partnerList", partnerList);
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerList ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value="/admin/cubici/adminPreference/divisionCodeAuth", method=RequestMethod.POST)
	public ModelAndView divisionCodeAuth(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {

			String partnerCode = paramMap.get("partner_code").toString();
			int divisionCodeAuth = preferencesService.divisionCodeAuth(partnerCode);
			
			mav.addObject("divisionCodeAuth", divisionCodeAuth);
			
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/divisionCodeAuth ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerdetail", method = RequestMethod.POST)
	public ModelAndView managePartnerDetail(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;
		
		try {
			if(paramMap.isEmpty() || paramMap == null) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerdetail ] " + CmmMessage.parameter_relay_error);
			}else {
				ArrayList<HashMap<String, Object>> partnerDetail = preferencesService.partnerDetail(paramMap);

				mav.addObject("partnerDetail", partnerDetail);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ERROR] [ /adminPreference/partnerdetail ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerinsert", method = RequestMethod.POST)
	public ModelAndView partnerinsert(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerinsert ] " + CmmMessage.parameter_relay_error);
			} else {
				preferencesService.partnerInsert(paramMap);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerinsert ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerupdate", method = RequestMethod.POST)
	public ModelAndView partnerUpdate(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
				
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerupdate ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.partnerUpdate(paramMap);
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerupdate ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	@PreAuthorize("hasRole('ADMIN_CUBICI')")
	@RequestMapping(value="/admin/cubici/adminPreference/partnerdelete", method=RequestMethod.POST)
	public ModelAndView partnerDelete(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerdelete ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.partnerDelete(paramMap);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerdelete ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	// 평가 테이블 리스트
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerEvalList", method = RequestMethod.POST)
	public ModelAndView partnerEvalList(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalList ] " + CmmMessage.parameter_relay_error);
			}else {
				ArrayList<HashMap<String, Object>> partnerEvalList = preferencesService.partnerEvalList(paramMap);
				
				mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
				mav.addObject("currentPage",  Integer.parseInt(paramMap.get("currentPage").toString()));
				mav.addObject("partnerEvalList", partnerEvalList);
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalList ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	//협력사 평가 INSERT
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerEvalInsert", method = RequestMethod.POST)
	public ModelAndView partnerEvalInsert(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		
		int resultCode = 0;
		
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalInsert ] " + CmmMessage.parameter_relay_error);
			} else {
				preferencesService.partnerEvalInsert(paramMap);
			}
		}catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalInsert ] " + ex.getMessage());
		}finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	//협력사 평가 업데이트
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerEvalUpdate", method = RequestMethod.POST)
	public ModelAndView partnerEvalUpdate(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
				
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalUpdate ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.partnerEvalUpdate(paramMap);
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalUpdate ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	
	
	//협력사 평가 삭제
	@RequestMapping(value = "/admin/cubici/adminPreference/partnerEvalDelete", method = RequestMethod.POST)
	public ModelAndView partnerEvalDelete(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
				
		int resultCode = 0;
		
		try {
			if(paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalDelete ] " + CmmMessage.parameter_relay_error);
			}else {
				preferencesService.partnerEvalDelete(paramMap);
			}
		} catch(Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /admin/cubici/adminPreference/partnerEvalDelete ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
}

