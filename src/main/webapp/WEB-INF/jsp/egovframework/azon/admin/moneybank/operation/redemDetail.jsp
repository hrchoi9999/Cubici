<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec" %>

<script>
let mbid = new URLSearchParams(location.search).get('mbid')
$(document).ready(function(){
    $('#toDate').attr('data-placeholder', '${todayDate}');
    $('#fromDate').attr('data-placeholder', '${fromDate}');
    
    getDetail(1);

    $('#searchBtn').on('click', function(){
        getDetail(1);
    });

    $('#eval').on('click', function(){
        modalOpen('evaluation');
        selectMenuList('EvalMBStatus');
        $('#evalBtn').attr('style','display');
        $('[id*="eval_"]').val('').attr('readonly', false);
        $('#EvalMBStatus option:eq(1)').prop('selected',true);
    });

    $('#expi_stop, #expi_late_payment').on('click', function (){
        updateStatus($(this).attr('id'));
    });

    $('.panBtn').on('click', function(){
        let id = this.dataset.id;
        $(this).parent().addClass('on');
        $('.panBtn').not(this).parent().removeClass();
        $('.m-paging').attr('style','display: none');
        $('div #'+id+'').removeClass().addClass('active');
        $('div [id*="Pan-"]').not($('div #'+id+'')).removeClass().addClass('d-none');
    });
});

function getDetail(pageNo) {
    let status = $('#status option:selected').val();
    let dataLimit = $('#dataLimit option:selected').val();
    let currentData =  dataLimit*(pageNo-1);
    let fromDate = $('#fromDate').val() == '' ? $('#fromDate').attr('data-placeholder') : $('#fromDate').val();
    let toDate = $('#toDate').val() == '' ? $('#toDate').attr('data-placeholder') : $('#toDate').val();
    let callUrl = '/admin/moneybank/redemdetail/list';
    let callBackFunc = 'getDetailResponse';
    let objParam = {
        mbid : mbid,
        fromDate : fromDate,
        toDate : toDate,
        status : status,
        current_data : currentData,
        data_limit : dataLimit,
        pageNo : pageNo
    };
    cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function getDetailResponse(data) {
    let resultSum = data.RedemDetailSum;
    let resultList = data.RedemDetailList;
    let trHtml = '';
    for (let i = 0; i < resultList.length; i++) {
        trHtml += '<tr>';
        trHtml += '<td>' + resultList[i].rownum + '</td>';
        trHtml += '<td>' + resultList[i].status + '</td>';
        trHtml += '<td>' + formatDate(resultList[i].calc_date) + '</td>';
        trHtml += '<td>' + comma(resultList[i].calculate_deposit_amount) + '</td>';
        trHtml += '<td>' + comma(resultList[i].deposit_amount) + '</td>';
        trHtml += '<td>' + comma(resultList[i].act_principal) + '</td>';
        trHtml += '<td>' + comma(resultList[i].usage_fee) + '</td>';
        trHtml += '<td>' + comma(resultList[i].remittance_fee) + '</td>';
        trHtml += '<td>' + resultList[i].balance_deposit_date + '</td>';
        trHtml += '<td>' + comma(resultList[i].balance_remittance_amount) + '</td>';
        trHtml += '<td>' + comma(resultList[i].cal_balance) + '</td>';
        trHtml += '</tr>';
    }
    $('#tbody').html(trHtml);

    let pageMaxCnt = resultSum.total / data.dataLimit;
    let currentPage = data.currentPage - 1;
    let pageCnt = Math.floor(currentPage / 10);
    let method = 'getDetail';

    pagingBtn(pageMaxCnt,currentPage,pageCnt,method);
}

function findPmsDetail() {
    let objParam = {
        mbid : mbid
    };
    let callUrl = '/admin/moneybank/redemdetail/pms';
    let callBackFunc = 'findPmsDetailResponse';
    cubici.Ajax.fnRequest(objParam,callUrl,callBackFunc);
}

function findPmsDetailResponse(result) {
    let pmsCoreRiskList = result.pmsCoreRiskList;
    let pmsResultDetailList = result.pmsResultDetailList;

    $('#inputDate1').text(pmsCoreRiskList[1].INPUT_DATE);
    $('#inputDate2').text(pmsCoreRiskList[2].INPUT_DATE);
    $('#totalResult').text(pmsResultDetailList[0].PMS_GRADE);
    $('#date').text('(' + pmsResultDetailList[0].BIWEEK_DATE + '~' + pmsResultDetailList[0].INPUT_DATE + ')');

    for (let i = 0; i<pmsCoreRiskList.length; i++){
        $('#pmsCoreRisk1 div:eq(' + i + ')').text(pmsCoreRiskList[i].BAD);
        $('#pmsCoreRisk1 td:eq(' + i + ')').addClass(pmsCoreRiskList[i].BAD_CLASS);
        $('#pmsCoreRisk2 div:eq(' + i + ')').text(pmsCoreRiskList[i].BRA);
        $('#pmsCoreRisk2 td:eq(' + i + ')').addClass(pmsCoreRiskList[i].BRA_CLASS);
    }
    for (let i = 0; i<pmsResultDetailList.length; i++) {
        $('#salesResult' + (i+1)).addClass(pmsResultDetailList[i].SALES_CLASS_NM);
        $('#salesResult' + (i+1) + ' div').text(pmsResultDetailList[i].SALES_TOTAL_SCORE);
        $('#manageResult' + (i+1)).addClass(pmsResultDetailList[i].MANAGE_CLASS_NM);
        $('#manageResult' + (i+1) + ' div').text(pmsResultDetailList[i].MANAGE_TOTAL_SCORE);
    }
}

function getEvalList(pageNo){
    let data_limit = 10;
    let objParam = {
        mbid : mbid,
        pageNo : pageNo,
        data_limit : data_limit,
        current_data : data_limit*(pageNo-1)
    };
    let callUrl = '/admin/moneybank/redemdetail/eval-list';
    let callBackFunc = 'evalListResponse';
    cubici.Ajax.fnRequest(objParam,callUrl,callBackFunc);
}

function evalListResponse(data){
    let evalInfoList = data.evalInfoList;
    let htmlTbody = '';
    for(let i = 0; i < evalInfoList.length; i++){
        htmlTbody += '<tr onclick=evalDetail('+ evalInfoList[i].eval_no +')>';
        htmlTbody += '<input id="eval_no" type="hidden" value='+ evalInfoList[i].eval_no +'>';
        htmlTbody += '<td><div class="tIn">' + evalInfoList[i].rn + '</div></td>';
        htmlTbody += '<td><div class="tIn">' + evalInfoList[i].input_date + '</div></td>';
        htmlTbody += '<td><div class="tIn">' + evalInfoList[i].reviewer + '</div></td>';
        htmlTbody += '<td><div class="tIn">' + evalInfoList[i].eval_subject + '</div></td>';
        htmlTbody += '<td><div class="tIn">' + evalInfoList[i].title + '</div></td>';
        htmlTbody += '</tr>';
    }
    $('#mbTbody').html(htmlTbody);

    let pageMaxCnt = data.total / 10;
    let currentPage = data.currentPage - 1;
    let pageCnt = Math.floor(currentPage / 10);
    let method = 'getEvalList';
    pagingBtn(pageMaxCnt,currentPage,pageCnt,method);
}
function pagingBtn(pageMaxCnt,currentPage,pageCnt,method){
    let trHtml = '<div class="m-paging">';
    trHtml += '<ul>';
    if (pageMaxCnt < 10) {
        for (let i = 1; i <= Math.ceil(pageMaxCnt); i++) {
            trHtml += '<li><a class="num" href = "javascript:;" onclick='+ method +'(' + i + ');>' + i + '</a></li>';
        }
    } else if (pageMaxCnt >= 10) {
        if (pageCnt > 0) { // 이전
            trHtml += '<li><a class="oiBtn prev" href = "javascript:;" onclick='+ method +'(' + ((pageCnt) * 10) + ');></a></li>';
        }
        for (let i = (pageCnt * 10) + 1; i <= (pageCnt * 10) + 10; i++) {
            if (i > Math.ceil(pageMaxCnt)) {
                break;
            }
            trHtml += '<li><a class="num" href ="javascript:;" onclick='+ method +'(' + i + ');>' + i + '</a></li>';
        }
        if (Math.floor(pageMaxCnt) > (pageCnt * 10) + 10) {
            trHtml += '<li><a class="oiBtn next" href = "javascript:;" onclick='+ method +'(' + ((pageCnt + 1) * 10 + 1) + ');></a></li>';
        }
    }
    trHtml += '</ul>';
    $('.m-paging').remove();
    $('.c-boardSet').before(trHtml);
    $('.num:eq("' + currentPage % 10 + '")').addClass('active');
}

function evalDetail(eval_no){
    let objParam = {eval_no : eval_no};
    let callUrl = '/admin/moneybank/redemdetail/eval-detail';
    let callBackFunc = 'evalDetailResponse';
    cubici.Ajax.fnRequest(objParam,callUrl,callBackFunc);
}

function evalDetailResponse(data){
    let evalInfo = data.evalInfo;
    modalOpen('evaluation');
    selectMenuList('EvalMBStatus');
    $('#evalBtn').attr('style','display:none');
    $('#eval_title').val(evalInfo.title).attr('readonly', true);
    $('#eval_detail').val(evalInfo.detail).attr('readonly', true);
    $('#EvalMBStatus').html('<option>'+ convertEvalCode(evalInfo.eval_subject) +'</option>');
}

function convertEvalCode(code){
    let result = '';
    switch (code){
        case '01': result = '신청'; break;
        case '02': result = '서류'; break;
        case '03': result = '심사'; break;
        case '06': result = '계약'; break;
        case '07': result = '상환'; break;
        case '71': result = '해지'; break;
    };
    return result;
}

function modalValid(){
    if(!$('#eval_title').val()) {
        modalInfo('제목을 입력해주세요');
        return;
    }else if(!$('#eval_detail').val()){
        modalInfo('평가 내용을 입력해주세요');
        return;
    }else if(!$('#EvalMBStatus').val()){
        modalInfo('구분값을 선택해주세요');
        return;
    };
    evalEnroll();
}

function evalEnroll(){
    let objParam = {
        eval_subject: $('#EvalMBStatus option:selected').val(),
        reviewer: $('#admin_nm').val(),
        title: $('#eval_title').val(),
        detail: $('#eval_detail').val(),
        mbid: mbid
    };
    let callUrl = '/admin/moneybank/redemdetail/eval-enroll';
    let callBackFunc = 'evalEnrollResponse';
    cubici.Ajax.fnRequest(objParam,callUrl,callBackFunc);
}

function evalEnrollResponse(data){
    if(data.resultCode === 0){
        getEvalList(1);
        $('.modalClose').click();
    };
}

function updateStatus(idVal){
    let objParam = {
        mbid : mbid,
        status : idVal
    };
    let callUrl = '/admin/moneybank/redemdetail/update/status';
    let callBackFunc = 'updateStatusResponse';
    cubici.Ajax.fnRequest(objParam,callUrl,callBackFunc);
}

function updateStatusResponse(data){
    modalInfo(data.msg);
    location.href= '/admin/moneybank/redemdetail?mbid=${redemInfo.mbid}';
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="javascript:;">프리즘 상세내역</a></li>
    </ul>
</div>
<div class="contentGrid">
    <div class="inner">
        <div class="conArticle">
            <div class="bg-fff">
                <div class="contentGrid">
                    <div class="">
                        <div class="conArticle modal">
                            <header class="admin-header">
                                <div class="m-options">
                                    <h3>기본정보</h3>
                                    <div class="pRight">
                                        <span class="baseDate pRight"><b>작성 기준일</b>${todayDate}</span>
                                    </div>
                                </div>
                            </header>
                            <div class="m-search">
                                <ul>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">대표자</span>
                                            <div class="input">
                                                <input type="text" id="user_nm" value="${redemInfo.USER_NM}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">회원ID</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.USER_ID}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">최초가입</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.mb_approval_date}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">상호</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.FIRM_NM}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">사업자번호</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.FIRM_ID}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">연락처</span>
                                            <div class="input">
                                                <input type="text" placeholder="핸드폰" value="${redemInfo.USER_PHONE}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">사업구분</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.BUSINESS_TYPE}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">취급상품</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.SECTORS}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">설립연도</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.FIRM_SETUP_DATE}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul>
                                    <li class="col-0d32">
                                        <div class="fwBox">
                                            <span class="ft">본사주소</span>
                                            <div class="input">
                                                <input type="text" placeholder="우편번호" value="${redemInfo.FIRM_ZIP_CODE}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <div class="input">
                                                <input type="text" placeholder="주소" value="${redemInfo.FIRM_ADDR}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">주거래통장</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.main_acc}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">상환계좌</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.demand_acc}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="conArticle modal">
                            <header class="admin-header">
                                <div class="m-options">
                                    <h3>상품 정보</h3>
                                </div>
                            </header>
                            <div class="m-search">
                                <ul>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">서비스</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.mb_product_code}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">계약일자</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.mb_contract_date}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">만료일자</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.mb_contract_expire_date}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft">해지일</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.mb_termi_date}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft-w">이용 수수료(%)</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.fee_rate}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft-w">지급비율(%)</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.payment_rate}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft-w">송금 수수료</span>
                                            <div class="input">
                                                <input type="text" value="${redemInfo.fee_rate}" readonly>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="fwBox">
                                            <span class="ft-w">건당한도(원)</span>
                                            <div class="input">
                                                <input type="text" value="<fmt:formatNumber value="${redemInfo.sales_limit_per_case}" pattern="#,###" />" readonly>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="conArticle modal">
                            <div class="table-tab">
                                <ul>
                                    <li class="on"><a class="panBtn" onclick="getDetail(1)" data-id="Pan-00">상환상세</a></li>
                                    <li><a class="panBtn" onclick="findPmsDetail()" data-id="Pan-01">PMS</a></li>
                                    <li><a class="panBtn" onclick="getEvalList(1)" id="eval_tab" data-id="Pan-02">평가</a></li>
                                </ul>
                            </div>
                            <div class="panel">
                                <jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/moneybank/operation/redemTabDetail.jsp" flush="true" />
                                <jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/moneybank/operation/pmsDetail.jsp" flush="true" />
                                <jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/moneybank/operation/evalDetail.jsp" flush="true" />
                            </div>
                            <div class="c-boardSet">
                                <div class="button-box">
                                    <a type="button" class="bBtn2 sColorLG listBtn" id="list" href="/admin/moneybank/redemption">목록</a>
                                    <c:set var="status" value="${redemInfo.mb_status}"/>
                                    <c:if test="${status == '71'}">
                                        <a type="button" class="bBtn2 sColorN listBtn" id="expi_stop">본인해지</a>
                                    </c:if>
                                    <c:if test="${status == '06' || status == '62' || status == '63' || status == '71'}">
                                        <a type="button" class="bBtn2 sColorN listBtn" id="expi_late_payment">강제해지</a>
                                    </c:if>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>