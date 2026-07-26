<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script>
$(document).ready(function(){
	// 주소 검색
	$(document).on('click',"#addrSearch",function(){
		let pop = window.open("/m_addrSearch","pop","width=570,height=420, scrollbars=yes, resizable=yes");
	});
});

//주소 검색 응답 -> 회원가입, 마이페이지(회사정보, 사업정보) 공통
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
        <a href="/m/main" class="logo"><img src="/resources/rudicks/img/logo-w.svg" alt="Cubici"></a>
        <a href="javascript:;" class="gnbToggle"></a>
    </div>
</header>

<nav class="gnbArea">
    <div class="gnbWrapper">
        <div class="userMenu">
        	<c:choose>
				<c:when test="${empty principal}">
					<div class="btns">
						<a href="/m/login" class="mBtn sColorLB">로그인</a>
						<a href="/m/register/step1" class="mBtn sColorLB signUpBtn">회원가입</a>
	                	<!-- <a href="javascript:;" class="mBtn sColorLB modalOpen signUpBtn" data-modal="join">회원가입</a> -->
		        	</div>
				</c:when>
				<c:otherwise>
					<div class="userInfo">${principal.username}님, 안녕하세요!</div>
					<div class="btns">
						<a href="/logout" class="mBtn sColorLB">로그아웃</a>
						<a href="/m/cubici/myAuth" class="mBtn sColorLB">마이페이지</a>
					</div>
				</c:otherwise>
			</c:choose>
        </div>
        <ul id="gnb">
            <li class="has">
                <a href="javascript:;">통합정보</a>
                <ul>
                    <li class=""><a href="/m/cubici/integratedInfo/tab1">당월현황</a></li>
				    <li><a href="/m/cubici/integratedInfo/tab2">매출분석</a></li>
				    <li><a href="/m/cubici/integratedInfo/tab3">상품분석</a></li>
                </ul>
            </li>
            <li class="has">
                <a href="javascript:;">매출정보</a>
                <ul>
                     <li><a href="/m/cubici/salesInfo/sales">판매현황</a></li>
					 <li><a href="/m/cubici/salesInfo/return">반품/교환</a></li>
                </ul>
            </li>
            <li class="has">
                <a href="javascript:;">정산정보</a>
                <ul>
                    <li><a href="/m/cubici/calculateInfo/calendar">정산 캘린더</a></li>
				    <li><a href="/m/cubici/calculateInfo/details">정산 상세</a></li>
                </ul>
            </li>
            <li><a href="/m/cubici/invento/index">재고정보</a> </li>
            <!-- <li class="has">
                <a href="javascript:;">머니뱅크</a>
                <ul>
                    <li><a href="/m/moneybank/intro">서비스 소개</a></li>
				    <li><a href="javascript:;">서비스 신청</a></li>
			 	    <li><a href="javascript:;">서비스 현황</a></li>
			 	    <li><a href="/m/cubici/moneybank/together/request">서비스 신청</a></li>
			 	    <li><a href="/m/cubici/moneybank/together/current">서비스 현황</a></li>
                </ul>
            </li> -->
            <li class="has">
                <a href="javascript:;">고객지원</a>
                <ul>
                	<li><a href="/m/chargeInfo">요금 안내</a></li>
                	<li><a href="/m/board/notice/index">서비스 공지</a></li>
					<li><a href="/m/board/qa/index">Q&A</a></li>
					<li><a href="/m/board/faq/index">FAQ</a></li>
					<li><a href="https://blog.naver.com/cubici2020" target="_blank">블로그</a></li>
                </ul>
            </li>
            <li class="has">
                <a href="m/cubici/myAuth">마이페이지</a>
                <ul>
                    <li><a href="/m/cubici/mypage/companyInfo">가입 정보</a></li>
                    <li><a href="/m/cubici/mypage/myCharge">나의 요금</a></li>
                    <li><a href="/m/cubici/mypage/withdraw">가입 해지</a></li>
                </ul>
            </li>
        </ul>
    </div>
</nav>

<script>
$('.gnbToggle').on('click', function(e){
    e.preventDefault();
    $(this).toggleClass('on');
    $('.gnbArea').fadeToggle(100).toggleClass('on');
});

</script>