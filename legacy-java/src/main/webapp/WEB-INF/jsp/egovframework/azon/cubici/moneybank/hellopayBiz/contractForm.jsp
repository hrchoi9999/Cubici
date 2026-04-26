<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<script>

$(document).ready(function(){
	
	// 페이지 열자마자 경로확인
	let newHrefLength = document.location.href.split("?").length;
	
	let thisState = "";
	let thisCode = "";
	
	// 파라미터가 있는 경로라면 아래를 수행
	if(newHrefLength >= 2){
		
		let thisSeq = "${mbankInfo.SEQ}";
		
		let newHrefDiv = new URL(document.location.href);
		
		// 확인 값
		thisState = newHrefDiv.searchParams.get("state");
		
		// 코드
		thisCode = newHrefDiv.searchParams.get("code");
		
		// 토큰발급
		let callUrl = "/fintech/api/hellopay/auth";
		let callBackFunc = "authResultFunc";
		let objParam = {
			seq : thisSeq,	
			code : thisCode,
			state : thisState
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
		
	}
	
	// 사용자 인증
	$("#apiAuth").on("click", function(){
		
		location.href = "https://testapi.openbanking.or.kr/oauth/2.0/authorize?"+
						"response_type=code"+
						"&client_id=bfba56ac-64ba-4fe6-9d11-e6cb79739deb"+
						"&redirect_uri=http://localhost:8080/moneybank/hellopayBiz/contract"+
						"&scope=login inquiry transfer"+
						"&state=CbCiLsfigm9OokPTjy03elbJqRHOfGSY"+
						"&auth_type=0";
		
	});
	
	// 계약 성립
	$("#submitContract").on("click", function(){
		
		let thisSeq = "${mbankInfo.seq}";
		let thisUserCode = "${mbankInfo.user_code}";
		let thisUserNo = "${mbankInfo.user_no}";
		let thisNo = $("#apiResult").val();
		
		if(thisNo == ""){
			
			modalInfo("API 호출 에러");
			
		}else{
			
			let callUrl = "/moneybank/api/hellopayBiz/contract";
			let objParam = {
				seq : thisSeq,
				user_code : thisUserCode,
				user_no : thisUserNo,
				fintech_user_seq : thisNo
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
					
					let resultCode = result.resultCode;
					
					if(resultCode == 0){
						location.href="http://localhost:8080/moneybank/advPay/current";
					}else{
						modalInfo("계약 미완료. 관리자에게 문의해주세요.");
					}
					
				},
				error : function(result) {
					alert("통신 실패");
				}
			});
		}
	})
})

// 핀테크 고유번호 가져와서 화면 표시
function authResultFunc(data){
	$("#apiResult").text(data.fintechInfo);
}
</script>

<!-- 컨텐츠 -->
<div class="contentGrid">
	<div class="inner wide">
		
		<!-- TAB 영역 -->
		<div class="s-tab">
			<ul>
				<li><a>서비스 신청</a></li>
				<li><a>검토 및 심사</a></li>
				<li class="active"><a>계약 체결</a></li>
			</ul>
		</div>
		
		<!-- 오픈뱅킹 호출 -->
		<div class="fwBox autoHeight">
	        <div class="ft">
	            <span class="infoArea">
	                <a href="javascript:;" class="oiBtn infoBtn">정보</a>
	            </span>
	            <p>P2P 계약 TEST</p>
	        </div> 
	        <div class="input">
		         <p class="guide"></p>
		         <br>
		         <div>
					<b>계좌별명을 "선지급" 혹은 "요구불"로 입력하여 인증해주세요.</b>
			     </div>
		         <br>
		         <br>
		         <div>
			         <b>계약 은행정보 인증 : </b>
			         	<button class="sColorN" id ="apiAuth" style="width: 100px; height : 34px;" >인증</button>
			     </div>
		         <br>
		    </div>
		    <div class="input">
		         <p class="guide"></p>
		         <br>
		         <div>
			         <b>RESULTS : </b>
			         	<br>
			         	<br>
			         	<textarea id="apiResult" style=" text-align : center; width: 70%; height : 200px; margin: 0 50px 0 10px; border: solid 1px #aaa;"></textarea>
			         	<br>
			         	<br>
			         	<button class="sColorN" id = "submitContract" style="width: 100px; height : 34px;" >계약성립</button>
			         	<br>
			         	<br>
		         </div>
		         <br>
		    </div>
	    </div>
		
	
	</div>
</div>
<!-- //컨텐츠 -->