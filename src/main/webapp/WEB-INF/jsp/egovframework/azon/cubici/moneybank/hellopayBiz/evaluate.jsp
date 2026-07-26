<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>


<script>
$('#overList').mCustomScrollbar({
	theme: "dark-3"
});

$(document).ready(function(){
	
	// status
	let reqStatus = "${mbankInfo.request_status}";
	
	// info
	setPageInfo();
	
	// 쇼핑몰 정보
	displayShop();
	
	// 계약 페이지로 이동
	$("#approvalEval").on("click", function(){
		
		if(reqStatus == "02"){
			
			modalInfo("심사 결과를 수락하시겠습니까?");
			
			$("#confirm").on("click", function(){
				location.href="/moneybank/hellopayBiz/contract";
			})
			
		}else{
			modalInfo("아직 심사 진행 중입니다.");
		}
		
	});
	
})

// 기본 표시 정보
function setPageInfo(){
	
	// Status
	let currStatus = "${mbankInfo.request_status}";
	$("#status"+currStatus).addClass("hover");
	
	// 상품정보
	let reqAmountVal = "";
	let reqIntRateVal = "";
	let reqFeeRateVal = "";
	
	if(currStatus == "00" || currStatus == "01" || currStatus == "05"){
		reqAmountVal = "[심사 중]";
		reqIntRateVal = "[심사 중]";
		reqFeeRateVal = "[심사 중]";
	}else{
		reqAmountVal = comma("${mbankInfo.req_limit_amount}");
		reqIntRateVal = "${mbankInfo.interest_rate}"+"% / 일";
		reqFeeRateVal = "${mbankInfo.fee_rate}"+"% / 일";
	}
	$("#possibleAmount").text(reqAmountVal);
	$("#possibleIntRate").text(reqIntRateVal);
	$("#possibleFeeRate").text(reqFeeRateVal);
	
}

// 쇼핑몰 정보
function displayShop(){
	
	let b2bMallName = '${mbankInfo.wholesale_mall_nm}'
	let b2bMallId = '${mbankInfo.wholesale_mall_id}'
	$("#b2bMallName").text(b2bMallName);
	$("#b2bMallId").text(b2bMallId);
	
	let shopHtml = "";
	let currShops = ('${mbankInfo.request_shop}').split(",");
	
	currShops.forEach( shop => {
		
		shopHtml += '<span class="color-blue2">';
		
		switch(shop){
			case '1':
				shopHtml += '<img src="/resources/rudicks/img/partner-color/interpark-con.png"></span>';
				break;
			case '2':
				shopHtml += '<img src="/resources/rudicks/img/partner-color/gmarket-con.png">지마켓</span>';
				break;
			case '3':
				shopHtml += '<img src="/resources/rudicks/img/partner-color/auction-con.png">옥션</span>';
				break;
			case '4':
				shopHtml += '<img src="/resources/rudicks/img/partner-color/11st-con.png">11번가</span>';
				break;
			case '11':
				shopHtml += '<img src="/resources/rudicks/img/partner-color/coupang-con.png"></span>';
				break;
			case '14':
				shopHtml += '<img src="/resources/rudicks/img/partner-color/naver-con.png">네이버</span>';
				break;
		}
	})
	$("#shopList").html(shopHtml);
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
					제출하신 사업정보 및 신청서류를 기반으로 자료를 취합하고 쇼핑몰 결제계좌 변경을 확인하고 있습니다. <br />
					가능한 신속하게 심사를 진행하여 이용가능하신 최대 선지급 금액과 조건을 알려드리도록 하겠습니다. 통상 심사는 신청완료 후 24시간애내 이루어지고 있습니다. 잠시만 기다려
					주십시오.
				</p>
			</div>
		</div>
		<div class="conArticle">
			<div class="conArticle-inner">
				<h3>심사진행상태</h3>
				<div class="conImgBox p-h70">
					<div class="stepIconList color-blue">
						<span class="s-con-7" id="status00">서류제출</span>
						<span class="s-con-8" id="status01">신청정보 취합</span>
						<span class="s-con-10" id="status03">프리즘평가</span>
						<span class="s-con-11" id="status02">종합심사</span>
					</div>
				</div>
			</div>
		</div>
		
		<!-- 심사결과 -->
		<div class="conArticle">
			<div class="conArticle-inner">
				<h3>심사결과</h3>
				<small class="ruby-right"><span>기준일자</span>${standard_date}</small>
				<div class="money-bank-table color-g box-border-blue">
					<table class="text-left h-f-blue header-w260">
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b>구매자금 선지급 이용가능 금액</b>
							</th>
							<td class="border-r-none bg-sky">
								<span class="color-blue" id="possibleAmount"></span>
							</td>
							<th colspan="3" class="bg-sky"></th>
						</tr>
						<tr>
							<th class="bg-sky">
								<b>대출이자율</b>
							</th>
							<td class="border-r-none">
								<span class="color-blue" id="possibleIntRate"></span>
							</td>
							<th class="bg-sky">
								<b> 이용수수료</b>
							</th>
							<td class="border-r-none">
								<span class="color-blue" id="possibleFeeRate"></span>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		
		<!-- 신청정보 -->
		<div class="conArticle">
			<div class="conArticle-inner">
				
				<!-- 기본정보 -->
				<h3>신청기본정보</h3>
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
							<td class="border-r-none" id="userNm">${info.user_nm}</td>
							<th class="bg-sky">
								사업자번호
							</th>
							<td id="firmId">${info.firm_id}</td>
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
								<b>선지급 신청일자</b>
							</th>
							<td id="mbankRegDate">${mbankInfo.moneybank_request_date}</td>
						</tr>
						
					    <tr>
							<th class="bg-sky">
								<b> 요구불 계좌</b>
							</th>
							<td class="border-r-none" id="demandBankInfo">${mbankInfo.demand_acc_bank_nm} &nbsp; ${mbankInfo.demand_acc_number} &nbsp; ${mbankInfo.demand_acc_holder}</td>
							<th class="bg-sky">
								<b> 주거래 계좌</b>
							</th>
							<td class="border-r-none" id="mainBankInfo">${mbankInfo.main_acc_bank_nm} &nbsp; ${mbankInfo.main_acc_number} &nbsp; ${mbankInfo.main_acc_holder}</td>
							<th colspan="2" class="bg-sky"></th>
						</tr>
				 	</table>
				</div>
				
				<!-- 쇼핑몰 정보 -->
				<div class="money-bank-table table-border">
					<table>
						<thead class="bg-blue">
						<tr>
						<th class="w250">등록 B2B 도매몰</th>
						<th class="w250">B2B 아이디</th>
						<th>선지급 대상 쇼핑몰</th>
						</tr>
						</thead>
						<tbody class="align-center">
							<tr>
								<td class="color-blue2 w250" id="b2bMallName"></td>
								<td class="color-blue2 w250" id="b2bMallId"></td>
								<td class="span-shop" id="shopList"></td>
							</tr>
						</tbody>
					</table>
				</div>
				
			</div>
		</div>
		
		<!-- 선지급 서비스 안내 -->
		<div class="conArticle">
			<div class="conArticle-inner">
				<h3>선지급 서비스 안내</h3>
				<div class="txt-content content-bg  bg-icon con-03 m-b50">
					<ul id="overList" class="barList over-list color-blue font-15 f-w-300 lh-170">
					<li>머니뱅크 B2B 구매자금 선지급 서비스는 1년 계약으로 운영됩니다. </li>
					<li>선지급 한도금액은 이용가능 최대금액을 말하며 필요한 금액을 필요한 시점에 선지급 금액을 요청하셔서 합리적인 사용이 가능합니다.<br />
					(선지급 한도금액은 6개월 단위로 변경합니다.)
					</li>
					<li>개별 선지금 요청금액은 백만원 단위로 신청 가능합니다. </li>
					<li>개별 선지급 금액은 3개월 기간을 기준으로 대출이자와 수수료를 선취하며, 상환이 이루어지면 상환일자에서 가까운 목요일을 기준으로 사용기간을 산출하여
					정산됩니다.<br />
					(목요일이 영업일이 아닌 경우, 다음날을 기준으로 정산)
					</li>
					<li>선지급 대상 쇼핑몰의 매출정산금액이 지정된 통장에 입금되면, 원금 및 선취금액에서 실제 이용하신 기간에 따라 실제 이자와 수수료를 정산하고 잔액을
					주거래통장에 입금해드립니다. </li>
					<li>선지금 실행금의 상환은 쇼핑몰 정산입금에 따른 자동상환을 기본으로 하나 중도상환이 가능하며 이용자의 판단에 따라 직접 중도상환도 가능합니다. </li>
					<li>선지급 서비스 계약만료일에는 만료일 기준 원금, 이자 그리고 수수료를 전액 상환하셔야 하며, 이후 재계약을 통하여 다시 서비스를 이용하실 수 있습니다. </li>
					<li>서비스 계약이후라도 본 서비스 대상 온라인 쇼핑몰에 대한 타 서비스와의 중복 이용이 의심될 경우 즉각적으로 서비스가 중단되며 상환금액 총액을 일시적으로 회수하게
					됩니다. </li>
					</ul>
				</div>
				<p class="text-center f-w-300 m-b60">위의 심사결과를 확인 하시고 아래 &nbsp;
					<b class="underline-blue">“심사결과 동의”</b> &nbsp; 를 클릭하시면 계약체결 단계로 진행됩니다.
				</p>
				
				<!-- 심사결과 동의 버튼 -->
				<div class="button-box">
					<a class="big-blue-btn" type="button" style="cursor: pointer;" id="approvalEval">심사결과 동의</a>
				</div>
				
			</div>
		</div>
	</div>
</div>
<!-- //컨텐츠 -->
				
<!-- 심사 완료 Modal -->	
<div class="modal-container pass" id="alert-pass">
	<div class="modal-wrapper">
		<header>
			<h2>이용안내</h2>
		</header>
		<div class="modal-content">
			<div class="mInner auto mArticleArea">
				<div class="m-imgBox-02"><img src="/resources/rudicks/img/icon/modal-icon02.png" alt="" /></div>
				<div class="noticeTxt-02">
					<span class="font-32">감사합니다!</span><br />
					지급 신청단계가 완료되었습니다.<br />
					신청하신정보와 서류를 기반으로 회원님의 사업현황을 분석하여<br />
					선지급 이용가능 총액과 이용 조건을 24시간 이내에 안내해<br />
					드리도록 하겠습니다.
				</div>
				<div class="btnArea">
					<a href="javascript:;" class="modalClose bBtn3 sColorLB">확인</a>
				</div>
			</div>
		</div>
	</div>
</div>
