// 회원가입, 마이페이지 > 공통함수 정리

// 이메일, SMS 인증번호 전송
function sendAuthCode(uri, objParam) {

	let resultString = "";
	
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url: uri,
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result.resultCode === 0) {
				switch(result.resultChar) {
					case "Y":
						if (objParam.FLAG === "mypageSms" || objParam.FLAG === "signUpSms" || objParam.FLAG === "searchSms" || objParam.FLAG === "signUpEmail"){
							modalInfo("인증번호가 발송되었습니다.");
						} else if (objParam.FLAG === "welcomeEmail"){
							resultString = "Y";
						}
						break;
					case "D":
						if(objParam.FLAG === "signUpEmail"){
							modalInfo("이미 등록된 ID입니다. 입력한 정보를 확인해 주세요.");
						} else if (objParam.FLAG === "mypageSms" || objParam.FLAG === "signUpSms" || objParam.FLAG === "searchSms"){
							modalInfo("이미 등록된 번호입니다. 입력한 정보를 확인해 주세요.");
						}
						break;
					case "NULL":
						if (objParam.FLAG === "mypageSms" || objParam.FLAG === "signUpSms" || objParam.FLAG === "searchSms"){
							modalInfo("가입 시 입력하신 회원 정보가 맞는지 다시 확인해 주세요.");
						}
						break;
					case "N":
						if(objParam.FLAG === "welcomeEmail" || objParam.FLAG === "signUpEmail"){
							modalInfo("이메일 발송에 실패했습니다.");
						} else if(objParam.FLAG === "mypageSms" || objParam.FLAG === "signUpSms" || objParam.FLAG === "searchSms"){
							modalInfo("SMS 발송에 실패했습니다.");
						}
						break;
				}
			} else {
				modalInfo("관리자에게 문의 바랍니다.");
			}
		},
		error : function() {
			alert(cubici.AJAX_ERROR_MSG);
		}
	});
	return resultString;
}

function getAuthNum(type, user, authNum){
	let result = "";
	let objParam = {
		type : type,
		user : user,
		authNum : authNum
	}
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url: "/authNumCheck",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(data) {
			result = data.result;
		}	
	});
	return result;	
}

function apiConfirm(flag) {
	let param = {
		vendorId:$('#'+flag+'_apiVendorId').val(),
		accessKey:$('#'+flag+'_apiAccessKey').val(),
		secretKey:$('#'+flag+'_apiSecretKey').val(),
		flag:flag
	};
	modalValid(param);
}

function modalValid(param){
	if (param.flag !== 's' && (param.vendorId === null || param.vendorId === undefined || param.vendorId === "")) {
		modalInfo("업체코드를 입력해주세요");return;
	} else if (param.accessKey === null || param.accessKey === undefined || param.accessKey === "") {
		modalInfo("엑세스키를 입력해주세요");return;
	} else if (param.flag !== 's' && (param.secretKey === null || param.secretKey === undefined || param.secretKey === "")) {
		modalInfo("시크릿키를 입력해주세요");return;
	} else if ($(':radio[name="'+param.flag+'_apiSettlementRadio"]:checked').length < 1) {
		if(param.flag === 'c'){
			modalInfo("정산 방식을 선택해주세요.");
			return;
		}
	}
	addRow();
	$('.modalClose').click();
}