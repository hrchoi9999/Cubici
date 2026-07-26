<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script>
// 기존 검색조건 유지하기 위한 전역변수
var selectDivision = ""; // 구분
var shopTypeList = ""; // 쇼핑몰
var fromDate = ""; // 시작일
var toDate = ""; // 종료일
var selectLimit = 0; // LIMIT 설정
var selectOrderBy = ""; // ORDER BY 설정
var productName = ""; // 제품명

$(document).ready(function() {
	if ("${resultCode}" === "0") {
		
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
		
		for(let i=0; i<Number("${shopInfoMap.shop_count}"); i++){
			$("#selectShop").append("<option value="+shopTypeList[i]+">"+shopNameList[i]+"</option>");
		}
		
		$("#fromDate").val("${fromDate}");
		$("#toDate").val("${toDate}");
		
		// 정산내역 목록
		settlementFunc(1, "search");
	} else {
		modalInfo("관리자에게 문의바랍니다.");
		console.log("ErrorCode ::: " + "${resultCode}");
	}
	
	// 검색 버튼
	$(document).on('click', "#selectButton", function(){
		// 정산내역 목록
		settlementFunc(1, "search");
 	});
	
	// Excel 출력
	$("#excelBtn").on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41" || thisUser == "40"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			let yearMonth = nowYear+"-"+nowMonth; 
			doExcelDownloadProcess(yearMonth);
		}
	});
});

// 날짜확인
function dateCheck(){
	//오늘 날짜
	let now = new Date();
	let nowYear= now.getFullYear();
	let nowMonth = (now.getMonth()+1) > 9 ? ''+(now.getMonth()+1) : '0'+(now.getMonth()+1);
	let nowDay = now.getDate() > 9 ? ''+now.getDate() : '0'+now.getDate();
	
	// 시작일, 종료일
	let fromDate = formatDate($("#fromDate").val());
	let toDate = formatDate($("#toDate").val());
	
	// 날짜 비교
	let nowDate = new Date(nowYear+"/"+nowMonth+"/"+nowDay); // 오늘 날짜랑
	let tempFromDate = fromDate.split("-");
	let compareFromDate = new Date(tempFromDate[0]+"/"+tempFromDate[1]+"/"+tempFromDate[2]); // 가져올 날짜랑 비교
	let tempToDate = toDate.split("-");
	let compareToDate = new Date(tempToDate[0]+"/"+tempToDate[1]+"/"+tempToDate[2]); // 가져올 날짜랑 비교
	
	// 정산예정일 때 둘 중에 하나라도 오늘날짜 이전이면
	if(selectDivision === "pre"){
		if(nowDate.getTime() > compareFromDate.getTime() || nowDate.getTime() > compareToDate.getTime()){
			modalInfo("정산예정 금액은 오늘날짜부터 조회할 수 있습니다.");
			return false;
		}
	}
	// 정산입금일 때 둘 중에 하나라도 오늘날짜 이후이면
	if(selectDivision === "settlement"){
		if(nowDate.getTime() <= compareFromDate.getTime() || nowDate.getTime() <= compareToDate.getTime()){
			modalInfo("정산입금 금액은 어제날짜까지 조회할 수 있습니다.");
			return false;
		}
	}
}

// 정산예정 / 정산입금 목록
function settlementFunc(pageNo, pageFlag){

	// 선택옵션 숨기기
	$('.selectList').css("display", "none");
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	if(pageFlag === "search"){
		selectDivision = $("#selectDivision option:selected").val();// 구분
		shopTypeList = $("#selectShop option:selected").val(); // 쇼핑몰
		if(shopTypeList === "0"){ // 전체 선택
			shopTypeList = "${shopInfoMap.shop_type_list}";
		} 
		fromDate = formatDate($("#fromDate").val()); // 시작일
		toDate = formatDate($("#toDate").val());// 종료일
		selectLimit = $("#tableLimit option:selected").val(); // LIMIT 설정
		selectOrderBy = $("#tableOrderBy option:selected").val();// ORDER BY 설정
		productName = $("#productName").val();// 제품명
	}
	
	let limitStr = selectLimit*(pageNo-1) + ", " + selectLimit;// LIMIT
	
	dateCheck(); // 날짜 확인
	
	let callUrl = "/cubici/calculateInfo/details/get";
	let callBackFunc = "settlementFuncResponse";
	let objParam = {
		calculatePreFlag : "details",
		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		AUCTION_ONLINE_REMIT_DATE : "${shopInfoMap.auction_online_remit_date}",
		ELEVEN_SHOP_GRADE_DATE : "${shopInfoMap.eleven_shop_grade_date}",
		FLAG : selectDivision, // 구분
		SHOP_TYPE_LIST : shopTypeList, // 쇼핑몰
		fromDate : fromDate, // 시작일
		toDate : toDate, // 종료일
		LIMIT : limitStr, // LIMIT
		ORDER_BY : selectOrderBy, // ORDER BY
		PRODUCT_NAME : "%"+productName+"%", // 제품명
		NOWPAGENO : pageNo // 현페이지
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function settlementFuncResponse(data){
	
	let maxRowNo = 0; // 불러온 데이터중 가장 마지막 번호
	
	// 버튼 색깔
	let btnColor = (data.FLAG === "pre") ? "sColorN" : "sColorLS";
	
	// 컬럼 초기화
	let varTheadArray = [];
	let varTheadBody = [];
	
	$(".columnCheck:checked").each(function(i, item) {
		varTheadArray[i] = $(item).next().text();
		varTheadBody[i] = $(item).attr("id");
	});
	
	// 테이블 > 변동 컬럼
	// 테이블 헤드
	let insertScrollThead = "<tr>";
	for(let i=0; i<varTheadArray.length; i++){
		insertScrollThead += "<th>"+varTheadArray[i]+"</th>";
	}
	insertScrollThead += "</tr>";
	
	// 테이블 > 고정 컬럼
	let insertFixTbody = "";
	if(data.settlementList.length > 0) {
		for(let i=0, len = data.settlementList.length; i < len; i++){
			let getData = data.settlementList[i];
			insertFixTbody += "<tr>";
			insertFixTbody += "<th><div class='tIn'>"+getData.ORDERED_AT_TIME+"</div></th>";
			insertFixTbody += "<td><div class='tIn'>"+getData.SHOP+"</div></td>";
			insertFixTbody += "<td><div class='tIn'><a href='javascript:;' class='underline modalOpen' data-modal='c2p1' onclick='selectOrderDetails("+getData.ORDER_NO+");'>"+getData.ORDER_NO+"</a></div></td>";
			insertFixTbody += "<td><div class='tIn'><span class='sBtn "+btnColor+" rBtn'>"+getData.STATUS+"</span></div></td>";
			insertFixTbody += "</tr>";
			if(i === data.settlementList.length-1){
				maxRowNo = getData.RNUM;
			}
		}
		
		// 테이블 바디
		let insertScrollTbody = "";
		for(let i=0, len = data.settlementList.length; i < len; i++){
			let getData = data.settlementList[i];
			insertScrollTbody += "<tr>";
			for(let i=0; i<varTheadArray.length; i++){				
				insertScrollTbody += "<td><div class='tIn'>";
				
				let ThValue = varTheadArray[i];
				let TbValue = varTheadBody[i];
				
				if((ThValue == "판매단가") || (ThValue == "판매단가") || (ThValue == "판매단가") || (ThValue == "판매단가")) {
					insertScrollTbody += getData.PRODUCT_NAME;
				} else {
					insertScrollTbody += comma(getData.SETTLEMENT_AMOUNT_PRE);
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
		
		// 총 합계
		$("span.result:eq(0)").text(comma(data.totalCount) + " 건")
		$("span.result:eq(1)").text(comma(data.settlementSum) + " 원")
		
		// 페이징
		let pageMaxCnt = data.totalCount / selectLimit ;
		let currentPage = data.currentPage - 1;
		let pageCnt = Math.floor(currentPage / 10);		
		
		// 페이징 버튼
		let pageHtml = "<ul>";		
		if(pageMaxCnt <10){
			for(let i =1; i <= Math.ceil(pageMaxCnt); i++){
				pageHtml += "<li><a class='num' href ='javascript:;' onclick='settlementFunc(" + i  + ");'>" + i + "</a><li>";
			}
		} else if (pageMaxCnt >=10){
			if(pageCnt > 0){ // 이전
				pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='settlementFunc(" + ((pageCnt)*10) + ");'><</a><li>";
			}
			for(let i=(pageCnt * 10) + 1; i<= (pageCnt*10)+10; i++){ // 1~ 10
				if(i>Math.ceil(pageMaxCnt)){
					break;
				}
				pageHtml += "<li><a class='num' href ='javascript:;' onclick='settlementFunc(" + i  + ");'>" + i + "</a><li>";		
			}
			if(Math.floor(pageMaxCnt)>(pageCnt*10)+10){ // 다음
				pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='settlementFunc(" + ((pageCnt+1)*10+1) + ");'><</a><li>";
			}
		}
		pageHtml += "</ul>";
		$("#pagingButton").empty().html(pageHtml);
		
		// 페이징 버튼 활성화		
		$(".num:eq(" + currentPage%10 + ")").addClass("active");
	} else {
		//테이블 고정컬럼
		let insertFixTbody = '<tr><td></td></tr>';
		//변동 컬럼
		let insertScrollTbody = '<tr><td colspan="4">조회된 결과가 없습니다.</td></tr>';
		
		$("#fixTbody").html(insertFixTbody);
		$("#scrollThead").html(insertScrollThead);
		$("#scrollTbody").html(insertScrollTbody);
		$('#table_paginate').empty();
		$("span.result:eq(0)").text("0 건");
		$("span.result:eq(1)").text("0 원");
	}
	
	// 퍼블리싱
	$('#fixTable').doFixTable();
	
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

// 정산정보 상세모달
function selectOrderDetails(orderNo){
	
	let selectDivision = $("#selectDivision option:selected").val();
	let selectShop = $("#selectShop option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	
	let shopTypeList = "";
	if(selectShop === "0"){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}
	
	let callUrl = "/cubici/calculateInfo/details/detailOrderNo";
	let callBackFunc = "detailOrderNoFuncResponse";
	let objParam = {
		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		AUCTION_ONLINE_REMIT_DATE : "${shopInfoMap.auction_online_remit_date}",
		ELEVEN_SHOP_GRADE_DATE : "${shopInfoMap.eleven_shop_grade_date}",
		ORDER_NO : orderNo,
		SELECT_DIVISION : selectDivision,
		FLAG : selectDivision,
		SHOP_TYPE_LIST : shopTypeList,
		fromDate : fromDate,
		toDate : toDate,
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%",
		DETAIL : "DETAIL"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function detailOrderNoFuncResponse(data){
	// 주문정보 (구매자 정보)
	let SHOP = "<p>"+data.detailResultList[0].SHOP+"</p>"; // 쇼핑몰
	let CUSTOM_NAME = "<p>"+data.detailResultList[0].CUSTOM_NAME+"</p>"; // 구매자
	let ORDER_NO = "<p>"+data.detailResultList[0].ORDER_NO+"</p>"; // 주문번호
	let CUSTOM_PHONE = "<p> - </p>"; // 핸드폰
	let CUSTOM_ID = "<p>"+data.detailResultList[0].CUSTOM_ID+"</p>"; // 구매자 ID

	$("#SHOP_VALUE").empty().html(SHOP);
	$("#CUSTOM_NAME_VALUE").empty().html(CUSTOM_NAME);
	$("#ORDER_NO_VALUE").empty().html(ORDER_NO);
	$("#CUSTOM_PHONE_VALUE").empty().html(CUSTOM_PHONE);
	$("#CUSTOM_ID_VALUE").empty().html(CUSTOM_ID);
	$("#PHONE_VALUE").empty().html(CUSTOM_PHONE);
	
	// 수량, 금액, 상세판매내역 초기화
	let insertTable = "";
	let quantity = 0;
	let orderPrice =0;
	
	// 상세 판매내역 테이블
	for(let i=0; i<data.detailResultList.length; i++){
		insertTable += "<tr>";
		insertTable += "<td><div class=\"tIn tal\">"+data.detailResultList[i].ORDERED_AT+"</div></td>";
		insertTable += "<td><div class=\"tIn tal\">"+data.detailResultList[i].PRODUCT_NAME+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+data.detailResultList[i].PRODUCT_NO+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+data.detailResultList[i].ORDER_NO+"</div></td>";
		insertTable += "<td><div class=\"tIn\">-</div></td>";
		insertTable += "<td><div class=\"tIn\">"+data.detailResultList[i].QUANTITY+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+comma(data.detailResultList[i].PRODUCT_PRICE)+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+comma(data.detailResultList[i].ORDER_PRICE)+"</div></td>";
		insertTable += "</tr>";
		quantity += data.detailResultList[i].QUANTITY;
		orderPrice += data.detailResultList[i].ORDER_PRICE;
	}

	// 합계 (수량, 주문금액)
	insertTable += "<td colspan= \"5\"></td><td>"+quantity+"</td>"+"<td></td><td>"+comma(orderPrice)+"</td>";
	$("#detailModalTbody").empty().html(insertTable);

/* 	// 배송정보 (택배사, 송장번호, 구분)
	let DELIVERY_COMPANY_NAME = "<p>"+data.salesList[0].DELIVERY_COMPANY_NAME+"</p>"; // 택배사
	let INVOICE_NO = "<p>"+data.salesList[0].INVOICE_NO+"</p>"; // 송장번호
	let DELIVERY_CHARGE_TYPE = "<p>"+data.salesList[0].DELIVERY_CHARGE_TYPE+"</p>"; // 배송비구분
	
	$("#DELIVERY_COMPANY_NAME_VALUE").empty().html(DELIVERY_COMPANY_NAME);
	$("#INVOICE_NO_VALUE").empty().html(INVOICE_NO);
	$("#DELIVERY_CHARGE_TYPE_VALUE").empty().html(DELIVERY_CHARGE_TYPE);
	
	// 배송정보 (수령인 정보)
	let RECEIVER_NAME = "<p>"+data.salesList[0].RECEIVER_NAME+"</p>"; // 수령자
	let RECEIVER_CONTACT1 = "<p>"+data.salesList[0].RECEIVER_CONTACT1+"</p>"; // 핸드폰
	let RECEIVER_PHONE = "<p>"+data.salesList[0].RECEIVER_PHONE+"</p>"; // 전화번호
	let RECEIVER_ADDR = "<p>&nbsp;&nbsp;&nbsp;&nbsp;"+data.salesList[0].RECEIVER_ADDR+"</p>"; // 수령자 주소
	let ZIP_CODE = "<p>"+data.salesList[0].ZIP_CODE+"</p>"; // 우편번호
	
	$("#RECEIVER_NAME_VALUE").empty().html(RECEIVER_NAME);
	$("#RECEIVER_CONTACT1_VALUE").empty().html(RECEIVER_CONTACT1);
	$("#RECEIVER_PHONE_VALUE").empty().html(RECEIVER_PHONE);
	$("#RECEIVER_ADDR_VALUE").empty().html(RECEIVER_ADDR);
	$("#ZIP_CODE_VALUE").empty().html(ZIP_CODE); */

	// 모달 띄워줌
	modalOpen("c2p1");
	
}

/*** Excel 다운로드 (MKC 2021.04.20) ***/
function doExcelDownloadProcess(yearMonth) {
	
	// Header 가져오기
	let mainTable = document.getElementById('fixTable').getElementsByTagName('thead')[1].getElementsByTagName('th'); // 0 element는 고정이라 필요 없음
	let mainTableArr = new Array();
	for(var i = 0; i<mainTable.length; i++){	
		mainTableArr.push(mainTable[i].textContent); // 각 thead의 th text를 저장
	}
	
	// 구분
	let selectDiv = $("#selectDivision option:selected").val();
	
	// 쇼핑몰 선택
	let selectShop = $("#selectShop option:selected").val();
	let shopTypeList = "";
	let shopNameListStr = "";
	if(selectShop === "0"){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}"; // 전체 쇼핑몰 코드
		
		let shopNameList = "${shopInfoMap.shop_name_list}";
		shopNameListStr = shopNameList.replace(/\^/gi, "").replace(/\|/gi, ","); // 전체 쇼핑몰명
		
	} else {
		shopTypeList = selectShop; // 쇼핑몰 코드
		
		// 쇼핑몰명
		if(selectShop === "1"){
			shopNameListStr = "인터파크";
		}else if(selectShop === "2"){
			shopNameListStr = "지마켓";
		}else if(selectShop === "3"){
			shopNameListStr = "옥션";
		}else if(selectShop === "4"){
			shopNameListStr = "11번가";
		}else if(selectShop === "11"){
			shopNameListStr = "쿠팡";
		}else if(selectShop === "14"){
			shopNameListStr = "네이버";
		}
	}
	
	// 보기설정
	let selectOrderBy = $("#tableOrderBy option:selected").val();
	
	// 시작일
	let fromDate = formatDate($("#fromDate").val());
	
	// 종료일
	let toDate = formatDate($("#toDate").val());
	
	// 날짜 비교
	let nowDate = new Date(nowYear+"/"+nowMonth+"/"+nowDay); // 오늘 날짜랑
	let tempFromDate = fromDate.split("-");
	let compareFromDate = new Date(tempFromDate[0]+"/"+tempFromDate[1]+"/"+tempFromDate[2]); // 비교할 시작일
	let tempToDate = toDate.split("-");
	let compareToDate = new Date(tempToDate[0]+"/"+tempToDate[1]+"/"+tempToDate[2]); // 비교할 마지막일
	
	// 둘 중에 하나라도 오늘날짜 이전이면 정산예정 x
	if(selectDiv === "pre"){
		if(nowDate.getTime() > compareFromDate.getTime() || nowDate.getTime() > compareToDate.getTime()){
			modalInfo("정산예정 금액은 오늘날짜부터 출력이 가능합니다.");
			return false;
		}
	}
	// 둘 중에 하나라도 오늘날짜 이후이면 정산입금 x
	if(selectDiv === "settlement"){
		if(nowDate.getTime() <= compareFromDate.getTime() || nowDate.getTime() <= compareToDate.getTime()){
			modalInfo("정산입금 금액은 어제날짜까지 출력이 가능합니다.");
			return false;
		}
	}
	
	// 초기화
	if ($("#excelForm").html != null) {
		$("#excelForm").remove();
	}

	// form 태그 생성
	var formHtml = "";
	formHtml = '<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data" style="display: none">'
	formHtml += '<input type="hidden" name="excelFlag" value="detail">';
	formHtml += '<input type="hidden" name="userNo" value="${principal.user_no}">';
	formHtml += '<input type="hidden" name="coupang_settle_type" value="${principal.coupang_settlement_type}">';
	formHtml += '<input type="hidden" name="auction_online_remit_date" value="${shopInfoMap.auction_online_remit_date}">';
	formHtml += '<input type="hidden" name="eleven_shop_grade_date" value="${shopInfoMap.eleven_shop_grade_date}">';
	formHtml += '<input type="hidden" name="fromDate" value="'+fromDate+'">';
	formHtml += '<input type="hidden" name="toDate" value="'+toDate+'">';
	formHtml += '<input type="hidden" name="shop_type_list" value="'+shopTypeList+'">';
	formHtml += '<input type="hidden" name="shop_name_list" value="'+shopNameListStr+'">';
	formHtml += '<input type="hidden" name="interpark_id" value="${shopInfoMap.interpark_id}">';
	formHtml += '<input type="hidden" name="eleven_id" value="${shopInfoMap.eleven_id}">';
	formHtml += '<input type="hidden" name="gmarket_id" value="${shopInfoMap.gmarket_id}">';
	formHtml += '<input type="hidden" name="auction_id" value="${shopInfoMap.auction_id}">';
	formHtml += '<input type="hidden" name="naver_id" value="${shopInfoMap.naver_id}">';
	formHtml += '<input type="hidden" name="coupang_id" value="${shopInfoMap.coupang_id}">';
	formHtml += '<input type="hidden" name="selectOrderBy" value="'+selectOrderBy+'">';
	formHtml += '<input type="hidden" name="selectDiv" value="'+selectDiv+'">';
	formHtml += '<input type="hidden" name="this_header" value="'+mainTableArr+'">';
	formHtml += '</form>';
	$(".excelDiv").append(formHtml);

	var exlForm = document.excelForm;
	exlForm.action = "/cubici/calculateInfo/settlement/excelDownload";
	exlForm.submit();
}

</script>

<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
            	<span class="ft">구분</span>
                <div class="input">
                    <select id="selectDivision">
                        <option value="pre">정산예정</option>
                        <option value="settlement">정산입금</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">쇼핑몰</span>
                <div class="input">
                    <select id="selectShop">
                        <option value="0">전체</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
            	<span class="ft">제품명</span>
                <div class="input">
                    <input type="text" id="productName" placeholder="제품명">
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button class="sBtn sColorLG excel" id="excelBtn">엑셀 다운로드</button>
                <div class="excelDiv"></div>
            </div>
        </li>
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">시작</span>
                <div class="input">
                    <input type="text" class="startDatepicker" id="fromDate" placeholder="시작기간">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">종료</span>
                <div class="input">
                    <input type="text" class="endDatepicker" id="toDate" placeholder="종료기간">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">보기설정</span>
                <div class="input">
                    <select id="tableOrderBy">
                        <option value="ORDERED_AT_TIME DESC">주문일자</option>
						<option value="SHOP">쇼핑몰</option>
						<option value="SETTLEMENT_DATE_PRE DESC">정산예정일</option>
						<option value="SETTLEMENT_DATE DESC">정산입금일</option>
                    </select>
                </div>
            </div>
        </li>

        <li>
            <div class="btns">
                <button id="selectButton" class="sBtn sColorLB search">검색</button>
            </div>
        </li>
    </ul>
</div>

<div class="tableSet">
    <div class="m-options">
        <div class="pRight">
            <div class="fwBox">
                <span class="ft">페이지 보기 설정</span>
                <div class="input">
                    <select id="tableLimit">
                        <option value="10">10개</option>
                        <option value="25">25개</option>
                        <option value="50">50개</option>
                    </select>
                </div>
            </div>
            <div class="m-filter">
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorN setting openFilter">선택옵션</a>
                </div>
                <ul class="selectList">
                	<li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>주문일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>쇼핑몰</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>주문번호</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>진행상태</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productNM" class="columnCheck" checked>
                            <span>상품명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productNo" class="columnCheck" checked>
                            <span>상품번호</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="customerName" class="columnCheck" checked>
                            <span>구매자명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="customerId" class="columnCheck" checked>
                            <span>구매자ID</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productPrice" class="columnCheck" checked>
                            <span>판매단가</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="quantity" class="columnCheck" checked>
                            <span>판매수량</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="orderPrice" class="columnCheck" checked>
                            <span>주문금액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="invoiceNo" class="columnCheck" checked>
                            <span>송장번호</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="deliveryCompany" class="columnCheck" checked>
                            <span>택배사</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="deliveryDate" class="columnCheck" checked>
                            <span>배송완료일</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="settlementDatePre" class="columnCheck" checked>
                            <span>정산예정일</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="settlementAmountPre" class="columnCheck" checked>
                            <span>정산예정액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="settlementDate" class="columnCheck" checked>
                            <span>정산입금일</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="settlementAmount" class="columnCheck" checked>
                            <span>정산입금액</span>
                        </label>
                    </li>
                    <li class="btns">
                        <button class="sBtn sColorLB wBtn" onclick="tableSearch();">옵션 확인</button>
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
								<th>주문일자</th>
								<th>쇼핑몰</th>
								<th>주문번호</th>
								<th>진행상태</th>
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
    				<span class="txt">총 주문건수 합계</span>
    				<span class="result"></span>
    			</li>
    			<li>
    				<span class="txt">정산금액</span>
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

<!-- 상세내역 Modal -->
<div class="modal-container" id="c2p1" style="display: none;">
    <div class="modal-wrapper">
        <header>
            <h2>정산 상세정보</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner mArticleArea">
                <article class="m-modalGrid">
                    <div class="contentsArea">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">구매자</span>
                                    <div class = "input" id = "CUSTOM_NAME_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">주문번호</span>
									<div class = "input" id = "ORDER_NO_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">핸드폰</span>
                                    <div class = "input" id = "CUSTOM_PHONE_VALUE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">쇼핑몰</span>
                                    <div class = "input" id = "SHOP_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">구매자 ID</span>
                                    <div class = "input" id = "CUSTOM_ID_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">전화번호</span>
                                    <div class = "input" id = "PHONE_VALUE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <article>
                    <header>
                        <h3>상세판매 내역</h3>
                    </header>
                    <div class="contentsArea">
                        <div class="maxHeight">
                            <table class="m-shadowTable">
                                <thead>
                                    <tr>
                                        <th class="tal">주문일시</th>
                                        <th class="tal">상품명</th>
                                        <th>쇼핑몰상품번호</th>
                                        <th>상품주문번호</th>
                                        <th>내부관리번호</th>
                                        <th>수량</th>
                                        <th>판매단가</th>
                                        <th>주문금액</th>
                                    </tr>
                                </thead>
                                <tbody id="detailModalTbody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </article>
              <!--   <article class="m-modalGrid">
                    <header>
                        <h3>배송정보</h3>
                    </header>
                    <div class="contentsArea">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">택배사</span>
                                 	<div class = "input" id = "DELIVERY_COMPANY_NAME_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">송장번호</span>
                                 	<div class = "input" id = "INVOICE_NO_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">배송비 구분</span>
                                    <div class = "input" id = "DELIVERY_CHARGE_TYPE_VALUE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item hasTopLine">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">수령자</span>
                                    <div class = "input" id = "RECEIVER_NAME_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">핸드폰</span>
                                    <div class = "input" id = "RECEIVER_CONTACT1_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">전화번호</span>
                                    <div class = "input" id = "RECEIVER_PHONE_VALUE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">배송 주소</span>
                                    <div class = "input" id = "ZIP_CODE_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li class="col-2">
                                <div class="fwBox">
                                	<div class = "input" id = "RECEIVER_ADDR_VALUE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article> -->
                <div class="btnArea">
                    <a href="javascript:;" class="modalClose mBtn sColorLB">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>