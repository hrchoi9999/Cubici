<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<link rel="stylesheet" href="/resources/css/findIdPwd.css" type="text/css">

<script type="text/javascript">

//조회버튼
$(document).on('click', "#confirm2", function(){
	location.href = '/main';
});

// 비밀번호 재설정
function pwdReset(){
	// 이름 체크
	let userName = $.trim($("#userName").val());
	if (userName == "") {
		modalInfo("이름을 입력해주세요.");
        $("#userName").focus();
        return false;
    }
	
	// 전화번호 체크
	let smsAuthBtn = $("#smsAuthBtn").text();
	if (smsAuthBtn != "인증완료") {
		modalInfo("휴대폰을 인증해 주세요.");
        $("#mobile").focus();
        return false;
    }
	
	// 아이디 체크
	let userMail = $.trim($("#userMail").val());
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
	let txtPasswd = $("#password1").val();
    $("#j_password").val(CryptoJS.SHA256(txtPasswd + cubici.SHA256_SALT));
	
    // 암호화된 비밀번호 파라미터 설정
    let j_password = $("#j_password").val();
    
    let mobile = $("#mobile").val();
    
	// 비동기식 ajax 통신
	let callUrl = "/pwdReset/result";
	let callBackFunc = "pwdResetResponse";
	let objParam = {
			userNm : userName,
			mobile : mobile,
			userId: userMail,
		 	j_password : j_password
	} 
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function pwdResetResponse(data){
	// 데이터 통신 완료했지만 찾는 값이 없는 경우
	if(data.resultCode === 0 && data.success === "N"){
		modalInfo("정보가 일치하지 않습니다.");
	// 데이터 통신 완료하고 찾는 값이 있는 경우
	}else if(data.resultCode === 0 && data.success === "Y"){
		modalReload("비밀번호 재설정을 완료하였습니다.");
	// 혹시 모를 예외 발생할 경우
	}else{
		modalInfo("오류발생");
	}
}


//전화번호 유효성 검사
function telValidator(args) {
    if (/^[0-9]{2,3}[0-9]{3,4}[0-9]{4}/.test(args)) {
        return true;
    }
    return false;
}

//sms
function sendSmsAuth(){
	userPhone = $('#mobile').val();
	
	//휴대전화 유효성검사	
	if(telValidator(userPhone) === false){
		modalInfo("유효하지 않는 전화번호입니다");
		return false;
	}

	let uri = "/smsAuth";
	let objParam = {FLAG: "sms", USER_PHONE: userPhone};
	let phoneSendComplete = sendAuthCode(uri, objParam);
	
	if(phoneSendComplete){
		$('#sendSmsBtn').text("재요청");
		smsAuthNum = $('#sendSmsCertNum').val();
	}
}
$(document).ready(function(){
	//sms 인증 번호 확인
	$("#smsAuthBtn").on("click", function() {
		if($('#sendSmsBtn').text() != "재요청"){
			modalInfo("전화번호 인증 버튼을 클릭해주세요.");
			return false;
		}
		let phoneAuthNum = $('#phoneAuthNum').val(); // 입력받은 인증 값
		if(phoneAuthNum <= 0){
			modalInfo("인증번호를 입력해주세요.");
			return false;
		}
		if(phoneAuthNum == smsAuthNum) {
			$('#smsAuthBtn').css("background-color","#999");
			$('#smsAuthBtn').text("인증완료");
			sendSmsResult = true;
		}else{
			modalInfo("인증번호가 일치하지 않습니다.");
			return false;
		}
	});
});
</script>

<div class="container">
	<span> 
	<label style="font-size: 2vh; font-weight: 400;">● 비밀번호 재설정</label>
	</span>
</div>
<div class="containerD">
	<div>
		<table border="1">
			<tbody>
				<tr>
					<td class="col"><span class="inputSpan">이름</span></td>
					<td><input type="text" class="inputD" id="userName" name="userName" placeholder="이름"></td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">휴대폰 번호</span></td>
					<td><input type="text" class="inputD" id="mobile" name="mobile" placeholder="숫자만 입력" onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');">
						<span>
	                        <a href="javascript:;" id="sendSmsBtn" style="padding: 0 10px; height: 29px; margin: 0 10px;" class="sBtn sColorLB" onclick="sendSmsAuth();">인증요청</a>
	                        <input id="phoneAuthNum" class="inputD" type="text" placeholder="인증번호 요청">                   
                        	<a href="javascript:;" id="smsAuthBtn" style="padding: 0 10px; height: 29px; margin: 0 10px;" class="sBtn sColorLB">확인</a>
	                    </span>
	               </td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">아이디</span></td>
					<td><input type="text" class="inputD" id="userMail" name="userMail" placeholder="이메일 형식"></td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">새 암호</span></td>
					<td><input type="password" class="inputD" id="password1" name="password1" onkeypress="capsLock(event);" class="form-control" placeholder="숫자, 영어, 특수문자 포함 8자이상 15자이하"></td>
					<td><input type="hidden" name='j_password' id='j_password'></td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">암호 확인</span></td>
					<td><input type="password" class="inputD" id="password2" name="password2" placeholder="숫자, 영어, 특수문자 포함 8자이상 15자이하"></td>
				</tr>
				<tr>
					<td class="tbBt" colspan="2">
						<button class='lBtn rBtn sColorS' name="search" onclick="pwdReset()">재설정</button>
						<button class='lBtn rBtn sColorS' name="cancel"> <a href="/main">취소</a> </button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
