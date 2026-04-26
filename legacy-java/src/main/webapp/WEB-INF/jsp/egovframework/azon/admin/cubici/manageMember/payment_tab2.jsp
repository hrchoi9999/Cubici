<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
var user_nm = "";
var firm_nm = "";
var fromDate = "";
var toDate = "";
var user_id = "";

$(document).ready(function() {
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");
	
	setChangeChargeList(1);
	
	$(document).on("click", "#chargeSearch", function(){
		setChangeChargeList(1);
	});
	
	$(document).on("click", "#opBtn", function(){
		setChangeChargeList(1);
	});
});

function setData(){
	user_nm = $("#user_nm").val();
	firm_nm = $("#firm_nm").val();
	fromDate = $("#fromDate").val();
	toDate = $("#toDate").val();
	user_id = $("#user_id").val();
}

function setChangeChargeList(currentPage){
	currentPage = currentPage-1; // 현재 페이지 0부터
	let dataCnt = currentPage*10;
	setData();
	
	let callUrl = "/admin/cubici/manageMember/changeChargeList";
	let callBackFunc = "getChangeChargeList";
	let objParam = {
		user_nm : user_nm,
		firm_nm : firm_nm,
		fromDate : fromDate,
		toDate : toDate,
		user_id : user_id,
		currentPage : currentPage, //현재 페이지
		dataCnt : dataCnt, // limit
		division : $("#division").val(),
		chargeCode : $('#chargeCode').val(),
		sortPage : $('#sortPage').val()
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function getChangeChargeList(result){
	$(".selectList").css("display", "none");

	$(".loadingSpinner").css("display", "inline-block");
	
	// 변동 thead
	let varTheadArray = [];
	let varTheadBody = [];
	
	$(".columnCheck:checked").each(function(i, item) {
		varTheadArray[i] = $(item).next().text();
		varTheadBody[i] = $(item).attr("id");
	});
	
	let insertScrollThead = "<tr>";
	for(let i=0, len = varTheadArray.length; i < len; i++){
		if(varTheadArray[i] == "차액"){
			$("#thText").html("<span class='br-block pt'>이용</span><span class='br-block pb'>요금제</span>");
			insertScrollThead += "<th class='w200' colspan='2'><p class='b-bt pb'>차액</p>";
			insertScrollThead += "<span class='in-block txt-center fs-15 in-50p pt'>추가</span>";
			insertScrollThead += "<span class='in-block txt-center fs-15 in-50p pt'>환급</span></th>";
		} else {
			insertScrollThead += "<th rowspan='2'>" + varTheadArray[i] + "</th>";
		}
	}
	insertScrollThead += "</tr>";
	
	// 고정컬럼
	let insertFixTbody = "";
	if(result.changeChargeList.length > 0){
		for(let i=0, len = result.changeChargeList.length; i < len; i++){
			let getData = result.changeChargeList[i];
			insertFixTbody += "<tr>";
			insertFixTbody += "<td><div class='tIn'>" + getData.RNUM + "</div></td>"
			insertFixTbody += "<td><div class='tIn'>" + getData.status + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.charge_name + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.start_date + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.USER_ID + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.USER_NM + "</div></td>";
			insertFixTbody += "</tr>";
		}
	    
		// 변동 tbody
		let insertScrollTbody = "";
		for(let i=0, len = result.changeChargeList.length; i < len; i++){	
			let getData = result.changeChargeList[i];
			insertScrollTbody += "<tr>";
			for(let j=0, len = varTheadArray.length; j < len; j++){
				insertScrollTbody += "<td><div class='tIn'>";
				// 내용
				let sum_cnt = parseInt(getData.sum_COUNT)-1;
				let ThValue = varTheadArray[j];
				let TbValue = varTheadBody[j];
				
				if((ThValue == "핸드폰") ||(ThValue == "대표전화")){
					let tempNum = getData[TbValue];
					insertScrollTbody += (tempNum == null) ? "-" : tempNum.substr(0, 3) + "-" + tempNum.substr(3, 4) + "-" + tempNum.substr(7, 4);
				}else if(ThValue == "차액"){
					if(getData["pay_status"] == "환급"){
						insertScrollTbody += "0</div></td>";
						insertScrollTbody += "<td><div class='tIn'>" + comma(getData["amount"]);
					} else if(getData["pay_status"] == "추가"){
						insertScrollTbody += comma(getData["amount"]) + "</div></td>";
						insertScrollTbody += "<td><div class='tIn'>0";					
					} else {
						insertScrollTbody += "0</div></td>";
						insertScrollTbody += "<td><div class='tIn'>0";
					} 
				}else if(ThValue == "변경 일자"){
					if(getData["pay_status"] == "추가"){
						insertScrollTbody += getData["change_date"];
					} else if(getData["pay_status"] == "환급" && getData["refund_date"] == null){
						insertScrollTbody += "<button class='sColorLB refund-btn' onclick='openRefundModal(" + '"' + getData["seq"] + '"' + ")' type='button'>환급</button>";
					} else {
						insertScrollTbody += getData["refund_date"];
					}
				}else{
					insertScrollTbody += (getData[TbValue] == null) ? "-" : getData[TbValue];
				}
				
				insertScrollTbody += "</div></td>";
			}
			insertScrollTbody += "</tr>";
		}
		
		$(".overflowBox").mCustomScrollbar("destroy");
		$(".fixRow").css('left', '0px');
		$(".m-shadowTable").find('th').css('top', '0px');
	
		$("#fixTbody").html(insertFixTbody);
		$("#scrollThead").html(insertScrollThead);
		$("#scrollTbody").html(insertScrollTbody);
		
		// 페이징
		let pageMaxCnt = result.changeChargeList[0].CNT / 10 ;
		let currentPage = result.currentPage;
		let pageCnt = Math.floor(currentPage / 10);
		
		let pageHtml= "<ul>";
		if(pageMaxCnt < 10){ //페이지 10개 미만
			for(let i = 1, len = Math.ceil(pageMaxCnt); i <= len; i++){
				pageHtml += "<li><a class='num' href='javascript:;' onclick='setChangeChargeList(" + i + ");'>" + i + "</a></li>";
			}
		} else if (pageMaxCnt >= 10) { // 페이지 10개 이상
			if( pageCnt > 0 ){ //이전				
				pageHtml += "<li><a class='oiBtn prev' href='javascript:;' onclick='setChangeChargeList(" + ((pageCnt)*10)+ ");'></a></li>";	
			}
			for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ //1~10
				if( i > Math.ceil(pageMaxCnt)) break; // 최대 페이지수 까지만 생성
				pageHtml += "<li><a class='num' href='javascript:;' onclick='setChangeChargeList(" + i + ");'>" + i + "</a></li>";
			}	
			if(Math.floor(pageMaxCnt) > (pageCnt*10) + 10){ //다음
				pageHtml += "<li><a class='oiBtn next' href='javascript:;' onclick='setChangeChargeList(" + ((pageCnt+1)*10 + 1) + ");'></a></li>";
			}
		}
		pageHtml += '</ul>';
		$('#table_paginate').empty().html(pageHtml);
	
		//페이징버튼 활성화
		$('.num:eq('+currentPage%10+')').addClass("active");
	} else {
		//테이블 고정컬럼
		let insertFixTbody = '<tr><td></td></tr>';
		//변동 컬럼
		let insertScrollTbody = '<tr><td colspan="4">조회된 결과가 없습니다.</td></tr>';
	
		$("#fixTbody").html(insertFixTbody);
		$("#scrollThead").html(insertScrollThead);
		$("#scrollTbody").html(insertScrollTbody);
		$('#table_paginate').empty();
	}
	
	// 퍼블리싱
	$('#fixTable').doFixTable();
	
	if($("#fixTable").css("visibility") === "hidden"){
		$("#fixTable").css("visibility", "visible");
	}
	
	$(".loadingSpinner").css({"display" : "none"});// 로딩바 해제
	
}

function openRefundModal(seq){
	let callUrl = "/admin/cubici/manageMember/refund";
	let callBackFunc = "openRefundModalResponse";
	let objParam = {
		seq : seq
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function openRefundModalResponse(result){
	let resultMap = result.refundMap;
	$("#chargeCode").val(resultMap.charge_name);
	$("#userNm").val(resultMap.USER_NM);
	$("#firmNm").val(resultMap.FIRM_NM);
	$("#userPhone").val(resultMap.USER_PHONE);
	$("#exChargeCode").val(resultMap.ex_charge_name);
	$("#expireDate").val(resultMap.expire_date);
	$("#restDate").val(resultMap.rest_date);
	$("#exAmount").val(resultMap.ex_amount);
	$("#newAmount").val(resultMap.new_amount);
	$("#restAmount").val(resultMap.balance);
	$("#amount").val(resultMap.refund_cash);
	$("#card").val(resultMap.refund_card);
	$("#refundName").val(resultMap.refund_user_name);
	$("#refundBank").val(resultMap.refund_bank);
	$("#refundAccount").val(resultMap.refund_account);
	if(resultMap.refund_card > 0){
		$("#card_cancel").css("background-color", "red");
		$("#card_cancel").attr("disabled", false);
		$("#card_cancel").attr("onclick","cancelCardPayment('"+resultMap.imp_uid+"','"+resultMap.refund_card+"')");
	}
	$("#finishBtn").attr("onclick","refundFinish('"+resultMap.seq+"','"+resultMap.new_seq+"')");
	modalOpen("refundModal");
}

function refundFinish(seq,new_seq){
	let callUrl = "/admin/cubici/manageMember/refundFinish";
	let callBackFunc = "refundFinishResponse";
	let objParam = {
		seq : seq,
		new_seq : new_seq
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function refundFinishResponse(result){
	window.location.reload();	
}

function cancelCardPayment(imp,card){
	let callUrl = "/admin/cubici/manageMember/cancelCardPayment";
	let callBackFunc = "cancelCardPaymentResponse";
	let objParam = {
		imp_uid : imp,
		amount : card
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function cancelCardPaymentResponse(result){
	let resultMap = result.cancelMap;
	if(resultMap.resultCode == 0){
		$("#card_cancel").attr("disabled", true);
		alert("결제취소완료");
	} else {
		alert(resultMap.result);
	}
}
</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/manageMember/payment_tab1">결제 현황</a></li>
        <li class="active"><a href="/admin/cubici/manageMember/payment_tab2">요금변경 관리</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>2021/02/01</span>
    </div>
</div>

<div class="m-search">
    <ul>
    	<li>
            <div class="fwBox">
                <span class="ft">구분</span>
                <div class="input">
                    <select id="division">
                        <option value="">전체</option>
                        <option value="C">변경</option>
                        <option value="R">해지</option>
                    </select>
                </div>
            </div>
        </li>
    	<li>
            <div class="fwBox">
                <span class="ft">요금제</span>
                <div class="input">
                    <select id="chargeCode">
                        <option value="">전체</option>
                    </select>
                </div>
            </div>
        </li>      
      	<li>
			<div class="fwBox">
				<span class="ft-w">변경일자</span>
				<div class="input">
					<input id="fromDate" type="text" class="startDatepicker" placeholder="시작">
				</div>
				~
				<div class="input">
					<input id="toDate" type="text" class="endDatepicker" placeholder="종료">
				</div>
			</div>
		</li>
    </ul>
    <ul>
		<li>
            <div class="fwBox">
                <span class="ft">회원명</span>
                <div class="input">
                    <input id="user_nm" type="text" placeholder="회원명">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회원ID</span>
                <div class="input">
                    <input id="user_id" type="text" placeholder="회원ID">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회사명</span>
                <div class="input">
                    <input id="firm_nm" type="text" placeholder="회사명">
                </div>
            </div>
        </li>     
        <li>
            <div class="btns">
                <button id="chargeSearch" class="sBtn sColorLB search">검색</button>
            </div>
        </li>
    </ul>
</div>

<div class="tableSet">
    <div class="m-options">
        <div class="pRight">
            <div class="fwBox">
                <span class="ft">보기기준</span>
                <div class="input">
                    <select id="sortPage">
                        <option value="payment_date">최근 순</option>
                    </select>
                </div>
            </div>
            <span class="btns">
                <a href="javascript:;" class="sBtn sColorLG excel">엑셀 다운로드</a>
            </span>
            <div class="m-filter">
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorN setting openFilter">항목 선택</a>
                </div>
                <ul class="selectList">
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>서비스</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>요금제</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>가입일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>회원ID</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                          	<input type="checkbox" class="required" disabled checked>
                            <span>회원명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="FIRM_NM" type="checkbox" checked>
                            <span>회사명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="USER_PHONE" type="checkbox" checked>
                            <span>핸드폰</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="FIRM_TEL" type="checkbox" checked>
                            <span>대표전화</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="shop_count" type="checkbox" checked>
                            <span>등록 쇼핑몰</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="FIRM_ADDR" type="checkbox" checked>
                            <span>주소</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="change_date" type="checkbox" checked>
                            <span>변경 신청일</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="beforeCharge" type="checkbox" checked>
                            <span>이전 서비스</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="status" type="checkbox" checked>
                            <span>차액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="refund_user_name" type="checkbox" checked>
                            <span>예금주</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="refund_bank" type="checkbox" checked>
                            <span>은행</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="refund_account" type="checkbox" checked>
                            <span>계좌</span>
                        </label>
                    </li>                    
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="refund_date" type="checkbox" checked>
                            <span>변경 일자</span>
                        </label>
                    </li>
                    <li class="btns">
                        <button id="opBtn" class="sBtn sColorLB wBtn">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable">
        <div class="overflowBox wide-h mCustomScrollbar">
            <div class="fixArea">
                <div class="fixRow">
                    <table class="m-shadowTable">
                        <thead>
						    <tr>
						        <th>No.</th>
						        <th>구분</th>
						        <th id="thText">이용 요금제</th>
						        <th>가입일자</th>
						        <th>회원ID</th>
						        <th>회원명 </th>
						    </tr>
						</thead>
                        <tbody id="fixTbody">
                        </tbody>
                    </table>
                </div>
                <div class="rollRow">
                    <table class="m-shadowTable">
                        <thead id="scrollThead">
                        </thead>
                        <tbody id="scrollTbody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="m-paging" id="table_paginate">
    </div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>



 <!--모달-->
<div class="modal-container pass" id="refundModal">
	<div class="modal-wrapper bg-fff">
		<header>
			<h2>서비스 환급</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal w700">
					<header class="admin-header">
						<div class="m-options">
							<h3>서비스 변경 정보</h3>
							<div class="pRight">
								<span class="baseDate pRight"><b>기준</b>${toDate}</span>
							</div>
						</div>
					</header>
					<div class="billingModal">
						<ul>
							<li class="col-0d5">
								<div class="fwBox">
									<span class="ft-w">변경 요청 요금제</span>
									<div class="input">
										<input id="chargeCode" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft-w">회원명</span>
									<div class="input">
										<input id="userNm" type="text" readOnly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w">회사명</span>
									<div class="input">
										<input id="firmNm" type="text" readOnly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w">핸드폰</span>
									<div class="input">
										<input id="userPhone" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft-w">기존 서비스</span>
									<div class="input">
										<input id="exChargeCode" type="text" readOnly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w">서비스만료</span>
									<div class="input">
										<input id="expireDate" type="text" readOnly>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w">잔여일자</span>
									<div class="input">
										<input id="restDate" type="text" readOnly>
									</div>
								</div>
							</li>
						</ul>
					</div>
					<hr />
					<div class="billingModal">						
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft-w">기존 요금제</span>
									<div class="input">
										<input id="exAmount" type="text">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w">신규 요금제</span>
									<div class="input">
										<input id="newAmount" type="text">
									</div>
								</div>
							</li>		
							<li>
								<div class="fwBox">
									<span class="ft-w">실시간 이용요금</span>
									<div class="input">
										<input id="restAmount" type="text">
									</div>
								</div>
							</li>					
						</ul>
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft-w">카드 취소</span>
									<div class="input">
										<input id="card" type="text">
									</div>
									<div>
									<button id="card_cancel" type="button" disabled>결제 취소</button>
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w">차액 환급</span>
									<div class="input">
										<input id="amount" type="text">
									</div>
								</div>
							</li>
						</ul>
					</div>
					<hr />
					<div class="billingModal">
						<ul>
							<li>
								<div class="fwBox">
									<span class="ft-w80">예금주</span>
									<div class="input">
										<input id="refundName" type="text">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w80">은행</span>
									<div class="input">
										<input id="refundBank" type="text">
									</div>
								</div>
							</li>
							<li>
								<div class="fwBox">
									<span class="ft-w80">계좌번호</span>
									<div class="input">
										<input id="refundAccount" type="text">
									</div>
								</div>
							</li>
						</ul>
					</div>
					<div class="button-box">
						<button class="bBtn3 sColorG modalClose" type="button">취소</button>
						<button class="bBtn3 sColorPB" id="finishBtn" type="button">환급완료</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
