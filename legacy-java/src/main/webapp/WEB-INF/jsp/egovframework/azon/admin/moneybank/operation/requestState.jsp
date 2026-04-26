<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style type='text/css'>
.loadFile{padding:0 10px;}

.m-shadowTable tbody tr > * {
    position: inherit;
}

</style>

<script>

//기존 검색조건 유지하기 위한 전역변수

var userNm = ""; //회원명
var firmNm = ""; //회사명
var userId = ""; //회원ID
var selectDivision = ""; // 구분
var selectStatus = ""; //신청상태
var minAmount = ""; //최소 신청금액
var maxAmount = ""; //최대 신청금액
var fromDate = ""; // 시작일
var toDate = ""; // 종료일
var selectOrderBy = ""; // ORDER BY 설정

$(document).ready(function(){
	if ("${resultCode}" === "0") {

		// Default 날짜 설정
		$("#fromDate").val("${fromDate}");
		$("#toDate").val("${toDate}");
		
		// 목록
		moneyBankRequestFunc(1, "search");
	} else {
		modalInfo("관리자에게 문의바랍니다.");
		console.log("ErrorCode ::: " + "${resultCode}");
	}
	
	// 검색 버튼
	$("#searchBtn").on("click", function(){
		moneyBankRequestFunc(1, "search");
	});
	
})

// 테이블 데이터 가져오기
function moneyBankRequestFunc(pageNo, pageFlag){
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	if(pageFlag === "search"){
		userNm = $("#userNm").val();
		firmNm = $("#firmNm").val();
		userId = $("#userId").val();
		selectDivision = $("#selectDivision option:selected").val();
		selectStatus = $("#selectStatus option:selected").val();
		minAmount = $("#minAmt").val() == '' ? 0 : $("#minAmt").val();
		maxAmount = $("#maxAmt").val() == '' ? 10000 : $("#maxAmt").val();
		fromDate = formatDate($("#fromDate").val());
		toDate = formatDate($("#toDate").val());
		selectOrderBy = $("#tableOrderBy option:selected").val();
	}
	
	// 데이터 가져오기
	let callUrl = "/admin/moneybank/request/list";
	let callBackFunc = "moneyBankRequestResponse";
	let objParam = {
		user_nm : "%"+userNm+"%", // 회원명
		firm_nm : "%"+firmNm+"%", // 회사명
		user_id : "%"+userId+"%", // 대표자명(회원명)
		division : selectDivision, // 서비스
		status : selectStatus, // 진행상태
		minAmount : minAmount*1, // 최소신청금액
		maxAmount : maxAmount*1000000, // 최대신청금액
		fromDate : fromDate, // 시작일
		toDate : toDate+' 23:59:59', // 종료일
		order_by : selectOrderBy, // ORDER BY
		limit : (pageNo-1)*10,
		NOWPAGENO : pageNo // 현페이지
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

function fixTbody(text) {
    let insertFixTbody = "<td><div>" + text + "</div></td>";
    return insertFixTbody;
}

// 테이블 그리기
function moneyBankRequestResponse(data){
	// 테이블 > 고정 컬럼
	let insertFixTbody = "";
	if(data.requestList.length > 0) {
		for(let i=0, len = data.requestList.length; i < len; i++){
			let getData = data.requestList[i];
            let useCnt = getData.use_cnt == '0' ? "신규" : getData.use_cnt + "회";
			insertFixTbody += "<tr>";
			insertFixTbody += fixTbody(getData.mb_status);
			insertFixTbody += fixTbody(useCnt);
			insertFixTbody += fixTbody(getData.mb_request_date);
			insertFixTbody += fixTbody(getData.user_id);
			insertFixTbody += fixTbody(getData.user_nm);
			insertFixTbody += fixTbody(comma(Math.round(getData.mb_sales_amount/1000)));
			insertFixTbody += fixTbody(getData.request_shop);
			insertFixTbody += fixTbody("<button class='sColorLB refund-btn' onclick='subStateDetail(" + '"' + getData["mbid"] + '"' + ")' type='button'>"+getData.sub_complete+"</button>");
			insertFixTbody += fixTbody(getData.prizm_score == null ? "<a href ='javascript:;' onclick='calcPrizmScore(" + '"' + getData["mbid"] + '"' + ")'>계산</a>" : getData.prizm_score);
			insertFixTbody += "</tr>";
		}
		$("#fixTbody").html(insertFixTbody);
		
		$(".overflowBox").mCustomScrollbar("destroy");
		$(".fixRow").css('left', '0px');
		$(".m-shadowTable").find('th').css('top', '0px');
		// 총 합계
		$("span.result:eq(0)").text(comma(data.requestSum.total) + " 건");
		$("span.result:eq(1)").text(comma(data.requestSum.request) + " 건");
		$("span.result:eq(2)").text(comma(data.requestSum.finish) + " 건");
		
		// 페이징
		let pageMaxCnt = data.requestSum.total / 10;
		let currentPage = data.currentPage - 1;
		let pageCnt = Math.floor(currentPage / 10);		

		// 페이징 버튼
		let pageHtml = "<ul>";		
		if(pageMaxCnt <10){
			for(let i =1; i <= Math.ceil(pageMaxCnt); i++){
				pageHtml += "<li><a class='num' href ='javascript:;' onclick='moneyBankRequestFunc(" + i  + ");'>" + i + "</a><li>";
			}
		} else if (pageMaxCnt >=10){
			if(pageCnt > 0){ // 이전
				pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='moneyBankRequestFunc(" + ((pageCnt)*10) + ");'><</a><li>";
			}
			for(let i=(pageCnt * 10) + 1; i<= (pageCnt*10)+10; i++){ // 1~ 10
				if(i>Math.ceil(pageMaxCnt)){
					break;
				}
				pageHtml += "<li><a class='num' href ='javascript:;' onclick='moneyBankRequestFunc(" + i  + ");'>" + i + "</a><li>";		
			}
			if(Math.floor(pageMaxCnt)>(pageCnt*10)+10){ // 다음
				pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='moneyBankRequestFunc(" + ((pageCnt+1)*10+1) + ");'><</a><li>";
			}
		}
		pageHtml += "</ul>";
		$("#pagingButton").empty().html(pageHtml);
		
		// 페이징 버튼 활성화		
		$(".num:eq(" + currentPage%10 + ")").addClass("active");
		
	} else {
		//변동 컬럼
		let insertFixTbody = '<tr><td colspan="4">조회된 결과가 없습니다.</td></tr>';
		
		$("#fixTbody").html(insertFixTbody);
		$('#table_paginate').empty();
		$("span.result:eq(0)").text("0 건");
		$("span.result:eq(1)").text("0 건");
		$("span.result:eq(2)").text("0 건");
	}
	
	// 퍼블리싱
	$('#fixTable').doFixTable();
	
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

function subStateDetail(id){
	let form= $("<form></form>");
	form.attr("name", "detailForm");
	form.attr("method", "get");
	form.attr("action", "/admin/cubici/subStateDetail");
	form.append($("<input />", {type: "hidden", name: "mbid", value: id}));
	form.appendTo("body");
	form.submit();
}

function calcPrizmScore(mbid){
	let callUrl = "/admin/moneybank/calcPrizmScore";;
	let callBackFunc = "calcPrizmScoreResponse";
	let objParam = { mbid : mbid }
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function calcPrizmScoreResponse(result){
	if(result.status){
		window.location.reload();
	} else if(result.description){
		modalReload(result.description);
	} else {
		modalReload('관리자에게 문의해 주세요.');
	}
}

</script>

<!-- 타이틀 -->
<div class="m-tab">
    <ul>
        <li class="active"><a href="javascript:;">신청 현황</a></li>
    </ul>
</div>
<!-- 기준 날짜 -->
<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
    </div>
</div>
<!-- 검색 -->
<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">회원명</span>
                <div class="input">
                    <input type="text" id="userNm">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회사명</span>
                <div class="input">
                    <input type="text" id="firmNm">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회원ID</span>
                <div class="input">
                    <input type="text" id="userId">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">서비스 구분</span>
                <div class="input">
                    <select id="selectDivision">
                        <option value="-">전체</option>
                        <option value="09">헬로-선지급</option>
                    </select>
                </div>
            </div>
        </li>
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">신청상태</span>
                <div class="input">
                    <select id="selectStatus">
                        <option value="-">전체</option>
                        <option value="00">신청</option>
                        <option value="04">완료</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
			<div class="fwBox">
				<span class="ft-w">월결제액</span>
				<div class="input unit">
					<input type="text" placeholder="최소" id="minAmt" onkeypress="return fn_press(event,'numbers');" onkeydown="fn_press_han(this);">
                    <span class="unitBox logn">원</span>
				</div>
				~
				<div class="input unit">
					<input type="text" placeholder="최대" id="maxAmt" onkeypress="return fn_press(event,'numbers');" onkeydown="fn_press_han(this);">
                    <span class="unitBox logn">백만원</span>
				</div>
			</div>
		</li>
        <li>
			<div class="fwBox">
				<span class="ft-w">신청일자</span>
				<div class="input">
					<input id="fromDate" type="text" class="startDatepicker" placeholder="시작">
				</div>
				~
				<div class="input">
					<input id="toDate" type="text" class="endDatepicker" placeholder="종료">
				</div>
			</div>
		</li>
        <li>
            <div class="btns">
                <button class="sBtn sColorLB search" id="searchBtn">검색</button>
            </div>
        </li>
    </ul>
</div>

<!-- 메인 테이블 -->
<div class="tableSet">
    <div class="m-options">
        <div class="pRight">
            <div class="fwBox">
                <span class="ft">보기기준</span>
                <div class="input">
                    <select id="tableOrderBy">
                        <option value="MUR.mb_request_date DESC">최근 순</option>
                        <option value="MUR.mb_request_date">과거 순</option>
                    </select>
                </div>
            </div>
            <span class="btns">
                <a href="javascript:;" class="sBtn sColorLG excel">엑셀 다운로드</a>
            </span>
        </div>
    </div>
    
    <div id="fixTable" class="fixTable">
		<div class="overflowBox mCustomScrollbar">
			<table class="m-shadowTable">
				<thead>
					<tr>
						<th width="5%">상태</th>
						<th width="10%">재이용</th>
						<th width="10%">신청일자</th>
						<th width="20%">회원ID</th>
						<th width="15%">회원명</th>
						<th width="10%">월결제액(천원)</th>
						<th width="10%">등록쇼핑몰</th>
						<th width="10%">제출서류 확인</th>
						<th width="10%">프리즘 점수</th>
					</tr>
				</thead>
				<tbody id="fixTbody">
				</tbody>
			</table>			
		</div>
		<div class="fixBottom">
    		<ul class="tableTotal">
    			<li>
    				<span class="txt">총 신청 접수</span>
    				<span class="result"></span>
    			</li>
    			<li>
    				<span class="txt">신청 진행</span>
    				<span class="result"></span>
    			</li>
    			<li>
    				<span class="txt">신청 완료</span>
    				<span class="result"></span>
    			</li>
	    	</ul>
	    </div>
    </div>
    <div class="m-paging" id="pagingButton">
    </div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>