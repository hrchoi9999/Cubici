<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script src="/resources/chart/doughnut.js"></script>
<script src="/resources/chart/line-style.js"></script>
<script src="/resources/chart/bar-horizontal.js"></script>

<script>
$(document).ready(function() {

	if ("${resultCode}" === "0") {
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
		
		for(let i=0; i<Number("${shopInfoMap.shop_count}"); i++){
			$("#selectShop").append("<option value="+shopTypeList[i]+">"+shopNameList[i]+"</option>");
		}
		
		$('#fromDate').val("${fromDate}");
		$('#toDate').val("${toDate}");

		// 쇼핑몰 가격할인 및 판촉
		salesDiscount();
		// TOP 10 매출상품
		top10SalesProduct();
		// TOP 10 재고상품
		top10Stock();
		
	} else {
		modalInfo("ErrorCode ::: " + "${resultCode}");
	}

	// 조회버튼
	$(document).on('click', "#selectButton", function() {
		// 쇼핑몰 가격할인 및 판촉
		salesDiscount();
		// TOP 10 매출상품
		top10SalesProduct();
		// TOP 10 재고상품
		top10Stock();
	});
	
	// Excel Download
	$('#discountExcelBtn').on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41" || thisUser == "40"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{	
			doExcelDownloadProcess(3);
		}
	});
	
	$('#topSalesExcelBtn').on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess(4);
		}
	});
	

	$('#topStockExcelBtn').on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess(5);
		}
	});
	
});

// 쇼핑몰 판매비중, 쇼핑몰 가격할인 및 판촉
function salesDiscount() {
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	// 파라미터
	let selectShop = $("#selectShop option:selected").val();
	let selectCondition = $("#selectCondition option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();

	let shopTypeList = "";
	if (selectShop === "0") { // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}

	let callUrl = "/cubici/integratedInfo/salesGraph";
	let callBackFunc = "salesDiscountResponse";
	let objParam = {
		FLAG : "tab3_promotion",
		SHOP_TYPE_LIST : shopTypeList,
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		fromDate : formatDate(fromDate),
		toDate : formatDate(toDate),
		SELECT_CONDITION : selectCondition,
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function salesDiscountResponse(data) {

	 // 쇼핑몰 항목
	 let dnutLabel = new Array(Number("${shopInfoMap.shop_count}"));
	 
	 if ("${resultCode}" === "0") {
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
		
		for(let i=0; i<dnutLabel.length; i++){
			dnutLabel[i] = shopNameList[i]
		}
	 }

	// 쇼핑몰 판매비중 그래프
	// 기준 구분
	let selectCondition = data.selectCondition;

	// 그래프 그리기 위해 필요한 배열 데이터
	// 쇼핑몰 판매비중
	let dnutInfoData = new Array(dnutLabel.length);

	// 쇼핑몰 가격할인 및 판초
	let pmtLabel = new Array(dnutLabel.length);
	let pmtRateData = new Array(dnutLabel.length);
	let calPriceData = new Array(dnutLabel.length);
	let orderPriceData = new Array(dnutLabel.length);

	// 데이터 삽입
	// 판매비중 데이터 기준에 따라 플래그 나뉨
	if (selectCondition === "PRICE") {
		FLAG = "PRICE";
		// 판매 금액
		if(data.salesGraph.length == 1){ // 특정 쇼핑몰 선택
			for(let i=0; i<dnutLabel.length; i++){
				if(dnutLabel[i]==data.salesGraph[0].SHOP){
					dnutInfoData[i] = data.salesGraph[0].PRODUCT_PRICE;
					}else{
						dnutInfoData[i] = 0;
						}
				}
			}else if(data.salesGraph.length != 1){ // 특정 쇼핑몰이 아닐때 (전체)
				for(let i=0; i<dnutInfoData.length;i++){
					for(let j=0; j<data.salesGraph.length; j++){
					// 라벨의 쇼핑몰과 데이터의 쇼핑몰 이름을 매칭
					if(dnutLabel[i]==data.salesGraph[j].SHOP)
						//같으면 데이터를 넣음
						dnutInfoData[i]=data.salesGraph[j].PRODUCT_PRICE;
					}
				}
			}
		} else if (selectCondition === "QUANTITY") {
			FLAG = "QUANTITY";
			// 판매 수량
			if(data.salesGraph.length == 1){ // 특정 쇼핑몰 선택
				for(let i=0; i<dnutLabel.length; i++){
					if(dnutLabel[i]==data.salesGraph[0].SHOP){
						dnutInfoData[i] = data.salesGraph[0].QUANTITY;
					}else{
						dnutInfoData[i] = 0;
						}
				}
			}else if(data.salesGraph.length != 1){ // 특정 쇼핑몰이 아닐때 (전체)
				for(let i=0; i<dnutInfoData.length;i++){
					for(let j=0; j<data.salesGraph.length; j++){
					// 라벨의 쇼핑몰과 데이터의 쇼핑몰 이름을 매칭
					if(dnutLabel[i]==data.salesGraph[j].SHOP)
						//같으면 데이터를 넣음
						dnutInfoData[i]=data.salesGraph[j].QUANTITY;
					}
				}
			}
			}

	// 판촉데이터 기준 상관 x
		if(data.salesGraph.length == 1){ // 특정 쇼핑몰 선택
			for(let i=0; i<dnutLabel.length; i++){
				// 특정 쇼핑몰에 데이터를 삽입
				if(dnutLabel[i]==data.salesGraph[0].SHOP){
					pmtRateData[i] = data.salesGraph[0].PROMOTION_RATE;
					orderPriceData[i] = data.salesGraph[0].ORDER_PRICE;
					calPriceData[i] = data.salesGraph[0].CAL_PRICE;
				}else{
					// 그 외의 쇼핑몰 데이터에 0 삽입
					pmtRateData[i] = 0;
					orderPriceData[i] = 0;
					calPriceData[i] = 0;
					}
			}
		} else{
			// 중첩for문
			for(let i=0; i<dnutLabel.length; i++){
				for(let j=0; j<data.salesGraph.length; j++){
					// dnutLabel과 쇼핑몰 이름을 비교
					if(dnutLabel[i]==data.salesGraph[j].SHOP){
						// 특정 쇼핑몰의 이름이 매칭될 시 그에 맞는 데이터 삽입
						pmtRateData[i] = data.salesGraph[j].PROMOTION_RATE;
						orderPriceData[i] = data.salesGraph[j].ORDER_PRICE;
						calPriceData[i] = data.salesGraph[j].CAL_PRICE;
						// 그렇지 않을경우 0 삽입
						} else if(pmtRateData[i] == undefined && orderPriceData[i] == undefined && calPriceData[i] == undefined ){
							pmtRateData[i] = 0;
							orderPriceData[i] = 0;
							calPriceData[i] = 0;
							}
					}
				}
		}
	
	let dnutData = {
		datasets : [ {
			data : dnutInfoData,
			backgroundColor : [ '#0049ad', '#f9a268', '#3de962', '#fe7b90',
					'#26ccd2', '#7c2dde', '#9cbae4' ],
			borderWidth : 3
		} ],
		labels : dnutLabel,
		FLAG : FLAG
	};

	doughnutChart('doughnut', dnutData);
 
	// 쇼핑몰 가격할인 및 판촉 그래프
	var lineDataset = {
		datasets : [ {
			label : '실판매액',
			data : orderPriceData,
			backgroundColor : '#f9a268',
			borderColor : '#f9a268',
			borderWidth : 2,
			lineTension : 0,
			pointRadius : 0,
			yAxesGroup : 'A'

		}, {
			label : '판매가격',
			data : calPriceData,
			backgroundColor : '#0044a2',
			borderColor : '#0044a2',
			borderWidth : 1,
			lineTension : 0,
			pointRadius : 0,
			yAxisID : 'A'
		}, {
			label : '할인/판촉률',
			data : pmtRateData,
			fill : false,
			borderColor : '#3de962',
			pointBackgroundColor : '#3de962',
			borderWidth : 2,
			lineTension : 0,
			yAxisID : 'B'
		} ],
		labels : dnutLabel,
	}

	LineStyle('line-style', lineDataset);
	 
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

// TOP 10 매출상품 -> 기준에 따라 order by 변경
function top10SalesProduct() {

	let selectShop = $("#selectShop option:selected").val();
	let selectCondition = $("#selectCondition option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();

	let shopTypeList = "";
	if (selectShop === "0") { // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}

	// 기준 변경
    let standard = "SUM_PRICE"
    if(selectCondition === "QUANTITY"){
	    standard = "SUM_QUANTITY"; 
	    } 
	      
	let callUrl = "/cubici/integratedInfo/salesGraph";
	let callBackFunc = "top10SalesProductResponse";
	let objParam = {
		FLAG : "tab3_top10",
		SHOP_TYPE_LIST : shopTypeList,
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		fromDate : formatDate(fromDate),
		toDate : formatDate(toDate),
		SELECT_CONDITION : selectCondition,
		ORDER_BY : "SHOP_TYPE",
		STANDARD : standard,
		PRODUCT_NAME : "%%"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function top10SalesProductResponse(data) {
	//console.log("TOP 10 매출상품");

	// 기준 구분
	let selectCondition = data.selectCondition;

	// 라벨 / 데이터 초기화
	let horizontalLabel = new Array(data.salesGraph.length);
	let horizontalData = new Array(data.salesGraph.length);
	
	// 기준
	let FLAG = "";

	// 기준에 따라 데이터 삽입
	for (let i = 0; i < data.salesGraph.length; i++) {
		// 라벨 배열에 삽입
		horizontalLabel[i] = data.salesGraph[i].PRODUCT_NAME;
		if (selectCondition === "PRICE") {
			FLAG = "PRICE"
			horizontalData[i] = data.salesGraph[i].SUM_PRICE;
		} else if (selectCondition === "QUANTITY") {
			FLAG = "QUANTITY"
			horizontalData[i] = data.salesGraph[i].SUM_QUANTITY;
		}
	}

	var horizontalData1 = {
		datasets : [ {
			data : horizontalData,
			backgroundColor : "#0049ad",
		} ],
		labels : horizontalLabel,
		FLAG : FLAG
	}
	HorizontalBarChart('bar-horizontal', horizontalData1);

}

// TOP 10 재고상품
function top10Stock() {
	let selectShop = $("#selectShop option:selected").val();
	let selectCondition = $("#selectCondition option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();

	let shopTypeList = "";
	if (selectShop === "0") { // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}

	let callUrl = "/cubici/integratedInfo/invento";
	let callBackFunc = "inventoResponse";
	let objParam = {
		FLAG : "tab3",
		SHOP_TYPE_LIST : shopTypeList,
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		fromDate : formatDate(fromDate),
		toDate : formatDate(toDate),
		SELECT_CONDITION : selectCondition,
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function inventoResponse(data) {
	
	// console.log("TOP 10 재고상품");

	// 기준 구분
	let selectCondition = data.selectCondition;
	
	// 라벨과 데이터 배열 초기화
	let horizontalLabel = new Array(data.inventoTotal.length);
	let horizontalData = new Array(data.inventoTotal.length);

	// 기준
	let FLAG = "";
	
	// 기준에 따라 데이터 삽입
	for (let i = 0; i < data.inventoTotal.length; i++) {
		// 라벨 배열에 삽입
		if (selectCondition === "PRICE") {
			FLAG = "PRICE"
			horizontalLabel[i] = data.inventoTotal[i].PRODUCT_NAME;
			horizontalData[i] = Math.floor(data.inventoTotal[i].QUANTITY * data.inventoTotal[i].PRICE / 1000000);
		} else if (selectCondition === "QUANTITY") {
			FLAG = "QUANTITY"
			horizontalLabel[i] = data.inventoTotal[i].PRODUCT_NAME;
			horizontalData[i] = data.inventoTotal[i].QUANTITY;
		}
	}
	
	var horizontalData2 = {
		datasets : [ {
			data : horizontalData,
			backgroundColor : "#0049ad",
		} ],
		labels : horizontalLabel
	}
	
	HorizontalBarChart2('bar-horizontal2', horizontalData2);
}

// 엑셀 다운 프로세스 (MKC 2021.04.12)
function doExcelDownloadProcess(graphNum) {
	// 그래프 번호 (할인판촉 : 3 , TOP10매출상품 : 4 , TOP10재고상품 : 5)
	let excelFlag = graphNum;
		
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
	
	// 기준
	let selectCondition = $("#selectCondition option:selected").val();
	let standard = "SUM_PRICE"
	if(selectCondition === "QUANTITY"){
		standard = "SUM_QUANTITY"; 
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
	formHtml += '<input type="hidden" name="userNo" value="${principal.user_no}">';
	formHtml += '<input type="hidden" name="coupang_settle_type" value="${principal.coupang_settlement_type}">';
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
	formHtml += '<input type="hidden" name="standard" value="'+standard+'">';
	formHtml += '<input type="hidden" name="excelFlag" value="'+excelFlag+'">';
	formHtml += '</form>';
	$(".excelDiv").append(formHtml);

	var frmExcel = document.excelForm;
	frmExcel.action = "/cubici/integratedInfo/excelDownload";
	frmExcel.submit();
}
</script>

<div class="m-options">
	<span class="baseDate pRight"><b>기준</b>${toDate}</span>
</div>
<div class="m-search">
    <ul>
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
                <span class="ft">기준</span>
                <div class="input">
               		<select id="selectCondition" class="form-control">
						<option value="PRICE">금액</option>
						<option value="QUANTITY">수량</option>
					</select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">시작</span>
                <div class="input">
                    <input type="text" class="startDatepicker" placeholder="시작기간" id="fromDate" autocomplete="off">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">종료</span>
                <div class="input">
                    <input type="text" class="endDatepicker" placeholder="종료기간" id="toDate" autocomplete="off" >
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button class="sBtn sColorLB search" id="selectButton">검색</button>
            </div>
        </li>
    </ul>
</div>

<article class="subBox">
    <header>
        <h4>쇼핑몰 결제 비중</h4>
        <ul class="btns">
            <li>
                <!-- <a href="javascript:;" class="iBtn excel">엑셀 다운로드</a> -->
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="doughnut"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>쇼핑몰 가격할인 및 판촉</h4>
      
        <ul class="btns">
            <li class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn white">정보</a>
                <div class="infoMemo">
                    <div class="iCon">
                        할인 및 판촉율은 등록하신 판매금액 대비
                        쇼핑몰의 실제 판매금액 평균금액을 비교하여
                        산출합니다.
                    </div>
                </div>
            </li>
            <li>
                <a class="iBtn excel" style="cursor: pointer" id="discountExcelBtn">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="line-style"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>TOP 10 매출상품</h4>
      
        <ul class="btns">
            <li>
                <a class="iBtn excel" style="cursor: pointer" id="topSalesExcelBtn">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="bar-horizontal"></canvas>
        </div>
    </div>
</article>
