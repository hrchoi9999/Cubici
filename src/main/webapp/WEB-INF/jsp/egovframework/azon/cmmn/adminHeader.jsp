<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<!DOCTYPE html>
<html>
<head>
<meta charset="EUC-KR">
<title>Insert title here</title>
</head>

<body>
	<header id="header">
    <div class="topLine">
        <div class="inner">
            <div class="logo">
                <a><img src="/resources/rudicks/img/logo-w.svg" alt="Cubici"></a>
            </div>
            <div class="userMenu">
                <div class="userInfo">${principal.username} 님, 안녕하세요!</div>
                <div class="btns">
                    <a href="/logout" class="sBtn bsColorN hrBtn modalOpen">로그아웃</a>
                </div>
            </div>
        </div>
    </div>
	</header>
<!-- 공통모달 info창 2021-05-03 by.YMG -->
<div class="modal-container alert-pass nresetClose" id="modal-info">
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
<div class="modal-container alert alert-pass" id="modal-reload">
	<div class="modal-wrapper">
		<header><h2>서비스 안내</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="alert-content">
			<div class="alert-txt">
				<div id="CommonModal2" class="txtBox" style="text-align: center; padding:0">
				</div>
			</div>
				<div class="btnArea"><a href="javascript:;" class="modalClose sBtn sColorLS2" id="confirm2">확인</a>
			</div>
		</div>
	</div>
</div>		
</body>
</html>