<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script>
$(document).ready(function(){
	let type = 'main';
	let mType = '${param.Type}';
	 
	if(mType != "" || mType != null || mType != undefined){
		modalOpenType(type, mType);
	}
	
	$('.myCharge').on('click', function(){
		$(location).attr('href', '/cubici/mypage/myCharge');
	});
	
	CookieModal(modalType, modalCookie, modalCheckId);
});
</script>
<div class="mainContents">
    <figure class="mainSlideArea">
        <div id="mainSlide" class="swiper-container slideAni">
            <div class="swiper-wrapper">
                <div class="swiper-slide">
                    <div class="visualBox visual01">
                        <span class="bg"></span>
                        <div class="vCon inner">
                            <div class="txtBox">
                                <p class="sObj t-medium t1">큐빅아이</p>
                                <p class="sObj t-light t2">
                                    인공지능 기반의 온라인 쇼핑몰 통합관리 서비스 <br>
                                    복잡하고 어려웠던 쇼핑몰 관리를 쉽고 편리하게 <br>
                                    바로 확인할 수 있는 차세대 서비스를 경험하세요.
                                </p>
                                <p class="sObj t-light t2">
                                    새로운 e-Commerce 큐빅아이가 시작합니다!
                                </p>
                                <c:choose>
									<c:when test="${empty principal}">
		                                <div class="sObj btnArea">
		                                    <a href="/mainSignUp" class="mBtn sColorS modalOpen">1개월 무료이용</a>
		                                </div>
	                                </c:when>
                                </c:choose>
                            </div>
                            <div class="sObj imgBox">
                                <div class="pcMockup">
                                    <div class="pcFrame">
                                        <div id="mainPcSlide" class="swiper-container">
                                            <ul class="swiper-wrapper">
                                                <li class="swiper-slide"> <img src="/resources/rudicks/img/main/main-pc-slide01-1.jpg" alt="도표"></li>
                                                <li class="swiper-slide"> <img src="/resources/rudicks/img/main/main-pc-slide02-1.jpg" alt="도표"></li>
                                                <li class="swiper-slide"> <img src="/resources/rudicks/img/main/main-pc-slide03-1.jpg" alt="도표"></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="visualBox visual02">
                        <span class="bg"></span>
                        <div class="vCon inner">
                            <div class="txtBox">
                                <p class="sObj t-medium t1">상상이상의 혁신적 기능!</p>
                                <p class="sObj t-light t2">
                                    쇼핑몰 현황을 한눈에<br>
                                    판매부터 재고까지 한번에
                                    <br><br>
                                    직관적 결정으로 쇼핑몰<br>
                                    성공에 기여합니다.
                                </p>
                                <c:choose>
									<c:when test="${empty principal}">
		                                <div class="sObj btnArea">
		                                    <a href="/mainSignUp" class="mBtn sColorS modalOpen">1개월 무료이용</a>
		                                </div>
	                                </c:when>
                                </c:choose>
                            </div>
                            <div class="imgBox">
                                <ul class="bubble-motion">
                                    <li class="bgColorLB c5 item-01">재고<br>정보</li>
                                    <li class="bgColorLB c4 item-02">매출<br>관리</li>
                                    <li class="bgColorLB c5 item-03">정산<br>캘린더</li>
                                    <li class="bgColorSB c4 item-04">머니<br>뱅크</li>
                                    <li class="bgColorSB c4 item-05">통합<br>분석</li>
                                    <li class="bgColorSB c6 item-06"><b>큐빅아이<br>주요기능</b></li>
                                    <li class="bgColorLB c3 item-07"></li>
                                    <li class="bgColorLB c2 item-08"></li>
                                    <li class="bgColorSB c1 item-09"></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="visualBox visual03">
                        <span class="bg"></span>
                        <div class="vCon inner">
                            <div class="txtBox">
                                <p class="sObj t-reguler t1">귀찮은 상품정보 입력없이</p>
                                <p class="sObj t-medium t1">판매재고를 관리한다!</p>
                                <p class="sObj t-light t2">
                                    회원가입 만으로 <br>
                                    상품정보를 자동으로 취합하고<br>
                                    재고정보도 바로 업데이트
                                    <br><br>
                                    상품재고관리 <br>
                                    이보다 더 편할 수 없다! 
                                </p>
                                <c:choose>
									<c:when test="${empty principal}">
		                                <div class="sObj btnArea">
		                                    <a href="/mainSignUp" class="mBtn sColorS modalOpen">1개월 무료이용</a>
		                                </div>
	                                </c:when>
                                </c:choose>
                            </div>
                        </div>
                    </div>
                </div>
                <!--22.03.28-->
                <div class="swiper-slide">
                    <div class="visualBox visual04">
                        <span class="bg"></span>
                        <div class="vCon inner">
                            <div class="txtBox">
                                <p class="sObj t-middle t1">
                                    운영자금만 있으면
                                    바로 매출을 높일 수 있는데
                                </p>                             
                                <p class="sObj t-light t2">
                                    혁신적인 방식의 온라인 금융 서비스 머니뱅크가 <br/>
                                    그 해결방법을 제공합니다.
                                </p>
                                <p class="sObj t-light t2">
                                    비대면 방식의 머니뱅크는 신청만으로 <br/>
                                    바로 이용가능한 금액을 산출하고 가장 합리적인 조건으로 <br/>
                                    사업운영자금을 지원합니다. <br/>
                                </p>
                                <p class="sObj t-middle t1">
                                    머니뱅크<br/>
                                </p>
                         		<br/>
                                <c:choose>
									<c:when test="${empty principal}">
		                                <div class="sObj btnArea">
		                                    <a href="/mainSignUp" class="mBtn sColorS modalOpen">1개월 무료이용</a>
		                                </div>
	                                </c:when>
                                </c:choose>
                            </div>
                            <div class="sObj imgBox">                               
                                <div id="main-slide04-up"> 
                                    <div class="s04-img i-01"> <img src="/resources/img/main/main-slide04-img04.png" alt=""></div>                                    
                                    <div class="s04-img i-02"> <img src="/resources/img/main/main-slide04-img01.png" alt=""></div>
                                    <div class="s04-img i-03"> <img src="/resources/img/main/main-slide04-img02.png" alt=""></div>
                                    <div class="s04-img i-04"> <img src="/resources/img/main/main-slide04-img03.png" alt=""></div>                                   
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--22.03.28-->
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
              <!--22.03.28-->
            <div class="swiper-pagination"></div>
        </div>
    </figure>
    
    <section class="actionVisual">
        <nav class="tabList">
            <div class="inner">
                <ul>
                    <li class="info on"><a href="#act01">통합정보</a></li>
                    <li class="sales"><a href="#act02">매출정보</a></li>
                    <li class="settle"><a href="#act03">정산관리</a></li>
                    <li class="stock"><a href="#act04">재고정보</a></li>                    
                    <li class="bank"><a href="#act05">머니뱅크</a></li>
                </ul>
            </div>
        </nav>

        <!--통합정보-->
        <article class="actArea act01" id="act01">
            <div class="animateBox">
                <img src="/resources/rudicks/img/main/panel2/av01-p01-2.png" alt="패널01" class="sObj base">
                <img src="/resources/rudicks/img/main/panel2/av01-p02.png" alt="패널02" class="sObj horizontal sRight item i01">
                <img src="/resources/rudicks/img/main/panel2/av01-p03.png" alt="패널03" class="sObj horizontal sLeft item i02">
                <img src="/resources/rudicks/img/main/panel2/av01-p04.png" alt="패널04" class="sObj horizontal sLeft item i03">
                <img src="/resources/rudicks/img/main/panel2/av01-p05.png" alt="패널05" class="sObj item i04">
            </div>
            <div class="inner inner-w">
                <div class="titleTxt">
                    <h2 class="sObj">
                        <b>경영상황을 한 눈에</b><br>
                        <b>직관적</b>으로 제시합니다!
                    </h2>
                </div>
                <div class="flagArea">
                    <div class="sObj flag f01 fLeft">
                        <p class="ft1">당월 주요지표</p>
                        <ul>
                            <li>쇼핑몰 주요지표를 바로 확인할 수 있습니다.</li>
                            <li>지난 판매추이 분석을 통해 판매흐름을 예측할 수 있습니다.</li>
                        </ul>
                    </div>
                    <div class="sObj flag f02 fRight">
                        <p class="ft1">상품 분석</p>
                        <ul>
                            <li>쇼핑몰별 가격할인 또는 판촉 수준은?</li>
                            <li>판매제품 중 TOP 10 상품은 어느 제품인가?</li>
                        </ul>
                    </div>
                    <div class="sObj flag f03 fRight">
                        <p class="ft1">매출 분석</p>
                        <ul>
                            <li>기간별 쇼핑몰별 매출정보를 쉽게 알 수 있습니다.</li>
                            <li>반품과 교환 현황을 바로 확인할 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
		        <div class="btnArea sObj">
                <c:choose>
					<c:when test="${empty principal}">
		                   <a href="/mainSignUp" class="mBtn sColorS">시작하기</a>
                   	</c:when>
					<c:otherwise>
		                   <a href="/cubici/integratedInfo/tab1" class="mBtn sColorN">시작하기</a>
					</c:otherwise>
				</c:choose>
                   <!--  <a href="javascript:;" data-modal="join" class="mBtn sColorLB modalOpen">시작하기</a> -->
                </div>
            </div>
        </article>

        <!--매출정보-->
        <article class="actArea act02" id="act02">
            <div class="animateBox">
                <div class="item ipad">
                    <img src="/resources/rudicks/img/main/av02-ipad2.png" class="sObj" alt="아이패드">
                </div>
                <div class="item hand"><img src="/resources/rudicks/img/main/av02-hand.png" class="sObj horizontal" alt="손"></div>
            </div>
            <div class="inner inner-w">
                <div class="titleTxt sObj">
                    <h2 class="">
                        <b>매출관련</b> 모든 정보를 <br>
                        <b>한 곳에서 편리하게</b>
                    </h2>
                </div>
                <div class="flagArea">
                    <div class="sObj flag f01 fLeft">
                        <p class="ft1">편리한 검색 기능</p>
                        <ul>
                            <li>판매상태, 쇼핑몰, 판매기간 그리고 쇼핑몰 기준에 따라 판매정보가 바로바로 검색 가능합니다.</li>
                        </ul>
                    </div>
                    <div class="sObj flag f02 fRight">
                        <p class="ft1">상품 분석</p>
                        <ul>
                            <li>쇼핑몰별 가격할인 또는 판촉 수준은?</li>
                            <li>판매제품 중 TOP 10 상품은 어느 제품인가?</li>
                        </ul>
                    </div>
                    <div class="sObj flag f03 fRight">
                        <p class="ft1">편리한 엑셀 다운로드</p>
                        <ul>
                            <li>내가 원하는 정보를  검색하고 그 결과를 바로 다운로드 하실 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
		        <div class="btnArea sObj">
                <c:choose>
					<c:when test="${empty principal}">
		            	<a href="/mainSignUp" class="mBtn sColorS">시작하기</a>
                   	</c:when>
					<c:otherwise>
		                <a href="/cubici/salesInfo/sales" class="mBtn sColorN">시작하기</a>
					</c:otherwise>
				</c:choose>
				</div>
            </div>
        </article>

        <!--정산관리-->
        <article class="actArea act03" id="act03">
            <div class="animateBox">
                <div class="calArea">
                    <img src="/resources/rudicks/img/main/av03-calendar01-2.png" class="sObj cal cal01" alt="캘린더01">
                    <div class="item cal02 sObj">
                        <img src="/resources/rudicks/img/main/av03-calendar02-2.png" class="cal" alt="캘린더02">
                    </div>
                    <img src="/resources/rudicks/img/main/av03-calendar03-2.png" class="sObj item cal cal03" alt="캘린더03">
                    <img src="/resources/rudicks/img/main/av03-calendar04-2.png" class="sObj item cal cal04" alt="캘린더04">
                </div>
                <img src="/resources/rudicks/img/main/av03-hand.png" class="sObj item hand" alt="손">
            </div>
            <div class="inner inner-w">
                <div class="titleTxt sObj">
                    <h2 class="">
                        <b>쇼핑몰 정산금액</b>을 <br>
                        <b>캘린더</b>를 통해 <b>편리하게</b>
                    </h2>
                </div>
                <div class="flagArea">
                    <div class="sObj flag f01 fLeft">
                        <p class="ft1">캘린더를 통해 정산금액을 관리</p>
                        <ul>
                            <li>어제, 오늘, 내일 상관없이 원하는 날짜의 정산입금액, 예정액을 쉽고 편리하게 확인할 수 있습니다.</li>
                        </ul>
                    </div>
                    <div class="sObj flag f02 fLeft">
                        <p class="ft1">구체 정산내역은 액셀로 한번에</p>
                        <ul>
                            <li>캘린더든 정산 상세 내역이든 필요하다면 엑셀로 바로바로 다운로드 가능합니다.</li>
                        </ul>
                    </div>
                    <div class="sObj flag f03 fRight">
                        <p class="ft1">정산 상세항목은 검색으로 단박에</p>
                        <ul>
                            <li>상세한 정산내역은 검색기능으로 구체내역을
                                파악할 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
				<div class="btnArea sObj">
                <c:choose>
					<c:when test="${empty principal}">
		            	<a href="/mainSignUp" class="mBtn sColorS">시작하기</a>
                   	</c:when>
					<c:otherwise>
		            	<a href="/cubici/calculateInfo/calendar" class="mBtn sColorN">시작하기</a>
					</c:otherwise>
				</c:choose>
            	</div>
            </div>
        </article>

        <!--재고정보-->
        <article class="actArea act04" id="act04">
            <div class="animateBox">
                <img src="/resources/rudicks/img/main/av04-phone-2.png" alt="핸드폰" class="sObj item phone">
                <div class="sObj item bubble bubble01">
                    <img src="/resources/rudicks/img/main/av04-bubble01-2.png" alt="버블">
                </div>
                <div class="sObj item bubble bubble02">
                    <img src="/resources/rudicks/img/main/av04-bubble02.png" alt="버블">
                </div>
            </div>
            <div class="inner inner-w">
                <div class="titleTxt sObj">
                    <h2 class="">
                        상품정보 입력 없이도<br>
                        <b>재고정보를 확인하다!</b>
                    </h2>
                </div>
                <div class="flagArea">
                    <div class="sObj flag f01 fRight">
                        <p class="ft1">상품정보 입력은 더 이상 필요없다</p>
                        <ul>
                            <li>
                                판매하고 있는 상품의 쇼핑몰 정보를<br>
                                입력없이 바로바로 확인할 수 있습니다.
                            </li>
                        </ul>
                    </div>
                    <div class="sObj flag f02 fRight">
                        <p class="ft1">쉽고 편리하게 같은 상품을 묶어서 관리</p>
                        <ul>
                            <li>같은 상품은 클릭 한번으로 묶어서 관리할 수 있습니다.</li>
                            <li>내부관리 코드가 있으면 자동 묶음 처리로 바로바로!</li>
                        </ul>
                    </div>
                    <div class="sObj flag f03 fRight">
                        <p class="ft1">재고정보뿐만 아니라 상세상품정보까지</p>
                        <ul>
                            <li>
                                쇼핑몰에 등록된 상품의 상세 등록정보까지<br>
                                한곳에서 확인 가능합니다. 
                            </li>
                        </ul>
                    </div>
                </div>
		        <div class="btnArea sObj">
                <c:choose>
					<c:when test="${empty principal}">
		            	<a href="/mainSignUp" class="mBtn sColorS">시작하기</a>
                   	</c:when>
					<c:otherwise>
	                	<a href="/cubici/invento/index" class="mBtn sColorN">시작하기</a>
					</c:otherwise>
				</c:choose>
            	</div>
            </div>
        </article>
        
        <!-- 머니뱅크 -->
        <article class="actArea act05" id="act05">
            <div class="animateBox">
                <span class="sObj item partner showEnd" style="opacity: 1; transform: translateY(0px); transition: all 0.6s ease 0s;">투게더펀딩</span>    
                <div class="sObj item macbook showEnd" style="opacity: 1; transform: translateY(0px); transition: all 0.6s ease 0s;">
                    <img src="/resources/rudicks/img/main/av05-display.jpg" class="display" alt="화면">
                    <img src="/resources/rudicks/img/main/av05-macbook.png" class="netbook" alt="노트북">
                </div>
            </div>
            <div class="inner inner-w">
                <div class="titleTxt sObj showEnd" style="opacity: 1; transform: translateY(0px); transition: all 0.6s ease 0s;">
                    <h2 class="">
                        온라인 셀러의 새로운<br>
                        <b>사업자금 확보 방식 !</b>
                    </h2>
                </div>
                <div class="flagArea">
                    <div class="sObj flag f01 fLeft showEnd" style="opacity: 1; transform: translateY(0px); transition: all 0.6s ease 0s;">
                        <p class="ft1">온라인 소상공인을 위한 단비펀드</p>
                        <ul>
                            <li>
                                온라인을 통한 100% 비대면 방식의 선정산 서비스로
                                복잡한 서류없이 인공지능 사업평가 시스템, 프리즘을  통해
                                쉽고 빠르게 서비스를 이용하실 수 있습니다.
                                5백만원의 사업자금을 30일 동안 자유롭게 사용하실 수 있습니다.
                                본 서비스는 국내 P2P펀딩의 대표, 투게더 펀딩과 함께합니다.
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="btnArea sObj showEnd" style="opacity: 1; transform: translateY(0px); transition: all 0.6s ease 0s;">
                    <a href="/moneybank/intro/advpay" class="mBtn sColorN modalOpen" data-modal="join">시작하기</a>
                </div>
            </div>
        </article>
        
    </section>

    <section class="youtubeArea scrollAni">
        <div class="inner">
            <h2 class="sObj sTitle white"><b>큐빅아이</b>의 혁신적인 기능</h2>
            <div class="sObj videoBox">
                <iframe width="1150" height="630" src="https://www.youtube.com/embed/NkmT63h1sZA?controls=0&rel=0&modestbranding=1&disablekb=1" title="YouTube video player" style="border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    </section>

   

    <section class="partnerArea scrollAni" data-delay="20">
        <div class="inner">
            <h2 class="sObj sTitle"><b>주요 쇼핑몰과의 연동을</b><br>지속적으로 확대하고 있습니다.</h2>
            <div class="logoList">
                <ul>
                    <li class="sObj gmarket on"><span>지마켓</span></li>
                    <li class="sObj auction on"><span>옥션</span></li>
                    <li class="sObj m11st on"><span>11번가</span></li>
                    <li class="sObj coupang on"><span>쿠팡</span></li>
                    <li class="sObj interpark on"><span>인터파크</span></li>
                    <li class="sObj smartStore on"><span>스마트스토어</span></li>
                    <li class="sObj ssg"><span>ssg</span></li>
                    <li class="sObj tmon"><span>티몬</span></li>
                    <li class="sObj dnw"><span>다나와</span></li>
                    <li class="sObj wmp"><span>위메프</span></li>
                    <li class="sObj cj"><span>cj mall</span></li>
                    <li class="sObj lotteOn"><span>lotte</span></li>
                    <li class="sObj ak"><span>ak mall</span></li>
                    <li class="sObj theHyundai"><span>the hyundai</span></li>
                    <li class="sObj eland"><span>eland mall</span></li>
                    <li class="sObj himart"><span>하이마트</span></li>
                    <li class="sObj emart"><span>이마트</span></li>
                    <li class="sObj gs"><span>gs shop</span></li>
                    <li class="sObj ns"><span>ns 홈쇼핑</span></li>
                    <li class="sObj hs"><span>홈&amp;쇼핑</span></li>
                </ul>
            </div>
        </div>
    </section>

    <script src="/resources/rudicks/js/publishing-main.js"></script>
</div>

<div class="modal-container" id="inform_members">
    <div class="modal-wrapper" style="width: 500px">
        <header>
            <h2>서비스 안내</h2>
        </header>
        <div class="modal-content">
            <div class="mInner auto mArticleArea">
                <div class="noticeTxt" style="text-align: left">
                    안녕하세요,
                    <br><br>
                    현재 큐빅아이는 보다 나은 서비스 제공을 위해서 전체 서비스 업그레이드 및 새로운
                    기능을 추가하고 있습니다. 이로 인하여 서비스 이용에 다소 
                    <br>
                    불편함이 있을 수 있습니다. 잠시만 기다려주시면 신속하게 업그레이드를 
                    <br>
                    완료해서 더 편리하고 풍부한 기능을 제공할 수 있도록 하겠습니다.
                    <br>
                </div>
                <br>    
                <div class="noticeTxt">    
                    회원 여러분의 성공을 기원합니다
                    <br>
                    큐빅아이
                </div>
	            <div class="btnArea">
	                <a href="javascript:;" class="modalClose mBtn sColorLS2">확인</a>
	            </div>
            </div>
            
        </div>
    </div>
</div>

<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/userModal.jsp" flush="true" />