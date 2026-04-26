<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>
<%@ taglib prefix = "fmt" uri = "http://java.sun.com/jsp/jstl/fmt" %>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script>
$(document).ready(function(){
	writePossible();
	historyOfUsage();

	let date = new Date();
	let today = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
	$("#pcsStandardDate").append(today);
});

const mbid = '${param.mbid}';

function writePossible(){
	if('${loadApprovalDetail.mb_status}' != '심사대기'){
		$('#adj_fee_rate, #adj_payment_rate, #adj_sales_limit_per_case, #adj_reason').attr("readonly", "true");
	}
}

function historyOfUsage(){
	callUrl = '/admin/moneybank/historyofusage'
	callBackFunc = 'historyOfUsageResponse'
	objParam = {
		mbid : mbid
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function historyOfUsageResponse(data){
	let historyList = data.mbHistoryOfUsage;

	if(historyList.length > 0) {
		let trHtml = '';

		$.each(historyList, function(index, item) {
			let listPcsScore = item.pcs_score;
			let fee_rate = item.fee_rate;

			if(listPcsScore == null) {
				listPcsScore = '';
			}
			if(fee_rate == null) {
				fee_rate = '';
			}
			trHtml += '<tr>';
			trHtml += '<td><div class="tIn">'+ item.RNUM +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.contract_date +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.mb_product_code +'</div></td>';
			trHtml += '<td><div class="tIn">'+ '-' +'</div></td>';
			trHtml += '<td><div class="tIn">'+ '-' +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.service_period +' 개월</div></td>';
			trHtml += '<td><div class="tIn">'+ fee_rate + '</div></td>';
			trHtml += '<td><div class="tIn">'+ listPcsScore +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.pms_score +'</div></td></tr>';
		});
		$('#fixTbody').empty().html(trHtml)
	} else {
		let trHtml = '<tr><td colspan="10">조회된 결과가 없습니다.</td></tr>';
		$('#fixTbody').empty().html(trHtml);
	}
}

$(document).on('click', '#conditionReject', function(){
	let callUrl = '/admin/moneybank/conditionReject';
	let callBackFunc = 'conditionResponse';
	let objParam = {
			mbid : mbid
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

$(document).on('click', '#conditionAccept',function(){
	let adj_fee_rate = $('#adj_fee_rate').val();
	let adj_payment_rate = $('#adj_payment_rate').val();
	let adj_sales_limit_per_case = $('#adj_sales_limit_per_case').val();
	let adj_reason = $('#adj_reason').val();

	if(!adjInfoValidation(adj_fee_rate, adj_payment_rate, adj_sales_limit_per_case, adj_reason)){
		return false;
	}

	let callUrl = '/admin/moneybank/conditionAccept';
	let callBackFunc = 'conditionResponse';
	let objParam = {
			  mbid : mbid
			, adj_fee_rate : adj_fee_rate
			, adj_payment_rate : adj_payment_rate
			, adj_sales_limit_per_case : adj_sales_limit_per_case
			, adj_reason : adj_reason
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function conditionResponse(data){
	let resultCode = data.resultCode;

	if(resultCode == 0){
		$(location).attr("href", "/admin/moneybank/approval_tab1");
	}else{
		modalInfo("관리자에게 문의해주세요.");
	}
}

function adjInfoValidation(adj_fee_rate, adj_payment_rate, adj_sales_limit_per_case, adj_reason){
	if((adj_fee_rate.length > 0 || adj_payment_rate.length > 0 || adj_sales_limit_per_case.length > 0) && adj_reason.length == 0){
		modalInfo("변경 이유를 입력해주세요.");
		return false;
	}

	if(adj_reason.length > 0 && adj_fee_rate.length == 0 && adj_payment_rate.length == 0 && adj_sales_limit_per_case.length == 0){
		modalInfo("변경할 항목을 입력해주세요.");
		return false;
	}
	return true;
}

</script>

<div class="m-tab">
	<ul>
		<li class="active"><a href="javascript:;">신청회원 종합심사</a></li>
	</ul>
</div>

<div class="m-search">
	<div class="modal-wrapper">
		<div class="modal-content">
			<div class="mInner mArticleArea tabArea">
				<article class="m-modalGrid">
					<header>
						<h3>회원 정보</h3>
					</header>
					<div class="contentsArea">
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">회원명</span>
									<div class="input">
										<span id="user_nm">${loadApprovalDetail.USER_NM}</span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">회원ID</span>
									<div class="input">
										<span id="user_id">${loadApprovalDetail.USER_ID}</span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">회사명</span>
									<div class="input">
										<span id="firm_nm">${loadApprovalDetail.FIRM_NM}</span>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">핸드폰</span>
									<div class="input">
										<span id="user_phone">${loadApprovalDetail.USER_PHONE}</span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">구분</span>
									<div class="input">
										<span id="business_type">${loadApprovalDetail.BUSINESS_TYPE}</span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">업종</span>
									<div class="input">
										<span id="sector">${loadApprovalDetail.SECTORS}</span>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">사업기간</span>
									<div class="input">
										<span id="business_period">${loadApprovalDetail.periodYear} 년 ${loadApprovalDetail.periodMonth} 개월</span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">온라인사업</span>
									<div class="input">
										<span id="operation_period"></span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">월결제(천원)</span>
									<div class="input">
										<span id="mb_sales_amount">${loadApprovalDetail.mb_sales_amount}</span>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fwBox">
									<span class="ft">CB점수</span>
									<div class="input">
										<span id="cb_score_current">${loadApprovalDetail.cb_score_current}</span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">신청 쇼핑몰</span>
									<div class="input">
										<span id="shop_count">${loadApprovalDetail.shop_list}</span>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft">프리즘</span>
									<div class="input">
										<span id="prizm_score">${loadApprovalDetail.pcs_score}</span>
										<button class="sColorLB rBtn2" onclick="location.href='/admin/moneybank/pcsDetail?mbid=${param.mbid}'" type="button">상세</button>
									</div>
								</div>
							</li>
						</ul>
						<ul class="item">
							<li>
								<div class="fixTable maxHeight" id="fixTable">
									<table class="m-shadowTable style-gray" style="text-align: center">
										<thead>
										<tr>
											<th>No.</th>
											<th>일 자</th>
											<th>이용서비스</th>
											<th>이용총액</th>
											<th>상환완료</th>
											<th>서비스 기간</th>
											<th>수수료 %</th>
											<th>PCS 점수</th>
											<th>PMS 점수(당기)</th>
										</tr>
										</thead>
										<tbody id="fixTbody"></tbody>
									</table>
								</div>
							</li>
						</ul>
					</div>
				</article>

				<article class="m-modalGrid">
					<header><h3>이용조건 심사</h3></header>
					<div class="contentsArea">
						<div class="item-wrap">
							<div class="item-header-02" style="visibility: hidden; width:800px;"></div>
							<div class="item-box">
								<ul class="item col-4">
									<li>
										<div class="fwBox">
											<span class="ft">담당자</span>
											<div class="input" >
												<span id="userInfo">${principal.username}</span>
											</div>
										</div>
									</li>
									<li>
										<div class="fwBox ">
											<span class="ft">일 시</span>
											<div class="input">
												<span id="mb_approval_date">${loadApprovalDetail.mb_approval_date}</span>
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
						<div class="item-wrap">
							<div class="item-header-02"><span>심사추천</span></div>
							<div class="item-box">
								<ul class="item col-1">
									<li>
										<div class="fwBox">
											<span class="ft">신청일자</span>
											<div class="input">
												<span id="mb_request_date">${loadApprovalDetail.mb_request_date}</span>
											</div>
										</div>
									</li>
									<li>
										<div class="fwBox">
											<span class="ft">MBID</span>
											<div class="input">
												<span id="mbid">${loadApprovalDetail.mbid}</span>
											</div>
										</div>
									</li>
									<li>
										<div class="fwBox">
											<span class="ft">승인/조정/거부</span>
											<div class="input">
												<span id="mb_status">${loadApprovalDetail.mb_status}</span>
											</div>
										</div>
									</li>
								</ul>
								<ul class="item col-1">
									<li>
										<div class="fwBox">
											<span class="ft">수수료율</span>
											<div class="input">
												<span id="fee_rate">${loadApprovalDetail.fee_rate} %</span>
											</div>
										</div>
									</li>
									<li>
										<div class="fwBox">
											<span class="ft">지급율</span>
											<div class="input">
												<span id="payment_rate">${loadApprovalDetail.payment_rate} %</span>
											</div>
										</div>
									</li>
									<li>
										<div class="fwBox">
											<span class="ft">건당 주문한도</span>
											<div class="input">
												<span id="sales_limit_per_case">${loadApprovalDetail.adj_sales_limit_per_case} (천원)</span>
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>

						<div class="item-wrap">
							<div class="item-header-02"><span>변경</span></div>
							<div class="item-box">
								<ul class="item col-1">
									<li>
										<div class="fwBox">
											<span class="ft">수수료율</span>
											<div class="input">
												<input type="text" id="adj_fee_rate" placeholder="%" value="${loadApprovalDetail.adj_fee_rate}" maxlength="5" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
											</div>
										</div>
									</li>
									<li>
										<div class="fwBox">
											<span class="ft">지급율</span>
											<div class="input">
												<input type="text" id="adj_payment_rate" placeholder="%" value="${loadApprovalDetail.adj_payment_rate}" maxlength="5" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
											</div>
										</div>
									</li>
									<li>
										<div class="fwBox">
											<span class="ft">건당 주문한도</span>
											<div class="input">
												<input type="text" id="adj_sales_limit_per_case" placeholder="(천원)" value="${loadApprovalDetail.adj_sales_limit_per_case}" maxlength="7" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
						<div class="dot-hr"></div>
					</div>
				</article>

				<article class="m-modalGrid">
					<header>
						<h3>변경 이유</h3>
					</header>
					<div class="contentsArea">
						<div class="fwBox textarea">
							<div class="input">
								<textarea id="adj_reason" placeholder="변경 이유를 작성해주세요.">${loadApprovalDetail.adj_reason}</textarea>
							</div>
						</div>
					</div>
					<div class="c-boardSet">
						<div class="button-box">
							<span class="btns" id="evalbtns">
									<c:if test="${not empty loadApprovalDetail.mb_approval_date}">
										<button class="bBtn2 sColorLG" onclick="history.back();">목 록</button>
									</c:if>
									<c:if test="${empty loadApprovalDetail.mb_approval_date}">
										<button class="bBtn2 sColorLG" onclick="history.back();">목 록</button>
										<button class="bBtn2 sColorN" id="conditionReject">거 부</button>
										<button class="bBtn2 sColorN" id="conditionAccept">승 인</button>
									</c:if>
							</span>
						</div>
					</div>
				</article>
			</div>
		</div>
	</div>
</div>
