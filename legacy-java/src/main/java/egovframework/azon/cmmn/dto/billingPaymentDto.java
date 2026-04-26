package egovframework.azon.cmmn.dto;

import org.antlr.grammar.v3.ANTLRParser.defaultNodeOption_return;

public class billingPaymentDto {

	private String chargeCode;
	private String payMethod;
	private String cardCode;
	
	public billingPaymentDto(String chargeCode, String payMethod, String cardCode) {
		setChargeCode(chargeCode);
		setPayMethod(payMethod);
		setCardCode(cardCode);
	}

	public String getChargeCode() {
		return chargeCode;
	}
	
	public void setChargeCode(String param) {
		switch(param) {
		case "B0101": //1개월
			this.chargeCode = "A";
			break;
		case "B0301": //3개월
			this.chargeCode = "B";
			break;
		case "B0601": //6개월
			this.chargeCode = "C";
			break;
		case "B1201": //12개월
			this.chargeCode = "D";
			break;
		case "withdraw": // 해지
			this.chargeCode = "Z";
			break;
		default :
			this.chargeCode = "F";
		}	
	}

	public String getPayMethod() {
		return payMethod;
	}
	
	public void setPayMethod(String param) {
		switch(param){
		case "samsung": //삼성페이
			this.payMethod = "A";
			break;
		case "card": //신용카드
			this.payMethod = "B";
			break;
		case "trans": //계좌이체
			this.payMethod = "C";
			break;
		case "vbank": //가상계좌
			this.payMethod = "D";
			break;
		case "phone": //휴대폰
			this.payMethod = "E";
			break;
		case "cultureland": //문화상품권
			this.payMethod = "F";
			break;
		case "smartculture": //스마트문상
			this.payMethod = "G";
			break;
		case "booknlife": //도서문화상품권
			this.payMethod = "H";
			break;
		case "happymoney": //해피머니
			this.payMethod = "I";
			break;
		case "point": //포인트
			this.payMethod = "J";
			break;
		case "ssgpay": //SSGPAY
			this.payMethod = "K";
			break;
		case "lpay": //LAPY
			this.payMethod = "L";
			break;
		case "payco": //페이코
			this.payMethod = "M";
			break;
		case "kakaopay": //카카오페이
			this.payMethod = "N";
			break; 
		case "tosspay": //토스
			this.payMethod = "O";
			break;
		case "naverpay": //네이버페이
			this.payMethod = "P";
			break;
		case "refund": //차액환급
			this.payMethod = "R";
			break;
		default: //차액환급
			this.payMethod = "Z";
			break;
		}
	}
	
	public String getCardCode() {
		return cardCode;
	}
	
	public void setCardCode(String param) {
		switch(param) {
		case "361": //BC카드
			this.cardCode = "A";
			break;
		case "364": //광주카드
			this.cardCode = "B";
			break;
		case "365": //삼성카드
			this.cardCode = "C";
			break;
		case "366": //신한카드
			this.cardCode = "D";
			break;
		case "367": //현대카드
			this.cardCode = "E";
			break;
		case "368": //롯데카드
			this.cardCode = "F";
			break;
		case "369": //수협카드
			this.cardCode = "G";
			break;
		case "370": //씨티카드
			this.cardCode = "H";
			break;
		case "371": //NH카드
			this.cardCode = "I";
			break;
		case "372": //전북카드
			this.cardCode = "J";
			break;
		case "373": //제주카드
			this.cardCode = "K";
			break;
		case "374": //하나SK카드
			this.cardCode = "L";
			break;
		case "381": //KB국민카드
			this.cardCode = "M";
			break;
		case "041": //우리카드
			this.cardCode = "N";
			break;
		case "071": //우체국
			this.cardCode = "O";
			break;
		case "refund": //차액환급
			this.cardCode = "R";
			break;
		default: //카드X
			this.cardCode = "Z";
			break;
		}
	}
}
