package egovframework.azon.front.cubici.web;

import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.cubici.URLConn;
import egovframework.azon.front.cubici.service.BillingService;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.cubici.service.MemberService;

// 회원 controller
@Controller
public class MemberController {

	Logger logger = LoggerFactory.getLogger(MemberController.class);

	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	MemberService memberService;

	@Autowired
	BillingService billingService;

	/* ********** 판매자 아이디 유효성 확인 ********** */
	private String nodeYN = new String();
	private int tmpNum = 0;

	// 노드 -> 톰캣
	@RequestMapping(value = "/nodetotomcat", method = { RequestMethod.POST }, consumes = "application/json")
	public void nodetotomcat(@RequestBody HashMap<String, Object> paramMap) throws Exception {

		logger.debug("[ node -> tomcat ]");

		this.nodeYN = String.valueOf(paramMap.get("result")).trim();
		this.tmpNum = (int) ((Math.random() * 9 + 1) * 100000); // 비교를 위한 임시숫자

		System.out.println("유효성 체크 ::: " + this.nodeYN);
	}

	// 회원 가입/수정 > 쇼핑몰 아이디 유효성 체크 (톰캣 -> 노드)
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/tomcattonode")
	public ModelAndView tomcattonode(@RequestBody HashMap<String, Object> paramMap) throws Exception, InterruptedException {

		logger.debug("[ MemberController/tomcattonode ]");

		ModelAndView mav = new ModelAndView("jsonView");

		//데이터 포맷 설정 
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.KOREA);

		String szSuccess = "NO"; // 결과값
		int resultCode = 0; // 상태 코드

		try {

			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ MemberController/tomcattonode ] " + CmmMessage.parameter_relay_error);
			} else {
				// 유효성 SELECT 값 가져오기
				HashMap<String, Object> authCheckSelect = memberService.authCheckSelect(paramMap);

				//유효성 시도 횟수 값
				int cnt = 0;
				int authcnt = Integer.parseInt(authCheckSelect.get("auth_count").toString());

				if(authcnt == 0) {
					cnt = 1;
				}else {
					Date NowAuthDate = new Date();
					Date LastAuthDate = format.parse(authCheckSelect.get("auth_max_date").toString());

					long time = (NowAuthDate.getTime() - LastAuthDate.getTime())/1000;

					if((time >= 3600) || (time >= 3600 && authcnt == 5)) {
						memberService.authCheckUpdate(paramMap);
						cnt = 1;
					} else if(time <= 3600 && authcnt == 5){
						cnt = 99;
					}else{
						cnt = authcnt + 1;
					}
				}

				if(cnt != 99) {
					Properties prop = new Properties();
					ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
					InputStream is = classLoader.getResourceAsStream("egovframework/mailsmsweb.properties");
					try {
						prop.load(is);
					} catch (Exception e) {
						logger.error(e.getMessage());
					}

					String url = prop.getProperty("server");
					String port = prop.getProperty("port");
					int nPort = Integer.parseInt(port);

					JSONObject batch = new JSONObject();
					batch.put("shop", paramMap.get("shopName")); // 네이버 판매자 로그인 shop = naverseller(@포함은 무조건 판매자 로그인)
					batch.put("id", paramMap.get("shopId"));
					batch.put("pwd", paramMap.get("shopPwd"));
					batch.put("firmId", paramMap.get("firmId"));
					batch.put("flag", paramMap.get("flag"));

					URLConn conn = new URLConn(url, nPort);
					conn.urlPost(batch);

					// 여기서 시간 지연작업.
					int limit = 40; // wait times 40 x 1000 = 40 초
					int tmpNumb = this.tmpNum;
					for (int i = 0; i < limit; i++) {
						if (tmpNumb != this.tmpNum) {
							break;
						}
						Thread.sleep(1000);
					}

					if (tmpNumb != this.tmpNum) {
						szSuccess = this.nodeYN;
					}

					System.out.println("this.tmpNum --> " + this.tmpNum);
					System.out.println("tmpNumb --> " + tmpNumb);
					System.out.println("nodeYN --> " + this.nodeYN);
					System.out.println("szSuccess-->> " + szSuccess);

					memberService.authCheckInsert(paramMap);

					if(this.nodeYN.equals("LsBs") || this.nodeYN.equals("Ls")) {
						memberService.authCheckUpdate(paramMap);
					}
					this.nodeYN = new String();
				}
				mav.addObject("authCnt", cnt);
				mav.addObject("cnt", Integer.parseInt(paramMap.get("cnt").toString()));
				mav.addObject("shopType", Integer.parseInt(paramMap.get("shopType").toString()));
				mav.addObject("shopName", paramMap.get("shopName").toString());
				mav.addObject("shopId", paramMap.get("shopId").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("result", szSuccess);
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	/* ********** 판매자 아이디 유효성 확인 끝 ********** */

	/* ********** 회원가입, 마이페이지 공통 ********** */
	// 주소검색 팝업
	@RequestMapping("/addrSearch")
	public String addrSearch() {
		return "/cubici/popup/jusoPopup";
	}

	// 주소검색 팝업
	@RequestMapping("/m_addrSearch")
	public String m_addrSearch() {
		return "/mobile/popup/jusoPopup";
	}

	// 핸드폰 인증
	@RequestMapping("/smsAuth")
	public ModelAndView sendSms(@RequestBody HashMap<String, Object> paramMap) throws Exception {

		logger.debug("[ /smsAuth ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ /smsAuth ] " + CmmMessage.parameter_relay_error);
			} else {
				String resultChar = memberService.smsAuth(paramMap);
				mav.addObject("resultChar", resultChar);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 이메일 인증
	@RequestMapping("/mailAuth")
	public ModelAndView sendMail(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /mailAuth ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ /mailAuth ] " + CmmMessage.parameter_relay_error);
			} else {
				String resultChar = memberService.mailAuth(paramMap);
				mav.addObject("resultChar", resultChar);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 인증번호 불러오기
	@RequestMapping("/authNumCheck")
	public ModelAndView getAuthNum(@RequestBody HashMap<String, Object> paramMap) {

		logger.debug("[ /authNumCheck ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ /authNumCheck ] " + CmmMessage.parameter_relay_error);
			} else {
				String result = memberService.authNumCheck(paramMap);
				mav.addObject("result", result);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	/* ********** 회원가입, 마이페이지 공통 끝 ********** */


	/* ********** 회원가입 ********** */
	// 쇼핑몰 리스트, 사업자 유형, 업종
	@RequestMapping(value = "/selectShop", method = RequestMethod.POST)
	public ModelAndView selectShop(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			mav.addObject("shopList", cubiciCmmService.selectShop());
			mav.addObject("bizType", cubiciCmmService.selectBizType());
			mav.addObject("sectors", cubiciCmmService.selectSector());
			mav.addObject("partners", cubiciCmmService.selectPartner());
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 회원가입 페이지
	@RequestMapping(value = "/mainSignUp", method = RequestMethod.GET)
	public ModelAndView mainSignUp() {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "home/mainSignUp");
		return mav;
	}

	// 회원가입 저장
	@RequestMapping(value = "/signUp", method = RequestMethod.POST)
	public ModelAndView signUp(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /signUp ] " + CmmMessage.parameter_relay_error);
			} else {
				memberService.insertUser(paramMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	// 모바일 회원 가입 약관동의
	@RequestMapping(value = "/m/register/step1", method = RequestMethod.GET)
	public ModelAndView mobileJoin_step1() {
		logger.debug("[ Mobile register Page 01 ]");
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "home/m_register_step1");

		return mav;

	}

	// 모바일 회원 가입
	@RequestMapping(value = "/m/register/step2", method = RequestMethod.GET)
	public ModelAndView mobileJoin_step2() {
		logger.debug("[ Mobile register Page 02 ]");
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "home/m_register_step2");

		return mav;

	}

	// 모바일 회원 쇼핑몰 등록
	@RequestMapping(value = "/m/register/step3", method = RequestMethod.POST)
	public ModelAndView mobileJoin_step3(@RequestParam HashMap<String,Object> params) {
		logger.debug("[ Mobile register Page 03 ]");
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "home/m_register_step3");
		mav.addObject("params", params);

		return mav;

	}

	// 무료 요금제 조회
	@RequestMapping(value = "/selectFreeChargeInfo", method = RequestMethod.POST)
	public ModelAndView selectFreeChargeInfo(@RequestBody HashMap<String, Object> paramMap) {
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;
		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /selectFreeChargeInfo ] " + CmmMessage.parameter_relay_error);
			} else {
				HashMap<String, Object> freeChargeMap = billingService.freeChargeData(paramMap);
				mav.addObject("freeChargeMap", freeChargeMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}

	/* ********** 회원가입 끝 ********** */

	/* ********* ID/PW 찾기 ********** */

	// [모바일] 아이디 찾기 페이지
	@RequestMapping("/m/idSearch")
	public ModelAndView m_searchID() {
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "home/m_idSearch");
		return mav;
	}

	// [모바일] 비밀번호 재설정 페이지
	@RequestMapping("/m/pwdReset")
	public ModelAndView m_resetPwd() {
		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "home/m_pwdReset");
		return mav;
	}

	// 아이디/비밀번호 찾기 유저 정보 체크
	@RequestMapping("/checkUserInfo")
	public ModelAndView idSearchResult(@RequestBody HashMap<String, Object> paramMap) {

		String szSuccess = "N";
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;

				logger.debug(" [ ERROR ] [ /login/checkUserInfo ] " + CmmMessage.parameter_relay_error);
			} else {
				String USER_NM = paramMap.get("USER_NM") == null ? "undefined" : (String) paramMap.get("USER_NM");
				String userId = "";

				HashMap<String, Object> userInfo = new HashMap<String, Object>();

				if (!"undefined".equals(USER_NM)) {
					paramMap.put("USER_NM", paramMap.get("USER_NM"));
				}

				userInfo = memberService.checkUserInfo(paramMap);

				if (userInfo != null && userInfo.size() > 0) {
					userId = String.valueOf(userInfo.get("USER_ID"));
					szSuccess = "Y";
				}

				mav.addObject("userId", userId);
				mav.addObject("success", szSuccess);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}



	// 비밀번호 재설정 페이지 결과
	@RequestMapping("/pwdReset/result")
	public ModelAndView resetPwdresult(@RequestBody HashMap<String, Object> paramMap) {

		String szSuccess = "N";
		ModelAndView mav = new ModelAndView("jsonView");
		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/home/pwdReset/result ] " + CmmMessage.parameter_relay_error);
			} else {

				int userInfo = memberService.resetMemberPwd(paramMap);

				if (userInfo == 1) {
					szSuccess = "Y";
				}

				mav.addObject("success", szSuccess);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	/* ********** ID / PWD 찾기 끝 ********** */


	/* ********** 마이페이지 ********** */
	// 회사정보 페이지
	@RequestMapping("/cubici/mypage/auth")
	public void authCheck(HttpServletResponse response, HttpServletRequest request) {
		try {
			CubiciUtils.setCookie(response, "Auth", "Y", 60*10);
			response.sendRedirect("/cubici/mypage/companyInfo");
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
	}

	// 회사정보 페이지
	@RequestMapping("/m/cubici/myAuth")
	public void mobileAuthCheck(HttpServletResponse response, HttpServletRequest request) {
		try {
			CubiciUtils.setCookie(response, "Auth", "Y", 60*10);
			response.sendRedirect("/cubici/mypage/companyInfo");
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
	}
	/* ********** 마이페이지 > 회사정보 ********** */
	// 회사정보 페이지
	@RequestMapping(value = "/cubici/mypage/companyInfo", method = RequestMethod.GET)
	public ModelAndView mypageC(HttpServletRequest request, HttpServletResponse response) {
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
			mav.addObject("userInfo", userInfo);

			HashMap<String, Object> cookieMap = CubiciUtils.getCookie(request, "Auth");
			String auth = String.valueOf(cookieMap.get("Auth"));

			if(auth.equals("null")){
				mav.addObject("pageName", "myPage/myAuth");
				return mav;
			}
			CubiciUtils.delCookie(request, response, "Auth");

			mav.addObject("pageName", "myPage/companyInfo");

			// CBCI_ACCOUNT
			List<HashMap<String, Object>> shopList = memberService.getShopList();
			mav.addObject("userShopList", shopList);

			mav.addObject("shopList", cubiciCmmService.selectShop());
		} catch (Exception ex) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// [모바일] 회사정보 페이지 
	@RequestMapping("/m/cubici/mypage/companyInfo")
	public ModelAndView mobileMypageC() {

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "myPage/m_companyInfo");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> userInfo = memberService.selectUserInfo(principal);
			mav.addObject("userInfo", userInfo);

			// CBCI_ACCOUNT
			List<HashMap<String, Object>> shopList = memberService.getShopList();
			mav.addObject("userShopList", shopList);

			mav.addObject("shopList", cubiciCmmService.selectShop());
		} catch (Exception ex) {
			resultCode = 99;
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	/* 마이페이지 - 회사정보 수정 저장 2021.04.21 PHJ */
	@RequestMapping("/cubici/mypage/companyInfo/update")
	public ModelAndView memberModifySave(@RequestBody HashMap<String, Object> paramMap) {
		int resultCode = 0;
		ModelAndView mav = new ModelAndView("jsonView");

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /front/memberModifySave ] " + CmmMessage.parameter_relay_error);
			} else {
				// 수정 정보 저장
				memberService.insertShopAccount(paramMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}
		return mav;
	}
	/* ********** 회사정보 끝 ********** */

	/* ********** 마이페이지 > 사업정보 ********** */
	// 사업정보 페이지
	@RequestMapping("/cubici/mypage/businessInfo")
	public ModelAndView mypageB() {

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "myPage/businessInfo");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> memberInfoMap = memberService.selectUserInfo(principal);

			if (memberInfoMap == null || memberInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /myPage/businessInfo ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("FIRM_NM", memberInfoMap.get("firm_nm").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// [모바일] 사업정보 페이지
	@RequestMapping("/m/cubici/mypage/businessInfo")
	public ModelAndView mobileMypageB() {

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "myPage/m_businessInfo");

		int resultCode = 0;

		try {
			HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
			HashMap<String, Object> memberInfoMap = memberService.selectUserInfo(principal);

			if (memberInfoMap == null || memberInfoMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /m/myPage/businessInfo ] " + CmmMessage.DB_request_error);
			} else {
				mav.addObject("FIRM_NM", memberInfoMap.get("FIRM_NM").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 사업정보 select
	@RequestMapping("/cubici/mypage/businessInfo/select")
	public ModelAndView mypageBusinessSelect(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/mypage/businessInfo/select ] " + CmmMessage.parameter_relay_error);
			} else {
				ArrayList<HashMap<String, Object>> resultList = memberService.selectBusinessInfo(paramMap);
				mav.addObject("resultList", resultList);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 사업정보 insert
	@RequestMapping("/cubici/mypage/businessInfo/insert")
	public ModelAndView mypageBusinessInsert(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/mypage/businessInfo/insert ] " + CmmMessage.parameter_relay_error);
			} else {
				// insert 실행
				memberService.insertBusinessInfo(paramMap);
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	// 사업정보 update , delete
	@RequestMapping("/cubici/mypage/businessInfo/update")
	public ModelAndView mypageBusinessUpdResponse(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug(" [ ERROR ] [ /cubici/mypage/businessInfo/update ] " + CmmMessage.parameter_relay_error);
			} else {
				// update/delete 실행
				memberService.updateBusinessInfo(paramMap);
				mav.addObject("FLAG", paramMap.get("FLAG").toString());
			}
		} catch (Exception e) {
			resultCode = 99;
			logger.error(e.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}
	/* ********** 마이페이지 > 사업정보 끝 ********** */
}