<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<script>
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
// 컬럼 이름 배열
var varTheadArray = new Array();

$(document).ready(function() {
	if ("${resultCode}" === "0") {
		
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
		
		for(let i=0; i<Number("${shopInfoMap.shop_count}"); i++){
			$("#selectShop").append("<option value="+shopTypeList[i]+">"+shopNameList[i]+"</option>");
		}
		
		$("#fromDate").val("${fromDate}");
		$("#toDate").val("${toDate}");
		
		// 매출내역 목록
		tableSearch();
	} else {
		alert("ErrorCode ::: " + "${resultCode}");
	}
	
	// 검색 버튼
	$(document).on('click', "#selectButton", function(){
		tableSearch(); // 매출내역 목록
 	});
	
	// Excel 버튼
	$(document).on('click', "#excelBtn", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess();
		}
 	});
});

//검색조건으로 검색할 때
function tableSearch(){
	// 컬럼 초기화
	varTheadArray.length = 0;
	
	$(".columnCheck").each(function() {
		if(this.checked){
			let theadStr = $(this).parent().find("span").text();
			varTheadArray.push(theadStr.slice(0, theadStr.length));
		}
	});
	//console.log(varTheadArray);
	
	// 진행상태
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
	
	// LIMIT 설정
	let selectLimit = $("#tableLimit option:selected").val();
	varSelectLimit = selectLimit;
	// ORDER BY 설정
	let selectOrderBy = $("#tableOrderBy option:selected").val();
	varSelectOrderBy = selectOrderBy;
	// 제품명
	let productName = $("#productName").val();
	varProductName = productName;
	
	salesFunc(1, undefined, selectDivision, shopTypeList, fromDate, toDate, selectLimit, selectOrderBy, productName);
}

// 매출 목록
function salesFunc(pageNo, pageFlag, selectDivision, shopTypeList, fromDate, toDate, selectLimit, selectOrderBy, productName){
	
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
	
	let callUrl = "/cubici/salesInfo/sales/get";
	let callBackFunc = "salesFuncResponse";
	let objParam = {
		salesFlag : "tableList",
		COUPANG_SETTLEMENT_TYPE : "${SES_USER.COUPANG_SETTLEMENT_TYPE}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		STATUS : selectDivision, // 진행상태
		SHOP_TYPE_LIST : shopTypeList, // 쇼핑몰
		fromDate : fromDate, // 시작일
		toDate : toDate, // 종료일
		LIMIT : limitStr, // LIMIT
		ORDER_BY : selectOrderBy, // ORDER BY
		PRODUCT_NAME : "%"+productName+"%", // 제품명
		NOWPAGENO : nowPageNo // 현페이지
	}
	// console.log(objParam);
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function salesFuncResponse(data){
	
	if(data.salesList.length === 0){
		$("#fixTable").empty().html("조회된 데이터가 없습니다.");
		$("#pagingButton").empty();
		// 로딩바 해제
		$(".loadingSpinner").css({"display" : "none"});
		return false;
	}
	
	let maxRowNo = 0; // 불러온 데이터중 가장 마지막 번호
	let tableHtml = "";
	let theadHtml = '<thead><tr>';
	theadHtml += '<th class="fix auto2">주문일자</th><th class="fix auto1">쇼핑몰</th><th class="fix auto2">주문번호</th><th class="fix auto1">진행상태</th>';
	for(let i=0; i<varTheadArray.length; i++){
		theadHtml += '<th class="notFix auto2">'+varTheadArray[i]+'</th>';
	}
	theadHtml += "</tr>";
	theadHtml += '</thead>';
	
	let tbodyHtml = "<tbody>";
	for(let i=0; i<data.salesList.length; i++){
		let getData = data.salesList[i];
		tbodyHtml += "<tr><td class='fix'>"+getData.ORDERED_AT+"</td>";
		tbodyHtml += "<td class='fix'>"+getData.SHOP+"</td>";
		tbodyHtml += "<td class='fix'><a href='javascript:;' class='underline modalOpen' data-modal='c2p1' onclick='selectOrderDetails("+getData.BASKET_PAYMENT_NO+");'>"+getData.BASKET_PAYMENT_NO+"</a></td>";
		let btnColor = "";
		if(getData.STATUS === "주문완료"){
			btnColor = "sColorP";
		} else if(getData.STATUS === "배송중"){
			btnColor = "sColorY";
		} else if(getData.STATUS === "배송완료"){
			btnColor = "sColorLS";
		} else if(getData.STATUS === "구매확정"){
			btnColor = "sColorN";
		} else {
			btnColor = "sColorGN";
		}
		tbodyHtml += "<td class='fix'><span class='sBtn_sales "+btnColor+" rBtn'>"+getData.STATUS+"</span></td>";
		
		//비고정
		for(let i=0; i<varTheadArray.length; i++){
			// 컬럼 태그
			if(i === 0){
				tbodyHtml += "<th><div class='tIn tal'>";
			} else {
				tbodyHtml += "<td class='fix'>";
			}
			// 내용
			let sum_cnt = parseInt(getData.sum_COUNT)-1;
			if(varTheadArray[i] === "상품명"){
				if(sum_cnt > 0 ){
					tbodyHtml += getData.PRODUCT_NAME + " 외 " + sum_cnt + " 건";
				}else{
					tbodyHtml += getData.PRODUCT_NAME
				}
			} else if(varTheadArray[i] === "쇼핑몰상품번호"){
				if(sum_cnt > 0 ){
					tbodyHtml += getData.PRODUCT_NO + " 외 " + sum_cnt + " 건";
				}else{
					tbodyHtml += getData.PRODUCT_NO
				}				
			} else if(varTheadArray[i] === "내부관리번호"){
				if(sum_cnt > 0 ){
					tbodyHtml += getData.MANAGE_CODE + " 외 " + sum_cnt + " 건";
				}else{
					tbodyHtml += getData.MANAGE_CODE
				}				
			} else if(varTheadArray[i] === "판매수량"){
				tbodyHtml += comma(getData.sum_QUANTITY);
			} else if(varTheadArray[i] === "주문금액"){
				tbodyHtml += comma(getData.sum_ORDER_PRICE);
			} else if(varTheadArray[i] === "택배사"){
				tbodyHtml += getData.DELIVERY_COMPANY_NAME;
			} else if(varTheadArray[i] === "송장번호"){
				tbodyHtml += getData.INVOICE_NO;
			} else if(varTheadArray[i] === "구매자명"){
				tbodyHtml += getData.CUSTOM_NAME;
			} else if(varTheadArray[i] === "구매자ID"){
				tbodyHtml += getData.CUSTOM_ID;
			} else if(varTheadArray[i] === "배송완료일자"){
				tbodyHtml += getData.DELIVERED_DATE;
			} else if(varTheadArray[i] === "구매확정일자"){
				tbodyHtml += getData.CONFIRM_DATE;
			}
			// 컬럼 태그
			if(i === 0){
				tbodyHtml += "</div></th>";
			} else {
				tbodyHtml += "</td>";
			}
		}
		tbodyHtml += "</tr>";
	
	}
	tbodyHtml += '</tbody>';
	tableHtml += theadHtml;
	tableHtml += tbodyHtml;
	
	$("#dataTable").html(tableHtml);
	// console.log(data.salesList[0].TOTAL_COUNT+" ::: "+data.salesList[0].TOTAL_COUNT / varSelectLimit);
	
	// 총 합계
	$('#orderCount').text(comma(data.totalCount) + " 건");
	$('#salesCount').text(comma(data.quantity) + " 건");
	$('#sumOrderPrice').text(comma(data.orderPrice) + "원");
	
	// 페이징
	let pageMaxCnt = data.cnt / varSelectLimit ;
	let currentPage = data.currentPage - 1;
	let pageCnt = Math.floor(currentPage / 5);
	
	// 페이징 버튼
	let pageHtml = "<ul>";
	if(pageMaxCnt <5){
		for(let i =1; i <= Math.ceil(pageMaxCnt); i++){
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='salesFunc(";
			pageHtml += i + ', undefined' + ',"' + varSelectDivision  + '","' + varShopTypeList + '","' + varFromDate + '","' + varToDate + '","' + varSelectLimit + '","' + varSelectOrderBy + '","' + varProductName + '");' + "'>" + i + "</a><li>";
		}
	} else if (pageMaxCnt >=5){
		if(pageCnt > 0){ // 이전
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='salesFunc(" + ((pageCnt)*5);
			pageHtml += ', "previous"' + ',"' + varSelectDivision  + '","' + varShopTypeList + '","' + varFromDate + '","' + varToDate + '","' + varSelectLimit + '","' + varSelectOrderBy + '","' + varProductName + '");' + "'></a></li>"; 
		}
		for(let i=(pageCnt * 5) + 1; i<= (pageCnt*5)+5; i++){ // 1~ 10
			if(i>Math.ceil(pageMaxCnt)){
				break;
			}
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='salesFunc(";
			pageHtml += i + ', undefined' + ',"' + varSelectDivision  + '","' + varShopTypeList + '","' + varFromDate + '","' + varToDate + '","' + varSelectLimit + '","' + varSelectOrderBy + '","' + varProductName + '");' + "'>" + i + "</a><li>";
		}
		if(Math.floor(pageMaxCnt)>(pageCnt*5)+5){ // 다음
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='salesFunc(" + ((pageCnt+1)*5+1);
			pageHtml += ', "next"' + ',"' + varSelectDivision  + '","' + varShopTypeList + '","' + varFromDate + '","' + varToDate + '","' + varSelectLimit + '","' + varSelectOrderBy + '","' + varProductName + '");' + "'></a></li>"; 
		}
	}
	pageHtml += '</ul>';
	$("#pagingButton").empty().html(pageHtml);
	
	// 페이징 버튼 활성화
	$('#pagingButton ul li').each(function (index, item) {
		if($(item).find("a").text() === String(nowPageNo)){
			$(item).find("a").addClass("active");
			return false;
		}
	});
	
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

// 주문번호 상세조회 모달
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
	
	let callUrl = "/cubici/salesInfo/sales/detailOrderNo";
	let callBackFunc = "detailOrderNoFuncResponse";
	let objParam = {
		FLAG: "orderDetail",
		COUPANG_SETTLEMENT_TYPE : "${SES_USER.COUPANG_SETTLEMENT_TYPE}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		ORDER_NO : orderNo,
		SELECT_DIVISION : selectDivision,
		SHOP_TYPE_LIST : shopTypeList,
		fromDate : fromDate,
		toDate : toDate,
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function detailOrderNoFuncResponse(data){
	
	// 주문정보 (구매자 정보)
	let SHOP = data.salesList[0].SHOP; // 쇼핑몰
	let CUSTOM_NAME = data.salesList[0].CUSTOM_NAME; // 구매자
	let ORDER_NO = data.salesList[0].ORDER_NO; // 주문번호
	let CUSTOM_PHONE = data.salesList[0].CUSTOM_PHONE; // 핸드폰
	let CUSTOM_ID = data.salesList[0].CUSTOM_ID; // 구매자 ID

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
	for(let i=0; i<data.salesList.length; i++){
		insertTable += "<tr>";
		insertTable += "<td><div class=\"tIn tal\">"+data.salesList[i].ORDERED_AT+"</div></td>";
		insertTable += "<td><div class=\"tIn tal\">"+data.salesList[i].PRODUCT_NAME+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+data.salesList[i].PRODUCT_NO+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+data.salesList[i].PRODUCT_ORDER_NO+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+data.salesList[i].MANAGE_CODE+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+data.salesList[i].QUANTITY+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+comma(data.salesList[i].PRODUCT_PRICE)+"</div></td>";
		insertTable += "<td><div class=\"tIn\">"+comma(data.salesList[i].ORDER_PRICE)+"</div></td>";
		insertTable += "</tr>";
		quantity += data.salesList[i].QUANTITY;
		orderPrice += data.salesList[i].ORDER_PRICE;
	}

	// 합계 (수량, 주문금액)
	insertTable += "<td colspan= \"5\"></td><td>"+quantity+"</td>"+"<td></td><td>"+comma(orderPrice)+"</td>";
	$("#detailModalTbody").empty().html(insertTable);

	// 배송정보 (택배사, 송장번호, 구분)
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
	$("#ZIP_CODE_VALUE").empty().html(ZIP_CODE);

	// 모달 띄워줌
	modalOpen("c2p1");
}

//엑셀 다운로드
function doExcelDownloadProcess(){
	
	// Header 가져오기
	let mainTable = document.getElementById('dataTable').getElementsByTagName('thead')[0].getElementsByClassName('notFix'); // 0 element는 고정이라 필요 없음
	let mainTableArr = new Array();
	for(var i = 0; i<mainTable.length; i++){	
		mainTableArr.push(mainTable[i].textContent); // 각 thead의 th text를 저장
	}
	
	// 진행상태
	let selectDivision = $("#selectDivision option:selected").val();
	
	// 보기설정
	let selectOrderBy = $("#tableOrderBy option:selected").val();
			
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
	
	// 날짜
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	
	// 초기화
	if ($("#excelForm").html != null) {
		$("#excelForm").remove();
	}
	
	// form 태그 생성
	var formHtml = "";
	formHtml = '<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data" style="display: none">'
	formHtml += '<input type="hidden" name="flag" value="sales">';
	formHtml += '<input type="hidden" name="userNo" value="${SES_USER.USER_NO}">';
	formHtml += '<input type="hidden" name="coupang_settle_type" value="${SES_USER.COUPANG_SETTLEMENT_TYPE}">';
	formHtml += '<input type="hidden" name="auction_online_remit_date" value="${shopInfoMap.auction_online_remit_date}">';
	formHtml += '<input type="hidden" name="eleven_shop_grade_date" value="${shopInfoMap.eleven_shop_grade_date}">';
	formHtml += '<input type="hidden" name="fromDate" value="'+formatDate(fromDate)+'">';
	formHtml += '<input type="hidden" name="toDate" value="'+formatDate(toDate)+'">';
	formHtml += '<input type="hidden" name="shop_type_list" value="'+shopTypeList+'">';
	formHtml += '<input type="hidden" name="shop_name_list" value="'+shopNameListStr+'">';
	formHtml += '<input type="hidden" name="interpark_id" value="${shopInfoMap.interpark_id}">';
	formHtml += '<input type="hidden" name="eleven_id" value="${shopInfoMap.eleven_id}">';
	formHtml += '<input type="hidden" name="gmarket_id" value="${shopInfoMap.gmarket_id}">';
	formHtml += '<input type="hidden" name="auction_id" value="${shopInfoMap.auction_id}">';
	formHtml += '<input type="hidden" name="naver_id" value="${shopInfoMap.naver_id}">';
	formHtml += '<input type="hidden" name="coupang_id" value="${shopInfoMap.coupang_id}">';
	formHtml += '<input type="hidden" name="selectDivision" value="'+selectDivision+'">';
	formHtml += '<input type="hidden" name="selectOrderBy" value="'+selectOrderBy+'">';
	formHtml += '<input type="hidden" name="this_header" value="'+mainTableArr+'">';
	formHtml += '<input type="hidden" name="excel_flag" value="0">';
	formHtml += '</form>';
	$(".excelDiv").append(formHtml);

	var exlForm = document.excelForm;
	exlForm.action = "/cubici/salesInfo/salesList/excelDownload";
	exlForm.submit();
}

</script>

<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">진행상태</span>
                <div class="input">
                    <select id="selectDivision">
                    	<option value="-">전체</option>
                        <option value="주문완료">주문완료</option>
                        <option value="배송중">배송중</option>
                        <option value="배송완료">배송완료</option>
                        <option value="구매확정">구매확정</option>
                        <option value="정산완료">정산완료</option>
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
						<option value="ORDER_PRICE DESC">주문금액</option>
						<option value="QUANTITY DESC">주문수량</option>
                    </select>
                </div>
            </div>
        </li>
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">시작일</span>
                <div class="input">
                    <input type="text" class="datepicker" id="fromDate" placeholder="시작기간" readOnly>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">종료일</span>
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
                <a href="javascript:;" class="mBtn sColorN setting openFilter modalOpen" data-modal="c2p1-filter">선택옵션</a>
            </div>
        </div>
    </div>

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
                                <span>쇼핑몰상품번호</span>
                            </label>
                        </li>
                        <li>
                            <label class="dotCheckBox">
                                <input type="checkbox" id="manageCode" class="columnCheck" checked>
                                <span>내부관리번호</span>
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
	                            <input type="checkbox" id="deliveryCompany" class="columnCheck" checked>
	                            <span>택배사</span>
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
	                            <input type="checkbox" id="deliveryDate" class="columnCheck" checked>
	                            <span>배송완료일자</span>
	                        </label>
	                    </li>
	                    <li>
	                        <label class="dotCheckBox">
	                            <input type="checkbox" id="confirmDate" class="columnCheck" checked>
	                            <span>구매확정일자</span>
	                        </label>
	                    </li>
                        <li class="btns">
                            <button class="modalClose mBtn sColorLB wBtn" onclick="tableSearch();">옵션 확인</button> 
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    
    <div class="mArticleArea">
        <div class="fixTable maxHeight long">
            <table id="dataTable" class="m-baseTable">
            </table>
        </div>
        <div class="fixBottom">
            <ul class="tableTotal">
                <li>
                    <span class="txt">총 주문건수 합계</span>
                    <span id="orderCount" class="result"></span>
                </li>
                <li>
                    <span class="txt">판매수량 합계</span>
                    <span id="salesCount" class="result"></span>
                </li>
                <li>
                    <span class="txt">주문금액 합계</span>
                    <span id="sumOrderPrice" class="result"></span>
                </li>
            </ul>
        </div>
    </div>
    <div class="m-paging" id="pagingButton">
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
	            <article class="m-modalGrid">
	                <header>
	                    <h3>배송정보</h3>
	                </header>
	                <div class="contentsArea">
	                    <ul class="item vertical">
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
	                    <ul class="item vertical hasTopLine">
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
	                        <li class="btn">
	                            <div class="fwBox">
	                                <span class="ft">배송 주소</span>
	                                <div class = "input" id = "ZIP_CODE_VALUE">
                                    </div>
	                            </div>
	                            <div class="fwBtn">
	                                <a href="javascript:;" class="mBtn sColorLB">검색</a>
	                            </div>
	                        </li>
	                        <li>
	                            <div class="fwBox">
	                                <div class = "input" id = "RECEIVER_ADDR_VALUE">
                                    </div>
	                            </div>
	                        </li>
	                    </ul>
	                </div>
	            </article>
	            <div class="btnArea">
	                <a href="javascript:;" class="modalClose mBtn sColorLB">확인</a>
	            </div>
	        </div>
	    </div>
	</div>
</div>
