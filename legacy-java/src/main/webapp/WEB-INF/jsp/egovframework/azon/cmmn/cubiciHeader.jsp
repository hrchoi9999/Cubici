<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<!-- <link rel="stylesheet" href="/resources/css/findIdPwd.css" type="text/css"> -->
<script type="text/javascript" src="/resources/rudicks/smart-editor/js/service/HuskyEZCreator.js" charset="utf-8"></script>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script>
$(document).ready(function(){
	// 주소 검색
	$(document).on('click',"#addrSearch",function(){
		let pop = window.open("/addrSearch","pop","width=570, height=420, scrollbars=yes, resizable=yes");
	});
});

// 주소 검색 응답 -> 회원가입, 마이페이지(회사정보, 사업정보) 공통
function jusoCallBack(roadFullAddr,roadAddrPart1,addrDetail,roadAddrPart2,engAddr, jibunAddr, zipNo, admCd, rnMgtSn, bdMgtSn,detBdNmList,bdNm,bdKdcd,siNm,sggNm,emdNm,liNm,rn,udrtYn,buldMnnm,buldSlno,mtYn,lnbrMnnm,lnbrSlno,emdNo){
	$(".zipCode").val(zipNo);
	$(".roadFullAddr").val(roadFullAddr);
}

//전화번호 유효성 검사
function telValidator(args) {
    if (/^[0-9]{2,3}[0-9]{3,4}[0-9]{4}/.test(args)) {
        return true;
    }
    return false;
}	

</script>

<header id="header">
	<div class="topLine">
		<div class="inner">
			<div class="logo">
				<a href="/"><img src="/resources/rudicks/img/logo-w.svg" alt="Cubici"></a>
			</div>
			<div class="userMenu">
				<c:choose>
					<c:when test="${empty principal}">
						<c:if test="${pageName != '/home/login'}">
							<div class="btns">
			                    <a href="/login" class="sBtn bsColorN hrBtn" >로그인</a>
			                    <a href="/mainSignUp" class="sBtn bsColorN hrBtn signUpBtn">회원가입</a>
			                </div>
		                </c:if>
					</c:when>
					<c:otherwise>
						<div class="userInfo">${principal.username}님, 안녕하세요!</div>
						<div class="btns">
							<a href="/logout" class="sBtn bsColorN hrBtn">로그아웃</a>
							<a href="/cubici/mypage/companyInfo" class="sBtn bsColorN hrBtn">마이페이지</a>
						</div>
					</c:otherwise>
				</c:choose>
			</div>
		</div>
	</div>

	<c:if test="${pageName eq 'main'}"><!-- 메인에만 표시 -->
    <nav class="gnbArea">
            <div class="inner">
                <ul id="gnb">
                    <li class="has">
                        <a href="javascript:;">통합정보</a>
                        <ul>
                            <li><a href="/cubici/integratedInfo/tab1">당월현황</a></li>
                            <li><a href="/cubici/integratedInfo/tab2">매출분석</a></li>
                            <li><a href="/cubici/integratedInfo/tab3">상품분석</a></li>
                        </ul>
                    </li>
                    <li class="has">
                        <a href="javascript:;">매출정보</a>
                        <ul>
                            <li><a href="/cubici/salesInfo/sales">판매현황</a></li>
                            <li><a href="/cubici/salesInfo/return">반품/교환</a></li>
                        </ul>
                    </li>
                    <li class="has">
                        <a href="javascript:;">정산정보</a>
                        <ul>
                            <li><a href="/cubici/calculateInfo/calendar">정산 캘린더</a></li>
                            <li><a href="/cubici/calculateInfo/details">정산 상세</a></li>
                        </ul>
                    </li>
                    <li class="has">
                        <a href="javascript:;">머니뱅크</a>
                        <ul>
							<li><a href="/moneybank/intro/advpay">서비스 소개</a></li>
							<li><a href="/moneybank/request">서비스 신청</a></li>
							<li><a href="/moneybank/current">서비스 현황</a></li>
                        </ul>
                    </li>
                    <li class="has">
                        <a href="javascript:;">고객지원</a>
                        <ul>
							<li><a href="/chargeInfo">요금안내</a></li>
                            <li><a href="/board/notice/index">서비스 공지</a></li>
                            <li><a href="/board/qa/index">Q&A</a></li>
                            <li><a href="/board/faq/index">FAQ</a></li>
                            <li><a href="https://blog.naver.com/cubici2020" target="_blank">블로그</a></li>
                        </ul>
                    </li>
                 <!--    <a href="javascript:;" data-modal="join" class="mBtn sColorLB modalOpen">시작하기</a> -->
                 <c:choose>
					<c:when test="${empty principal}">
                    <li><a href="/mainSignUp">무료체험</a></li>
                    </c:when>
				</c:choose>
                </ul>
            </div>
        </nav>
    </c:if>
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
