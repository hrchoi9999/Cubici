<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
$(document).ready(function() {
	
	//인증 요청 전화번호 중복 확인
	$("#sendSmsBtn").on("click", function() {
		sendSmsAuth();
	});
	
	//인증 확인 / 개인정보 체크
	$("#smsAuthBtn").on("click", function() {
		let mobileAuthNo = $("#mobileAuthNo").val(); // 입력받은 인증 값

		if(mobileAuthNo <= 0){
			modalInfo("인증번호를 입력해주세요.");
			return false;
		}		
		if(mobileAuthNo === smsAuthNum) {
				checkUserInfo();	
		}else{
			modalInfo("인증번호가 일치하지 않습니다.");
			return false;
		}
	});
});

//인증문자 보내기
function sendSmsAuth(){
	let userPhone = $("#mobile").val();
	if(telValidator(userPhone) === false){
		modalInfo("유효하지 않은 전화번호입니다");
		return false;
	}

	let uri = "/smsAuth";
	let objParam = {FLAG: "searchSms", USER_PHONE: userPhone};
	smsAuthNum = sendAuthCode(uri, objParam); //전역변수에 저장
}


//인증확인 - 개인정보 확인
function checkUserInfo(){
	let userName = $.trim($("#userName").val());
	let mobile = $.trim($("#mobile").val());
	let userMail = $.trim($("#userMail").val());
	 
	if (userName == "") {
		modalInfo("이름을 입력해주세요.");
	    $("#userName").focus();
	    return false;
	}
	 
	if (mobile == "") {
		modalInfo("전화번호를 입력해주세요.");
	    $("#mobile").focus();
	    return false;
	}
	
 if(smsAuthNum == $('#mobileAuthNo').val()) {	
     let callUrl = "/checkUserInfo";
 	let callBackFunc = "checkUserInfoResponse";
 	let objParam = {
 			USER_ID : userMail,
 			USER_NM : userName,
 			USER_PHONE : mobile
 	} 
 	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	} else {
		modalInfo("인증번호를 입력해주세요.");
	}
}
function checkUserInfoResponse(data){
	if(data.resultCode === 0 && data.success === "N"){ // 데이터 통신 완료했지만 찾는 값이 없는 경우
		modalInfo("입력하신 정보가 일치하는 아이디가 없습니다.");
	}else if(data.resultCode === 0 && data.success === "Y"){
		$("#registeredId").text(data.userId);
		$(".resultId").addClass("active");
	}else{ // 혹시 모를 예외 발생할 경우
		modalInfo("일시적인 오류입니다.\n관리자에게 문의 부탁드립니다.");
	}	
}

</script>



<div class="loginArea">
	<h2 class="subtitle">아이디 찾기</h2>
	<div class="containerD" id="divMobile">	
		<table class="searchTbl" border="1">
			<tbody>									
				<tr>
					<td class="col"><span class="inputSpan">이름</span></td>
					<td><input type="text" class="inputD" id="userName" name="userName" placeholder="이름"></td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">휴대폰 번호</span></td>
					<td>
						<div>
							<input type="text" class="inputD" id="mobile" name="mobile" placeholder="숫자만 입력" onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');">
							<a href="javascript:;" id="sendSmsBtn" class="sBtn sColorLB3">인증요청</a>
						</div>
					</td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">인증 번호</span></td>
					<td>
						<div>
							<input id="mobileAuthNo" class="inputD" type="text" placeholder="인증번호 입력">
							<a href="javascript:;" id="smsAuthBtn" class="sBtn sColorLB3">확인</a>
						</div>
					</td>
				</tr>
				<tr class="searchTr resultId">
					<td class="col"><span class="inputSpan">등록 아이디</span></td>
					<td><span id="registeredId"></span></td>
				</tr>
				<tr>
					<td class="btnArea" colspan="2">
						<a href="/m/login" class="sBtn sColorLB2">취소</a>
						<a href="/m/login" class="sBtn sColorLB2 searchTr resultId">로그인</a>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>