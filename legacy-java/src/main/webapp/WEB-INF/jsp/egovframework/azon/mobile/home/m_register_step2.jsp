<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<script>
let bizComplete = false; // 사업자등록번호
let idDupliComplete = false; // 아이디
let emailSendComplete = false; // 이메일 전송 여부
let emailAuth = false; // 이메일 인증
let phoneSendComplete = false; // SMS 전송 여부
let phoneAuth = false; // SMS 인증

$(document).ready(function(){
	selectShop();
	
	//폼 제출 다음 페이지로
	$(document).on('click',"#regiBtn",function(){
		let valCheck = validationCheck();
		if(valCheck == true){
			let txtPwd = $('#txtPwd').val();
			let encPwd = CryptoJS.SHA256(txtPwd + cubici.SHA256_SALT);
			$('#encPwd').val(encPwd);
			$("form").submit();
		}
	});
	
	// 중복체크 후 데이터 변경시
	$(document).on('change keyup', "#bizNum", function(){ // 사업자등록번호
		bizComplete = false;
	});
	$(document).on('change keyup', "#userId", function(){ // 아이디
		idDupliComplete = false; // 아이디 중복확인
		emailSendComplete = false; // 이메일 인증번호 전송
		emailAuth = false; // 이메일 인증
		$("#btnEmailCertify").text("인증하기");
	});
	$(document).on('change keyup', "#phoneNum", function(){ // 전화번호
		phoneSendComplete = false; // SMS 인증번호 전송
		phoneAuth = false; // SMS 인증
		$("#btnSmsCertify").text("인증하기");
	});
	
	// 사업자등록번호 중복확인
	$(document).on('click', "#btnBizChk", function(){
		
		let bizNum = $.trim($("#bizNum").val());
		if (bizNum.length <= 0) {
			modalInfo("사업자번호를 입력해주세요.");
			$("[name='bizNum']").focus();
			return false;
		}
		// 사업자등록번호 형식 체크
		let bizNoForm = ckBisNo(bizNum);
		if(bizNoForm === false){
			modalInfo("잘못된 사업자등록번호 입니다.");
			return false;
		}
		
		checkOverlap({FLAG: "bizNo", FIRM_ID: bizNum});
	});
	
	// 아이디 중복확인
	$(document).on('click', "#btnDuplicate", function(){
		
		let userId = $.trim($("#userId").val());
		if (userId.length <= 0) {
			modalInfo("아이디를 입력해주세요.");
			$("#userId").focus();
			return false; 
		}
		// 이메일 형식 체크
		let emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		let checkEmailForm = checkRegexp(userId, emailRegex);
		if(!checkEmailForm) {
			modalInfo("이메일 형식을 확인해주세요.");
			return false;
		}
		
		checkOverlap({FLAG: "userId", USER_ID: userId});
	});
	
	// 이메일 보내기
	$(document).on('click', "#btnEmailSend", function(){
		
		if(idDupliComplete === false){
			modalInfo("아이디 중복확인 해주세요.");
			return false;
		}
		
		let uri = "/mailAuth";
		let objParam = {FLAG: "email", USER_ID: $.trim($("#userId").val())};
		emailSendComplete = sendAuthCode(uri, objParam);
	});
	
	// 이메일로 보낸 키값과 비교
	$(document).on('click', "#btnEmailCertify", function(){
		
		if(emailSendComplete === false){
			modalInfo('이메일 인증 버튼을 클릭해 주세요.');
			return false;
		}
		
		let inputEmailCertNum = $.trim($("#inputEmailCertNum").val());				
		let sendEmailCertNum = $("#sendEmailCertNum").val();
							
		if(inputEmailCertNum === sendEmailCertNum){
			modalInfo("정상적으로 인증되었습니다.");
			$("#btnEmailCertify").text("인증완료");
			emailAuth = true;
		} else {
			modalInfo("인증번호가 올바르지 않습니다.");
		}
	});
	
	// sms 인증 보내기
	$(document).on('click', "#btnSmsSend", function(){
		
		let phoneNum = $.trim($("#phoneNum").val());				
		if (phoneNum.length <= 10) {
			modalInfo("핸드폰 번호를 입력해주세요.");
			$("#phoneNum").focus();
			return false;
		}
		
		let uri = "/smsAuth";
		let objParam = {FLAG: "sms", USER_PHONE: phoneNum};
		phoneSendComplete = sendAuthCode(uri, objParam);
	});
	
	// sms로 보낸 키값과 비교
	$(document).on('click', "#btnSmsCertify", function(){
		
		if(phoneSendComplete === false){
			modalInfo('SMS 인증 버튼을 클릭해주세요.');
			return false;
		}
		
		let inputSmsCertNum = $.trim($("#inputSmsCertNum").val());				
		let sendSmsCertNum = $("#sendSmsCertNum").val();	
		
		if(inputSmsCertNum === sendSmsCertNum){
			modalInfo("정상적으로 인증되었습니다.");
			$("#btnSmsCertify").text("인증완료");
			phoneAuth = true;
		} else {
			modalInfo("인증번호가 올바르지 않습니다.");
		}
	});
	/* ********** 기본정보 탭 끝 ********** */
});

//유형 / 업종 선택
function selectShop(){
	let callUrl = "/selectShop";
	let callBackFunc = "selectShopResponse";
	let objParam = {
		param : "param"
		}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function selectShopResponse(data){
	$("#bizType").append("<option value='-'>유형 선택</option>");
    for(key in data.bizType){
    	$("#bizType").append("<option value='"+key+"'>"+data.bizType[key]+"</option>");
    }
    
   	//구분 셀렉트 박스 옵션
	let selectDivision = $("#CBCI_SECTOR").attr("id");
	selectMenuList(selectDivision);
}

/* ********** 기본정보 탭 ********** */
// 사업자등록번호, 아이디 중복검사
function checkBizOverlap(objParam){
	$.ajax({
		cache : false,
		async : false,
		type : "POST",
		url : "/checkOverlap",
		data : JSON.stringify(objParam),
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result.resultCode === 0) {
				if(result.FLAG === "bizNo"){
					if(result.resultMap.COUNT === 0){
						modalInfo("사업자번호 유효성이 확인되었습니다.");
						bizComplete = true;
					} else {
						modalInfo("중복된 사업자번호입니다.");
					}
				} else if(result.FLAG === "userId"){
					if(result.resultMap.COUNT === 0){
						modalInfo("사용 가능한 아이디입니다.");
						idDupliComplete = true;
					} else {
						modalInfo("중복된 아이디입니다.");
					}
				}
			} else {
				console.log("ErrorCode ::: " + result.resultCode);
				modalInfo("관리자에게 문의 바랍니다.");
			}
		},
		error : function() {
			alert(cubici.AJAX_ERROR_MSG);
		}
	});
}

// 기본정보 입력확인
function validationCheck() {
	
	// 회사명
	let firmNm = $("#firmNm").val();
	if(firmNm === null || firmNm === "") {
		modalInfo("회사명을 입력해주세요.");
		return false;
	}
			
	// 사업자등록번호
	let bizNum = $("#bizNum").val();
	if(bizNum === null || bizNum === "") {
		modalInfo("사업자등록번호를 입력해주세요.");
		return false;
	}
	if(bizComplete === false){
		modalInfo('사업자등록번호 유효성을 확인해주세요.');
		return false;
	}
			
	// 대표자명
	let userNm = $("#userNm").val();
	if(userNm === null || userNm === "") {
		modalInfo("대표자명을 입력해주세요.");
		return false;
	}
	
	// 설립연도
	let setupdate = $("#setupdate").val();
	if(setupdate === null || setupdate === "" || setupdate.length < 8) {
		modalInfo("설립연도를 형식에 맞게 입력해주세요.");
		return false;
	}
	
	// 사업자 유형
	let bizType = $("#bizType option:selected").val();
	if(bizType === "-") {
		modalInfo("사업자유형을 선택해주세요.");
		return false;
	}
	
	// 업종
	let sectors = $("#CBCI_SECTOR").val();
	if(sectors === "") {
		modalInfo("업종을 선택해주세요.");
		return false;
	}
	
	// 주소
	let roadFullAddr = $("#roadFullAddr").val();
	if(roadFullAddr === null || roadFullAddr === "") {
		modalInfo("주소를 입력해주세요.");
		return false;
	}
			
	// 아이디(이메일)
	let userId = $("#userId").val();
	if(userId === null || userId === "") {
		modalInfo("ID를 입력해주세요.");
		return false;
	}
	if(idDupliComplete === false) {
		modalInfo("ID 중복확인을 해주세요.");
		return false;
	}			
	if(emailSendComplete === false){
		modalInfo('이메일 인증 버튼을 클릭해주세요.');
		return false;
	}
	if(emailAuth === false){
		modalInfo('이메일 인증번호 확인을 해주세요.');
		return false;
	}
	
	// 비밀번호 체크
	let txtPwd = $("#txtPwd").val();
	let encryptPwd = $("#encryptPwd").val();
	if(txtPwd.length < 1) {
		modalInfo("비밀번호를 입력해 주세요.");
		return false;
	}
	let regExpPw = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&()+=]).*$/;
	let passwdRegexpCheck = checkRegexp(txtPwd, regExpPw);
	if(!passwdRegexpCheck) {
		modalInfo("비밀번호는 영문자, 숫자, 특수문자를 조합하여 8자 이상 15자 이하로 입력하시기 바랍니다.");
		return false;
	}
	if(encryptPwd.length<1) {
		modalInfo("확인 비밀번호를 입력해 주세요.");
		return false;
	}
	if(txtPwd !== encryptPwd) {
		modalInfo("비밀번호가 일치하지 않습니다.");
		$("#txtPwd").val('');
		$("#encryptPwd").val('');
		return false;
	} 
	
	// 대표자 핸드폰
	let phoneNum = $("#phoneNum").val();
	if(phoneNum === null || phoneNum === "") {
		modalInfo("전화번호를 입력해주세요.");
		return false;
	}
	if(phoneSendComplete === false){
		modalInfo('SMS 인증 버튼을 클릭해 주세요.');
		return false;
	}
	if(phoneAuth === false){
		modalInfo('SMS 인증번호 확인을 해주세요.');
		return false;
	}
	
	return true;
}

function sendAuthCode(uri, objParam) {
	
	let resultBoolean = false;
	
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
				if (result.resultChar === "Y") {
					
					resultBoolean = true;
					if(objParam.FLAG === "email"){
						modalInfo("인증번호가 발송되었습니다.");
						$("#sendEmailCertNum").val(result.authCode);
					} else if(objParam.FLAG === "sms"){
						modalInfo("인증번호가 발송되었습니다.");
						$("#sendSmsCertNum").val(result.authCode);
					}
				} else {
					if(objParam.FLAG === "email"){
						modalInfo("이메일 발송에 실패했습니다.");
					} else if(objParam.FLAG === "sms"){
						modalInfo("SMS 발송에 실패했습니다.");
					}
				}
				console.log(objParam.FLAG+" 전송 확인 :: "+resultBoolean);
			} else {
				console.log("ErrorCode ::: " + result.resultCode);
				modalInfo("관리자에게 문의 바랍니다.");
			}
		},
		error : function() {
			alert(cubici.AJAX_ERROR_MSG);
		}
	});
	
	return resultBoolean;
}


</script>

<div class="subContents onlyContents">
    <div class="inner">
	    <div class="contentArea">
            <div class="m-tab">
                <ul>
                    <li><a href="javascript:;" style="cursor: default;" data-page="join02">약관 동의</a></li>
                    <li class="active"><a href="javascript:;" style="cursor: default;" data-page="join01">기본 정보</a></li>
                    <li><a href="javascript:;" style="cursor: default;" data-page="join03">쇼핑몰 등록</a></li>
                </ul>
            </div>
            <div class="m-tabBox active">
                <div class="mArticleArea">
                    <article>
                        <div class="topTxt">
                            <p class="t1">쇼핑몰 통합정산 서비스 큐빅아이 가입을 환영합니다.</p>
                            <p class="t2">아래 회원가입 정보를 정확히 입력해 주세요.</p>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <header>
                            <h3>기본 정보</h3>
                        </header>
                        <form role="form" action="/m/register/step3" method="post">
                        <div class="contentsArea">
                            <ul class="item vertical">
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">회사명</span>
                                        <div class="input">
                                            <input type="text" name=firmNm'' id='firmNm' placeholder="회사명">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1 btn">
                                    <div class="fwBox">
                                        <span class="ft">사업자등록번호</span>
                                        <div class="input">
                                         <input type="text" name='bizNum' id='bizNum' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="‘-’ 자 없이 숫자만 입력">
                                     </div>
                                    </div>
                                    <div class="fwBtn">
                                        <a href="javascript:;" id="btnBizChk" class="mBtn sColorLB">확인</a>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">대표자명</span>
                                        <div class="input">
                                        	<input type="text" name='userNm' id='userNm' placeholder="대표자명">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">설립연도</span>
                                        <div class="input">
                                            <input type="text" name='setupdate' id='setupdate' maxlength='8' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="ex) 20120815">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">사업자 유형</span>
                                        <div class="input">
                                         <select name='bizType' id="bizType">
                                         </select>
                                     </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">업종</span>
                                        <div class="input">
                                         <select id="CBCI_SECTOR">
                                         </select>
                                     </div>
                                    </div>
                                </li>
                                <li class="col-1 btn">
									<div class ="fwBox">
									    <span class="ft">사업장 주소</span>
									    <div class="input">
									        <input type="text" name='zipCode' id="zipCode" class="zipCode" placeholder="우편번호" readonly>
									    </div>
									</div>
									<div class="fwBtn">
									    <a href="javascript:;" id="addrSearch" class="mBtn sColorLB">찾기</a>
									</div>
                                </li>
                                <li class="col-1">
                                 <div class="fwBox">
                                     <div class="input">
                                         <input type="text" name='roadFullAddr' id="roadFullAddr" class="roadFullAddr" placeholder="상세주소">
                                     </div>
                                 </div>
                             </li>
                            </ul>
                            <ul class="item vertical hasTopLine2">
                                <li class="col-1 btn">
                                    <div class="fwBox">
                                        <span class="ft">아이디</span>
                                        <div class="input">
                                        	<input type="text" name='userId' id='userId' onkeypress="capsLock(event);" placeholder="아이디">
                                        </div>
                                    </div>
                                    <div class="fwBtn">
                                        <a href="javascript:;" id="btnDuplicate" class="mBtn sColorLB">중복확인</a>
                                    </div>
                                </li>
                                <li class="btn">
                                	<a href="javascript:;" id="btnEmailSend" class="mBtn wBtn sColorLB">이메일 인증</a>
                                </li>
                                <li class="col-1 btn">
                                    <div class="fwBox">
                                        <span class="ft">인증번호 입력</span>
                                     <div class="input">
                                         <input type="text" id='inputEmailCertNum' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="인증번호 입력">
                                         <input type="hidden" id='sendEmailCertNum'>
                                     </div>
                                    </div>
                                    <div class="fwBtn">
                                        <a href="javascript:;" class="mBtn sColorLB" id="btnEmailCertify">인증하기</a>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">암호</span>
                                        <div class="input">
                                            <input type="password" id='txtPwd' placeholder="숫자, 영어 특수문자 10자이상">
                                            <input type="hidden" name='encPwd' id='encPwd'>
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">암호확인</span>
                                        <div class="input">
                                            <input type="password" id='encryptPwd' placeholder="숫자, 영어 특수문자 10자이상">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1 btn">
                                    <div class="fwBox">
                                        <span class="ft">대표자 핸드폰</span>
                                        <div class="input">
                                            <input type="text" name='phoneNum' id='phoneNum' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="숫자만 입력">
                                   		</div>
                                    </div>
                                    <div class="fwBtn">
                                        <a href="javascript:;" id="btnSmsSend" class="mBtn sColorLB">SMS 인증</a>
                                    </div>
                                </li>
                                <li class="col-1 btn">
                                    <div class="fwBox">
                                        <span class="ft">인증번호 입력</span>
                                        <div class="input">
                                         <input type="text" id='inputSmsCertNum' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="인증번호 입력">
                                         <input type="hidden" id='sendSmsCertNum'>
                                     </div>
                                    </div>
                                    <div class="fwBtn wide">
                                        <a href="javascript:;" id="btnSmsCertify" class="mBtn sColorLB">인증하기</a>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">연계인증번호</span>
                                        <div class="input">
                                            <input type="text" name='linkedNum' id="linkedNum" placeholder="연계 인증번호 입력">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">추천기관번호</span>
                                        <div class="input">
                                            <input type="text" name='recommendedNum' id="recommendedNum" placeholder="기업추천 기관번호 입력">
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="btnArea">
                        	<a href="/m/register/step1" class="mBtn sColorLB">이전</a>
                            <button type="button" id="regiBtn" class="mBtn sColorN">다음</button>
                        </div>
                        </form>
                    </article>
                </div>
            </div>
        </div>
    </div>
</div>