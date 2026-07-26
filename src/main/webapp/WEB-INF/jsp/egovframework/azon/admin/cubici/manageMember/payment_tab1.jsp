<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
var user_nm = "";
var firm_nm = "";
var fromDate = "";
var toDate = "";
var user_id = "";
var currentPage = 0;

$(document).ready(function() {
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");
	
	setPaymentList(1);
	
	$(document).on("click", "#paymentSearch", function(){
		setPaymentList(1);
	});
	
	$(document).on("click", "#opBtn", function(){
		setPaymentList(1);
	});
});

function setData(){
	user_nm = $("#user_nm").val();
	firm_nm = $("#firm_nm").val();
	fromDate = $("#fromDate").val();
	toDate = $("#toDate").val();
	user_id = $("#user_id").val();
}

function setPaymentList(currentPage){
	
	currentPage = currentPage-1; // 현재 페이지 0부터
	let dataCnt = currentPage*10;
	setData();
	
	let callUrl = "/admin/cubici/manageMember/paymentList";
	let callBackFunc = "getPaymentList";
	let objParam = {
		user_nm : user_nm,
		firm_nm : firm_nm,
		fromDate : fromDate,
		toDate : toDate,
		user_id : user_id,
		userType : $('#userType').val(),
		dataCnt : dataCnt,
		sortPage : $('#sortPage').val()
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function getPaymentList(result){
	
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
		insertScrollThead += "<th>" + varTheadArray[i] + "</th>";
	}
	insertScrollThead += "</tr>";
	
	// 고정컬럼
	let insertFixTbody = "";
	if(result.paymentList.length > 0){
		$("#thText").html("이용 요금제");
		for(let i=0, len = result.paymentList.length; i < len; i++){
			let getData = result.paymentList[i];
			insertFixTbody += "<tr>";
			insertFixTbody += "<td><div class='tIn'>" + getData.RNUM + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.charge_name + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.REG_DATE + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.USER_ID + "</div></td>";
			insertFixTbody += "<td><div class='tIn'>" + getData.USER_NM + "</div></td>";
			insertFixTbody += "</tr>";
		}
	    
		// 변동 tbody
		let insertScrollTbody = "";
		for(let i=0, len = result.paymentList.length; i < len; i++){	
			let getData = result.paymentList[i];
			insertScrollTbody += "<tr>";
			for(let j=0, len = varTheadArray.length; j < len; j++){
				insertScrollTbody += "<td><div class='tIn'>";
				// 내용
				let sum_cnt = parseInt(getData.sum_COUNT)-1;
				let ThValue = varTheadArray[j];
				let TbValue = varTheadBody[j];
				if (ThValue == "결제금액" || ThValue == "결제수수료" || ThValue == "부가세" || ThValue == "순수입") {
					insertScrollTbody += (getData[TbValue] == null) ? "-" : comma(getData[TbValue]);	
				} else {
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
		
		// 합계
		$("#SUM_CNT").text(comma(result.paymentList[0].CNT) + " 건");
		$('#SUM_AMOUNT').text(comma(result.paymentSumMap.SUM_AMOUNT) + " 원");
		$('#SUM_PAYMENT_FEE').text(comma(result.paymentSumMap.SUM_PAYMENT_FEE) + " 원");
		$("#SUM_VAT").text(comma(result.paymentSumMap.SUM_VAT) + " 원");
		$("#SUM_PROFIT").text(comma(result.paymentSumMap.SUM_PROFIT) + " 원");
		
		// 페이징
		let pageMaxCnt = result.paymentList[0].CNT / 10 ;
		let pageCnt = Math.floor(currentPage / 10);
		
		let pageHtml = "<ul>";
		
		if(pageMaxCnt < 10){ //페이지 10개 미만
			for(let i = 1, len = Math.ceil(pageMaxCnt); i <= len; i++){
				pageHtml += "<li><a class='num' href='javascript:;' onclick='setPaymentList(" + i + ");'>" + i + "</a></li>";
			}
		} else if (pageMaxCnt >= 10) { // 페이지 10개 이상
			if( pageCnt > 0 ){ //이전				
				pageHtml += "<li><a class='oiBtn prev' href='javascript:;' onclick='setPaymentList(" + ((pageCnt)*10)+ ");'></a></li>";	
			}
			for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ //1~10
				if( i > Math.ceil(pageMaxCnt)) break; // 최대 페이지수 까지만 생성
				pageHtml += "<li><a class='num' href='javascript:;' onclick='setPaymentList(" + i + ");'>" + i + "</a></li>";
			}	
			if(Math.floor(pageMaxCnt) > (pageCnt*10) + 10){ //다음
				pageHtml += "<li><a class='oiBtn next' href='javascript:;' onclick='setPaymentList(" + ((pageCnt+1)*10 + 1) + ");'></a></li>";
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

		$("#SUM_CNT").text("0 건");
		$('#SUM_AMOUNT').text("0 원");
		$('#SUM_PAYMENT_FEE').text("0 원");
		$("#SUM_VAT").text("0 원");
		$("#SUM_PROFIT").text("0 원");
	}
	// 퍼블리싱
	$('#fixTable').doFixTable();
	
	if($("#fixTable").css("visibility") === "hidden"){
		$("#fixTable").css("visibility", "visible");
	}
	
	$(".loadingSpinner").css({"display" : "none"});// 로딩바 해제
	
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="/admin/cubici/manageMember/payment_tab1">결제 현황</a></li>
        <li><a href="/admin/cubici/manageMember/payment_tab2">요금변경 관리</a></li>
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
                <span class="ft">회원명</span>
                <div class="input">
                    <input id="user_nm" type="text" placeholder="회원명">
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
			<div class="fwBox">
				<span class="ft-w">결제일자</span>
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
                <span class="ft">회원ID</span>
                <div class="input">
                    <input id="user_id" type="text" placeholder="회원ID">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">대표자</span>
                <div class="input">
                    <input type="text" placeholder="대표자">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회원구분</span>
                <div class="input">
                    <select id="userType">
                        <option value="">전체</option>
                        <option value="01">큐빅아이</option>
                        <option value="02">큐빅/머니</option>
                        <option value="03">머니뱅크</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button id="paymentSearch" class="sBtn sColorLB search">검색</button>
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
                            <input type="checkbox" checked>
                            <span>대표자</span>
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
                            <input class="columnCheck" id="expire_date" type="checkbox" checked>
                            <span>서비스 만료</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="payment_date" type="checkbox" checked>
                            <span>결제일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="amount" type="checkbox" checked>
                            <span>결제금액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="payment_fee" type="checkbox" checked>
                            <span>결제수수료</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="vat" type="checkbox" checked>
                            <span>부가세</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input class="columnCheck" id="profit" type="checkbox" checked>
                            <span>순수입</span>
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
        <div class="overflowBox mCustomScrollbar">
            <div class="fixArea">
                <div class="fixRow">
                    <table class="m-shadowTable">
                        <thead>
                            <tr>
                            	<th>No</th>
                                <th>요금제</th>
                                <th>가입일자</th>
                                <th class="tal">회원 ID</th>
                                <th>회원명</th>
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
        <div class="fixBottom">
            <ul class="tableTotal">
                <li>
                    <span class="txt">결제건수</span>
                    <span id="SUM_CNT" class="result"> 건</span>
                    <br>
                    <span class="txt">결제금액</span>
                    <span id="SUM_AMOUNT" class="result"> 건</span>
                </li>
                <li>
                    <span class="txt">결제수수료</span>
                    <span id="SUM_PAYMENT_FEE" class="result"> 명</span>
                    <br>
                    <span class="txt">부가가치세</span>
                    <span id="SUM_VAT" class="result"> 명</span>
                </li>
                <li>
                    <span class="txt">순수익</span>
                    <span id="SUM_PROFIT" class="result"> 명</span>
                </li>
            </ul>
        </div>
    </div>
    <div class="m-paging" id="table_paginate">
    </div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>
