<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<script src="/resources/js/views/cubici/member.js"></script>

<script>
var userPhone = "${userInfo.USER_PHONE}";
var smsAuthNum = ""; // 인증번호

$(document).ready(function(){	
	
	//인증 번호 받기
	$("#mobileAuthNoBtn").on("click", function() {
		userPhone = "${userInfo.USER_PHONE}";
		let uri = "/smsAuth";
		let objParam = {FLAG: "mypageSms", USER_PHONE: userPhone};
		smsAuthNum = sendAuthCode(uri, objParam);

		$('#mobileAuthNoBtn').css('display','none');
		$('.authArea').css('display','block');
		$('.authBtnArea').css('visibility','visible');
	});
	
	//인증 번호 확인
	$("#mobileAuthNoCheck").on("click", function() {
		let mobileAuthNo = $('#mobileAuthNo').val(); // 입력받은 인증 값
		if(mobileAuthNo <= 0){
			modalInfo("인증번호를 입력해주세요.");
			return false;
		}
		if(mobileAuthNo === smsAuthNum) {
			window.document.location.href="/m/cubici/myPage/companyInfo";
		}else{
			modalInfo("인증번호가 일치하지 않습니다.");
			return false;
		}
	});
});

</script>

<div class="contentGrid box-border">
	<div class="inner">
		<header>
			<h1 style="text-align: center;">가입정보 접속안내</h1>
			<!-- 
	         <a href="javascript:;" id="authClose" class="modalClose">닫기</a> -->
		</header>
		<div class="modal-content">
			<div class="mInner auto mArticleArea">
				<article class="noticeTxt">
					회원님의 소중한 정보보호을 위해 인증 번호 입력이 필요합니다.<br> “인증번호 받기”를
					클릭하시면 등록하신 핸드폰번호로 인증번호를 보내드립니다.
				</article>
				<article>
					<div class="formMaxWrap2">
						<div class="middleBtnArea">
							<a href="javascript:;" id="mobileAuthNoBtn" class="wBtn mBtn imgBtn tColorN">인증번호 받기</a>
						</div>
					</div>
				</article>
				<article class="m-modalGrid authArea" style="display: none">
					<!-- <p class="noticeTxt">전달받으신 인증번호를 입력해 주십시오.</p> -->
					<div class="formMaxWrap2">
						<ul class="item">
							<li class="btn">
								<div class="fwBox col-2">
									<div class="input">
										<input type="text" id="mobileAuthNo" placeholder="인증번호 입력">
									</div>
								</div>
								<div class="fwBtn col-1">
									<a href="javascript:;" id="mobileAuthNoBtn" class="sBtn sColorLS2">재전송</a>
								</div>
							</li>
						</ul>
					</div>
					<p class="txt"></p>
				</article>
				<div class="btnArea authBtnArea" style="visibility: hidden">
					<a href="javascript:;" id="mobileAuthNoCheck" class="modalClose mBtn sColorLS2">확인</a>
				</div>
			</div>
		</div>
	</div>
</div>