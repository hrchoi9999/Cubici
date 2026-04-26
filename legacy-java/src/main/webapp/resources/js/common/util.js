/* 
*------------------------------------------------------------------------------
* NAME : util.js
* DESC : 공통으로 사용할 커스텀 유틸리티 함수를 기록
* 2017.04.18  조민수          최초개발
*------------------------------------------------------------------------------
*/
/******************************************************************************
 * 
 * cfFind
 * ajax call 를 통한 데이터 조회 시 사용
 * 2018-10-26 mscho
 * 
 ******************************************************************************/
function cfFind(url, obj, fnSuccess, isSync, type) {
	$.ajax({
		beforeSend: function(xhr) {
	        xhr.setRequestHeader("AJAX", true);
	    },
		dataType : "json",
		type : type || "GET",
		url : url,
		contentType : "application/json; charset=utf-8",
		data : JSON.stringify(obj),
		async : (isSync)? false : true,  /* sync */
		success : fnSuccess || function(result){
			setTimeout(function () {
            }, 1000);
		},
		error : function(request){
			setTimeout(function () {
            }, 1000);
			
			if(request.status == "401") {
				alert("인증에 실패 했습니다. 로그인 페이지로 이동합니다.");
	            location.href = Config.CONTEXT_PATH + "/j_spring_security_logout";
			} else if (request.status == "403") {
				alert("세션이 만료가 되었습니다. 로그인 페이지로 이동합니다.");
				location.href = Config.CONTEXT_PATH + "/j_spring_security_logout";
			}
			console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
		}
	});
	
	if(fnSuccess) {
		setTimeout(function () {
        }, 1000);
	}
}

/******************************************************************************
 * 
 * cfSave
 * ajax call 를 통한 데이터 수정 시 사용
 * 2017-04-18 mscho
 * 
 ******************************************************************************/
function cfSave(url, obj, fnSuccess) {
	$.ajax({
		beforeSend: function(xhr) {
			xhr.setRequestHeader("AJAX", true);
		},
		dataType : "json",
		type : "POST",
		url : url,
		contentType : "application/json; charset=utf-8",
		data : JSON.stringify(obj),
		success : fnSuccess || function(result){
			alert("저장완료", "저장되었습니다.");
		},
		error : function(request){
			if(request.status == "401") {
				alert("인증에 실패 했습니다. 로그인 페이지로 이동합니다.");
				location.href = Config.CONTEXT_PATH + "/j_spring_security_logout";
			} else if (request.status == "403") {
				alert("세션이 만료가 되었습니다. 로그인 페이지로 이동합니다.");
				location.href = Config.CONTEXT_PATH + "/j_spring_security_logout";
			}
			console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
		}
	});
}

/******************************************************************************
 * 
 * cfUpload
 * @url 대상 url
 * @target
 * @fnSuccess 성공 시 처리 함수
 * @Desc ajax call 를 통한 파일 업로드 시 사용
 * 
 ******************************************************************************/
function cfUpload(url, target, fnSuccess, obj, fnBefore, fnError, userId, shopType) {
	var formData = new FormData();
	formData.append("file", $("#" + target)[0].files[0]);	//파일 한개
	formData.append("userId", userId);	//user
	formData.append("shopType", shopType);
	formData.append("params", JSON.stringify(obj));
	formData.append("enctype", "multipart/form-data");
	
	$.ajax({
		url: url,
		type: "POST",
		processData: false,  // file전송시 필수
		contentType: false,  // file전송시 필수
		data: formData,
		beforeSend: fnBefore || function() {
		},
		success: fnSuccess || function(responseText, statusText) {
			
			console.log(responseText);
			console.log(statusText);
			if(responseText.success) {
				alert("업로드 되었습니다.");
			}
			
			if(dialog != null) {
				dialog.remove();
			}
		}, //ajax error 
		error : fnError || function(request){
			console.log(request);
			
			if(dialog != null) {
				dialog.remove();
			}
			
			if(request.status == "401") {
				alert("인증에 실패 했습니다. 로그인 페이지로 이동합니다.");
	            location.href = Config.CONTEXT_PATH + "/j_spring_security_logout";
			} else if (request.status == "403") {
				alert("세션이 만료가 되었습니다. 로그인 페이지로 이동합니다.");
				location.href = Config.CONTEXT_PATH + "/j_spring_security_logout";
			}
			console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
		}
	});
}


/******************************************************************************
 * 
 * cfGetBrowser
 * 클라이언트 브라우저 정보 확인
 * 
 ******************************************************************************/
function cfGetBrowser() {
	var ua = navigator.userAgent;
	var tem;
	var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	
	if(/trident/i.test(M[1])){
		tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
		return 'IE '+(tem[1]||'');
	}   
	if(M[1]==='Chrome'){
		tem=ua.match(/\bOPR\/(\d+)/);
		if(tem!=null)   {return 'Opera '+tem[1];}
	}   
	M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
	return M[0];
}



/******************************************************************************
 * 
 * cfGetBrowserVersion
 * 클라이언트 브라우저 버전 정보 확인 
 * 2017-04-18 mscho
 * 
 ******************************************************************************/
function cfGetBrowserVersion() {
	var ua = navigator.userAgent;
	var tem;
	var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	
	if(/trident/i.test(M[1])){
		tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
		return 'IE '+(tem[1]||'');
	}
	if(M[1]==='Chrome'){
		tem=ua.match(/\bOPR\/(\d+)/);
		if(tem!=null)   {return 'Opera '+tem[1];}
	}   
	M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
	return M[1];
}

function setUserCookie(cname, cvalue) {
	var dt = new Date();
	
	dt.setTime(dt.getTime() + (1 * 60 * 60 * 1000)); // 1시간
    var expires = "expires="+ dt.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires;
}

function getUserCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if(c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

/**
 * 커스텀 엑셀 다운로드
 * 기 작성된 템플릿에 데이터를 채워넣는 방식
 */
function cfCustomExcelDownload(url, obj, method) {
//	var prevDate = obj["prevDate"];
//	var stdDate = obj["stdDate"];
//	var tableName = obj["tableName"];
//	var resultSeq = obj["resultSeq"];
	
	var form = "<form action='" + url + "' method='" + (method ? method : 'POST') + "'>";
//	form += "<input type='hidden' name='prevDate' value='" + prevDate + "' />"; 
//	form += "<input type='hidden' name='stdDate' value='" + stdDate + "' />"; 
//	form += "<input type='hidden' name='tableName' value='" + tableName + "' />"; 
//	form += "<input type='hidden' name='resultSeq' value='" + resultSeq + "' />"; 
	form += "</form>";
	$(form).appendTo("body").submit().remove();
}

/******************************************************************************
 * 
 * cfCustomExcelDownloadDyn
 * 엑셀 다운로드 (동적 파라미터 형태)
 * 
 ******************************************************************************/
function cfCustomExcelDownloadDyn(url, obj, method) {
	
	var keys = Object.keys(obj);
	var form = "<form action='" + url + "' method='" + (method ? method : 'POST') + "'>";
	
	for(var i = 0; i < keys.length; i++) {
		form += "<input type='hidden' name='" + keys[i] + "' value='" + obj[keys[i]] + "' />"; 
	}
	
	form += "</form>";
	
	$(form).appendTo("body").submit().remove();
}


/*
 * 패스워드 변경 (TEST)
 */
function cfSavePassword(oldPassword, newPassword1, newPassword2) {

	// validation
	if(!oldPassword) {
		alert("현재 비밀번호를 확인하십시오");
		return false;
	}
	
	if(newPassword1.length < 6) {
		alert("새 비밀번호는 6자리 이상이어야 합니다");
		return false;
	}
	
	if(newPassword1 && newPassword1 != newPassword2) {
		alert("새 비밀번호가 일치하지 않습니다");
		return false;
	}
	
	oldPassword  = CryptoJS.SHA256(oldPassword  + Config.SHA256_SALT) + "";
	newPassword1 = CryptoJS.SHA256(newPassword1 + Config.SHA256_SALT) + "";
}


function ckBisNo(bisNo) {
    // 넘어온 값의 정수만 추츨하여 문자열의 배열로 만들고 10자리 숫자인지 확인합니다.
    if ((bisNo = (bisNo+'').match(/\d{1}/g)).length != 10) { return false; }

    // 합 / 체크키
    var sum = 0, key = [1, 3, 7, 1, 3, 7, 1, 3, 5];

    // 0 ~ 8 까지 9개의 숫자를 체크키와 곱하여 합에더합니다.
    for (var i = 0 ; i < 9 ; i++) { sum += (key[i] * Number(bisNo[i])); }

    // 각 8번배열의 값을 곱한 후 10으로 나누고 내림하여 기존 합에 더합니다.
    // 다시 10의 나머지를 구한후 그 값을 10에서 빼면 이것이 검증번호 이며 기존 검증번호와 비교하면됩니다.
    // 체크섬구함
    var chkSum = 0;
    chkSum = Math.floor(key[8] * Number(bisNo[8]) / 10);

    // 체크섬 합계에 더해줌
    sum +=chkSum;
    var reminder = (10 - (sum % 10)) % 10;
    //값 비교
    if(reminder==Number(bisNo[9])) return true;
    return false;
}

//Submit
function fn_submit(opt_formId){
	this.formId = fn_isNull(opt_formId) == true ? "commonForm" : opt_formId;
	this.url = "";
	
	if(this.formId == "commonForm"){
		$("#commonForm")[0].reset();
	}
	
	this.setUrl = function setUrl(url){
		this.url = url;
	};
	
	this.addParam = function addParam(key, value){
		$("#"+this.formId).append($("<input type='hidden' name='"+key+"' id='"+key+"' value='"+value+"' >"));		
	};
	
	this.submit = function submit(){
		var frm = $("#"+this.formId)[0];
		frm.action = this.url;
		frm.method = "post";
		frm.submit();
	};	
}

//check NULL
function fn_isNull(str){
	if(str == null) return true;
	if(str == "NaN") return true;
	if(new String(str).valueOf() == "undefined") return true;
	var chkStr = new String(str);
	if(chkStr.valueOf() == "undefined") return true;
	if(chkStr == null) return true;
	if(chkStr.toString().length == 0)  return true;
	return false;
}
