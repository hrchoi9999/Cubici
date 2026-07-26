<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!-- 여기까지 상단 -->
<script>

var apiResultList = "";

$(document).ready(function(){
	
	// API Tester
	$("#callApi").on("click", function(){
		$("#apiResult").empty();
		callApiFunc();
	})
	
})

function callApiFunc(){
	let callUrl = "/fintech/api/sendTrasac";
	let callBackFunc = "callResult";
	let objParam = {}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function sendApiResultFunc(resultList){
	
	let callUrl = "/moneybank/api/transaction/insert";
	let callBackFunc = "depositResult";
	let objParam = {
		DATA : resultList	
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function callResult(data){
	
	let rawResult = data.apiResult;
	$("#apiResult").text(rawResult);
	
	let callUrl = "/moneybank/api/transaction/insert";
	let callBackFunc = "checkInsert";
	let objParam = {
		DATA : rawResult	
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

// ========= 공통 ========= //
//입력 callback func
function checkInsert(result){
	if(result.resultCode == 0 && result.insertCode == 0){
		modalInfo("처리 완료");
	}else if(result.insertCode == 55){
		modalInfo("만기일이며 미납이 있습니다.");
	}else if(result.insertCode == 66){
		modalInfo("상환가능기간이 아닙니다.");
	}else if(result.insertCode == 88){
		modalInfo("미승인 회원입니다.");
	}else if(result.resultCode == 99){
		modalInfo("에러가 발생했습니다. 잠시 후 다시 시도해주세요");
	}
}

</script>
	
<article class="subBox">
    <div class="contentArea">
	<br>
	<h2>선지급 API TEST(P2P의 API 호출 페이지로 가정)</h2>
	<br>
	<hr>
	<br>
	<!-- P2P API 호출 -->
	<div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>P2P API<br>
            CALL TEST</p>
        </div> 
        <div class="input">
	         <p class="guide"></p>
	         <br>
	         <div>
		         <b>Call API : </b>
		         	<button class="sColorN" id = "callApi" style="width: 100px; height : 34px;" >CALL</button>
		         	<br>
		         	<br>
		         	<textarea id="apiResult" style=" text-align : center; width: 70%; height : 200px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
		         	<br>
		         	<br>
	         </div>
	         <br>
	    </div>
    </div>
    
    <!-- P2P API to CBCI -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>API RESULT<br>
            TO CBCI</p>
        </div> 
        <div class="input">
	         <p class="guide"></p>
	         <br>
	         <div>
		         <b>SEND API RESULT : </b>
		         	<button class="sColorN" id = "sendResult" style="width: 100px; height : 34px;" >SEND</button>
		         	<br>
		         	<br>
		         	<textarea id="p2pResult" style=" text-align : center; width: 70%; height : 200px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
		         	<br>
		         	<br>
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- key 테스트 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>API-KEY<br>
               TESTING</p>
        </div> 
        <div class="input">
	         <p class="guide">헬로에서 큐빅아이에게 API 신청</p>
	         <br>
	         <div>
		         <b>THIS ID : </b>
		         	<input type="text" id="thisKey" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         	<button class="sColorN" id = "executeKeyTest" style="width: 100px; height : 34px;" >TEST</button>
		         <br>
		         <br>
		         <b>RESULT : </b>
		    		<input type="text" id="resultKey" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;" readonly>
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- 계약체결 테스트 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>HELLO<br>
               계약 승인</p>
        </div> 
        <div class="input">
	         <p class="guide">헬로에서 계약심사 후 승인 -> 계약 진행 -> 큐빅아이에게 계약여부 전달</p>
	         <br>
	         <div>
		         <b>회원번호 : </b>
		         	<input type="text" id="reqUserNum" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         	<button class="sColorN" id = "getContract" style="width: 100px; height : 34px;" >이력</button>
		         <br>
		         <br>
		         <b>계약신청목록 : </b>
		    		<select id="contractCase" style="width: 40%; border: solid 1px #aaa; margin: 0 50px 0 10px;"></select>
		    		<button class="sColorN" id = "contractApp" style="width: 100px; height : 34px;" >계약체결</button>
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- 실행금입금 테스트 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>HELLO<br>
               실행금 입금</p>
        </div> 
        <div class="input">
	         <p class="guide">헬로에게 실행금 신청 안내 -> 헬로에서 요구불통장으로 입금 -> 큐빅아이에게 입금 안내</p>
	         <br>
	         <div>
		         <b>회원SEQ : </b>
		         	<input type="text" id="depositUserSeq" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         	<button class="sColorN" id = "getHistory" style="width: 100px; height : 34px;" >이력</button>
		         <br>
		         <br>
		         <b>이력 : </b>
		         	<select id="selectCase" style="width: 40%; border: solid 1px #aaa; margin: 0 50px 0 10px;"></select>
		         <br>
		         <br>
		         <b>금액 : </b>
		         	<input type="text" id="depositVal" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         <br>
		         <br>
		         <b>일자 : </b>
		    		<input type="text" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;" class="form-control pull-right" id="depositDate" name="depositDate"  placeholder='입금날짜 입력' autoComplete="off">
		    	 <br>
		    	 <br>
		         <button class="sColorN" id = "updateDeposit" style="width: 100px; height : 34px;" >입금처리</button>	
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- B2B인출액 관리 테스트 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>B2B인출액<br>
               관리</p>
        </div> 
        <div class="input">
	         <p class="guide">실행금 신청 -> 헬로에서 실행금 입금 -> 큐빅아이에게 입금 안내 <br>
	         	-> B2B에 안내 -> B2B 인출 -> 큐빅아이에게 알림</p>
	         <br>
	         <div>
		         <b>회원SEQ : </b>
		         	<input type="text" id="b2bwithdrawSeq" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         	<button class="sColorN" id = "getHistory" style="width: 100px; height : 34px;" >이력</button>
		         <br>
		         <b>금액 : </b>
		         	<input type="text" id="depositVal" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         <br>
		         <br>
		         <b>일자 : </b>
		    		<input type="text" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;" class="form-control pull-right" id="depositDate" name="depositDate"  placeholder='입금날짜 입력' autoComplete="off">
		    	 <br>
		    	 <br>
		         <button class="sColorN" id = "updateDeposit" style="width: 100px; height : 34px;" >입금처리</button>	
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- b2b인출액 csv입력 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>b2b 인출 BY CSV<br>
               (임시 사용!)</p>
        </div> 
        <div class="input">
	         <p class="guide">CSV로 입력</p>
	         <br>
	         <div>
		         <b>PATH : </b>
		         	<input type="text" id="b2bInputPath" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         	<button class="sColorN" id = "b2bInput" style="width: 100px; height : 34px;" >INPUT</button>
		         <br>
		         <br>
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- 헬로 정산금 입금보고 with csv -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>정산입금보고 BY CSV<br>
               (임시 사용!)</p>
        </div> 
        <div class="input">
	         <p class="guide">CSV로 입력</p>
	         <br>
	         <div>
		         <b>PATH : </b>
		         	<input type="text" id="helloInputPath" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         	<button class="sColorN" id = "helloInput" style="width: 100px; height : 34px;" >INPUT</button>
		         <br>
		         <br>
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- 자동상환 처리 csv입력 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>상환 BY CSV<br>
               (임시 사용!)</p>
        </div> 
        <div class="input">
	         <p class="guide">CSV로 입력</p>
	         <br>
	         <div>
		         <b>PATH : </b>
		         	<input type="text" id="csvPath" style=" text-align : center; width: 40%; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         	<button class="sColorN" id = "csvInput" style="width: 100px; height : 34px;" >INPUT</button>
		         <br>
		         <br>
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- 자동상환 테스트 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>HELLO<br>
               자동상환 처리</p>
        </div>
        <div class="input">
	         <p class="guide">쇼핑몰정산 -> 헬로에서 정산금 안내 -> cubici 상환금 안내 -> 헬로에서 출금 -> 큐빅아이에게 출금 안내</p>
	         <br>
	         <div>
		         <b>SEQ : </b>
		         	<input type="text" id="repayUserSeq" style=" text-align : center; width: 150px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		    	 <br>
		    	 <b>일자 : </b>
		    		<input type="text" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;" class="form-control pull-right" id="autoRepayDate" name="autoRepayDate"  placeholder='입금날짜 입력' autoComplete="off">
		    	 <br>
		    	 <br>
		    	 <br>
		         <button class="sColorN" id = "insertRepay" style="width: 100px; height : 34px;" >상환처리</button>	
	         </div>
	         <br>
	    </div>
    </div> -->
	
	<!-- 직접상환 테스트 -->
	<!-- <div class="fwBox autoHeight">
        <div class="ft">
            <span class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
            </span>
            <p>HELLO<br>
               직접상환 처리</p>
        </div> 
        <div class="input">
	         <p class="guide">셀러가 신청 -> 헬로에게 상환금 안내 -> 헬로에서 출금 -> 큐빅아이에게 출금 안내</p>
	         <br>
	         <div>
	         
	         	 <b>SEQ : </b>
		         	<input type="text" id="putUserSeq" style=" text-align : center; width: 150px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
	         	 <b>일자 : </b>
		    		<input type="text" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;" class="form-control pull-right" id="putDate" name="putDate"  placeholder='입금날짜 입력' autoComplete="off">
		    	 
		         	<button class="sColorN" id = "getExecutes" style="width: 100px; height : 34px;" >이력</button>
		         <br>
		         <br>

		         <b>실행건 & 상환필요금액 : </b>
		         	<select id="executeCase" style="width: 40%; border: solid 1px #aaa; margin: 0 50px 0 10px;"></select>
				 <br>
		         <br>
		         
		         <b>정산입금액 (셀러가 신청) : </b>
		         	<input type="text" id="putVal" style=" text-align : center; width: 100px; height : 25px; margin: 0 50px 0 10px; border: solid 1px #aaa;">
		         <br>
		         <br>

		         <button class="sColorN" id = "insertPut" style="width: 100px; height : 34px;" >상환처리</button>	
	         </div>
	         <br>
	    </div>
    </div> -->
	</div>
</article>
