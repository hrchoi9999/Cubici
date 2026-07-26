<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!-- iamport.payment.js -->
<script type="text/javascript" src="https://cdn.iamport.kr/js/iamport.payment-1.1.8.js"></script>

<script>
var chargeCode = "";
var amount = "";

$(document).ready(function() {
	setDday();
	
	$("#btn_payment").click(function() {
		changeRequest();
	});
	
	//요금제 변경 이벤트
	$("input[name='charge']:radio").change(function(){
		let num = $("input[name='charge']:radio").index(this);		
		let callUrl = "/checkChargeInfo";
		let callBackFunc = "setDataResponse";
		let objParam = {
			code : num
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
});

function setDday(){
	let expireDate = "${userChargeInfo.expire_date}"; // 종료일
	let exTempDday = expireDate.split("-");	
	let exday = new Date(exTempDday[0],(exTempDday[1]-1),exTempDday[2]);
	let today = new Date();
	let result = Math.ceil((exday.getTime() - today.getTime()) / (1000*60*60*24));
	let now = today.getFullYear() + "년 " + (today.getMonth()+1) + "월 " + today.getDate() + "일";
	
	$("#today").text(now);
	$(".dday").text(result);
}

function setDataResponse(data){
	let charge = data.chargeMap;
	let today = new Date();
	let fromDate = today.getFullYear() + "년 " + (today.getMonth()+1) + "월 " + today.getDate() + "일";
	let toDate = today.getFullYear() + "년 " + (today.getMonth()+ charge.sub_period + 1) + "월 " + (today.getDate()-1) + "일";
	
	amount = charge.amount;
	chargeCode = charge.charge_code;
	
	$("#changeCharge").val(charge.sub_period + "개월");
	$("#amount").val(comma(charge.amount) + "원");
	$("#vat").text(comma(charge.amount/11) + "원");
	$("#fromDate").val(fromDate);
	$("#toDate").val(toDate);
	
	$("#btn_payment").attr("disabled",false);
	$("#btn_payment").removeClass("gray-btn").addClass("blue-btn");	
}

function changeRequest(){
	//class가 btn_payment인 태그를 선택했을 때 작동한다.
  	IMP.init('imp39125235');
  	//결제시 전달되는 정보
  	IMP.request_pay({
	    pg : 'html5_inicis', 
	    pay_method : 'card',
	    merchant_uid : 'merchant_' + new Date().getTime(),
	    name : $("#changeCharge").val() /*상품명*/,
	    amount : amount /*상품 가격*/, 
	    buyer_email : "${userInfo.USER_ID}",
	    buyer_name : "${userInfo.USER_NM}",
	    buyer_tel : "${userInfo.USER_PHONE}",
	    buyer_addr : "${userInfo.FIRM_ADDR}",
	    buyer_postcode : "${userInfo.FIRM_ZIP_CODE}"
	  //confirm_url : 데이터 검증
	  //m_redirect_url : '{모바일에서 결제 완료 후 리디렉션 될 URL}' 
	}, function(rsp) {
		var result = '';
	    if ( rsp.success ) {
	        var msg = '결제가 완료되었습니다.';
	        msg += '고유ID : ' + rsp.imp_uid;
	        msg += '상점 거래ID : ' + rsp.merchant_uid;
	        msg += '결제 금액 : ' + rsp.paid_amount;
	        msg += '카드 승인번호 : ' + rsp.apply_num;
	        result ='0';
	    } else {
	        var msg = '결제에 실패하였습니다.';
	        msg += '에러내용 : ' + rsp.error_msg;
	        result ='1';
	    }
	    if(result=='0') {
	    	location.href="/";
	    }
	    alert(msg);
	});
}

</script>
<div class="contentGrid">
	<div class="inner wide">
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>
					현재 요금제
					<small class="ruby-right f-s13"><span>기준일자</span><span id="today"></span></small>
				</h3>
				<ul class="my-box">
					<li class="con-01">
						<p>
							<b class="f-color-0d8cf2">요금제</b><br />
							<span class="f-color_002e6e f-s24">${userChargeInfo.charge_name}</span>
						</p>
					</li>
					<li class="con-02">
						<p>
							<b class="f-color-0d8cf2">사용기간</b><br />
							<span class="f-color-002e6e f-s20">${userChargeInfo.start_date}<br>~<br>${userChargeInfo.expire_date}</span>
						</p>
					</li>
					<li class="con-03">
						<p>
							<b class="f-color-0d8cf2">잔여 이용가능 기간</b><br />
							<span class="f-color-002e6e f-s24"><span class="dday"></span>일</span>
						</p>
					</li>
				</ul>
			</div>
		</div>

		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>
					요금제 선택<span class="f-w-300">(요금제변경)</span>
				</h3>
				<div class="descriptionBox">
					<div class="chargeList m-b0">
						<ul>
							<li>
								<span><b>1개월</b>(VAT별도)</span>
								<span><b>29,000</b></span>
								<span>원/월</span><span>매월 이용요금 결제</span>
								<input id='charge1' name='charge' type='radio'>
								<label for='charge1'></label>
							</li>
							<li>
								<span><b>3개월</b>(VAT별도)</span>
								<span><b>27,000</b></span>
								<span>원/월</span><span>3개월마다 이용요금 결제</span>
								<input id='charge2' name='charge' type='radio'>
								<label for='charge2'></label>
							</li>
							<li>
								<span><b>6개월</b>(VAT별도)</span>
								<span><b>25,000</b></span>
								<span>원/월</span><span>6개월마다 이용요금 결제</span>
								<input id='charge3' name='charge' type='radio'>
								<label for='charge3'></label>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>요금제 변경</h3>
				<div class="txt-content content-bg">
					<p class="mTop-20 color-blue2">
						선택하신 요금제에 따라 아래 내역을 확인하시고 해당 금액을 결재해 주십시오.
					</p>
					<div class="deco-box w800 color-blue2">
						<div>
							<label><span class="square-txt">현재요금제</span></label>
							<input class="bg-f8f9fc" type="text" value="${userChargeInfo.charge_name}" readonly>
							<img src="/resources/img/icon/arrow02.png" alt="" />
							<label class="color-blue text-center"><b>변경요금제</b></label>
							<input id="changeCharge" class="blue-box f300" type="text" readonly>
						</div>
						<div>
							<label><span class="square-txt">결제요청액</span></label>
							<input id="amount" class="blue-box" type="text" readonly>
							<span class="f-s14">(부가가치세 <span id="vat"></span> 포함)</span>
						</div>
						<div>
							<label><span class="square-txt">변경 요금제 시작일</span></label>
							<input id="fromDate" class="bg-f8f9fc startDatepicker" type="text" readonly>
							<label class="text-center" style="margin-left: 90px;">종료일</label>
							<input id="toDate" class="bg-f8f9fc" type="text" value="" readonly>
						</div>
						<!--환급이 있을 경우 show 없을 경우에는 none-->
						<div class="refund">
							<form>
								<label><span class="square-txt">환급계좌 정보</span></label>
								<input type="text" value="" placeholder="이름 입력">
								<select class="w140 h45">
									<option>은행선택</option>
									<option>A 은행</option>
								</select> <input type="text" value="" placeholder="계좌번호 입력">
								<button class="w50 h45 bg-0e57bf" type="button">확인</button>

							</form>
						</div>
					</div>
					<p class="m-t30 text-center color-blue3">서비스 유료이용 기간 중 서비스 해지가
						필요하신 경우, 마이페이지를 통해 언제든지 요금제 변경 또는 서비스 해지가 가능합니다.</p>
					<button id="btn_payment" class="gray-btn" type="button" disabled>변경신청</button>
				</div>
			</div>
		</div>

		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>서비스 이용내역</h3>
				<div class="money-bank-table m-fix-table table-border">
					<table class="sky2 fix-header text-center">
						<tr>
							<th class="w80">회차</th>
							<th class="w170">구분</th>
							<th class="w170">이용료</th>
							<th class="w220">서비스 기간</th>
							<th class="w170">결제일자</th>
							<th class="w170">결제금액</th>
							<th class="w170">잔여일자</th>
							<th class="w200">영수증</th>
						</tr>
						<tr>
							<td class="w80">1</td>
							<td class="w170">22년 1월</td>
							<td class="w170">${userChargeInfo.charge_name}</td>
							<td class="w220">${userChargeInfo.start_date} ~ ${userChargeInfo.expire_date}</td>
							<td class="w170">${userChargeInfo.payment_date}</td>
							<td class="w170">${userChargeInfo.amount}원</td>
							<td class="w170"><span class="dday"></span>일</td>
							<td class="w200"><button class="t-btn2 bg-0e57bf" type="button">조회</button></td>
						</tr>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>