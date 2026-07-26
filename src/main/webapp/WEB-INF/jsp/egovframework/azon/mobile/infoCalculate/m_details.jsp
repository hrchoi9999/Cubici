<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<script>
//오늘 날짜
const curr = new Date();
const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
const kr_curr = new Date(utc + KR_TIME_DIFF);

const now = kr_curr;
const nowYear= now.getFullYear();
const nowMonth = (now.getMonth()+1) > 9 ? ''+(now.getMonth()+1) : '0'+(now.getMonth()+1);
const nowDay = now.getDate() > 9 ? ''+now.getDate() : '0'+now.getDate();

// 페이징
var pagingMaxNo = 0; // 페이징 번호 1, 11, 21, 31, ... -> 페이징 버튼 생성에 사용
var nowPageNo = 0; // 현재 페이징 번호 -> 페이징 버튼 활성화에 사용

// 기존 검색조건 유지하기 위한 전역변수
var varSelectDivision = ""; // 구분
var varShopTypeList = ""; // 쇼핑몰
var varFromDate = ""; // 시작일
var varToDate = ""; // 종료일
var varSelectLimit = 0; // LIMIT 설정
var varSelectOrderBy = ""; // ORDER BY 설정
var varProductName = ""; // 제품명

//컬럼 이름 배열
var varTheadArray = new Array();

$(document).ready(function() {
	// 쇼핑몰 정보 & 날짜 정보 Display
	if ("${resultCode}" === "0") {
		
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
		
		for(let i=0; i<Number("${shopInfoMap.shop_count}"); i++){
			$("#selectShop").append("<option value="+shopTypeList[i]+">"+shopNameList[i]+"</option>");
		}
		
		$("#fromDate").val("${fromDate}");
		$("#toDate").val("${toDate}");
		
		// 정산내역 테이블
		tableSearch();
		
	} else {
		modalInfo("관리자에게 문의바랍니다.");
		console.log("ErrorCode ::: " + "${resultCode}");
	}
	
	// 검색 버튼
	$(document).on('click', "#selectButton", function(){
		// 정산내역 목록
		tableSearch();
 	});
	
	// Excel 출력 버튼
	$("#excelBtn").on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			let yearMonth = nowYear+"-"+nowMonth; 
			doExcelDownloadProcess(yearMonth);
		}
	});
	
	// 선택 옵션 Modal
	$(".openFilter").on("click", function(){
		
		// 선택옵션 다시 보이도록 설정
		$('.selectList').css("display", "block");
		modalOpen("c2p1-filter");
	});
	
	// 선택옵션 확인
	$("#getOption").on("click", function(){
		tableSearch();
	});
	
});

// 검색조건으로 검색할 때
function tableSearch(){
	
	// 컬럼 초기화
	varTheadArray.length = 0;
	
	$(".columnCheck").each(function() {
		if(this.checked){
			let theadStr = $(this).parent().find("span").text();
			varTheadArray.push(theadStr.slice(0, theadStr.length));
		}
	});
	
	// 구분
	let selectDivision = $("#selectDivision option:selected").val();
	varSelectDivision = selectDivision;
	// 쇼핑몰
	let selectShop = $("#selectShop option:selected").val();
	let shopTypeList = "";
	if(selectShop === "0"){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}
	varShopTypeList = shopTypeList;
	// 시작일
	let fromDate = formatDate($("#fromDate").val());
	varFromDate = fromDate;
	// 종료일
	let toDate = formatDate($("#toDate").val());
	varToDate = toDate;
	
	// 날짜 비교
	let nowDate = new Date(nowYear+"/"+nowMonth+"/"+nowDay); // 오늘 날짜랑
	let tempFromDate = fromDate.split("-");
	let compareFromDate = new Date(tempFromDate[0]+"/"+tempFromDate[1]+"/"+tempFromDate[2]); // 가져올 날짜랑 비교
	let tempToDate = toDate.split("-");
	let compareToDate = new Date(tempToDate[0]+"/"+tempToDate[1]+"/"+tempToDate[2]); // 가져올 날짜랑 비교
	
	// 둘 중에 하나라도 오늘날짜 이전이면
	if(selectDivision === "pre"){
		if(nowDate.getTime() > compareFromDate.getTime() || nowDate.getTime() > compareToDate.getTime()){
			modalInfo("정산예정 금액은 오늘날짜부터 조회할 수 있습니다.");
			return false;
		}
	}
	// 둘 중에 하나라도 오늘날짜 이후이면
	if(selectDivision === "settlement"){
		if(nowDate.getTime() <= compareFromDate.getTime() || nowDate.getTime() <= compareToDate.getTime()){
			modalInfo("정산입금 금액은 어제날짜까지 조회할 수 있습니다.");
			return false;
		}
	}
	
	// LIMIT 설정
	let selectLimit = $("#tableLimit option:selected").val();
	varSelectLimit = selectLimit;
	// ORDER BY 설정
	let selectOrderBy = $("#tableOrderBy option:selected").val();
	varSelectOrderBy = selectOrderBy;
	// 제품명
	let productName = $("#productName").val();
	varProductName = productName;
	
	settlementFunc(1, undefined, selectDivision, shopTypeList, fromDate, toDate, selectLimit, selectOrderBy, productName);
}

// 정산예정 / 정산입금 목록
function settlementFunc(pageNo, pageFlag, selectDivision, shopTypeList, fromDate, toDate, selectLimit, selectOrderBy, productName){
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	// 페이징 버튼 이벤트로 함수 실행했을 때
	if(selectDivision === undefined){
		selectDivision = varSelectDivision;
		shopTypeList = varShopTypeList;
		fromDate = varFromDate;
		toDate = varToDate;
		selectLimit = varSelectLimit;
		selectOrderBy = varSelectOrderBy;
		productName = varProductName;
	}
	
	// LIMIT
	let tempNo = selectLimit*(pageNo-1);
	let limitStr = tempNo + ", " + selectLimit;
	// 전역변수에 현재 몇페이지인지 저장
	nowPageNo = pageNo;
	// 전역변수에 새로운 페이징 번호 저장 11, 21, 31
	if(pageFlag !== undefined && (pageFlag === "next" || pageFlag === "previous")){
		pagingMaxNo = pageNo;
	}
	
	let callUrl = "/cubici/calculateInfo/details/get";
	let callBackFunc = "settlementFuncResponse";
	let objParam = {
		calculatePreFlag : "details",
		COUPANG_SETTLEMENT_TYPE : "${SES_USER.COUPANG_SETTLEMENT_TYPE}",
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
		PRODUCT_NAME : "%"+productName+"%" // 제품명
	}
	//console.log(objParam);
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function settlementFuncResponse(data){
	
	let totalCount = comma(data.totalCount);
	let totalSettleAmnt = comma(data.settlementSum);
	$("#totalCount").text(totalCount+" 건");
	$("#totalSettleAmnt").text(totalSettleAmnt+" 원");
	
	if(data.settlementList.length === 0){
		$("#fixTable").empty().html("조회된 데이터가 없습니다.");
		$("#pagingButton").empty();
		// 로딩바 해제
		$(".loadingSpinner").css({"display" : "none"});
		return false;
	}
	
	let maxRowNo = 0; // 불러온 데이터중 가장 마지막 번호
	
	// 버튼 색깔
	let btnColor = "";
	if(data.FLAG === "pre"){
		btnColor = "sColorN";
	} else{
		btnColor = "sColorLS";
	}
	
	// 테이블 다시 그리기
	let insertTable = '<div class="fixTable maxHeight long"><table class="m-baseTable">';
	// 고정 칼럼 Header
	insertTable += '<thead><tr><th class="fix auto2">주문일자</th><th class="fix auto1">쇼핑몰</th><th class="fix auto2">주문번호</th><th class="fix auto1">진행상태</th>';
	
	// 변동 컬럼 Header
	for(let i=0; i<varTheadArray.length; i++){
		insertTable += '<th class="notFix auto2">'+varTheadArray[i]+'</th>';
	}
	insertTable += '</tr></thead>';
	
	// 테이블 Body
	insertTable += '<tbody>';
	for(let i=0; i<data.settlementList.length; i++){
		let getData = data.settlementList[i];
		
		// 고정 컬럼 Body
		insertTable += "<tr>";
		insertTable += "<td class='fix'>"+getData.ORDERED_AT+"</td>";
		insertTable += "<td class='fix'>"+getData.SHOP+"</td>";
		insertTable += "<td class='fix'><a href='javascript:;' class='underline modalOpen' data-modal='c2p1' onclick='selectOrderDetails("+getData.ORDER_NO+");'>"+getData.ORDER_NO+"</a></td>";
		insertTable += "<td class='fix'><span class='sBtn "+btnColor+" rBtn'>"+getData.STATUS+"</span></td>";
		if(i === data.settlementList.length-1){
			maxRowNo = getData.RNUM;
		}
	
		// 변동 칼럼 Body
		for(let i=0; i<varTheadArray.length; i++){
			// 컬럼 태그
			if(i === 0){
				insertTable += "<th><div class='tIn tal'>";
			} else {
				insertTable += "<td>";
			}
			// 내용
			if(varTheadArray[i] === "상품명"){
				insertTable += getData.PRODUCT_NAME;
			} else if(varTheadArray[i] === "상품번호"){
				insertTable += getData.PRODUCT_NO;
			} else if(varTheadArray[i] === "구매자명"){
				insertTable += getData.CUSTOM_NAME;
			} else if(varTheadArray[i] === "구매자ID"){
				insertTable += getData.CUSTOM_ID;
			} else if(varTheadArray[i] === "판매단가"){
				insertTable += comma(getData.PRODUCT_PRICE);
			} else if(varTheadArray[i] === "판매수량"){
				insertTable += comma(getData.QUANTITY);
			} else if(varTheadArray[i] === "주문금액"){
				insertTable += comma(getData.ORDER_PRICE);
			} else if(varTheadArray[i] === "송장번호"){
				insertTable += getData.INVOICE_NO;
			} else if(varTheadArray[i] === "택배사"){
				insertTable += getData.DELIVERY_COMPANY_NAME;
			} else if(varTheadArray[i] === "배송완료일"){
				insertTable += getData.DELIVERED_DATE;
			} else if(varTheadArray[i] === "정산예정일"){
				insertTable += getData.SETTLEMENT_DATE_PRE;
			} else if(varTheadArray[i] === "정산예정액"){
				insertTable += comma(getData.SETTLEMENT_AMOUNT_PRE);
			} else if(varTheadArray[i] === "정산입금일"){
				insertTable += getData.SETTLEMENT_DATE;
			} else if(varTheadArray[i] === "정산입금액"){
				insertTable += comma(getData.SETTLEMENT_AMOUNT);
			}
			// 컬럼 태그
			if(i === 0){
				insertTable += "</div></th>";
			} else {
				insertTable += "</td>";
			}
		}
		insertTable += "</tr>";
	}
	insertTable += '</tbody></table></div>';
	$("#fixTable").html(insertTable);
	
	// 페이징 버튼
	let insertPagingBtn = "<ul>";
	if(maxRowNo <= varSelectLimit*10){ // 첫 페이지, 버튼은 일단 10개
		for(let i=1; i < 11; i++){
			insertPagingBtn += "<li><a href='javascript:;' class='num' onclick='settlementFunc("+i+");'>"+i+"</a></li>";
			if(i === 10){
				insertPagingBtn += "<li><a href='javascript:;' class='oiBtn next' onclick='settlementFunc("+(i+1)+", \"next\");'>next</a></li>";
			}
			if(i*varSelectLimit >= data.settlementList[0].TOTAL_COUNT){ // 총 데이터 개수가 적으면 버튼을 더 만들 필요가 없음
				break;
			}
		}
	} else if(maxRowNo > varSelectLimit*10 && maxRowNo < data.settlementList[0].TOTAL_COUNT){ // 가운데 페이지들
		for(let i=pagingMaxNo; i < pagingMaxNo+10; i++){
			if(i === pagingMaxNo){
				insertPagingBtn += "<li><a href='javascript:;' class='oiBtn prev' onclick='settlementFunc("+(i-10)+", \"previous\");'>prev</a></li>";
			}
			insertPagingBtn += "<li><a href='javascript:;' class='num' onclick='settlementFunc("+i+");'>"+i+"</a></li>";
			if(i === pagingMaxNo+9){
				insertPagingBtn += "<li><a href='javascript:;' class='oiBtn next' onclick='settlementFunc("+(i+1)+", \"next\");'>next</a></li>";
			}
			if(i*varSelectLimit >= data.settlementList[0].TOTAL_COUNT){ // 총 데이터 개수가 적으면 버튼을 더 만들 필요가 없음
				break;
			}
		}
	} else { // 마지막 페이지
		for(let i=pagingMaxNo; i < pagingMaxNo+10; i++){
			if(i === pagingMaxNo){
				insertPagingBtn += "<li><a href='javascript:;' class='oiBtn prev' onclick='settlementFunc("+(i-10)+", \"previous\");'>prev</a></li>";
			}
			insertPagingBtn += "<li><a href='javascript:;' class='num' onclick='settlementFunc("+i+");'>"+i+"</a></li>";
			if(i*varSelectLimit >= data.settlementList[0].TOTAL_COUNT){ // 총 데이터 개수가 적으면 버튼을 더 만들 필요가 없음
				break;
			}
		}
	}
	insertPagingBtn += "</ul>";
	$("#pagingButton").empty().html(insertPagingBtn);
	
	// 페이징 버튼 활성화
	$('#pagingButton ul li').each(function (index, item) {
		if($(item).find("a").text() === String(nowPageNo)){
			$(item).find("a").addClass("active");
			return false;
		}
	});
	
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
		COUPANG_SETTLEMENT_TYPE : "${SES_USER.COUPANG_SETTLEMENT_TYPE}",
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

	// 모달 띄워줌
	modalOpen("c2p1");
	
}

/*** Excel 다운로드 (MKC 2021.04.20) ***/
function doExcelDownloadProcess(yearMonth) {
	
	// Header 가져오기
	let mainTable = document.getElementById('fixTable').getElementsByTagName('thead')[0].getElementsByClassName('notFix'); // 0 element는 고정이라 필요 없음
	console.log(mainTable[0]+"::"+mainTable[1]);
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
	formHtml += '<input type="hidden" name="userNo" value="${SES_USER.USER_NO}">';
	formHtml += '<input type="hidden" name="coupang_settle_type" value="${SES_USER.COUPANG_SETTLEMENT_TYPE}">';
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
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">시작기간</span>
                <div class="input">
                    <input type="text" class="datepicker" id="fromDate" placeholder="시작기간" readOnly>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">종료기간</span>
                <div class="input">
                    <input type="text" class="datepicker" id="toDate" placeholder="종료기간" readOnly>
                </div>
            </div>
        </li>
        <li>
	        <div class="btns">
                <button class="mBtn sColorLG excel" id="excelBtn">엑셀 다운로드</button>
                <div class="excelDiv"></div>
            </div>
        </li>

        <li>
            <div class="btns">
                <button id="selectButton" class="mBtn sColorLB search">검색</button>
            </div>
        </li>
    </ul>
</div>

<div class="tableSet">
    <div class="m-options">
        <div class="fwBox col-4">
            <span class="ft">페이지 보기 설정</span>
            <div class="input">
                <select id="tableLimit">
                    <option value="10">10개</option>
                    <option value="25">25개</option>
                    <option value="50">50개</option>
                </select>
            </div>
        </div>
        <div class="m-filter col-2">
            <div class="btns">
                <a class="mBtn sColorN setting openFilter">선택옵션</a>
            </div>
        </div>
    </div>

	<!-- 데이터 테이블 -->
    <div class="mArticleArea" id="fixTable"></div>
    <!-- 합계 -->
    <div class="fixBottom">
    	<ul class="tableTotal">
    		<li>
    			<span class="txt">총 주문건수 합계</span>
				<span class="result" id="totalCount"></span>
			</li>
			<li>
				<span class="txt">정산금액</span>
				<span class="result" id="totalSettleAmnt"></span>
				<span class="infoArea">
					<a href="javascript:;" class="oiBtn infoBtn white">정보</a>
					<span class="infoMemo">
						<span class="iCon">
							금액 계산은 판매단가를 기준으로 산정하였습니다. 따라서 실제 금액과 차이가 있을 수 있습니다.
						</span>
					</span>
				</span>
			</li>
		</ul>
	</div>
	<!-- 페이징 버튼 -->
    <div class="m-paging" id="pagingButton"></div>

    <script>
        $('#fixTable').doFixTable();
    </script>
    
</div>

<!-- COLUMN OPTION 선택 -->
<div class="modal-container" id="c2p1-filter">
    <div class="modal-wrapper">
        <header>
            <h2>선택옵션</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="m-filter">
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
                     <button class="modalClose mBtn sColorLB wBtn" id="getOption">옵션 확인</button>
                 </li>
                </ul>
            </div>
        </div>
    </div>
</div>

<!-- 상세내역 Modal -->
<div class="modal-container" id="c2p1" style="display: none;">
    <div class="modal-wrapper">
	    <header>
	        <h4>상세 주문정보</h4>
	        <a href="javascript:;" class="modalClose">닫기</a>
	    </header>
	    <div class="modal-content">
	        <div class="mInner mArticleArea">
	            <article class="m-modalGrid">
	                <div class="contentsArea">
	                    <ul class="item vertical">
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
	                        <table class="m-baseTable">
	                            <thead>
	                                <tr>
	                                    <th>주문일시</th>
	                                    <th>상품명</th>
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
	            <div class="btnArea">
	                <a href="javascript:;" class="modalClose mBtn sColorLB">확인</a>
	            </div>
	        </div>
	    </div>
	</div>
</div>