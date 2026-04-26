package egovframework.azon.front.cubici.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ibm.icu.util.Calendar;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;

import egovframework.azon.cmmn.component.CubiciUtils;
import egovframework.azon.cmmn.dto.billingPaymentDto;
import egovframework.azon.front.cubici.mapper.MemberMapper;
import egovframework.azon.front.cubici.mapper.BillingMapper;

@Service
public class BillingService {	

	Logger logger = LoggerFactory.getLogger(BillingService.class);

	@Autowired
	MemberMapper memberMapper;
	
	@Autowired
	BillingMapper billingMapper;
	
	@Autowired
	CubiciCmmService cubiciCmmService;

	/* 아임포트 결제모듈 */
	private IamportClient api;
	
	public BillingService() {
    	// REST API 키와 REST API secret 를 아래처럼 순서대로 입력한다.
		this.api = new IamportClient("6177024437810988","4275d12609a970a86b8a4b2d342e964626c7c967ffd4e9766b0612a1d386d6c10687f01daea255c9");
	}
	
	public ArrayList<HashMap<String, Object>> selectChargeList() {
		return 	billingMapper.selectChargeList();
	}
	
	public ArrayList<HashMap<String, Object>> selectUserChargeInfo(HashMap<String, Object> params) {
		return billingMapper.selectUserChargeInfo(params);
	}
	
	public HashMap<String, Object> selectUsingChargeInfo(HashMap<String, Object> params){
		params.put("status", "using");
		return selectChargeInfo(params);
	}
	
	public HashMap<String, Object> selectSBChargeInfo(HashMap<String, Object> params){
		params.put("status", "standBy");
		return selectChargeInfo(params);
	}
	
	private HashMap<String, Object> selectChargeInfo(HashMap<String, Object> params){
		HashMap<String, Object> chargeMap = billingMapper.selectChargeInfo(params);
		if(chargeMap == null){
			chargeMap = new HashMap<String, Object>();
			chargeMap.put("standard_date", new SimpleDateFormat("yyyy년 MM월 dd일").format(new Date()));
			chargeMap.put("charge_name", "-");
			chargeMap.put("start_date", "");
			chargeMap.put("expire_date", "");
			chargeMap.put("dateDiff", "0");
			chargeMap.put("promo_name", "-");
			chargeMap.put("amount", "-");
		}
		return chargeMap;
	}
	
	// 계산 setdate
	public HashMap<String, Object> preCalAmount(HashMap<String, Object> params) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		if(String.valueOf(params.get("chargeCode")).contains("withdraw")) {
			params.put("promotionCode", String.valueOf(selectUsingChargeInfo(params).get("promotion_code")));
		}
		HashMap<String, Object> chargeMap = calChargeAmount(params);
		resultMap.putAll(params);
		resultMap.put("result", String.valueOf(chargeMap.get("result")));
		resultMap.put("resultAmount", String.valueOf(chargeMap.get("resultAmount")));
		resultMap.put("resultAmountVat", String.valueOf(chargeMap.get("resultAmountVat")));
		resultMap.put("changeExpireDate", String.valueOf(chargeMap.get("changeExpireDate"))); //변경요금제 종료일
		return resultMap;
	}
	
	// 계산 billing
	public HashMap<String, Object> billingCalAmount(HashMap<String, Object> params) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		HashMap<String, Object> chargeMap = calChargeAmount(params);
		resultMap.putAll(params);
		resultMap.putAll(chargeMap);
		resultMap.put("imp", "imp39125235"); //아임포트 큐빅아이 상점고유번호
		return resultMap;
	}
	
	// 요금제 차액 계산
	private HashMap<String, Object> calChargeAmount(HashMap<String, Object> params) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		try {

			params.putAll(getExChargeInfo(params));	// 이전결제 내역
			params.putAll(dormantDiscount(params)); // 회원 혜택 적용
			params.putAll(promotionDiscount(params)); // 프로모션 혜택 적용
			resultMap.putAll(calAmountAndDate(params)); // 계산

			params.put("resultAmountIncludeVat", resultMap.get("resultAmountVat"));

			String result = setUserStatus(params); // 상태 체크

			resultMap.put("result", result);
			resultMap.put("changeExpireDate", params.get("changeExpireDate").toString()); //변경요금제 종료일
			resultMap.put("changeAmount", params.get("changeCalAmount").toString()); //결제 기준 금액
			resultMap.put("user_seq", params.get("seq").toString());
			resultMap.put("imp", "imp39125235"); //아임포트 큐빅아이 상점고유번호
			
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		return resultMap;
	}
	
	private HashMap<String, Object> getExChargeInfo(HashMap<String, Object> params){
		HashMap<String, Object> exChargeInfo = new HashMap<String, Object>();
		if(billingMapper.selectUserChargeInfo(params).isEmpty()) {
			exChargeInfo = selectChargeInfo(params);
			exChargeInfo.put("payment_base_amount", "0");
			exChargeInfo.put("startDate", "-");
			exChargeInfo.put("seq", "-");
		} else {
			if(String.valueOf(selectSBChargeInfo(params).get("dateDiff")).equals("0")) {
				exChargeInfo = billingMapper.selectUserChargeInfo(params).get(0);
			}
			else exChargeInfo = billingMapper.selectUserChargeInfo(params).get(1); // 시작대기 있는 경우
		}

		// 해지신청 이후 재결제시 이전금액 리셋
		String usertype = params.get("user_type") .toString();
		if(usertype.equals("03") || usertype.equals("97")) {
			exChargeInfo.put("payment_base_amount", 0); 
		}
		
		return exChargeInfo;
	}

	private HashMap<String, Object> dormantDiscount(HashMap<String, Object> params){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String newExpireDate = "";
		// 회원 혜택 ( 휴면 후 첫 유료결제 )
		long paymentCount = billingMapper.selectUserChargeInfo(params).size();
		if(params.get("user_type").toString().equals("04") && paymentCount == 1) {
			params.put("promotionCode", "22NCBCI01");
			int dormantBenefit = Integer.parseInt(billingMapper.selectPromotionInfo(params).get("free_period").toString());
			String dormantBenefitUnit = billingMapper.selectPromotionInfo(params).get("free_period_unit").toString();
			
			newExpireDate = addPeriod(params.get("startDate").toString(), dormantBenefit, dormantBenefitUnit);
		}
		resultMap.put("changeExpireDate", newExpireDate);
		return resultMap;
	}

	private HashMap<String, Object> promotionDiscount(HashMap<String, Object> params) {

		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		HashMap<String, Object> newChargeMap = billingMapper.checkChargeInfo(params); //변경할 요금제 정보
		HashMap<String, Object> promoInfoMap = selectPromotionInfo(params); // 프로모션 코드 확인
		
		double changeCalAmount = 0;
		String changeExpireDate =  new SimpleDateFormat("yyyy-MM-dd").format(new Date());;
		String startDate = String.valueOf(params.get("changeExpireDate")).equals("") ? String.valueOf(params.get("startDate")) : String.valueOf(params.get("changeExpireDate")); // 시작일 : 회원혜택 받은 경우 그 종료일부터
		
		// 해지X
		if (params.get("chargeCode").toString().contains("withdraw") == false) {
			String newExpireDate = addPeriod(startDate, Long.parseLong(newChargeMap.get("sub_period").toString()), String.valueOf(newChargeMap.get("sub_unit"))); //기준종료일
			long newChargeAmount = Long.parseLong(newChargeMap.get("origin_amount").toString()) * Long.parseLong(newChargeMap.get("sub_period").toString()); // 기준요금
			
			
			if(String.valueOf(promoInfoMap.get("result")).equals("Y")) {
				double discountRate = 0;
				long discountAmount = 0;
				long freePeriod = 0;
				String freePeriodUnit = "";
				
				discountRate = String.valueOf(promoInfoMap.get("discount_rate")).equals("") ? 0 : Long.parseLong(String.valueOf(promoInfoMap.get("discount_rate"))); // 할인율
				discountAmount = String.valueOf(promoInfoMap.get("discount_amount")).equals("") ? 0 : Long.parseLong(String.valueOf(promoInfoMap.get("discount_amount"))); // 할인금액
				freePeriod = String.valueOf(promoInfoMap.get("free_period")).equals("") ? 0 : Long.parseLong(String.valueOf(promoInfoMap.get("free_period"))); // 추가기간
				freePeriodUnit = String.valueOf(promoInfoMap.get("free_period_unit")).equals("") ? "" : String.valueOf(promoInfoMap.get("free_period_unit")); // 기간단위

				changeCalAmount = (newChargeAmount * (1-(discountRate/100))) - discountAmount;
				changeExpireDate = addPeriod(newExpireDate, freePeriod, freePeriodUnit);
			} else {
				changeCalAmount = newChargeAmount;
				changeExpireDate = newExpireDate;
			}
			changeExpireDate = addPeriod(changeExpireDate, 1, "DAY"); // 하루 빼기  
		} else { // 해지 O
			changeExpireDate = startDate;
		}
		
		resultMap.put("changeCalAmount", (int) Math.ceil(changeCalAmount));
		resultMap.put("changeExpireDate", changeExpireDate);
		return resultMap;
	}
	
	private HashMap<String, Object> calAmountAndDate(HashMap<String, Object> params){
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		double exPaymentAmount = Long.parseLong(params.get("payment_base_amount").toString()); //할인적용 후 금액
		String exStartDate = params.get("start_date").toString();
		String exExpireDate = params.get("expire_date").toString();
		String newStartDate = params.get("startDate").toString();
		
		// 1. 계약기간. 실사용기간
		long baseDay = calDate(exExpireDate, exStartDate)+1; // 계약일수
		long actualDay = 0;
		if (calDate(exExpireDate, newStartDate) < 0) { // 선결제
			actualDay = calDate(exExpireDate, exStartDate)+1;
		} else if (calDate(exExpireDate, newStartDate) == 0) { // 당일변경
			actualDay = calDate(exExpireDate, exStartDate);
		} else if (calDate(exExpireDate, newStartDate) > 0) { // 변경
			actualDay = calDate(newStartDate, exStartDate);
		}
		// 2. ex실결제금액 / 계약기간 = ex실이용금액/일
		double exPaymentPerDay = exPaymentAmount / baseDay;
		// 3. ex실이용금액/일 X 실 사용일 수 = 기존 사용금액
		double useAmount = exPaymentPerDay * actualDay;
		// 4. 차액 계산 새로운요금제금액-(기존결제기준금액-실사용금액)
		int ex_balance = (int) Math.ceil(exPaymentAmount - useAmount);
		
		long resultAmount = Math.round(Double.parseDouble(params.get("changeCalAmount").toString()) - ex_balance);
		long resultAmountIncludeVat = Math.round(resultAmount * 1.1);

		resultMap.put("useAmount", useAmount);
		resultMap.put("resultAmount", resultAmount);
		resultMap.put("resultAmountVat", resultAmountIncludeVat);
		resultMap.put("usePeriod", actualDay); // 실제 사용 일수
		resultMap.put("ex_balance", ex_balance*1.1);
		
		return resultMap;
	}
	
	private String setUserStatus(HashMap<String, Object> params){
		
		// 결제 OR 환급
		String stauts = (Integer.parseInt(params.get("resultAmountIncludeVat").toString()) >= 0) ? "payment" : "refund";
		
		// 해지
		boolean withdraw = params.get("chargeCode").toString().contains("withdraw");
		if(withdraw) {
			HashMap<String, Object> exChargeInfo = billingMapper.selectUserChargeInfo(params).get(0);
			long paymentDiff = calDate(new SimpleDateFormat("yyyy-MM-dd").format(new Date()), exChargeInfo.get("payment_date").toString());
			long expireDiff = calDate(new SimpleDateFormat("yyyy-MM-dd").format(new Date()), params.get("startDate").toString());
			String pgId = String.valueOf(exChargeInfo.get("pg_id"));
			if(paymentDiff == 0 && expireDiff == 0 && withdraw && !pgId.equals("null")) {
				stauts = "SDC"; // 당일 해지, 카드 취소 (환급금액)
			} else if (paymentDiff > 0 && expireDiff == 0 && withdraw && !pgId.equals("null")) {
				stauts = "PDC"; // +1 해지, 입금 확인 후 카드 취소 (입금할 금액)
			} else if (paymentDiff >= 0 && expireDiff == 0 && withdraw && pgId.equals("null")) { 
				stauts = "ACC"; // 당일 or +1 해지, 계좌 환급 (환급금액)
			}
		}
		return stauts;
	}

	
	// 프로모션 코드 확인
	public HashMap<String, Object> selectPromotionInfo(HashMap<String, Object> params) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String resultString = "";
		String result = "N";
		if(params.containsKey("promotionCode")) {
			HashMap<String, Object> promotionMap = billingMapper.selectPromotionInfo(params);
			if(promotionMap == null) {
				resultString = "일치하는 코드가 없습니다";
			} else if(promoTargetCheck(params)) {
				// 추후 제공id, 거래건수, 상품건수 추가
				result = "Y";
				resultMap.putAll(params);
				resultMap.putAll(promotionMap);
			} else {
				resultString = "사용할 수 없는 코드";
			}
		} else {
			result = "E";
			resultString = "코드값 없음";
		}
		resultMap.put("result", result);
		resultMap.put("resultString", resultString);
		return resultMap;
	}

	private boolean promoTargetCheck(HashMap<String, Object> params) {
		HashMap<String, Object> memberInfo = memberMapper.selectUserInfo(params);
		HashMap<String, Object> promotionMap = billingMapper.selectPromotionInfo(params);		
		int paymentCount = billingMapper.selectUserChargeInfo(params).size();
		
		String user_type = memberInfo.get("user_type").toString();
		String partner_code = String.valueOf(memberInfo.get("partner_code"));
		String target = String.valueOf(promotionMap.get("promo_target"));
		boolean result = false;
		
		if (target.equals("N")) {
			result = (((user_type.equals("01")||user_type.equals("02")) && paymentCount <= 1) || billingMapper.selectUserChargeInfo(params).isEmpty());
		} else if (target.equals("C")) {
			result = (user_type.equals("01") || user_type.equals("02"));
		} else if (target.equals("M")) {
			result = (user_type.equals("02"));
		} else if (target.equals("L")) {
			result = user_type.equals("97");
		} else if (target.equals("A")) {
			result = (partner_code != "null");
		} else if (target.equals("O")) {
			result = false;
		}
		return result;
	}
	
	public void refundRequest(HashMap<String, Object> params) {
		String userType = "";
		try {
			HashMap<String, Object> paramsMap = CubiciUtils.ObjectToHashMap(params.get("data"));
			params.putAll(paramsMap);
			
			// 결제정보 저장
			HashMap<String, Object> resultMap = insertPaymentsData(params);
			HashMap<String, Object> userMap = billingMapper.selectUserChargeInfo(params).get(0);
			params.put("seq", String.valueOf(userMap.get("seq")));
			params.put("payment_seq", String.valueOf(resultMap.get("payment_seq")));
			billingMapper.refundRequest(params);
			userType = updateUserType(params);
			cubiciCmmService.UserSessionTypeChange(userType);
		} catch (ParseException e) {
			logger.error(e.getMessage());
		}
	}
	
	// 결제 검증
	public HashMap<String, Object> paymentVerification(HashMap<String, Object> params) {
		HashMap<String, Object> paramsMap = CubiciUtils.ObjectToHashMap(params.get("data"));
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String resultMessage = "";
		if(paramsMap.get("success").toString().equals("false")) {
			resultMessage = "F";
		} else {
			try {
				String imp_uid = paramsMap.get("imp_uid").toString();
				IamportResponse<Payment> pay_response = api.paymentByImpUid(imp_uid);
				BigDecimal paid_amount = BigDecimal.valueOf(Integer.parseInt(paramsMap.get("paid_amount").toString()));
				BigDecimal pay_response_amount = pay_response.getResponse().getAmount();
				String status = pay_response.getResponse().getStatus();
				
				if(pay_response_amount.compareTo(paid_amount) == 0 && status.equals("paid")) { //검증 성공
					paramsMap.put("cardCode", pay_response.getResponse().getCardCode());
					paramsMap.put("cardType", pay_response.getResponse().getCardType());
					paramsMap.put("paid_at", new SimpleDateFormat("yy-MM-dd HH:mm:ss").format(pay_response.getResponse().getPaidAt()));
					paramsMap.put("ex_charge_code", params.get("ex_charge_code").toString());
					paramsMap.put("rest_date", params.get("rest_date").toString());
					paramsMap.put("pay_response_amount", pay_response_amount);
					logger.trace("[ 결제검증 성공 ] [ user_code : " + paramsMap.get("user_code").toString() + " / imp_uid : " + paramsMap.get("imp_uid").toString() + " ] ");
				} else { // 검증 실패 > 취소
					cancelPayment(imp_uid, pay_response_amount);
					paramsMap.put(imp_uid, status);
					paramsMap.put("result", "cancel");
				}
			} catch (IamportResponseException | IOException e) {
				logger.trace("[ 결제검증 에러 ] [ " + e.getMessage() + " / imp_uid : " + paramsMap.get("imp_uid").toString() + " ] ");
			} finally {
				// 데이터 넣기 ( 결제 완료 / 취소 )
				resultMessage = String.valueOf(insertPaymentsData(paramsMap).get("resultMessage"));
			}
		}
		resultMap.put("resultMessage", resultMessage);
		return resultMap;
	}
	
	// 결제내역 insert
	public HashMap<String, Object> insertPaymentsData(HashMap<String, Object> params) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		String payment_status = String.valueOf(params.get("result"));
		String payment_seq = "";
		String resultMessage = "S";
		String status = "U-CC";
		String today = new SimpleDateFormat("yy-MM-dd HH:mm:ss").format(new Date());
		if(payment_status.equals("cancel")) {
			resultMessage = "F";
		} else {
			try {
				if(payment_status.equals("signUp")){ // 회원가입
					params.putAll(freeChargeData(params));
				} else if (payment_status.equals("refund")) { // 환급일 때
					status = "U-CR";
					params.put("pay_method", payment_status);
					params.put("cardCode", payment_status);
					params.put("paid_at", today);
				} else if (payment_status.equals("withdraw")) { // 해지
					params.put("paid_at", today);
					status = "RR";
				} else if (payment_status.equals("payment")) {
					String exExpireDate = selectUsingChargeInfo(params).containsKey("expire_date") ? String.valueOf(selectUsingChargeInfo(params).get("expire_date")) : today;
					// 이전 만료일 현재 이용중인 요금제 없으면 오늘 날짜로 설정
					String startDate = String.valueOf(params.get("startDate"));
					String paidAt = "20"+String.valueOf(params.get("paid_at"));
					if(calDate(startDate, paidAt) > 0 && calDate(startDate, exExpireDate) > 0) {
						status = "SB";
					}
				}
				
				payment_seq = makeSEQ(params);
				params.put("status", status);				
				params.put("payment_seq", payment_seq);
				
				if(!status.equals("SB") && !payment_status.equals("signUp")) {
					cubiciCmmService.UserSessionTypeChange(updateUserType(params));
				}
				
				billingMapper.insertPaymentsData(params);
				billingMapper.updatePaymentsData(params);
			} catch (Exception e1) { // 수정
				if(payment_status.equals("payment")) {
					String imp_uid = params.get("imp_uid").toString();
					BigDecimal response_amount = BigDecimal.valueOf(Integer.parseInt(String.valueOf(params.get("pay_response_amount"))));
					cancelPayment(imp_uid, response_amount);
					logger.trace("[ ERROR ] [ insertPaymentsData / 결제 취소 완료 : " + e1.getMessage() + " / imp_uid : " + params.get("imp_uid").toString() + " ] ");
				}
				resultMessage = "F";
			}
		}
		resultMap.put("resultMessage", resultMessage);
		resultMap.put("payment_seq", payment_seq);
		return resultMap;
	}

	public HashMap<String, Object> freeChargeData(HashMap<String, Object> params){
		HashMap<String, Object> freeChargeInfo = billingMapper.freeChargeInfo(params);
		int sub_period = Integer.parseInt(String.valueOf(freeChargeInfo.get("sub_period")));
		String sub_unit = String.valueOf(freeChargeInfo.get("sub_unit"));
		
		String startDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
		String tempDate = addPeriod(startDate, sub_period, sub_unit);
		String expireDate = addPeriod(tempDate, 1, "DAY");

		params.put("chargeCode", String.valueOf(freeChargeInfo.get("charge_code"))); // 무료요금제
		params.put("startDate", startDate);
		params.put("changeExpireDate", expireDate);
		params.put("resultAmountVat", String.valueOf(freeChargeInfo.get("origin_amount")));
		params.put("resultAmount", String.valueOf(freeChargeInfo.get("origin_amount")));
		params.put("changeAmount", String.valueOf(freeChargeInfo.get("origin_amount")));
		params.put("paid_at", new SimpleDateFormat("yy-MM-dd HH:mm:ss").format(new Date()));		
		return params;
	}
	
	private String makeSEQ(HashMap<String, Object> params) {
		String today = String.valueOf(params.get("today")).equals("null") ? new SimpleDateFormat("yyMMdd").format(new Date()) : String.valueOf(params.get(""));
		String chargeCode = String.valueOf(params.get("chargeCode")).equals("null") ? "F" : String.valueOf(params.get("chargeCode")); // 무료
		String payMethod = String.valueOf(params.get("pay_method")).equals("null") ? "Z" : String.valueOf(params.get("pay_method")); // 무료
		String cardCode = String.valueOf(params.get("cardCode")).equals("null") ? "Z" : String.valueOf(params.get("cardCode")); // 무료
		String promotionCodeCk = String.valueOf(params.get("promotionCode")).equals("") ? "N" : "Y"; // 무료
		
		billingPaymentDto bpcd = new billingPaymentDto(chargeCode, payMethod, cardCode);
		chargeCode = bpcd.getChargeCode();
		payMethod = bpcd.getPayMethod();
		cardCode = bpcd.getCardCode();
		
		HashMap<String, Object> countMap = billingMapper.selectPayementDetailCount();
		long count = Long.parseLong(countMap.get("COUNT").toString()) + 1;
		String countNum = String.format("%04d", count);
		
		return today + chargeCode + payMethod + cardCode + promotionCodeCk + countNum;
	}

	// 영수증 조회
	public HashMap<String, Object> selectPaymentDetail(HashMap<String, Object> params) {
		ArrayList<HashMap<String, Object>> paymentList = billingMapper.selectPaymentDetail(params);
		HashMap<String, Object> returnMap = new HashMap<String, Object>();
		String resultMsg = "";
		String pg_id = "";
		for(int i=0; i<paymentList.size(); i++) {
			HashMap<String, Object> paymentMap = paymentList.get(i);
			if(String.valueOf(paymentMap.get("pg_id")).equals("null")){
				resultMsg += "<span class='square-txt'>환급 신청일 &nbsp; : </span><span>" + String.valueOf(paymentMap.get("change_date")) + "</span><br>";
				resultMsg += "<span class='square-txt'>요금제 &nbsp; : </span><span>" + String.valueOf(paymentMap.get("charge_name")) + "</span><br>";
				switch(String.valueOf(paymentMap.get("status"))) {
				case "CR":
					resultMsg += "<span class='square-txt'>진행 상태 &nbsp; : </span><span>차액환급 처리중</span><br>";
					break;
				case "CC":
					resultMsg += "<span class='square-txt'>환급 입금일 &nbsp; : </span><span>" + String.valueOf(paymentMap.get("refund_date")) + "</span><br>";
					break;
				case "RR":
					resultMsg += "<span class='square-txt'>진행 상태 &nbsp; : </span><span>입금 대기</span><br>";
					break;
				case "RD":
					resultMsg += "<span class='square-txt'>진행 상태 &nbsp; : </span><span>입금 확인 / 카드결제 취소 예정</span><br>";
					break;
				case "RC":
					resultMsg += "<span class='square-txt'>해지 완료일 &nbsp; : </span><span>" + String.valueOf(paymentMap.get("refund_date")) + "</span><br>";
					break;
				}
			} else {
				pg_id = String.valueOf(paymentMap.get("pg_id"));
			}
		}
		returnMap.put("resultMsg", resultMsg);
		returnMap.put("pg_id", pg_id);
		
		return returnMap;
	}
	
	// 머니뱅크 사용목록 (임시)
	public ArrayList<HashMap<String, Object>> selectMBList(HashMap<String, Object> params) {
		return billingMapper.selectMBList(params);
	}

	// 머니뱅크 잔액 (임시)
	public HashMap<String, Object> selectMbBalance(HashMap<String, Object> params) throws ParseException {
		HashMap<String, Object> MBBalanceMap = billingMapper.selectMbBalance(params);
		String type = String.valueOf(params.get("type"));
		String modal = "withdrawFail";
		int balance = Integer.parseInt(MBBalanceMap.get("balance").toString());
		if(type.equals("BILL")) {
			if (balance <= 0) {
				 modal = "withdrawRequest";
			}
		} else if (type.equals("MB")) {
			if (balance > 0) {
				modal = "repayPartial";
				//머니뱅크 서비스 이름, 총 이용금액, 잔액
			}
		} else if (type.equals("ALL")) {
			if (balance > 0) {
				modal = "repayAll";
				//머니뱅크 서비스 이름, 총 이용금액, 잔액
			}
		}
	
		MBBalanceMap.put("modal", modal);
		MBBalanceMap.put("balance", balance);
		
		return MBBalanceMap;
	}
	
	// 취소신청
	public String requestCancel(HashMap<String, Object> params) {
		HashMap<String, Object> chargeInfoMap = CubiciUtils.ObjectToHashMap(billingMapper.selectUserChargeInfo(params).get(0));
		params.putAll(chargeInfoMap);
		params.put("ex_charge_code", chargeInfoMap.get("charge_code").toString());
		params.put("user_seq", chargeInfoMap.get("seq").toString());
		
		String status = "RR";

		String request_type = String.valueOf(params.get("request_type"));
		if(request_type.equals("SDC")) {
			// cancelPayment(chargeInfoMap.get("imp_uid").toString(), BigDecimal.valueOf(Integer.parseInt(chargeInfoMap.get("payment_amount").toString())));
			params.put("refund_card", Integer.parseInt(chargeInfoMap.get("payment_amount").toString()));
		} 
		params.put("refund_status", "R");
		params.put("status", status);
		params.put("chargeCode", "withdraw");
		params.put("request_type", request_type);
		
		HashMap<String, Object> calAmountMap = calChargeAmount(params);
		params.putAll(calAmountMap);
		params.put("result", "withdraw");
		
		String userType = "";
		try {
			HashMap<String, Object> resultMap = insertPaymentsData(params);
			params.put("payment_seq", String.valueOf(resultMap.get("payment_seq")));
			billingMapper.insertRequestCancel(params);
			userType = request_type.equals("SDC") ? updateUserType(params) : "";
		} catch (ParseException e) {
			logger.error(e.getMessage());
		}
		return userType;
	}

	// 선결제 취소  -- 데이터 삭제 하는거 맞는지 여쭤보기..
	public HashMap<String, Object> cancelSBCharge(HashMap<String, Object> params) {
		ArrayList<HashMap<String, Object>> paymentList = billingMapper.selectPaymentDetail(params);
		String imp_uid = paymentList.get(0).get("imp_uid").toString();
		BigDecimal amount = BigDecimal.valueOf(Integer.parseInt(paymentList.get(0).get("amount").toString()));
		HashMap<String, Object> cancel_response = cancelPayment(imp_uid, amount);
		if(cancel_response.get("resultCode").toString().equals("0")) {
			// 1. refund 저장
			HashMap<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("user_seq", params.get("seq").toString());
			resultMap.put("refund_status", "C");
			resultMap.put("resultAmountVat", Integer.parseInt(paymentList.get(0).get("amount").toString()));
			// 2. detail 상태 update
			resultMap.put("result", "withdraw");
			resultMap.put("startDate", new SimpleDateFormat("yy-MM-dd HH:mm:ss").format(new Date()));
			resultMap.put("status", "SB");
			resultMap.put("rest_date", 0);
			resultMap.put("ex_balance", 0);			
			
			billingMapper.insertRequestCancel(resultMap);
			billingMapper.updatePaymentsData(resultMap);
		}
		return cancel_response;
	}
	
	// 결제 취소 api 연동
	public HashMap<String, Object> cancelPayment(String imp_uid, BigDecimal pay_response_amount) {
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		//import 취소 api
		CancelData cancel_data = new CancelData(imp_uid, true);
		cancel_data.setChecksum(pay_response_amount); // checksum 으로 검증 추가
		IamportResponse<Payment> cancel_response = new IamportResponse<Payment>();
		
		try {
			cancel_response = api.cancelPaymentByImpUid(cancel_data);
			logger.trace("[ 결제취소 API 성공 ] [ imp_uid : " + imp_uid + " ] ");
		} catch (IamportResponseException | IOException e) {
			logger.trace("[ 결제취소 API 실패 ] [ " + e.getMessage() + " / imp_uid : " + imp_uid + " ] ");
		}

		resultMap.put("resultCode", String.valueOf(cancel_response.getCode()));
		resultMap.put("result", String.valueOf(cancel_response.getMessage()));
		
		return resultMap;
		
	}	
	
	private String updateUserType(HashMap<String, Object> params) throws ParseException {
		String userType = "";
		String result = params.get("result").toString();
		String balance = selectMbBalance(params).get("balance").toString();
		if (balance.equals("0") && result.equals("withdraw")) {
			userType = "97";
		} else if (!balance.equals("0") && result.equals("withdraw")) {
			userType = "03";
		} else if ((balance.equals("0") && !result.equals("withdraw")) || result.equals("signUp")) {
			userType = "01";
		} else if (!balance.equals("0") && !result.equals("withdraw")) {
			userType = "02";
		}
		params.put("user_type", userType);
		billingMapper.updateUserType(params);

		return userType;
	}
	
	private long calDate(String day1, String day2) {
		Date toDate;
		Date fromDate;
		long datediff = 0;
		try {
			toDate = new SimpleDateFormat("yyyy-MM-dd").parse(day1);
			fromDate =  new SimpleDateFormat("yyyy-MM-dd").parse(day2);
			datediff = (toDate.getTime() - fromDate.getTime()) / (24*60*60*1000);		
		} catch (ParseException e) {
			logger.error(e.getMessage());
		}
		return datediff;
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
}
