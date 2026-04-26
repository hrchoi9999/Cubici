<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>

<script>

    var userPhone = "${userInfo.user_phone}";
    var sendSmsResult = false;  // 저장하기 할 때 사용

    $(document).ready(function(){

        $('#firmId').val(numSorting('firmId', '${userInfo.firm_id}'));
        $('#userPhone').val(numSorting('userPhone', '${userInfo.user_phone}'));
        $('#firmSetUpDate').val("${userInfo.firm_setup_date}");

        //쇼핑몰 셀렉트 박스 옵션
        let selectShopList = $("#shopList").attr("id");
        selectMenuList(selectShopList);

        // 휴대폰번호 수정
        $("#userPhone").on("propertychange change keyup paste input", function() {
            var currentVal = $(this).val();
            if(currentVal == userPhone) {
                return;
            }
            currentVal = userPhone;
            $('#mobileAuthNoCheck').css("background-color","#179aff");
            $('#mobileAuthNoCheck').text("확인");
            sendSmsResult = false;
        });

        // 인증 번호 확인
        $("#mobileAuthNoCheck").on("click", function() {
            let mobileAuthNo = $('#mobileAuthNo').val(); // 입력받은 인증 값
            if(mobileAuthNo <= 0){
                modalInfo("인증번호를 입력해주세요.");
                return false;
            }
            if(getAuthNum("sms", userPhone, mobileAuthNo) == "PASS") {
                $('#mobileAuthNoCheck').css("background-color","#999");
                $('#mobileAuthNoCheck').text("인증완료");
                sendSmsResult = true;
            }else{
                modalInfo("인증번호가 일치하지 않습니다.");
                return false;
            }
        });

        //쇼핑몰 추가
        $("#mp_addRow").on("click", function() {
            let shop = $("#shopList option:selected").val();
            if(validationCheck()) {
                if(shop == '1') { modalOpen("interparkApiInputModal"); }
                else if(shop == '2') { modalOpen("gmarketApiInputModal"); }
                else if(shop == '3') { modalOpen("auctionApiInputModal"); }
                else if(shop == '4') { modalOpen("street11ApiInputModal"); }
                else if(shop == '11') { modalOpen("coupangApiInputModal"); }
                else if(shop == '14') { modalOpen("naverApiInputModal"); }
            };
            $('[id*="_api"]').val('');
        });

        //취소
        $('#cancelBtn').on('click', function(){

            modalCancel('회원정보 수정을 취소하시겠습니까?');

            $("#confirm_btn").one("click", function() {
                window.document.location.href="/";
            });

        });

        //저장하기
        $('#saveBtn').on('click', function(){
            if(sendSmsResult == true){ //문자 수정
                saveInfo();
            }else{ // 문자 수정 x
                if($('#userPhone').val().replace(/-/gi,"") == "${userInfo.user_phone}"){
                    saveInfo();
                } else {
                    modalInfo("문자 인증을 진행해 주세요");
                    return false;
                }
            }
        });
    });

    //sms
    function sendSmsAuth(){
        userPhone = $('#userPhone').val().replaceAll("-","");
        let uri = "/smsAuth";
        let objParam = {FLAG: "signUpSms", USER_PHONE: userPhone};
        sendAuthCode(uri, objParam);
    }

    // 쇼핑몰 추가시 데이터 체크
    function validationCheck() {
        // 소핑몰선택
        let shopType = $("#shopList").val();
        if(shopType == null || shopType == "") {
            modalInfo("쇼핑몰을 선택해 주세요.");
            $("#shopList").focus();
            return false;
        }

        //쇼핑몰 아이디
        let shopId = $("#mp_shopId").val();
        if(shopId == null || shopId == "") {
            modalInfo("쇼핑몰 아이디를 입력해주세요.");
            $("#mp_shopId").focus();
            return false;
        }
        return true;
    }

    function saveInfo(){
        $(".loadingSpinner").css({"display" : "inline-block"});
        let shopList = new Array();

        $("#shopTbody tr").each(function (index, item) {	// 삭제, 수정 > 업데이트
            index++;
            shopData = {
                SHOP_TYPE : $('#shop_'+index).val(),
                SHOP_ID : $('#shopId_'+index).val(),
                VENDOR_ID : $('#vendorId_'+index).val(),
                API_KEY : $('#accessKey_'+index).val(),
                API_SECRET_KEY : $('#secretKey_'+index).val(),
                DEL_YN : $('#delYN_'+index).val()
            }
            shopList.push(shopData);
        });

        let objParam = {
            //기본정보
            USER_PHONE : userPhone.replace(/-/gi,""),
            FIRM_ADDR : $('#mp_roadFullAddr').val(),
            FIRM_ZIP_CODE : $('#mp_zipCode').val(),
            //쇼핑몰 list
            SHOPLIST : shopList
        };
        let callUrl = '/cubici/mypage/companyInfo/update';
        let callBackFunc = 'saveInfoResponse';
        cubici.Ajax.fnRequest(objParam,callUrl,callBackFunc);
    }

    function saveInfoResponse(data){
        // 로딩바 해제
        $(".loadingSpinner").css({"display" : "none"});

        if (data.resultCode != "0") {
            modalInfo("회원 정보 수정이 실패하였습니다.\n관리자에게 문의해주세요.");
            return;
        } else if (data.resultCode =='0') {
            modalInfo('회원 정보 수정이 완료 되었습니다.');
            location.reload();
        } else {
            console.log("ErrorCode ::: " + data.resultCode);
            let modiNonPass = confirm("전송 장애가 있었습니다. 관리자에게 문의해주세요.");
            if(modiNonPass==true){
                window.document.location.href="/";
                location.reload();
            }
        }
    }

    //새로운 row 추가
    function addRow() {
        let shopType = $('#shopList').val();
        let shopId = $('#mp_shopId').val();
        let shopFlag = setInputId(shopType);
        let shopName = $('#shopList option:selected').text();
        let vendorId = $('#'+ shopFlag +'_apiVendorId').val();
        let accessKey = $('#'+ shopFlag +'_apiAccessKey').val();
        let secretKey = $('#'+ shopFlag +'_apiSecretKey').val();

        let rowCount = 0;
        $("#shopTbody tr").each(function (i, item) {
            if($(item).css('display') == "table-row") rowCount++;
        });
        let cnt = rowCount + 1 ;
        let trHtml = '';
        trHtml = "<tr>";
        trHtml += "<input type='hidden' id='delYN_" + cnt + "' value='N'>";
        trHtml += "<input type='hidden' id='newDelYN_" + cnt + "' value='N'>";
        trHtml += "<input type='hidden' id='vendorId_" + cnt + "' value = '" + vendorId + "'>";
        trHtml += "<input type='hidden' id='accessKey_" + cnt + "' value='" + accessKey + "'>";
        trHtml += "<input type='hidden' id='secretKey_" + cnt + "' value='" + secretKey + "'>";
        trHtml += "<input type='hidden' id='shop_" + cnt + "' value=" + shopType + ">";
        trHtml += "<input type='hidden' id='shopId_" + cnt + "' value=" + shopId + ">";
        trHtml += "<td><div class='tIn'>" + shopName + "</div></td>";
        trHtml += "<td><div class='tIn'>" + shopId + "</div></td>";
        trHtml += "<td><div class='tIn'><i class='oiBtn fail'></i></div></td>";
        trHtml += "<td><div class='tIn'><span class='lBtn sColorN rBtn mLong'>연결중</span></div></td>";
        trHtml += "<td><div class='tIn'><a href='javascript:;' onclick='deleteRow(" + cnt + ");' class='lBtn rBtn sColorG'>삭제</a></div></td>";
        trHtml += "</tr>";

        $('#shopTbody').append(trHtml);
        $('input[id*=_api]').val('');
    }

    function setInputId(shopType){
        let shopFlag = "";
        if (shopType === "1") { shopFlag = "i" }
        else if (shopType === "2") { shopFlag = "g" }
        else if (shopType === "3") { shopFlag = "a" }
        else if (shopType === "4") { shopFlag = "s" }
        else if (shopType === "11") { shopFlag = "c" }
        else if (shopType === "14") { shopFlag = "n" }
        return shopFlag;
    }

    function deleteRow(cnt){
        // 화면에 보이는 row 개수
        let rowCount = 0;
        $("#shopTbody tr").each(function(i, item) {
            if($(item).css('display') == "table-row"){
                rowCount++;
            }
        });
        if(rowCount <= 1){
            modalInfo('쇼핑몰은 1개 이상 등록해야 합니다');
            return false;
        }
        modalCancel('정말 삭제하시겠습니까?');

        $("#confirm_btn").one("click", function() {
            $("#delYN_"+cnt).parent().css("display","none");
            $("#delYN_"+cnt).val('Y');  //delYN > Y 로 업데이트
        });
    }

    function numSorting(type, num){
        let result;
        if(type === "firmId"){ // 사업자번호
            result = num.substr(0,3) + "-" + num.substr(3,2) + "-" + num.substr(5);
            return result;
        } else if (type === "firmTel" || type === "firmFax" || type === "userPhone") {
            if(num.substr(0,2) === "02"){ //서울
                if(num.substr(2).length === 7){ //02 제외 7자리
                    result = num.substr(0, 2) + "-" + num.substr(2, 3) + "-" + num.substr(5);
                }else if(num.substr(2).length === 8){
                    result = num.substr(0, 2) + "-" + num.substr(2, 4) + "-" + num.substr(6);
                }
            } else { //서울 이외
                if(num.substr(3).length === 7){ //국번 제외 7자리
                    result = num.substr(0, 3) + "-" + num.substr(3, 3) + "-" + num.substr(6);
                }else if(num.substr(3).length === 8){ //국번 제외 8자리, 인터넷전화
                    result = num.substr(0, 3) + "-" + num.substr(3, 4) + "-" + num.substr(7);
                }
            }
            return result;
        } else if(type === "firmSetUpDate"){
            result = num.substr(0,4) + "-" + num.substr(4,2) + "-" + num.substr(6);
            return result;
        }
    }

    function modalCancel(text){

        let modalButton=""; // 모달 버튼 띄우기

        modalButton += '<li style="display:none"><a id="modalOpenButton" href="javascript:;" class="modalOpen sBtn rBtn sColorN" data-modal="modal-cancel"></a></li>';

        // body 뒷 부분에 html 태그 삽입
        $('body').append(modalButton);

        // 클릭이벤트 재설정
        $('.modalOpen').on('click', modalOpen);

        // 모달창에 text 삽입
        $('#CommonModal3').text(text);

        $('#modalOpenButton').trigger('click', modalOpen); // 클릭 이벤트 강제 실행
        $('#modalOpenButton').parent().remove(); // 이벤트 마지막 버튼 삭제
    }

</script>
<div class="m-tab">
    <ul>
        <li class="active"><a href="/cubici/mypage/companyInfo">회사정보</a></li>
        <li><a href="/cubici/mypage/businessInfo">사업정보</a></li>
    </ul>
</div>

<article class="subBox">
    <div class="contentArea">
        <div class="m-modalGrid">
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">회사명</span>
                        <div class="input">
                            <input id="comFirmNm" type="text" value="${userInfo.firm_nm}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">아이디</span>
                        <div class="input">
                            <input id="comUserId" type="text" value="${userInfo.user_id}" readonly>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">대표자명</span>
                        <div class="input">
                            <input id="comUserNm" type="text" value="${userInfo.user_nm}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">사업자 번호</span>
                        <div class="input">
                            <input id="firmId" type="text" value="${userInfo.firm_id}" readonly>
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li>
                    <div class="fwBox">
                        <span class="ft">설립일자</span>
                        <div class="input">
                            <input id="firmSetUpDate" type="text" value="${userInfo.firm_setup_date}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">사업자 유형</span>
                        <div class="input">
                            <input id="comBizType" type="text" value="${userInfo.business_type}" readonly>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="fwBox">
                        <span class="ft">주요 판매품목</span>
                        <div class="input">
                            <input id="comSectors" type="text" value="${userInfo.sectors}" readonly>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <div class="contentArea">
        <div class="m-modalGrid">
            <ul class="item">
                <li class="col-1 btn">
                    <div class="fwBox">
                        <span class="ft">등록 핸드폰 변경</span>
                        <div class="input">
                            <input id="userPhone" type="text" value="${userInfo.user_phone}">
                        </div>
                    </div>
                    <div class="fwBtn">
                        <a href="javascript:;" id="mobileAuthNoBtn" class="sBtn sColorLB" onclick="sendSmsAuth();">인증요청</a>
                    </div>
                </li>
                <li class="col-1 btn">
                    <div class="fwBox">
                        <div class="input">
                            <input id="mobileAuthNo" type="text" placeholder="인증번호 요청">
                        </div>
                    </div>
                    <div class="fwBtn">
                        <a href="javascript:;" id="mobileAuthNoCheck" class="sBtn sColorLB">확인</a>
                    </div>
                </li>
            </ul>
            <ul class="item">
                <li class="col-1 btn">
                    <div class="fwBox">
                        <span class="ft">주소 변경</span>
                        <div class="input">
                            <input type="text" id="mp_zipCode" class="zipCode" value="${userInfo.firm_zip_code}" readonly>
                        </div>
                    </div>
                    <div class="fwBtn" style="padding:0px 5px;">
                        <button id="addrSearch" class="sBtn sColorLB search" style="font-size:12px;">찾기</button>
                    </div>
                </li>
                <li class="col-2">
                    <div class="fwBox">
                        <div class="input">
                            <input type="text" placeholder="주소" id="mp_roadFullAddr" class="roadFullAddr" value="${userInfo.firm_addr}" >
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>쇼핑몰 추가 등록</h4>
        <ul class="btns">
            <li class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn white">정보</a>
                <div class="infoMemo">
                    <div class="iCon">
                        <p>
                            사업자등록증 번호 기준 등록가능 최대 아이디는
                            옥션 5개, 11번가 및 지마켓 3개, 기타 쇼핑몰은
                            각각 1개씩으로 제한됩니다.
                        </p>
                    </div>
                </div>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="m-modalGrid">
            <ul class="item item-header">
                <li class="col-1">추가 쇼핑몰</li>
                <li class="col-1">쇼핑몰 ID</li>
                <li class="col-1"></li>
            </ul>
            <ul class="item tac">
                <li class="col-1">
                    <div class="fwBox">
                        <div class="input">
                            <select id="shopList">
                                <option value="">선택</option>
                            </select>
                        </div>
                    </div>
                </li>
                <li class="col-1">
                    <div class="fwBox">
                        <div class="input">
                            <input id="mp_shopId" type="text" placeholder="입력">
                        </div>
                    </div>
                </li>
                <li class="col-1">
                    <a href="javascript:;" id="mp_addRow" class="sBtn sColorLB wBtn">등록</a>
                </li>
            </ul>

        </div>
    </div>
</article>

<article class="subBox transparent">
    <header>
        <h4>쇼핑몰 정보</h4>
    </header>
    <div class="contentArea">
        <div class="mArticleArea">
            <div class="maxHeight long">
                <table class="m-shadowTable">
                    <thead>
                    <tr>
                        <th>운영 쇼핑몰</th>
                        <th>쇼핑몰  ID</th>
                        <th>선정산대상</th>
                        <th>API 연결</th>
                        <th>정보수정</th>
                    </tr>
                    </thead>
                    <tbody id="shopTbody">
                    <c:forEach items="${userShopList}" var="shop" varStatus="st">
                        <tr>
                            <input type="hidden" id="delYN_${st.count}" value="${shop.DEL_YN}">
                            <input type="hidden" id="modiYN_${st.count}" value="N">
                            <input type="hidden" id="vendorId_${st.count}" value="${shop.VENDOR_ID }">
                            <input type="hidden" id="accessKey_${st.count}" value="${shop.API_KEY}">
                            <input type="hidden" id="secretKey_${st.count}" value="${shop.API_SECRET_KEY}">
                            <input type="hidden" id="shop_${st.count}" value="${shop.SHOP_TYPE}">
                            <input type="hidden" id="shopId_${st.count}" value="${shop.SHOP_ID}">
                            <td><div class="tIn">${shop.SHOP_NM}</div></td>
                            <td><div class="tIn">${shop.SHOP_ID}</div></td>
                            <td><div class='tIn'><i class='oiBtn fail'></i></div></td>
                            <td><div class='tIn'><span class='lBtn sColorN rBtn mLong'>연결중</span></div></td>
                            <td><div class='tIn'><a href='javascript:;' id='btnDel_${st.count}' onclick='deleteRow(${st.count})' class="lBtn rBtn sColorG">삭제</a></div></td>
                        </tr>
                    </c:forEach>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</article>

<div class="subContentsBtns">
    <a href="javascript:;" id="cancelBtn" class="mBtn sColorN">취소</a>
    <a href="javascript:;" id="saveBtn" class="mBtn sColorLB">수정 확인</a>
</div>

<div class="modal-container alert pass" id="info-change">
    <div class="modal-wrapper">
        <header>
            <h2>마이페이지 접속안내</h2>
            <a href="javascript:;" id="authClose" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner auto mArticleArea">
                <article class="noticeTxt">
                    회원님의 소중한 정보보호을 위해<br>
                    인증	번호 입력이 필요합니다.<br>
                    아래 “인증번호 받기”를 클릭하시면<br>
                    등록하신 핸드폰으로 인증번호를 보내드립니다.
                </article>
                <article>
                    <div class="formMaxWrap2">
                        <div class="middleBtnArea">
                            <a href="javascript:;" id="authBtn" class="wBtn mBtn imgBtn tColorN">인증번호 받기</a>
                        </div>
                    </div>
                </article>
                <article class="m-modalGrid">
                    <p class="noticeTxt">전달받으신 인증번호를 입력해 주십시오.</p>
                    <div class="formMaxWrap2">
                        <ul class="item">
                            <li class="btn">
                                <div class="fwBox col-2">
                                    <div class="input">
                                        <input type="text" id="authNum" placeholder="인증번호 입력">
                                    </div>
                                </div>
                                <div class="fwBtn col-1">
                                    <a href="javascript:;" id="confirmAuth" class="sBtn sColorLS2">확인</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <p class="noticeTxt">감사합니다.</p>
                </article>

                <div class="btnArea">
                    <a href="javascript:;" id="authConfirm" class="modalClose mBtn sColorLS2">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 취소 버튼 있는 모달 -->
<div class="modal-container alert alert-pass" id="modal-cancel">
    <div class="modal-wrapper">
        <header><h2>서비스 안내</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="alert-content">
            <div class="alert-txt">
                <div id="CommonModal3" class="txtBox" style="text-align: center; padding:0">
                </div>
            </div>
            <div class="btnArea">
                <a href="javascript:;" class="modalClose sBtn sColorLS2" id="confirm_btn">확인</a>
                <a href="javascript:;" class="modalClose sBtn sColorLS2">취소</a>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/WEB-INF/jsp/egovframework/azon/cubici/myPage/shopApiModal.jsp" flush="true"/>