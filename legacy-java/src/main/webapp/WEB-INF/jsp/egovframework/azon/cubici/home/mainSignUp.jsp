<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<script>
$(document).ready(function(){
    // 회원가입 어디까지 했는지 판단
	let registStatus = 0;

	setSelectBox();
	
	// 회원가입 버튼 이벤트
	$(document).on('click', ".registNextBtn, .registPrevBtn", function(){
		 if($(this).hasClass("registNextBtn")){
			if(registStatus === 0){ // 첫번째 페이지에서 다음 눌렀을 때
				nextCheck = $(".agreeAll").prop('checked');
				if(!nextCheck){
					modalInfo("이용약관에 모두 동의해주세요.");
					return false;
				}
			}
			registStatus++;
		} else {
			registStatus--;
		}
		$(".m-tab").find("li").removeClass("active");
		$(".m-tab").find("li").eq(registStatus).addClass("active");
		$(".m-tabBox").removeClass("active");
		$(".m-tabBox").eq(registStatus).addClass("active");
	});

	let bizComplete = false; // 사업자등록번호
	let emailAuth = false; // 이메일 인증
	let phoneAuth = false; // SMS 인증

	/* ********** 기본정보 탭 ********** */
	// 중복체크 후 데이터 변경시
	$(document).on('change keyup', "#bizNum", function() { // 사업자등록번호
		bizComplete = false;
	});
	$(document).on('change keyup', "#userId", function() { // 아이디
		emailSendComplete = false; // 이메일 인증번호 전송
		emailAuth = false; // 이메일 인증
		$("#btnEmailCertify").text("인증하기");
	});
	$(document).on('change keyup', "#phoneNum", function() { // 전화번호
		phoneSendComplete = false; // SMS 인증번호 전송
		phoneAuth = false; // SMS 인증
		$("#btnSmsCertify").text("인증하기");
	});

	// 사업자등록번호 중복확인
	$(document).on('click', "#btnBizChk", function() {
		let bizNum = $.trim($("#bizNum").val());
		if (bizNum.length <= 0) {
			modalInfo("사업자번호를 입력해주세요.");
			$("#bizNum").focus();
			return false;
		}
		// 사업자등록번호 형식 체크
		let bizNoForm = ckBisNo(bizNum);
		if (bizNoForm === false) {
			modalInfo("사업자 등록번호 형식이 올바르지 않습니다.");
			return false;
		}
		bizComplete = checkBizOverlap({ FIRM_ID : bizNum, flag : 'user'});
	});

	// 이메일 보내기
	$(document).on('click', "#btnEmailSend", function() {
		let userId = $.trim($("#userId").val());
		if (userId.length <= 0) {
			modalInfo("아이디를 입력해주세요.");
			$("#userId").focus();
			return false;
		}
		// 이메일 형식 체크
		let emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		let checkEmailForm = checkRegexp(userId, emailRegex);
		if (!checkEmailForm) {
			modalInfo("이메일 형식을 확인해주세요.");
			return false;
		}

		let uri = "/mailAuth";
		let objParam = {
			FLAG : "signUpEmail",
			toUser : userId
		};
		sendAuthCode(uri, objParam);
	});

	// 이메일로 보낸 키값과 비교
	$(document).on('click', "#btnEmailCertify", function() {
		let inputEmailCertNum = $.trim($("#inputEmailCertNum").val());
		let userId = $.trim($("#userId").val());
		if (getAuthNum("mail", userId, inputEmailCertNum) === "PASS") {
			modalInfo("정상적으로 인증되었습니다.");
			$("#btnEmailCertify").text("인증완료");
			emailAuth = true;
		} else {
			modalInfo("인증번호가 올바르지 않습니다.");
		}
	});

	// sms 인증 보내기
	$(document).on('click', "#btnSmsSend", function() {
		let phoneNum = $.trim($("#phoneNum").val());
		if (phoneNum.length <= 10) {
			modalInfo("핸드폰 번호를 입력해주세요.");
			$("#phoneNum").focus();
			return false;
		}
		let uri = "/smsAuth";
		let objParam = {
			FLAG : "signUpSms",
			USER_PHONE : phoneNum
		};
		sendAuthCode(uri, objParam);
	});

	// sms로 보낸 키값과 비교
	$(document).on('click', "#btnSmsCertify", function() {
		let inputSmsCertNum = $.trim($("#inputSmsCertNum").val());
		let phoneNum = $.trim($("#phoneNum").val());
		if (getAuthNum("sms", phoneNum, inputSmsCertNum) === "PASS") {
			modalInfo("정상적으로 인증되었습니다.");
			$("#btnSmsCertify").text("인증완료");
			phoneAuth = true;
		} else {
			modalInfo("인증번호가 올바르지 않습니다.");
		}
	});
	
	//기본정보 입력확인
	function validationCheck() {

		// 회사명
		let firmNm = $("#firmNm").val();
		if (firmNm === null || firmNm === "") {
			modalInfo("회사명을 입력해주세요.");
			return false;
		}

		// 사업자등록번호
		let bizNum = $("#bizNum").val();
		if (bizNum === null || bizNum === "") {
			modalInfo("사업자등록번호를 입력해주세요.");
			return false;
		}
		if (bizComplete === false) {
			modalInfo('사업자등록번호 유효성을 확인해주세요.');
			return false;
		}

		// 대표자명
		let userNm = $("#userNm").val();
		if (userNm === null || userNm === "") {
			modalInfo("대표자명을 입력해주세요.");
			return false;
		}

		// 설립연도
		let setupdate = $("#setupdate").val();
		if (setupdate === null || setupdate === "" || setupdate.length < 8) {
			modalInfo("설립연도를 형식에 맞게 입력해주세요.");
			return false;
		}

		// 사업자 유형
		let bizType = $("#bizType option:selected").val();
		if (bizType === "") {
			modalInfo("사업자유형을 선택해주세요.");
			return false;
		}

		// 업종
		let sectors = $("#sectors").val();
		if (sectors === "") {
			modalInfo("업종을 선택해주세요.");
			return false;
		}

		// 주소
		let roadFullAddr = $("#roadFullAddr").val();
		if (roadFullAddr === null || roadFullAddr === "") {
			modalInfo("주소를 입력해주세요.");
			return false;
		}

		// 아이디(이메일)
		let userId = $("#userId").val();
		if (userId === null || userId === "") {
			modalInfo("ID를 입력해주세요.");
			return false;
		}
		if (emailAuth === false) {
			modalInfo('이메일 인증번호 확인을 해주세요.');
			return false;
		}

		// 비밀번호 체크
		let txtPwd = $("#txtPwd").val();
		let encryptPwd = $("#encryptPwd").val();
		if (txtPwd.length < 1) {
			modalInfo("비밀번호를 입력해 주세요.");
			return false;
		}
		let regExpPw = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&()+=]).*$/;
		let passwdRegexpCheck = checkRegexp(txtPwd, regExpPw);
		if (!passwdRegexpCheck) {
			modalInfo("비밀번호는 영문자, 숫자, 특수문자를 조합하여 8자 이상 15자 이하로 입력하시기 바랍니다.");
			return false;
		}
		if (encryptPwd.length < 1) {
			modalInfo("확인 비밀번호를 입력해 주세요.");
			return false;
		}
		if (txtPwd !== encryptPwd) {
			modalInfo("비밀번호가 일치하지 않습니다.");
			$("#txtPwd").val('');
			$("#encryptPwd").val('');
			return false;
		}

		// 대표자 핸드폰
		let phoneNum = $("#phoneNum").val();
		if (phoneNum === null || phoneNum === "") {
			modalInfo("전화번호를 입력해주세요.");
			return false;
		}

		if (phoneAuth === false) {
			modalInfo('SMS 인증번호 확인을 해주세요.');
			return false;
		}
        signUpRequest();
		return true;
	}
	
	/* ********** 기본정보 탭 끝 ********** */

	// 회원가입 > 약관동의 > 전체동의 스크립트
	$(document).on('change', ".agreeAll", function() {
        let state = $(this).prop('checked') ? true : false;
        $('input[name="agree"]').prop('checked', state);
	});

	$(document).on('change', 'input[name="agree"]', function() {
		let thisLength = $('input[name="agree"]').length;
		let checkedLength = $('input[name="agree"]:checked').length;
		let state = thisLength == checkedLength ? true : false;
		$('.agreeAll').prop('checked', state);
	});

	// 회원가입 등록하기
	$(document).on('click', "#registBtn", function() {
        validationCheck();
	});

});

function setSelectBox(){
    let callUrl = "/selectShop";
    let callBackFunc = "setSelectBoxResponse";
    let objParam = {
        flag: "signUp"
    }
    cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function setSelectBoxResponse(result){
    if (result.resultCode === 0) {
        $("#bizType").empty().html("<option value=''>유형 선택</option>");
        for(key in result.bizType){
            $("#bizType").append("<option value='"+key+"'>"+result.bizType[key]+"</option>");
        }
        $("#sectors").empty().html("<option value=''>유형 선택</option>");
        for(key in result.sectors){
            $("#sectors").append("<option value='"+key+"'>"+result.sectors[key]+"</option>");
        }
        $("#shopList").empty().html("<option value=''>쇼핑몰 선택</option>");
        for(key in result.shopList){
            $("#shopList").append("<option value='"+key+"'>"+result.shopList[key]+"</option>");
        }
        $("#partnerCode").empty().html("<option value='CBCI'>협력사 선택</option>");
        for(key in result.partners){
            $("#partnerCode").append("<option value='"+key+"'>"+result.partners[key]+"</option>");
        }
    } else {
        modalInfo("관리자에게 문의 바랍니다.");
    }
}

// 회원가입
function signUpRequest() {

    // 기본정보
    let encryptUserPw = CryptoJS.SHA256($("#txtPwd").val() + cubici.SHA256_SALT);

    let objParam = {
        USER_ID : $("#userId").val(),
        USER_PW : encryptUserPw.toString(),
        USER_TYPE : "01",
        USER_NM : $("#userNm").val(),
        USER_PHONE : $("#phoneNum").val(),
        FIRM_ID : $("#bizNum").val(),
        FIRM_NM : $("#firmNm").val(),
        FIRM_ZIP_CODE : $("#zipCode").val(),
        FIRM_ADDR : $("#roadFullAddr").val(),
        FIRM_SETUP_DATE : $("#setupdate").val(),
        BUSINESS_TYPE : $("#bizType option:selected").val(),
        SECTORS : $("#sectors option:selected").val(),
        LINKED_NUM : $("#linkedNum").val(),
        RECOMMENDED_NUM : $("#partnerCode option:selected").val()
    };

    $.ajax({
        cache : false,
        async : false,
        type : "POST",
        url : "/signUp",
        data : JSON.stringify(objParam),
        dataType : "JSON",
        contentType : "application/json; charset=utf-8",
        success : function(result) {
            if (result.resultCode === 0) {
                // 회원가입 축하 이메일 전송
                let uri = "/mailAuth";
                let objParam = {
                    FLAG : "welcomeEmail",
                    userNm : $("#userNm").val(),
                    toUser : $("#userId").val(),
                    company : $("#firmNm").val(),
                    phoneNum : $("#phoneNum").val()
                };
                welcomeEmail = sendAuthCode(uri, objParam);
                if (welcomeEmail === "Y") {
                    openWelcomeModal();
                }
            } else {
                modalInfo("회원가입에 실패 했습니다. 관리자에게 문의 바랍니다.");
            }
        },
        error : function() {
            alert(cubici.AJAX_ERROR_MSG);
        }
    });
}

function openWelcomeModal(){
	let callUrl = "/selectFreeChargeInfo";
	let callBackFunc = "openWelcomeModalResponse";
	let objParam = { flag: "free" }
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function openWelcomeModalResponse(data){
	let result = data.freeChargeMap;
	$("#signUpCompleteId").text($("#userId").val());
	$("#signUpCompleteName").text($("#userNm").val());
	$("#signUpName").text($("#userNm").val());
	$("#signUpCompleteDate").text(result.startDate);
	$("#signUpCompleteFreeDate").text(result.changeExpireDate);
	modalOpen("signUpComplete");
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="javascript:;" style="cursor: default;">약관 동의</a></li>
        <li><a href="javascript:;" style="cursor: default;">기본 정보</a></li>
    </ul>
</div>

<div class="m-tabBox active">
    <div class="mArticleArea policySet">
    	<article>
            <div class="topTxt">
                <p class="t1">3개월 무료 이용!</p>
                <p class="t2">
                    <br/>
                    쇼핌올 통합정산 서비스 큐빅아이에 오신 것을 환영합니다. <br/>
                    회원가입을 하시면 큐빅아이를 마음껏 이용해 보실 수 있습니다. 무료이용기간 후, 서비스가 마음에 들지 않으시면
                    아무런 제한없이 해지도 자유롭게 <br/>
                    인공지능 기반의 쇼핑몰 통합정보 서비스, 큐빅아이가 회원님의 사업 성공을 기원합니다.
                </p>
            </div>
        </article>
        <div class="articleTitle">
            <span class="t1">이용약관</span>
            <div class="aRight">
                <label class="checkBox">
                    <input type="checkbox" class="agreeAll">
                    <span>이용 약관 전체 동의</span>
                </label>
            </div>
        </div>
        <article class="m-modalGrid">
            <div class="contentsArea">
                <div class="policyTxtBox">
                	<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/agree1.jsp" flush="true" />
                </div>
                <div class="checkArea">
                    <label class="checkBox">
                        <input type="checkbox" name="agree">
                        <span>약관에 동의합니다.</span>
                    </label>
                </div>
            </div>
        </article>
        <article class="m-modalGrid">
            <header>
                <h3>개인정보 보호정책</h3>
            </header>
            <div class="contentsArea">
                <div class="policyTxtBox">
                	<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/agree2.jsp" flush="true" />
                </div>
                <div class="checkArea">
                    <label class="checkBox">
                        <input type="checkbox" name="agree">
                        <span>약관에 동의합니다.</span>
                    </label>
                </div>
            </div>
        </article>
        <article class="m-modalGrid">
            <header>
                <h3>개인정보 취급방침</h3>
            </header>
            <div class="contentsArea">
                <div class="policyTxtBox">
                	<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/agree3.jsp" flush="true" />
                </div>
                <div class="checkArea">
                    <label class="checkBox">
                        <input type="checkbox" name="agree">
                        <span>약관에 동의합니다.</span>
                    </label>
                </div>
            </div>
        </article>
        <div class="btnArea">
            <a href="javascript:;" class="mBtn sColorLB registNextBtn">다음</a>
        </div>
    </div>
</div>

<div class="m-tabBox">
    <div class="mArticleArea">
        <article class="m-modalGrid">
            <header>
                <h3>기본 정보</h3>
            </header>
            <div class="contentsArea">
                <ul class="item">
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">회사명</span>
                            <div class="input">
                                <input type="text" id='firmNm' placeholder="회사명">
                            </div>
                        </div>
                    </li>
                    <li class="col-1 btn">
                        <div class="fwBox">
                            <span class="ft">사업자등록번호</span>
                            <div class="input">
                                <input type="text" id='bizNum' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="‘-’ 자 없이 숫자만 입력">
                            </div>
                        </div>
                        <div class="fwBtn">
                            <a href="javascript:;" id="btnBizChk" class="sBtn sColorLB">확인</a>
                        </div>
                    </li>
                </ul>
                <ul class="item">
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">대표자명</span>
                            <div class="input">
                                <input type="text" id='userNm' placeholder="대표자명">
                            </div>
                        </div>
                    </li>
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">설립연도</span>
                            <div class="input">
                                <input type="text" id='setupdate' maxlength='8' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="ex) 20120815">
                            </div>
                        </div>
                    </li>
                </ul>
                <ul class="item">
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">사업자 유형</span>
                            <div class="input">
                                <select id="bizType">
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">업종</span>
                            <div class="input">
                                <select id="sectors">
                                </select>
                            </div>
                        </div>
                    </li>
                </ul>
                <ul class="item">
                    <li class="col-1 btn">
                        <div class="fwBox">
                            <span class="ft">사업장 주소</span>
                            <div class="input">
                                <input type="text" id="zipCode" class="zipCode" placeholder="우편번호" readonly>
                            </div>
                        </div>
                        <div class="fwBtn">
                            <a href="javascript:;" id="addrSearch" class="sBtn sColorLB">찾기</a>
                        </div>
                    </li>
                    <li class="col-1">
                        <div class="fwBox">
                            <div class="input">
                                <input type="text" id="roadFullAddr" class="roadFullAddr" placeholder="상세주소">
                            </div>
                        </div>
                    </li>
                </ul>
                <ul class="item hasTopLine2">
                    <li class="col-1 btn">
                        <div class="fwBox">
                            <span class="ft">아이디</span>
                            <div class="input">
                                <input type="text" id='userId' onkeypress="capsLock(event);" placeholder="아이디">
                            </div>
                        </div>
                        <div class="fwBtn">
                            <a href="javascript:;" id="btnEmailSend" class="sBtn sColorLB">이메일 인증</a>
                        </div>
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
                            <a href="javascript:;" class="sBtn sColorLB" id="btnEmailCertify">인증하기</a>
                        </div>
                    </li>
                </ul>
                <ul class="item">
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">암호</span>
                            <div class="input">
                               <input type="password" id='txtPwd' placeholder="숫자, 영어 특수문자 10자이상">
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
                </ul>
                <ul class="item">
                    <li class="col-1 btn">
                        <div class="fwBox">
                            <span class="ft">대표자 핸드폰</span>
                            <div class="input">
                                <input type="text" id='phoneNum' onKeyup="this.value=this.value.replace(/[^0-9]/g,'');" onKeydown="this.value=this.value.replace(/[^0-9]/g,'');" placeholder="숫자만 입력">
                            </div>
                        </div>
                        <div class="fwBtn">
                            <a href="javascript:;" id="btnSmsSend" class="sBtn sColorLB">SMS 인증</a>
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
                        <div class="fwBtn">
                            <a href="javascript:;" id="btnSmsCertify" class="sBtn sColorLB">인증하기</a>
                        </div>
                    </li>
                </ul>
                <ul class="item">
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">연계코드(선택)</span>
                            <div class="input">
                                <input type="text" id="linkedNum" placeholder="연계 인증번호 입력">
                            </div>
                        </div>
                    </li>
                    <li class="col-1">
                        <div class="fwBox">
                            <span class="ft">협력사(선택)</span>
                            <div class="input">
                                <select id="partnerCode">
                                </select>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="btnArea">
              	<a href="javascript:;" class="mBtn sColorN registPrevBtn">이전</a>
                <a href="javascript:;" id="registBtn" class="mBtn sColorLB">회원가입 확인</a>
            </div>
        </article>
    </div>
</div>

<div class="modal-container pass" id="signUpComplete">
	<div class="modal-wrapper m-w530 bg-fff">
		<header>
			<h2 class="my">회원가입</h2>
		</header>
		<div class="contentGrid">
			<div class="modal-inner">
				<div class="conArticle modal">
					<div class="conArticle-inner m-b30">
						<p class="txt-box color-0e57bf f-s15 f-w-300">큐빅아이 회원가입을 환영합니다!</p>
                        <p class="txt-box color-0e57bf f-s15 f-w-300">큐빅아이 선정산 및 쇼핑몰 통합 서비스를 이용하기 위해서는 회원님이 운영 중인 쇼핑몰을 등록해야 합니다.</p>
                        <p class="txt-box color-0e57bf f-s15 f-w-300">쇼핑몰은 마이페이지 > 쇼핑몰 추가 등록 에서 등록 할 수 있습니다.</p>

                        <div class="btnArea">
                            <a href="/cubici/mypage/companyInfo" id="shopRegistBtn" class="modalClose mBtn sColorLB">쇼핑몰 등록</a>
                        </div>
						<div
							class="m-txt-content2 f-s16 box-border-blue bg-d5e5f5 f-w-300">
							<p>
								<span class="square-txt f-w-500 w130">회원명 </span>: <span id="signUpCompleteName" class="f-w-300"></span>
							</p>
							<p>
								<span class="square-txt f-w-500 w130">큐빅아이 ID </span> :<span id="signUpCompleteId" class="f-w-300"></span>
							</p>
						</div>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
                            쇼핑몰을 등록해 선정산 및 쇼핑몰 통합 서비스를 이용하세요.<br/>
						</p>
                        <p class="txt-box color-0e57bf f-s15 f-w-300">
                            큐빅아이와 함께 더욱 성공적인 사업으로 발전하시길 기원합니다.<br/>
                        </p>
						<p class="txt-box color-0e57bf f-s15 f-w-300">
							감사합니다.<br /> 큐빅아이
						</p>
					</div>
					<div class="button-box">
						<button class="m-big-btn modalClose" onClick="location.href='/'">확인</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
