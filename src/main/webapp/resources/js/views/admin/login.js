//로그인 함수
function loginFunc(){
	
	let userId = $("#userId").val();
	let userPw = $.trim($("#userPw").val());
    
    if (userId === null || userId === undefined || userId === "") {
    	alert("아이디를 입력해주세요.");
        $("#userId").focus();
        return false;
    }
    
    if (userPw === null || userPw === undefined || userPw == "") {
    	alert("비밀번호를 입력해주세요.");
        $("#userPw").focus();
        return false;
    }
    
    let encryptUserPw = CryptoJS.SHA256(userPw + cubici.SHA256_SALT);
    let admintype = $("#ADMIN_TYPE").val();
    let idSave = $("input:checkbox[name=idSaveCheck]").is(":checked");
    
    // 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
 
	let callUrl = "/loginAction";
	let callBackFunc = "loginResponse";
	let objParam = {
		division : "admin",
		idSave: idSave,
		userId: userId,
		userPw: encryptUserPw.toString(),
		admintype: admintype
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function loginResponse(data){
	$(".loadingSpinner").css({"display" : "none"});

	if(data.Code == "S100"){
		if(data.type === "00"){
    		window.location.href = '/admin/cubici/infoIntegrated/cubici_tab1';
    	} else if(data.type === "01"){
    		window.location.href = '/admin/moneybank/FI33/management/info_tab1';
		} else if(data.type === "02"){
    		window.location.href = '/admin/moneybank/hellopay/management/info_tab1';
		}
	}else{
		modalInfo(data.description);
    }
}