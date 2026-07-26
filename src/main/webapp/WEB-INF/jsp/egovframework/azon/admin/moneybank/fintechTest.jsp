<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- 여기까지 상단 -->
<script>

var apiResultList = "";

$(document).ready(function(){
	
	// 실행금 입금처리할 리스트 가져오기( 핀테크 업체에서 보관하고 있는 데이터라고 가정 )
	$("#getExecute").on("click", function(){
		
		let targetSeq = $("#depositUserNo").val();
		let callUrl = "/fintech/api/executelist";
		let callBackFunc = "getExecuteResults"
		let objParam = {
			seq : targetSeq,
			order : "DESC"
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
	
	// 실행금 입금 처리
	$("#updateDeposit").on("click", function(){
		sendDepositResultFunc();
	});
	
	// 거래내역API 호출
	$("#requestApi").on("click", function(){
		requestTransactionApi();
	});
	
	// 직접상환 정산내역 
	
})

// 실행금 입금 리스트 화면 출력 Func
function getExecuteResults(data){
	
	let execListHtml = "";
	
	for(let i = 0; i < data.executeList.length; i++){
		let thisMap = data.executeList[i];
		execListHtml += "<option value="+thisMap.entry+">실행금신청일 : "+thisMap.execute_req_date+", 신청금액 : "+thisMap.total_payment+"</option>";
	}
	
	$("#selectCase").html(execListHtml);
	
}

// 입금처리( 입금을 했다고 가정하며 해당 사실을 cubici에 알림 )
function sendDepositResultFunc(){
	
	let targetSeq = $("#depositUserNo").val();
	let targetEntry = $("#selectCase option:selected").val();
	let targetDate = $("#depositDate").val();
	let targetAmount = $("#depositAmount").val();
	
	let callUrl = "/moneybank/api/hellopayBiz/execution/deposit";
	let callBackFunc = "depositResult";
	let objParam = {
		seq : targetSeq,
		entry : targetEntry,
		deposit_date : targetDate,
		total_payment : targetAmount
	}
	
	// cubici와 ajax 통신한다고 가정
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
			$("#depositResult").val(resultStr);
			
		},
		error : function(result) {
			alert("통신 실패");
		}
	});
}

// 거래내역API 호출
function requestTransactionApi(){
	
	let fintechUserSeq = $("#fintechUserSeq").val();
	
	let callUrl = "/fintech/api/transaction";
	let callBackFunc = "displayTransacResult";
	let objParam = {
		fintech_user_seq : fintechUserSeq
	};
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);

}

// 거래내역 호출결과 화면 출력
function displayTransacResult(data){
	
	let settleTableHtml = "";
	
	let resultList = data.resultList;
	
	for(let i = 0; i < resultList.length; i++){
		
		let thisMap = resultList[i];
		
		settleTableHtml += "<tr>";
		settleTableHtml += "<td>"+thisMap.transac_date+"</td>";
		settleTableHtml += "<td>"+thisMap.transac_type+"</td>";
		settleTableHtml += "<td>"+thisMap.print_content+"</td>";
		settleTableHtml += "<td>"+thisMap.transac_amount+"</td>";
		settleTableHtml += "<td>"+thisMap.bank_name+"</td>";
		settleTableHtml += "</tr>";
		
	}
	
	$("#settleList").html(settleTableHtml);
	
	$("#settleSubmit").on("click", function(){
		
		apiCallToCbci(resultList);
		
	});
	
}

// 정산내역(거래내역) Cubici API로 전달
function apiCallToCbci(resultList){
	
	let callUrl = "/moneybank/api/hellopay/settlement/deposit";
	let dataList = JSON.stringify(resultList);
	let fintechUserSeq = $("#fintechUserSeq").val();
	
	let objParam = {
		fintech_user_seq : fintechUserSeq,
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
			$("#settleResult").val(resultStr);
			
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
	<h2>헬로페이 API TEST PAGE</h2>
	<br>
	<hr>
	<br>
		<!-- 실행금 입금 알림 -->
		<div class="fwBox autoHeight">
	        <div class="input" style="margin: 2%">
		         <p class="guide" style="font-size: medium">실행금 입금 : 핀테크에서 송금을 진행 후 큐빅아이에 알림</p>
		         <br>
		         <div>
			         <b>회원번호 : </b>
			         	<input type="text" id="depositUserNo" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id = "getExecute" style="width: 100px; height : 34px;" >이력</button>
			         <br>
			         <br>
			         <b>이력 : </b>
			         	<select id="selectCase" style="width: 40%; border: solid 1px #aaa; margin: 0 50px 0 10px;"></select>
			         <br>
			         <br>
			         <b>금액 : </b>
			         	<input type="text" id="depositAmount" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         <br>
			         <br>
			         <b>일자 : </b>
			    		<input type="text" id="depositDate" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;" class="form-control pull-right" placeholder='입금날짜 입력' autoComplete="off">
			    	 <br>
			    	 <br>
			         <button class="sColorN" id = "updateDeposit" style="width: 100px; height : 34px;" >입금처리</button>
			         <br>
			    	 <br>
			         <textarea id="depositResult" style=" text-align : center; width: 70%; height : 100px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
			     </div>
		         <br>
		    </div>
	    </div>
	
		<!-- 헬로 자동상환 정산금 입금 알림 -->
		<div class="fwBox autoHeight">
	        <div class="input" style="margin: 2%">
		         <p class="guide" style="font-size: medium">정산입금 알림</p>
		         <br>
		         <div>
			         <b>CALL GET TRANSACTION API : </b>
				        <input type="text" id="fintechUserSeq" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id = "requestApi" style="width: 100px; height : 34px;" >CALL</button>
			         <br>
			         <br>
			         <b>PATH : </b>
			         	<input type="text" id="helloInputPath" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id = "helloInput" style="width: 100px; height : 34px;" >INPUT</button>
			         <br>
			         <br>
		         </div>
		         <article class="m-modalGrid">
					<table class="m-shadowTable tal">
	                     <thead>
	                         <tr>
								<th>입출금 일시</th>
								<th>구분</th>
								<th>쇼핑몰</th>
								<th>입출금 금액</th>
								<th>요구불통장 은행명</th>
							</tr>
	                     </thead>
	                     <tbody id="settleList"></tbody>
	                 </table>
	 			 </article>
		         <br>
	         	 <br>
		         <button class="sColorN" id ="settleSubmit" style="width: 100px; height : 34px;" >입금알림</button>
		         <br>
		    	 <br>
		         <textarea id="settleResult" style=" text-align : center; width: 70%; height : 100px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
		    </div>
	    </div>
	    
	    <!-- 헬로 직접상환 정산금 입금 알림 -->
		<div class="fwBox autoHeight">
	        <div class="input" style="margin: 2%">
		         <p class="guide" style="font-size: medium">직접상환금 입금 알림</p>
		         <br>
		         <div>
			         <b>FINTECH_USER_SEQ : </b>
				        <input type="text" id="fintechUserSeqDirect" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         <br>
			         <br>
			         <b>PATH : </b>
			         	<input type="text" id="directHelloInputPath" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id = "helloInput" style="width: 100px; height : 34px;" >INPUT</button>
			         <br>
			         <br>
		         </div>
		         <article class="m-modalGrid">
					<table class="m-shadowTable tal">
	                     <thead>
	                         <tr>
								<th>입출금 일시</th>
								<th>구분</th>
								<th>입출금 금액</th>
								<th>요구불통장 은행명</th>
							</tr>
	                     </thead>
	                     <tbody id="settleList"></tbody>
	                 </table>
	 			 </article>
		         <br>
	         	 <br>
		         <button class="sColorN" id ="directSettleSubmit" style="width: 100px; height : 34px;" >입금알림</button>
		         <br>
		    	 <br>
		         <textarea id="directSettleResult" style=" text-align : center; width: 70%; height : 100px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
		    </div>
	    </div>
	</div>
</article>
