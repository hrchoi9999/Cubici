<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
var currentpage = 0;

$(document).ready(function(){
	// Default 날짜 설정
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");
	
	loadRedemList(1);
	
	$(this).on("click", ".searchBtn", function(){
		loadRedemList(1);
	});
})

function loadRedemList(id){
	let userNm = $("#userNmSearch").val();
	let firmNm = $("#firmNmSearch").val();
	let service = $("#serviceSearch option:selected").val();
	let status = $("#statusSearch option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	let orderBy = $("#tableOrderBy option:selected").val();
	currentpage = (id-1);
	let page = (id-1) * 10;
	
	let callUrl = "/admin/moneybank/redemption/list";
	let callBackFunc = "redemListResponse";
	let objParam = {
		user_nm : userNm,
		firm_nm : firmNm,
		service : service,
		status : status,
		fromDate : fromDate,
		toDate : toDate + " 23:59:59",
		orderBy : orderBy,
		page : page
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function redemListResponse(data){
	
	$('.selectList').css("display", "none");
	
	// 컬럼 초기화
	let varTheadArray = [];
	let varTheadBody = [];
	
	$(".columnCheck:checked").each(function(i, item) {
		varTheadArray[i] = $(item).next().text();
		varTheadBody[i] = $(item).attr("id");
	});
	// 테이블 > 변동 컬럼
	// 테이블 헤드
	let insertScrollThead = "<tr>";
	for(let i=0, len = varTheadArray.length; i < len; i++){
		insertScrollThead += "<th>"+varTheadArray[i]+"</th>";
	}
	insertScrollThead += "<th>상세</th>"
	insertScrollThead += "</tr>";
	
	// 테이블 > 고정 컬럼
	let insertFixTbody = "";
	if(data.redemList.length > 0) {
		for(let i=0, len = data.redemList.length; i < len; i++){
			let getData = data.redemList[i];
			insertFixTbody += "<tr><th><div class='tIn'><span class='sBtn "+getData.color+" rBtn'>"+getData.mb_status_name+"</span></div></th>";
			insertFixTbody += "<th><div class='tIn'>"+getData.USER_NM+"</div></th>";
			insertFixTbody += "<td><div class='tIn'>"+getData.FIRM_NM+"</div></td>";
			insertFixTbody += "<td><div class='tIn'>"+getData.mb_product_code+"</a></div></td>";
			insertFixTbody += "<td><div class='tIn'><span class='sBtn rBtn'>"+getData.mb_contract_date+"</span></div></td>";
			insertFixTbody += "</tr>";
		}
		
		// 테이블 바디
		let insertScrollTbody = "";
		for(let i=0, len = data.redemList.length; i < len; i++){
			let getData = data.redemList[i];			
			insertScrollTbody += "<tr>";
			for(let i=0, len = varTheadArray.length; i < len; i++){
				insertScrollTbody += "<td><div class='tIn'>";				
				// 내용
				let sum_cnt = parseInt(getData.sum_COUNT)-1;
				let ThValue = varTheadArray[i];
				let TbValue = varTheadBody[i];
				
				if((ThValue == "누적이용원금") || (ThValue == "누적상환원금") || (ThValue == "누적수수료") || (ThValue == "건당주문한도")){
					insertScrollTbody += comma(getData[TbValue]);
				} else if (ThValue == "상환 잔액") {
					insertScrollTbody += comma(getData.cal_sum - getData.act_sum);
				} else{
					insertScrollTbody += getData[TbValue];
				}
				// 컬럼 태그
				insertScrollTbody += "</div></td>";
			}
			insertScrollTbody += "<td><div class='tIn'><a onclick='' href='/admin/moneybank/redemdetail?mbid="+getData.mbid+"'class='sBtn sColorN rBtn'>보기</a></div></td>";
			insertScrollTbody += "</tr>";
		}
	
		$("#fixTbody").html(insertFixTbody);
		$("#scrollThead").html(insertScrollThead);
		$("#scrollTbody").html(insertScrollTbody);		

		$(".overflowBox").mCustomScrollbar("destroy");
		$(".fixRow").css('left', '0px');
		$(".m-shadowTable").find('th').css('top', '0px');

        $('#fixTable').doFixTable();
        
		$("span.result:eq(0)").text(comma(data.redemTotal.total_cnt) + "건")
		$("span.result:eq(1)").text(comma(data.redemTotal.cnt1) + "건  /  ")
		$("span.result:eq(2)").text(comma(data.redemTotal.cnt2) + "건  /  ")
		$("span.result:eq(3)").text(comma(data.redemTotal.cnt3) + "건")
		$("span.result:eq(4)").text(comma(data.redemAmountTotal.cal_sum) + "원  /  ")
		$("span.result:eq(5)").text(comma(data.redemAmountTotal.fee_sum) + "원")
		
		paging(data.redemTotal.total_cnt / 10);
		
	} else {
		//테이블 고정컬럼
		let insertFixTbody = '<tr><td></td></tr>';
		//변동 컬럼
		let insertScrollTbody = '<tr><td colspan="4">조회된 결과가 없습니다.</td></tr>';

		$("#fixTbody").html(insertFixTbody);
		$("#scrollThead").html(insertScrollThead);
		$("#scrollTbody").html(insertScrollTbody);
		$('#tablePaginate').empty();
		
		$("span.result:eq(0)").text("0 건");
		$("span.result:eq(1)").text("0 건  /  ");
		$("span.result:eq(2)").text("0 건  /  ");
		$("span.result:eq(3)").text("0 건");
		$("span.result:eq(4)").text("0 원  /  ");
		$("span.result:eq(5)").text("0 원");
	}
}

function paging(maxCnt){
	// 페이징
	let pageCnt = Math.floor(currentpage / 10);
	
	// 페이징 버튼
	let pageHtml = "<ul>";		
	if(maxCnt <10){
		for(let i =1; i <= Math.ceil(maxCnt); i++){
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='loadRedemList(" + i  + ");'>" + i + "</a><li>";
		}
	} else if (maxCnt >=10){
		if(pageCnt > 0){ // 이전
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='loadRedemList(" + ((pageCnt)*10) + ");'><</a><li>";
		}
		for(let i=(pageCnt * 10) + 1; i<= (pageCnt*10)+10; i++){ // 1~ 10
			if(i>Math.ceil(maxCnt)){
				break;
			}
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='loadRedemList(" + i  + ");'>" + i + "</a><li>";		
		}
		if(Math.floor(maxCnt)>(pageCnt*10)+10){ // 다음
			pageHtml += "<li><a id='submit' class='oiBtn next' href = 'javascript:;' onclick='loadRedemList(" + ((pageCnt+1)*10+1) + ");'><</a><li>";
		}
	}
	pageHtml += "</ul>";
	$("#tablePaginate").empty().html(pageHtml);
	
	// 페이징 버튼 활성화		
	$(".num:eq(" + currentpage%10 + ")").addClass("active");
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="javascript:;">상환 현황</a></li>
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
                    <input type="text" placeholder="회원ID" id="userNmSearch">
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
                <span class="ft">서비스 구분</span>
                <div class="input">
                    <select id="serviceSearch">
                    	<option value="all">전체</option>
                    	<option value="moneyplus">머니플러스</option>
                    </select>
                </div>
            </div>
        </li>
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">상환상태</span>
                <div class="input" id="statusSearch">
                    <select>
                        <option value="all">전체</option>
                        <option value="normal">정상</option>
                        <option value="attention">관심</option>
                        <option value="warning">경고</option>
                        <option value="expi_normal">만료(정상)</option>
                        <option value="expi_stop">만료(중지)</option>
                        <option value="expi_late_payment">만료(연체)</option>
                    </select>
                </div>
            </div>
        </li>
		<li>
			<div class="fwBox">
				<span class="ft">신청일자</span>
                <div class="input">
                    <input type="text" class="startDatepicker" placeholder="시작일" id="fromDate" name="search" autocomplete='off' readonly>
                </div>~
                <div class="input">
                    <input type="text" class="endDatepicker" placeholder="종료일" id="toDate" name="search" autocomplete='off' readonly>
                </div>
			</div>
		</li>
        <li>
            <div class="btns">
                <button class="sBtn sColorLB searchBtn">검색</button>
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
                        <option value="latest">최근 순</option>
                        <option value="past">과거 순</option>
                        <option value="limit">승인한도</option>
                        <option value="feeRate">수수료율</option>
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
                            <span>상태</span>
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
                            <span>회사명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>이용서비스</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>계약일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="mb_contract_expire_date" class="columnCheck" checked>
                            <span>계약만료일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="mbid" class="columnCheck" checked>
                            <span>MBID</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="cal_sum" class="columnCheck" checked>
                            <span>누적이용원금</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="act_sum" class="columnCheck" checked>
                            <span>누적상환원금</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="fee_sum" class="columnCheck" checked>
                            <span>누적수수료</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="valance" class="columnCheck" checked>
                            <span>상환 잔액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="mb_termi_apply_date" class="columnCheck" checked>
                            <span>중도해지신청일</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="mb_termi_date" class="columnCheck" checked>
                            <span>중도해지일</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="fee_rate" class="columnCheck" checked>
                            <span>수수료율</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="payment_rate" class="columnCheck" checked>
                            <span>지급률</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="sales_limit_per_case" class="columnCheck" checked>
                            <span>건당주문한도</span>
                        </label>
                    </li>
                    <li class="btns">
                        <button class="sBtn sColorLB wBtn searchBtn">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable wide">
    	<div class="overflowBox mCustomScrollbar">
			<div class="fixArea">
				<div class="fixRow">
					<table class="m-shadowTable">
						<thead>
							<tr>
								<th>상환상태</th>
								<th>회원명</th>
								<th>회사명</th>
								<th>이용서비스</th>
								<th>계약일자</th>
							</tr>
						</thead>
						<tbody id="fixTbody">
						</tbody>
					</table>
				</div>
				<div class="rollRow">
					<table class="m-shadowTable">
						<thead id="scrollThead">
						</thead>
						<tbody id="scrollTbody">
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="fixBottom">
			<ul class="tableTotal">
				<li><span class="txt">총 상환건수</span><span id="totalRedem" class="result"></span></li>
				<li>
					<span class="txt">정상 </span><span id="totalWarning" class="result"></span>
					<span class="txt">관심 </span><span id="totalInterest" class="result"></span>
					<span class="txt">경고 </span><span id="totalNormal" class="result"></span>
				</li>
				<li>
					<span class="txt">누적이용원금 </span><span id="totalCalAmount" class="result"></span>
					<span class="txt">누적수수료 </span><span id="totalFee" class="result"></span>
				</li>
			</ul>
		</div>
	</div>
    <div id="tablePaginate" class="m-paging"></div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>