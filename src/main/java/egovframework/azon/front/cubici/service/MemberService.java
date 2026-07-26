package egovframework.azon.front.cubici.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import egovframework.azon.cmmn.CmmMessage;
import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.dto.SmsDto;
import egovframework.azon.front.cubici.mapper.CubiciCmmMapper;
import egovframework.azon.front.cubici.mapper.MemberMapper;

@Service
public class MemberService {	

	Logger logger = LoggerFactory.getLogger(MemberService.class);

	@Autowired
	MemberMapper memberMapper;
	
	@Autowired
	CubiciCmmMapper cubiciCmmMapper;
	
	@Autowired
	CubiciCmmService cubiciCmmService;
	
	@Autowired
	BillingService billingService;
	
	private final SmsDto sd = new SmsDto();
	
	// 회원가입 > 아이디 중복확인
	public HashMap<String, Object> selectIdOverlap(HashMap<String, Object> params) {
		return memberMapper.selectIdOverlap(params);
	}
	
	// 회원가입 > 전화번호 중복확인
	public HashMap<String, Object> selectMobileOverlap(HashMap<String, Object> params) {
		return memberMapper.selectMobileOverlap(params);
	}
	
	// SMS > 인증번호 발송
	public String smsAuth(HashMap<String, Object> paramMap){
		paramMap.put("SMS_CODE", "01");
		String resultChar = "N";
		String flag = String.valueOf(paramMap.get("FLAG"));
		String dupFlag = String.valueOf(selectMobileOverlap(paramMap).get("COUNT"));
		
		if (flag.equals("signUpSms") && !dupFlag.equals("0")) {
			resultChar = "D";
		} else if (flag.equals("searchSms") && dupFlag.equals("0")) {
			resultChar = "NULL";
		} else if(sendAuthCodeSms(paramMap).equals("success")) {
			memberMapper.insertEmailSmSAuth(paramMap);
			resultChar = "Y";
		}
		
		return resultChar;
	}
	
	private String sendAuthCodeSms(HashMap<String, Object> paramMap) {
		paramMap.put("authCode", (int) ((Math.random() * 9 + 1) * 100000) + "");
		return cubiciCmmService.sendSms(paramMap, sd.getSmsAuthArr());
	}
	
	public String mailAuth(HashMap<String, Object> paramMap) {
		String resultChar = "N"; // 이메일 전송 성공여부
		String flag = String.valueOf(paramMap.get("FLAG"));
		String dupFlag = String.valueOf(selectIdOverlap(paramMap).get("COUNT"));
		
		boolean isSendMail = false;
		if(flag.equals("signUpEmail") && !dupFlag.equals("0")) {
			resultChar = "D";
		} else if(flag.equals("signUpEmail")) {
			isSendMail = isMailAuthCode(paramMap);
			memberMapper.insertEmailSmSAuth(paramMap);
		} else if(flag.equals("welcomeEmail")) {
			isSendMail = isWelcomeEmail(paramMap);
		}
		
		if(isSendMail) {
			resultChar = "Y";
		}
		
		return resultChar;
	}
	
	private boolean isMailAuthCode(HashMap<String, Object> paramMap) {
		paramMap.put("SMS_CODE", "01");
		paramMap.put("authCode", (int) ((Math.random() * 9 + 1) * 100000) + "");
		return cubiciCmmService.sendMail(paramMap, sd.getMailAuthCode());
	}
	
	private boolean isWelcomeEmail(HashMap<String, Object> paramMap) {
		paramMap.put("SMS_CODE", "02");
		return cubiciCmmService.sendMail(paramMap, sd.getMailWelcome());
	}
	
	// 인증번호 불러오기
	public String authNumCheck(HashMap<String, Object> params) {
		String result = "NONPASS";
		if (!String.valueOf(params.get("authNum")).equals("")){
			HashMap<String, Object> authNumMap = memberMapper.selectAuthNum(params);
			String authNum = authNumMap.get("auth_num").toString();
			String inputAuthNum = params.get("authNum").toString();
			if(authNum.equals(inputAuthNum)) result = "PASS"; 
		}
		return result;
	}
	
	// 회원가입
	public void insertUser(HashMap<String, Object> params) {
		int userNo = memberMapper.userNoMax();
		String userCode = getMemberCode(params);
		params.put("user_no", userNo);
		params.put("user_code", userCode);
		params.put("result", "signUp");
		memberMapper.insertUser(params);
		billingService.insertPaymentsData(params);
	}


	/* ********** ID, PWD 찾기 ********** */

	// 아이디/비밀번호 찾기 유저정보
	public HashMap<String, Object> checkUserInfo(HashMap<String, Object> params) {
		return memberMapper.checkUserInfo(params);
	}
	// 비밀번호 초기화
	public int resetMemberPwd(HashMap<String, Object> params) {
		return memberMapper.resetMemberPwd(params);
	}
	/* ********** ID, PWD 찾기 끝 ********** */

	// 마이페이지 > 회원정보
	public HashMap<String, Object> selectUserInfo(HashMap<String, Object> params) {
		return memberMapper.selectUserInfo(params);
	}

	// 회원 회사정보 + 쇼핑몰정보 (화면에서)
	public void insertShopAccount(HashMap<String, Object> paramMap) {
		HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
		paramMap.put("USER_NO", principal.get("user_no"));
		paramMap.put("USER_CODE", principal.get("user_code"));

		ArrayList<HashMap<String, Object>> shopList = CubiciUtils.ObjectToArrayList(paramMap.get("SHOPLIST"));
		for(int i = 0; i < shopList.size(); i++){
			isContainsKey(shopList.get(i));
			paramMap.putAll(shopList.get(i));
			memberMapper.insertShopAccount(paramMap);
		}
		memberMapper.updateUserInfo(paramMap);
	}

	private void isContainsKey(HashMap<String,Object> paramMap) {
		if (paramMap.containsKey("VENDOR_ID")) {
			paramMap.put("VENDOR_ID", "");
			if (paramMap.containsKey("API_SECRET_KEY")) {
				paramMap.put("API_SECRET_KEY", "");
			}
		}
	}

	// 마이페이지 > 쇼핑몰 목록(쇼핑몰, 아이디, 비밀번호, 선정산 여부)
	public List<HashMap<String, Object>> getShopList(){
		HashMap<String,Object> principal = CubiciUtils.UserAuthentication();
		HashMap<String,Object> params = new HashMap<>();
		params.put("USER_NO", principal.get("user_no"));
		params.put("USER_CODE", principal.get("user_code"));

		return memberMapper.getShopList(params);
	}
	
	/* ********** 마이페이지 > 사업정보 ********** */
	public ArrayList<HashMap<String, Object>> selectBusinessInfo(HashMap<String, Object> params) {
		return memberMapper.selectBusienssInfo(params);
	}
	
	public void insertBusinessInfo(HashMap<String, Object> params) {
		
		// 영업소재지 가장 높은 수
		int businessnoMx = memberMapper.businessnoMx(params);

		params.put("BUSINESS_LOCATION_NUMBER", businessnoMx);

		memberMapper.insertBusinessInfo(params);
	}

	public void updateBusinessInfo(HashMap<String, Object> params) {
		// flag에 따라 update와 delete로 보내줌
		if (params.get("FLAG").toString().equals("update")) { // update
			 memberMapper.updateBussinessInfo(params);
		} else if (params.get("FLAG").toString().equals("delete")) { // delete
			memberMapper.deleteBussinessInfo(params);
		} else {
			System.out.println("[ MemberService ] [ updateBusinessInfo ] " + CmmMessage.parameter_relay_error);
		}
	}

	/* ********** 마이페이지 > 사업정보 끝 ********** */
	// 회원코드 생성 MKC 2021.01.15
	public String getMemberCode(HashMap<String, Object> params) {
		StringBuffer memCoder = new StringBuffer();

		// ** 가입 일자 (연2+월2)
		Date now = new Date();
		SimpleDateFormat forCodeSdf = new SimpleDateFormat("yyMM");
		String enterDate = forCodeSdf.format(now);
		memCoder.append(enterDate); // yyMM

		// ** 가입 순번(char+##)
		// 저장할 회원의 순번(당월 가입자수+1)
		SimpleDateFormat forParamSdf = new SimpleDateFormat("yyyy-MM");
		params.put("regDate", forParamSdf.format(now)); // 현재 날짜
		ArrayList<HashMap<String, Object>> currVal = memberMapper.selectCubiciCodeCount(params);
		int currCount = currVal == null ? 0 : Integer.parseInt(currVal.get(0).get("COUNT").toString());
		currCount += 1;

		// CHAR & 숫자 확인 (한달에 총 2574명 저장가능)
		char[] alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
		int charNum = (int) Math.floor(currCount / 99); // 당월 가입자수에 따라 char 선택

		if (currCount > 99) { // 01~99까지 저장 가능
			charNum += 1;
			if (charNum > 25) { // Z 넘어가면 다시 A부터
				charNum = 0;
			}
			currCount -= 99; // 99 넘으면 다시 01부터
		}

		String currCountStr = Integer.toString(currCount); // 숫자 길이 check
		String enterSeq = "";

		if (currCountStr.length() < 2) {
			enterSeq = alphabet[charNum] + "0" + currCountStr;
		} else {
			enterSeq = alphabet[charNum] + currCountStr;
		}
		memCoder.append(enterSeq); // yyMM+char+SQ

		// ** 국가코드 (일단은 only 한국)
		String enterCountry = "KR";
		memCoder.append(enterCountry); // yyMM+char+SQ+country

		// ** 사업자 유형 (사업자 번호 4-6번째)
		String currFirmId = params.get("FIRM_ID").toString();
		String enterFirmType = currFirmId.substring(3, 5); // 한국 사업자등록번호 기준
		memCoder.append(enterFirmType); // yyMM+char+SQ+country+BizType

		String memCode = memCoder.toString();
		return memCode;
	}
	
	// 쇼핑몰 유효성 체크 node //
	public HashMap<String, Object> authCheckSelect(HashMap<String, Object> params){
		return memberMapper.authCheckSelect(params);
	}
	public void authCheckInsert(HashMap<String, Object> params) {
		memberMapper.authCheckInsert(params);
	}
	public void authCheckUpdate(HashMap<String,Object> params) {
		memberMapper.authCheckUpdate(params);
	}
}