<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
$(document).ready(function(){
	$("#userId, #userPw").keydown(function(event) {
	    if (event.keyCode === 13){
	    	$("#loginBtn").click();
	    }
	});
	
	// 로그인, 아이디 저장
	if(getCookie("cubiciLoginID") !== null){
		$("#userId").val(getCookie("cubiciLoginID"));
		$('input[name="idSaveCheck"]').prop('checked', true);
	}
});


//로그인 함수
function loginFunc(){
	
	let userId = $("#userId").val();
	let userPw = $.trim($("#userPw").val());
    
    if (userId === null || userId === undefined || userId === "") {
    	modalInfo("아이디를 입력해주세요.");
        $("#userId").focus();
        return false;
    }
    
    if (userPw === null || userPw === undefined || userPw == "") {
    	modalInfo("비밀번호를 입력해주세요.");
        $("#userPw").focus();
        return false;
    }
    
    let encryptUserPw = CryptoJS.SHA256(userPw + cubici.SHA256_SALT);
    
    let idSave = $("input:checkbox[name=idSaveCheck]").is(":checked");
    
    // 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
 
	let callUrl = "/loginAction";
	let callBackFunc = "loginResponse";
	let objParam = {
		idSave: idSave,
		USER_ID: userId,
		USER_PW: encryptUserPw.toString()
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function loginResponse(data){
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
	
	if (data.resultAction === "fail") { // 아이디 존재x or 비밀번호 오류
		modalInfo("아이디가 존재하지 않거나 비밀번호가 틀립니다.");
    } else if (data.resultAction === 'withdraw') { // 탈퇴회원
    	modalInfo("탈퇴 계정입니다.");
    } else if (data.resultAction === 'Y') {
		if(data.loginFlag === "user"){
			window.location.href = '/m/main'; // 메인 페이지
		} else {
			modalInfo("관리자에게 문의 부탁드립니다.");
		}
    } else {
    	modalInfo("관리자에게 문의 부탁드립니다.");
    }
}

</script>
<div class="login-box">
	<div class="login-inner">
		<h2>LOGIN</h2>
		<h3>큐빅아이에 오신것을 환영합니다!</h3>
		<div class="input-box id">
			<label for="userId" aria-label="아이디"></label>
			<input id="userId" type="text" placeholder="ID 입력"/>
		</div>
		<div class="input-box pw">
			<label for="userPw" aria-label="패스워드">	</label>
			<input id="userPw" type="password" placeholder="비밀번호 입력"/>
		</div>
		<a id="loginBtn" class="big-btn" href="#n" onclick="loginFunc();">로그인</a>
		<a class="big-btn" href="/m/register/step1">회원가입</a>
		<fieldset>
			<div class="f-left">
				<input name="idSaveCheck" id="id-save" type="checkbox" />
				<label for="id-save">아이디 저장</label>
			</div>
			<div class="f-right">
				<a class="sm-btn" href="/m/idSearch">아이디 찾기</a>
                   <a class="sm-btn" href="/m/pwdReset">비밀번호 찾기</a>
			</div>
		</fieldset>
		<hr />
		<div class="cs-box">
			<b>큐빅아이 고객지원</b> <span>02-6925-6373 / 카톡 ID : cubici</span>
		</div>
	</div>
</div>