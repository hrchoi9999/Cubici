package egovframework.azon.front.cubici.web;

import egovframework.azon.admin.cubici.service.AdminCubiciService;
import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciComponent;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.HashMap;

@Controller
public class MainController {

	Logger logger = LoggerFactory.getLogger(MainController.class);

	@Autowired
	CubiciCmmService cubiciCmmService;

	@Autowired
	AdminCubiciService adminCubiciService;

	@Autowired
	CubiciComponent cubiciComponent;

	@RequestMapping("/main")
	public ModelAndView main() {

		logger.debug("[ Main Page ]");
		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "main");

		return mav;
	}

	@RequestMapping(value="/expire/modal", method=RequestMethod.POST)
	public ModelAndView modaltest(@RequestBody HashMap<String, Object> paramMap, HttpServletRequest request){
		logger.debug("[ Cubici Modal ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			String param = String.valueOf(paramMap.get("type"));
			ArrayList<HashMap<String, Object>> resultList = cubiciCmmService.modalId(param);

			if(!resultList.isEmpty()) {
				mav.addObject("resultList", resultList);
			}

			ArrayList<String> modalCookie = cubiciComponent.getCookieModal(request);
			mav.addObject("modalCookie", modalCookie);

		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /expire/modal ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	@RequestMapping(value="/cubici/cookie", method=RequestMethod.POST)
	public ModelAndView ModalCookie(@RequestBody HashMap<String, Object> paramMap, HttpServletResponse response) {
		logger.debug("[ Cubici Cookie ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			String name = paramMap.get("name").toString();
			String value = paramMap.get("value").toString();
			int time = (int) cubiciComponent.getTomorrowInSecond();

			CubiciUtils.setCookie(response, name, value, time);
			mav.addObject("modalName", name);

		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /cubici/cookie ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	@RequestMapping("/login")
	public ModelAndView login() {

		logger.debug("[ Login Page ]");

		ModelAndView mav = new ModelAndView(CmmMessage.cubiciFrame);
		mav.addObject("pageName", "/home/login");

		return mav;
	}

	@RequestMapping("/m/main")
	public ModelAndView mobileMain() {

		logger.debug("[ Mobile Main Page ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "main");

		return mav;
	}

	// 모바일 회원 로그인
	@RequestMapping("/m/login")
	public ModelAndView mobileLogin() {

		logger.debug("[ Mobile Login Page ]");

		ModelAndView mav = new ModelAndView(CmmMessage.mobileFrame);
		mav.addObject("pageName", "home/m_login");

		return mav;

	}

	// 큐빅아이 관리자 로그인 페이지
	@RequestMapping("/admin/cubici/signIn")
	public ModelAndView cubiciAdminSignIn() {
		logger.debug("[ Admin cubici Sign In ]");

		ModelAndView mav = new ModelAndView();
		mav.setViewName("/admin/cubici/admin_login");

		return mav;
	}

	// 헬로페이 관리자 로그인 페이지
	@RequestMapping("/admin/hellopay/signIn")
	public ModelAndView hellopayAdminSignIn() {
		logger.debug("[ Admin hellopay Sign In ]");

		ModelAndView mav = new ModelAndView();
		mav.setViewName("/admin/moneybank/hellopay_signIn");

		return mav;
	}

	// 투게더 관리자 로그인 페이지
	@RequestMapping("/admin/together/signIn")
	public ModelAndView togetherAdminSignIn() {

		logger.debug("[ Admin together Sign In ]");

		ModelAndView mav = new ModelAndView();
		mav.setViewName("/admin/moneybank/together_signIn");

		return mav;
	}

	@RequestMapping("/401")
	public ModelAndView Error401() {

		logger.debug("[ Error Page 401 ]");

		ModelAndView mav = new ModelAndView();
		mav.setViewName("/error/401");

		return mav;
	}

	@RequestMapping(value = "/selectBoxList", method = RequestMethod.POST)
	public ModelAndView selectSelectBoxList(@RequestBody HashMap<String, Object> paramMap) {
		logger.debug("[ 큐빅아이 SelectBoxList ]");

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				logger.debug(" [ ERROR ] [ SelectBoxList ] " + CmmMessage.parameter_relay_error);
				resultCode = 88;
			} else {
				String selectClass = paramMap.get("SELECT_CLASS").toString();
				ArrayList<HashMap<String, Object>> selectSelectListBox = cubiciCmmService.selectCodeList(selectClass);
				mav.addObject("selectClass", selectClass);
				mav.addObject("selectSelectListBox", selectSelectListBox);
			}
		} catch (Exception ex) {
			resultCode = 99;
			logger.debug(" [ ERROR ] [ /selectBoxList ] " + ex.getMessage());
		} finally {
			mav.addObject("resultCode", resultCode);
		}

		return mav;
	}

	@RequestMapping(value = "/checkBizOverlap", method = RequestMethod.POST)
	public ModelAndView bizReduplication(@RequestBody HashMap<String, Object> paramMap) {

		ModelAndView mav = new ModelAndView("jsonView");

		int resultCode = 0;

		try {
			if (paramMap == null || paramMap.isEmpty()) {
				resultCode = 88;
				logger.debug("[ ERROR ] [ /checkBizOverlap ] " + CmmMessage.parameter_relay_error);
			} else {
				mav.addObject("resultMap", cubiciCmmService.BizOverlap(paramMap));
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
