<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>

$(document).ready(function(){

	// 상단데이터 띄우기
	$("#reqCount").html(comma(${operationInfo.REQ_COUNT}));
	$("#evalCount").html(comma(${operationInfo.EVAL_COUNT}));
	$("#contractCount").html(comma(${operationInfo.CONTRACT_COUNT}));
	$("#finCount").html(comma(${operationInfo.FIN_COUNT}));
	$("#runCount").html(comma(${operationInfo.RUNNING_COUNT}));
	$("#originalAmount").html(comma(${operationInfo.ORIGINAL_REPAYED}));
	$("#feeAmount").html(comma(${operationInfo.FEE_REPAYED}));
	$("#remainAmount").html(comma(${operationInfo.REMAINING_AMOUNT}));
	
	// Default 날짜 설정
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");

	//구분 셀렉트 박스 옵션	
	let selectDivision = $('.selectDivision')[0].id;
	selectMenuList(selectDivision);
	
	$("#DateAnalysisUnit").val("day").prop("selected", true);
	
	// 그래프 띄우기
	graphDisplay();
	
	// 검색 버튼
	$("#searchBtn").on("click", function(){
		graphDisplay();
	})
	
});

// 그래프 데이터 가져오는 FUNC
function graphDisplay(){
	
	// parameters
	let selectUnit = $("#DateAnalysisUnit option:selected").val();
	let fromDate = $("#fromDate").val(); 
	let toDate = $("#toDate").val();
	
	if(selectUnit == undefined || selectUnit == ""){
		modalInfo("분석 단위를 선택해 주세요.")
		return;
	}
	

	let	callUrl = "/admin/moneybank/${type}/management/info_tab2/get";		
	let callBackFunc = "graphResponse"
	let objParam = {
		dateFlag : selectUnit,
		fromDate : fromDate,
		toDate : toDate
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 그래프 그리는 FUNC
function graphResponse(data){
	
	// 날짜 범위
	let fromDate = $("#fromDate").val(); 
	let toDate = $("#toDate").val();
	
	// 가져온 데이터
	let reqList = data.requestData;
	let evalList = data.evalData;
	let approveList = data.approvalData;
	let repayList = data.originalData;
	let remainList = data.remainData;
	let feeList = data.feeData;
	
	// 누적시 더할 초기값
	let prevRequestAmount = reqList[0].PREV_REQUEST_AMOUNT;
	let prevApproveAmount = reqList[0].PREV_APPROVED_AMOUNT;
	let prevOriginalAmount = reqList[0].PREV_ORIGINAL_AMOUNT;
	
	//*** X축 (범위내의 모든 날짜를 저장한 Array)
	let dateArr = new Array();
	let selectUnit = $("#DateAnalysisUnit option:selected").val();
	if(selectUnit == "day"){
		dateArr = getDateStartToLast(fromDate, toDate, 0);
	}else if(selectUnit == "week"){
		dateArr = getDateStartToLast(fromDate, toDate, 1);
	}else if(selectUnit == "month"){
		dateArr = getDateStartToLast(fromDate, toDate, 2);
	}
	
	// 주 단위 (날짜 대신 주차수 구하여 저장한 Array)
	let weekCountArr = new Array();
	for(let i = 0; i<dateArr.length; i++){
		let thisweeknum = getNumberOfWeek(dateArr[i]);
		weekCountArr[i] = thisweeknum;
	}
	
	//*** Y축 (단위에 따라 쓰일 Array 생성)
	let requestArr = []; // 신청금액
	let evalArr = []; // 심사금액
	let approveArr = []; // 계약(승인)금액
	let repayArr = []; // 상환금액
	
	if(selectUnit == "day"){ // 일 단위
		requestArr = arrayBuildFunc(dateArr, reqList, 'AMOUNT', 0);
		evalArr = arrayBuildFunc(dateArr, evalList, 'AMOUNT', 0);
		approveArr = arrayBuildFunc(dateArr, approveList, 'AMOUNT', 0);
		repayArr = arrayBuildFunc(dateArr, repayList, 'AMOUNT', 0);
	}else if(selectUnit == "week"){ // 월 단위
		requestArr = arrayBuildFunc(weekCountArr, reqList, 'AMOUNT', 1);
		evalArr = arrayBuildFunc(weekCountArr, evalList, 'AMOUNT', 1);
		approveArr = arrayBuildFunc(weekCountArr, approveList, 'AMOUNT', 1);
		repayArr = arrayBuildFunc(weekCountArr, repayList, 'AMOUNT', 1);
	}else if(selectUnit == "month"){ // 월 단위
		requestArr = arrayBuildFunc(dateArr, reqList, 'AMOUNT', 2);
		evalArr = arrayBuildFunc(dateArr, evalList, 'AMOUNT', 2);
		approveArr = arrayBuildFunc(dateArr, approveList, 'AMOUNT', 2);
		repayArr = arrayBuildFunc(dateArr, repayList, 'AMOUNT', 2);
	}
	let reqCumulArr = buildCumulArray(requestArr, prevRequestAmount); // 누적 신청금액
	let appCumulArr = buildCumulArray(approveArr, prevApproveAmount); // 누적 계약금액
	let repayCumulArr = buildCumulArray(repayArr, prevOriginalAmount); // 누적 상환금액
	
	// ***** 신청/심사/계약 GRAPH *****//
	let reqAppRatioArr = new Array(); // 신청대비계약 비율
	for(let i = 0; i<dateArr.length; i++){
		let reqUseRatio = 0;
		reqUseRatio = 100*(appCumulArr[i]/reqCumulArr[i]);
		reqAppRatioArr.push(reqUseRatio);
	}
	
	// 그래프 그리기
	toContractGraph(dateArr, requestArr, evalArr, approveArr, reqAppRatioArr);

	
	//***** 계약/상환/잔액 GRAPH *****//
	let remainArr = new Array(); // 잔액
	for(let i = 0; i<dateArr.length; i++){
		let thisAmnt = appCumulArr[i]-repayCumulArr[i];
		remainArr.push(thisAmnt);
	}
	// 잔액 비율
	let remainRatioArr = new Array();
	for(let i = 0; i<dateArr.length; i++){
		let remainRatio = 0.00;
		if(appCumulArr[i]==0){
			remainRatio = 0.00;
		}else{
			remainRatio = 100*(remainArr[i]/appCumulArr[i]);
		}
		remainRatioArr.push(remainRatio);
	}

	// 그래프 그리기
	repayRemainGraph(dateArr, appCumulArr, repayCumulArr, remainArr, remainRatioArr);
	
	
	//***** 머니뱅크 수수료 GRAPH *****//
	let feeArr = new Array(); // 일일 수수료 금액
	for(let i = 0; i<dateArr.length; i++){ // 현재는 투게더 형식만 적용
		let thisFee = 0.0005*remainArr[i]
		feeArr.push(thisFee);
	}
	
	// 잔액대비 수수료 비율
	let feeRatioArr = new Array();
	for(let i = 0; i<dateArr.length; i++){
		let feeRatio = 0.00;
		feeRatio = 100*(feeArr[i]/remainArr[i]);
		feeRatioArr.push(feeRatio);
	}
	
	// 그래프 그리기
	feeAmountGraph(dateArr, feeArr, feeRatioArr);
}

//X축 날짜 ARRAY 가져오는 FUNC (unitFlag ::: 0 = day , 1 = week, 2 = month)
function getDateStartToLast(startDate, lastDate, unitFlag) {
	// 형태 검증
	var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
	if(!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
	var result = [];
	var curDate = new Date(startDate);

	// 범위 내의 날짜를 단위별로 저장
	while(curDate <= new Date(lastDate)) {
		if(unitFlag == 0){ // 일 단위
			result.push(curDate.toISOString().split("T")[0]);
		}else if(unitFlag == 1){ // 주 단위
			let weekDay = curDate.getDay();			
			if(weekDay == 0){
				result.push(curDate.toISOString().split("T")[0]);			
			}
		
		}else if(unitFlag == 2){ // 월 단위
			result.push(curDate.toISOString().substr(0,7));
		}
		curDate.setDate(curDate.getDate() + 1);
	}
	
	// 주 단위는 시작일이 주중인 경우 그 전 일요일도 가져옴 
	if(unitFlag == 1){
		let firstDate = new Date(startDate);
		let firstWeekDay = firstDate.getDay();
		if(firstWeekDay != 0){
			firstDate.setDate(firstDate.getDate()-firstWeekDay);
			let firstEntry = firstDate.toISOString().split("T")[0];
			result.unshift(firstEntry);
		}
	}
	
	// 월 단위는 날짜 중복 처리
	if(unitFlag == 2){
		let uniqueArr = []; // 처리된 배열
		for (var i=0; i<result.length; i++) {
			  if (uniqueArr.indexOf(result[i]) === -1) 
				  uniqueArr.push(result[i]);
			}
		return uniqueArr;
	}else{
		return result;
	}
}

//Y축 데이터 날짜에 맞춰 ARRAY 만들어주는 FUNC (일,월 단위 = dateArr 은 날짜 / 주 단위 = dateArr은 주차수)
function arrayBuildFunc(dateArr, dataList, flag, unitFlag){
	let resultArr = [];
	if(dataList[0] != null){
		// array에 날짜 위치에 값 저장
		for(let j = 0; j < dataList.length; j++){ // 날짜 순으로 숫자 넣어주기
			for(let i = 0; i<dateArr.length; i++){
				if(unitFlag == 0){
					let thisMap = dataList[j];
					let thisDate = dateArr[i];
					if(thisDate == thisMap.FOR_DATE){
						if(flag=="COUNT"){
							resultArr[i] = thisMap.COUNT;
						}else if(flag == "AMOUNT"){
							resultArr[i] = thisMap.AMOUNT;
						}
					}
				}else if(unitFlag == 1){
					let thisMap = dataList[j];
					let thisWeek = dateArr[i];
					if(thisWeek == thisMap.WEEKCOUNT){
						if(flag=="COUNT"){
							resultArr[i] = thisMap.COUNT;
						}else if(flag == "AMOUNT"){
							resultArr[i] = thisMap.AMOUNT;
						}
					}
				}else if(unitFlag == 2){
					let thisMap = dataList[j];
					let thisDate = dateArr[i];
					if(thisDate == thisMap.YEARMONTH){
						if(flag=="COUNT"){
							resultArr[i] = thisMap.COUNT;
						}else if(flag == "AMOUNT"){
							resultArr[i] = thisMap.AMOUNT;
						}
					}
				}
			}
		}
		// 비어있는 부분 0으로 대체
		for(let i = 0; i < dateArr.length; i++){
			if(resultArr[i]==null || resultArr[i]==""){
				resultArr[i] = 0;
			}
		}
	}else {
		for(let i = 0; i < dateArr.length; i++){
			resultArr[i] = 0;
		}
	}
	return resultArr;
}

//누적 ARRAY FUNC
function buildCumulArray(arr, startValue){
	let resultArr = cumulative(arr);
	for(let i = 0; i<resultArr.length; i++){
		let thisVal = resultArr[i];
		resultArr[i] = thisVal+startValue; 
	}
	return resultArr;
}

// 금년의 몇 주차인지 계산해주는 FUNC
function getNumberOfWeek(forDate) {
	let thisDay = new Date(forDate);
    let firstDayOfYear = new Date(thisDay.getFullYear(), 0, 1);
    let pastDaysOfYear = (thisDay - firstDayOfYear) / 86400000;
    let resultVal = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)-1;
    return resultVal;
}

</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/moneybank/${type}/management/info_tab1">현황 종합</a></li>
        <li class="active"><a href="/admin/moneybank/${type}/management/info_tab2">운영지표</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="infoArea">
            <a href="javascript:;" class="oiBtn infoBtn navy">정보</a>
            <div class="infoMemo">
                <div class="iCon">
                    <p>• 금일 : 기준일자(D) 하루 전 (D-1)기준으로 산출됩니다.  </p>
                    <p>• 당월 : 당월 1일부터 D-1까지의 누적 합계 </p>
                    <p>• 전월 : 전월 1일부터 말일까지의 합계 </p>
                </div>
            </div>
        </span>
        <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
    </div>
</div>

<div class="colorTxtBoxArea">
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/doc-pen.svg" alt="신규가입">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>신규 신청</h3>
                <p class="bold"><b><span id="reqCount"></span></b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/doc-search.svg" alt="해지회원">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>신규 심사</h3>
                <p class="bold"><b><span id="evalCount"></span></b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/shack-hands.svg" alt="금액">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>신규 계약</h3>
                <p class="bold"><b><span id="contractCount"></span></b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/doc-del.svg" alt="건수">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>계약 종료</h3>
                <p class="bold"><b><span id="finCount"></span></b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            ${thisProduct}<br>운영건수
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b><span id="runCount"></span></b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            ${thisProduct}<br>상환금액
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b><span id="originalAmount"></span></b> 백만원</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            ${thisProduct}<br>원금잔액
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b><span id="remainAmount"></span></b> 백만원</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            ${thisProduct}<br>수수료
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b><span id="feeAmount"></span></b> 백만원</p>
            </div>
        </div>
    </article>
</div>

<div class="m-search">
    <ul>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">구분</span>
                <div class="input">
                    <select>
                        <option value="">전체</option>
                    </select>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">분석단위</span>
                <div class="input">
					<select class = "form-control selectDivision" id ="DateAnalysisUnit"></select>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">시작</span>
                <div class="input">
                    <input type="text" class="datepicker" placeholder="시작기간" id="fromDate">
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">종료</span>
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
        <li>
            <div class="btns">
                <button class="sBtn sColorLG excel">엑셀 다운로드</button>
            </div>
        </li>
    </ul>
</div>

<article class="subBox">
    <header>
        <h4>신청/심사/계약</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac3p1-2-1"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>계약/상환/잔액</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac3p1-2-2"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>머니뱅크 수수료</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac3p1-2-3"></canvas>
        </div>
    </div>
</article>

<script src="/resources/chart-admin/ac3p1-2-1.js"></script>
<script src="/resources/chart-admin/ac3p1-2-2.js"></script>
<script src="/resources/chart-admin/ac3p1-2-3.js"></script>