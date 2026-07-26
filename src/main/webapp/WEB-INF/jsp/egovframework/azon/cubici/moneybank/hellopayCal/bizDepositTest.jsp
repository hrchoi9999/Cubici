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
	
	$("#cslExecutePathInput").on("click", function(){
		submitCslExecuteByPath();
	});
	
	$("#cslRepayPathInput").on("click", function(){
		submitCslRepayByPath();
	});
	
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

function submitCslExecuteByPath(){
	let targetSeq = $("#cslExecSeq").val();
	let targetPath = $("#cslExecutePath").val();
	
	let callUrl = "/moneybank/advCalc/insertExecute";
	let objParam = {
		seq : targetSeq,
		FILE_PATH : targetPath
	}

	$.ajax({
		cache:false,
		async : (typeof (isAsync) == "undefined" ? true : false),
		type : "POST",
		url : callUrl,
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			$("#cslExecuteResult").val(result.resultCode);
		},
		error : function(result) {
			alert("통신 실패");
		}
	});
}

function submitCslRepayByPath(){
	let targetSeq = $("#cslRepaySeq").val();
	let targetPath = $("#cslRepayPath").val();
	
	let callUrl = "/moneybank/advCalc/insertRepay";
	let objParam = {
			seq : targetSeq,
			FILE_PATH : targetPath
	}

	$.ajax({
		cache:false,
		async : (typeof (isAsync) == "undefined" ? true : false),
		type : "POST",
		url : callUrl,
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			$("#cslRepayResult").val(result.resultCode);
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
			         <b>seq : </b>
			         	<input type="text" id="cslExecSeq" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         <br>
			    	 <br>
			    	 <b>PATH : </b>
			         	<input type="text" id="cslExecutePath" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id="cslExecutePathInput" style="width: 100px; height : 34px;" >INPUT</button>
			         <br>
			         <br>
			         <textarea id="cslExecuteResult" style=" text-align : center; width: 70%; height : 100px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
			     </div>
		         <br>
		    </div>
	    </div>

		<br>
		<br>

		<!-- 상환금 입금 알림 -->
		<div class="fwBox autoHeight">
	        <div class="input" style="margin: 2%">
		         <p class="guide" style="font-size: medium">상환금 입금 : 핀테크에서 송금을 진행 후 큐빅아이에 알림</p>
		         <br>
		         <div>
			         <b>seq : </b>
			         	<input type="text" id="cslRepaySeq" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         <br>
			         <br>
			    	 <b>PATH : </b>
			         	<input type="text" id="cslRepayPath" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
			         	<button class="sColorN" id = "cslRepayPathInput" style="width: 100px; height : 34px;" >INPUT</button>
			         <br>
			    	 <br>
			    	 <textarea id="cslRepayResult" style=" text-align : center; width: 70%; height : 100px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
			     </div>
		         <br>
		    </div>
	    </div>
	    
	</div>
</article>
