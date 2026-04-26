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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Cubici</title>
    
    <%-- 도로명 주소 --%>
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
    
    <!-- FAVICON -->
	<link rel="shortcut icon" href="/resources/assets/images/favicon.png">

    <!--폰트-->
    <link rel="stylesheet" href="/resources/rudicks/fonts/noto-sans-kr/notoSansKr.css">
    <link rel="stylesheet" href="/resources/rudicks/fonts/roboto/roboto.css">

    <!--css-->
    <link rel="stylesheet" href="/resources/rudicks/mobile/css/common.css">
    <link rel="stylesheet" href="/resources/rudicks/mobile/css/module.css">
    <link rel="stylesheet" href="/resources/rudicks/mobile/css/style-main.css">
    <link rel="stylesheet" href="/resources/rudicks/mobile/css/style-sub.css">

    <!--js-->
    <script src="/resources/rudicks/mobile/js/jquery-3.3.1.min.js"></script>

    <!--jquery ui-->
    <link rel="stylesheet" href="/resources/rudicks/mobile/css/jquery-ui.css">
    <script src="/resources/rudicks/mobile/js/jquery-ui.js"></script>
    
    <!--스마트에디터-->
    <script type="text/javascript" src="/resources/rudicks/smart-editor/js/service/HuskyEZCreator.js" charset="utf-8"></script>
    
    <!--라이브러리-->
    <script src="/resources/rudicks/js/Chart.min.js"></script>
    <script src="/resources/rudicks/js/Chart.PieceLabel.js"></script>

    <link rel="stylesheet" href="/resources/rudicks/mobile/css/swiper.min.css">
    <script src="/resources/rudicks/mobile/js/swiper.min.js"></script>

    <link rel="stylesheet" href="/resources/rudicks/mobile/css/jquery.mCustomScrollbar.min.css">
    <script src="/resources/rudicks/mobile/js/jquery.mCustomScrollbar.min.js"></script>
    
    <link rel="stylesheet" href="https://uicdn.toast.com/grid/latest/tui-grid.css" />
    <script src="https://uicdn.toast.com/grid/latest/tui-grid.js"></script>

    <!--퍼블리싱 js-->
    <script src="/resources/rudicks/mobile/js/publishing.js"></script>

	<!-- common -->
	<script src="/resources/js/common/util.js"></script>
	<script src="/resources/js/common/cubici.core.js"></script>
	
	<!-- member.js -->
	<script src="/resources/rudicks/mobile/js/member.js"></script>
	
	<!-- encrypt (계정 로그인 시 패스워드 암호화에 사용) -->
	<script src="/resources/js/CryptoJS_v3.1.2/core-min.js"></script>
	<script src="/resources/js/CryptoJS_v3.1.2/sha256-min.js"></script>

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
        <jsp:include page="/WEB-INF/jsp/egovframework/azon/cmmn/mobileHeader.jsp" flush="true" />
        <div class="container">
        <c:choose>
        	<c:when test="${pageName eq 'main'}"> <!-- 메인 -->
        		<jsp:include page="/WEB-INF/jsp/egovframework/azon/mobile/home/m_main.jsp" flush="true" />
        	</c:when>
        	<c:when test="${fn:contains(pageName, 'home')}">
				<jsp:include page="/WEB-INF/jsp/egovframework/azon/mobile/${pageName}.jsp" flush="true" />
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
						<div class="subContents">
							<jsp:include page="/WEB-INF/jsp/egovframework/azon/mobile/${pageName}.jsp" flush="true" />
						</div>
					</div>
				</div>
			</c:otherwise>
        </c:choose>
        </div>
        <jsp:include page="/WEB-INF/jsp/egovframework/azon/cmmn/mobileFooter.jsp" flush="true" />
    </div>
	<div class="modal-container alert-pass" id="modal-info">
		<div class="modal-wrapper">
			<header><h2>서비스 안내</h2>
				<a href="javascript:;" class="modalClose">닫기</a>
			</header>
			<div class="alert-content minfocontent">
				<div class="alert-txt minfotxt">
					<div class="txtBox minfodiv">
						<p id="CommonModal" class="minfotxtbox"></p>
					</div>
				</div>
					<div class="minfoBtnArea"><a href="javascript:;" class="modalClose sBtn sColorLS2" id="confirm">확인</a>
				</div>
			</div>
		</div>
	</div>
	<div class="modal-container alert alert-pass" id="modal-reload">
	<div class="modal-wrapper">
		<header><h2>서비스 안내</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="alert-content minfocontent">
			<div class="alert-txt minfotxt">
				<div class="txtBox minfodiv">
					<p id="CommonModal2" class="minfotxtbox"></p>
				</div>
			</div>
				<div class="minfoBtnArea"><a href="javascript:;" class="modalClose sBtn sColorLS2" id="confirm2">확인</a>
			</div>
		</div>
	</div>
</div>		
</body>
</html>

<script type="text/javascript">

	let pageName = "${pageName}";
	let activeCate = "";
	let activePage = "";
	
	// 네비 active 페이지 저장
	let activeNaviCate;
	let activeNaviPage;
	
	if(pageName.indexOf("infoIntegrated") != -1){
		activeCate = "통합정보";
		activeNaviCate = 0;
		if(pageName.indexOf("tab1") != -1){
			activePage = "당월현황";
			activeNaviPage = 0;
		} else if(pageName.indexOf("tab2") != -1){
			activePage = "매출분석";
			activeNaviPage = 1;
		} else if(pageName.indexOf("tab3") != -1){
			activePage = "상품분석";
			activeNaviPage = 2;
		}
	} else if(pageName.indexOf("infoSales") != -1){
		activeCate = "매출정보";
		activeNaviCate = 1;
		if(pageName.indexOf("sales") != -1){
			activePage = "판매현황";
			activeNaviPage = 0;
		} else if(pageName.indexOf("return") != -1){
			activePage = "반품/교환";
			activeNaviPage = 1;
		}
	} else if(pageName.indexOf("infoCalculate") != -1){
		activeCate = "정산정보";
		activeNaviCate = 2;
		if(pageName.indexOf("calendar") != -1){
			activePage = "정산 캘린더";
			activeNaviPage = 0;
		} else if(pageName.indexOf("details") != -1){
			activePage = "정산 상세";
			activeNaviPage = 1;
		}
	} else if(pageName.indexOf("invento") != -1){
		activeCate = "재고정보";
		activeNaviCate= 3;
		if(pageName.indexOf("inventoIndex") != -1){
			activePage = "";
			activeNaviPage = 0;
		}
	} else if(pageName.indexOf("moneybank") != -1){
		activeCate = "머니뱅크";
		activeNaviCate = 4;
		if(pageName.indexOf("intro") != -1){
			activePage = "서비스 소개";
			activeNaviPage = 0;
		} else if(pageName.indexOf("togetherRequest") != -1){
			activePage = "서비스 신청";
			activeNaviPage = 1;
		} else if(pageName.indexOf("documentNotice") != -1){
			activePage = "서비스 신청";
			activeNaviPage = 2;
		} else if(pageName.indexOf("togetherCurrent") != -1){
			activePage = "서비스 현황";
			activeNaviPage = 3;
		}
	} else if(pageName.indexOf("userSupport") != -1){
		activeCate = "고객지원";
		activeNaviCate = 5;
		if(pageName.indexOf("chargeInfo") != -1 ){
			activePage = "요금 안내";
			activeNaviPage = 0;
		} else if(pageName.indexOf("noticeIndex") != -1 || pageName.indexOf("noticeWrite") != -1 || pageName.indexOf("noticeDetail") != -1){
			activePage = "서비스 공지";
			activeNaviPage = 1;
		} else if(pageName.indexOf("boardIndex") != -1 || pageName.indexOf("boardWrite") != -1 || pageName.indexOf("boardDetail") != -1){
			activePage = "Q&A";
			activeNaviPage = 2;
		} else if(pageName.indexOf("faqIndex") != -1 || pageName.indexOf("faqWrite") != -1 || pageName.indexOf("faqDetail") != -1){
			activePage = "FAQ";
			activeNaviPage = 3;
		}
	} else if(pageName.indexOf("myPage") != -1){
		activeCate = "마이페이지";
		activeNaviCate = 6;
		if(pageName.indexOf("companyInfo") != -1){
			activePage = "가입정보";
			activeNaviPage = 0;
		} else if(pageName.indexOf("myCharge") != -1){
			activePage = "나의요금";
			activeNaviPage = 1;
    	} else if(pageName.indexOf("withdraw") != -1){
			activePage = "가입해지";
			activeNaviPage = 2;
		}
	}
	$('.subVisual h2').text(activeCate);
	$('.subVisual h3').text(activePage);
	
	// 네비게이션 active 유지
	$('#gnb > li').eq(activeNaviCate).addClass('active');
	$('#gnb > li.active > ul > li').eq(activeNaviPage).addClass('active');
	
</script>