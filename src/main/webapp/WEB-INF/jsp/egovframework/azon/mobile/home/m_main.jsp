<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script src="/resources/js/views/cubici/signUp.js"></script>
<script src="/resources/js/views/cubici/member.js"></script>

<div class="mainContents">

    <figure class="mainSlideArea">
        <div id="mainSlide" class="swiper-container slideAni">
            <div class="swiper-wrapper">
                <div class="swiper-slide">
                    <div class="visualBox visual01">
                        <div class="vCon">
                            <div class="sObj imgBox">
                                <img src="/resources/rudicks/mobile/img/main/visual-mac-mockup.png" alt="pc화면">
                            </div>
                           <div class="txtBox">
                                <p class="sObj t-medium t1">큐빅아이</p>
                                <p class="sObj t-light t2">
									인공지능 기반의 온라인 쇼핑몰 통합관리 서비스 <br>
									복잡하고 어려웠던 쇼핑몰 관리를 쉽고 편리하게 <br>
									바로 확인할 수 있는 차세대 서비스를 경험하세요.
                                </p>
                                <p class="sObj t-light t2">
                                    <b>새로운 e-Commerce 큐빅아이가 시작합니다!</b>
                                </p>
                                <div class="sObj btnArea">
                                    <a href="/m/register/step1" class="bBtn sColorS" >서비스 무료체험</a>
                                </div>
                            </div>
                           
                        </div>
                    </div>
                </div>
            </div>
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
                    <!-- <li class="bank"><a href="#act05">머니뱅크</a></li> -->
                </ul>
            </div>
        </nav>

        <!--통합정보-->
        <article class="actArea act01 on" id="act01">
            <div class="inner">
                <div class="titleTxt hasBar">
                    <h2 class="sObj">
                        <b>경영상황을 한 눈에</b>
                        <b>직관적</b>으로 제시합니다!
                    </h2>
                </div>
                <div class="figuerArea">
                    <div class="animateBox">
                        <img src="/resources/rudicks/mobile/img/main/panel/av01-p05.png" alt="패널05" class="sObj item i05">
                        <img src="/resources/rudicks/mobile/img/main/panel/av01-p04.png" alt="패널04" class="sObj item i04">
                        <img src="/resources/rudicks/mobile/img/main/panel/av01-p03.png" alt="패널03" class="sObj horizontal sLeft item i03">
                        <img src="/resources/rudicks/mobile/img/main/panel/av01-p02.png" alt="패널02" class="sObj horizontal sRight item i02">
                        <img src="/resources/rudicks/mobile/img/main/panel/av01-p01.png" alt="패널01" class="sObj horizontal sRight i01">
                    </div>
                    <div class="flagArea">
                        <div class="sObj flag f01 top left">
                            <p class="ft1">당월 주요지표</p>
                            <ul>
                                <li>쇼핑몰 주요지표를 바로 확인할 수 있습니다.</li>
                                <li>지난 판매추이 분석을 통해<br> 판매흐름을 예측할 수 있습니다.</li>
                            </ul>
                        </div>
                        <div class="sObj flag f02 bottom">
                            <p class="ft1">판매분석</p>
                            <ul>
                                <li>상세 판매정보를 바로 바로.</li>
                                <li>반품 및 교환 정보도 쉽고 편하게.</li>
                            </ul>
                        </div>
                        <div class="sObj flag f03 top">
                            <p class="ft1">매출 분석</p>
                            <ul>
                                <li>기간별 쇼핑몰별 매출정보를 쉽게 알 수 있습니다.</li>
                                <li>반품과 교환 현황을 바로 확인할 수 있습니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>
               
                <div class="btnArea sObj">
                    <a href="/m/register/step1" class="mBtn sColorLB ">시작하기</a>
                </div>
            </div>
        </article>

        <!--매출정보-->
        <article class="actArea act02" id="act02">
            <div class="titleTxt hasBar">
                <h2 class="sObj">
                    <b>매출관련</b> 모든 정보를
                    <b>한 곳에서 편리하게</b>
                </h2>
            </div>
            <div class="figuerArea">
                <div class="animateBox">
                    <img src="/resources/rudicks/mobile/img/main/pad/av02-p03.png" alt="패널03" class="sObj horizontal sLeft item i03">
                    <img src="/resources/rudicks/mobile/img/main/pad/av02-p02.png" alt="패널02" class="sObj horizontal sRight item i02">
                    <img src="/resources/rudicks/mobile/img/main/pad/av02-p01.png" alt="패널01" class="sObj i01">
                </div>
                <div class="inner">
                    <div class="flagArea">
                        <div class="sObj flag f01 top">
                            <p class="ft1">편리한 검색 기능</p>
                            <ul>
                                <li>판매상태, 쇼핑몰, 판매기간 그리고 쇼핑몰 기준에 따라 판매정보가 바로바로 검색 가능합니다.</li>
                            </ul>
                        </div>
                        <div class="sObj flag f02 top">
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
                </div>
            </div>
            <div class="inner">
                <div class="btnArea sObj">
                    <a href="/m/register/step1" class="mBtn sColorLB ">시작하기</a>
                </div>
            </div>
        </article>


        <!--정산관리-->
        <article class="actArea act03" id="act03">
            <div class="titleTxt hasBar">
                <h2 class="sObj">
                    <b>쇼핑몰 정산금액</b>을
                    <b>캘린더</b>를 통해 <b>편리하게</b>
                </h2>
            </div>
            <div class="figuerArea">
                <div class="animateBox">
                    <img src="/resources/rudicks/mobile/img/main/calendar/av03-p05.png" alt="손" class="sObj horizontal sLeft item i05">
                    <img src="/resources/rudicks/mobile/img/main/calendar/av03-p04.png" alt="패널04" class="sObj horizontal sLeft item i04">
                    <img src="/resources/rudicks/mobile/img/main/calendar/av03-p03.png" alt="패널03" class="sObj horizontal sLeft item i03">
                    <img src="/resources/rudicks/mobile/img/main/calendar/av03-p02.png" alt="패널02" class="sObj horizontal sRight item i02">
                    <img src="/resources/rudicks/mobile/img/main/calendar/av03-p01.png" alt="패널01" class="sObj i01">
                </div>
                <div class="inner">
                    <div class="flagArea">
                        <div class="sObj flag f01 top">
                            <p class="ft1">캘린더를 통해 정산금액을 관리</p>
                            <ul>
                                <li>어제, 오늘, 내일 상관없이 원하는 날짜의 정산입금액, 예정액을 쉽고 편리하게 확인할 수 있습니다.</li>
                            </ul>
                        </div>
                        <div class="sObj flag f02 top">
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
                </div>
            </div>

            <div class="inner">
                <div class="btnArea sObj">
                    <a href="/m/register/step1" class="mBtn sColorLB ">시작하기</a>
                </div>
            </div>
        </article>

        <!--재고정보-->
        <article class="actArea act04" id="act04">
            <div class="titleTxt hasBar">
                <h2 class="sObj">
                    상품정보 입력 없이도
                    <b>재고정보를 확인하다!</b>
                </h2>
            </div>
            <div class="figuerArea">
                <div class="animateBox">
                    <img src="/resources/rudicks/mobile/img/main/phone/av04-p02.png" alt="패널02" class="sObj horizontal sLeft item i02">
                    <img src="/resources/rudicks/mobile/img/main/phone/av04-p01.png" alt="패널01" class="sObj horizontal sLeft i01">
                    <img src="/resources/rudicks/mobile/img/main/phone/av04-p04.png" alt="패널04" class="sObj item i04">
                    <img src="/resources/rudicks/mobile/img/main/phone/av04-p03.png" alt="패널03" class="sObj item i03">
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
                    <div class="sObj flag f02 top">
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
            </div>
           
            <div class="inner">
                <div class="btnArea sObj">
                    <a href="#preCal" class="mBtn sColorLB modalOpen" data-modal="join" >시작하기</a>
                </div>
            </div>
        </article>

        <!--머니뱅크-->
        <article class="actArea act05" id="act05">
            <div class="inner">
                <div class="titleTxt hasBar sObj">
                    <h2 class="">
                        온라인 셀러의 새로운
                        <b>사업자금 확보 방식 !</b>
                    </h2>
                </div>
            </div>
            <div class="figuerArea">
                <div class="flagArea">
                    <div class="sObj flag bottom f01">
                        <p class="ft1">온라인 소상공인을 위한 단비펀드</p>
                        <ul>
                            <li>
                                온라인을 통한 100% 비대면 방식의 선정산 서비스로<br>
                                복잡한 서류없이 인공지능 사업평가 시스템, 프리즘을 통해 <br>
                                쉽고 빠르게 서비스를 이용하실 수 있습니다.<br>
                                5백만원의 사업자금을 30일 동안 자유롭게 사용하실 수 있습니다. <br>
                                본 서비스는 국내 P2P펀딩의 대표, 투게더 펀딩과 함께합니다.
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="animateBox">
                    <img src="/resources/rudicks/mobile/img/main/notebook/av05-p01.png" alt="패널01" class="sObj horizontal sRight i01">
                    <img src="/resources/rudicks/mobile/img/main/notebook/av05-p02.png" alt="패널02" class="sObj horizontal sRight item i02">
                    <img src="/resources/rudicks/mobile/img/main/notebook/av05-p04.png" alt="패널04" class="sObj horizontal sLeft item i04">
                </div>
                
            </div>
           
            <div class="inner ">
                <div class="btnArea sObj">
                    <a href="#preCal" class="mBtn sColorLB modalOpen" data-modal="join" >시작하기</a>
                </div>
            </div>
        </article>

        <!--선정산 서비스-->
        <article class="actArea preCal" id="preCal">
            <div class="inner">
                <div class="sObj titleTxt hasBar">
                    <h3>가장 합리적인 선택, 머니뱅크 선정산 서비스!</h3>
                    <p class="tGide">쉽고 편리하게 사업평가만으로 바로 이용하세요.</p>
                </div>
                <div class="sObj formArea">
                    <form action="#">
                        <div class="formList">
                            <div class="selectBox">
                                <span>서비스</span>
                                <select>
                                    <option value="">선택</option>
                                    <option value="">머니펀드</option>
                                    <option value="">헬로펀드</option>
                                </select>
                            </div>
                            <div class="selectBox">
                                <span>필요자금</span>
                                <select>
                                    <option value="">선택</option>
                                    <option value="">1백만원</option>
                                    <option value="">2백만원</option>
                                    <option value="">3백만원</option>
                                    <option value="">5백만원</option>
                                    <option value="">1천만원</option>
                                </select>
                            </div>
                            <div class="selectBox">
                                <span>이용기간</span>
                                <select>
                                    <option value="">선택</option>
                                    <option value="">5일</option>
                                    <option value="">10일</option>
                                    <option value="">15일</option>
                                    <option value="">30일</option>
                                    <option value="">45일</option>
                                </select>
                            </div>
                        </div>
                        <div class="sObj btnArea">
                            <button class="mBtn sColorN">예상 수수료 검색</button>
                        </div>
                    </form>
                </div>
                <div class="sObj noticeBox">
                    <p>
                        본 예상 수수료는 필요자금을 당사가 가정한 상황을 기준으로 산출할 것으로 실제 적용 시 신청 금액 및 기간 <br>
                        그리고 당사 내부 심사평가 결과에 따라 선정산 산정비율과 수수료 등에 차이가 발생할 수 있습니다.  
                    </p>
                </div>
            </div>
        </article>
    </section>

    <section class="youtubeArea scrollAni">
        <div class="inner">
            <h2 class="sObj sTitle white"><b>큐빅아이</b>의 혁신적인 기능</h2>
            <div class="sObj videoBox">
                <iframe width="1150" height="630" src="https://www.youtube.com/embed/NkmT63h1sZA?controls=0&rel=0&modestbranding=1&disablekb=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    </section>

    <section class="preCal scrollAni">
        <div class="inner">
            <div class="sObj sTitle">
                <h3>가장 합리적인 선택, 머니뱅크 선정산 서비스!</h3>
                <p class="tGide">쉽고 편리하게 사업평가만으로 바로 이용하세요.</p>
            </div>
            <div class="sObj formArea">
	        	<div class="formList">
	                <div class="selectBox">
	                    <span>서비스</span>
	                    <select id="service">
	                        <option value="">선택</option>
	                        <option value="danbie">단비펀드</option>
	                    </select>
	                </div>
	                <div class="selectBox">
	                    <span>필요자금</span>
	                    <select id="necessaryFunds">
	                        <option value="">선택</option>
	                        <option value="300">3백만원</option>
	                        <option value="500">5백만원</option>
	                        <option value="1000">1천만원</option>
	                    </select>
	                </div>
	                <div class="selectBox">
	                    <span>이용기간</span>
	                    <select id="userPeriod">
	                        <option value="">선택</option>
	                        <option value="10">10일</option>
	                        <option value="15">15일</option>
	                        <option value="30">30일</option>
	                    </select>
	                </div>
	            </div>
	            <div class="btnArea">
	                <button class="bBtn sColorB" id="commissionSearch">예상 수수료 검색</button>
	            </div>
                <div class="resultPrice">
                    <span class="txt">예상 수수료 <span class="price">
                    <b id="commission" >0</b> 원</span> 
                    <br>
                    <span style="font-size: 18px;">(VAT 별도)</span>
                    </span>
                </div>
            </div>
        </div>
        <div class="sObj noticeBox">
            <p>
                본 예상 수수료는 필요자금을 당사가 가정한 상황을 기준으로 산출할 것으로 실제 적용 시 신청 금액 및 기간 <br>
                그리고 당사 내부 심사평가 결과에 따라 선정산 산정비율과 수수료 등에 차이가 발생할 수 있습니다.  
            </p>
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

    <script src="/resources/rudicks/mobile/js/publishing-main.js"></script>
</div>
