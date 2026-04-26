<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="frm" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!DOCTYPE html>
<html lang="ko">
<head>
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-179513549-1"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());
	
	  gtag('config', 'UA-179513549-1');
	</script>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cubici</title>
    
    <%-- 도로명 주소 --%>
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
    
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

    <!--jquery ui-->
    <link rel="stylesheet" href="/resources/rudicks/css/jquery-ui.css">
    <script src="/resources/rudicks/js/jquery-ui.js"></script>

    <!--라이브러리-->
    <script src="/resources/rudicks/js/Chart.min.js"></script>
    <script src="/resources/rudicks/js/Chart.PieceLabel.js"></script>
    <link rel="stylesheet" href="https://uicdn.toast.com/grid/latest/tui-grid.css" />
    <script src="https://uicdn.toast.com/grid/latest/tui-grid.js"></script>

    <link rel="stylesheet" href="/resources/rudicks/css/swiper.min.css">
    <script src="/resources/rudicks/js/swiper.min.js"></script>
    
    <link rel="stylesheet" href="/resources/rudicks/css/jquery.mCustomScrollbar.min.css">
    <script src="/resources/rudicks/js/jquery.mCustomScrollbar.min.js"></script>

    <!--퍼블리싱 js-->
    <script src="/resources/rudicks/js/publishing.js"></script>
	
	<!-- member.js -->
	<script src="/resources/js/views/cubici/member.js"></script>

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
	
	<script>
		// 모바일에서 웹페이지 접속시 > 모바일로 
		let link = document.location.href;
		let tempt = link.split('/');
		let page = "";
		for(let i=3; i<tempt.length; i++){
			page += "/" + tempt[i];
		}
		
		let uAgent = navigator.userAgent.toLowerCase();
		//아래는 모바일 장치들의 모바일 페이지 접속을위한 스크립트
		let mobilePhones = new Array('iphone', 'ipod', 'ipad', 'android', 'blackberry', 'windows ce','nokia', 'webos', 'opera mini', 'sonyericsson', 'opera mobi', 'iemobile');
		for (var i = 0; i < mobilePhones.length; i++){
			if (uAgent.indexOf(mobilePhones[i]) != -1){
				if(page == "/"){
					location.href="/m/main";
				} else {
					location.href="/m" + page;
				}
			}
		}; 
	</script>
</head>
<body>
	<!-- 로딩바 -->
	<div class="loadingSpinner" style="z-index: 1000000; display: none;">
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	    <i></i>
	</div>
	<!-- 로딩바 끝 -->
    <div id="wrap">
        <jsp:include page="/WEB-INF/jsp/egovframework/azon/cmmn/cubiciHeader.jsp" flush="true" />

        <div class="container">

			<c:choose>
				<c:when test="${pageName eq 'main'}"><!-- 메인 -->
					<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/main.jsp" flush="true" />
				</c:when>
				<c:when test="${fn:contains(pageName, 'home')}"><!-- 로그인, 아이디 찾기, 비밀번호 재설정 -->
					<c:if test="${pageName != '/home/login'}">
						<figuer class="subVisualArea">
					</c:if>
					<div class="inner">
						<div class="subVisual">
							<div class="txtBox">
								<c:choose>
									<c:when test="${pageName eq 'home/login'}">
										<h2>로그인</h2>
									</c:when>
									<c:when test="${pageName eq 'home/idSearch'}">
										<h2>아이디 찾기</h2>
									</c:when>
									<c:when test="${pageName eq 'home/pwdReset'}">
										<h2>비밀번호 재설정</h2>
									</c:when>
									<c:when test="${pageName eq 'home/mainSignUp'}">
										<h2>회원가입</h2>
									</c:when>
								</c:choose>
							</div>
						</div>
					</div>
					</figuer>
					<div class="subContainer">
						<div class="inner">
							<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/${pageName}.jsp" flush="true" />
						</div>
					</div>
				</c:when>
				<c:otherwise>
					<figuer class="subVisualArea">
						<div class="inner">
							<div class="subVisual">
								<div class="txtBox">
									<h2></h2>
									<h3></h3>
								</div>
							</div>
							<span class="infoArea">
								<a href="javascript:;" class="oiBtn infoBtn white">정보</a>
								<div class="infoMemo">
									<div class="iCon">
										큐빅아이는 입력하신 쇼핑몰 아이디와 비밀번호 그리고 각 쇼핑몰에 설정하신 조건에 따라
		                                데이터를 자동 수집하여 정보를 제공하고 있습니다. 따라서, 쇼핑몰 비밀번호 변경 또는 쇼핑몰 조회항목 선택이 제외된 항목은 해당 정보가 제공이 되지 않습니다. <br>
		                                1. 비밀번호 변경의 경우: 마이페이지를 통해 비밀번호를 변경해 주십시오.<br>
		                                2. 쇼핑몰 데이터 설정: 가능한 모든 조회항목을 선택해주십시오.
									</div>
								</div>
							</span>
						</div>
					</figuer>

					<div class="subContainer">
						<div class="inner">
							<aside class="snbArea">
								<ul id="snb">
									<li class=""><a href="javascript:;">통합정보</a>
										<ul>
											<li class=""><a href="/cubici/integratedInfo/tab1">당월현황</a></li>
											<li><a href="/cubici/integratedInfo/tab2">매출분석</a></li>
											<li><a href="/cubici/integratedInfo/tab3">상품분석</a></li>
										</ul></li>
									<li><a href="javascript:;">매출정보</a>
										<ul>
											<li><a href="/cubici/salesInfo/sales">판매현황</a></li>
											<li><a href="/cubici/salesInfo/return">반품/교환</a></li>
										</ul></li>
									<li><a href="javascript:;">정산정보</a>
										<ul>
											<li><a href="/cubici/calculateInfo/calendar">정산 캘린더</a></li>
											<li><a href="/cubici/calculateInfo/details">정산 상세</a></li>
										</ul></li>
									<li><a href="javascript:;">머니뱅크</a>
										<ul>
											<li><a href="/moneybank/intro/advpay">서비스 소개</a></li>
											<li><a href="/moneybank/request">서비스 신청</a></li>
											<li><a href="/moneybank/current">서비스 현황</a></li>
										</ul></li>
									<li><a href="javascript:;">고객지원</a>
										<ul>
											<li><a href="/chargeInfo">요금안내</a></li>
											<li><a href="/board/notice/index">서비스 공지</a></li>
											<li><a href="/board/qa/index">Q&A</a></li>
											<li><a href="/board/faq/index">FAQ</a></li>
											<li><a href="https://blog.naver.com/cubici2020" target="_blank">블로그</a></li>
										</ul>
									</li>
									<li>
		                                <a href="javascript:;">마이페이지</a>
		                                <ul>
		                                    <li><a href="/cubici/mypage/companyInfo">가입 정보</a></li>
		                                    <li><a href="/cubici/mypage/myCharge">나의 요금</a></li>
		                                    <li><a href="/cubici/mypage/withdraw">가입 해지</a></li>
		                                </ul>
		                            </li>
								</ul>
							</aside>
							<div class="subContents">
								<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/${pageName}.jsp" flush="true" />
							</div>
						</div>
					</div>
					<script>						
						$('#snb li').removeClass('active');
						
		                let pageName = "${pageName}";
		                let activeCate = 0;
		                let activePage = 0;
		                
		                if(pageName.indexOf("infoIntegrated") != -1){
		                	activeCate = 0;
		                	if(pageName.indexOf("tab1") != -1){
		                		activePage = 0;
		                	} else if(pageName.indexOf("tab2") != -1){
		                		activePage = 1;
		                	} else if(pageName.indexOf("tab3") != -1){
		                		activePage = 2;
		                	}
		                } else if(pageName.indexOf("infoSales") != -1){
		                	activeCate = 1;
		                	if(pageName.indexOf("sales") != -1){
		                		activePage = 0;
		                	} else if(pageName.indexOf("return") != -1){
		                		activePage = 1;
		                	}
		                } else if(pageName.indexOf("infoCalculate") != -1){
		                	activeCate = 2;
		                	if(pageName.indexOf("calendar") != -1){
		                		activePage = 0;
		                	} else if(pageName.indexOf("details") != -1){
		                		activePage = 1;
		                	}
		                } else if(pageName.indexOf("moneybank") != -1){
		                	activeCate = 3;
		                	if(pageName.indexOf("intro") != -1){
		                		activePage = 0;
		                	} else if(pageName.indexOf("request") != -1){
		                		activePage = 1;
		                	}  else if(pageName.indexOf("evaluate") != -1){
		                		activePage = 1;
		                	}  else if(pageName.indexOf("contract") != -1){
		                		activePage = 1;
		                	} else if(pageName.indexOf("viewCurrent") != -1){
		                		activePage = 2;
		                	}
		                } else if(pageName.indexOf("userSupport") != -1){
		                	activeCate = 4;
		                	if(pageName.indexOf("chargeInfo") != -1){
		                		activePage = 0;
		                	} else if(pageName.indexOf("noticeIndex") != -1 || pageName.indexOf("noticeWrite") != -1 || pageName.indexOf("noticeDetail") != -1){
		                		activePage = 1;
		                	} else if(pageName.indexOf("boardIndex") != -1 || pageName.indexOf("boardWrite") != -1 || pageName.indexOf("boardDetail") != -1){
		                		activePage = 2;
		                	} else if(pageName.indexOf("faqIndex") != -1 || pageName.indexOf("faqWrite") != -1 || pageName.indexOf("faqDetail") != -1){
		                		activePage = 3;
		                	}
		                } else if(pageName.indexOf("myPage") != -1){
		                	activeCate = 5;
		                	if(pageName.indexOf("companyInfo") != -1){
		                		activePage = 0;
		                	} else if(pageName.indexOf("myCharge") != -1){
		                		activePage = 1;
		                	} else if(pageName.indexOf("withdraw") != -1){
		                		activePage = 2;
		                	}
		                }
		                
		                $('#snb > li').eq(activeCate).addClass('active');
	                	$('#snb > li.active > ul > li').eq(activePage).addClass('active');
	                	
	                	let title01 = $('#snb > li.active > a').text();
		                let title02 = $('#snb > li > ul > li.active > a').text();
		                $('.subVisual h2').text(title01);
		                $('.subVisual h3').text(title02);
		            </script>
				</c:otherwise>
			</c:choose>
		</div>

        <jsp:include page="/WEB-INF/jsp/egovframework/azon/cmmn/cubiciFooter.jsp" flush="true" />
    </div>
</body>
</html>
