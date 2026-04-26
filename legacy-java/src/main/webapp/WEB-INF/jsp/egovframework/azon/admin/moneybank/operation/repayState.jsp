<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

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
	
	// 모달 평가 등록버튼
	$("#insertEval").on("click", function(){
		
		if($("#evalSubject option:selected").val()==""){
			modalInfo("평가 주제를 선택해주세요.");
		}else if($("#evalReviewer").val()==""){
			modalInfo("담당자를 입력해주세요.");
		}else if($("#evalTitle").val()==""){
			modalInfo("평가제목을 선택해주세요.");
		}else if($("#evalDetail").val()==""){
			modalInfo("평가내용을 선택해주세요.");
		}else{
			insertRepayEval();			
		}
	});
	
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
	
	/* $("#repayModal").on("hidden", function(){
		$(".evalSheet").$("input").text() = "";
	}); */
	
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
	let callUrl = "/admin/moneybank/${type}/ops/repay/get";
	let callBackFunc = "moneyBankRepayResponse";
	let objParam = {
		user_id : "%"+userId+"%", // 회원명
		firm_nm : "%"+firmNm+"%", // 회사명
		rep_nm : "%"+repNm+"%", // 대표자명(회원명)
		DIVISION : selectDiv, // 서비스
		STATUS : repayStatus, // 진행상태
		fromDate : fromDate, // 시작일
		toDate : toDate, // 종료일
		minAmount : minAmount, // 최소신청금액
		maxAmount : maxAmount, // 최대신청금액
		order_by : selectOrderBy, // ORDER BY
		limit : limitStr // 현재 페이지에 보여줄 만큼 가져오기
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
	insertTable += "<thead><tr><th>상환상태</th><th>회원명</th><th>회사명</th><th>서비스구분</th><th>계약일자</th><th>승인한도</th>";
	insertTable += "</tr></thead><tbody id='fixTbody'>";
	
	// 테이블 고정칼럼
	let insertFixTBody = "";
	for(let i = 0; i<data.repayList.length; i++){
		
		let getData = data.repayList[i];
		
		insertFixTBody += "<tr>";
		let btnColor = "";
	    let displayStatus = "";
	    if(getData.cra_grade === "정상"){
	    	btnColor = "sColorGN";
	    	displayStatus = "정상";
	    } else if(getData.cra_grade === "관심"){
	    	btnColor = "sColorY";
	    	displayStatus = "관심";
	    } else if(getData.cra_grade === "경고"){
	    	btnColor = "sColorP";
	    	displayStatus = "경고";
	    } else if(getData.repayment_remaining_amount <= 0 && getData.request_status === "02"){
	    	btnColor = "sColorN";
	    	displayStatus = "만료";
	    }else{
	    	btnColor = "sColorR";
	    	displayStatus = "이상";
	    }
	    insertFixTBody += "<th><div class='tIn'><span class='sBtn "+btnColor+" rBtn'>"+displayStatus+"</span></div></th>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.user_nm+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.firm_nm+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+getData.curr_service+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+formatDate(getData.contract_date)+"</div></td>";
	    insertFixTBody += "<td><div class='tIn'>"+comma(getData.b2b_limit_amount)+"</div></td>";
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
    		
    		if(varTheadArray[j] === "모니터점수"){
    			insertScrollTbody += "<td><div class='tIn'>#모니터링점수</div></td>";
    		} else if (varTheadArray[j] === "신청일자"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.moneybank_request_date+"</div></td>";
    		} else if (varTheadArray[j] === "승인일자"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.approval_date+"</div></td>";
    		} else if (varTheadArray[j] === "만료일자"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.contract_expire_date+"</div></td>";
    		} else if (varTheadArray[j] === "B2B 도매명"){ // 일단 비밀특가로 지정
    			insertScrollTbody += "<td><div class='tIn'>비밀특가</div></td>";
    		} else if (varTheadArray[j] === "대출이자율"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.interest_rate+"</div></td>";
    		} else if (varTheadArray[j] === "수수료율"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.fee_rate+"</div></td>";
    		} else if (varTheadArray[j] === "요구불계좌"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.demand_acc_bank_nm+" "+getData.demand_acc_number+"</div></td>";
    		} else if (varTheadArray[j] === "주거래계좌"){
    			insertScrollTbody += "<td><div class='tIn'>"+getData.main_acc_bank_nm+" "+getData.main_acc_number+"</div></td>";
    		} else if (varTheadArray[j] === "이용총액"){
    			insertScrollTbody += "<td><div class='tIn'>"+comma(getData.b2b_limit_amount)+"</div></td>";
    		} else if (varTheadArray[j] === "상환원금잔액"){
    			insertScrollTbody += "<td><div class='tIn'>"+comma(getData.repayment_remaining_amount)+"</div></td>";
    		}
    	}
    	insertScrollTbody+="<td><div class='tIn'><a href='javascript:;' class='sBtn sColorG rBtn' onclick='openRepayModal(\""+getData.seq+"\",\""+getData.user_no+"\")'>보기</a></div></td>";
   		insertScrollTbody += "</tr>";
    }
    insertTable += insertScrollTbody;
	insertTable += "</tbody></table></div></div></div>";
	
	$("#fixTable").html(insertTable);
	
	// 합계 리스트
	let insertTableSum = "<div class='fixBottom'><ul class='tableTotal'>";
	insertTableSum += "<li><span class='txt'>전체 : </span>";
	insertTableSum += "<span class='result'>"+data.sumData.total_req+"</span></li>";
	insertTableSum += "<li><span class='txt'>총 이용원금 : </span>";
	insertTableSum += "<span class='result'>"+comma(data.sumData.total_amounts)+" 원</span></li>";
	insertTableSum += "<li><span class='txt'>수수료평균 : </span>";
	insertTableSum += "<span class='result'>"+comma(data.sumData.fee_amount_avg)+" 원</span></li>";
	insertTableSum += "<li><span class='txt'>원금잔액 : </span>";
	insertTableSum += "<span class='result'>"+comma(data.sumData.remain_amounts)+" 원 </span></li>";
	insertTableSum += "</ul></div>";
	$("#fixTable").append(insertTableSum);
	
	// 페이징
	pagingMaxNo =  Math.ceil(data.sumData.total_req/10);
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
	location.href="/admin/moneybank/${type}/ops/repayDetail?seq="+seq;
}

// 상환상세 현황
function modalRepayList(seq, userNo){
	
	let status = $("#repayStatusSearch").val();
	let partner = $("#repayPartnerSearch").val();
	let fromDate = $("#popFromDate").val();
	let toDate = $("#popToDate").val();
	
	let callUrl = "/admin/moneybank/${type}/ops/getRepayHistory";
	let callBackFunc = "repayHistoryResponse";
	let objParam = {
		USER_NO : userNo,
		SEQ : seq,
		STATUS : status,
		PARTNER : partner,
		fromDate : fromDate,
		toDate : toDate
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 상환상세 평가
function modalEvalList(seq, userNo){
		
	let callUrl = "/admin/moneybank/${type}/ops/getRepayEval";
	let callBackFunc = "repayEvalResponse";
	let objParam = {
		USER_NO : userNo,
		SEQ : seq
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

// 상환상세 평가 입력
function insertRepayEval(){
	
	let seq = $("#memSeq").val();
	let evalSubject = $("#evalSubject option:selected").val();
	let evalReviewer = $("#evalReviewer").val();
	let evalTitle = $("#evalTitle").val();
	let evalDetail = $("#evalDetail").val();
	
	let callUrl = "/admin/moneybank/${type}/ops/repayEvalInsert";
	let callBackFunc = "evalInsertResponse";
	let objParam = {
		eval_subject: evalSubject,
		reviewer: evalReviewer,
		title: evalTitle,
		detail: evalDetail,
		SEQ : seq
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// MODAL 상환상세 기본
function repayDetailModal(data){
	
	// 기본정보
	let infoMap = data.infoMap;
	$("#memName").text(infoMap.USER_NM);
	$("#memId").text(infoMap.USER_ID);
	$("#memApplied").text(infoMap.REG_DATE);
	
	// 요구불통장
	$("#mbAccount").text("#통장번호");
	// 주거래통장
	$("#mainAccount").text("#통장번호");
	
	let remainOriginalAmnt = infoMap.ORIGINAL_REMAINING_AMOUNT; // 원금잔액 
	let dailyFee = infoMap.DAILY_USAGE_FEE; // 수수료율
	let dailyInterest = infoMap.DAILY_INTEREST_RATE; // 수수료율
	
	$("#requestDate").text(infoMap.MONEYBANK_REQUEST_DATE);
	$("#approvalDate").text(infoMap.APPROVAL_DATE);
	$("#contractDate").text(infoMap.CONTRACT_DATE);
	$("#expireDate").text(infoMap.CONTRACT_EXPIRE_DATE);
	
	$("#totalPayment").text(comma(infoMap.B2B_LIMIT_AMOUNT));
	$("#feeRate").text(dailyFee);
	$("#interestRate").text(dailyInterest);
	
	// 상환잔액 계산
	const todayDate = new Date(infoMap.TODAY_DATE);
	const repayDate = new Date(infoMap.LAST_REPAY_DATE);
	
	let timeDiff = todayDate.getTime() - repayDate.getTime();
	let dayDiff = 1+Math.round(timeDiff/86400000); // 원금잔액을 사용한 일 수
	let toNowFee = remainOriginalAmnt*(dailyFee/100)*dayDiff; // 사용한 일수에 따른 현재 수수료
	let remainPayDisplay = Math.round(remainOriginalAmnt+toNowFee); // 상환잔액 (현시점 이만큼 상환하면 상환완료)
	$("#remainPayment").text(comma(remainPayDisplay));
	
	modalOpen("repayModal");
	
}

// MODAL 상환 현황 띄우기
function repayHistoryResponse(data){
	
	// 상환현황
	$("#repayHistoryLog").empty();
	let insertHistory = "<tr style='cursor: pointer'><td><div class='tIn'><span>데이터 없음</span></div></td></tr>";
	/* if(data.historyList.length != 0){
		for(let i = 0; i < data.historyList.length; i++){
			let getMap = data.historyList[i];
			
			// 상품정보
			let divisionDisplay = ""; // 서비스명
			if(getMap.DIVISION === '09'){
				divisionDisplay = "헬로페이 선지급";
			}
			
			let displayStatus = "";
			let btnColor = "";
			if(getMap.status === "신청"){
		    	btnColor = "sColorGN";
		    	displayStatus = "신청";
		    } else if(getMap.status === "입금"){
		    	btnColor = "sColorY";
		    	displayStatus = "입금";
		    } else if(getMap.status === "상환"){
		    	btnColor = "sColorP";
		    	displayStatus = "상환";
		    }
			
			insertHistory += '<tr style="cursor: pointer">';
			insertHistory += '<td><div class="tIn"></div></td>';
			insertHistory += '<td><div class="tIn">'+getMap.display_date+'</div></td>';
			insertHistory += '<td><div class="tIn"><span class="sBtn '+btnColor+' rBtn">'+displayStatus+'</span></div></td>';
			insertHistory += '<td><div class="tIn">'+getMap.b2b_partner+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.total_amount)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.total_amount)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.original_amount)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.interest_amount)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.fee_amount)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.return_amount)+'</div></td>';
			insertHistory += '<td><div class="tIn">'+comma(getMap.remain_amount)+'</div></td>';
			insertHistory += '<td><div class="tIn"><span class="sBtn sColorB rBtn" id="repayDetModal">보기</span></div></td>';
			insertHistory += '</tr>';
	   	}
	}else{
		insertHistory += "<tr style='cursor: pointer'><td><div class='tIn'><span>데이터 없음</span></div></td></tr>";
	} */
	$("#repayHistoryLog").html(insertHistory);
	
	$("#repayDetModal").on("click", function(){
		modalOpen("repayDetModal");
	});
	
}

//MODAL 상환 평가 띄우기
function repayEvalResponse(data){
	
	$("#repayReviewLog").empty();
	
	let insertEval = "";
	
	if(data.evalList.length != 0){
		for(let i = 0; i<data.evalList.length; i++){
			
			let getMap = data.evalList[i];
			
			insertEval+="<tr>";
			insertEval+="<td><div class='tIn'></div></td>";
			insertEval+="<td><div class='tIn'>"+getMap.INSERTDATE+"</div></td>";
			insertEval+="<td><div class='tIn'>"+getMap.REVIEWER+"</div></td>";
			insertEval+="<td><div class='tIn'>"+getMap.SUBJECT+"</div></td>";
			insertEval+="<td><div class='tIn'>"+getMap.TITLE+"</div></td>";
			insertEval+="<td><div class='tIn'>"+getMap.DETAIL+"</div></td>";
			insertEval+="</tr>";
			
		}
		
	}else{
		
		insertEval = "<tr style='cursor: pointer'><td><div class='tIn'><span>데이터 없음</span></div></td></tr>";
	}
	$("#repayReviewLog").html(insertEval);
}

// 평가등록 완료 Func
function evalInsertResponse(data){
	
	if(data.resultCode == 0){
		
		modalInfo("평가가 등록되었습니다.");
		
		$("#evalSubject").val("").prop("selected", true);
		$("#evalReviewer").val("");
		$("#evalTitle").val("");
		$("#evalDetail").val("");
	}
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
                <span class="ft">서비스 구분</span>
                <div class="input">
                    <select id="selectDivSearch">
                    <c:forEach var="product" items="${productList}" varStatus="status">
                    	<option value="${product.DIVISION}">${product.PRODUCT_NAME}</option>
                    </c:forEach>
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
                    <input type="text" class="startDatepicker" placeholder="시작기간" id="fromDate">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">계약일자</span>
                <div class="input">
                    <input type="text" class="endDatepicker" placeholder="종료기간" id="toDate">
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
                        <option value="CONTRACT_DATE DESC">최근 순</option>
                        <option value="CONTRACT_DATE ASC">과거 순</option>
                        <option value="B2B_LIMIT_AMOUNT">승인한도</option>
                        <option value="DAILY_USAGE_FEE">수수료율</option>
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
                            <span>서비스 구분</span>
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
                            <span>승인한도</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" disabled checked>
                            <span>모니터점수</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" disabled checked>
                            <span>신청일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" disabled checked>
                            <span>승인일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" disabled checked>
                            <span>만료일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>B2B 도매명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>신청일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>대출이자율</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>요구불계좌</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>주거래계좌</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>이용총액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>상환원금잔액</span>
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
<div class="modal-container" id="repayModal" style="">
    <div class="modal-wrapper">
        <header>
            <h2>상환 상세 정보</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner mArticleArea tabArea">
                <article class="m-modalGrid">
                    <header class="m-options">
                        <h3>이용서비스 : 헬로페이 선지급</h3>
                        <span class="baseDate pRight"><b>작성 기준일</b>${todayDateStr}</span>
                    </header>
                    <input type="hidden" id="memSeq">
                    <div class="contentsArea">
                    	<ul class="item">
                         	<li>
                                <div class="fwBox">
                                    <span class="ft">이름</span>
                                    <div class="input" id="memName"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">회원ID</span>
                                    <div class="input" id="memId"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">최초가입</span>
                                    <div class="input" id="memApplied"></div>
                                </div>
                            </li>
                        </ul>
                    	<ul class="item">
                         	<li>
                                <div class="fwBox">
                                    <span class="ft">머니뱅크 계좌</span>
                                    <div class="input" id="mbAccount"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">주거래 계좌</span>
                                    <div class="input" id="mainAccount"></div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">신청일자</span>
                                    <div class="input" id="requestDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">승인일자</span>
                                    <div class="input" id="approvalDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">계약일자</span>
                                    <div class="input" id="contractDate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">만료일자</span>
                                    <div class="input" id="expireDate"></div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">계약금액</span>
                                    <div class="input" id="totalPayment"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">대출이자</span>
                                    <div class="input" id="interestRate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">수수료</span>
                                    <div class="input" id="feeRate"></div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">기타</span>
                                    <div class="input" id=""></div>
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
                            <!-- <div class="btns">
                                <a href="javascript:;" class="sBtn sColorN">상환 연장 신청</a>
                            </div> -->
                        </header>
                        <div class="m-search">
						   <ul>
						       <li>
						          <div class="fwBox">
						                <span class="ft">상태</span>
						                <div class="input" id="repayStatusSearch">
						                    <select>
						                        <option value="-">전체</option>
						                        <option value="">상환</option>
						                        <option value="">입금</option>
						                        <option value="">신청</option>
						                    </select>
						                </div>
						           </div>
						       </li>
						       <li>
								<div class="fwBox">
								      <span class="ft">B2B업체</span>
								      <div class="input" id="repayPartnerSearch">
								          <select>
								              <option value="-">전체</option>
								              <option value="">업체1</option>
								              <option value="">업체2</option>
								          </select>
								      </div>
								</div>
						        </li>
						        <li>
						            <div class="fwBox">
						                <span class="ft">계약일자</span>
						                <div class="input">
						                    <input type="text" id="popFromDate">
						                </div>
						            </div>
						        </li>
						        <li>
						            <div class="fwBox">
						                <span class="ft">계약일자</span>
						                <div class="input">
						                    <input type="text" id="popToDate">
						                </div>
						            </div>
						        </li>
						        <li>
						            <div class="btns">
						                <button class="sBtn sColorLB search" id="modalSearchBtn">검색</button>
						            </div>
						        </li>
						    </ul>
						</div>
                        <div class="maxHeight">
                            <table class="m-shadowTable tal">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>일자</th>
                                        <th class="tal">구분</th>
                                        <th>B2B도매몰</th>
                                        <th>선지급 총액</th>
                                        <th>상환총액</th>
                                        <th>원금</th>
                                        <th>이자</th>
                                        <th>수수료</th>
                                        <th>잔액반환</th>
                                        <th>잔여이용가능금액</th>
                                        <th>상세보기</th>
                                    </tr>
                                </thead>
                                <tbody id="repayHistoryLog"></tbody>
                            </table>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <header>
                            <h3>회원 평가</h3>
                            <div class="btns">
                                <a class="sBtn sColorN" id="insertEval" style="cursor: pointer">평가하기</a>
                            </div>
                        </header>
                        <div class="contentsArea evalSheet">
	                       <ul class="item">
                               <li class="col-1">
                                   <div class="fwBox">
                                   	<span class="ft">작성일자</span>
                                       <div class="input">
                                           <input type="text" class="datepicker" id="evalDate">
                                       </div>
                                   </div>
                               </li>
                               <li class="col-1">
                                   <div class="fwBox">
                                       <span class="ft">구분</span>
                                       <div class="input">
                                           <select id="evalSubject">
                                               <option value="">선택</option>
                                               <option value="서류">서류</option>
                                               <option value="심사">심사</option>
                                               <option value="계약">계약</option>
                                               <option value="상환">상환</option>
                                               <option value="해지">해지</option>
                                           </select>
                                       </div>
                                   </div>
                               </li>
                               <li class="col-1">
                                   <div class="fwBox">
                                   	<span class="ft">담당자</span>
                                       <div class="input">
                                           <input type="text" id="evalReviewer">
                                       </div>
                                   </div>
                               </li>
	                       </ul>
	                       <ul class="item">
                              <li class="col-1">
                                   <div class="fwBox">
                                       <span class="ft">제목</span>
                                       <div class="input">
                                           <input type="text" id="evalTitle">
                                       </div>
                                   </div>
                               </li>
                           </ul>
                           <br>
                           <div class="fwBox textarea">
                               <div class="input">
                                   <textarea id="evalDetail" placeholder="회원평가를 작성하여주세요"></textarea>
                               </div>
                           </div>
                           <!-- <div class="addBtns">
                               <a href="javascript:;" class="sBtn sColorLG">작성</a>
                               <a href="javascript:;" class="sBtn sColorLG">수정</a>
                               <a href="javascript:;" class="sBtn sColorLB">확인</a>
                           </div> -->
                           <br>
                        </div>
                        <div class="maxHeight">
                            <table class="m-shadowTable tal">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>일자</th>
                                        <th>작성자</th>
                                        <th>구분</th>
                                        <th>제목</th>
                                        <th>주의</th>
                                    </tr>
                                </thead>
                                <tbody id="repayReviewLog"></tbody>
                            </table>
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

<!-- 상환 상세정보 MODAL -->
<div class="modal-container" id="repayDetModal" style="">
    <div class="modal-wrapper">
        <header>
            <h2>상환 상세 내역</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner mArticleArea tabArea">
                <div class="m-tabBox active">
                	<article class="m-modalGrid">
                        <header>
                            <h3>상환 입금 상세내역</h3>
                        </header>
                        <div class="maxHeight">
                            <table class="m-shadowTable tal">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>기준일자</th>
                                        <th>상환구분</th>
                                        <th>쇼핑몰</th>
                                        <th>주문건수</th>
                                        <th>입금 금액</th>
                                        <th>비고</th>
                                    </tr>
                                </thead>
                                <tbody id="detModalDetailLog"></tbody>
                            </table>
                        </div>
                    </article>
                </div>
                <div class="btnArea">
                    <a href="javascript:;" class="modalClose mBtn sColorLB">확인</a>
                </div>
            </div>
        </div>
    </div>
</div>