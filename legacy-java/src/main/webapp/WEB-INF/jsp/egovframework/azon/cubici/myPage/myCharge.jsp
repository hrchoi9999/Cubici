<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib  prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%> 
<!-- iamport.payment.js -->
<script type="text/javascript" src="https://cdn.iamport.kr/js/iamport.payment-1.1.8.js"></script>

<script>

$(document).ready(function() {
	
	let type = 'mb';
	let mType = '${param.Type}';
	
	if(mType != "" || mType != null || mType != undefined){
		modalOpenType(type, mType);
	}
	
	$('.mbApp').on('click', function(){
		$(location).attr('href', '/moneybank/intro/advpay');
	});
	
	// 날짜 설정
	setDday();
	
	//요금제 변경 이벤트
	$("input[name='charge']:radio").change(function(){
		setChargeData($(this).attr('id'));
	});
	
	//제휴코드 확인 버튼
	$(document).on("click", "#promo_btn", function(){
		checkPromoCode();
	})
	
	//시작날짜 설정 이벤트
	$("#fromDate").on("propertychange change keyup paste input", function() {
	    let currentVal = $(this).val();
	    setStartDate(currentVal);
	});
	
	//결제 버튼
	$(document).on("click", "#btn_payment", function(){
		if($("#amount").val() != ""){
			billingRequest();
		} else {
			alert("시작일을 설정해 주세요");
		}
	});
});

// 초기화
function init(){
	$("#fromDate").val("");
	$("#toDate").val("");
	$("#amount").val("");
	$("#vat").text("");
}

// 기준날짜, 시작일
function setDday(){
	$("#today").text("${userUsingChargeMap.standard_date}");
	let dday = "${userUsingChargeMap.dateDiff}";
	dday = (dday <= 0) ? "-" : dday + "일";
	$(".dday").text(dday);
	if(${userSBChargeMap.dateDiff} == 0){
		$(".dday1").text(dday);
	}else{
		$(".dday2").text(dday);
	}
}

//요금제 변경할 때 마다의 값	
function setChargeData(data){
	$(".chargeBox").css("display", "block");
	$("#changeCharge").val(data);
	
	// 초기화
	$("#btn_payment").text("변경신청");
	$("#chargeCon").removeClass("have");
	$("#requestKey").text("결제요청액");
	$('#btn_payment').removeClass("charge_refund charge_payment");
	init();
}

//프로모션 코드 확인
function checkPromoCode(){
	let promoCode = $("#promotionCode").val();
	if(promoCode == "") {
		alert("코드를 입력해 주세요.");
		return false;
	}
	let callUrl = "/cubici/mypage/myCharge/checkPromoCode";
	let callBackFunc = "checkPromoCodeResponse";
	let objParam = {
		promotionCode : $("#promotionCode").val(),
		chargeCode : $("input[name='charge']:checked").val()
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function checkPromoCodeResponse(result){
	let promotion = result.promotionMap;
	let resultString = promotion.resultString;
	if(result.promotionMap.result == "N" || result.promotionMap.result == "E"){
		$("#promotionCode").val("");
	} else {
		$("#promotionCode").attr("readonly",true);
		resultString += "혜택 적용을 위해 날짜를 선택해 주세요";
	}
	init();
	alert(resultString);
}

// 시작날짜 설정 , 차액 계산
function setStartDate(date){
	let callUrl = "/cubici/mypage/myCharge/calChargeAmount";
	let callBackFunc = "setStartDateResponse";
	let objParam = {
		startDate : date,
		chargeCode : $("input[name='charge']:checked").val(),
		promotionCode : $("#promotionCode").val()
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function setStartDateResponse(data){
	//초기화
	$("#btn_payment").text("변경신청");
	$("#chargeCon").removeClass("have");
	$("#requestKey").text("결제요청액");
	$('#btn_payment').removeClass("charge_refund charge_payment");
	
	let charge = data.chargeMap;
	if(charge.result == "refund"){
		$("#chargeCon").addClass("have");
		$("#requestKey").text("이용 환급액");
		$("#btn_payment").attr("disabled",false);
		$("#btn_payment").removeClass("gray-btn").addClass("blue-btn");
	} 
	$("#amount").val(comma(parseInt(charge.resultAmountVat)) + "원");
	$("#vat").text(comma(parseInt(charge.resultAmountVat-charge.resultAmount)) + "원");
	$("#toDate").val(charge.changeExpireDate);
}

// 결제요청
function billingRequest(){
	let callUrl = "/cubici/mypage/myCharge/billingRequest";
	let callBackFunc = "billingRequestResponse";
	let objParam = {
		startDate : $("#fromDate").val(),
		chargeCode : $("input[name='charge']:checked").val(),
		promotionCode : $("#promotionCode").val()
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function billingRequestResponse(result){
	let charge = result.chargeMap;
	if(charge.resultAmountVat == $("#amount").val().replace(",","").replace("원","")){
		if(charge.result == "payment"){
			paymentFunc(charge);	
		} else if (charge.result == "refund"){
			chargeRefund(charge);
		}
	} else {
		alert("비정상적인 접근입니다.");
	}
}

//변경 > 결제
function paymentFunc(data){
  	IMP.init(data.imp);
  	IMP.request_pay({
	    //pg : 'html5_inicis.MOIcubici0', 
	    pg : 'html5_inicis',     
	    pay_method : 'card',
	    merchant_uid : 'merchant_' + new Date().getTime(),
	    name : $("#changeCharge").val(),
	    amount : data.resultAmountVat, 
	    buyer_email : "${userInfo.USER_ID}",
	    buyer_name : "${userInfo.user_nm}",
	    buyer_tel : "${userInfo.user_phone}",
	    buyer_addr : "${userInfo.firm_addr}",
	    buyer_postcode : "${userInfo.firm_zip_code}",
	  	digital:true
	}, function(rsp){
		let obj = Object.assign({},rsp,data);
		paymentComplete(obj);
	}); 
}
function paymentComplete(data){
	let obj = {
		data : data,
		ex_charge_code : "${userUsingChargeMap.charge_code}",
		rest_date : "${userUsingChargeMap.dateDiff}"
	}	
	$.ajax({
		cache : false,
 		async : false,
 		type : "POST",
 		url : "/cubici/mypage/myCharge/payments/complete",
 		data : JSON.stringify(obj),
 		dataType : "JSON",
 		contentType : "application/json; charset=utf-8",
	}).done(function(result) {
		if(result.resultMap.resultMessage == "S"){
			window.location.reload();
		} else if(result.resultMap.resultMessage == "F"){
			alert("결제가 실패하였습니다. 다시 시도해 주세요.");
		}
	})
}

// 변경 > 환급
function chargeRefund(data){
	if($("#refundName").val() == "" || $("#refundBank").val() == "" || $("#refundAccount").val() == ""){
		alert("환급 계좌정보를 입력해 주세요");
		return false;
	}
	let callUrl = "/cubici/mypage/myCharge/refundRequest";
	let callBackFunc = "refundRequestResponse";
	let objParam = {
		data : data,
		name : $("#refundName").val(),
		bank : $("#refundBank").val(),
		account : $("#refundAccount").val(),
		ex_charge_code : "${userUsingChargeMap.charge_code}",
		rest_date : "${userUsingChargeMap.dateDiff}"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function refundRequestResponse(result){
	window.location.reload();
}

function getReceipt(payment_seq, amount){
	let callUrl = "/cubici/mypage/myCharge/selectReceiptId";
	let callBackFunc = "setReceipt";
	let objParam = {
		seq : payment_seq
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function setReceipt(result){
	if(result.paymentList.pg_id == ""){
		$("#contents").html(result.paymentList.resultMsg);
		modalOpen("receipt");
	} else {
		window.open("https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid="+result.paymentList.pg_id+"&noMethod=1", "", "width=420, height=600, menubar=no, status=no, toolbar=no");
	}
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
							<span class="f-color_002e6e f-s24">${userUsingChargeMap.charge_name}</span>
						</p>
					</li>
					<li class="con-02">
						<p>
							<b class="f-color-0d8cf2">사용기간</b><br />
							<span class="f-color-002e6e f-s22">${userUsingChargeMap.start_date} - ${userUsingChargeMap.expire_date}</span>
						</p>
					</li>
					<li class="con-03">
						<p>
							<b class="f-color-0d8cf2">잔여 이용가능 기간</b><br />
							<span class="f-color-002e6e f-s24"><span class="dday"></span></span>
						</p>
					</li>
				</ul>
			</div>
		</div>

		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>
					변경 요금제 선택
				</h3>
				<div class="descriptionBox">
					<div class="chargeList m-b0">
						<ul>
						<c:forEach var="chargeInfo" items="${chargeInfo}">
							<li>
								<span><b>${chargeInfo.charge_name}</b>(VAT별도)</span>
								<span><b><fmt:formatNumber value="${chargeInfo.origin_amount}"/></b></span>
								<span>원/월</span><span>${chargeInfo.charge_name}마다 요금결제</span>
								<input id="${chargeInfo.charge_name}" name="charge" type="radio" value="${chargeInfo.charge_code}">
								<label for="${chargeInfo.charge_name}"></label>
							</li>
						</c:forEach>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div class="conArticle m-45 chargeBox" style="display: none;">
			<div class="conArticle-inner">
				<h3>요금제 변경</h3>
				<c:choose>
					<c:when test="${userSBChargeMap.dateDiff!= 0}">
						<div class="txt-content content-bg">
							시작 대기 상품이 있으실 경우 추가 결제가 불가능 합니다.<br>
							서비스 변경을 위해서 "가입 해지" 페이지에서 "선입금" 상품을 해지하여 주십시오.
						</div>
					</c:when>
					<c:otherwise>
						<div class="txt-content content-bg">
							<p class="mTop-20 color-blue2">
								선택하신 요금제에 따라 아래 내역을 확인하시고 해당 금액을 결재해 주십시오.
							</p>
							<div id="chargeCon" class="deco-box w800 color-blue2">
								<div>
									<label><span class="square-txt">현재요금제</span></label>
									<input class="bg-f8f9fc" type="text" value="${userChargeList[0].chargeName}" readonly>
									<img src="/resources/img/icon/arrow02.png" alt="" />
									<label class="color-blue text-center"><b>변경요금제</b></label>
									<input id="changeCharge" class="blue-box f300" type="text" readonly>
								</div>
								<div> 
									<label><span class="square-txt">제휴 코드</span></label>
									<input id="promotionCode" class="blue-box" type="text">
									<button id="promo_btn" class="w50 h45 bg-0e57bf" type="button">확인</button>
								</div>
								<div>
									<label class="w250"><span class="square-txt">변경 요금제 시작일</span></label>
									<input id="fromDate" class="bg-f8f9fc billDatepicker" type="text" readonly>
									<label class="text-center" style="margin-left: 90px;">종료일</label>
									<input id="toDate" class="bg-f8f9fc" type="text" value="" readonly>
								</div>
								<hr>
								<div class="charge"> 
									<label><span class="square-txt" id="requestKey">결제요청액</span></label>
									<input id="amount" class="blue-box" type="text" readonly>
									<span class="f-s14">(부가가치세 : <span id="vat"></span>)</span>
								</div>
								<div class="refund-box">
									<p class="txt">
										요금제 변경을 위해서는 선택하신 변경요금제 시작일 이전에 결제가 이루어져야 합니다. <br />
										또한, 서비스 변경은 현재 이용하고 계시는 요금제 종료일 <br />
										이전 일자 이어야 변경이 가능합니다.
									</p>
									<div class="refund">
										<form>
											<label>
												<span class="square-txt">환급계좌 정보</span></label>
											<input id="refundName" type="text" placeholder="이름 입력">
											<select id="refundBank" class="w140 h45">
												<option value="">은행선택</option>
												<c:forEach var="list" items="${bankInfo}">
													<option value="${list.bank_code}">${list.bank_name}</option>
												</c:forEach>
											</select>
											
											<input id="refundAccount" type="text" value="" placeholder="계좌번호 입력">
											<!-- <button class="w50 h45 bg-0e57bf" type="button">확인</button> -->
											<p>이용료 환급액은 기준은 변경요청 요금제 금액에서 변경 이전 이용기간에<br />
												해당하는 요금제를 적용하여 계산됩니다. </p>
										</form>
									</div>
								</div>
							</div>
						<button id="btn_payment" class="blue-btn" type="button">변경신청</button>
					</div>
					</c:otherwise>
				</c:choose>
			</div>
		</div>

		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>서비스 이용내역</h3>
				<div class="money-bank-table h-wTable table-border">
					<table class="sky2 fix-header text-center">
						<tr>
							<th class="w80">회차</th>
							<th class="w200">상태</th>
							<th class="w150">요금제</th>
							<th class="w250">서비스 기간</th>
							<th class="w250">결제일자</th>
							<th class="w150">결제금액</th>
							<th class="w100">잔여일자</th>
							<th class="w170">영수증</th>
						</tr>
						<c:if test="${!empty userChargeList}">
						<c:forEach var="userChargeList" items="${userChargeList}" varStatus="status">
						<tr>
							<td class="w80"><fmt:formatNumber value="${userChargeList.ROWNUM}" pattern="0"/></td>
							<td class="w200">${userChargeList.status_name}</td>
							<td class="w150">${userChargeList.charge_name}</td>
							<td class="w250">${userChargeList.start_date} ~ ${userChargeList.expire_date}</td>
							<td class="w250">${userChargeList.payment_date}</td>
							<td class="w150"><fmt:formatNumber value="${userChargeList.payment_amount}"/>원</td>
							<td class="w100"><span class="dday${status.count}"></span></td>
							<c:choose>
							<c:when test="${fn:contains(userChargeList.charge_code, 'F')}">
							<td class="w170"><button class="t-btn2 bg-bfbfbf" type="button" >확인</button></td>
							</c:when>
							<c:otherwise>
							<td class="w170"><button onclick="getReceipt('${userChargeList.seq}','${userChargeList.payment_amount}')" class="t-btn2 bg-0e57bf" type="button" >확인</button></td>
							</c:otherwise>
							</c:choose>
						</tr>
						</c:forEach>
						</c:if>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="modal-container" id="receipt">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">진행상황 안내</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20">진행상황 안내</p>
					</div>
					<div class="m-txt-content2 f-s16 box-border-blue bg-d5e5f5 f-w-300" id="contents">
						<span class="square-txt">머니뱅크 미정산금 &nbsp; : </span> <span>1,000,000원</span>
					</div>
					<div class="button-box">
						<button class="m-big-btn2 modalClose">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/userModal.jsp" flush="true" />