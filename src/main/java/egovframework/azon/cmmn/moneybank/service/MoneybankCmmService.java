
package egovframework.azon.cmmn.moneybank.service;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import egovframework.azon.cmmn.cbc.CBCComponent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ibm.icu.util.Calendar;

import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.component.MoneybankUtils;
import egovframework.azon.cmmn.errorCode.MoneyBankErrorCode;
import egovframework.azon.cmmn.exception.MoneyBankException;
import egovframework.azon.cmmn.moneybank.mapper.MoneybankCmmMapper;
import egovframework.azon.cmmn.security.dto.AuthFilterDto;
import egovframework.azon.cmmn.security.dto.SecurityUser;
import egovframework.azon.front.cubici.mapper.CubiciCmmMapper;
import egovframework.azon.front.cubici.service.CubiciCmmService;
import egovframework.azon.front.moneybank.mapper.AdvCalcMapper;

/** 머니뱅크 공통 서비스
 * @Author Min Kee Choi
 * @Since 2021. 09. 03
*/
@Service
public class MoneybankCmmService {

	@Autowired
	CubiciCmmService cmmService;

	@Autowired
	private MoneybankCmmMapper moneybankCmmMapper;

	@Autowired
	AdvCalcMapper advCalcMapper;

	@Autowired
	CubiciCmmMapper cubiciCmmMapper;

	@Autowired
	CBCComponent cbcComponent;

	Logger logger = LoggerFactory.getLogger(MoneybankCmmService.class);

	// SEQ 생성
	public String createSEQ(HashMap<String, Object> paramsMap) {

		String userId = paramsMap.get("user_code").toString(); // 큐빅아이 회원코드
		String todayCode = paramsMap.get("todayCode").toString(); // 금일일자
		String division = paramsMap.get("division").toString(); // 머니뱅크 상품번호
		String seqStr = division + "-" + userId + todayCode;
		return seqStr;

	}

	/**
	 * 기본 날짜설정
	 * @Explain 기본 날짜 설정 함수로 금일, 어제, 한달 전 일자를 날짜 형식 혹은 코드 형식으로 구함.
	 * 			코드형식은 API 호출 파라미터나 공휴일 계산시 사용.
	 * @Return HashMap{ 금일, 어제, 어제로부터 1달전 일자를 두 가지 형식으로 각각 반환 }
	*/
	public HashMap<String, Object> getTimeInfo(){

		HashMap<String, Object> resultMap = new HashMap<String, Object>();

		// 형식
		DateTimeFormatter dtfDisplay = DateTimeFormatter.ofPattern("yyyy-MM-dd"); // 기본 날짜형식
		DateTimeFormatter dtfCode = DateTimeFormatter.ofPattern("yyyyMMdd"); // 코드형식

		// 금일 날짜
		LocalDateTime todayDateTime = LocalDateTime.now();
		resultMap.put("todayDate", todayDateTime.format(dtfDisplay));
		resultMap.put("todayCode", todayDateTime.format(dtfCode));

		// default 마지막일 (어제 일자)
		LocalDateTime yesterdayDate = todayDateTime.minusDays(1);
		resultMap.put("toDate", yesterdayDate.format(dtfDisplay));
		resultMap.put("toDateCode", yesterdayDate.format(dtfCode));

		// default 시작일 (한달 전 일자)
		LocalDateTime lastMonthDate = todayDateTime.minusDays(1).minusMonths(1);
		resultMap.put("fromDate", lastMonthDate.format(dtfDisplay));
		resultMap.put("fromDateCode", lastMonthDate.format(dtfCode));

		return resultMap;
	}

	private String addPeriod(String startDate, long period, String unit) {
		String returnDate = "";
		try {
			Calendar cal = Calendar.getInstance();
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
			Date date = df.parse(startDate);
			cal.setTime(date);
			if(unit.equals("M")) {
				cal.add(Calendar.MONTH, (int) period);
			}else if(unit.equals("W")) {
				cal.add(Calendar.DATE, (int) (period*7));
			}else if(unit.equals("DAY")) {
				cal.add(Calendar.DATE, (int) -period);
			}
			returnDate = df.format(cal.getTime());
		} catch (ParseException e) {
			logger.error(e.getMessage());
		}
		return returnDate;
	}

	public HashMap<String, Object> getMoneybankRequestInfo(HashMap<String, Object> params){
		HashMap<String, Object> resultMap = advCalcMapper.getMoneybankRequestInfo(params);
		resultMap.put("mb_demand_acc_number", cbcComponent.toDecryption(String.valueOf(resultMap.get("mb_demand_acc_number"))));
		resultMap.put("mb_main_acc_number", cbcComponent.toDecryption(String.valueOf(resultMap.get("mb_main_acc_number"))));
		return resultMap;
	}

	public String setUrlByMbStatus() {

		String url = "/moneybank/intro/advpay";

		if (MoneybankUtils.isSessionContainsAuth("ROLE_MB_EVALUATE")) {
			url = "/moneybank/advcalc/evaluate";
		} else if (MoneybankUtils.isSessionContainsAuth("ROLE_MB_CONTRACT")) {
			url = "/moneybank/advcalc/contract";
		} else if(MoneybankUtils.isSessionContainsAuth("ROLE_MB_REQUEST")) {
			url = "/moneybank/advcalc/request";
		} else if (MoneybankUtils.isSessionContainsAuth("ROLE_MB_ERROR")) {
			throw new MoneyBankException(MoneyBankErrorCode.RejectApproach);
		} else if(MoneybankUtils.isSessionContainsAuth("ROLE_MB_ADVANCE")) {
			throw new MoneyBankException(MoneyBankErrorCode.NotMBProductSelection);
		}
		return url;
	}

	public void processEnd(HashMap<String, Object> params) {
		HashMap<String, Object> principal = CubiciUtils.UserAuthentication();
		params.putAll(getMoneybankRequestInfo(principal));

		params.put("changeStatus", "31");
		advCalcMapper.modifyRequestStatusByMbStatus(params);

		HashMap<String, Object> roleMap = new HashMap<String, Object>();
		String[] addRole = {"ROLE_USER_ADVANCE"};
		String[] removeRole = {"ROLE_USER_REQUEST", "ROLE_USER_EVALUATE", "ROLE_USER_CONTRACT"};
		roleMap.put("add", addRole);
		roleMap.put("remove", removeRole);
		updateAuth(roleMap);
	}

	@Autowired
	AuthenticationManager authenticationManager;

	public void updateAuth(HashMap<String, Object> authMap) {
		SecurityUser securityUser = (SecurityUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		String userCode = securityUser.getUser_code();
		HashMap<String, Object> userSessionTypePw = cubiciCmmMapper.UserSessionTypePw(userCode);
		String password = String.valueOf(userSessionTypePw.get("user_pw"));

		List<GrantedAuthority> updatedAuthorities  = setAuthorities(authMap);

		AuthFilterDto authFilterDto = new AuthFilterDto(securityUser.getIdSave(), securityUser.getUser_id(), securityUser.getDivision(), updatedAuthorities);

		Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authFilterDto, password, updatedAuthorities));
		SecurityContextHolder.getContext().setAuthentication(authentication);
	}

	private List<GrantedAuthority> setAuthorities(HashMap<String, Object> authMap){
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		List<GrantedAuthority> updatedAuthorities = new ArrayList<>(auth.getAuthorities());

		String[] addRole = (String[]) authMap.get("addRole");
		String[] removeRole = (String[]) authMap.get("removeRole");

		for(int i=0; i<addRole.length; i++) {
			String role = addRole[i];
			if(!MoneybankUtils.isSessionContainsAuth(role)) {
				updatedAuthorities.add(new SimpleGrantedAuthority(role));
			}
		}

		for(int i=0; i<removeRole.length; i++) {
			String role = removeRole[i];
			if(MoneybankUtils.isSessionContainsAuth(role)) {
				updatedAuthorities.remove(new SimpleGrantedAuthority(role));
			}
		}

		return updatedAuthorities;
	}
}
