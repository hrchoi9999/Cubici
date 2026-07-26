<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>


<script>
$(document).ready(function(){
	setPageInfo();
	getDetail(1);

	$("#searchBtn").on("click", function(){
		getDetail(1);
	});
})
	
// 기본 계약정보 표시
function setPageInfo(){
	// 이용조건
	let feeRate = "${mbankInfo.fee_rate}" + "%";
	let paymentRate = "${mbankInfo.payment_rate}" + "%";
	let salesLimitPerCase = comma("${mbankInfo.sales_limit_per_case}" * 1000) + " 원";
	let demandBankInfo = "${mbankInfo.mb_demand_acc_bank_code}" +"\u00a0"+ "${mbankInfo.mb_demand_acc_number}" +"\u00a0"+ "[예금주 : ${mbankInfo.mb_demand_acc_holder}]";
	let mainBankInfo = "${mbankInfo.mb_main_acc_bank_code}" +"\u00a0"+ "${mbankInfo.mb_main_acc_number}" +"\u00a0"+ "[예금주 : ${mbankInfo.mb_main_acc_holder}]";
	let contractDate = "${mbankInfo.mb_contract_date}";
	let ContractPeriod = contractDate.substr(0,10) + " ~ " + "${mbankInfo.expireDate}";
	
	$("#feeRate").text(feeRate);
	$("#paymentRate").text(paymentRate);
	$("#salesLimitPerCase").text(salesLimitPerCase);
	$("#ContractPeriod").text(ContractPeriod);
	
	$("#demandBankInfo").text(demandBankInfo);
	$("#mainBankInfo").text(mainBankInfo);
}

// 현황 & 이력 데이터 가져오기 FUNC
function getDetail(pageNo) {
	let status = $('#status option:selected').val();
	let dataLimit = $('#dataLimit option:selected').val();
	let currentData =  dataLimit*(pageNo-1);
	let fromDate = $("#fromDate").val() == '' ? $("#fromDate").attr("data-placeholder") : $("#fromDate").val();
	let toDate = $("#toDate").val() == '' ? $("#toDate").attr("data-placeholder") : $("#toDate").val();
	let callUrl = "/moneybank/advCalc/current/get";
	let callBackFunc = "getDetailResponse";
	let objParam = {
		mbid : '${mbankInfo.mbid}',
		fromDate : fromDate,
		toDate : toDate,
		status : status,
		current_data : currentData,
		data_limit : dataLimit,
		pageNo : pageNo
	};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 현황 & 이력 데이터 callback FUNC
function getDetailResponse(data) {
	let resultSum = data.RedemDetailSum;
	let resultList = data.RedemDetailList;
	let trHtml = "";
	for (let i = 0; i < resultList.length; i++) {
		trHtml += '<tr>';
		trHtml += '<td>' + resultList[i].rownum + '</td>';
		trHtml += '<td>' + resultList[i].status + '</td>';
		trHtml += '<td>' + formatDate(resultList[i].calc_date) + '</td>';
		trHtml += '<td>' + comma(resultList[i].calculate_deposit_amount) + '</td>';
		trHtml += '<td>' + comma(resultList[i].deposit_amount) + '</td>';
		trHtml += '<td>' + comma(resultList[i].act_principal) + '</td>';
		trHtml += '<td>' + comma(resultList[i].usage_fee) + '</td>';
		trHtml += '<td>' + comma(resultList[i].remittance_fee) + '</td>';
		trHtml += '<td>' + resultList[i].balance_deposit_date + '</td>';
		trHtml += '<td>' + comma(resultList[i].balance_remittance_amount) + '</td>';
		trHtml += '<td>' + comma(resultList[i].cal_balance) + '</td>';
		trHtml += '</tr>';
	}
	$("#tbody").html(trHtml);

	// 페이징
	let pageMaxCnt = resultSum.total / data.dataLimit;
	let currentPage = data.currentPage - 1;
	let pageCnt = Math.floor(currentPage / 10);
	// 페이징 버튼
	let pageHtml = "<ul>";
	if (pageMaxCnt < 10) {
		for (let i = 1; i <= Math.ceil(pageMaxCnt); i++) {
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='getDetail(" + i + ");'>" + i + "</a><li>";
		}
	} else if (pageMaxCnt >= 10) {
		if (pageCnt > 0) { // 이전
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='getDetail(" + ((pageCnt) * 10) + ");'><</a><li>";
		}
		for (let i = (pageCnt * 10) + 1; i <= (pageCnt * 10) + 10; i++) { // 1~ 10
			if (i > Math.ceil(pageMaxCnt)) {
				break;
			}
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='getDetail(" + i + ");'>" + i + "</a><li>";
		}
		if (Math.floor(pageMaxCnt) > (pageCnt * 10) + 10) { // 다음
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='getDetail(" + ((pageCnt + 1) * 10 + 1) + ");'><</a><li>";
		}
	}
	$("#pagingButton").empty().html(pageHtml);
	$(".num:eq(" + currentPage % 10 + ")").addClass("active");
}
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
				<h3>이용조건</h3>
				<div class="money-bank-table color-g box-border-blue">
					<table class="text-left h-f-blue header-w260">
						<tr class="border-bottom-g">
							<th class="bg-sky">
								<b>이용 수수료율<br><span>(쇼핑몰 정산금액 대비)</span></b>
							</th>
							<td class="border-r-none bg-sky">
								<b class="color-blue" id="feeRate"></b>
							</td>
							<th class="bg-sky">
								<b>머니뱅크 지급율<br><span>(주문금액 대비 지급율)</span></b>
							</th>
							<td class="border-r-none">
								<b class="color-blue" id="paymentRate"></b>
							</td>
						</tr>
						<tr>
							<th class="bg-sky">
								<b>주문건당 최대 매출 한도</b>
							</th>
							<td class="border-r-none">
								<b class="color-blue" id="salesLimitPerCase"></b>
							</td>
							<th class="bg-sky">
								<b>계약 기간</b>
							</th>
							<td class="border-r-none f-w-300">
								<b class="color-blue" id="ContractPeriod"></b>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>

		<!-- 기본정보 -->
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>회원정보</h3>
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
								${info.username}
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
								<b>계약 일자</b>
							</th>
							<td>${mbankInfo.mb_contract_date}</td>
						</tr>
						<tr>
							<th class="bg-sky">
								<b> 요구불 계좌</b>
							</th>
							<td class="border-r-none">
								<span id="demandBankInfo">${mbankInfo.demand_bank_info}</span>
							</td>
							<th class="bg-sky">
								<b> 주거래 계좌</b>
							</th>
							<td colspan="3" class="border-r-none">
								<span id="mainBankInfo">${mbankInfo.main_bank_info}</span>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		
		<!-- 도매몰 정보 -->
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<h3>머니플러스 적용 쇼핑몰</h3>
				<div class="money-bank-table table-border">
					<table>
						<thead class="none">
							<tr>
								<th class="bg-sky">
									<b>현재 운영중인 쇼핑몰</b>
								</th>
								<td class="span-shop">
									<c:forEach var="list" items="${shopList}">
									<label for="shop_${list.mb_request_shop}"><img src="/resources/rudicks/img/partner-color/${list.mb_request_shop}-con.png" alt=""></label>
									</c:forEach>
								</td>
							</tr>
							<tr>
								<th class="bg-sky">
									<b>머니플러스 대상 쇼핑몰</b>
								</th>
								<td class="span-shop">
									<c:forEach var="list" items="${shopList}">
									<label for="shop_${list.mb_request_shop}"><img src="/resources/rudicks/img/partner-color/${list.mb_request_shop}-con.png" alt=""></label>
									</c:forEach>
								</td>
							</tr>
						</thead>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 이용현황 -->
<div class="contentGrid m-45">
	<div class="inner wide">
		<!-- Title -->
		<div class="page-title">
			<h2>머니플러스 이용현황</h2>
			<button class="withdraw-btn bg-0e57bf" type="button" onclick="totalRepay()">서비스 해지</button>
		</div>
		<div class="conArticle m-45">
			<div class="conArticle-inner">
				<div class="money-bank-table box-border-blue">
					<table class="register-table type2">
						<tbody>
							<tr class="border-bottom-g ">
								<td class="border-r-none">
									<label class="txt-none">상태</label>
									<select class="wide" id="status">
										<option value="" selected> 상태</option>
										<option value="deposit">입금</option>
										<option value="redem">상환</option>
									</select>
								</td>
								<td class="border-r-none">
									<label class="txt-none">전체쇼핑몰</label>
									<select class="wide" id="shop" disabled>
										<option selected> 전체쇼핑몰</option>
									</select>
								</td>
								<td class="border-r-none ">
									<label><b class="square-txt color-blue">기간검색</b></label>
									<input type="date" id="fromDate" data-placeholder="${fromDate}" required> ~
									<input type="date" id="toDate" data-placeholder="${toDate}" required>
								</td>
								<td class="border-r-none">
									<label class="txt-none">도매몰</label>
									<select class="m-r-0 w150" id="dataLimit">
										<option value="10">10줄 보기</option>
										<option value="30" selected>30줄 보기</option>
										<option value="50">50줄 보기</option>
									</select>
								</td>
								<td class="border-r-none">
									<button type="button" class="m-l-10 w130 t-big-btn bg-0e57bf" id="searchBtn">검색</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				
				<div class="money-bank-table table-border">
					<table class="redem-table">
						<thead class="bg-blue">
							<tr>
								<th class="w80" rowspan="2" colspan="2">구분</th>
								<th class="w100" rowspan="2">일자</th>
								<th class="w190" rowspan="2">머니플러스 선정산 원금 입금</th>
								<th class="w120" rowspan="2">쇼핑몰 정산금액</th>
								<th class="w250" colspan="3">상세 상환 내역</th>
								<th class="w200" colspan="2">반환 내역</th>
								<th class="w190" rowspan="2">머니플러스 선정산 원금 잔액
									<span class="infoArea">
										<a href="javascript:;" class="oiBtn infoBtn">정보</a>
										<span class="infoMemo" style="display: none;">
											<span class="iCon">
												선정산 원금 잔액 : 선정산 원금 입금-원금상환
											</span>
										</span>
									</span>
								</th>
							</tr>
							<tr>
								<th>원금상환</th>
								<th>이용수수료</th>
								<th>송금수수료</th>
								<th>반환일자</th>
								<th style="border-right: 1px solid #b8d4ff;">반환금액
									<span class="infoArea">
										<a href="javascript:;" class="oiBtn infoBtn">정보</a>
										<span class="infoMemo" style="display: none;">
											<span class="iCon">
												반환금액 : 원금상환-선정산 원금 잔액 >0 인 경우, 해당 반환 금액이 고객님의 주거래계좌로 반환됩니다.
											</span>
										</span>
									</span>
								</th>
							</tr>
						</thead>
						<tbody id="tbody" class="text-center color-blue2">
						</tbody>
					</table>
				</div>
				<div class="m-paging" id="pagingButton">
				</div>
			</div>
		</div>
	</div>
</div>