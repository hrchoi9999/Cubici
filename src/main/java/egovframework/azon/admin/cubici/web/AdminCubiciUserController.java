package egovframework.azon.admin.cubici.web;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import egovframework.azon.cmmn.component.CubiciUtils;
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

import egovframework.azon.admin.cubici.service.AdminCubiciService;
import egovframework.azon.admin.cubici.service.AdminExcelDownloadService;
import egovframework.azon.admin.cmmn.service.ManageMemberService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.front.cubici.service.CubiciCmmService;

@Controller
public class AdminCubiciUserController {

    Logger logger = LoggerFactory.getLogger(AdminCubiciController.class);

    @Autowired
    AdminCubiciService adminCubiciService;

    @Autowired
    CubiciCmmService cubiciCmmService;

    @Autowired
    AdminExcelDownloadService serviceExcel;

    @Autowired
    ManageMemberService manageMemberService;

    // 큐빅아이 회원정보 현황종합
    @RequestMapping(value = "/admin/cubici/manageMember/member_tab1", method = RequestMethod.GET)
    public ModelAndView manageMemberAdminMain() {
        logger.debug("[ 큐빅아이 관리자 회원관리 현황종합 ]");

        ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
        mav.addObject("pageName", "/admin/cubici/manageMember/member_tab1");
        int resultCode = 0;
        try {
            HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
            mav.addObject("standardDate", defaultDate.get("toDate").toString());
            // 기본 날짜 설정
            mav.addObject("fromDate", defaultDate.get("fromDate").toString());
            mav.addObject("toDate", defaultDate.get("toDate").toString());

            HashMap<String, String> partnerFirm = cubiciCmmService.selectPartner();

            mav.addObject("partnerFirm", partnerFirm);

        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/member_tab1 ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 회원현황 협력사에 따른 서비스 구분
    @RequestMapping(value = "/admin/cubici/manageMember/changeServiceDivision", method = RequestMethod.POST)
    public ModelAndView changeServiceDivision(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug(" [ /admin/cubici/manageMember/changeServiceDivision] ");

        ModelAndView mav = new ModelAndView("jsonView");

        int resultCode = 0;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                resultCode = 88;
                logger.debug(
                        "[ ERROR ] [ //admin/cubici/manageMember/changeServiceDivision]" + CmmMessage.parameter_relay_error);
            } else {

                // 금융상품 정보 가져오기

            }
        } catch (Exception e) {
            resultCode = 99;
            logger.error(e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 현황 종합 -> 신청/심사/계약
    @RequestMapping(value = "/admin/cubici/manageMember/member_tab1/get", method = RequestMethod.POST)
    public ModelAndView memberStatusGraph(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug(" [ /admin/cubici/manageMember/member_tab1/get ] ");

        ModelAndView mav = new ModelAndView("jsonView");

        int resultCode = 0;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                resultCode = 88;
                logger.debug(
                        "[ ERROR ] [ //admin/cubici/manageMember/member_tab1/get ]" + CmmMessage.parameter_relay_error);
            } else {
                // 누적큐빅아이
                paramMap.put("flag", "member");
                int cumulateMember = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("cumulateMember", cumulateMember);
                ArrayList<HashMap<String, Object>> memberStatusMap = adminCubiciService.selectUsers(paramMap);
                mav.addObject("memberStatusMap", memberStatusMap);
                paramMap.put("flag", "member_yesterday");
                int Member_yesterday = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("Member_yesterday", Member_yesterday);
                paramMap.put("flag", "member_today");
                int member_today = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("Member_today", member_today);

                // 누적 머니뱅크
                paramMap.put("flag", "moneybank");
                int cumulateMoneybank = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("cumulateMoneybank", cumulateMoneybank);

                ArrayList<HashMap<String, Object>> moneybankStatusMap = adminCubiciService.selectUsers(paramMap);
                mav.addObject("moneybankStatusMap", moneybankStatusMap);
                paramMap.put("flag", "moneybank_yesterday");
                int Moneybank_yesterday = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("Moneybank_yesterday", Moneybank_yesterday);
                paramMap.put("flag", "moneybank_today");
                int moneybank_today = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("Moneybank_today", moneybank_today);

                // 누적 가입해지
                paramMap.put("flag", "withdraw");
                int cumulateWithdraw = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("cumulateWithdraw", cumulateWithdraw);
                ArrayList<HashMap<String, Object>> withdrawStatusMap = adminCubiciService.selectUsers(paramMap);
                mav.addObject("withdrawStatusMap", withdrawStatusMap);
                paramMap.put("flag", "withdraw_yesterday");
                int Withdraw_yesterday = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("Withdraw_yesterday", Withdraw_yesterday);
                paramMap.put("flag", "withdraw_today");
                int Withdraw_today = adminCubiciService.cumulateUserData(paramMap);
                mav.addObject("Withdraw_today", Withdraw_today);
            }
        } catch (Exception e) {
            resultCode = 99;
            logger.error(e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 큐빅아이 회원정보 회원상세
    @RequestMapping(value = "/admin/cubici/manageMember/member_tab2", method = RequestMethod.GET)
    public ModelAndView manageMemberDetail(@RequestParam HashMap<String, Object> params) {
        logger.debug("[ 큐빅아이 관리자 회원정보 ]");

        ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
        mav.addObject("pageName", "/admin/cubici/manageMember/member_tab2");
        int resultCode = 0;
        try {
            HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
            mav.addObject("standardDate", defaultDate.get("toDate").toString());
            mav.addObject("fromDate", defaultDate.get("fromDate").toString());
            mav.addObject("toDate", defaultDate.get("toDate").toString());

            ArrayList<HashMap<String, Object>> userStatusList = cubiciCmmService.authSelectBox("04");
            ArrayList<HashMap<String, Object>> chargeList = cubiciCmmService.chargeSelectBox();

            mav.addObject("userStatusList", userStatusList);
            mav.addObject("chargeList", chargeList);

        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/member_tab2 ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 회원 상세 -> 회원 상세 테이블
    @RequestMapping(value = "/admin/cubici/manageMember/member_tab2", method = RequestMethod.POST)
    public ModelAndView userStatusList(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug(" [ /admin/cubici/manageMember/member_tab2/post ] ");

        ModelAndView mav = new ModelAndView("jsonView");

        int resultCode = 0;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                resultCode = 88;
                logger.debug(
                        "[ ERROR ] [ /admin/cubici/manageMember/member_tab2/post ]" + CmmMessage.parameter_relay_error);
            } else {
                ArrayList<HashMap<String, Object>> userStatusList = manageMemberService.userStatusList(paramMap);
                mav.addObject("dataPerPage", Integer.parseInt(paramMap.get("dataPerPage").toString()));
                mav.addObject("currentPage", Integer.parseInt(paramMap.get("currentPage").toString()));
                mav.addObject("userStatusList", userStatusList);

                HashMap<String, Object> userStatusSum = manageMemberService.userStatusSum(paramMap);
                mav.addObject("userStatusSum", userStatusSum);
            }
        } catch (Exception e) {
            resultCode = 99;
            logger.error(e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 상세유저번호 조회
	/*@RequestMapping(value = "/admin/cubici/manageMember/member_tab2/detailUserNo", method = RequestMethod.POST)
	public ModelAndView selectDetailUserNo(@RequestBody String params) {

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			HashMap<String, Object> paramsMap = CubiciUtils.jsonStringToHashMap(params);

			if (paramsMap == null || paramsMap.isEmpty()) {
				resultCode = 88;
				logger.debug("[ /admin/cubici/manageMember/member_tab2/detailUserNo ] " + CmmMessage.parameter_relay_error);
			} else {

				// 기본 정보
				ArrayList<HashMap<String, Object>> userDetailList = adminCubiciService.selectUserDetailUserNoList(paramsMap);
				mav.addObject("userDetailList", userDetailList);

				ArrayList<HashMap<String, Object>> userDetailShopList = adminCubiciService.selectUserDetailShopList(paramsMap);
				mav.addObject("shopList", userDetailShopList);

				// 머니 뱅크
				ArrayList<HashMap<String, Object>> moneybankList = adminCubiciService.moneybankList(paramsMap);
				mav.addObject("moneybankList", moneybankList);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
*/
    // 큐빅아이 회원정보 해지상세
    @RequestMapping(value = "/admin/cubici/manageMember/member_tab3", method = RequestMethod.GET)
    public ModelAndView manageMemberWithdraw(@RequestParam HashMap<String, Object> params) {
        logger.debug("[ 큐빅아이 관리자 회원관리 해지상세 ]");

        ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
        mav.addObject("pageName", "/admin/cubici/manageMember/member_tab3");
        int resultCode = 0;

        try {
            HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
            mav.addObject("standardDate", defaultDate.get("toDate").toString());
            // 기본 날짜 설정
            mav.addObject("fromDate", defaultDate.get("fromDate").toString());
            mav.addObject("toDate", defaultDate.get("toDate").toString());

            HashMap<String, String> partnerFirm = cubiciCmmService.selectPartner();

            mav.addObject("partnerFirm", partnerFirm);
        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/member_tab3 ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;

    }

    // 해지 상세 -> 해지 상세 테이블
    @RequestMapping(value = "/admin/cubici/manageMember/member_tab3/get", method = RequestMethod.POST)
    public ModelAndView withdrawDetail(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug(" [ /admin/cubici/manageMember/member_tab3/get ] ");

        ModelAndView mav = new ModelAndView("jsonView");

        int resultCode = 0;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                resultCode = 88;
                logger.debug("[ ERROR ] [ /admin/cubici/manageMember/member_tab3/get ]" + CmmMessage.parameter_relay_error);

            } else {
                // 큐빅아이 해지 상세
                paramMap.put("wdFlag", "withAppDraw");
                ArrayList<HashMap<String, Object>> withdrawDetailList = manageMemberService.userStatusList(paramMap);
                mav.addObject("withdrawDetailList", withdrawDetailList);
                mav.addObject("currentPage", paramMap.get("NOWPAGENO").toString());

                // 해지 인원 수
                paramMap.put("flag", "sum");
                paramMap.put("wdFlag", "withDraw");
                ArrayList<HashMap<String, Object>> userSumList = manageMemberService.userStatusList(paramMap);
                mav.addObject("userSumList", userSumList);
                paramMap.put("wdFlag", "withAppDraw");
                ArrayList<HashMap<String, Object>> userAppSumList = manageMemberService.userStatusList(paramMap);
                mav.addObject("userAppSumList", userAppSumList);
            }
        } catch (Exception e) {
            resultCode = 99;
            logger.error(e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 해지 확인
    @RequestMapping("/admin/cubici/manageMember/member_tab3/updWithdraw")
    public ModelAndView updWithdrawFuncResponse(@RequestBody HashMap<String, Object> paramMap) {

        ModelAndView mav = new ModelAndView("jsonView");

        int resultCode = 0;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                resultCode = 88;
                logger.debug(" [ ERROR ] [ /cubici/mypage/businessInfo/update ] " + CmmMessage.parameter_relay_error);
            } else {
                // update실행
                adminCubiciService.updateWithdraw(paramMap);
            }
        } catch (Exception e) {
            resultCode = 99;
            logger.error(e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }
        return mav;
    }

    // 회원 상세정보 화면
    @RequestMapping(value = "/admin/cubici/manageMember/userstatus", method = RequestMethod.GET)
    public ModelAndView manageMemberInfo(@RequestParam HashMap<String, Object> paramMap) {
        logger.debug("[ 큐빅아이 관리자 회원관리 회원 상세정보 ]");

        ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
        mav.addObject("pageName", "/admin/cubici/manageMember/member_status");
        int resultCode = 0;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                resultCode = 88;
                logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/userstatus ] " + CmmMessage.parameter_relay_error);
            } else {
                HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
                mav.addObject("standardDate", String.valueOf(defaultDate.get("toDate")));

                String userCode = String.valueOf(paramMap.get("code"));
                mav.addObject("userDetail", manageMemberService.userDetail(userCode));
                mav.addObject("userStatusRateDetail", manageMemberService.userStatusRateDetail(userCode));
                mav.addObject("userStatusRateTotalDate", manageMemberService.userStatusRateTotalDate(userCode));
            }
        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ERROR] [ /admin/cubici/manageMember/userstatus ] " + ex.getMessage());

        } finally {
            mav.addObject("resultCode", resultCode);
        }
        return mav;
    }

    // 회원 상세정보_결제현황 화면
    @RequestMapping(value = "/admin/cubici/manageMember/userstatus/paymentList", method = RequestMethod.POST)
    public ModelAndView getPaymentList(@RequestBody HashMap<String, Object> paramMap) {
        logger.debug("[ 큐빅아이 관리자 회원관리 회원 상세정보 ]");
        ModelAndView mav = new ModelAndView("jsonView");
        int resultCode = 0;

        try {
            ArrayList<HashMap<String, Object>> findPaymentList = manageMemberService.findPaymentList(paramMap);
            mav.addObject("paymentList", findPaymentList);

            mav.addObject("dataPerPage", Integer.parseInt(String.valueOf(paramMap.get("dataPerPage"))));
            mav.addObject("currentPage", Integer.parseInt(String.valueOf(paramMap.get("currentPage"))));
            mav.addObject("dataCnt", Integer.parseInt(String.valueOf(paramMap.get("dataCnt"))));
            mav.addObject("id", "paytab");

        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /admin/cubici/manageMember/member_status ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    @PreAuthorize("hasRole('ADMIN_CUBICI')")
    @RequestMapping(value = "/admin/cubici/manageMember/userstatus/evalenroll", method = RequestMethod.POST)
    public ModelAndView userEvalEnroll(@RequestBody HashMap<String, Object> paramMap) {
        logger.debug("[ 큐빅아이 관리자 회원관리 회원 상세정보 평가등록 ]");

        ModelAndView mav = new ModelAndView("jsonView");
        int resultCode = 0;

        try {
            manageMemberService.userEvaluateEnroll(paramMap);
        } catch (Exception e) {
            resultCode = 99;
            logger.error("userEvalEnroll error :::: " + e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    @PreAuthorize("hasRole('ADMIN_CUBICI')")
    @RequestMapping(value = "/admin/cubici/manageMember/userstatus/evalemodify", method = RequestMethod.POST)
    public ModelAndView userEvalModify(@RequestBody HashMap<String, Object> paramMap) {
        logger.debug("[ 큐빅아이 관리자 회원관리 회원 상세정보 평가수정 ]");

        ModelAndView mav = new ModelAndView("jsonView");
        int resultCode = 0;

        try {
            manageMemberService.userEvaluateModify(paramMap);
        } catch (Exception e) {
            resultCode = 99;
            logger.error("userEvalModify error :::: " + e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }

        return mav;
    }

    // 큐빅아이 회원정보 에러로그
    @RequestMapping(value = "/admin/cubici/adminMonitor/error_report", method = RequestMethod.GET)
    public ModelAndView manageMemberErrorReport(@RequestParam HashMap<String, Object> params) {
        logger.debug("[ 큐빅아이 관리자 회원관리 에러로그 ]");

        ModelAndView mav = new ModelAndView(CmmMessage.cubiciAdminFrame);
        mav.addObject("pageName", "/admin/cubici/adminMonitor/error_report");
        int resultCode = 0;

        try {
            HashMap<Integer, String> shopInfoMap = cubiciCmmService.selectShop();
            mav.addObject("shopInfoMap", shopInfoMap);

            // 헤쉬맵 키 값만 뽑아서 string으로 저장
            Iterator<Integer> keys = shopInfoMap.keySet().iterator();
            String shopList = "";
            while (keys.hasNext()) {
                Integer key = keys.next();
                shopList += key + ",";
            }
            shopList = shopList.substring(0, shopList.length() - 1);

            HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
            mav.addObject("shopList", shopList);
            mav.addObject("standardDate", defaultDate.get("toDate").toString());
            // 기본 날짜 설정
            mav.addObject("fromDate", defaultDate.get("lastWeek").toString());
            mav.addObject("toDate", defaultDate.get("toDate").toString());
        } catch (Exception ex) {
            resultCode = 99;
            logger.debug(" [ ERROR ] [ /admin/cubici/adminMonitor/error_report ] " + ex.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }
        return mav;
    }

    // 에러로그 상세 -> 에러로그 상세 테이블
    @RequestMapping(value = "/admin/cubici/adminMonitor/error_report/get", method = RequestMethod.POST)
    public ModelAndView errorReportDetail(@RequestBody HashMap<String, Object> paramMap) {

        logger.debug(" [ /admin/cubici/adminMonitor/error_report/get ] ");

        ModelAndView mav = new ModelAndView("jsonView");

        int resultCode = 0;

        try {
            if (paramMap == null || paramMap.isEmpty()) {
                resultCode = 88;
                logger.debug(
                        "[ ERROR ] [ /admin/cubici/adminMonitor/error_report/get ]" + CmmMessage.parameter_relay_error);
            } else {
                ArrayList<HashMap<String, Object>> logData = cubiciCmmService.selectErrorLogData(paramMap);
                mav.addObject("logData", logData);
                mav.addObject("currentPage", paramMap.get("NOWPAGENO").toString());

                paramMap.put("flagCount", "flagCount");
                ArrayList<HashMap<String, Object>> count = cubiciCmmService.selectErrorLogData(paramMap);
                mav.addObject("cnt", count);
            }
        } catch (Exception e) {
            resultCode = 99;
            logger.error(e.getMessage());
        } finally {
            mav.addObject("resultCode", resultCode);
        }
        return mav;
    }

}
