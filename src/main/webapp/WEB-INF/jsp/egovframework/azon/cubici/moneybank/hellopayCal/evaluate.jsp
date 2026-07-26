<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>


<script>
$('#overList').mCustomScrollbar({
	theme: "dark-3"
});

$(document).ready(function(){
	
	// info
	setPageInfo();
	
	// 계약 페이지로 이동
	$("#approvalEval").on("click", function(){
		approvalEval();
	});
	//소개페이지로 이동
	$("#refusalEval").on("click", function(){
		refusalEval();
	});
	
});

function approvalEval(){
	modalInfo("이용조건에 동의해주셔서 감사합니다. 동의 후, 3일 이내 계약이 진행되지 않으실 경우, 자동적으로 신청하신 서비스가 취소됩니다. ");
	$("#confirm").on("click", function(){
		updateRequestStatus("Approval");
	});
}

function refusalEval(){
	modalInfo("원하시는 이용조건을 제시하지 못해서 죄송합니다. 향후 다시 한번 신청해주시면 감사하겠습니다. 큐빅아이");
	$("#confirm").on("click", function(){
		updateRequestStatus("Reject");
	});
}

function updateRequestStatus(status){
	let callUrl = "/moneybank/advcalc/evaluate/termsCheck";
	let callBackFunc = "updateRequestStatusResponse";
	let objParam = {
		status : status,
		mbid : "${mbankInfo.mbid}"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function updateRequestStatusResponse(result){
	if(result.status){
		window.location.href = "/moneybank/advcalc/contract";
	} else if(result.description){
		modalReload(result.description);
	} else {
		modalReload('관리자에게 문의해 주세요.');
	}
}

// 기본 표시 정보
function setPageInfo(){
	$(".stepIconList span").each(function(i, item){
		if (i < ${mbankInfo.mb_status}) $(item).addClass("pass");
	});
}
	
</script>

<!-- 컨텐츠 -->
<div class="contentGrid">
	<div class="inner wide">
		
		<!-- TAB 영역 -->
		<div class="s-tab">
			<ul>
				<li><a>서비스 신청</a></li>
				<li class="active"><a>검토 및 심사</a></li>
				<li><a>계약 체결</a></li>
			</ul>
		</div>
		
		<!-- 안내 & 심사 상태 -->
		<div class="conArticle">
			<div class="descriptionBox">
				<p class="f-w-300 lh-200 text-center">
					제출하신 사업정보 및 신청서류를 기반으로 자료를 취합하고 쇼핑몰 정산계좌 변경을 확인하고 있습니다. <br />
					가능한 신속하게 심사를 진행하여 이용가능하신 최대 선지급 금액과 조건을 알려드리도록 하겠습니다.<br />
					통상 심사는 신청완료 후 영업일 기준 24시간 이내 이루어지고 있습니다. 잠시만 기다려 주십시오.
				</p>
			</div>
		</div>
		<div class="conArticle">
			<div class="conArticle-inner">
				<h3>심사진행상태</h3>
				<div class="conImgBox p-h70">
					<div class="stepIconList color-blue">
						<span class="s-con-7">신청 자격 확인 완료</span>
						<span class="s-con-8">신청정보 취합 완료</span>
						<span class="s-con-10">프리즘평가 완료</span>
						<span class="s-con-11">종합심사 완료</span>
					</div>
				</div>
			</div>
		</div>
		
		<!-- 신청정보 -->
		<div class="conArticle">
			<div class="conArticle-inner">
				
				<!-- 기본정보 -->
				<h3>기본정보</h3>
				<div class="money-bank-table color-g box-border-blue">
					<table class="h-f-blue header-w210">
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b> 회사명</b>
							</th>
							<td class="border-r-none" id="firmNm">${info.firm_nm}</td>
							<th class="bg-sky">
								<b>대표자</b>
							</th>
							<td class="border-r-none" id="userNm">${info.username}</td>
							<th class="bg-sky">
								<b>사업자번호</b>
							</th>
							<td class="border-r-none" id="firmId">${info.firm_id}</td>
						</tr>						
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b>큐빅아이 ID</b>
							</th>
							<td class="border-r-none" id="userId">${info.user_id}</td>
							<th class="bg-sky">
								<b>가입일자</b>
							</th>
							<td class="border-r-none" id="regDate">${info.reg_date}</td>
							<th class="bg-sky">
								<b>서비스 신청일</b>
							</th>
							<td class="border-r-none" id="mbankRegDate">${mbankInfo.mb_request_date}</td>
						</tr>						
					    <tr>
							<th class="bg-sky">
								<b> 정산 계좌(요구불 통장)</b>
							</th>
							<td colspan="2" class="border-r-none" id="demandBankInfo">${mbankInfo.mb_demand_acc_bank_code} &nbsp; ${mbankInfo.mb_demand_acc_number} (${mbankInfo.mb_demand_acc_holder})</td>
							<th class="bg-sky">
								<b> 주거래 계좌</b>
							</th>
							<td colspan="2" class="border-r-none" id="mainBankInfo">${mbankInfo.mb_main_acc_bank_code} &nbsp; ${mbankInfo.mb_main_acc_number} (${mbankInfo.mb_main_acc_holder})</td>
						</tr>
				 	</table>
				</div>
				
				<!-- 쇼핑몰 정보 -->
				<div class="money-bank-table table-border">
					<table>
						<thead class="bg-blue">
						<tr>
						<th>선지급 대상 쇼핑몰</th>
						</tr>
						</thead>
						<tbody class="align-center">
							<tr>
								<td class="span-shop" id="reuqest_shop">
								<c:forEach var="list" items="${shopList}">
								<label for="shop_${list.mb_request_shop}"><img src="/resources/rudicks/img/partner-color/${list.mb_request_shop}-con.png" alt=""></label>
								</c:forEach>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				
			</div>
		</div>

		<c:if test="${mbankInfo.mb_status eq '04'}">
		<!-- 심사결과 -->
		<div class="conArticle">
			<div class="conArticle-inner">
				<h3>심사결과</h3>
				<small class="ruby-right"><span>기준일자</span>${standard_date}</small>
				<div class="money-bank-table color-g box-border-blue">
					<table class="text-left h-f-blue header-w260">
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b>이용 수수료율</b>
							</th>
							<td class="border-r-none bg-sky">
								<span class="color-blue" id="feeRate">${mbankInfo.fee_rate} %</span>
							</td>
							<th class="bg-sky">
								<b>머니뱅크 지급율</b>
							</th>
							<td class="border-r-none">
								<span class="color-blue" id="paymentRate">${mbankInfo.payment_rate} %</span>
							</td>
						</tr>
						<tr>
							<th class="bg-sky">
								<b>주문건당 매출인정 한도</b>
							</th>
							<td class="border-r-none">
								<span class="color-blue" id="salesLimit"><fmt:formatNumber value="${mbankInfo.sales_limit_per_case*1000}"/> 원</span>
							</td>
							<th class="bg-sky">
								<b>계약기간</b>
							</th>
							<td class="border-r-none">
								<span class="color-blue" id="contractPeriod">1년</span>
							</td>
						</tr>
						<tr>
							<td colspan="4"> (금액 송금에 따라 발생하는 비용은 이용자 부담입니다.) </td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		<!-- 선지급 서비스 안내 -->
		<div class="conArticle">
			<div class="conArticle-inner">
				<h3>머니플러스 서비스 안내</h3>
				<div class="txt-content content-bg  bg-icon con-03 m-b50">
					<ul id="overList" class="barList over-list color-blue font-15 f-w-300 lh-170">
						<li><b>머니플러스</b> 서비스는 운영하고 계시는 쇼핑몰의 매출/정산 정보를 한 눈에 파악하실 수 있는 통합 정보 서비스와 선정산 서비스가 함께 제공되는 서비스입니다.</li>
						<li><b>“이용 수수료율”</b>이란 머니플러스 이용 수수료를 의미하는 것으로 쇼핑몰 정산입금 금액 대비 수수료로 칭구하는 금액의 비율을 의미합니다. </li>
						<li><b>“머니뱅크 지급률”</b>은 배송완료된 쇼핑몰 결제 금액을 기준으로 선지급되는 금액의 비율을 말합니다. <br>
							즉, 전체 쇼핑몰 미정산금액이 10백만원일 경우, 머니뱅크 지급율이 80%라면 8백만원을 미리 입금해 드립니다. </li>
						<li><b>“주문건당 매출인정 한도”</b>는 각 쇼핑몰의 개별 주문금액 중 머니플러스 선정산 금액 산정에 포함되지 않는 예외적인 판매금액을 의미합니다.<br>
							즉, 매출인정 한도가 1백만원 미만일 경우 개별 주문금액이 1백만원 이상인 경우 해당 주문금액은 머니플러스 선정산 산정에는 포함되지 않고,<br>
							쇼핑몰 정산입금 시 전액 주거래 계좌로 입금됩니다. </li>
						<li>머니플러스의 <b>“계약기간”</b>은 1년입니다. 계약기간 중 머니플러스 적용 쇼핑몰의 추가는 언제든지 가능하며 쇼핑몰의 적용해제의 경우<br>
							이미 지급된 선정산 금액의 상환이 완료된 이후 정산계좌의 변경이 가능합니다. </li>
						<li>머니플러스 대상 쇼핑몰의 정산금액이 지정된 정산계좌에 입금되면, 선정산 원금과 이용수수료를 상환하고 그 잔액을 주거래통장에 입금해드립니다.<br>
							(금액 송금에 따른 비용은 이용자 부담)</li>
						<li>머니플러스 서비스 이용기간 비정상적인 활동이 발견되면 서비스 이용이 중지되거나 종료될 수 있습니다.<br>
							또한 이용 쇼핑몰에 대한 타 서비스와의 중복 이용 등 정상적인 서비스 이용이 의심되는 상황이 예상되는 경우 서비스 이용이 제한될 수 있습니다.
						</li>
					</ul>
				</div>
				<!-- 심사결과 동의 버튼 -->
				<div class="button-box">
					<a class="big-gray-btn" type="button" style="cursor: pointer;" id="refusalEval">동의하지 않습니다</a>
					<a class="big-blue-btn2" type="button" style="cursor: pointer;" id="approvalEval">이용조건 동의</a>
				</div>
			</div>
		</div>
		</c:if>
	</div>
</div>
<!-- //컨텐츠 -->