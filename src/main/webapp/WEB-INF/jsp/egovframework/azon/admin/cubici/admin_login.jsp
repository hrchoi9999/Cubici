<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cubici</title>
	<!-- FAVICON -->
	<link rel="shortcut icon" href="/resources/assets/images/favicon.png">

    <!--폰트-->
    <link rel="stylesheet" href="/resources/rudicks/fonts/noto-sans-kr/notoSansKr.css">
    <link rel="stylesheet" href="/resources/rudicks/fonts/roboto/roboto.css">

    <!--css-->
    <link rel="stylesheet" href="/resources/rudicks/css/common.css">
    <link rel="stylesheet" href="/resources/rudicks/css/module.css">
    <link rel="stylesheet" href="/resources/rudicks/css/style-main.css">
    <link rel="stylesheet" href="/resources/rudicks/css/style-sub.css">

    <!--js-->
    <script src="/resources/rudicks/js/jquery-3.3.1.min.js"></script>
    <script src="/resources/js/views/admin/login.js"></script>

    <!--jquery ui-->
    <link rel="stylesheet" href="/resources/rudicks/css/jquery-ui.css">
    <script src="/resources/rudicks/js/jquery-ui.js"></script>

    <!--라이브러리-->
    <script src="/resources/rudicks/js/Chart.min.js"></script>
    <script src="/resources/rudicks/js/Chart.PieceLabel.js"></script>

    <link rel="stylesheet" href="/resources/rudicks/css/swiper.min.css">
    <script src="/resources/rudicks/js/swiper.min.js"></script>

    <link rel="stylesheet" href="/resources/rudicks/css/jquery.mCustomScrollbar.min.css">
    <script src="/resources/rudicks/js/jquery.mCustomScrollbar.min.js"></script>

    <!--퍼블리싱 js-->
    <script src="/resources/rudicks/js/publishing.js"></script>
    
    <!--[if lte ie 9]> 
    <p style="font-size: 18px; color: #333; background: #fff; padding:5px 0; margin: 0; text-align: center; position: absolute; width: 100%; z-index: 9999">
        사용하고 계신 브라우저는 최신 웹 브라우저가 아닙니다. 업그레이드를 하거나 다른 최신 브라우저 사용을 권장합니다.
        <a href="http://www.microsoft.com/korea/ie" target="_blank" >익스플로러,</a>
        <a href="http://www.mozilla.or.kr/ko/" target="_blank">파이어폭스,</a>
        <a href="http://kr.opera.com/download/" target="_blank">오페라,</a>
        <a href="http://support.apple.com/kb/DL1531?viewlocale=ko_KR&locale=ko_KR" target="_blank">사파리,</a>
        <a href="http://www.google.com/chrome?hl=ko" target="_blank">크롬</a>
    </p>
    <![endif]-->
    
    <!-- common -->
	<script src="/resources/js/common/util.js"></script>
	<script src="/resources/js/common/cubici.core.js"></script>
    
    <!-- encrypt (계정 로그인 시 패스워드 암호화에 사용) -->
	<script src="/resources/js/CryptoJS_v3.1.2/core-min.js"></script>
	<script src="/resources/js/CryptoJS_v3.1.2/sha256-min.js"></script> 
    
</head>
<script>
$(document).ready(function(){
	
	$("#userId, #userPw").keydown(function(event) {
	    if (event.keyCode === 13){
	    	$("#loginBtn").click();
	    }
	});
	
	// 로그인, 아이디 저장
	if(getCookie("00AID") !== null){
		$("#userId").val(getCookie("00AID"));
		$('input[name="idSaveCheck"]').prop('checked', true);
	}
	
	$(document).on('click', "#signUpBtn", function(){
		modalOpen('intro-new-admin');
	});
	
	$(document).on('click', "#requestBtn", function(){
		requestAdmin();
	});
});

//관리자 신청  >>> id 는 임시로 넣어줌 (서비스에서)
function requestAdmin(){

	let callUrl = "/admin/cubici/adminPreference/requestAdmin";
	let callBackFunc = "requestAdminResponse";
	
	let objParam = {
		ADMIN_TYPE : "00",
		ADMIN_DEPARTMENT : $("#ADMIN_DEPARTMENT").val(),
		ADMIN_NAME : $("#ADMIN_NAME").val(),
		ADMIN_PHONE : $("#ADMIN_PHONE").val(),
		ADMIN_EMAIL : $("#ADMIN_EMAIL").val()
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function requestAdminResponse(data){
	if(data.resultCode === 0){
		modalInfo("관리자 신청이 완료 되었습니다.");
		location.reload();
	}
}

</script>
<body>
	<div class="adminIntroContents">
	    <!--큐빅아이 로그인 시작-->
	        <input type="hidden" id="ADMIN_TYPE" value="00">
	        <input type="hidden" id="ADMIN_NAME" value="큐빅아이">
	        <div class="loginWrapper">
	            <div class="logoBox">
	                <img src="/resources/rudicks/admin/img/logo.svg" alt="">
	            </div>
	            <div class="titleBox">
	                <span class="mBtn sColorN wBtn">Command Center</span>
	            </div>
	            <p class="guide">
	                승인되지 않은 불법적인 접근은 <br>
	                이에 따른 민형사상의 피해를  보상하여야 합니다. 
	            </p>
	            <div class="formBox">
	                <div class="fwBox">
	                    <span class="ft">아이디</span>
	                    <div class="input">
	                        <input id="userId" type="text" placeholder="ID 입력">
	                    </div>
	                </div>
	                <div class="fwBox">
	                    <span class="ft">비밀번호</span>
	                    <div class="input">
	                        <input id="userPw" type="password" placeholder="비밀번호 입력">
	                    </div>
	                </div>
	            </div>
	            <div class="optionBox">
	                <div class="oRight">
	                    <label class="checkBox">
	                        <input name="idSaveCheck" type="checkbox">
	                        <span>아이디 저장</span>
	                    </label>
	                </div>
	            </div>
	            <div class="btnBox">
	                <button type="button" id="loginBtn" onclick="loginFunc();" class="mBtn sColorLB wBtn">로그인</button>
	            </div>
	            <div class="addBtnBox">
	                <a href="javascript:;" id="signUpBtn" class="sBtn sColorG wBtn modalOpen" data-modal="intro-new-admin">신규 관리자 신청</a>
	            </div>
	        </div>
	    <!--큐빅아이 로그인 시작 끝-->
	</div>
     
    <footer id="footerLight">
        <div class="footerTxt">
            <span><b>㈜큐빅아이</b></span>
            <span>서울 강남구 봉은사로 435 5층</span>
            <span>admin@cubici.co.kr</span>
            <span>02-6925-6373   </span>
        </div>
    </footer>
    
    
<div class="modal-container" id="intro-new-admin">
    <div class="modal-wrapper">
        <header>
            <h2>관리자 등록 신청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner auto mArticleArea">
                <article>
                    <p class="noticeTxt">
                        관리자 등록 및 변경을 위해서는 아래 정보를 입력해주 십시오. <br>
                        관리자 등록 정보 확인후 . 등록하신 핸드폰으로 등록완료여부를 알려드리도록 하겠습니다.
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                            	<div class="fwBox">
                                    <span class="ft">회사명</span>
                                    <div class="input">
                                        <input id="ADMIN_TYPE" type="text" value="큐빅아이" readOnly>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">부서명</span>
                                    <div class="input">
                                        <input id="ADMIN_DEPARTMENT" type="text" placeholder="부서명 입력">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이름</span>
                                    <div class="input">
                                        <input id="ADMIN_NAME" type="text" placeholder="관리자 이름 입력">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">핸드폰</span>
                                    <div class="input">
                                        <input id="ADMIN_PHONE" type="text" placeholder="핸드폰 번호 입력">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이메일</span>
                                    <div class="input">
                                        <input id="ADMIN_EMAIL" type="text" placeholder="이메일 입력">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" id="requestBtn" class="modalClose mBtn sColorLB">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal-container alert-pass" id="modal-info">
	<div class="modal-wrapper">
		<header><h2>서비스 안내</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="alert-content">
			<div class="alert-txt">
				<div id="CommonModal" class="txtBox" style="text-align: center; padding:0">
				</div>
			</div>
				<div class="btnArea"><a href="javascript:;" class="modalClose sBtn sColorLS2" id="confirm">확인</a>
			</div>
		</div>
	</div>
</div>
    
</body>
</html> 