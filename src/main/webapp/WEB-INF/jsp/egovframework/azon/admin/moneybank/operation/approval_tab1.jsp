<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
let userNmSearch = "";
let firmNmSearch = "";
let userIdSearch = "";
let selectDivSearch = "";
let selectDocSearch = "";
let selectOrderBy = "";
	
$(document).ready(function(){
	$('#fromDate').val('${fromDate}');
	$('#toDate').val('${toDate}');
	
	approvalList(0);
	
	$('input[name="search"]').keyup(function(e){
		if(e.keyCode == 13){
			$('#currentPageNum').val('');
			approvalList(1);
		}
	});

	$('#searchBtn').click(function(){
		$('#currentPageNum').val('');
		approvalList(1);
	});
});

function approvalList(CURRENTPAGE){
    if(CURRENTPAGE !== 0){
        $('#currentPageNum').val(CURRENTPAGE);
        currentPageNum = $('#currentPageNum').val();
    }else if($('#currentPageNum').val() === ''){
        currentPageNum = $('#currentPageNum').val()+1;
    }else{
        currentPageNum = $('#currentPageNum').val();
    }
    userNmSearch = $('#userNmSearch').val();
    firmNmSearch = $('#firmNmSearch').val();
    userIdSearch = $('#userIdSearch').val();
    selectDivSearch = $('#selectDivSearch option:selected').val();
    selectDocSearch = $('#selectDocSearch option:selected').val();
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let selectOrderBy = $("#tableOrderBy option:selected").val();

    let currentPage = currentPageNum-1;
    let dataPerPage = 10;
    let dataCnt = currentPage * dataPerPage;

    let callUrl = '/admin/moneybank/approvallist';
    let callBackFunc = 'approvalListResponse';
    let objParam = {
        dataPerPage : dataPerPage
        , currentPage : currentPage
        , dataCnt : dataCnt
        , userNmSearch : userNmSearch
        , firmNmSearch : firmNmSearch
        , userIdSearch : userIdSearch
        , selectDivSearch : selectDivSearch
        , selectDocSearch : selectDocSearch
        , fromDate : fromDate
        , toDate : toDate +' 23:59:59'
        , selectOrderBy : selectOrderBy
    }
    cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function approvalListResponse(data){
	let count = data.approvalCount;
	let approvalList = data.approvalList;
	
	$('#approvalTotal').text(count.approvalTotal + ' 건');
	$('#waitCnt').text(count.waitCnt + ' 건');
	$('#completeCnt').text(count.completeCnt + ' 건');
	$('#acceptCnt').text(count.acceptCnt + ' 건');
	$('#rearrangeCnt').text(count.rearrangeCnt + ' 건');
	$('#refuseCnt').text(count.refuseCnt + ' 건');
	$('#refusePercent').text(count.refusePercent + ' %');
	
	if(approvalList.length > 0){
		let trHtml = '';
		
		$.each(approvalList, function(index, item) {

			if(item.periodMonth.length < 2){
				item.periodMonth = '0' + item.periodMonth;
			}

            let resultColor = (item.mb_status_name === '심사대기') ? 'sColorLS' : 'sColorG';
            let resultText = (item.mb_status_name === '심사대기') ? '대기' : '완료';

			trHtml += '<tr>';
			trHtml += '<td><div class="tIn"><span class="sBtn ' + item.color + ' rBtn">' + item.mb_status_name + '</span></div></td>';
			trHtml += '<td><div class="tIn">'+ item.mb_request_date +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.USER_NM +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.FIRM_NM +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.mb_product_code +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.periodYear + '/' + item.periodMonth +'</div></td>';
			trHtml += '<td><div class="tIn">'+ comma(item.mb_sales_amount) +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.prizm_score +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.prizm_accept +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.fee_rate +'</div></td>';
			trHtml += '<td><div class="tIn">'+ item.payment_rate +'</div></td>';
			trHtml += '<td><div class="tIn"><a href="javascript:approvalDetail(\'' + item.mbid + '\')" class="sBtn '+resultColor+' rBtn">'+resultText+'</a></div></td></tr>';
		});
		$('#fixTbody').empty().html(trHtml);
		
		let pageHtml = '';
		pageHtml += '<ul>';
		
		let pageMaxCnt = Math.ceil(approvalList[0].CNT/ data.dataPerPage);
		let dataPerPage = data.dataPerPage;
		let currentPage = data.currentPage;
		let pageCnt = Math.floor(currentPage / 10);
		
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ 
			if( i > pageMaxCnt) {
				break;
			}
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:approvalList(" + i + ');' + "'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:approvalList(" + i + ');' + "'>" + i + "</a></li>";
			}
		}
		
		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:approvalList(" + ((pageCnt+1)*10 + 1) + ')' + "'> > </a></li>";
		}
		pageHtml += "</ul>";
		$('#page').empty().html(pageHtml);
		$('#fixTable').doFixTable();
		$('#pagingButton').empty().html(pageHtml);
	
	}else {
		let trHtml = '<tr><td colspan="10">조회된 결과가 없습니다.</td></tr>'; 
		$('#fixTbody').empty().html(trHtml);
		$('#pagingButton').empty();
	}
}

function approvalDetail(mbid){
	let form= $('<form></form>');
	form.attr('name', 'detailForm');
	form.attr('method', 'get');
	form.attr('action', '/admin/moneybank/approvaldetail');
	form.append($("<input />", {type: "hidden", name: "mbid", value: mbid}));
	form.appendTo("body");
	form.submit();
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="/admin/moneybank/approval_tab1">심사 승인</a></li>
        <li><a href="/admin/moneybank/approval_tab2">계약 관리</a></li>
    </ul>
</div>

<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">회원명</span>
                <div class="input">
                    <input type="text" placeholder="회원명" id="userNmSearch" name="search">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회사명</span>
                <div class="input">
                    <input type="text" placeholder="회사명" id="firmNmSearch" name="search">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회원 ID</span>
                <div class="input">
                    <input type="text" placeholder="회원 ID" id="userIdSearch" name="search">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">서비스</span>
                <div class="input">
                    <select id="selectDivSearch" name="search">
                        <option value="" selected="selected" >전체</option>
                        <option value="MP">머니플러스</option>
                    </select>
                </div>
            </div>
        </li>
    </ul>
    <ul>
    	<li>
            <div class="fwBox">
                <span class="ft">승인상태</span>
                <div class="input">
                    <select id="selectDocSearch" name="search">
                        <option value="" selected>전체</option>
                        <option value="wait">대기</option>
                        <option value="accept">승인</option>
                        <option value="adjust">조정</option>
                        <option value="refuse">거부</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">신청일자</span>
                <div class="input">
                    <input type="text" class="startDatepicker" placeholder="시작일" id="fromDate" name="search" autocomplete='off' readonly>
                </div>
            ~
                <div class="input">
                    <input type="text" class="endDatepicker" placeholder="종료일" id="toDate" name="search" autocomplete='off' readonly>
                </div>
            </div>
      </li>
        <li>
            <div class="btns">
                <button class="sBtn sColorLB search" id="searchBtn">검색</button>
            </div>
        </li>
    </ul>
</div>

<div class="tableSet">
    <div class="m-options">
        <div class="pRight">
            <div class="fwBox">
                <span class="ft">보기기준</span>
                <div class="input">
                    <select id="tableOrderBy">
                        <option value="DESC">최근순</option>
                        <option value="ASC">과거순</option>
                    </select>
                </div>
            </div>
            <span class="btns">
				<a href="javascript:;" class="sBtn sColorLG excel">엑셀 다운로드</a>
			</span>
        </div>
    </div>
    <div id="fixTable" class="fixTable">
        <div class="overflowBox mCustomScrollbar">
            <table class="m-shadowTable">
                <thead>
                <tr>
                    <th>승인상태</th>
                    <th>신청일자</th>
                    <th>회원명</th>
                    <th>회사명</th>
                    <th>신청서비스</th>
                    <th>사업기간</th>
                    <th>월결제액(천원)</th>
                    <th>프리즘 점수</th>
                    <th class="w200" colspan="3" style="top: 0px;">
                        <p class="b-bt pb">프리즘 추천</p>
                        <span class="in-block txt-center fs-15 in-30p pt">승인</span>
                        <span class="in-block txt-center fs-15 in-30p pt">수수료</span>
                        <span class="in-block txt-center fs-15 in-30p pt">지급율</span>
                    </th>
                    <th>조건심사</th>
                </tr>
                </thead>
                <tbody id="fixTbody">
                </tbody>
            </table>
        </div>
        <div class="fixBottom">
            <ul class="tableTotal">
                <li><span class="txt">총 :</span><span class="result" id="approvalTotal"></span></li>
                <li><span class="txt">심사대기 :</span><span class="result" id="waitCnt"></span></li>
                <li><span class="txt">심사완료 :</span><span class="result" id="completeCnt"></span></li>
                <li><span class="txt">승인 :</span><span class="result" id="acceptCnt"></span></li>
                <li><span class="txt">조정 :</span><span class="result" id="rearrangeCnt"></span></li>
				<li><span class="txt">거부 :</span><span class="result" id="refuseCnt"></span></li>
                <li><span class="txt">거부율 :</span><span class="result" id="refusePercent"></span></li>
            </ul>
        </div>
    </div>
    <div id="pagingButton" class="m-paging"></div>
    <div style = "display:none">
        <input type="text" id="currentPageNum"/>
    </div>
</div>

