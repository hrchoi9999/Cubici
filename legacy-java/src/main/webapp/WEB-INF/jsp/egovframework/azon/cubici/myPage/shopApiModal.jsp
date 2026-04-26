<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<!-- 인터파크 API 모달 -->
<div class="modal-container api-header pass alert" id="interparkApiInputModal">
    <div class="modal-wrapper bg-fff">
        <header>
            <h2 class="my">API 인증 요청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner middle mArticleArea">
                <article class="noticeTxt">
                    <p>
                        큐빅아이에서는 회원님 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 <br>
                        인터파크에서 제공하는 API 방식을 사용하고 있습 니다. <br>
                        인터파크 쇼핑몰 정보 확인을 위해서는 아래 “API 키 받기 ” 버튼을 클릭해 주세요
                    </p>
                </article>
                <article class="middleBtnArea">
                    <a target="_blank" href="/board/notice/index" class="mBtn imgBtn tColorRB">
                        <img src="/resources/rudicks/img/partner-color/partner-sq-interpark.jpg" alt="인터파크">
                        인터파크API 키 받기
                    </a>
                </article>
                <article class="noticeTxt">
                    <p>
                        인터파크에서 제공하는 API 키를 아래와 같이<br>
                        업체코드, 엑세스키, 시크릿키 3가지를 확인하시고,<br>
                        해당 란에 입력해 주십시오. 감사합니다.
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">업체코드</span>
                                    <div class="input">
                                        <input type="text" id="i_apiVendorId" placeholder="업체코드">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">엑세스키</span>
                                    <div class="input">
                                        <input type="text" id="i_apiAccessKey" placeholder="엑세스키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">시크릿키</span>
                                    <div class="input">
                                        <input type="text" id="i_apiSecretKey" placeholder="시크릿키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" class="mBtn sColorLS2" onclick="apiConfirm('i');">연동</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 지마켓 API 모달 -->
<div class="modal-container api-header pass alert" id="gmarketApiInputModal">
    <div class="modal-wrapper">
        <header>
            <h2>API 인증 요청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner middle mArticleArea">
                <article class="noticeTxt">
                    <p>
                        큐빅아이에서는 회원님 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 <br>
                        지마켓에서 제공하는 API 방식을 사용하고 있습 니다. <br>
                        지마켓 쇼핑몰 정보 확인을 위해서는 아래 “API 키 받기 ” 버튼을 클릭해 주세요
                    </p>
                </article>
                <article class="middleBtnArea">
                    <a target="_blank" href="/board/notice/index" class="mBtn imgBtn tColorRB">
                        <img src="/resources/rudicks/img/partner-color/partner-sq-gmarket.jpg" alt="지마켓">
                        지마켓API 키 받기
                    </a>
                </article>
                <article class="noticeTxt">
                    <p>
                        지마켓에서 제공하는 API 키를 아래와 같이<br>
                        업체코드, 엑세스키, 시크릿키 3가지를 확인하시고,<br>
                        해당 란에 입력해 주십시오. 감사합니다.
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">업체코드</span>
                                    <div class="input">
                                        <input type="text" id="g_apiVendorId" placeholder="업체코드">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">엑세스키</span>
                                    <div class="input">
                                        <input type="text" id="g_apiAccessKey" placeholder="엑세스키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">시크릿키</span>
                                    <div class="input">
                                        <input type="text" id="g_apiSecretKey" placeholder="시크릿키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" class="mBtn sColorLS2" onclick="apiConfirm('g');">연동</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 옥션 API 모달 -->
<div class="modal-container api-header pass alert" id="auctionApiInputModal">
    <div class="modal-wrapper">
        <header>
            <h2>API 인증 요청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner middle mArticleArea">
                <article class="noticeTxt">
                    <p>
                        큐빅아이에서는 회원님 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 <br>
                        옥션에서 제공하는 API 방식을 사용하고 있습 니다. <br>
                        옥션 쇼핑몰 정보 확인을 위해서는 아래 “API 키 받기 ” 버튼을 클릭해 주세요
                    </p>
                </article>
                <article class="middleBtnArea">
                    <a target="_blank" href="/board/notice/index" class="mBtn imgBtn tColorRB">
                        <img src="/resources/rudicks/img/partner-color/partner-sq-auction.jpg" alt="옥션">
                        옥션API 키 받기
                    </a>
                </article>
                <article class="noticeTxt">
                    <p>
                        옥션에서 제공하는 API 키를 아래와 같이<br>
                        업체코드, 엑세스키, 시크릿키 3가지를 확인하시고,<br>
                        해당 란에 입력해 주십시오. 감사합니다.
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">업체코드</span>
                                    <div class="input">
                                        <input type="text" id="a_apiVendorId" placeholder="업체코드">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">엑세스키</span>
                                    <div class="input">
                                        <input type="text" id="a_apiAccessKey" placeholder="엑세스키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">시크릿키</span>
                                    <div class="input">
                                        <input type="text" id="a_apiSecretKey" placeholder="시크릿키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" class="mBtn sColorLS2" onclick="apiConfirm('a');">연동</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 11번가 API 모달 -->
<div class="modal-container api-header pass alert" id="street11ApiInputModal">
    <div class="modal-wrapper">
        <header>
            <h2>API 인증 요청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner middle mArticleArea">
                <article class="noticeTxt">
                    <p>
                        큐빅아이에서는 회원님 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 <br>
                        11번가에서 제공하는 API 방식을 사용하고 있습 니다. <br>
                        11번가 쇼핑몰 정보 확인을 위해서는 아래 “API 키 받기 ” 버튼을 클릭해 주세요
                    </p>
                </article>
                <article class="middleBtnArea">
                    <a target="_blank" href="/board/notice/index" class="mBtn imgBtn tColorRB">
                        <img src="/resources/rudicks/img/partner-color/partner-sq-11st.jpg" alt="11번가">
                        11번가API 키 받기
                    </a>
                </article>
                <article class="noticeTxt">
                    <p>
                        11번가에서 제공하는 API 키를 아래와 같이 확인하시고,<br>
                        해당 란에 입력해 주십시오. 감사합니다.<br>
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">엑세스키</span>
                                    <div class="input">
                                        <input type="text" id="s_apiAccessKey" placeholder="엑세스키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" class="mBtn sColorLS2" onclick="apiConfirm('s');">연동</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 쿠팡 API 모달 -->
<div class="modal-container api-header pass alert" id="coupangApiInputModal">
    <div class="modal-wrapper">
        <header>
            <h2>API 인증 요청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner middle mArticleArea">
                <article class="noticeTxt">
                    <p>
                        큐빅아이에서는 회원님 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 <br>
                        쿠팡에서 제공하는 API 방식을 사용하고 있습 니다. <br>
                        쿠팡 쇼핑몰 정보 확인을 위해서는 아래 “API 키 받기 ” 버튼을 클릭해 주세요
                    </p>
                </article>
                <article class="middleBtnArea">
                    <a target="_blank" href="/board/notice/index" class="mBtn imgBtn tColorRB">
                        <img src="/resources/rudicks/img/partner-color/partner-sq-coupang.jpg" alt="쿠팡">
                        쿠팡API 키 받기
                    </a>
                </article>
                <article class="noticeTxt">
                    <p>
                        쿠팡에서 제공하는 API 키를 아래와 같이<br>
                        업체코드, 엑세스키, 시크릿키 3가지를 확인하시고,<br>
                        해당 란에 입력해 주십시오. 감사합니다.
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">업체코드</span>
                                    <div class="input">
                                        <input type="text" id="c_apiVendorId" placeholder="업체코드">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">엑세스키</span>
                                    <div class="input">
                                        <input type="text" id="c_apiAccessKey" placeholder="엑세스키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">시크릿키</span>
                                    <div class="input">
                                        <input type="text" id="c_apiSecretKey" placeholder="시크릿키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <article>
                    <p class="noticeTxt">현재 정산은 어떤 방식으로 진행하고 계십니까?</p>
                    <div class="lableList">
                        <label class="radioBox">
                            <input type="radio" name="c_apiSettlementRadio" value="WEEKLY">
                            <span>주 정산</span>
                        </label>
                        <label class="radioBox">
                            <input type="radio" name="c_apiSettlementRadio" value="MONTH">
                            <span>월 정산</span>
                        </label>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" class="mBtn sColorLS2" onclick="apiConfirm('c');">연동</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 네이버 API 모달 -->
<div class="modal-container api-header pass alert" id="naverApiInputModal">
    <div class="modal-wrapper">
        <header>
            <h2>API 인증 요청</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner middle mArticleArea">
                <article class="noticeTxt">
                    <p>
                        큐빅아이에서는 회원님 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 <br>
                        네이버에서 제공하는 API 방식을 사용하고 있습 니다. <br>
                        네이버 쇼핑몰 정보 확인을 위해서는 아래 “API 키 받기 ” 버튼을 클릭해 주세요
                    </p>
                </article>
                <article class="middleBtnArea">
                    <a target="_blank" href="/board/notice/index" class="mBtn imgBtn tColorRB">
                        <img src="/resources/rudicks/img/partner-color/partner-sq-naver.jpg" alt="네이버">
                        네이버API 키 받기
                    </a>
                </article>
                <article class="noticeTxt">
                    <p>
                        네이버에서 제공하는 API 키를 아래와 같이<br>
                        업체코드, 엑세스키, 시크릿키 3가지를 확인하시고,<br>
                        해당 란에 입력해 주십시오. 감사합니다.
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">업체코드</span>
                                    <div class="input">
                                        <input type="text" id="n_apiVendorId" placeholder="업체코드">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">엑세스키</span>
                                    <div class="input">
                                        <input type="text" id="n_apiAccessKey" placeholder="엑세스키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">시크릿키</span>
                                    <div class="input">
                                        <input type="text" id="n_apiSecretKey" placeholder="시크릿키">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <div class="btnArea">
                    <a href="javascript:;" class="mBtn sColorLS2" onclick="apiConfirm('n');">연동</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- api 연동 완료 -->
<div class="modal-container alert alert-pass" id="successApiModal">
    <div class="modal-wrapper">
        <header>
            <h2>연동 완료</h2>
        </header>
        <div class="alert-content">
            <div class="alert-txt">
                <div class="icon">
                    <img src="/resources/rudicks/img/icon/alert-info.svg" alt="안내">
                </div>
                <div class="txtBox">
                    연동이 완료되었습니다. 매일 00:00 자정 마다 쇼핑몰 정보가 수집되어 업데이트 됩니다. 감사합니다.
                </div>
            </div>
            <div class="btnArea">
                <a href="javascript:;" class="modalClose sBtn sColorLS2">예</a>
            </div>
        </div>
    </div>
</div>

<!-- api 연동 실패 -->
<div class="modal-container alert alert-pass" id="failApiModal">
    <div class="modal-wrapper">
        <header>
            <h2>연동 실패</h2>
        </header>
        <div class="alert-content">
            <div class="alert-txt">
                <div class="icon">
                    <img src="/resources/rudicks/img/icon/alert-info.svg" alt="안내">
                </div>
                <div class="txtBox">
                    연동에 실패했습니다. API KEY 값을 다시 확인하여 재연동해주시기 바랍니다. 감사합니다.
                </div>
            </div>
            <div class="btnArea">
                <a href="" class="modalClose sBtn sColorLS2">예</a>
            </div>
        </div>
    </div>
</div>
