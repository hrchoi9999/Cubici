<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
$(document).ready(function() {
	
	//  빌링 서비스 해지
	$("#withdrawBilling").on("click", function() {
		moneybankBalanceCheck("BILL");
	});
	
	// 선입금 취소
	$("#cancelSBCharge").on("click", function(){
		cancelSBCharge("${userSBChargeMap.seq}");
	});
	
	// 빌링 해지 모달 시작날짜 설정 이벤트
	$("#calcelDate").on("propertychange change keyup paste input", function() {
	    let currentVal = $(this).val();
	    setStartDate(currentVal);
	});
	
	// 머니뱅크 서비스 해지
	$(".withdrawMB").on("click", function() {
		moneybankBalanceCheck("MB");
	});
	
	// 전체 서비스 해지
	$("#withdrawAll").on("click", function() {
		moneybankBalanceCheck("ALL");
	});

	$(document).on('click', "#signUpBtn", function(){
		modalOpen('intro-new-admin');
	});
	
});

function moneybankBalanceCheck(data){
	let callUrl = "/cubici/mypage/withdraw/moneybankCheck";
	let callBackFunc = "moneybankCheckResponse";
	let objParam = {
		user_code : "${userInfo.user_code}",
		type : data
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function moneybankCheckResponse(result){
	modalOpen(result.MbBalanceMap.modal);
}

function cancelSBCharge(data){
	let callUrl = "/cubici/mypage/withdraw/cancelSBCharge";
	let callBackFunc = "cancelSBChargeResponse";
	let objParam = {
		seq : data
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function cancelSBChargeResponse(result){
	let resultCode = result.cancel.resultCode;
	if(resultCode == 0){
		window.location.reload();	
	} else {
		modalInfo(result.cancel.result);
	}
}

function setStartDate(date){
	let callUrl = "/cubici/mypage/myCharge/calChargeAmount";
	let callBackFunc = "setStartDateResponse";
	let objParam = {
		user_code : "${userInfo.user_code}",
		startDate : date,
		chargeCode : window.location.pathname,
		promotionCode : "",
		user : "${userInfo.user_type}"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function setStartDateResponse(result){
	$("#cancelBtn").attr("onclick","requestCancel('" + result.chargeMap.result + "');");	
	$(".refundAmount").val(comma(result.chargeMap.resultAmountVat)+" 원");
}

function requestCancel(request_type){
	if($("#refundName").val() == "" || $("#refundBank").val() == "" || $("#refundAccount").val() == ""){
		alert("환급 계좌정보를 입력해 주세요");
		return false;
	}
	
	let callUrl = "/cubici/mypage/withdraw/requestCancel";
	let callBackFunc = "requestCancelResponse";
	let objParam = {
		startDate : $("#calcelDate").val(),
		rest_date : "${userUsingChargeMap.dateDiff}",
		name : $("#refundName").val(),
		bank : $("#refundBank").val(),
		account : $("#refundAccount").val(),
		request_type : request_type
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function requestCancelResponse(result){
	window.location.reload();
 }

	
</script>

<div class="contentGrid m-45">
	<div class="inner wide">
		<div class="page-title">
			<h2>서비스 해지</h2>
		</div>
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<div class="money-bank-table color-g box-border-blue">
					<table class="text-left h-f-blue header-w150">
						<tr class="border-bottom-g ">
							<th class="bg-sky">
								<span class="f-color-111">아이디</span>
							</th>
							<td class="w510 border-r-none">
								${userInfo.user_id}
							</td>
							<th class="bg-sky">
								<span class="f-color-111"> 대표자명</span>
							</th>
							<td class="w510 border-r-none">
								${userInfo.user_nm}
							</td>
						</tr>
						<tr class="border-bottom-g">
							
							<th class="bg-sky">
								<span class="f-color-111">회사명</span>
							</th>
							<td class="w510 border-r-none">
								${userInfo.firm_nm}
							</td>
							<th class="bg-sky">
								<span class="f-color-111">사업자등록번호</span>
							</th>
							<td class="border-r-none f-w-300">
								${userInfo.firm_id}
							</td>
						</tr>
						<tr>
							<th class="bg-sky">
								<span class="f-color-111">주소</span>
							</th>
							<td class="w510 border-r-none">
								${userInfo.firm_addr}
							</td>
							<th class="bg-sky">
								<span class="f-color-111">전화번호</span>
							</th>
							<td class="w510 border-r-none f-w-300">
								${userInfo.user_phone}
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		<div class="page-title">
			<h2>이용정보</h2>
		</div>
		<div class="conArticle m-45">
			<div class="conArticle-inner m-b30">
				<h3>서비스 이용내역</h3>
				<div class="money-bank-table table-border2">
					<table>
						<thead>
							<tr>
								<th class="w260">구분</th>
								<th class="w260">서비스</th>
								<th class="w260">적용 쿠폰</th>
								<th class="w260">결제요금(VAT별도)</th>
								<th class="w260">서비스 시작일</th>
								<th class="w260">종료일자</th>
								<th class="w260">서비스 해지</th>
							</tr>
						</thead>
						<tbody class="align-center ">
							<tr>
								<td>이용중</td>
								<td>${userUsingChargeMap.charge_name}</td>
								<td>${userUsingChargeMap.promo_name}</td>
								<td>${userUsingChargeMap.amount}</td>
								<td>${userUsingChargeMap.start_date}</td>
								<c:choose>
								<c:when test="${userInfo.user_type eq '01' || userInfo.user_type eq '02'}">
								<td></td>
								<td>
									<button id="withdrawBilling" type="button" class="t-m-btn2 bg-0e57bf">서비스 해지</button>
								</td>
								</c:when>
								<c:otherwise>
								<td>
									<c:choose>
									<c:when test="${userSBChargeMap.status eq 'RR'}">처리중입니다</c:when>
									<c:when test="${userSBChargeMap.status eq 'RC'}">${userUsingChargeMap.expire_date}</c:when>
									</c:choose>							
								</td>
								<td>
									<button type="button" class="t-m-btn2 bg-bfbfbf">서비스 해지</button>
								</td>
								</c:otherwise>
								</c:choose>
							</tr>
							<tr>
								<td>선입금</td>
								<td>${userSBChargeMap.charge_name}</td>
								<td>${userSBChargeMap.promo_name}</td>
								<td>${userSBChargeMap.amount}</td>
								<td>${userSBChargeMap.start_date}</td>
								<td>${userSBChargeMap.expire_date}</td>
								
								<td>
								<c:choose>
								<c:when test="${userSBChargeMap.charge_name ne '-'}">
									<button id="cancelSBCharge" type="button" class="t-m-btn2 bg-0e57bf">선입금 취소</button>
								</c:when>
								<c:otherwise>
									<button type="button" class="t-m-btn2 bg-bfbfbf">선입금 취소</button>
								</c:otherwise>
								</c:choose>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="conArticle m-45">
			<div class="conArticle-inner m-b30">
				<h3>머니뱅크 이용현황</h3>
				<div class="money-bank-table table-border2">
					<table>
						<thead>
							<tr>
								<th class="w200">이용 서비스</th>
								<th class="w200">시작일자</th>
								<th class="w200">만기일자</th>
								<th class="w200">상환 잔액</th>
								<th class="w200">상태</th>
								<th class="w200">해지 신청</th>
							</tr>
						</thead>
						<tbody class="align-center ">
							<tr>
								<td>테스트 상품</td>
								<td>2022.04.01</td>
								<td>2022.07.01</td>
								<td>2,000,000</td>
								<td>이용중</td>
								<td>
									<button type="button" class="t-m-btn2 bg-0e57bf withdrawMB">서비스 해지</button>
								</td>
							</tr>							
							<c:forEach var="MBList" items="${userMBList}">
							<tr>
								<td>${MBList.name}</td>
								<td>${MBList.mb_contract_date}</td>
								<td>${MBList.mb_contract_expire_date}</td>
								<td>${MBList.balance}</td>
								<td>이용중</td>
								<td>
									<c:if test="${MBList.balance le 0}"><button type="button" class="t-m-btn2 bg-bfbfbf">서비스 해지</button></c:if>
									<c:if test="${MBList.balance gt 0}"><button type="button" class="t-m-btn2 bg-0e57bf withdrawMB">서비스 해지</button></c:if>
								</td>
							</tr>
							</c:forEach>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 모달 -->
<!--서비스 해지 불가-->
<div class="modal-container pass" id="withdrawFail">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">서비스 해지</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20"><b>${userInfo.user_nm} 회원님</b><span>,</span></p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							기회원님께서는 아래와 같은 이유로 해지진행이 어려운 것으로 판단됩니다.
							아래 내용을 확인하시고 이후 진행 부탁드립니다.
						</p>
						<div class="m-txt-content2 f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<span class="square-txt">머니뱅크 미정산금 &nbsp; : </span> <span>1,000,000원</span>
						</div>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							머니뱅크 서비스 해지를 위해서는 머니뱅크 <b onclick="location.href='/moneybank/advPay/current'">“전체서비스 해지”</b>를 클릭해
							주십시오. 보다 자세한 내용은 Q&A 게시판을 통해 문의하시면 보다 자세하게
							안내드리도록 하겠습니다.<br />
							감사합니다.
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn modalClose">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--서비스 해지 신청-->
<div class="modal-container resetClose" id="withdrawRequest">
	<div class="modal-wrapper m-w720 bg-fff">
		<header>
			<h2 class="my">서비스 해지</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="m-b10 color-0e57bf f-s20"><b>${userInfo.user_nm} 회원님</b><span>,</span></p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							원하시는 해지일자와 해지사유를 선택해 주시면 서비스 해지가 진행됩니다. <br>
							향후 더 좋은 서비스로 다시 뵐 수 있기를 희망합니다.
						</p>
						<ul class="deco-box">
							<li>
								<label class="square-txt">해지일자 지정 </label>
								<input id="calcelDate" class="bg-f8f9fc billDatepicker" type="text" readonly>
							</li>
							<li>
								<label class="square-txt">해지사유 </label>
								<select>
									<option>해지사유 선택</option>
									<option>이용 안함 </option>
									<option>타서비스 이용</option>
								</select>
							</li>
							<li>
								<label class="square-txt">해지 환급금</label>
								<input class="refundAmount" type="text" readOnly/></input>
							</li>
							<li>
								<label class="square-txt">환급계좌 정보</label> 
							</li>
							<div>
								<input id="refundName" type="text" placeholder="이름 입력">
								<select id="refundBank" class="w140 h45">
									<option value="">은행선택</option>
									<option value="SH">신한은행</option>
									<option value="KB">국민은행</option>
									<option value="KU">기업은행</option>
									<option value="WR">우리은행</option>
									<option value="NH">농협은행</option>
								</select>
								<input id="refundAccount" type="text" placeholder="계좌번호 입력">
							</div>
						</ul>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							(예상 반환금액은 결제하신 총액에서 현재까지 이용하신 금액을 제외하여 산출된 금액입니다.)<br>
							서비스 해지에 따른 절차 및 반환금액에 대한 자세한 문의는 Q&A를 사용해 주시기 바랍니다. <br/>
							그동안 큐빅아이와 함께해 주셔서 대단히 감사합니다. <br/>
							큐빅아이
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn2 modalClose">취소</button>
						<button class="m-big-btn" id="cancelBtn">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>		
<!-- 머니뱅크 해지 신청 -->
<div class="modal-container pass" id="repayPartial">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">머니플러스 해지 신청</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<h2 class="my">이용조건</h2>
						<div class="m-txt-content2 f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<p><span class="square-txt f-w-500 w150">이용 수수료율<br> (쇼핑몰 정산금액 대비) </span> :<span class="f-w-300">${mbankInfo.fee_rate} %</span></p>
							<p><span class="square-txt f-w-500 w150">머니뱅크 지급율<br> (결제금액 대비 지급율)  </span>: <span class="f-w-300">${mbankInfo.payment_rate} %</span></p>
							<p><span class="square-txt f-w-500 w150">최대 주문건당<br> 매출인정 한도 </span>:<span class="f-w-300">${mbankInfo.sales_limit_per_case}원</span></p>
							<p><span class="square-txt f-w-500 w150">계약기간 </span>:<span class="f-w-300">${mbankInfo.mb_contract_date}</span></p>
						</div>
						<h2 class="my">서비스 중지</h2>
						<div class="m-txt-content2 f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<p class="txt-box color-0e57bf f-s15 f-w-300">
								서비스 해지를 신청하시면 해지신청 일자 다음날인 [기준일자 + 1일 일자 표시]을 기준으로 머니플러스 선정산 지급이 중지됩니다.
								이용원금 및 수수료 등의 비용이 완납된 이후 서비스가 종료되며 해당 쇼핑몰 정산계좌는 서비스 종료이후 변경이 가능합니다.<br>
							</p>
							<p><b>예상 상환입금 총액 : ${MbBalanceMap.balance} </p>
							<p class="txt-box color-0e57bf f-s15 f-w-300">
								머니뱅크 이용원금은 조회하신 시



								해지 신청하면 다시 되돌릴 수 없습니다. 그래도 해지 신청하시겠습니까?
							</p>
						</div>
					</div>
					<div class="button-box" style="justify-content: center;">
						<button class="m-big-btn modalClose">취소</button>
						<button class="m-big-btn modalClose">서비스 해지 신청</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>