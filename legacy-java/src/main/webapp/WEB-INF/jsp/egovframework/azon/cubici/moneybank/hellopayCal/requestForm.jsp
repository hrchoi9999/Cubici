<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script src="/resources/rudicks/js/file.js"></script>
<script src="/resources/hyphen/nx2.js"></script>
<script src="/resources/hyphen/jquery.blockUI.js"></script>
<link rel="stylesheet" href="/resources/css/layerPopup_220124.css">

<script>
    $(document).ready(function () {

        let type = 'mb';
        let mType = '${param.Type}';

        if (mType != "" || mType != null || mType != undefined) {
            modalOpenType(type, mType);
        }

        $('.mbApp').on('click', function () {
            $(location).attr('href', '/moneybank/request');
        });

        $(".processEnd").on('click', function () {
            processEnd("${mbankInfo.mbid}");
        });

        getAdvcalc('${user.user_code}');

        $('#allCheck').click(function () {
            if ($('#allCheck').is(':checked')) {
                $('input[class=check-doc]').prop('checked', true);
            } else {
                $('input[class=check-doc]').prop('checked', false);
            }
        });

        $('#advanceRequest').on('click', advanceRequest);

        $('#duplicateMain, #duplicateDemand, #consentFile').on('change', function () {
            let files = $(this)[0].files;

            if (!fileVaildator(files)) {
                $(this).val('')
                $('#' + $(this).attr('id') + 'Path').val('');
                return false;
            }
            $('#' + $(this).attr('id') + 'Path').val($(this).val());
        });

        $('#requestAccept').on('click', requestAcceptVaildator);
        $('#settleAccSendsms').on('click', settleAccSendsms);

        fileList('common', '0', 'consentFile')

        $('.m-tab>ul>li').on('click', function () {
            const $this = $(this);
            const tabClass = $this.attr('class');
            const $tabContent = $('#' + tabClass);

            $this.addClass('active').siblings().removeClass('active');
            $tabContent.show().siblings().hide();
        });
    });

    $(document).on('click', '.f-label', function () {
        $(this).children('.f-underline').addClass('f-active');

        let uuid = $(this).attr('id');
        let objParam = {
            uuid: uuid,
            enc_type: 'N'
        }
        let callUrl = "/file/download";
        cubici.Ajax.download.fnRequest(objParam, callUrl);
    });

    function getAdvcalc(usercode) {
        let callUrl = '/moneybank/advcalc/request/get';
        let callBackFunc = 'getAdvcalcResponse';
        let objParam = {
            code: usercode
        }
        cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
    }

    function getAdvcalcResponse(data) {
        const shopList = data.shop;
        const bankList = data.bank;

        const shopHtml = shopList
            .filter(item => item.isShop === 'true')
            .map(item => `<input class="check-shop" id="shop_` + item.code_e_nm + `" type="checkbox" name="shop" value="` + item.code_e_nm + `" />
            <label for="shop_` + item.code_e_nm + `">
                <img src="/resources/rudicks/img/partner-color/` + item.code_e_nm + `-con.png" alt="">
            </label>`).join('');

        const bankHtml = bankList
            .map(item => `<option value="` + item.bank_code + `">` + item.bank_name + `</option>`).join('');

        $('#currentShop').html(shopHtml);
        $('#mainAccBankCode').html(bankHtml);
    }

    function advanceRequest() {
        $('.loadingSpinner').css({'display': 'inline-block'});

        const shop_arr = getCheckedShopArray();
        const activeTab = getActiveTab();

        if (!isFormValid(shop_arr, activeTab)) {
            $('.loadingSpinner').css({'display': 'none'});
            return;
        }

        let callUrl = '/moneybank/advcalc/request/advance';
        let callBackFunc = 'advanceRequestResponse';
        let objParam = getAdvanceRequestParam(activeTab);

        cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
    }

    function getActiveTab() {
        const activeTab = $('.m-tab .active').attr('class');

        if (activeTab.indexOf('reg-no') !== -1) {
            return 'reg-no';
        } else if (activeTab.indexOf('driver-license') !== -1) {
            return 'driver-license';
        }
    }

    function getCheckedShopArray() {
        return $('.check-shop:checked').map(function () {
            return $(this).val();
        }).get();
    }

    function isFormValid(shop_arr, activeTab) {
        let date_pattern = /^(19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[0-1])$/;

        if (shop_arr.length === 0) {
            modalInfo('선정산 쇼핑몰 하나 이상 선택해주세요.');
            return false;
        }

        if (activeTab === 'reg-no') {
            if ($('#reg_no_first').val().length !== 6 || $('#reg_no_second').val().length !== 7) {
                modalInfo('주민등록번호를 확인해주세요.');
                return false;
            }

            if ($('#reg_no_first').val().substring(2, 4) >= 13 || $('#reg_no_first').val().substring(4, 6) >= 32) {
                modalInfo('생년월일을 확인해주세요.');
                return false;
            }

            if (!(date_pattern.test($('#issue_date').val()))) {
                modalInfo('발급 일자를 확인해 주세요.')
                return false;
            }
        } else if (activeTab === 'driver-license') {
            if (!(date_pattern.test($('#birth_date').val()))) {
                modalInfo('생년월일을 확인해주세요.');
                return false;
            }

            if ($('#licence1').val().length !== 2 || $('#licence2').val().length !== 2 ||
                $('#licence3').val().length !== 6 || $('#licence4').val().length !== 2) {
                modalInfo('운전 면허 번호를 확인해주세요.');
                return false;
            }

            if ($('#serial_code_no').val().length !== 6) {
                modalInfo('일련번호를 확인해주세요');
                return false;
            }
        }

        if ($('.check-doc:not(:checked)').length !== 0) {
            modalInfo('동의서를 모두 확인해주세요.');
            return false;
        }

        return true;
    }

    function getAdvanceRequestParam(activeTab) {
        if (activeTab === 'reg-no') {
            return {
                user_code: '${user.user_code}',
                reg_no_first: $('#reg_no_first').val(),
                reg_no_second: $('#reg_no_second').val(),
                issueDate: $('#issue_date').val(),
                shop_arr: getCheckedShopArray(),
                type: activeTab
            }
        } else if (activeTab === 'driver-license') {
            return {
                user_code: '${user.user_code}',
                birth_date: $('#birth_date').val(),
                licence01: $('#licence1').val(),
                licence02: $('#licence2').val(),
                licence03: $('#licence3').val(),
                licence04: $('#licence4').val(),
                serialNo: $('#serial_code_no').val(),
                shop_arr: getCheckedShopArray(),
                type: activeTab
            }
        }
    }

    function advanceRequestResponse(result) {
        if (result.description) {
            modalInfo(result.description);
        } else if (result.isSuccess) {
            modalInfo('1차 확인결과 머니플러스 신청이 가능하신 것으로 판단되었습니다.서비스 신청을 계속 진행해 주십시오.');
        } else if (!result.isSuccess) {
            modalInfo('1차 확인결과 머니플러스 신청조건에 다소 부족하신 것으로 판단되었습니다.추후 다시 한번 신청해 주시면 감사하겠습니다.');
        } else {
            modalInfo('관리자에게 문의해주세요.');
        }

        $(".loadingSpinner").css({"display": "none"});
    }

    function settleAccSendsms() {
        let callUrl = '/moneybank/advcalc/request/settle-sendsms';
        let callBackFunc = 'settleAccSendsmsResponse';
        let objParam = {};

        cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
    }

    function settleAccSendsmsResponse(result) {
        if (result.resultCode == 0) {
            modalInfo('등록 핸드폰으로 계좌개설 안내문자가 발송 되었습니다. 계좌개설 방법은 공지사항을 참고해주십시오.');
        } else {
            modalInfo('관리자에게 문의해주세요.')
        }
    }

    function requestAcceptVaildator() {
        if ($('.loadingSpinner').css('display') === 'block') {
            modalInfo("신청 진행중입니다. 잠시만 기다려주세요.")
            return false;
        }

        if (!$('#duplicateDemand').val()) {
            modalInfo("정산계좌 사본을 업로드 해주세요.")
            return false;
        }

        if (!$('#duplicateMain').val()) {
            modalInfo("주거래 통장 사본을 업로드 해주세요.")
            return false;
        }

        if (!$('#consentFile').val()) {
            modalInfo("자금 이체 동의서를 업로드 해주세요.")
            return false;
        }

        if (!$('#demandAccHolder').val()) {
            modalInfo("정산계좌 예금주 명을 입력해 주세요.")
            return false;
        }

        if (!$('#demandAccNumber').val()) {
            modalInfo("정산계좌 계좌 번호를 입력해 주세요.")
            return false;
        }

        if (!$('#mainAccHolder').val()) {
            modalInfo("주거래 통장 예금주 명을 입력해 주세요.")
            return false;
        }

        if (!$('#mainAccNumber').val()) {
            modalInfo("주거래 통장 계좌 번호를 입력해 주세요.")
            return false;
        }
        popup();
    }

    function requestAccept(signCert, signPri, signPw) {
        $(".loadingSpinner").css({"display": "inline-block"});
        let objParam = new FormData();

        let user_code = '${user.user_code}';
        let demand_acc_bank_code = $('#demandAccBankCode option:selected').val();
        let demand_acc_holder = $('#demandAccHolder').val();
        let demand_acc_number = $('#demandAccNumber').val();
        let main_acc_bank_code = $('#mainAccBankCode option:selected').val();
        let main_acc_holder = $('#mainAccHolder').val();
        let main_acc_number = $('#mainAccNumber').val();
        let file_arr = [];

        let duplicateMain = $('#duplicateMain')[0].files[0];
        file_arr.push(duplicateMain)

        let duplicateDemand = $('#duplicateDemand')[0].files[0];
        file_arr.push(duplicateDemand)

        let consentFile = $('#consentFile')[0].files[0];
        file_arr.push(consentFile)

        let callUrl = '/moneybank/advcalc/request/accept';
        let callBackFunc = 'requestAcceptResponse';
        let data = {
            user_code: user_code,
            signCert: signCert,
            signPri: signPri,
            signPw: signPw,
            mb_demand_acc_bank_code: demand_acc_bank_code,
            mb_demand_acc_holder: demand_acc_holder,
            mb_demand_acc_number: demand_acc_number,
            mb_main_acc_bank_code: main_acc_bank_code,
            mb_main_acc_holder: main_acc_holder,
            mb_main_acc_number: main_acc_number
        }
        objParam.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}));

        for (i = 0; i < file_arr.length; i++) {
            objParam.append('file', file_arr[i]);
        }

        cubici.Ajax.file.fnRequest(objParam, callUrl, callBackFunc);
    }

    function requestAcceptResponse(result) {
        $(".loadingSpinner").css({"display": "none"});
        if (result.isSuccess) {
            modalInfo("머니플러스 이용조건을 심사하기 위해 심사 자료를 취합하고 있습니다. 자료분석이 완료되면 문자와 이메일로 알려드리도록 하겠습니다.");
            $("#confirm").on("click", function () {
                window.location.href = "/moneybank/advcalc/evaluate";
            });
        } else if (result.description) {
            modalInfo(result.description);
        } else {
            modalInfo('관리자에게 문의해 주세요.');
        }
    }

    function consentFile(data) {
        let fileList = data.fileList

        if (fileList != null) {
            $('.consent-file-table')
                .append('<label class="f-label" id="' + fileList[0].uuid + '"><span class="oiBtn download f-pointer"></span>'
                    + '<span class="f-pointer f-underline">' + fileList[0].file_name + '</span></label>');
        }
    }

    function win_pop(cnt) {
        window.open('/moneybank/advcalc/request/clause-details/' + cnt, '머니뱅크 약관', 'width=340, height=420, location=no, scrollbars=yes');
    }
</script>

<div class="contentGrid">
    <div class="inner wide">
        <div class="s-tab">
            <ul>
                <li class="active"><a href="/moneybank/advcalc/request">서비스 신청</a></li>
                <li><a>검토 및 심사</a></li>
                <li><a>계약 체결</a></li>
            </ul>
        </div>
        <div class="conArticle">
            <div class="conArticle-inner">
                <h3>유저정보</h3>
                <div class="money-bank-table color-g box-border-blue">
                    <table>
                        <tr>
                            <th class="bg-sky">유저ID</th>
                            <td class="border-r-none">${user.user_id}</td>
                            <th class="bg-sky">회사명</th>
                            <td class="border-r-none">${user.firm_nm}</td>
                            <th class="bg-sky">회원명</th>
                            <td class="border-r-none">${user.username}</td>
                            <th class="bg-sky">사업자등록번호</th>
                            <td>${user.firm_id}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div class="conArticle">
            <div class="conArticle-inner">
                <h3>서비스 소개</h3>
                <div class="txt-content content-bg  bg-icon con-01">
                    등록하신 쇼핑몰의 판매상품이 배송되면 바로 입금되는 쉽고 빠른 선정산 서비스와<br>
                    운영 쇼핑몰의 정산입금 및 입금예정 금액 정보를 함께 확인하실 수 있는 간편금융 서비스입니다.
                    <p class="mTop-20">
                        <b class="color-blue underlineTxt"> 머니플러스 서비스 </b><br>
                        등록하신 쇼핑몰의 정산입금 및 입금예정금액을 캘린더에서 한눈에 관리하실 수 있습니다.<br>
                        온라인 쇼핑몰들의 판매대금을 정산 입금일까지 기다릴 필요없이 미리 입금해 드립니다.<br>
                        서비스 이용현황을 쉽게 확인할 수 있으며, 6개월 이상 이용 시 이용조건 변경이 가능합니다.<br>
                    </p>
                    <p class="mTop-20">
                        <b class="color-blue underlineTxt"> 서비스 수수료 </b><br>
                        이용금액, 이용기간에 상관없이 쇼핑몰 입금액의 1.2%. (VAT 및 송금 발생시 수수료 별도) <br>
                    </p>
                    <p class="mTop-20">
                        <b class="color-blue underlineTxt"> 이용가능 금액 </b><br>
                        결제 대비 지급율은 최대 90% (자체 평가에 따라 지급율 차이 발생) <br>
                        3백만원 이상의 주문 금액은 선정산에서 예외 처리 <br>
                    </p>
                    <div class="deco-box">
                        <h4>서비스 신청대상</h4>
                        <ul class="barList color-blue font-15">
                            <li>만20세 이상 개인사업자 (법인사업자 및 해외직구대행업 제외)</li>
                            <li>사업경력 1년 이상 사업자</li>
                            <li>등록 쇼핑몰 판매경력 6개월 이상</li>
                            <li>월 평균 매출액 1천만원 이상</li>
                            <li>타 선지급 및 선정산 서비스 중복이용 불가</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="conArticle">
            <div class="conArticle-inner">
                <h3>선정산 대상 쇼핑몰</h3>
                <form>
                    <div class="money-bank-table box-border-blue txt-content">
                        <p>머니플러스 서비스를 적용하실 쇼핑몰을 선택해 주십시오. <br> 대상 쇼핑몰이 많을수록 이용금액이 커질 수 있습니다.</p>
                        <table class="register-table">
                            <tbody class="align-center">
                            <tr>
                                <td id="currentShop"></td>
                            </tr>
                            </tbody>
                        </table>
                        <p><br><br>선택하신 머니플러스 대상 쇼핑몰은 이후 추가 또는 제외하실 수 있습니다. <br> 쇼핑몰을 추가 등록하시기 위해서는 “마이페이지/가입정보”를 통해
                            추가하실 수 있습니다.</p>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="conArticle">
        <div class="conArticle-inner">
            <h3>동의서 확인</h3>
            <div class="txt-content box-border-blue">
                <p>큐빅아이 구매자금 선지급 신청을 위해서는 아래의 서류들이 필요합니다. 제출서류 내용과 아래의 동의서를 꼭 확인하시고 신청해 주십시오.</p>
                <div class="m-tab col-2">
                    <ul>
                        <li class="reg-no active"><a href="javascript:;">주민등록증</a></li>
                        <li class="driver-license"><a href="javascript:;">운전면허증</a></li>
                    </ul>
                </div>
                <div class="money-bank-table table-border">
                    <table id="reg-no">
                        <thead class="bg-blue">
                        <tr>
                            <th>주민번호</th>
                            <th>발급일자</th>
                        </tr>
                        </thead>
                        <tbody class="align-center">
                        <tr>
                            <td>
                                <input id="reg_no_first" type="text" placeholder="앞 생년월일" maxlength=6 autocomplete="off"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">-
                                <input id="reg_no_second" type="password" placeholder="고유번호" maxlength=7
                                       autocomplete="new-password"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                            </td>
                            <td>
                                <input id="issue_date" type="text" placeholder="yyyymmdd" maxlength=8 autocomplete="off"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <table id="driver-license" style="display:none;">
                        <thead class="bg-blue">
                        <tr>
                            <th>생년월일</th>
                            <th>운전면허번호</th>
                            <th>암호일련번호</th>
                        </tr>
                        </thead>
                        <tbody class="align-center">
                        <tr>
                            <td>
                                <input id="birth_date" type="text" style="width:95%" placeholder="8자리(예:19910609)"
                                       maxlength=8
                                       autocomplete="off"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"/>
                            </td>
                            <td>
                                <input id="licence1" type="text" maxlength=2 autocomplete="off"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"/>&nbsp;-&nbsp;
                                <input id="licence2" type="text" maxlength=2 autocomplete="off"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"/>&nbsp;-&nbsp;
                                <input id="licence3" type="text" class="wide" maxlength=6 autocomplete="new-password"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"/>&nbsp;-&nbsp;
                                <input id="licence4" type="text" maxlength=2 autocomplete="off"
                                       oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"/>
                            </td>
                            <td>
                                <input id="serial_code_no" type="text" style="width:95%"
                                       placeholder="면허증 우측 하단 사진 참조(예:8271AO)" maxlength=6
                                       autocomplete="off"/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <form>
                    <fieldset>
                        <ul class="checkBoxList">
                            <li class="col-100"><input id="allCheck" class="all-check" type="checkbox"><label
                                    for="allCheck" class="color-blue"><b>전체동의</b></label></li>
                            <li class="col-3 font-15"><input class="check-doc" type="checkbox"><label>[필수] 개인(신용)정보
                                수집․이용 동의서<a class="clauseDetails" onclick="win_pop(1);">약관보기</a></label></li>
                            <li class="col-3 font-15"><input class="check-doc" type="checkbox"><label>[필수] 개인(신용)정보 제공
                                동의서<a class="clauseDetails" onclick="win_pop(2);">약관보기</a></label></li>
                        </ul>
                        <ul class="checkBoxList">
                            <li class="col-3 font-15"><input class="check-doc" type="checkbox"><label>[필수] 개인(신용)정보 조회
                                동의서<a class="clauseDetails" onclick="win_pop(3);">약관보기</a></label></li>
                            <li class="col-3 font-15"><input class="check-doc" type="checkbox"><label>[필수] 선정산 서비스 약관<a
                                    class="clauseDetails" onclick="win_pop(4);">약관보기</a></label></li>
                        </ul>
                    </fieldset>
                </form>
            </div>
            <div class="button-box">
                <a class="btn" style="cursor: pointer" id="advanceRequest">신청 자격 확인</a>
            </div>
        </div>
    </div>
    <div class="conArticle">
        <div class="conArticle-inner">
            <h3>쇼핑몰 정산계좌 개설</h3>
            <div class="txt-content box-border-blue">
                <p>머니플러스 서비스 신청을 위해서는 새롭게 “요구불 통장”을 개설하시고 선택하신 쇼핑몰의 정산계좌로 변경해 주셔야 합니다. 아래 “통장 개설” 버튼을 클릭하시고, 계좌개설을 진행해
                    주십시오.</p>
                <div class="button-box">
                    <a class="sbtn" style="cursor: pointer" id="settleAccSendsms">쇼핑몰 정산계좌 등록용 비대면계좌 개설하기</a>
                </div>
            </div>
        </div>
    </div>
    <div class="conArticle">
        <div class="conArticle-inner">
            <h3>신청서류 업로드</h3>
            <p>
                머니플러스 서비스 신청을 위해서는 새롭게 “요구불 통장”을 개설하시고<br>
                선택하신 쇼핑몰의 정산계좌로 변경해 주셔야 합니다. <br><br>
            </p>
            <div class="money-bank-table table-border">
                <table>
                    <thead class="bg-blue">
                    <tr>
                        <th>제출 서류</th>
                        <th>번호 입력</th>
                        <th>업로드</th>
                    </tr>
                    </thead>
                    <tbody class="align-center">
                    <tr>
                        <th>정산계좌(요구불 통장) 사본
                            <span class="infoArea">
		                            <a href="javascript:;" class="oiBtn infoBtn">정보</a>
		                            <span class="infoMemo" style="display: none;">
		                                <span class="iCon">
		                                    정산계좌 통장이란 서비스를 위해 새로 개설하신 경남은행 통장을 말합니다. 등록하신 정산계좌로 쇼핑몰 정산계좌 정보를 변경해 주십시오. 
		                                </span>
		                            </span>
		                        </span>
                        </th>
                        <td>
                            <select id="demandAccBankCode">
                                <option value="039">경남은행</option>
                            </select>
                            <input type="text" id="demandAccHolder" placeholder="예금주명" autocomplete="off"
                                   maxlength="10">
                            <input class="wide" type="text" id="demandAccNumber"
                                   placeholder="계좌번호 (&quot;- &quot;없이 숫자만)" autocomplete="off"
                                   oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        </td>
                        <td>
                            <label class="fileUpload" for="duplicateDemand">
                                <input id="duplicateDemandPath" type="text" class="wide" disabled>
                                <img src="/resources/rudicks/img/icon/upload02.png" alt="업로드">
                            </label>
                            <input id="duplicateDemand" type="file">
                        </td>
                    </tr>
                    <tr>
                        <th>주거래 통장 사본
                            <span class="infoArea">
		                            <a href="javascript:;" class="oiBtn infoBtn">정보</a>
		                            <span class="infoMemo" style="display: none;">
		                                <span class="iCon">
		                                    주거래 통장이란 머니뱅크 입금이 이루어지는 계좌로 회원님이 주로 사용하시는 계좌를 등록해주세요.
		                                </span>
		                            </span>
		                        </span>
                        </th>
                        <td>
                            <select id="mainAccBankCode"></select>
                            <input type="text" id="mainAccHolder" placeholder="예금주명" autocomplete="off" maxlength="10">
                            <input class="wide" type="text" id="mainAccNumber" placeholder="계좌번호 (&quot;- &quot;없이 숫자만)"
                                   autocomplete="off"
                                   oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        </td>
                        <td>
                            <label class="fileUpload" for="duplicateMain">
                                <input id="duplicateMainPath" type="text" class="wide" disabled>
                                <img src="/resources/rudicks/img/icon/upload02.png" alt="업로드">
                            </label>
                            <input id="duplicateMain" type="file">
                        </td>
                    </tr>
                    <tr>
                        <th>자금 이체 동의서</th>
                        <td class="consent-file-table"></td>
                        <td>
                            <label class="fileUpload" for="consentFile">
                                <input id="consentFilePath" type="text" class="wide" disabled>
                                <img src="/resources/rudicks/img/icon/upload02.png" alt="업로드">
                            </label>
                            <input id="consentFile" type="file">
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <small class="small color-blue">* 업로드 서류는 3mb이하의 사이즈로 pdf, jpg, png, doc 파일형식이어야 합니다.</small>
            <div class="button-box">
                <a class="btn" style="cursor: pointer" id="requestAccept">선정산 신청</a>
            </div>
            <div class="check-info">
                (주의) 머니플러스 심사는 선택한 쇼핑몰의 정산계좌가 모두 ‘경남은행 요구불 통장’으로 변경되어야 시작됩니다.
            </div>
        </div>
    </div>
</div>
<div class="dim-layer" style="display: none;">
    <div class="dimBg"></div>
    <div id="layer2" class="pop-layer">
        <div class="pop-container">
            <div class="pop_head">
                <div><p>공동인증 전자서명</p></div>
                <div class="btnX_wrap">
                    <button class="btnX certCancel">
	                    	<span class="icon">
	                        	<svg viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg">
	                        		<path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path>
	                    		</svg>
	                    	</span>
                    </button>
                </div>
            </div>
            <div class="pop_cont">
                <div class="logo_grap"><img src="/resources/custom/popup_image/event_popup/logo_grap.png"></div>
                <div>
                    <p class="pop_title">인증서 선택</p>
                </div>
                <div>
                    <div class="table_wrap">
                        <table class="pop_table">
                            <thead>
                            <tr class="cert_title">
                                <th class="th1">구분</th>
                                <th class="th2">인증서명</th>
                                <th class="th3">만료일</th>
                                <th class="th4">발급자</th>
                                <th class="th5">위치</th>
                            </tr>
                            </thead>
                            <tbody id="pop_table_tbody">
                            <tr class="cert_cont">
                                <td class="td1"></td>
                                <td class="td2"></td>
                                <td class="td3"></td>
                                <td class="td4"></td>
                                <td class="td5"></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <div><p class="pop_title">인증서 암호입력</p></div>
                    <div class="pw_wrap">
                        <input type="password" id="certSignPw">
                        <p>안전한 개인정보 관리를 위해 6개월마다 비밀번호를 변경하기 바랍니다.</p>
                    </div>
                </div>
                <div class="pop-conts">
                    <div class="pop-conts_wrap">
                        <button class="btn btn-default btn-layerClose" id="certCancel">취소</button>
                        <button class="btn btn-success btn-layerConfirm" id="certConfirm">확인</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/home/userModal.jsp" flush="true"/>