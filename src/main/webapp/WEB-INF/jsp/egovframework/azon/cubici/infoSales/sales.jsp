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
		
		salesFunc(1, "search");
	} else {
		alert("ErrorCode ::: " + "${resultCode}");
	}
	
	// 검색 버튼
	$(document).on('click', "#selectButton", function(){
		salesFunc(1, "search");  //매출내역 목록
 	});
	
	$(document).on("change","#tableLimit", function(){
		salesFunc(1, "search");  //매출내역 목록
	});
	
	// Excel 버튼
	$(document).on('click', "#excelBtn", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41" || thisUser == "40"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess();
		}
 	});
});

// 매출 목록
function salesFunc(pageNo, pageFlag){
	// 선택옵션 숨기기
	$('.selectList').css('display', 'none');
	
	// 로딩바
	$(".loadingSpinner").css("display", "inline-block");
	
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
	
	let callUrl = "/cubici/salesInfo/sales/get";
	let callBackFunc = "salesFuncResponse";
	let objParam = {
		salesFlag : "tableList",
		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
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
		NOWPAGENO : pageNo // 현페이지
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function salesFuncResponse(data){
	
	let maxRowNo = 0; // 불러온 데이터중 가장 마지막 번호
	
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
	for(let i=0, len = varTheadArray.length; i < len; i++){
		insertScrollThead += "<th>"+varTheadArray[i]+"</th>";
	}
	insertScrollThead += "</tr>";
	
	// 테이블 > 고정 컬럼
	let insertFixTbody = "";
	if(data.salesList.length > 0) {
		for(let i=0, len = data.salesList.length; i < len; i++){
			let getData = data.salesList[i];
			insertFixTbody += "<tr>";
			insertFixTbody += "<th><div class='tIn'>"+getData.ORDERED_AT+"</div></th>";
			insertFixTbody += "<td><div class='tIn'>"+getData.SHOP+"</div></td>";
			insertFixTbody += "<td><div class='tIn'><a href='javascript:;' class='underline modalOpen' data-modal='c2p1' onclick='selectOrderDetails("+getData.BASKET_PAYMENT_NO+");'>"+getData.BASKET_PAYMENT_NO+"</a></div></td>";
			let btnColor = "";
			switch(getData.STATUS){
				case "주문완료":
					btnColor = "sColorP";
					break;
				case "배송중":
					btnColor = "sColorY";
					break;
				case "배송완료":
					btnColor = "sColorLS";
					break;
				case "구매확정":
					btnColor = "sColorN";
					break;
				default:
					btnColor = "sColorGN";
			}
			insertFixTbody += "<td><div class='tIn'><span class='sBtn "+btnColor+" rBtn'>"+getData.STATUS+"</span></div></td>";
			insertFixTbody += "</tr>";
			if(i === data.salesList.length-1){
				maxRowNo = getData.RNUM;
			}
		}
		
		// 테이블 바디
		let insertScrollTbody = "";
		for(let i=0, len = data.salesList.length; i < len; i++){
			
			let getData = data.salesList[i];
			
			insertScrollTbody += "<tr>";
			for(let i=0, len = varTheadArray.length; i < len; i++){
				insertScrollTbody += "<td><div class='tIn'>";
				
				// 내용
				let sum_cnt = parseInt(getData.sum_COUNT)-1;
				let ThValue = varTheadArray[i];
				let TbValue = varTheadBody[i];
				
				if((ThValue == "상품명") ||(ThValue == "쇼핑몰상품번호") ||(ThValue == "내부관리번호")){
					insertScrollTbody += (sum_cnt > 0) ? getData[TbValue] + " 외 " + sum_cnt + " 건" : getData[TbValue];
				}else if((ThValue == "판매수량") || (ThValue == "주문금액")){
					insertScrollTbody += comma(getData["sum_" + TbValue]);
				}else{
					insertScrollTbody += getData[TbValue];
				}
				
				// 컬럼 태그
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
		
		$("span.result:eq(0)").text(comma(data.totalCount) + "건")
		$("span.result:eq(1)").text(comma(data.quantity) + "개")
		$("span.result:eq(2)").text(comma(data.orderPrice) + "원")
	
		// 페이징
		let pageMaxCnt = data.cnt / selectLimit ;
		let currentPage = data.currentPage - 1;
		let pageCnt = Math.floor(currentPage / 10);
		
		// 페이징 버튼
		let pageHtml = "<ul>";
		
		if(pageMaxCnt <10){
			for(let i =1; i <= Math.ceil(pageMaxCnt); i++){
				pageHtml += "<li><a class='num' href ='javascript:;' onclick='salesFunc(" + i  + ");'>" + i + "</a><li>";
			}
		} else if (pageMaxCnt >=10){
			if(pageCnt > 0){ // 이전
				pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='salesFunc(" + ((pageCnt)*10) + ");'><</a><li>";
			}
			for(let i=(pageCnt * 10) + 1; i<= (pageCnt*10)+10; i++){ // 1~ 10
				if(i>Math.ceil(pageMaxCnt)){
					break;
				}
				pageHtml += "<li><a class='num' href ='javascript:;' onclick='salesFunc(" + i  + ");'>" + i + "</a><li>";		
			}
			if(Math.floor(pageMaxCnt)>(pageCnt*10)+10){ // 다음
				pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='salesFunc(" + ((pageCnt+1)*10+1) + ");'><</a><li>";
			}
		}
		
		pageHtml += '</ul>';
		$("#pagingButton").empty().html(pageHtml);
		
		$(".num:eq(" + currentPage%10 + ")").addClass("active");
	} else {
		//테이블 고정컬럼
		let insertFixTbody = '<tr><td></td></tr>';
		//변동 컬럼
		let insertScrollTbody = '<tr><td colspan="4">조회된 결과가 없습니다.</td></tr>';
		
		$("#fixTbody").html(insertFixTbody);
		$("#scrollThead").html(insertScrollThead);
		$("#scrollTbody").html(insertScrollTbody);
		$("#pagingButton").empty();
		$("span.result:eq(0)").text("0 건");
		$("span.result:eq(1)").text("0 개");
		$("span.result:eq(2)").text("0 원");
	}
	
	$('#fixTable').doFixTable();// 퍼블리싱
	
	if($("#fixTable").css("visibility") === "hidden"){
		$("#fixTable").css("visibility", "visible");
	}
	$(".loadingSpinner").css({"display" : "none"});// 로딩바 해제
	
}

// 주문번호 상세조회 모달
function selectOrderDetails(orderNo){
	
	let callUrl = "/cubici/salesInfo/sales/detailOrderNo";
	let callBackFunc = "detailOrderNoFuncResponse";
	let objParam = {
		FLAG: "orderDetail",
		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
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
	
	const inputList = ["SHOP", "CUSTOM_NAME", "ORDER_NO", "CUSTOM_PHONE", "CUSTOM_ID", "PHONE", "RECEIVER_NAME", "RECEIVER_CONTACT1", "RECEIVER_PHONE"
		, "RECEIVER_ADDR", "ZIP_CODE", "DELIVERY_COMPANY_NAME", "INVOICE_NO", "DELIVERY_CHARGE_TYPE"];
	const salesThList = ["ORDERED_AT", "PRODUCT_NAME", "PRODUCT_NO", "PRODUCT_ORDER_NO", "MANAGE_CODE", "QUANTITY", "PRODUCT_PRICE", "ORDER_PRICE"];
	
	let itemHtml = "";
	
	let salesList = data.salesList;
	
	for(let i = 0, len = inputList.length; i < len; i++){
		item = (inputList[i] == "PHONE") ? "CUSTOM_PHONE" :  inputList[i]
		itemHtml = "<p>" + salesList[0][item] +"</p>";
		
		$("#" + item + "_VALUE").empty().html(itemHtml);
	}
	// 수량, 금액, 상세판매내역 초기화
	let insertTable = "";
	let quantity = 0;
	let orderPrice = 0;

	// 상세 판매내역 테이블
	for(let i=0, len = salesList.length; i < len; i++){
		insertTable += "<tr>";
		let dataList = data.salesList[i]
		for(let i = 0, len = salesThList.length; i < len; i++){
			ThList = salesThList[i]
			insertTable += ((ThList == "ORDERED_AT")||(ThList == "PRODUCT_NAME")) ? "<td><div class=\"tIn tal\">" : "<td><div class=\"tIn\">"
			insertTable += ((ThList == "PRODUCT_PRICE")||(ThList == "ORDER_PRICE")) ? comma(dataList[ThList]):dataList[ThList];
			insertTable += "</div></td>"
		}
		insertTable += "</tr>";
		quantity += dataList.QUANTITY;
		orderPrice += dataList.ORDER_PRICE;
	}

	// 합계 (수량, 주문금액)
	insertTable += "<td colspan= \"5\"></td><td>"+quantity+"</td>"+"<td></td><td>"+comma(orderPrice)+"</td>";
	$("#detailModalTbody").empty().html(insertTable);

	// 모달 띄워줌
	modalOpen("c2p1");
}

//엑셀 다운로드
function doExcelDownloadProcess(){
	
	// Header 가져오기
	let mainTable = document.getElementById('fixTable').getElementsByTagName('thead')[1].getElementsByTagName('th'); // 0 element는 고정이라 필요 없음
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
	formHtml += '<input type="hidden" name="userNo" value="${principal.user_no}">';
	formHtml += '<input type="hidden" name="coupang_settle_type" value="${principal.coupang_settlement_type}">';
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

	var f = document.excelForm;
	f.action = "/cubici/salesInfo/salesList/excelDownload";
	f.submit();
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
						<option value="ORDER_PRICE DESC">주문금액</option>
						<option value="QUANTITY DESC">주문수량</option>
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
<!--개발시 삭제-->
<!-- <div style="padding: 30px 0 ; margin: 30px 0;"><a href="javascript:;" class="modalOpen sBtn rBtn sColorN" data-modal="c2p1">임시 모달창 오픈 버튼</a></div> -->
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
                            <input type="checkbox" id="PRODUCT_NAME" class="columnCheck" checked>
                            <span>상품명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="PRODUCT_NO" class="columnCheck" checked>
                            <span>쇼핑몰상품번호</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="MANAGE_CODE" class="columnCheck" checked>
                            <span>내부관리번호</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="QUANTITY" class="columnCheck" checked>
                            <span>판매수량</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="ORDER_PRICE" class="columnCheck" checked>
                            <span>주문금액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="DELIVERY_COMPANY_NAME" class="columnCheck" checked>
                            <span>택배사</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="INVOICE_NO" class="columnCheck" checked>
                            <span>송장번호</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="CUSTOM_NAME" class="columnCheck" checked>
                            <span>구매자명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="CUSTOM_ID" class="columnCheck" checked>
                            <span>구매자ID</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="DELIVERED_DATE" class="columnCheck" checked>
                            <span>배송완료일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="CONFIRM_DATE" class="columnCheck" checked>
                            <span>구매확정일자</span>
                        </label>
                    </li>
                    <li class="btns">
                        <button class="sBtn sColorLB wBtn" onclick="salesFunc(1,'search');">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable" style="visibility:hidden">
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
    				<span class="txt">판매수량 합계</span>
    				<span class="result"></span>
    			</li>
    			<li>
	    			<span class="txt">주문금액 합계</span>
	    			<span class="result"></span>
	    		</li>
	    	</ul>
	    </div>
    </div>
    <div class="m-paging" id="pagingButton">
    </div>
    <script>    	
        $('#fixTable').doFixTable();
        $('#fixTable').scrollTop(0);
    </script>
</div>

<!-- 상세내역 Modal -->
<div class="modal-container" id="c2p1" style="display: none;">
    <div class="modal-wrapper">
        <header>
            <h2>판매 상세정보</h2>
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
                <div class="btnArea">
                    <a href="javascript:;" class="modalClose mBtn sColorLB">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>
