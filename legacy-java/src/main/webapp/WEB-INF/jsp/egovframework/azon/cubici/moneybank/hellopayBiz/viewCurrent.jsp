<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>


<script>
$(document).ready(function(){
	
	// 기본 계약 info
	setPageInfo();
	
	// 신청 쇼핑몰 나열
	displayShop();
	
	// 현황 & 이력 테이블
	getDetailLog();
	
	// 실행금 신청
	$("#exec_confirm_btn").on('click', function() {

		event.preventDefault();
		
		// 실행금 입력값
		let settingPriceText = 0;
		settingPriceText = document.getElementById("executeAmnt").value;

		if (settingPriceText == "") {
			alert("선지급 실행금액이 설정되지 않았습니다.");
		} else {
			settingPriceText = parseInt(settingPriceText.replaceAll(",", ""))*1000000;
		}

		// 회원번호
		let seq = "${mbankInfo.seq}";
		
		// 기준일자
		let standardDate = "${standard_date}";
		
		// 신청 Process
		let callUrl = "/moneybank/advPay/insertExecute";
		let callBackFunc = "execRequestResult";
		objParam = {
			seq : seq,
			request_provider: "BB31",
			settingPriceText : settingPriceText,
			standard_date : standardDate
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
})
	
// 기본 계약정보 표시
function setPageInfo(){
	
	// 이용조건
	let totalAmount = comma("${mbankInfo.b2b_limit_amount}");
	let interestRate = "${mbankInfo.interest_rate}" + "% / 일";
	let feeRate = "${mbankInfo.fee_rate}" + "% / 일";
	let wholesaleNm = "${mbankInfo.wholesale_mall_nm}"
	let availAmount = comma("${mbankInfo.available_amount}");
	let demandBankInfo = "${mbankInfo.demand_acc_bank_nm}" +"\u00a0"+ "${mbankInfo.demand_acc_number}" +"\u00a0"+ "${mbankInfo.demand_acc_holder}";
	let mainBankInfo = "${mbankInfo.main_acc_bank_nm}" +"\u00a0"+ "${mbankInfo.main_acc_number}" +"\u00a0"+ "${mbankInfo.main_acc_holder}";
	
	$("#totalAmount").text(totalAmount);
	$("#interestRate").text(interestRate);
	$("#feeRate").text(feeRate);
	$("#wholesaleNm").val(wholesaleNm);
	$("#availableAmnt").val(availAmount);
	$("#demandBankInfo").text(demandBankInfo);
	$("#mainBankInfo").text(mainBankInfo);
	
}

// 신청 쇼핑몰 나열 FUNC
function displayShop(){
	
	let shopHtml = "";

	let currShops = ('${mbankInfo.request_shop}').split(",");
	
	currShops.forEach( shop => {
		
		shopHtml += '<span class="color-blue2">';
		
		switch(shop){
			case '1':
				shopHtml+= '<img src="/resources/rudicks/img/partner-color/auction-con.png" alt="">옥션</span>';
				break;
			case '2':
				shopHtml+= '<img src="/resources/rudicks/img/partner-color/naver-con.png" alt="">네이버</span>';
				break;
			case '3':
				shopHtml+= '<img src="/resources/rudicks/img/partner-color/gmarket-con.png" alt="">지마켓</span>';
				break;			
			case '4':
				shopHtml+= '<img src="/resources/rudicks/img/partner-color/11st-con.png" alt="">11번가</span>';
				break;
			case '11':
				shopHtml+= '<img src="/resources/rudicks/img/partner-color/coupang-con.png" alt=""></span>';
				break;
			case '14':
				shopHtml+= '<img src="/resources/rudicks/img/partner-color/interpark-con.png" alt=""></span>';
				break;
		}
	})
	shopHtml += '<button type="button" class="t-btn bg-699de7" onclick="shopChange()">수정</button>';
	$("#currentShop").html(shopHtml);
}

//신청 결과 알림 FUNC
function execRequestResult(data) {
	if (data.insertCode == 0) {
		modalReload("신청 되었습니다!");
		
		$("#confirm2").on("click", function(){
			location.href="/moneybank/advPay/current";
		})
		
	} else if (data.insertCode == 88) {
		modalInfo("실행금액 신청가능 금액이 아닙니다.");
	} else {
		modalInfo("선지금 실행금액 설정 신청 실패");
	}
}

// 현황 & 이력 데이터 가져오기 FUNC
function getDetailLog() {
	
	let standardDate = "${standard_date}";
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	let seq = "${mbankInfo.seq}";
	
	let callUrl = "/moneybank/advPay/current/get";
	let callBackFunc = "getDetailResponse";
	let objParam = {
		standardDate : standardDate,
		fromDate : formatDate(fromDate),
		toDate : formatDate(toDate),
		seq : seq,
		order : "DESC"
	};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 현황 & 이력 데이터 callback FUNC
function getDetailResponse(data){
	
	let resultList = data.executeList;
	
	let tableHtml = "";
	
	tableHtml += '<tr>';
	tableHtml += '<th class="w50">No.</th>';
	tableHtml += '<th class="w140">상태</th>';
	tableHtml += '<th class="w140">실행 CODE</th>';
	tableHtml += '<th class="w140">입금일자</th>';
	tableHtml += '<th class="w140">입금금액</th>';
	tableHtml += '<th class="w140">상환총액</th>';
	tableHtml += '<th class="w140">상환잔액</th>';
	tableHtml += '<th class="w140">상세보기</th>';
	tableHtml += '<th class="w200">직접상환</th>';
	tableHtml += '</tr>';
	
	for(let i = 0; i < resultList.length; i++){
		
		let thisMap = resultList[i];
		
		let rowNum = i+1;
		
		let entryNameDisplay = "";
		let depositDateDisplay = "";
		
		let repayStatus = "";
		let repayBtnClass = "";
		let repayBtnFunc = "";
		
		// 미입금 실행금의 경우
		if(thisMap.deposit_date == null){
			entryNameDisplay = "-";
			depositDateDisplay = "-";
		}else{
			entryNameDisplay = thisMap.entry_name;
			depositDateDisplay = thisMap.deposit_date;
		}
		
		// 상태구분에 따라 표시하는 버튼 상이
		let remainAmntCheck = thisMap.remaining_repayment_amount;
		if(remainAmntCheck > 0){
			
			if(thisMap.actual_payment == thisMap.remaining_repayment_amount){
				repayStatus = "입금";
			}else{
				repayStatus = "상환중"
			}
			repayBtnClass = "t-btn bg-0e57bf";
			
		}else if(remainAmntCheck == 0){
			repayStatus = "완료";
			repayBtnClass = "t-btn bg-bfbfbf";
		}else{
			repayStatus = "신청";
			repayBtnClass = "t-btn bg-bfbfbf";
		}
		
		tableHtml += '<tr>';
		tableHtml += '<td class="w50">'+rowNum+'</td>';
		tableHtml += '<td class="w40">'+repayStatus+'</td>';
		tableHtml += '<td class="w140">'+entryNameDisplay+'</td>';
		tableHtml += '<td class="w140">'+depositDateDisplay+'</td>';
		tableHtml += '<td class="w140">'+thisMap.total_payment+'</td>';
		tableHtml += '<td class="w140">'+thisMap.total_repayment+'</td>';
		tableHtml += '<td class="w140">'+thisMap.remaining_repayment_amount+'</td>';
		tableHtml += '<td class="w140"><button class="t-btn bg-699de7" type="button" onclick="getExecDetail('+thisMap.entry+', \''+thisMap.entry_name+'\', \''+thisMap.deposit_date+'\', \''+thisMap.total_payment+'\', \''+thisMap.total_repayment+'\', \''+thisMap.remaining_repayment_amount+'\')"> 보기</button></td>';
		
		// 상태구분에 따라 function 부여
		if(repayStatus == "입금" || repayStatus == "상환중"){
			tableHtml += '<td class="w167"><button id="directRepayBtn" class="'+repayBtnClass+'" onclick="directRepay('+thisMap.entry+', \''+thisMap.entry_name+'\', \''+thisMap.total_payment+'\')" type="button"> 신청</button></td>';
		}else {
			tableHtml += '<td class="w167"><button id="directRepayBtn" class="'+repayBtnClass+'" type="button"> 신청</button></td>';
		}
		
		tableHtml += '</tr>';
	}
	
	$("#executeTable").html(tableHtml);
}

// 실행금건에 대한 상환 상세 Modal
function getExecDetail(entry, execName, depoDate, totalAmnt, repayAmnt, remainAmnt){
	
	$("#detailEntry").text(entry);
	$("#detailExecName").text(execName);
	$("#detailDepoDate").text(depoDate);
	$("#detailTotalAmnt").text(comma(totalAmnt));
	$("#detailTotalRepay").text(comma(repayAmnt));
	$("#detailRemainAmnt").text(comma(remainAmnt));
	
	let seq = "${mbankInfo.seq}";
	
	let callUrl = "/moneybank/advPay/current/repayDetailModal";
	let callBackFunc = "getDetailModal";
	let objParam = {
		entry : entry,
		seq : seq,
		order : "DESC"
	};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

// 실행금건에 대한 상환상세 Modal callback FUNC
function getDetailModal(data){

	let modalRepayHtml = "";
	
	let resultList = data.repayInfo;
	
	modalRepayHtml += '<tr>';
	modalRepayHtml += '<th class="f-w-500 w50">No.</th>';
	modalRepayHtml += '<th class="f-w-500 w80">기준일자</th>';
	modalRepayHtml += '<th class="f-w-500 w80">상환구분</th>';
	modalRepayHtml += '<th class="f-w-500 w80">쇼핑몰</th>';
	modalRepayHtml += '<th class="f-w-500 w80">주문건수</th>';
	modalRepayHtml += '<th class="f-w-500 w80">정산입금액</th>';
	modalRepayHtml += '<th class="f-w-500 w80">상환금액</th>';
	modalRepayHtml += '<th class="f-w-500 w80">잔액반환</th>';
	modalRepayHtml += '<th class="f-w-500 w120">상환잔액</th>';
	modalRepayHtml += '</tr>';
	
	for(let i = 0; i<resultList.length; i++){

		let thisMap = resultList[i];
		
		let rowNum = i+1;
		
		let typeDisplay = "";
		if(thisMap.repay_type == "auto"){
			typeDisplay = "자동상환";
		} else if(thisMap.repay_type == "direct"){
			typeDisplay = "직접상환";
		}
		
		modalRepayHtml += '<tr>';
		modalRepayHtml += '<td class="w50">'+rowNum+'</td>';
		modalRepayHtml += '<td class="w80">'+formatDate(thisMap.repayment_date)+'</td>';
		modalRepayHtml += '<td class="w80">'+typeDisplay+'</td>';
		modalRepayHtml += '<td class="w80">'+thisMap.shop_type+'</td>';
		modalRepayHtml += '<td class="w80">'+'{건수}'+'건</td>';
		modalRepayHtml += '<td class="w80">'+comma(thisMap.total_repayment_amount)+'</td>';
		modalRepayHtml += '<td class="w80">'+comma(thisMap.original_amount)+'</td>';
		modalRepayHtml += '<td class="w80">'+comma(thisMap.total_return_amount)+'</td>';
		modalRepayHtml += '<td class="w90">'+comma(thisMap.repayment_remaining_amount)+'</td>';
		modalRepayHtml += '</tr>';
	}

	$("#modalRepayTable").html(modalRepayHtml);
	
	modalOpen("repayDetailModal");
	
}
	
// 직접 상환 Modal
function directRepay(entry, name, payment){
	
	let seq = "${mbankInfo.seq}";
	let targetDate = "${standard_date}";
	
	let callUrl = "/moneybank/advPay/current/directRepayModal";
	let callBackFunc = "getDirectRepayModal";
	let objParam = {
		seq : seq,
		entry : entry,
		target_date : targetDate,
		execute_name : name,
		total_payment : payment
	};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 직접 상환 Modal callback FUNC
function getDirectRepayModal(data){
	
	let directMap = data.directMap;
	
	$("#direct_entryName").text(directMap.execute_name);
	$("#direct_depositAmnt").text(comma(directMap.total_payment));
	$("#direct_repayAmnt").text(comma(directMap.repayFinalizeVal));
	
	modalOpen("directRepayModal");
}

// 전액 상환 Modal
function totalRepay(){
	
	let seq = "${mbankInfo.seq}";
	let targetDate = "${standard_date}";
	
	let callUrl = "/moneybank/advPay/current/totalRepayModal";
	let callBackFunc = "getTotalRepayModal";
	let objParam = {
		seq : seq,
		target_date : targetDate
	};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

// 전액 상환 Modal callback FUNC
function getTotalRepayModal(data){
	
	let totalRepayAmnt = comma(data.totalRepayAmount) + " 원";
	
	$("#totalRepayAmount").text(totalRepayAmnt);
	
	modalOpen("totalRepayModal");
	
}

// 한도증액 Modal
function execAmntChange(){
	modalOpen("execAmntChangeModal");
}

// 등록쇼핑몰 변경 Modal
function shopChange(){
	modalOpen("shopChangeModal");
}

</script>
<script>
	//상세현황 스크롤
	$('#overTable').mCustomScrollbar({
    	theme: "dark-3"
	});
</script>

<!-- CONTENT -->
<div class="contentGrid m-45">
	<div class="inner wide">
	
		<!-- Title -->
		<div class="page-title">
			<h2>기본정보</h2>
			<small class="ruby-right"><span>기준일자</span>${standard_date}</small>
		</div>
		
		<!-- 이용조건 -->
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>선지급 이용조건</h3>
				<div class="money-bank-table color-g box-border-blue">
					<table class="text-left h-f-blue header-w150">
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b>이용한도 총액</b>
							</th>
							<td class="border-r-none bg-sky">
								<b class="color-blue" id="totalAmount"></b>
								<button type="button" class="t-btn bg-699de7" onclick="execAmntChange()">한도증액</button>
							</td>
							<th class="bg-sky">
								<b>계약일자</b>
							</th>
							<td class="border-r-none">
								<b class="color-blue">${mbankInfo.contract_date}</b>
								<button type="button" class="t-btn bg-699de7">계약서</button>
							</td>
						</tr>
						<tr>
							<th class="bg-sky">
								<b>대출이자율</b>
							</th>
							<td class="border-r-none">
								<span class="color-blue f-w-300" id="interestRate"></span>
							</td>
							<th class="bg-sky">
								<b>이용 수수료</b>
							</th>
							<td class="border-r-none f-w-300">
								<span class="color-blue" id="feeRate"></span>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>

		<!-- 기본정보 -->
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>기본회원정보</h3>
				<div class="money-bank-table color-g box-border-blue">
					<table class="h-f-blue header-w210">
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b> 회사명</b>
							</th>
							<td class="border-r-none">
								${info.firm_nm}
							</td>
							<th class="bg-sky">
								<b>대표자</b>
							</th>
							<td class="border-r-none">
								${info.user_nm}
							</td>
							<th class="bg-sky">
								사업자번호
							</th>
							<td>
								${info.firm_id}
							</td>
						</tr>
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b>큐빅아이 ID</b>
							</th>
							<td class="border-r-none">
								${info.user_id}
							</td>
							<th class="bg-sky">
								<b>가입일자</b>
							</th>
							<td class="border-r-none">${info.reg_date}</td>
							<th class="bg-sky">
								<b>선지급 신청일자</b>
							</th>
							<td>${mbankInfo.moneybank_request_date}</td>
						</tr>
						<tr>
							<th class="bg-sky">
								<b> 요구불 계좌</b>
							</th>
							<td class="border-r-none" id="demandBankInfo">
								${mbankInfo.demand_bank_info}
							</td>
							<th class="bg-sky">
								<b> 주거래 계좌</b>
							</th>
							<td colspan="3" class="border-r-none"><span id="mainBankInfo">${mbankInfo.main_bank_info}</span>
								<button type="button" class="t-btn bg-699de7">계좌변경</button>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		
		<!-- 도매몰 정보 -->
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>등록 B2B도매몰 정보</h3>
				<div class="money-bank-table table-border">
					<table>
						<thead class="bg-blue">
							<tr>
								<th class="w250">등록 B2B 도매몰</th>
								<th class="w250">B2B 아이디</th>
								<th>선지급 대상 쇼핑몰</th>
							</tr>
						</thead>
						<tbody class="align-center ">
							<tr>
								<td class="color-blue2 w-250">
									${mbankInfo.wholesale_mall_nm}
								</td>
								<td class="color-blue2 w-250">
									${mbankInfo.wholesale_mall_id}
								</td>
								<td class="span-shop" id="currentShop"></td>
							</tr>
					</table>
				</div>
			</div>
		</div>
	</div>
	
	<!-- 실행금 신청 -->
	<div class="conArticle m-45">
		<div class="conArticle-inner">
			<h3 class="big-txt">선지급 입금신청</h3>
			<small class="ruby-right"><span>기준일자</span>${standard_date}</small>
			<form>
				<div class="money-bank-table box-border-blue">
				<table class="register-table type2 ">
					<tbody>
						<tr class="border-bottom-g ">
							<td class="border-r-none">
								<label><b class="square-txt color-blue">도매몰 선택 </b></label>
								<!-- <b class="color-black" id="wholesaleNm"></b> -->
								<input class="wide align-left" type="text" id="wholesaleNm" readonly="readonly">
								<!-- <select class="wide">
									<option> 선택하세요.</option>
									<option> A 몰</option>
								</select> -->
							</td>
							<td class="border-r-none ">
								<label><b class="square-txt color-blue">보유잔액</b></label>
								<!-- <b class="color-black" id="availableAmnt"></b> -->
								<input class="wide align-left" type="text" id="availableAmnt" readonly="readonly">
							</td>
							<td class="border-r-none">
								<label><b class="square-txt color-blue">추가 입금 요청액</b></label>
								<input class="bg-e6eff8 border-5a9aff wide align-left" type="text" id="executeAmnt">
								<span class="color-blue">백만원</span>
							</td>
							<td class="border-r-none">
								<button type="button" class="w140 t-big-btn bg-0e57bf" id="exec_confirm_btn">신청</button>
							</td>
						</tr>
					</tbody>
				</table>
			</form>
		</div>
	</div>
</div>

<!-- 이용현황 -->
<div class="conArticle m-45">
	<div class="conArticle-inner">
		<h3 class="big-txt">이용 서비스 현황</h3>
		<button class="repay-btn  bg-0e57bf" type="button" onclick="totalRepay()">전액상환</button>
		<div class="money-bank-table table-border">
			<table class="f-w-400">
				<thead class="bg-blue">
					<tr>
						<th class="w50">No.</th>
						<th class="w140">계약일자</th>
						<th class="w140">이용서비스</th>
						<th class="w140">연계 도매몰</th>
						<th class="w140">이용 한도총액</th>
						<th class="w140">누적 이용금액</th>
						<th class="w140">이용가능잔액</th>
						<th class="w140">총 상환잔액</th>
						<th class="w140">계약잔여일자</th>
						<th class="w167">계약만료일</th>
					</tr>
				</thead>
				<tbody class="text-center color-blue2">
					<tr>
						<td class="w50">1</td>
						<td class="w140">${mbankInfo.moneybank_request_date}</td>
						<td class="w140">선지급</td>
						<td class="w140">${mbankInfo.wholesale_mall_nm}</td>
						<td class="w140">${mbankInfo.b2b_limit_amount}</td>
						<td class="w140">${mbankInfo.total_execution}</td>
						<td class="w140">${mbankInfo.available_amount}</td>
						<td class="w140">${mbankInfo.remaining_repayment}</td>
						<td class="w167">${mbankInfo.remain_date}</td>
						<td class="w167">${mbankInfo.contract_expire_date}</td>
					</tr>
			</table>
		</div>
		
		<!-- 검색조건 -->
		<form>
			<div class="money-bank-table box-border-blue">
				<table class="register-table type2">
					<tbody>
						<tr class="border-bottom-g ">
							<td class="border-r-none">
								<label class="txt-none">상태</label>
									<select class="wide">
										<option selected> 상태</option>
										<option>신청</option>
										<option>입금</option>
										<option>상환</option>
									</select>
								<label class="txt-none">도매몰</label>
									<select class="wide">
										<option selected> ----B2B도매몰----</option>
										<option>비밀특가</option>
									</select>
							</td>
							<td class="border-r-none ">
								<label><b class="square-txt color-blue">기간검색</b></label>
								<input type="date" data-placeholder="${fromDate}" required> ~
								<input type="date" data-placeholder="${toDate}" required>
								<button type="button" class="m-l-10 w130 t-big-btn bg-0e57bf">검색</button>
							</td>
							<td class="border-r-none">
								<label class="txt-none">도매몰</label>
								<select class="m-r-0 w150 ">
									<option selected>----보기설정----</option>
									<option>10줄 보기</option>
									<option>30줄 보기</option>
									<option>50줄 보기</option>
								</select>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</form>
		
		<!-- 상세현황 -->
		<div class="ruby-padding">
			<small class="ruby-right"><span>기준일자</span>${standard_date}</small>
			<div class="money-bank-table fix-header h-wTable table-border">
				<table class="sky2 text-center" id="executeTable"></table>
			</div>
		</div>
	</div>
</div>
</div>
</div>
<!-- CONTENT END -->

<!-- 금액 변경 MODAL -->
<div class="modal-container" id="execAmntChangeModal">
	<div class="modal-wrapper">
		<header>
		<h2>이용안내</h2>
		</header>
		<div class="modal-content">
			<div class="mInner auto mArticleArea">   
				<div class="noticeTxt-03">
					<h3>현재 선지급 이용한도:30백만원</h3>   
					<form>
						<label>조정 요청한도</label>
						<input type="text" placeholder="요청금액 입력">
						<span>백만원</span>
					</form>
					<div class="btnArea2">
						<a href="javascript:;" class="modalClose bBtn3 sColorLB" id="execAmntChangeSubmit">신청</a>
					</div>
					<ul class="barList">
						<li>
							선지급 이용한도는 최소 5백만원에서 최대 50백안 원입니다. <br/>
							조정요청 금액을 백만원 단위로 입력해 주세요
						</li>
						<li>
							조정 신청을 하시면 심사를 통하여 24시간이내에 그 결과를  알려드립니다.
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>

<!--등록 쇼핑몰 변경-->
<div class="modal-container pass" id="shopChangeModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>등록 쇼핑몰 변경</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="page-title">
					<h3>기본정보</h3>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<h3>머니뱅크 이용방법</h3>
						<div class="money-bank-table w740 color-g box-border-blue">
							<table class="h-f-blue header-w140 text-left">
								<tr class="border-bottom-g">
									<th class="bg-sky">
										<b>아이디</b>
									</th>
									<td class="w230 border-r-none">
										hoho123@xxx.co.kr
									</td>
									<th class="bg-sky">
										<b> 회사명</b>
									</th>
									<td class="w230 border-r-none">
										길동컴퍼니
									</td>
								</tr>
								<tr class="border-bottom-g">
									<th class="bg-sky">
										<b>대표자</b>
									</th>
									<td class="w230 border-r-none">
										홍길동
									</td>
									<th class="bg-sky">
										사업자번호
									</th>
									<td>
										123-456-7890
									</td>
								</tr>
								<tr>
									<th class="bg-sky">
										<b>주소</b>
									</th>
									<td class="w230 border-r-none">서울 강남구 봉은사로 435</td>
									<th colspan="2" class="bg-sky"></th>
								</tr>
							</table>
						</div>
					</div>
				</div>

				<div class="conArticle  modal">
					<div class="conArticle-inner">
						<h3>등록 쇼핑몰 변경</h3>
						<p class="txt-box color-0e57bf f-s15">
							기존 등록 B2B 도매몰의 온라인 쇼핑몰이 변경된 경우 해당 B2B도매몰의 온라인 쇼핑몰 선택을 통해 수정해
							주십시오. <br />
							신규 B2B 도매몰 등록의 경우 B2B도매몰과 아이디를 입력하시고 온라인 쇼핑몰을 선택해주십시오.
						</p>
						<form>
							<div class="money-bank-table box-border-blue">
								<table class="register-table modal">
									<tbody>
										<tr class="border-bottom-g ">

											<td class="w370 border-r-none">
												<label><b class="square-txt color-blue">B2B 도매몰 </b></label>
												<select class="wide">
													<option>-------- B2B몰 선택 --------</option>
													<option> A 몰</option>
												</select>
											</td>
											<td class="w370">
												<label><b class="square-txt color-blue">B2B 아이디</b></label>
												<input class="wide align-left" type="text" placeholder="hoho123" required>
											</td>
										</tr>
										<tr>
											<td colspan="2">
												<p>선지급 서비스를 이용할 B2B 도매사이트를 선택하시고 해당 몰의 아이디를 입력해주세요.</p>
												<input class="check-shop" id="Shop1" type="checkbox" name="shop" /><label
													for="Shop1"><img src="/resources/rudicks/img/partner-color/auction-con.png" alt="">옥션</label>
												<input class="check-shop" id="Shop2" type="checkbox" name="shop" /><label
													for="Shop2"><img src="/resources/rudicks/img/partner-color/naver-con.png" alt="">네이버</label>
												<input class="check-shop" id="oShop3" type="checkbox" name="shop" /><label
													for="Shop3"><img src="/resources/rudicks/img/partner-color/gmarket-con.png" alt="">지마켓</label>
												<input class="check-shop" id="Shop4" type="checkbox" name="shop" /><label
													for="Shop4"><img src="/resources/rudicks/img/partner-color/11st-con.png" alt="">11번가</label>
												<input class="check-shop" id="Shop5" type="checkbox" name="shop" /><label
													for="Shop5"><img src="/resources/rudicks/img/partner-color/coupang-con.png" alt="쿠팡"></label>
												<input class="check-shop" id="Shop6" type="checkbox" name="shop" /><label
													for="Shop6"><img src="/resources/rudicks/img/partner-color/interpark-con.png" alt="인터파크"></label>
												<div class="button-box">
													<button class="m-big-btn f-s16" type="button">신청</button>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--상세상환내역-->
<div class="modal-container pass" id="repayDetailModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>상세 상환 내역</h2>
			<span class="m-ruby-right  bg-0e57bf"><b>기준일자 </b>${standard_date}</span>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<h3 class="f-s20">실행금 상황현황</h3>

						<div class="money-bank-table f-s14  table-border">
							<table class="f-w-400">
								<thead class="bg-blue">
									<tr>
										<th class="f-w-500 w60">No.</th>
										<th class="f-w-500 w95">실행Code</th>
										<th class="f-w-500 w95">입금일자</th>
										<th class="f-w-500 w95">선지급입금액</th>
										<th class="f-w-500 w95">상환총액</th>
										<th class="f-w-500 w95">상환잔액</th>
									</tr>
								</thead>
								<tbody class="text-center color-blue2">
									<tr>
										<td class="w60" id="detailEntry"></td>
										<td class="w95" id="detailExecName"></td>
										<td class="w95" id="detailDepoDate"></td>
										<td class="w95" id="detailTotalAmnt"></td>
										<td class="w95" id="detailTotalRepay"></td>
										<td class="w95" id="detailRemainAmnt"></td>
									</tr>
							</table>
						</div>
					</div>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<h3 class="f-s20">정산입금 상세내역</h3>
						<div class="money-bank-table f-s14 table-border">
							<table class="m-fix-header text-center h-363 bg-blue" id="modalRepayTable"></table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--전액 일시 상환-->
<div class="modal-container pass" id="totalRepayModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>전액 일시 상환</h2>
			<span class="m-ruby-right  bg-0e57bf"><b>기준일자 </b>${standard_date}</span>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s16 text-center">
							기상환금액은 이용기간 및 상환금액에 따라 변동되고 있습니다.<br />
							전액상환을 위해서는 상환기준 일자에 아래 상환잔액을 입금해 주십시오.
						</p>
						<div class="money-bank-table w460 f-s14  table-border">
							<table class="f-w-400">
								<thead class="bg-blue">
									<tr>
										<th class="f-w-500 w90">회원명</th>
										<th class="f-w-500">선지급 계약일</th>
										<th class="f-w-500">상환기준일자</th>
										<th class="f-w-500">중도상환 필요액</th>
									</tr>
								</thead>
								<tbody class="text-center color-blue2">
									<tr>
										<td class="f-w-300 w90">${info.USER_NM}</td>
										<td class="f-w-300">${mbankInfo.moneybank_request_date}</td>
										<td class="f-w-300">${standard_date}</td>
										<td class="f-w-300" id="totalRepayAmount"></td>
									</tr>
							</table>
						</div>
					</div>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s15 f-w-300 text-center">
							중도상환 입금 시, 등록하신 주거래계좌를 통해서 아래 계좌의 집금번호란에<br />
							회원명을 입력하시고 정확한 중도상환 필요액을 입금해 주십시오.
						</p>
						<div class="m-txt-content f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<span class="square-txt">중도상환 입금 계좌 &nbsp; : </span> &nbsp; <span>OO은행 123456-00-123456</span>
						</div>
						<div class="button-box">
							<button class="m-big-btn">확인</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!--직접 상환 신청-->
<div class="modal-container pass" id="directRepayModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>직접 상환 신청</h2>
			<span class="m-ruby-right  bg-0e57bf"><b>기준일자 </b>${standard_date}</span>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s17 text-center">
							선택하신 실행금의 상환금액은 이용기간 및 상환잔액에 따라 변동되고 있습니다.<br />
							선택 실행금을 상환완료 이전 직접상환하기 위해서는 기준 일자를 확인하시고<br />
							아래 상환잔액을 입금해 주십시오.
						</p>
						<div class="money-bank-table w590 f-s14 table-border">
							<table class="f-w-400 ">
								<thead class="bg-blue">
									<tr>
										<th class="f-w-500">선지급계약일</th>
										<th class="f-w-500">실행금코드</th>
										<th class="f-w-500">입금액</th>
										<th class="f-w-500">기준일자</th>
										<th class="f-w-500">중도상환 필요액</th>
									</tr>
								</thead>
								<tbody class="text-center color-blue2">
									<tr>
										<td class="f-w-300">${mbankInfo.moneybank_request_date}</td>
										<td class="f-w-300" id="direct_entryName"></td>
										<td class="f-w-300" id="direct_depositAmnt"></td>
										<td class="f-w-300">${standard_date}</td>
										<td class="f-w-500 f-s16" id="direct_repayAmnt"></td>
									</tr>
							</table>
						</div>
					</div>
				</div>
				<div class="conArticle modal">
					<div class="conArticle-inner">
						<p class="txt-box color-0e57bf f-s15 f-w-300 text-center">
							중도상환 입금 시, 등록하신 주거래계좌를 통해서 아래 계좌의 집금번호란에<br />
							회원명을 입력하시고 정확한 중도상환 필요액을 입금해 주십시오.
						</p>
						<div class="m-txt-content f-s16 f-w-300 box-border-blue bg-d5e5f5 ">
							<span class="square-txt">중도상환 입금 계좌 &nbsp; : &nbsp; OO은행 123456-00-123456</span>
						</div>
						<div class="button-box">
							<button class="m-big-btn">확인</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>