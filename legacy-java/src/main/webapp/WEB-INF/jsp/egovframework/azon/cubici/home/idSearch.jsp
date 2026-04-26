<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<link rel="stylesheet" href="/resources/css/findIdPwd.css" type="text/css">

<script>
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
			idSearch()
		}else{
			modalInfo("인증번호가 일치하지 않습니다.");
			return false;
		}
	});
});

// 찾기(공통)
function idSearch(){
	
		var name1 = $.trim($("#name1").val());
        var mobile = $.trim($("#mobile").val());
        
        if (name1 == "") {
        	modalInfo("이름을 입력해주세요.");
            $("#name1").focus();
            return false;
        }
        
        if (mobile == "") {
        	modalInfo("전화번호를 입력해주세요.");
            $("#mobile").focus();
            return false;
        }
        
	// 비동기식 ajax	통신
	let callUrl = "/idSearch/result";
	let callBackFunc = "idSearchResultResponse";
	let objParam = {
			name1 : name1,
			mobile: mobile,
	} 
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function idSearchResultResponse(data){
	
	// 데이터 통신 완료했지만 찾는 값이 없는 경우
	if(data.resultCode === 0 && data.success === "N"){
		modalInfo("해당 정보에 맞는 아이디가 없습니다..");
	// 데이터 통신 완료하고 찾는 값이 있는 경우
	}else if(data.resultCode === 0 && data.success === "Y"){
		
		/* modalInfo("아이디는 "+data.userId+" 입니다."); */
		$("#registeredId").text(data.userId);
		
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
</script>

<div class="container">
	<span> 
		<input type="radio" name="chk_type" id="chk_type_mobile" checked>
		<label for="chk_type_mobile" style="font-size: 2vh; font-weight: 400;">이름/휴대폰 번호로 찾기</label>
	</span>
</div>
<div class="containerD" id ="divMobile">
	<div>
		<table border="1">
			<tbody>
				<tr>
					<td class="col"><span class="inputSpan">이름</span></td>
					<td><input type="text" class="inputD" id="name1" name="name1" placeholder="이름"></td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">휴대폰 번호</span></td>
					<td><input type="text" class="inputD" id="mobile" name="mobile" placeholder="숫자만 입력" onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');">
						<span>
	                        <a href="javascript:;" id="sendSmsBtn" style="padding: 0 10px; height: 29px; margin: 0 10px;" class="sBtn sColorLB" onclick="sendSmsAuth();">인증요청</a>
	                        <input id="phoneAuthNum" class="inputD" type="text" placeholder="인증번호 요청">   
	                        <input type="hidden" id='sendSmsCertNum'>                
                        	<a href="javascript:;" id="smsAuthBtn" style="padding: 0 10px; height: 29px; margin: 0 10px;" class="sBtn sColorLB">확인</a>
	                    </span>
	               </td>
				</tr>
				<tr>
					<td class="col"><span class="inputSpan">등록된 아이디</span></td>
					<td>
						<span id="registeredId">휴대폰 인증을 완료하세요.</span>
					</td>
				</tr>
				<tr>
					<td class="tbBt" colspan="2">
						<button type="reset" class='lBtn rBtn sColorS' name="cancel"><a href="/main">취소</a></button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>