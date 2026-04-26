<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
//컬럼 이름 배열
var varTheadArray = new Array();

//페이징
var varLimit = 10; // 페이지당 10개씩 보여주기
var pagingMaxNo = 0; // 페이징버튼 총 개
var nowPageNo = 0; // 현재 페이지 번호 활성화


//검색값 유지를 위한 전역변수
var varUserId = ""; //회원명
var varFirmNm = ""; //회사명
var varRepNm = ""; //대표자명
var varSelectDiv = ""; //서비스 구분
var varSelectStatus = ""; //신청상태
var varMinAmnt = ""; //최소 신청금액
var varMaxAmnt = ""; //최대 신청금액
var varFromDate = ""; // 시작일
var varToDate = ""; // 종료일
var varOrderBy = ""; // order by
var varRepayStatus = ""; // 서류제출상태

$(document).ready(function(){
	
	// Default 날짜 설정
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");
	
	// 테이블 FUNC
	tableSearch();

	// 검색 버튼
	$("#searchBtn").on("click", function(){
		tableSearch();
	});
})

// 테이블 FUNC
function tableSearch(){
	
	// 선택옵션 숨기기
	$('.selectList').css('display', 'none');
	
	// 컬럼 초기화
	varTheadArray.length = 0;
	
	$(".columnCheck").each(function() {
		if(this.checked){
			let theadStr = $(this).parent().find("span").text();
			varTheadArray.push(theadStr.slice(0, theadStr.length));
		}
	});
	
	// 회원명
	let userId = $("#userIdSearch").val();
	varUserId = userId;
	
	// 회사명
	let firmNm = $("#firmNmSearch").val();
	varFirmNm = firmNm;
	
	// 대표자
	let repNm = $("#repNmSearch").val();
	varRepNm = repNm;
	
	// 서비스
	let selectDiv = $("#selectDivSearch option:selected").val();
	varSelectDiv = selectDiv;
	
	// 신청상태
	let repayStatus = $("#repayStatusSearch option:selected").val();
	varRepayStatus = repayStatus;
	
	// 최소 신청금액
	let minAmount = $("#minAmtSearch").val();
	if(minAmount==null || minAmount==""){
		minAmount = 0;
	}
	varMinAmnt = minAmount;
	
	// 최대 신청금액
	let maxAmount = $("#maxAmtSearch").val();
	if(maxAmount==null || maxAmount==""){
		maxAmount = 999999999;
	}
	varMaxAmnt = maxAmount;
	
	// 신청일자 시작
	let fromDate = $("#fromDate").val();
	varFromDate = fromDate;
	
	// 신청일자 종료
	let toDate = $("#toDate").val();
	varToDate = toDate;
	
	// ORDER BY 설정 (보기기준)
	let selectOrderBy = $("#tableOrderBy option:selected").val();
	varOrderBy = selectOrderBy;
	
	moneyBankRepayFunc(1, undefined, userId, firmNm, repNm, selectDiv, repayStatus, minAmount, maxAmount, fromDate, toDate, selectOrderBy);
	
}

// 테이블 데이터 가져오기
function moneyBankRepayFunc(pageNo, pageFlag, userId, firmNm, repNm, selectDiv, repayStatus, minAmount, maxAmount, fromDate, toDate, selectOrderBy){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	// 페이징 NEXT/PREV 버튼 이벤트로 함수 실행했을 때
	if(selectDiv === undefined){
		selectDiv = varSelectDiv;
		userId = varUserId;
		firmNm = varFirmNm;
		repNm = varRepNm;
		repayStatus = varRepayStatus;
		minAmount = varMinAmnt;
		maxAmount = varMaxAmnt;
		fromDate = varFromDate;
		toDate = varToDate;
		selectOrderBy = varOrderBy
	} 

	// LIMIT
 	let tempNo = 10*(pageNo-1);
	let limitStr = tempNo + ", " + 10;
	
	// 전역변수에 현재 몇 페이지인지 저장
 	nowPageNo = pageNo;
	
	// 데이터 가져오기
	let callUrl = "/admin/moneybank/operation/repayState/get";
	let callBackFunc = "moneyBankRepayResponse";
	let objParam = {
		USER_ID : "%"+userId+"%", // 회원명
		FIRM_NM : "%"+firmNm+"%", // 회사명
		REP_NM : "%"+repNm+"%", // 대표자명(회원명)
		DIVISION : selectDiv, // 서비스
		STATUS : repayStatus, // 진행상태
		fromDate : fromDate, // 시작일
		toDate : toDate, // 종료일
		minAmount : minAmount, // 최소신청금액
		maxAmount : maxAmount, // 최대신청금액
		ORDER_BY : selectOrderBy, // ORDER BY
		LIMIT : limitStr // 현재 페이지에 보여줄 만큼 가져오기
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 테이블 그리기
function moneyBankRepayResponse(data){
	
	if(data.repayList.length === 0){
		$("#fixTable").empty().html("조회된 데이터가 없습니다.");
		$("#pagingButton").empty();
		
		// 로딩바 해제
		$(".loadingSpinner").css({"display" : "none"});
		return false;
	}
	
	// 테이블 그리기 START
	let insertTable = "<div class='overflowBox mCustomScrollbar'>";
	insertTable += "<div class='fixArea'>";
	insertTable += "<div class='fixRow'>";
	insertTable += "<table class='m-shadowTable'>";
	insertTable += "<thead><tr><th>상환상태</th><th>대표자명</th><th>회사명</th><th>계약일자</th><th>만료일자</th><th>연장확인 일자</th><th>이용원금</th><th>원금상환</th>";
	insertTable += "</tr></thead><tbody id='fixTbody'>";
	
	// 테이블 고정칼럼
	let insertFixTBody = "";
	for(let i = 0; i<data.repayList.length; i++){
		
		let getData = data.repayList[i];
		
		insertFixTBody += "<tr>";
	    let btnColor = "";
	    let displayStatus = "";
	    if(getData.ORIGINAL_REMAINING_AMOUNT > 0 && getData.CRA_GRADE === "정상"){
	    	btnColor = "sColorGN";
	    	displayStatus = "정상";
	    } else if(getData.ORIGINAL_REMAINING_AMOUNT > 0 && getData.CRA_GRADE === "관심"){
	    	btnColor = "sColorY";
	    	displayStatus = "관심";
	    } else if(getData.ORIGINAL_REMAINING_AMOUNT > 0 && getData.CRA_GRADE === "경고"){
	    	btnColor = "sColorP";
	    	displayStatus = "경고";
	    } else if(getData.ORIGINAL_REMAINING_AMOUNT <= 0 && getData.REQUEST_STATUS === "02"){
	    	btnColor = "sColorN";
	    	displayStatus = "만료";
	    }
	    insertFixTBody += "<th><div class='tIn'><span class='sBtn "+btnColor+" rBtn'>"+displayStatus+"</span></div></th>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.USER_NM+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.FIRM_NM+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.APPROVAL_DATE+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.EXPIRATION_DATE+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.EXTENSION_CONFIRM_DATE+"</div></td>";
   		insertFixTBody += "<td><div class='tIn'>"+comma(getData.TOTAL_PAYMENT)+"</div></td>";   	
   		insertFixTBody += "<td><div class='tIn'>"+comma(getData.ORIGINAL_AMOUNT)+"</div></td>";   	
   		insertFixTBody += "</tr>";
		
   	}
	insertTable += insertFixTBody;
	insertTable += '</tbody></table></div>';
	insertTable += "<div class='rollRow'>";
	insertTable += "<table class='m-shadowTable'>";
	insertTable += "<thead id='scrollThead'>";	
	
	// 테이블 변동칼럼
	let insertScrollThead = "<tr>";
	for(let i = 0; i<varTheadArray.length; i++){
		insertScrollThead += "<th>"+varTheadArray[i]+"</th>";
	}
	insertScrollThead += "<th>상세정보</th></tr>";
    insertTable += insertScrollThead;
    insertTable += "</thead>";
    insertTable += "<tbody id='scrollTbody'>";
	
    let insertScrollTbody = "";
    for(let i = 0; i<data.repayList.length; i++){
    	let getData = data.repayList[i];
    	insertScrollTbody += "<tr>";
    	for(let j = 0; j < varTheadArray.length; j++){
    		
    		if(varTheadArray[j] === "수수료율"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.DAILY_USAGE_FEE+"</div></td>";
    		} else if (varTheadArray[j] === "원금잔액"){
    			insertScrollTbody += "<td><div class='tIn'>"+comma(getData.ORIGINAL_REMAINING_AMOUNT)+"</div></td>";
    		} else if (varTheadArray[j] === "누적납입수수료"){
    			insertScrollTbody += "<td><div class='tIn'>"+comma(getData.FEE_AMOUNT)+"</div></td>";
    		} else if (varTheadArray[j] === "신청금액"){
    			insertScrollTbody += "<td><div class='tIn'>"+comma(getData.TOTAL_PAYMENT)+"</div></td>";
    		} else if (varTheadArray[j] === "승인금액"){ // 투게더에서는 신청금액과 승인금액이 동일
    			insertScrollTbody += "<td><div class='tIn'>"+comma(getData.TOTAL_PAYMENT)+"</div></td>";
    		} else if (varTheadArray[j] === "입금계좌"){
    			insertScrollTbody += "<td><div class='tIn'>"+"##입금계좌"+"</div></td>";
    		} else if (varTheadArray[j] === "상환계좌"){
    			insertScrollTbody += "<td><div class='tIn'>"+"##상환계좌"+"</div></td>";
    		} else if (varTheadArray[j] === "신규여부"){
    			if(getData.NEW_YN == 0){
    				insertScrollTbody += "<td><div class='tIn'>신규</div></td>";
        		}else{
        			insertScrollTbody += "<td><div class='tIn'></div></td>";
        		}
    		} else if (varTheadArray[j] === "CRA 점수"){
    			insertScrollTbody += "<td><div class='tIn'>##CRA점수</div></td>";
    		}
    	}
    	insertScrollTbody+="<td><div class='tIn'><a href='javascript:;' class='sBtn sColorG rBtn' onclick='openRepayModal(\""+getData.SEQ+"\",\""+getData.USER_NO+"\")'>보기</a></div></td>";
   		insertScrollTbody += "</tr>";
    }
    insertTable += insertScrollTbody;
	insertTable += "</tbody></table></div></div></div>";
	
	$("#fixTable").html(insertTable);
	
	// 합계 리스트
	let insertTableSum = "<div class='fixBottom'><ul class='tableTotal'>";
	insertTableSum += "<li><span class='txt'>전체 : </span>";
	insertTableSum += "<span class='result'>"+data.sumData.TOTAL_REQ+"</span></li>";
	insertTableSum += "<li><span class='txt'>총 이용원금 : </span>";
	insertTableSum += "<span class='result'>"+comma(data.sumData.TOTAL_AMOUNTS)+" 원</span></li>";
	insertTableSum += "<li><span class='txt'>수수료평균 : </span>";
	insertTableSum += "<span class='result'>"+data.sumData.USAGE_FEE_AVG+"</span></li>";
	insertTableSum += "<li><span class='txt'>원금잔액 : </span>";
	insertTableSum += "<span class='result'>"+comma(data.sumData.REMAINING_AVG)+" 원 </span></li>";
	insertTableSum += "</ul></div>";
	$("#fixTable").append(insertTableSum);
	
	// 페이징
	pagingMaxNo =  Math.ceil(data.sumData.TOTAL_REQ/10);
	let insertPagingBtn = "<ul>";
	if(pagingMaxNo<=10){
		for(let i = 1; i <= pagingMaxNo; i++){
			insertPagingBtn += "<li><a href='javascript:;' class='num' onclick='moneyBankRepayFunc("+i+");'>"+i+"</a></li>";
		}
	}else if(pagingMaxNo>10){
		
		if(nowPageNo <= 10){ // 1~10페이지 구간
		
			for(let i = 1; i <= 10; i++){
				insertPagingBtn += "<li><a href='javascript:;' class='num' onclick='moneyBankRepayFunc("+i+");'>"+i+"</a></li>";
				if(i === 10){
					insertPagingBtn += "<li><a href='javascript:;' class='oiBtn next' onclick='moneyBankRepayFunc("+(i+1)+", \"next\");'>next</a></li>";
				}
			}
		
		} else if(nowPageNo >= pagingMaxNo-9  && nowPageNo == pagingMaxNo){ // 마지막 페이지에서 -9까지의 구간
			
			for(let i = pagingMaxNo-9; i <= pagingMaxNo; i++){
				if(i === pagingMaxNo-9){
				insertPagingBtn += "<li><a href='javascript:;' class='oiBtn prev' onclick='moneyBankRepayFunc("+(i-10)+", \"previous\");'>prev</a></li>";
				}
				insertPagingBtn += "<li><a href='javascript:;' class='num' onclick='moneyBankRepayFunc("+i+");'>"+i+"</a></li>";
			}
			
		} else{ // 그 외의 경우
		
			for(let i = 11; i <= pagingMaxNo-10; i++){
				if(i === 11){
					insertPagingBtn += "<li><a href='javascript:;' class='oiBtn prev' onclick='moneyBankRepayFunc("+(i-1)+", \"previous\");'>prev</a></li>";
				}
				insertPagingBtn += "<li><a href='javascript:;' class='num' onclick='moneyBankRepayFunc("+i+");'>"+i+"</a></li>";
				if(i === pagingMaxNo-10){
					insertPagingBtn += "<li><a href='javascript:;' class='oiBtn next' onclick='moneyBankRepayFunc("+(pagingMaxNo-9)+", \"next\");'>next</a></li>";
				}
			}
		}
	}
	insertPagingBtn += "</ul>";
	$("#tablePaginate").empty().html(insertPagingBtn); // 페이징 저장
	
	// 페이징 버튼 활성화
	$('#tablePaginate ul li').each(function (index, item) {
		if($(item).find("a").text() === String(nowPageNo)){
			$(item).find("a").addClass("active");
			return false;
		}
	});
	
	// 퍼블리싱
	$('#fixTable').doFixTable();
	
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

// 상환정보 MODAL 데이터 가져오기
function openRepayModal(seq, userNo){
	
	// 상환이력 데이터 가져오기
	let callUrl = "/admin/moneybank/operation/repayHistory";
	let callBackFunc = "repayHistoryResponse";
	let objParam = {
		USER_NO : userNo,
		SEQ : seq
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

// 상환정보 MODAL DATA 띄우기
function repayHistoryResponse(data){
	
	// 기본정보
	let infoMap = data.infoList[0];
	$("#userName").val(infoMap.USER_NM);
	$("#userId").val(infoMap.USER_ID);
	$("#regDate").val(infoMap.REG_DATE);
	$("#firmName").val(infoMap.FIRM_NM);
	$("#firmId").val(infoMap.FIRM_ID);
	$("#repName").val(infoMap.USER_NM);
	$("#bizType").val(infoMap.BUSINESS_TYPE);
	$("#bizSector").val(infoMap.SECTORS);
	$("#startDate").val(infoMap.FIRM_SETUP_DATE);
	$("#userNum").val(infoMap.USER_PHONE);
	$("#userEmail").val(infoMap.USER_ID);
	$("#firmNum").val(infoMap.FIRM_TEL);
	$("#mainZip").val(infoMap.FIRM_ZIP_CODE);
	$("#mainAddress").val(infoMap.FIRM_ADDR);
	
	// 상품정보
	let divisionDisplay = ""; // 서비스명
	if(infoMap.DIVISION === '00'){
		divisionDisplay = "단비펀드";
	}
	$("#division").text(divisionDisplay);
	
	let remainOriginalAmnt = infoMap.ORIGINAL_REMAINING_AMOUNT; // 원금잔액 
	let dailyFee = infoMap.DAILY_USAGE_FEE; // 수수료율
	
	$("#depositDate").text(infoMap.DEPOSIT_DATE);
	$("#expireDate").text(infoMap.EXPIRATION_DATE);
	$("#usePeriod").text(infoMap.USAGE_PERIOD);
	$("#totalPayment").text(comma(infoMap.TOTAL_PAYMENT));
	$("#remainOriginal").text(comma(remainOriginalAmnt));
	$("#dailyFee").text(dailyFee);
	
	// 상환잔액 계산
	const todayDate = new Date(infoMap.TODAY_DATE);
	const repayDate = new Date(infoMap.LAST_REPAY_DATE);
	
	let timeDiff = todayDate.getTime() - repayDate.getTime();
	let dayDiff = 1+Math.round(timeDiff/86400000); // 원금잔액을 사용한 일 수
	let toNowFee = remainOriginalAmnt*(dailyFee/100)*dayDiff; // 사용한 일수에 따른 현재 수수료
	let remainPayDisplay = Math.round(remainOriginalAmnt+toNowFee); // 상환잔액 (현시점 이만큼 상환하면 상환완료)
	$("#remainPayment").text(comma(remainPayDisplay));
	
	// 상환현황
	$("#repayHistoryLog").empty();
	let insertHistory = "";
	if(data.historyList.length != 0){
		for(let i = 0; i < data.historyList.length; i++){
			let getMap = data.historyList[i];
			insertHistory += '<tr>';
			insertHistory += '<td><div class="tIn"></div></td>';
			insertHistory += '<td><div class="tIn">'+getMap.REPAYMENT_DATE+'</div></td>';
			insertHistory += '<td><div class="tIn">'+divisionDisplay+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.ORIGINAL_AMOUNT)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.TOTAL_REPAYMENT_AMOUNT)+'</div></td>';
			insertHistory += '<td><div class="tIn">##USED TIME</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.FEE_AMOUNT)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.ORIGINAL_REMAINING_AMOUNT)+'</div></td>';
			insertHistory += '</tr>';
	   	}
	}else{
		insertHistory += "<span>데이터 없음</span>";
	}
	$("#repayHistoryLog").html(insertHistory);
	
	modalOpen("repayModal");
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
                <span class="ft">회원ID</span>
                <div class="input">
                    <input type="text" placeholder="회원ID" id="userIdSearch">
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
                <span class="ft">대표자</span>
                <div class="input">
                    <input type="text" placeholder="회사명" id="repNmSearch">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">서비스</span>
                <div class="input">
                    <select id="selectDivSearch">
                        <option value="-">전체</option>
                        <option value="00">단비펀드</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">상환상태</span>
                <div class="input" id="repayStatusSearch">
                    <select>
                        <option value="-">전체</option>
                        <option value="">경고</option>
                        <option value="">관심</option>
                        <option value="">정상</option>
                        <option value="">만료</option>
                    </select>
                </div>
            </div>
        </li>
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">이용금액</span>
                <div class="input unit">
                    <input type="text" placeholder="최소" id="minAmtSearch">
                    <span class="unitBox logn">백만원</span>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">이용금액</span>
                <div class="input unit">
                    <input type="text" placeholder="최대" id="maxAmtSearch">
                    <span class="unitBox logn">백만원</span>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">계약일자</span>
                <div class="input">
                    <input type="text" class="datepicker" placeholder="시작기간" id="fromDate">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">계약일자</span>
                <div class="input">
                    <input type="text" class="datepicker" placeholder="종료기간" id="toDate">
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
                        <option value="TRI.APPROVAL_DATE DESC">최근 순</option>
                        <option value="TRI.APPROVAL_DATE ASC">과거 순</option>
                        <option value="TRI.TOTAL_PAYMENT">선정산 총액</option>
                        <option value="TRI.TOTAL_PAYMENT">원금</option><!-- 다른 방식에서 사용시 변경예정 -->
                        <option value="TRI.DAILY_USAGE_FEE">수수료율</option>
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
                            <span>상환상태</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>대표자명</span>
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
                            <span>이용 서비스</span>
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
                            <input type="checkbox" class="required" disabled checked>
                            <span>만료일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>연장확인일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>이용원금</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>원금상환</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>수수료율</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>원금잔액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>누적납입수수료</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>신청금액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>승인금액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>입금계좌</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>상환계좌</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>신규여부</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>CRA 점수</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>상세정보</span>
                        </label>
                    </li>
                    <li class="btns">
                        <button class="sBtn sColorLB wBtn">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable"></div>
    <div id="tablePaginate" class="m-paging"></div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>

<!-- 상환정보 MODAL -->
<div class="modal-container" id="repayModal">
    <div class="modal-wrapper">
        <header>
            <h2>상환 상세 정보</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner mArticleArea tabArea">
                <article class="m-modalGrid">
                    <header class="m-options">
                        <h3>기본 정보</h3>
                        <span class="baseDate pRight"><b>작성 기준일 :</b>2021/02/01</span>
                    </header>
                    <div class="contentsArea">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이름</span>
                                    <div class="input">
                                        <input type="text" id="userName" placeholder="이름">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">회원ID</span>
                                    <div class="input">
                                        <input type="text" id="userId" placeholder="아이디">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">최초가입</span>
                                    <div class="input">
                                        <input type="text" id="regDate" placeholder="최초가입">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">상호</span>
                                    <div class="input">
                                        <input type="text" id="firmName" placeholder="상호">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">사업자번호</span>
                                    <div class="input">
                                        <input type="text" id="firmId" placeholder="사업자번호">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">대표자</span>
                                    <div class="input">
                                        <input type="text" id="repName" placeholder="대표자">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">사업구분</span>
                                    <div class="input">
                                        <input type="text" id="bizType" placeholder="사업구분">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">취급상품</span>
                                    <div class="input">
                                        <input type="text" id="bizSector" placeholder="취급상품">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">설립연도</span>
                                    <div class="input">
                                        <input type="text" id="startDate" placeholder="설립연도">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">핸드폰</span>
                                    <div class="input">
                                        <input type="text" id="userNum" placeholder="핸드폰">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이메일</span>
                                    <div class="input">
                                        <input type="text" id="userEmail" placeholder="이메일">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">전화</span>
                                    <div class="input">
                                        <input type="text" id="firmNum" placeholder="전화">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">팩스</span>
                                    <div class="input">
                                        <input type="text" id="faxNum" placeholder="팩스">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">본사 주소</span>
                                    <div class="input">
                                        <input type="text" id="mainZip" placeholder="우편번호 검색">
                                    </div>
                                </div>
                            </li>
                            <li class="col-2">
                                <div class="fwBox">
                                    <div class="input">
                                        <input type="text" id="mainAddress" placeholder="상세주소">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">창고 주소</span>
                                    <div class="input">
                                        <input type="text" id="storageZip" placeholder="우편번호 검색">
                                    </div>
                                </div>
                            </li>
                            <li class="col-2">
                                <div class="fwBox">
                                    <div class="input">
                                        <input type="text" id="storageAddress" placeholder="상세주소">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">주거래통장</span>
                                    <div class="input">
                                        <input type="text" id= "bankNm" placeholder="은행명">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <div class="input">
                                        <input type="text" id="bankAccount" placeholder="계좌번호">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">상환계좌</span>
                                    <div class="input">
                                        <input type="text" id="repayBankNm" placeholder="은행명">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <div class="input">
                                        <input type="text" id="repayAccount" placeholder="계좌번호">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <article class="m-modalGrid">
                    <header>
                        <h3>상품 정보</h3>
                    </header>
                    <div class="contentsArea">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">서비스</span>
                                    <div class="input" id="division"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">입금일자</span>
                                    <div class="input" id="depositDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">만기일자</span>
                                    <div class="input" id="expireDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이용기간</span>
                                    <div class="input" id="usePeriod"></div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이용원금</span>
                                    <div class="input" id="totalPayment"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">상환잔액</span>
                                    <div class="input" id="remainPayment"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">원금잔액</span>
                                    <div class="input" id="remainOriginal"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">수수료%</span>
                                    <div class="input" id="dailyFee"></div>
                                </div>
                            </li>
                        </ul>
                        
                    </div>
                </article>
                <article class="m-tab">
                    <ul>
                        <li class="active"><h2><a href="javascript:;">상환상세</a></h2></li>
                        <li><h2><a href="javascript:;">CRA</a></h2></li>
                    </ul>
                </article>
                <div class="m-tabBox active">
                    <article class="m-modalGrid">
                        <header>
                            <h3>상환 현황</h3>
                            <div class="btns">
                                <a href="javascript:;" class="sBtn sColorN">상환 연장 신청</a>
                            </div>
                        </header>
                        <div class="maxHeight">
                            <table class="m-shadowTable tal">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>일자</th>
                                        <th class="tal">구분</th>
                                        <th>원금</th>
                                        <th>상환금액</th>
                                        <th>이용기간</th>
                                        <th>수수료</th>
                                        <th>원금잔액</th>
                                    </tr>
                                </thead>
                                <tbody id="repayHistoryLog">
                                    <tr>
                                        <td><div class="tIn">1</div></td>
                                        <td><div class="tIn">21/04/21</div></td>
                                        <td><div class="tIn">원금입금</div></td>
                                        <td><div class="tIn">5,000</div></td>
                                        <td><div class="tIn">-</div></td>
                                        <td><div class="tIn">-</div></td>
                                        <td><div class="tIn">-</div></td>
                                        <td><div class="tIn">5,000</div></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <header>
                            <h3>회원평가</h3>
                            <span class="btns ">
                                <a href="javascript:;" class="sBtn sColorN">주의 거래처 등록</a>
                            </span>
                        </header>
                        <div class="contentsArea">
                            <div class="fwBox textarea">
                                <div class="input">
                                    <textarea placeholder="회원평가를 작성하여주세요"></textarea>
                                </div>
                            </div>
                            <div class="addBtns">
                                <a href="javascript:;" class="sBtn sColorLG">작성</a>
                                <a href="javascript:;" class="sBtn sColorLG">수정</a>
                                <a href="javascript:;" class="sBtn sColorLB">확인</a>
                            </div>
                        </div>
                    </article>
                </div>
                <div class="m-tabBox ">
                    <article class="m-modalGrid">
                        <table class="m-mixTable">
                            <tr class="bgLightGray">
                                <td colspan="2"></td>
                                <td>12/01</td>
                                <td>12/02</td>
                                <td>12/03</td>
                                <td>12/04</td>
                                <td>12/05</td>
                                <td>12/06</td>
                                <td>12/07</td>
                                <td>12/08</td>
                                <td>12/09</td>
                                <td>12/10</td>
                                <td>12/11</td>
                                <td>12/12</td>
                                <td>12/13</td>
                                <td>Today</td>
                            </tr>
                            <tr>
                                <td class="bgColorLB" colspan="2">CRA Score</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorF">C</td>
                                <td class="bgColorF">C</td>
                                <td class="bgColorP">C</td>
                                <td class="bgColorR">C</td>
                                <td class="bgColorR">C</td>
                                <td class="bgColorG">C</td>
                                <td class="bgColorG">C</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorN">A</td>
                                <td class="bgColorG">C</td>
                                <td class="bgColorG">C</td>
                            </tr>
                            <tr class="bgSkin">
                                <td rowspan="3">핵<br>심</td>
                                <td>결제통장 변경여부</td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                            </tr>
                            <tr class="bgSkin">
                                <td>온라인 송금 설정 여부</td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                            </tr>
                            <tr class="bgSkin">
                                <td>선정산 자금흐름 경고</td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn pass"></i></td>
                                <td><i class="oiBtn fail"></i></td>
                            </tr>
                            <tr class="bgBeige">
                                <td rowspan="3">매<br>출</td>
                                <td>매출액 변화</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBeige">
                                <td>주문당 매출액 변화</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBeige">
                                <td>동일 id 반복구매율</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBlueGray">
                                <td rowspan="3">운<br>영</td>
                                <td>구매자 수</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBlueGray">
                                <td>배송안전성</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                            <tr class="bgBlueGray">
                                <td>주간 반품율</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                                <td>30</td>
                            </tr>
                        </table>
                    </article>
                </div>
                <div class="btnArea">
                    <a href="javascript:;" class="modalClose mBtn sColorLB">취소</a>
                    <a href="javascript:;" class="modalClose mBtn sColorN">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>
