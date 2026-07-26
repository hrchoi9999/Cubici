package egovframework.azon.cmmn.dto;

import lombok.Getter;

@Getter
public class SmsDto {
	private final String[] smsWelcomeArr = {"userNm","authCode"};
	private final String[] smsRegiArr = {"userNm", "userId"};
	private final String[] smsAuthArr = {"authCode"};
	private final String[] smsB2bAccept = {"userNm"};
	private final String[] smsNewContract = {"userId", "mbid", "toDate", "fromDate"};
	
	private final String[] mailAuthCode = {"userNm", "authCode"};
	private final String[] mailWelcome = {"userNm", "company", "toUser", "phoneNum"};
	private final String[] mailShopInfo = {"userNm", "RNUM", "SHOP_NM", "SHOP_ID", "content"};
}
