<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
let TheadArray = [];

let userNmSearch = "";
let firmNmSearch = "";
let repNmSearch = "";
let selectDivSearch = "";
let selectDocSearch = "";

let selectOrderBy = "";

$(document).ready(function(){
	$('#fromDate').val('${fromDate}');
	$('#toDate').val('${toDate}');

	contractList(0);

	$('input[name="search"]').keyup(function(e){
		if(e.keyCode == 13){
			$('#currentPageNum').val('');
			contractList(1);
		}
	});

	$('#searchBtn').click(function(){
		$('#currentPageNum').val('');
		contractList(1);
	});

	$(document).on('click', "#optionBtn", function(){
		let currentPageNum = $('#currentPageNum').val();
		contractList(currentPageNum);
	});
});

function contractList(CURRENTPAGE){
	if(CURRENTPAGE != 0){
		$('#currentPageNum').val(CURRENTPAGE);
		currentPageNum = $('#currentPageNum').val();
	}else if($('#currentPageNum').val() == ''){
		currentPageNum = $('#currentPageNum').val()+1;
	}else{
		currentPageNum = $('#currentPageNum').val();
	}

	TheadArray.length = 0;
	$(".columnCheck").each(function(){
		if(this.checked){
			let theadStr = $(this).parent().find("span").text();
			TheadArray.push(theadStr.slice(0,theadStr.length));
		}else{
			TheadArray.push(false);
		}
	});
	TheadArray.push("계약내역");

	userNmSearch = $('#userNmSearch').val();
	firmNmSearch = $('#firmNmSearch').val();
	repNmSearch = $('#repNmSearch').val();
	selectDivSearch = $('#selectDivSearch option:selected').val();
	selectDocSearch = $('#selectDocSearch option:selected').val();
	let fromDate = $('#fromDate').val();
	let toDate = $('#toDate').val();
	let selectOrderBy = $("#tableOrderBy option:selected").val();

	let currentPage = currentPageNum-1;
	let dataPerPage = 10;
	let dataCnt = currentPage * dataPerPage;

	let callUrl = '/admin/moneybank/contractlist';
	let callBackFunc = 'contractListResponse';
	let objParam = {
			dataPerPage : dataPerPage
		  , currentPage : currentPage
		  , dataCnt : dataCnt
		  , userNmSearch : userNmSearch
		  , firmNmSearch : firmNmSearch
		  , repNmSearch : repNmSearch
		  , selectDivSearch : selectDivSearch
		  , selectDocSearch : selectDocSearch
		  , fromDate : fromDate
		  , toDate : toDate +' 23:59:59'
		  , selectOrderBy : selectOrderBy
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function contractListResponse(data){
	let count = data.contractCount;
	let contractList = data.contractList;

	if(contractList.length > 0 ){
		let trHtml = '';
		$.each(contractList, function(i, item) {

			trHtml += '<tr>';
			trHtml += '<td><div class="tIn"><span class="sBtn ' + item.color + ' rBtn">' + item.mb_status_name + '</span><div></td>';
			trHtml += '<td><div class="tIn">' + item.mb_approval_date + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.USER_NM + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.FIRM_NM + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.mb_product_code + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.request_shop + '</div></td>';
			trHtml += '<td><div class="tIn">' + comma(item.pcs_score) + '</div></td>';
			trHtml += '<td><div class="tIn">' + comma(item.mb_sales_amount) + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.fee_rate + '</div></td>';
			trHtml += '<td><div class="tIn">' + item.payment_rate + '</div></td>';
			if(item.mb_contract_date == '-' && item.mb_status_name != '계좌대기') {
				trHtml += '<td><div class="tIn"><a href="javascript:makeContract(\'' + item.mbid + '\')" class="sBtn sColorLS rBtn">체결</a></div></td>';
			} else {
				trHtml += '<td><div class="tIn">' + item.mb_contract_date + '</div></td>';
			}
			trHtml += '<td><div class="tIn"><a href="javascript:approvalDetail(\'' + item.mbid + '\')" class="sBtn sColorLS rBtn">보기</a></div></td>';
			trHtml += '</tr>';

		});
		$('#fixTbody').empty().html(trHtml);

		let pageHtml = '';
		pageHtml += '<ul>';

		let pageMaxCnt = Math.ceil(contractList[0].CNT/ data.dataPerPage);
		let dataPerPage = data.dataPerPage;
		let currentPage = data.currentPage;
		let pageCnt = Math.floor(currentPage / 10);

		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){
			if( i > pageMaxCnt) {
				break;
			}
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:contractList(" + i + ');' + "'>" + i + "</a></li>";
			}else{
				pageHtml += "<li><a class='num' href = 'javascript:contractList(" + i + ');' + "'>" + i + "</a></li>";
			}
		}

		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:contractList(" + ((pageCnt+1)*10 + 1) + ')' + "'> > </a></li>";
		}
		pageHtml += "</ul>";
		$('#page').empty().html(pageHtml);
		$('#fixTable').doFixTable();
		$('#pagingButton').empty().html(pageHtml);

		$("span.result:eq(0)").text(comma(count.contractTotal) + " 건")
		$("span.result:eq(1)").text(comma(count.acceptCnt) + " 건")
		$("span.result:eq(2)").text(comma(count.contractCnt) + " 건")
		$("span.result:eq(3)").text(comma(count.endCnt) + " 건")

	} else {
		let trHtml = '<tr><td colspan="10">조회된 결과가 없습니다.</td></tr>';
		$('#fixTbody').empty().html(trHtml);
		$('#pagingButton').empty();
	}

	$(".loadingSpinner").css({"display" : "none"});
}

function approvalDetail(mbid){
	let form= $('<form></form>');
	form.attr('name', 'detailForm');
	form.attr('method', 'get');
	form.attr('action', '/admin/moneybank/approvaldetail');
	form.append($('<input />', {type: 'hidden', name: 'mbid', value: mbid}));
	form.appendTo('body');
	form.submit();
}

function makeContract(mbid){
	let callUrl = "/admin/moneybank/makeContract";
	let callBackFunc = "contractResponse";
	let objParam = { mbid : mbid }
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function contractResponse(result) {
	if (result.description) {
		modalInfo(result.description);
	} else {
		contractList(1);
	}
}

</script>

<div class="m-tab">
	<ul>
		<li><a href="/admin/moneybank/approval_tab1">심사 승인</a></li>
		<li class="active"><a href="/admin/moneybank/approval_tab2">계약 관리</a></li>
	</ul>
</div>

<div class="m-options">
	<div class="pRight">
    	<span class="baseDate pRight"><b>기준</b>${standardDate}</span>
    </div>
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
				<span class="ft">서비스</span>
				<div class="input">
					<select id="selectDivSearch" name="search">
						<option value="" selected="selected">전체</option>
						<option value="MP">머니플러스</option>
					</select>
				</div>
			</div>
		</li>
	</ul>
	<ul>
    	<li>
			<div class="fwBox">
				<span class="ft">진행상태</span>
				<div class="input">
					<select id="selectDocSearch" name="search">
						<option value="all" selected>전체</option>
						<option value="conditions_accept">승인</option>
						<option value="use_agree">동의</option>
						<option value="normal">계약</option>
						<option value="expi_normal">종료</option>
					</select>
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">승인일자</span>
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
					<th>진행상태</th>
					<th>승인일자</th>
					<th>회원명</th>
					<th>회사명</th>
					<th>신청서비스</th>
					<th>신청쇼핑몰</th>
					<th>PCS 점수</th>
					<th>월결제액(천원)</th>
					<th>수수료</th>
					<th>지급율</th>
					<th>계약일자</th>
					<th>계약내역</th>
				</tr>
				</thead>
				<tbody id="fixTbody">
				</tbody>
			</table>
		</div>
		<div class="fixBottom">
			<ul class="tableTotal">
				<li><span class="txt">총 :</span><span class="result"></span></li>
				<li><span class="txt">대기건수 :</span><span class="result"></span></li>
				<li><span class="txt">계약건수 :</span><span class="result"></span></li>
				<li><span class="txt">종료건수 :</span><span class="result"></span></li>
			</ul>
		</div>
	</div>
	<div id="pagingButton" class="m-paging"></div>

	<div style = "display:none">
		<input type="text" id="currentPageNum"/>
	</div>

</div>

