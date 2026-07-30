<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cubici</title>

    <!--폰트-->
    <link rel="stylesheet" href="/resources/rudicks/admin/fonts/noto-sans-kr/notoSansKr.css">
    <link rel="stylesheet" href="/resources/rudicks/admin/fonts/roboto/roboto.css">

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
	if(getCookie("02AID") !== null){
		$("#userId").val(getCookie("02AID"));
		$('input[name="idSaveCheck"]').prop('checked', true);
	}
});

</script>
<body>
	<div class="adminIntroContents">
        <input type="hidden" id="ADMIN_TYPE" value="02">
        <input type="hidden" id="ADMIN_NAME" value="헬로펀딩">
        <div class="loginWrapper">
            <div class="logoBox">
                <img src="/resources/rudicks/admin/img/logo-hellopay.png" alt="">
            </div>
            <div class="titleBox">
                <span class="mBtn sColorPP wBtn">MoneyBank Central</span>
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
                <button type="button" id="loginBtn" onclick="loginFunc();" class="mBtn sColorPB wBtn">로그인</button>
            </div>
            <div class="addBtnBox">
                <a href="javascript:;" class="sBtn sColorG wBtn modalOpen" data-modal="intro-new-admin">신규 관리자 신청</a>
            </div>
        </div>
	</div>
     
    <footer id="footerLight">
        <div class="footerTxt">
            <span><b>㈜큐빅아이</b></span>
            <span>서울 강남구 봉은사로 435 5층</span>
								<span>contact@example.com</span>
            <span>02-6925-6373   </span>
        </div>
    </footer>
    
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
