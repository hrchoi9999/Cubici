<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
let TheadArray = [];

$(document).ready(function(){
	$('#fromDate').val('${fromDate}');
	$('#toDate').val('${toDate}');
	
	usageList(0);
	
	$('input[name="search"]').keyup(function(e){
		if(e.keyCode == 13){
			$('#currentPageNum').val('');
			usageList(1);
		}
	});

	$('#searchBtn').click(function(){
		$('#currentPageNum').val('');
		usageList(1);
	});
	
	$(document).on('click', "#optionBtn", function(){
		let currentPageNum = $('#currentPageNum').val();
		usageList(currentPageNum);
	});
});

function usageList(CURRENTPAGE){
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
	
	let userNmSearch = $('#userNmSearch').val();
	let firmNmSearch = $('#firmNmSearch').val();
	let userIdSearch = $('#userIdSearch').val();
	let selectDivSearch = $('#selectDivSearch option:selected').val();
	let selectStatusSearch = $('#selectStatusSearch option:selected').val();
	let fromDate = $('#fromDate').val();
	let toDate = $('#toDate').val();
	let selectOrderBy = $("#tableOrderBy option:selected").val();
	
	let currentPage = currentPageNum-1;			
	let dataPerPage = 10; 					
	let dataCnt = currentPage * dataPerPage;	
	
	let callUrl = '/admin/moneybank/management/usageList';
	let callBackFunc = 'usageListResponse';
	let objParam = {
			dataPerPage : dataPerPage
		  , currentPage : currentPage
		  , dataCnt : dataCnt
		  , userNmSearch : userNmSearch
		  , firmNmSearch : firmNmSearch
		  , userIdSearch : userIdSearch
		  , selectDivSearch : selectDivSearch
		  , selectStatusSearch : selectStatusSearch
		  , fromDate : fromDate 
		  , toDate : toDate +' 23:59:59'
		  , selectOrderBy : selectOrderBy
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function usageListResponse(data){
	let count = data.getUsageListCount;
	let usageList = data.usageList;
	
	let TableHtml = '<div class="overflowBox mCustomScrollbar">';
	TableHtml += '<div class="fixArea">';
	TableHtml += '<div class="fixRow">';
	TableHtml += '<table class="m-shadowTable">';
	TableHtml += '<thead><tr><th>이용상태</th><th>신청일자</th><th>회원ID</th><th>회사명</th><th>회원명</th><th>이용서비스</th></tr></thead>';
	TableHtml += '<tbody id="fixTbody">';
	
	let FixTbody = '';
	let ScrollTbody = '';
	if(usageList.length > 0){
		let trHtml = '';
		let btnColor = '';
		
		$.each(usageList, function(i, item){
			let mbStatus = item.mb_status;

			switch(mbStatus){
				case '신청':
					btnColor = 'sColorY';
					break;
				case '심사':
					btnColor = 'sColorGN';
					break;
				case '상환':
					btnColor = 'sColorLS';
					break;
				case '만료':
					btnColor = 'sColorR';
					break;
			}
			FixTbody += '<tr>';
			FixTbody += '<td><div class="tIn"><span class="sBtn ' + btnColor + ' rBtn">' + item.mb_status + '</span><div></td>';
			FixTbody += '<td><div class="tIn">' + item.mb_request_date + '</div></td>';
			FixTbody += '<td><div class="tIn"><a href="javascript:usageDetail('+ "'" + item.USER_CODE + "'" + ');">' + item.USER_ID + '</a></div></td>';
			FixTbody += '<td><div class="tIn"><a href="javascript:usageDetail('+ "'" + item.USER_CODE + "'" + ');">' + item.FIRM_NM + '</a></div></td>';
			FixTbody += '<td><div class="tIn"><a href="javascript:usageDetail('+ "'" + item.USER_CODE + "'" + ');">' + item.USER_NM + '</a></div></td>';
			FixTbody += '<td><div class="tIn">' + item.mb_product_code + '</div></td>';
			FixTbody += '</tr>';
			
			ScrollTbodyValueArray = [item.mb_contract_date, item.mb_contract_expire_date, item.usage_fee + ' %', item.calculate_deposit_amount, item.act_principal, item.repayment_balance, item.PRIZM_SCORE]
			ScrollTbody += '<tr>';
			$.each(TheadArray, function(i, item){
				if(item){
					ScrollTbody += '<td><div class="tIn">' + ScrollTbodyValueArray[i] + '</div></td>';
				}
			});
		});
	}
	TableHtml += FixTbody;
	TableHtml += '</tbody></table></div>';
	TableHtml += '<div class="rollRow"><table class="m-shadowTable">';
	TableHtml += '<thead id ="scrollThead">';
	
	let ChangeThead = '<tr>';
	$.each(TheadArray, function(i, item){
		if(item){
			ChangeThead += '<th>' + item + '</th>';
		}
	});
	ChangeThead += '</tr>';
	
	TableHtml += ChangeThead;
	TableHtml += '</thead>';
	TableHtml += '<tbody id="scrollTbody">';
	TableHtml += ScrollTbody;
	TableHtml += '</tbody></table></div></div></div>';
	
	$("#fixTable").html(TableHtml);
	
	let TableSum = '<div class="fixBottom"><ul class="tableTotal"><li><span class="txt">총 :</span>';
	TableSum += '<span class="result"> ' + count.usageListTotal + ' 건</span></li>';
	TableSum += '<li><span class="txt">신청 :</span>';
	TableSum += '<span class="result">' + count.acceptCnt + ' 건</span></li>';
	TableSum += '<li><span class="txt">심사 :</span>';
	TableSum += '<span class="result">' + count.judgeCnt + ' 건</span></li>';
	TableSum += '<li><span class="txt">거부 :</span>';
	TableSum += '<span class="result">' + count.rejectCnt + ' 건</span></li>';
	TableSum += '<li><span class="txt">상환 :</span>';
	TableSum += '<span class="result">' + count.repaymentCnt + ' 건</span></li>';
	TableSum += '<li><span class="txt">만료 :</span>';
	TableSum += '<span class="result">' + count.expireCnt + ' 건</span></li></ul></div>';
	$("#fixTable").append(TableSum); 
	
	let pageHtml = "";
	pageHtml += "<ul>";

	let pageMaxCnt = Math.ceil(count.usageListTotal / data.dataPerPage);
	let dataPerPage = data.dataPerPage;
	let currentPage = data.currentPage;
	let pageCnt = Math.floor(currentPage / 10);
	
	if(pageCnt != 0){
		pageHtml += "<li><a class='oiBtn prev' href = 'javascript:usageList(" + ((pageCnt)*10) + ")'> < </a></li>";
	}

	for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){
		if( i > pageMaxCnt) {
			break;
		}
		
		if(i-1  == data.currentPage){
			pageHtml += "<li><a class='num active' href = 'javascript:usageList(" + i + ")'>" + i + "</a></li>";
		}else{ 
			pageHtml += "<li><a class='num' href = 'javascript:usageList(" + i + ")'>" + i + "</a></li>";
		}
	}	
	
	if(pageCnt+1 < (pageMaxCnt/10)){
		pageHtml += "<li><a class='oiBtn next' href = 'javascript:usageList(" + ((pageCnt+1)*10 + 1) + ")'> > </a></li>";
	}
	
	pageHtml += '</ul>';
	
	$('#pagingButton').empty().html(pageHtml);
	
	$('#fixTable').doFixTable();
	
	$(".loadingSpinner").css({"display" : "none"});
}

function usageDetail(code){
	let form= $('<form></form>');
	form.attr('name', 'detailForm');
	form.attr('method', 'get');
	form.attr('action', '/admin/moneybank/management/usageDetail');
	form.append($('<input />', {type: 'hidden', name: 'code', value: code}));
	form.appendTo('body');
	form.submit();
}


</script>

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
                    <input type="text" placeholder="회사명" id="firmNmSearch">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회원ID</span>
                <div class="input">
                    <input type="text" placeholder="회원ID" id="userIdSearch">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">서비스</span>
                <div class="input">
                    <select id="selectDivSearch">
                        <option value="">전체</option>
                        <option value="MP">머니플러스</option>
                    </select>
                </div>
            </div>
        </li>
    </ul>
    <ul>
    	<li>
            <div class="fwBox">
                <span class="ft">이용상태</span>
                <div class="input">
                    <select id="selectStatusSearch">
                        <option value="">전체</option>
                        <option value="approval">신청</option>
                        <option value="judge">심사</option>
                        <option value="repayment">상환</option>
                        <option value="refuse">거부</option>
                        <option value="expire">만료</option>
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
                        <option value="DESC" selected>최근 순</option>
                        <option value="ASC">과거 순</option>
                    </select>
                </div>
            </div>
            <span class="btns">
                <a href="javascript:;" class="sBtn sColorLG excel">엑셀 다운로드</a>
            </span>
            <div class="m-filter">
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorN setting openFilter">항목 선택</a>
                </div>
                <ul class="selectList">
                	<li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>이용상태</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>MB신청일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>회원ID</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>회사명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>회원명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>이용 서비스</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" disabled checked>
                            <span>시작일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" disabled checked>
                            <span>종료일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>수수료</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>이용금액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>누적상환</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>상환잔액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>PCS</span>
                        </label>
                    </li>          
                    <li class="btns">
                        <button class="sBtn sColorLB wBtn" id="optionBtn">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable"></div>
    <div id="pagingButton" class="m-paging"></div>
    <div style = "display:none">
		<input type="text" id="currentPageNum"/>
	</div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>

