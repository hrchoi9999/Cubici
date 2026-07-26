<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- 여기까지 상단 -->
<script>

var apiResultList = "";

$(document).ready(function(){
	
	// 판매정보csv to table
	$("#salesFileInput").on("click", function(){
		let salesFilePath = $("#salesFilePath").val();
		salesCsvToTable(salesFilePath);
	})
	
	// 배송정보csv to table
	$("#shipFileInput").on("click", function(){
		let shipmentFilePath = $("#shipmentFilePath").val();
		shipmentCsvToTable(shipmentFilePath);
	})
	
})

// csv to table FUNC
function salesCsvToTable(salesPath){
	let callUrl = "/wholesaler/setSalesCsvData";
	let callBackFunc = "setSalesCsvTable";
	let objParam = {
		FILE_PATH : salesPath
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

//csv to table FUNC
function shipmentCsvToTable(shipmentPath){
	let callUrl = "/wholesaler/setShipmentCsvData";
	let callBackFunc = "setShipmentCsvTable";
	let objParam = {
		FILE_PATH : shipmentPath
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 판매정보 table create FUNC
function setSalesCsvTable(data){
	
	let b2bSalesListHtml = "";
	
	let resultList = data.resultList;
	
	let resultSeq = "";
	
	for(let i = 0; i < resultList.length; i++){
		
		let thisObj = resultList[i];
		
		b2bSalesListHtml += "<tr>";
		b2bSalesListHtml += "<td>"+thisObj.id+"</td>";
		b2bSalesListHtml += "<td>"+thisObj.userId+"</td>";
		b2bSalesListHtml += "<td>"+thisObj.sellerProductNo+"</td>";
		b2bSalesListHtml += "<td>"+thisObj.salesDate+"</td>";
		b2bSalesListHtml += "<td>"+thisObj.salesAmount+"</td>";
		b2bSalesListHtml += "<td>"+thisObj.unitPrice+"</td>";
		b2bSalesListHtml += "<td>"+thisObj.quantity+"</td>";
		b2bSalesListHtml += "</tr>";
		
		resultSeq = thisObj.seq;
	}
	
	$("#b2bSalesList").html(b2bSalesListHtml);
	
	$("#settleSalesSubmit").on("click", function(){
		sendSalesInfoToCbci(resultList);
		$("#b2bSalesList").empty();
	});
	
}

// 배송정보 table create FUNC
function setShipmentCsvTable(data){
	
	let b2bShipmentListHtml = "";
	
	let resultList = data.resultList;
	
	let resultSeq = "";
	
	for(let i = 0; i < resultList.length; i++){
		
		let thisObj = resultList[i];
		
		b2bShipmentListHtml += "<tr>";
		b2bShipmentListHtml += "<td>"+thisObj.id+"</td>";
		b2bShipmentListHtml += "<td>"+thisObj.userId+"</td>";
		b2bShipmentListHtml += "<td>"+thisObj.sendDate+"</td>";
		b2bShipmentListHtml += "<td>"+thisObj.invoiceNumber+"</td>";
		b2bShipmentListHtml += "</tr>";
		
		resultSeq = thisObj.seq;
	}
	
	$("#b2bShipmentList").html(b2bShipmentListHtml);
	
	$("#settleShipmentSubmit").on("click", function(){
		sendShipmentInfoToCbci(resultList);
		$("#b2bShipmentList").empty();
	});
	
}

// 판매정보 CBCI로 API전달
function sendSalesInfoToCbci(resultList){
	
	let callUrl = "/moneybank/api/testMall/purchase";
	let dataList = JSON.stringify(resultList);
	
	let objParam = {
		DATA_LIST : dataList
	}
	
	// 타업체에서 통신한다고 가정
	$.ajax({
		cache:false,
		async : (typeof (isAsync) == "undefined" ? true : false),
		type : "POST",
		url : callUrl,
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			
			let resultStr = JSON.stringify(result);
			$("#settleSalesResult").val(resultStr);
			
		},
		error : function(result) {
			alert("통신 실패");
		}
	});
}

// 배송정보 CBCI로 API전달
function sendShipmentInfoToCbci(resultList){
	
	let callUrl = "/moneybank/api/testMall/shipment";
	let dataList = JSON.stringify(resultList);
	
	let objParam = {
		DATA_LIST : dataList
	}
	
	// 타업체에서 통신한다고 가정
	$.ajax({
		cache:false,
		async : (typeof (isAsync) == "undefined" ? true : false),
		type : "POST",
		url : callUrl,
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			
			let resultStr = JSON.stringify(result);
			$("#settleShipmentResult").val(resultStr);
			
		},
		error : function(result) {
			alert("통신 실패");
		}
	});
}

</script>
	
<article class="subBox">
    <div class="contentArea">
	<br>
	<h2>B2B도매몰 API TEST PAGE</h2>
	<br>
	<hr>
	<br>
		<!-- b2b 판매정보 전달 -->
		<div class="fwBox autoHeight">
	        <div class="input" style="margin: 2%">
		         <p class="guide" style="font-size: medium">판매정보 전달</p>
		         <br>
		         <div>
			         <b>PATH : </b>
				     	<input type="text" id="salesFilePath" placeholder="b2bSales 파일 경로 여기에" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id="salesFileInput" style="width: 100px; height : 34px;" >INPUT</button>
			         <br>
			         <br>
		         </div>
		         <article class="m-modalGrid">
					<table class="m-shadowTable tal">
	                     <thead>
	                         <tr>
								<th>관리코드</th>
								<th>아이디</th>
								<th>상품번호</th>
								<th>구매일자</th>
								<th>구매금액</th>
								<th>구매단가</th>
								<th>수량</th>
							</tr>
	                     </thead>
	                     <tbody id="b2bSalesList"></tbody>
	                 </table>
				</article>
		         <br>
	         	 <br>
		         <button class="sColorN" id ="settleSalesSubmit" style="width: 100px; height : 34px;" >입금알림</button>
		         <br>
		    	 <br>
		         <textarea id="settleSalesResult" style=" text-align : center; width: 70%; height : 100px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
		    </div>
	    </div>
	    
	    <!-- b2b 배송정보 전달 -->
		<div class="fwBox autoHeight">
	        <div class="input" style="margin: 2%">
		         <p class="guide" style="font-size: medium">배송정보 전달</p>
		         <br>
		         <div>
			         <b>PATH : </b>
				     	<input type="text" id="shipmentFilePath" placeholder="b2bShipment 파일 경로 여기에" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id="shipFileInput" style="width: 100px; height : 34px;">INPUT</button>
			         <br>
			         <br>
		         </div>
		         <article class="m-modalGrid">
					<table class="m-shadowTable tal">
	                     <thead>
	                         <tr>
								<th>관리코드</th>
								<th>아이디</th>
								<th>배송일시</th>
								<th>송장번호</th>
							</tr>
	                     </thead>
	                     <tbody id="b2bShipmentList"></tbody>
	                 </table>
				</article>
		         <br>
	         	 <br>
		         <button class="sColorN" id ="settleShipmentSubmit" style="width: 100px; height : 34px;" >입금알림</button>
		         <br>
		    	 <br>
		         <textarea id="settleShipmentResult" style=" text-align : center; width: 70%; height : 100px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
		    </div>
	    </div>
	    
    </div>
</article>
