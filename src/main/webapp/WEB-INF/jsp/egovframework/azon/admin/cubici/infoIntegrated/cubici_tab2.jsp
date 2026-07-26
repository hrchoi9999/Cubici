<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script src="/resources/chart-admin/ac1p1-2-1.js"></script>
            
<!-- 매출지표 -->
<script>

$(document).ready(function(){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	setSalesChart("${fromDate}","${toDate}",'day','PRICE','','');
	setAvgSalesChart("${fromDate}","${toDate}",'day','','');
	setRegiShopChart("${fromDate}","${toDate}",'day');
	setShopSalesChart("${fromDate}","${toDate}",'','');
	setSkuChart("${fromDate}","${toDate}",'day');
	
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");
	
	//구분 셀렉트 박스 옵션
	let selectDivision = $('.selectDivision')[0].id;
	selectMenuList(selectDivision);
	
	$(document).on('click','#searchBtn',function(){ // 검색버튼 클릭
		// 시작일
		let fromDate = formatDate($("#fromDate").val());
		// 종료일
		let toDate = formatDate($("#toDate").val());
		let dateFlag = $('#'+selectDivision).val();
		let optionFlag = $('#UnitOption').val();
		
		let partnerNm = $('#mbPartner').val();
		let serviceNm = $('#mbService').val();

		if(dateFlag == ""){
			alert("분석단위를 선택해주세요");
			return;
		}
		
		setSalesChart(fromDate, toDate, dateFlag, optionFlag, partnerNm, serviceNm);
		setAvgSalesChart(fromDate, toDate, dateFlag, partnerNm, serviceNm);
		setRegiShopChart(fromDate, toDate, dateFlag);
		setShopSalesChart(fromDate, toDate, partnerNm, serviceNm);		
		setSkuChart(fromDate, toDate, dateFlag);
		
	});	
	
	$("#UnitOption").change(function(){  // 매출현황 기준 변경시
		let fromDate = formatDate($("#fromDate").val());
		let toDate = formatDate($("#toDate").val());
		let dateFlag = $('#'+selectDivision).val();
		if(dateFlag == ""){
			alert("분석단위를 선택해주세요");
			return;
		}
		let optionFlag = $('#UnitOption').val();
		let partnerNm = $('#mbPartner').val();
		let serviceNm = $('#mbService').val();
		setSalesChart(fromDate, toDate, dateFlag, optionFlag, partnerNm, serviceNm);
	});
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "none"});
	
});

//매출 현황 차트
function setSalesChart(fromDate, toDate, dateFlag, optionFlag, partnerNm, serviceNm){
	let productType = "";
	if(serviceNm == 'advCalc'){
		productType = '선정산';
	} else if(serviceNm == 'advPay') {
		productType = '선지급';
	}
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/salesChartData";
	let callBackFunc = "setSalesChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		dateFlag : dateFlag,
		optionFlag : optionFlag,
		PARTNER : partnerNm,
		PRODUCT_TYPE : productType,
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}
function setSalesChartResponse(data){
	let data1 = [];
	let data2 = [];
	let percentage = [];
	let barLabel = [];
	let sales = 0;
	let return_ex = 0;
	for(let i=0, len=data.salesMap.length; i<len; i++){
		if(data.dateFlag === 'day'){
			barLabel.push(data.salesMap[i].PAID_AT);
		} else if (data.dateFlag === 'week') {
			barLabel.push(data.salesMap[i].YEARMONTH + " " + data.salesMap[i].MONTHOFWEEK + "주");
		} else if (data.dateFlag === 'month') {
			barLabel.push(data.salesMap[i].YEARMONTH);
		}
		if(data.optionFlag === 'PRICE'){
			sales = data.salesMap[i].ORDER_PRICE;
			return_ex = data.returnMap[i].ORDER_PRICE;
			data1.push(sales);
			data2.push(return_ex);
		} else if (data.optionFlag === 'COUNT') {
			sales = data.salesMap[i].QUANTITY;
			return_ex = data.returnMap[i].QUANTITY;
			data1.push(sales);
			data2.push(return_ex);
		}
		percentage.push((return_ex / sales * 100).toFixed(2));
	}
	salesChartFunc('ac1p1-2-1', data1, data2, percentage, barLabel);	
}

//평균 매출 차트
function setAvgSalesChart(fromDate, toDate, dateFlag, partnerNm, serviceNm){
	let productType = "";
	if(serviceNm == 'advCalc'){
		productType = '선정산';
	} else if(serviceNm == 'advPay') {
		productType = '선지급';
	}
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/avgSalesChartData";
	let callBackFunc = "setAvgSalesChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		dateFlag : dateFlag,
		PARTNER : partnerNm,
		PRODUCT_TYPE : productType
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}
function setAvgSalesChartResponse(data){
	let data1 = [];
	let data2 = [];
	let barLabel = [];
	
	let todaySku = data.preSumSkuMap[0].COUNT;
	let todayUser = data.memTotal;
	
	for(let i=0; i<data.salesMap.length; i++){
		if(data.dateFlag === 'day'){
			barLabel.push(data.salesMap[i].PAID_AT);
		} else if (data.dateFlag === 'week') {
			barLabel.push(data.salesMap[i].YEARMONTH + " " + data.salesMap[i].MONTHOFWEEK + "주");
		} else if (data.dateFlag === 'month') {
			barLabel.push(data.salesMap[i].YEARMONTH);
		}
		todayUser += data.newMemMap[i].COUNT;
		let avgSales = (data.salesMap[i].ORDER_PRICE / todayUser).toFixed(0);
		
		todaySku += data.skuMap[i].COUNT;
		
		data1.push(avgSales);
		data2.push((avgSales / todaySku).toFixed(0));
	}
	avgSalesChartFunc('ac1p1-2-2', data1, data2, barLabel);	
}

//등록쇼핑몰 차트
function setRegiShopChart(fromDate, toDate, dateFlag){
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/regiShopChartData";
	let callBackFunc = "setRegiShopChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		dateFlag : dateFlag
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}
function setRegiShopChartResponse(data){
	let interpark = [];
	let gmarket = [];
	let auction = [];
	let shop11st = [];
	let coupang = [];
	let naver = [];
	let avg = [];
	let barLabel = [];
	
	let todayTotal = data.totalMap[0].COUNT;
	let todayUser = data.memTotal;

	for(let i=0; i<data.regiShopMap.length; i++){
		if(data.dateFlag === 'day'){
			barLabel.push(formatDate(data.regiShopMap[i].DATE));
		} else if (data.dateFlag === 'week') {
			barLabel.push(data.regiShopMap[i].YEARMONTH + " " + data.regiShopMap[i].MONTHOFWEEK + "주");
		} else if (data.dateFlag === 'month') {
			barLabel.push(data.regiShopMap[i].YEARMONTH);
		}
		interpark.push(data.regiShopMap[i].INTERPARK_COUNT);
		gmarket.push(data.regiShopMap[i].GMARKET_COUNT);
		auction.push(data.regiShopMap[i].AUCTION_COUNT);
		shop11st.push(data.regiShopMap[i].SHOP11_COUNT);
		coupang.push(data.regiShopMap[i].COUPANG_COUNT);
		naver.push(data.regiShopMap[i].NAVER_COUNT);
		
		todayUser += data.newMemMap[i].COUNT;
		todayTotal += data.regiShopMap[i].TOTAL;
		avgValue = (todayTotal / todayUser).toFixed(2);
		if(avgValue==Infinity) avgValue = 0;
		avg.push(avgValue);
	}
	
	for(let i=0; i<data.sumMap.length; i++){
		if(data.sumMap[i].SHOP_TYPE == "1"){
			interpark[0] += data.sumMap[i].COUNT;
		} else if (data.sumMap[i].SHOP_TYPE == "2") {
			gmarket[0] += data.sumMap[i].COUNT;
		} else if (data.sumMap[i].SHOP_TYPE == "3") {
			auction[0] += data.sumMap[i].COUNT;
		} else if (data.sumMap[i].SHOP_TYPE == "4") {
			shop11st[0] += data.sumMap[i].COUNT;
		} else if (data.sumMap[i].SHOP_TYPE == "11") {
			coupang[0] += data.sumMap[i].COUNT;
		} else if (data.sumMap[i].SHOP_TYPE == "14") {
			naver[0] += data.sumMap[i].COUNT;
		}
	}
	
	//avg = 그날 total / 회원수	
	regiShopFunnc('ac1p1-2-3', interpark, gmarket, auction, shop11st, coupang, naver, avg, barLabel);
}

//쇼핑몰 판매비교 차트
function setShopSalesChart(fromDate, toDate, partnerNm, serviceNm){
	let productType = "";
	if(serviceNm == 'advCalc'){
		productType = '선정산';
	} else if(serviceNm == 'advPay') {
		productType = '선지급';
	}
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/shopSalesChartData";
	let callBackFunc = "setShopSalesChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		PARTNER : partnerNm,
		PRODUCT_TYPE : productType
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}
function setShopSalesChartResponse(data){
	let interpark = [];
	let gmarket = [];
	let auction = [];
	let shop11st = [];
	let coupang = [];
	let naver = [];
	let barLabel = ["운영","판매금액","거래건수"];
	let total = new Array();	
	
	for(let i=0; i<data.operMap.length; i++){
		if(data.operMap[i].SHOP_TYPE == "1") {
			interpark.push((data.operMap[i].COUNT / data.operTotalMap[0].COUNT * 100).toFixed(2));
		} else if(data.operMap[i].SHOP_TYPE == "2") {
			gmarket.push((data.operMap[i].COUNT / data.operTotalMap[0].COUNT * 100).toFixed(2));
		} else if(data.operMap[i].SHOP_TYPE == "3") {
			auction.push((data.operMap[i].COUNT / data.operTotalMap[0].COUNT * 100).toFixed(2));
		} else if(data.operMap[i].SHOP_TYPE == "4") {
			shop11st.push((data.operMap[i].COUNT / data.operTotalMap[0].COUNT * 100).toFixed(2));
		} else if(data.operMap[i].SHOP_TYPE == "11") {
			coupang.push((data.operMap[i].COUNT / data.operTotalMap[0].COUNT * 100).toFixed(2));
		} else if(data.operMap[i].SHOP_TYPE == "14") {
			naver.push((data.operMap[i].COUNT / data.operTotalMap[0].COUNT * 100).toFixed(2));
		}
	}
	
	for(let i=0; i<data.shopSalestMap.length; i++){
		if(data.shopSalestMap[i].SHOP_TYPE == "1"){
			interpark.push((data.shopSalestMap[i].QUANTITY / data.totalMap[0].QUANTITY * 100).toFixed(2));
			interpark.push((data.shopSalestMap[i].ORDER_PRICE / data.totalMap[0].ORDER_PRICE * 100).toFixed(2));
		} else if (data.shopSalestMap[i].SHOP_TYPE == "2") {
			gmarket.push((data.shopSalestMap[i].QUANTITY / data.totalMap[0].QUANTITY * 100).toFixed(2));
			gmarket.push((data.shopSalestMap[i].ORDER_PRICE / data.totalMap[0].ORDER_PRICE * 100).toFixed(2));
		} else if (data.shopSalestMap[i].SHOP_TYPE == "3") {
			auction.push((data.shopSalestMap[i].QUANTITY / data.totalMap[0].QUANTITY * 100).toFixed(2));
			auction.push((data.shopSalestMap[i].ORDER_PRICE / data.totalMap[0].ORDER_PRICE * 100).toFixed(2));
		} else if (data.shopSalestMap[i].SHOP_TYPE == "4") {
			shop11st.push((data.shopSalestMap[i].QUANTITY / data.totalMap[0].QUANTITY * 100).toFixed(2));
			shop11st.push((data.shopSalestMap[i].ORDER_PRICE / data.totalMap[0].ORDER_PRICE * 100).toFixed(2));
		} else if (data.shopSalestMap[i].SHOP_TYPE == "11") {
			coupang.push((data.shopSalestMap[i].QUANTITY / data.totalMap[0].QUANTITY * 100).toFixed(2));
			coupang.push((data.shopSalestMap[i].ORDER_PRICE / data.totalMap[0].ORDER_PRICE * 100).toFixed(2));
		} else if (data.shopSalestMap[i].SHOP_TYPE == "14") {
			naver.push((data.shopSalestMap[i].QUANTITY / data.totalMap[0].QUANTITY * 100).toFixed(2));
			naver.push((data.shopSalestMap[i].ORDER_PRICE / data.totalMap[0].ORDER_PRICE * 100).toFixed(2));
		}
	}
	
	total.push(interpark);
	total.push(gmarket);
	total.push(auction);
	total.push(shop11st);
	total.push(coupang);
	total.push(naver);
	
	shopSalesChartFunc('ac1p1-2-4', total, barLabel);	
	
}

//sku 차트
function setSkuChart(fromDate, toDate, dateFlag){
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/skuChartData";
	let callBackFunc = "setSkuChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		dateFlag : dateFlag
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}
function setSkuChartResponse(data){
	let cubici = [];
	let moneybank = [];
	let total = [];
	let barLabel = [];

	for(let i=0; i<data.cubiciSkuMap.length; i++){
		if(data.dateFlag === 'day'){
			barLabel.push(data.cubiciSkuMap[i].INPUT_DATE);
		} else if (data.dateFlag === 'week') {
			barLabel.push(data.cubiciSkuMap[i].YEARMONTH + " " + data.cubiciSkuMap[i].MONTHOFWEEK + "주");
		} else if (data.dateFlag === 'month') {
			barLabel.push(data.cubiciSkuMap[i].YEARMONTH);
		}
		cubici.push(data.cubiciSkuMap[i].COUNT);
		moneybank.push(data.moneySkuMap[i].COUNT);
		total.push(data.skuMap[i].COUNT);
	}
	cubici[0] = cubici[0] + parseInt(data.preSumSkuMap[0].COUNT/21);
	moneybank[0] = moneybank[0] + data.preSumMbSkuMap[0].COUNT;
	total[0] = total[0] + data.preSumSkuMap[0].COUNT;
	skuChartFunc('ac1p1-2-5', cubici, moneybank, total, barLabel);	
}

// 엑셀 출력 (수정 예정)
function doExcelDownloadProcess(){
	// 초기화
	if($("#excelForm").html != null){
		$("#excelForm").remove();
	}
	
	// form 태그 생성
	var scaleType = $("select[name='scaleType']").val();
	var fromDate = $("input[name='fromDate']").val();
	var toDate = $("input[name='toDate']").val();
	var formHtml = "";
	formHtml = '<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data"><input type="hidden" name="flag" value="adminMain">';
	formHtml += '<input type="hidden" name="scaleType" value="'+scaleType+'">';
	formHtml += '<input type="hidden" name="fromDate" value="'+fromDate+'">';
	formHtml += '<input type="hidden" name="toDate" value="'+toDate+'">';
	formHtml += '</form>';
	
	$(".articleTitleMain").append(formHtml);
	
    var frm = document.excelForm;
    frm.action = "/admin/excelMainDownload";
    frm.submit();
}

</script>
<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab1">종합 지표</a></li>
        <li class="active"><a href="/admin/cubici/infoIntegrated/cubici_tab2">매출 지표</a></li>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab3">활동 지표</a></li>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab4">이용료 지표</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${toDate}</span>
    </div>
</div>

<div class="m-search">
    <ul>
   		<li class="col-1d5">
            <div class="fwBox">
                <span class="ft">협력사</span>
                <div class="input">
                    <select id="mbPartner">
                    	<option value="">전체</option>
                    	<option value="FI32">헬로핀테크</option>
                    </select>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">서비스</span>
                <div class="input">
                    <select id="mbService">
                    	<option value="">전체</option>
                        <option value="advCalc">선정산</option>
                        <option value="advPay">선지급</option>
                    </select>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">분석단위</span>
                <div class="input">
					<select class = "selectDivision" id ="DateAnalysisUnit"></select>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">시작</span>
                <div class="input">
                    <input type="text" class="startDatepicker" id="fromDate" placeholder="시작기간">
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">종료</span>
                <div class="input">
                    <input type="text" class="endDatepicker" id="toDate" placeholder="종료기간">
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button id="searchBtn" class="sBtn sColorLB search">검색</button>
            </div>
        </li>
    </ul>
</div>

<article class="subBox">
    <header>
        <h4>매출 현황</h4>
        <ul class="btns">
            <li>
                <a href="javascript:;" class="iBtn excel">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <div class="optionBox">
                <div class="fwBox">
                    <span class="ft">분석기준</span>
                    <div class="input">
                        <select id="UnitOption">
                            <option value="PRICE">금액</option>
                            <option value="COUNT">건수</option>
                        </select>
                    </div>
                </div>
            </div>
            <canvas id="ac1p1-2-1"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>회원 평균매출</h4>
        <ul class="btns">
            <li>
                <a href="javascript:;" class="iBtn excel">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p1-2-2"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>등록 쇼핑몰</h4>
        <ul class="btns">
            <li>
                <a href="javascript:;" class="iBtn excel">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p1-2-3"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>쇼핑몰 판매비교</h4>
        <ul class="btns">
            <li>
                <a href="javascript:;" class="iBtn excel">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p1-2-4"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>등록 SKU수</h4>
        <ul class="btns">
            <li>
                <a href="javascript:;" class="iBtn excel">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p1-2-5"></canvas>
        </div>
    </div>
</article>