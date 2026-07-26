<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="frm" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cubici</title>
    <!-- FAVICON -->
	<link rel="shortcut icon" href="/resources/assets/images/favicon.png">
	
	<%-- 도로명 주소 --%>
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
	
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
    
    <!--스마트에디터-->
    <script type="text/javascript" src="/resources/rudicks/smart-editor/js/service/HuskyEZCreator.js" charset="utf-8"></script>
    
    <!--라이브러리-->
    <script src="/resources/rudicks/js/Chart.min.js"></script>
    <script src="/resources/rudicks/js/Chart.PieceLabel.js"></script>

    <link rel="stylesheet" href="/resources/rudicks/css/swiper.min.css">
    <script src="/resources/rudicks/js/swiper.min.js"></script>

    <link rel="stylesheet" href="/resources/rudicks/css/jquery.mCustomScrollbar.min.css">
    <script src="/resources/rudicks/js/jquery.mCustomScrollbar.min.js"></script>

    <!--퍼블리싱 js-->
    <script src="/resources/rudicks/js/publishing.js"></script>

	<!-- common -->
	<script src="/resources/js/common/util.js"></script>
	<script src="/resources/js/common/cubici.core.js"></script>
	
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
<c:choose>
	<c:when test="${principal.admin_type eq '01'}">
		<c:set var="type" value="together"/>
		<c:set var="division" value="fintech"/>
	</c:when>
	<c:when test="${principal.admin_type eq '02'}">
		<c:set var="type" value="hellopay"/>
		<c:set var="division" value="fintech"/>
	</c:when>
	<c:otherwise>
		<c:set var="type" value="cubici"/>
		<c:set var="division" value="cubici"/>
	</c:otherwise>
</c:choose>
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
	<!-- 로딩바 END -->
    <div id="wrap">
        <jsp:include page="/WEB-INF/jsp/egovframework/azon/cmmn/adminHeader.jsp" flush="true" />
        
        <div class="container">
             <!--서브페이지 레이아웃 시작-->
            <figuer class="subVisualArea">
                <div class="inner">
                    <div class="subVisual">
                        <div class="txtBox">
                            <h2></h2>
                            <h3></h3>
                        </div>
                    </div>
                </div>
            </figuer>
            <div class="subContainer" id="subNavigation">
                <div class="inner">
                    <!--관리자용 메뉴 라스트-->
                    <aside class="snbArea">
                        <ul id="snb">
                        	<c:if test="${principal.admin_type eq '00'}">
	                        	<li id="cubiciInfo">
	                                <a href="javascript:;">통합정보</a>
	                                <ul>
	                                    <li class=""><a href="/admin/cubici/infoIntegrated/cubici_tab1">큐빅아이</a></li>
	                                    <li><a href="/admin/cubici/infoIntegrated/moneybank_tab1">머니뱅크</a></li>
	                                </ul>
	                            </li>
	                            <li id="memberInfo">
	                                <a href="javascript:;">회원관리</a>
	                                <ul>
	                                    <li><a href="/admin/cubici/manageMember/member_tab1">회원현황</a></li>
	                                    <li><a href="/admin/cubici/manageMember/payment_tab1">결제관리</a></li>
	                                </ul>
	                            </li>
	                            <li>
	                                <a href="javascript:;">머니뱅크 관리</a>
	                                <ul>
	                                    <li><a href="/admin/moneybank/cubici/management/info_tab1">통합 현황</a></li>
	                                    <li><a href="/admin/moneybank/management/usageList">이용상세</a></li>
	                                </ul>
	                            </li>
	                            <li>
	                                <a href="javascript:;">머니뱅크 운영</a>
	                                <ul>
	                                    <li><a href="/admin/moneybank/request">신청 접수</a></li>
								        <li><a href="/admin/moneybank/approval_tab1">심사 승인</a></li>
										<li><a href="/admin/moneybank/redemption">상환 관리</a></li>
										<li><a href="/admin/moneybank/manage">프리즘 지표 관리</a></li>
	                                </ul>
	                            </li>
	                            <li id="manageInfo">
	                                <a href="javascript:;">고객관리</a>
	                                <ul>
	                                    <li><a href="/admin/cubici/supportMember/manageInquiry">고객문의</a></li>
	                                    <li><a href="/admin/cubici/supportMember/manageSms">문자/이메일</a></li>
	                                    <li><a href="/admin/cubici/supportMember/manageBoard_tab1">고객 공지 관리</a></li>
	                                </ul>
	                            </li>
	                            <li id="monitorInfo">
	                                <a href="javascript:;">모니터링</a>
	                                <ul>
	                                    <li><a href="/admin/cubici/adminMonitor/error_report">Error Log</a></li>
	                                    <li><a href="javascript:;">서버 관리</a></li>
	                                </ul>
	                            </li>
	                            <li id="preferInfo">
	                                <a href="javascript:;">환경설정</a>
	                                <ul>
	                                    <li><a href="/admin/cubici/adminPreference/adminRegister_tab1">관리자 등록</a></li>
	                                    <li><a href="/admin/cubici/adminPreference/manageCharge">요금제 관리</a></li>
	                                    <li><a href="/admin/cubici/adminPreference/managePromotion">연계코드 관리</a></li>
	                                    <li><a href="/admin/cubici/adminPreference/managePartner">협력사 관리</a></li>
	                                    <li><a href="/admin/cubici/adminPreference/manageMoneybank_tab1">머니뱅크 관리</a></li>
	                                    <li><a href="/admin/cubici/adminPreference/prizmConfig">Prism System</a></li>
	                                </ul>
	                            </li>
                            </c:if>
                        </ul>
                    </aside>
                    <div class="subContents">
                        <jsp:include page="/WEB-INF/jsp/egovframework/azon/${pageName}.jsp" flush="true" />
                    </div>
                </div>
            </div>
        <script>
			// 네비에서 현재 페이지 활성화
	        $('#snb li').removeClass('active');
	
	        let pageName = "${pageName}";
	        let activeCate = 0;
	        let activePage = 0;
			
	        if(pageName.indexOf("infoIntegrated") != -1){
	        	activeCate = 0;
	        	if(pageName.indexOf("cubici_tab1") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("cubici_tab2") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("cubici_tab3") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("cubici_tab4") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("moneybank_tab1") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("moneybank_tab2") != -1){
	        		activePage = 1;
	        	}
	        } else if(pageName.indexOf("manageMember") != -1){
	        	activeCate = 1;
	        	if(pageName.indexOf("member_tab1") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("member_tab2") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("member_tab3") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("member_tab4") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("payment_tab1") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("payment_tab2") != -1){
	        		activePage = 1;
	        	}
	        } else if(pageName.indexOf("management") != -1){
	        	if("${principal.admin_type}" != "00"){
		        	activeCate = 0;
		        }else{
	        		activeCate = 2;
		        }
	        	
	        	if(pageName.indexOf("info_tab1") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("info_tab2") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("usageList") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("usageDetail") != -1){
	        		activePage = 1;
	        	}
	        	
	        } else if(pageName.indexOf("moneybank") != -1){
	        	if("${principal.admin_type}" != "00"){
		        	activeCate = 1;
		        }else{
	        		activeCate = 3;
		        }
	        	

	        	if(pageName.indexOf("requestState") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("approval_tab1") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("approvalDetail") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("approval_tab2") != -1){
					activePage = 1;
				}  else if(pageName.indexOf("pcsDetail") != -1){
					activePage = 1;
				} else if(pageName.indexOf("redemState") != -1){
	        		activePage = 2;
	        	} else if(pageName.indexOf("redemDetail") != -1){
	        		activePage = 2;
	        	} else if(pageName.indexOf("manage") != -1){
					activePage = 3;
				}
	        } else if(pageName.indexOf("supportMember") != -1){
	        	activeCate = 4;
	        	if(pageName.indexOf("manageInquiry") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("manageSms") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("manageEmail") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("manageBoard_tab1") != -1){
	        		activePage = 2;
	        	} else if(pageName.indexOf("manageBoard_tab2") != -1){
	        		activePage = 2;
	        	}
	        	
	        } else if(pageName.indexOf("adminMonitor") != -1){
	        	activeCate = 5;
	        	if(pageName.indexOf("error_report") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("server_monitor") != -1){
	        		activePage = 1;
	        	}	
	        	
	        } else if(pageName.indexOf("adminPreference") != -1){
	        	activeCate = 6;
	        	if(pageName.indexOf("adminRegister_tab1") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("adminRegister_tab2") != -1){
	        		activePage = 0;
	        	} else if(pageName.indexOf("manageCharge") != -1){
	        		activePage = 1;
	        	} else if(pageName.indexOf("managePromotion") != -1){
	        		activePage = 2;
	        	} else if(pageName.indexOf("managePartner") != -1){
	        		activePage = 3;
	        	} else if(pageName.indexOf("manageMoneybank_tab1") != -1){
	        		activePage = 4;
	        	} else if(pageName.indexOf("manageMoneybank_tab2") != -1){
	        		activePage = 4;
	        	} else if(pageName.indexOf("prizmConfig") != -1){
	        		activePage = 5;
	        	}else if(pageName.indexOf("craConfig") != -1){
	        		activePage = 5;
	        	}else if(pageName.indexOf("prizmRawData") != -1){
	        		activePage = 5;
	        	}
	        }
	        
	        $('#snb > li').eq(activeCate).addClass('active');
	        $('#snb > li.active > ul > li').eq(activePage).addClass('active');
			
	        let title01 = $('#snb > li.active > a').text();
	        let title02 = $('#snb > li > ul > li.active > a').text();
	        $('.subVisual h2').text(title01);
	        $('.subVisual h3').text(title02);
	        
	</script>
	</div>
         <jsp:include page="/WEB-INF/jsp/egovframework/azon/cmmn/cubiciFooter.jsp" flush="true" />
    </div>
</body>
</html> 