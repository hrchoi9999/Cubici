<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<script>

$(document).ready(function(){
	//enter 처리
	$("#userPw").one("keypress", function(event){
    	capsLock(event);
    });
	
	$("#userId, #userPw").keydown(function(event) {
		let modalCheck = $("#modal-info").hasClass("active");
	    if (event.keyCode === 13 && modalCheck === false) {
	    	$("#loginBtn").click();
	    }else if(modalCheck){
	    	$("#confirm").click();
	    }
	});
	
	//로그인, 아이디 저장
	if(getCookie("LID") !== null){
		$("#userId").val(getCookie("LID"));
		$('input[name="idSaveCheck"]').prop('checked', true);
	}
	
	//인증번호전송
	$("#sendSmsBtn").on("click", function() {
		sendSmsAuth();
	});
	
	//인증 확인 / 개인정보 체크
	$("#smsAuthBtn").on("click", function() {
		let mobileAuthNo = $('#mobileAuthNo').val(); // 입력받은 인증 값
		if(mobileAuthNo <= 0){
			modalInfo("인증번호를 입력해주세요.");
			return false;
		}
		if(getAuthNum("sms", $("#mobile").val(), mobileAuthNo) == "PASS") {
			if($(".searchPw").hasClass("active")) {
				checkUserInfo("pw");
			} else {
				checkUserInfo("id");
			}
		}else{
			modalInfo("인증번호가 일치하지 않습니다.");
			return false;
		}
	});
});

function searchModalFunc(flag){
	$(".searchTr").removeClass("active");
	if(flag === "id") $(".searchId").addClass("active");
	if(flag === "pw") $(".searchPw").addClass("active");
}

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
		division : "user",
		idSave : idSave,
		userId : userId,
		userPw : encryptUserPw.toString()
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function loginResponse(data){
	$(".loadingSpinner").css({"display" : "none"});
	if(data.Code == "S100"){
		$(location).attr("href", "<c:url value='/' />");
	}else{
		modalInfo(data.description);
	}
}

// 인증문자 보내기
function sendSmsAuth(){
	let userPhone = $("#mobile").val();
	if(telValidator(userPhone) === false){
		modalInfo("유효하지 않은 전화번호입니다");
		return false;
	}	
	let uri = "/smsAuth";
	let objParam = {FLAG: "searchSms", USER_PHONE: userPhone};
	sendAuthCode(uri, objParam);
}

// 인증 확인 후 - 개인정보 확인
function checkUserInfo(flag){
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
    
	if(flag === "pw"){
		if (userMail == "") {
			modalInfo("아이디를 입력해주세요.");
	        $("#userMail").focus();
	        return false;
	    } else if(userMail != ""){
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
	}
	
	let callUrl = "/checkUserInfo";
   	let callBackFunc = "checkUserInfoResponse";
   	let objParam = {
   			USER_ID : userMail,
   			USER_NM : userName,
   			USER_PHONE : mobile
   	} 
   	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function checkUserInfoResponse(data){
	if(data.resultCode === 0 && data.success === "N"){ // 데이터 통신 완료했지만 찾는 값이 없는 경우
		modalInfo("입력하신 정보가 일치하는 아이디가 없습니다.");
	}else if(data.resultCode === 0 && data.success === "Y"){	
		if($(".searchPw").hasClass("active")) { // 비번 찾기 인 경우
			$(".resetPw").addClass("active");
		} else { // 아이디 찾기 인경우
			$("#registeredId").text(data.userId);
			$(".resultId").addClass("active");
		}
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
		window.location.href = "/login"
	// 혹시 모를 예외 발생할 경우
	}else{
		modalInfo("오류발생");
	}
}
</script>

<div class="login-box">
	<div class="login-inner">
		<h2>LOGIN</h2>
		<h3>큐빅아이에 오신것을 환영합니다!</h3>
		<div class="input-box id">
			<label aria-label="아이디"></label>
			<input id="userId" type="text" placeholder="ID"/>			
		</div>
		<div class="input-box pw">
			<label aria-label="패스워드"></label>
			<input id="userPw" type="password" placeholder="PASSWORD"/>
		</div>
		<a class="big-btn" href="javascript:;" id="loginBtn" onclick="loginFunc();">로그인</a>
		<a class="big-btn" href="/mainSignUp">회원가입</a>
		<fieldset>
			<div class="f-left">
				<input name="idSaveCheck" type="checkbox"/>
				<label>아이디	저장</label>
			</div>
			<div class="f-right">
				<a class="sm-btn modalOpen" href="javascript:;" onclick="searchModalFunc('id')" data-modal="searchIdPw">아이디 찾기</a>
				<a class="sm-btn modalOpen" href="javascript:;" onclick="searchModalFunc('pw')" data-modal="searchIdPw">비밀번호 찾기</a>
			</div>
		</fieldset>
		<hr />
		<div class="cs-box">
			<b>큐빅아이 고객지원</b> <span>02-6925-6373 / 카톡 ID : cubici</span>
		</div>
	</div>
</div>


<div class="modal-container resetClose" id="searchIdPw">
	<div class="modal-wrapper">
		<header>
			<h2 id="loginHeader">아이디/비밀번호 찾기</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="modal-content">
			<div class="loginArea">
				<div id="search">
					<div class="mArticleArea">
						<div class="containerD" id="divMobile">	
							<table class="searchTbl" border="1">
								<tbody>									
									<tr>
										<td class="col"><span class="inputSpan">이름</span></td>
										<td><input type="text" class="inputD" id="userName" name="userName" placeholder="이름"></td>
									</tr>
									<tr class="searchTr searchPw">
										<td class="col"><span class="inputSpan">아이디</span></td>
										<td><input type="text" class="inputD" id="userMail" name="userMail" placeholder="이메일 형식"></td>
									</tr>
									<tr>
										<td class="col"><span class="inputSpan">휴대폰 번호</span></td>
										<td>
											<input type="text" class="inputD" id="mobile" name="mobile" placeholder="숫자만 입력" onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');">
											<span> 
												<a href="javascript:;" id="sendSmsBtn" style="padding: 0 10px; height: 29px; margin: 0 10px;" class="sBtn sColorLB3">인증요청</a>
												<input id="mobileAuthNo" class="inputD" type="text" placeholder="인증번호 입력">
												<a href="javascript:;" id="smsAuthBtn" style="padding: 0 10px; height: 29px; margin: 0 10px;" class="sBtn sColorLB3">확인</a>
											</span>
										</td>
									</tr>
									
									<!--  비번 -->
									<tr class="searchTr resetPw">
										<td class="col"><span class="inputSpan">새 암호</span></td>
										<td><input type="password" class="inputD" id="password1" name="password1" onkeypress="capsLock(event);" class="form-control" placeholder="숫자, 영어, 특수문자 포함 8자이상 15자이하"></td>
									</tr>
									<tr class="searchTr resetPw">
										<td class="col"><span class="inputSpan">암호 확인</span></td>
										<td><input type="password" class="inputD" id="password2" name="password2" placeholder="숫자, 영어, 특수문자 포함 8자이상 15자이하"></td>
									</tr>									
									<!--  아이디 -->
									<tr class="searchTr resultId">
										<td class="col"><span class="inputSpan">등록 아이디</span></td>
										<td><span id="registeredId"></span></td>
									</tr>
									
									<tr>
										<td class="btnArea" colspan="2">
											<!-- 아이디 -->
											<a href="javascript:;" class='sBtn sColorLB2 searchTr resultId modalClose'>로그인</a>
											<!--  비번 -->
											<a href="javascript:;" class='sBtn sColorLB2 searchTr resetPw' onclick="pwdReset()">재설정</a>
											<a href="javascript:;" class="sBtn sColorLB2 modalClose">닫기</a>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>