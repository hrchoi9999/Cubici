<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<!--사용 차트-->
<script src="/resources/rudicks/mobile/js/chart/combo-bar-line.js"></script>

<script>
$(document).ready(function() {
	if ("${resultCode}" === "0") {
		
		// 로딩바
		$(".loadingSpinner").css({"display" : "inline-block"});
		
		sales(); // 매출액, 판매 수량
		
		settlement(); // 정산입금액
		
		invento(); // 등록상폼 수, 등록 재고수량
		
		salesGraph(); // 그래프 > 당월, 전월 1개월 판매추이
		
		// 로딩바 해제
		$(".loadingSpinner").css({"display" : "none"});
		
	} else {
		modalInfo("ErrorCode ::: " + "${resultCode}");
	}
});

// 매출액 합계(이번달, 전월)
function sales() {

	let callUrl = "/cubici/integratedInfo/tab1/sales";
	let callBackFunc = "salesResponse";
	let objParam = {
		SHOP_NAME_LIST : "${shopInfoMap.shop_name_list}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function salesResponse(data) {
	$("#thisMonthSales").html(comma(data.this_month_sales));
	$("#lastMonthSales").html(comma(data.last_month_sales));
	$("#thisMonthQuantity").html(comma(data.this_month_quantity));
	$("#lastMonthQuantity").html(comma(data.last_month_quantity));
	
	// 변화 값 양수,0 -> 파란색 , 음수 -> 빨간색	
	if(data.change_sales < 0 ){
		$("#changeSales")[0].className = "tColorR";
		$("#changeSales").html(comma(data.change_sales));
	}
	else {
		$("#changeSales").html("+"+comma(data.change_sales));
	}
	
	if(data.change_quantity < 0 ){
		$("#changeQuantity")[0].className = "tColorR";
		$("#changeQuantity").html(comma(data.change_quantity));
	}
	else{
		$("#changeQuantity").html("+"+comma(data.change_quantity));
	}
}

// 정산입금액 합계(이번달, 전월)
function settlement() {
	let callUrl = "/cubici/integratedInfo/tab1/settlement";
	let callBackFunc = "settlementResponse";
	let objParam = {
		SHOP_NAME_LIST : "${shopInfoMap.shop_name_list}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function settlementResponse(data) {
	$("#thisMonthSettlement").html(comma(data.this_month_settlement));
	$("#lastMonthSettlement").html(comma(data.last_month_settlement));
	
	// 변화 값 양수,0 -> 파란색 , 음수 -> 빨간색	
	if(data.change_settlement < 0 ){
		$("#changeSettlement")[0].className = "tColorR";
		$("#changeSettlement").html(comma(data.change_settlement));
	}
	else{
		$("#changeSettlement").html("+"+comma(data.change_settlement));
	}
}

// 등록상품 수, 등록 재고수량
function invento(){
	let callUrl = "/cubici/integratedInfo/invento";
	let callBackFunc = "inventoResponse";
	let objParam = {
		FLAG: "tab1",
		SHOP_TYPE_LIST : "${shopInfoMap.shop_type_list}",
		SHOP_NAME_LIST : "${shopInfoMap.shop_name_list}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function inventoResponse(data){
	
	// 당월, 전월 동기 등록상품 수, 등록 재고수량 값
	$("#thisProductCount").html(comma(data.inventoTotal[0].PRODUCT_COUNT));
	$("#thisStockCount").html(comma(data.inventoTotal[0].STOCK_COUNT));
	$("#lastProductCount").html(comma(data.inventoTotal[0].PRODUCT_COUNT));
	$("#lastStockCount").html(comma(data.inventoTotal[0].STOCK_COUNT));

	$("#changeProductCount").html(comma(data.inventoTotal[0].PRODUCT_COUNT-data.inventoTotal[0].PRODUCT_COUNT));
	$("#changeStockCount").html(comma(data.inventoTotal[0].STOCK_COUNT-data.inventoTotal[0].STOCK_COUNT));
}

// 그래프
function salesGraph() {
	
	let callUrl = "/cubici/integratedInfo/salesGraph";
	let callBackFunc = "salesGraphResponse";
	let objParam = {
		FLAG : "tab1",
		SHOP_TYPE_LIST : "${shopInfoMap.shop_type_list}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function salesGraphResponse(data) {
	
	// 데이터 배열 초기화
	let barData = new Array(data.thisMonthSalesGraph.length);
	let lineData = new Array(data.beforeMonthSalesGraph.length);
	let barLabel = new Array(data.thisMonthSalesGraph.length);
	
	// 당월 판매액, 날짜
	for(let i = 0; i<data.thisMonthSalesGraph.length; i++){
		barData[i] = data.thisMonthSalesGraph[i].ORDER_PRICE;
		barLabel[i] = data.thisMonthSalesGraph[i].ORDERED_AT;
	}
	
	// 전월 동기 판매액
	for(let i = 0; i<data.beforeMonthSalesGraph.length; i++){
		lineData[i] = data.beforeMonthSalesGraph[i].ORDER_PRICE;
	}
	
    var data = {
        datasets: [
	        {
	            label: '최근 1개월 ( M )',
	            data: barData,
	            backgroundColor: '#0049ad',
	            barThickness: 10, 
	            z: 1
	        },
	        {
	            type: 'line',
	            label: '전기 1개월 ( M-1 )',
	            data: lineData,
	            borderColor: '#f9a268',
	            backgroundColor: '#f9a268',
	            fill: false,
	            borderWidth: 1,
	            lineTension: 0,
	            z: 2
	        }
        ],
        labels: barLabel
    };
    
    ComboBarLineChart('combo-bar-line', data);
}
</script>

<div class="m-options">
    <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
</div>

<article class="subBox">
    <div class="fixTable maxHeight fixY">
        <table class="m-baseTable">
            <thead>
                <tr>
                    <th></th>
                    <th>매출액 (원)</th>
                    <th>판매수량 (개)</th>
                    <th>정산입금액 (개)</th>
                    <th>등록상품 수 (원)</th>
                    <th>등록 재고수량 (개)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <th><div class="tIn">당월</div></th>
                    <td><div class="tIn" id = "thisMonthSales"></div></td>
             		<td><div class="tIn" id = "thisMonthQuantity"></div></td>
               		<td><div class="tIn" id = "thisMonthSettlement"></div></td>
	                <td><div class="tIn" id = "thisProductCount"></div></td>
	                <td><div class="tIn" id = "thisStockCount"></div></td>
                </tr>
                <tr>
                <th><div class="tIn">전월 동기</div></th>
	                <td><div class="tIn"><span class="tColorG" id = "lastMonthSales"></span></div></td>
	                <td><div class="tIn"><span class="tColorG" id = "lastMonthQuantity"></span></div></td>
	                <td><div class="tIn"><span class="tColorG" id = "lastMonthSettlement"></span></div></td>
	                <td><div class="tIn"><span class="tColorG" id = "lastProductCount"></span></div></td>
	                <td><div class="tIn"><span class="tColorG" id = "lastStockCount"></span></div></td>
                </tr>
                <tr class="bgGray">
          		<th><div class="tIn">증감</div></th>
	                <td><div class="tIn"><span class="tColorB" id = "changeSales"></span></div></td>
	                <td><div class="tIn"><span class="tColorB" id = "changeQuantity"></span></div></td>
	                <td><div class="tIn"><span class="tColorB" id = "changeSettlement"></span></div></td>
	                <td><div class="tIn" style="color:red" id = "changeProductCount"></div></td>
	                <td><div class="tIn" style="color:red" id = "changeStockCount"></div></td>
                </tr>
            </tbody>
        </table>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>판매추이 비교</h4>

    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="combo-bar-line"></canvas>
          
        </div>
    </div>
</article>



