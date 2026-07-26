/***********************************************************************************************
 * 
 * 공통 script
 * 2021-01-19
 * by KJC
 *
 ***********************************************************************************************/

var cubici = {
	SHA256_SALT: "{AZON}", // 로그인 정보
	COMMON_ERROR_MSG : "작업에 실패했습니다.",
	AJAX_ERROR_MSG : "서버와 통신에 실패했습니다."
}

/* Ajax Post 요청 
 * @param : object, 요청 URL, callback URL, async */
cubici.Ajax = {
	fnRequest : function(objParam, callUrl, callbackFunc, isAsync) {
		$.ajax({
			cache : false,
			async : (typeof (isAsync) == "undefined" ? true : false),
			type : "POST",
			url : callUrl,
			data : JSON.stringify(objParam),
			dataType : "JSON",
			contentType : "application/json; charset=utf-8",
			beforeSend : function(xmlHttpRequest) {
				//console.log("--- "+JSON.stringify(objParam)+" ---");
				/*$("#preloader2").css({
					"display" : "block"
				})*/
				xmlHttpRequest.setRequestHeader("AJAX", "true");
			},
			complete: function () {
		       /*$("#preloader2").css({
					"display" : "none"
				})*/
			},
			success : function(result) {
				if (result.resultCode === 0) {
					if (typeof (result) === "object") {
						eval(callbackFunc)(result);
					} else if (typeof (objJson) === "string") {
						eval(callbackFunc)(jQuery.parseJSON(result));
					} else {
						alert(cubici.COMMON_ERROR_MSG);
					}
				} else if(result.resultCode === 57){
					$(location).attr("href", result.Uri);
				} else {
					alert("ErrorCode ::: " + result.resultCode);
				}
			},
			error : function(result) {
				alert(cubici.AJAX_ERROR_MSG);
			}
		});
	}
}

/*ajax file*/
cubici.Ajax.file = {
	fnRequest : function(formData, callUrl, callbackFunc, isAsync) {
		$.ajax({
			cache : false,
			async : (typeof (isAsync) == "undefined" ? true : false),
			type : "POST",
			enctype : "multipart/form-data",
			url : callUrl,
			data : formData,
			processData : false,
			contentType : false,
			success : function(result) {
				if (typeof (result) === "object") {
					eval(callbackFunc)(result);
				} else if (typeof (objJson) === "string") {
					eval(callbackFunc)(jQuery.parseJSON(result));
				} else {
					alert(cubici.COMMON_ERROR_MSG);
				}
			},
			error : function(result) {
				console.log(result.responseText);
			}
		});
	}
}

cubici.Ajax.download = {
	fnRequest : function(objParam, callUrl){
		$.ajax({
			url : callUrl,
			data : JSON.stringify(objParam),
			type : 'POST',
			cache : false,
			contentType: 'application/json',
			xhrFields : {
				responseType : 'blob',
			},
		}).done(function (blob, status, xhr) {
			let fileName = '';
			let disposition = xhr.getResponseHeader('Content-Disposition');
			
			if(disposition && disposition.indexOf('attachment') !== -1){
				fileName = decodeURI(disposition.split('filename=')[1].split(';')[0]);
			} else if(disposition == null){
				let reader = new FileReader();
				reader.onload = function() {
				    modalInfo(reader.result);
				}
				reader.readAsText(blob);
				return;
			}
			
			let URL = window.URL || window.webkitURL;
			let downloadUrl = URL.createObjectURL(blob, fileName);

			if (fileName) {
				let a = document.createElement('a')
				
				if (a.download === undefined) {
					window.location.href = downloadUrl;
				} else {
					a.href = downloadUrl;
					a.download = fileName;
					document.body.appendChild(a);
					a.click();
				}
			} else {
				window.location.href = downloadUrl;
			}
		}).fail(function(){
			modalInfo("관리자에게 문의해주세요.");
		});
	}
}

/******************************************************************************
 * 
 * @type   : function
 * @access : public
 * @desc   : 천원단위로 콤마찍는 함수
 * @param  : amount 숫자또는 문자, digit 소수점 표현단위
 * @return : 치환된 문자 스트링
 * 
 ******************************************************************************/
function cfFormatAmt(amount, digit) {
    var reg = /(^[+-]?\d+)(\d{3})/; // 정규식 표현식
    amount = Math.round(amount*digit)/digit;
    amount += ''; // 숫자 -> 문자열
    while (reg.test(amount)) amount = amount.replace(reg, '$1' + ',' + '$2');
    return amount;
}

function comma(str) {
	str = String(str);
	
	if(str.indexOf(",") > 0) {
		str = str.replace(/,/gi, '');
	}
	
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

function deComma(str) {
	str = String(str);
	
	if(str.indexOf(",") > 0) {
		str = str.replace(/,/gi, '');
	}
	
	return str;
}

// CAPS LOCK
function capsLock(e) {
	var keyCode = 0;
    var shiftKey = false;

    keyCode = e.keyCode;
    shiftKey = e.shiftKey;
    
	if (((keyCode >= 65 && keyCode <= 90) && !shiftKey) || ((keyCode >= 97 && keyCode <= 122) && shiftKey)) {
		alert("CapsLock이 켜져 있습니다");
		return;
	}
}

// 날짜 형태 변경(yyyy-mm-dd)
function formatDate(date) {
	var d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
	if (month.length < 2) {
		month = '0' + month;
	}
	if (day.length < 2) {
		day = '0' + day;
	}
	return [year, month, day].join('-');
}

// 쿠키 가져오기
function getCookie(name) {
	let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return value ? decodeURIComponent(value[2]) : null;
}

// 데이터 형식 체크
function checkRegexp(checkStr, regexp) {
	if (!regexp.test(checkStr)) {
		return false;
	} else {
		return true;
	}
}

//file size
function byteSize(size){
	if(size == 0) return 0;

	const k = 1024
	const byteType = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	
	const i = Math.floor(Math.log(size) / Math.log(k));
	
	return parseFloat((size / Math.pow(k, i)).toFixed(3)) + ' ' + byteType[i];
}