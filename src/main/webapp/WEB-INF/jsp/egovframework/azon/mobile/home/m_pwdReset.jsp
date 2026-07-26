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
	
	if (userMail == "") {
		modalInfo("아이디를 입력해주세요.");
        $("#userMail").focus();
        return false;
    } else if(userMail != "") {
    	// 이메일 형식 체크
    	let emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    	let result = checkRegexp($("#userMail").val() , emailRegex);
    	if(!result) {
    		modalInfo("이메일 형식으로 작성해주세요.");
    		$("#userMail").val('');
    		$("#userMail").focus();
    		return false;
    	}
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
		$(".resetPw").addClass("active");
	}else{ // 혹시 모를 예외 발생할 경우
		modalInfo("일시적인 오류입니다.\n관리자에게 문의 부탁드립니다.");
	}	
}

//비밀번호 재설정
function pwdReset(){
	let userName = $.trim($("#userName").val());
    let mobile = $.trim($("#mobile").val());
    let userMail = $.trim($("#userMail").val());
	
	// 비밀번호 체크
	let password1 = $("#password1").val();
	let password2 = $("#password2").val();
	if(password1.length < 1) {
		modalInfo("비밀번호를 입력해 주세요.");
		$("#password1").focus();
		return false;
	}
	
	// 비밀번호 유효성 검사
	let regExpPw = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&()+=]).*$/;
	let result = checkRegexp($("#password1").val(), regExpPw);
	if(!result) {
		modalInfo("비밀번호는 영문자, 숫자, 특수문자를 조합하여 8자 이상 15자 이하로 입력하시기 바랍니다.");
		$("#password1").val('');
		$("#password1").focus();
		return false;
	} 			
	if(password2.length<1) {
		modalInfo("확인 비밀번호를 입력해 주세요.");
		$("#password2").focus();
		return false;
	}
	if(password1!=password2) {
		modalInfo("비밀번호가 일치하지 않습니다.");
		$("#password1").val('');
		$("#password2").val('');
		$("#password1").focus();
		return false;
	}

	// 수정 비밀번호 암호화
    let encriptPw = CryptoJS.SHA256($("#password1").val() + cubici.SHA256_SALT);
	
	// 비동기식 ajax 통신
	let callUrl = "/pwdReset/result";
	let callBackFunc = "pwdResetResponse";
	let objParam = {
			USER_NM : userName,
			USER_PHONE : mobile,
			USER_ID : userMail,
			USER_PW : encriptPw.toString()
	} 
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function pwdResetResponse(data){
	// 데이터 통신 완료했지만 찾는 값이 없는 경우
	if(data.resultCode === 0 && data.success === "N"){
		modalInfo("입력하신 정보가 일치하는 아이디가 없습니다.");
	// 데이터 통신 완료하고 찾는 값이 있는 경우
	}else if(data.resultCode === 0 && data.success === "Y"){
		modalInfo("비밀번호 재설정을 완료하였습니다.");
		window.location.href = "/m/login"
	// 혹시 모를 예외 발생할 경우
	}else{
		modalInfo("오류발생");
	}
}

</script>



<div class="loginArea">
	<h2 class="subtitle">비밀번호 재설정</h2>
	<div class="containerD" id="divMobile">	
		<table class="searchTbl" border="1">
			<tbody>									
				<tr>
					<td class="col"><span class="inputSpan">이름</span></td>
					<td><input type="text" class="inputD" id="userName" name="userName" placeholder="이름"></td>
				</tr>
				<tr class="searchPw">
					<td class="col"><span class="inputSpan">아이디</span></td>
					<td><input type="text" class="inputD" id="userMail" name="userMail" placeholder="이메일 형식"></td>
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
				<tr class="searchTr resetPw">
					<td class="col"><span class="inputSpan">새 암호</span></td>
					<td><input type="password" class="inputD" id="password1" name="password1" onkeypress="capsLock(event);" class="form-control" placeholder="숫자, 영어, 특수문자 포함 8자이상 15자이하"></td>
				</tr>
				<tr class="searchTr resetPw">
					<td class="col"><span class="inputSpan">암호 확인</span></td>
					<td><input type="password" class="inputD" id="password2" name="password2" placeholder="숫자, 영어, 특수문자 포함 8자이상 15자이하"></td>
				</tr>
				<tr>
					<td class="btnArea" colspan="2">
						<a href="/m/login" class="sBtn sColorLB2">취소</a>
						<a href="javascript:;" class='sBtn sColorLB2 searchTr resetPw' onclick="pwdReset()">재설정</a>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>