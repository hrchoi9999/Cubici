<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>

$(document).ready(function(){
	// 상단데이터 띄우기
	$("#prevUser").html(comma(${mainInfo.PREVDATE_COUNT}));
	$("#cumulUser").html(comma(${mainInfo.CUMUL_COUNT}));
	$("#prevTotal").html(${mainInfo.PREVDATE_TOTALPAY});
	$("#cumulTotal").html(${mainInfo.CUMUL_TOTALPAY});
	$("#prevOriginal").html(${mainInfo.PREV_ORIGINAL_AMOUNT});
	$("#cumulOriginal").html(${mainInfo.CUMUL_ORIGINAL_AMOUNT});
	$("#remainTotal").html(${mainInfo.REPAYMENT_REMAINING_AMOUNT});
	$("#prevTtlRepayCount").html(comma(${mainInfo.PREVDATE_REPAY_COUNT}));
	$("#cumulTtlRepayCount").html(comma(${mainInfo.CUMUL_REPAY_COUNT}));
	$("#prevOriginalCount").html(comma(${mainInfo.PREVDATE_REPAY_COUNT}));
	$("#cumulOriginalCount").html(comma(${mainInfo.CUMUL_REPAY_COUNT}));
	$("#cumulRemainCount").html(comma(${mainInfo.CUMUL_REPAY_COUNT}));

	// Default 날짜 설정
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");
	
	// 계정별 탭 링크 수정
	let tabUrl = "";
	
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

// 그래프 표시
function graphDisplay(){
	
	// parameters
	let selectUnit = $("#DateAnalysisUnit option:selected").val();
	let fromDate = $("#fromDate").val(); 
	let toDate = $("#toDate").val();
	
	
	if(selectUnit == undefined || selectUnit == ""){
		modalInfo("분석 단위를 선택해 주세요.");
		return;
	}
	
	// 주단위일 경우 fromDate가 주중이면 그 주 일요일로 변경
	if(selectUnit == "week"){
		let firstDate = new Date(fromDate);
		let firstWeekDay = firstDate.getDay();
		if(firstWeekDay != 0){
			firstDate.setDate(firstDate.getDate()-firstWeekDay);
			fromDate = firstDate.toISOString().split("T")[0];
		}
	}
	
	// 데이터 호출
	let callUrl = "/admin/moneybank/${type}/management/info_tab1/get";
	let callBackFunc = "graphResponse"
	let objParam = {
		dateFlag : selectUnit,
		fromDate : fromDate,
		toDate : toDate
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 가져온 데이터로 그래프 그리기
function graphResponse(data){
	
	// 날짜 범위
	let fromDate = $("#fromDate").val(); 
	let toDate = $("#toDate").val();
	
	// 가져온 데이터
	let memList = "";
	let wdList = "";
	let userList = "";
	let reuserList = "";
	
	if(data.memberData){
		memList = data.memberData;
	}if(data.withdrawData){
		wdList = data.withdrawData;
	}if(data.userData){
		userList = data.userData;
	}if(data.reuserData){
		reuserList = data.reuserData;
	}
	
	// 누적시 더할 초기값
	let moneybankPrevCount = 0;
	let userPrevCount = 0;
	let userPrevAmount = 0;
	let reuserPrevCount = 0;
	
	if(memList != ""){
		 moneybankPrevCount = memList[0].PREV_MB_COUNT;
		 userPrevCount = memList[0].PREV_USER_COUNT;
		 userPrevAmount = memList[0].PREV_USER_AMOUNT; 
		 reuserPrevCount = memList[0].PREV_REUSER_COUNT;
	}
	
	//*** X축 (단위에 따라 날짜 Array)
	let dateArr = new Array();
	let selectUnit = $("#DateAnalysisUnit option:selected").val();
	
	if(selectUnit == "day"){
		dateArr = getDateStartToLast(fromDate, toDate, 0);
	}else if(selectUnit == "week"){
		dateArr = getDateStartToLast(fromDate, toDate, 1);
	}else if(selectUnit == "month"){
		dateArr = getDateStartToLast(fromDate, toDate, 2);
	}
	
	// 주 단위 검색의 경우 주차수 구하여 저장하기
	let weekCountArr = new Array();
	for(let i = 0; i<dateArr.length; i++){
		let thisweeknum = getNumberOfWeek(dateArr[i]);
		weekCountArr[i] = thisweeknum;
	}
	
	//*** Y축 (데이터 단위에 따라 Array 생성)
	let memberArr = []; // 신규회원
	let withdrawArr = []; // 해지회원
	let userArr = []; // 이용회원
	let netPaymentArr = []; // 이용금액
	let reuserArr = []  // 재이용자
	
	if(selectUnit == "day"){ // 일 단위
		memberArr = arrayBuildFunc(dateArr, memList, 'COUNT', 0); 
		withdrawArr = arrayBuildFunc(dateArr, wdList, 'COUNT', 0); 
		userArr = arrayBuildFunc(dateArr, userList, 'COUNT', 0); 
		netPaymentArr = arrayBuildFunc(dateArr, userList, 'AMOUNT', 0); 
		reuserArr = arrayBuildFunc(dateArr, reuserList, 'COUNT', 0);
	}else if(selectUnit == "week"){ // 주 단위
		memberArr = arrayBuildFunc(weekCountArr, memList, 'COUNT', 1);
		withdrawArr = arrayBuildFunc(weekCountArr, wdList, 'COUNT', 1);
		userArr = arrayBuildFunc(weekCountArr, userList, 'COUNT', 1);
		netPaymentArr = arrayBuildFunc(weekCountArr, userList, 'AMOUNT', 1);
		reuserArr = arrayBuildFunc(weekCountArr, reuserList, 'COUNT', 1);
	}else if(selectUnit == "month"){ // 월 단위
		memberArr = arrayBuildFunc(dateArr, memList, 'COUNT', 2);
		withdrawArr = arrayBuildFunc(dateArr, wdList, 'COUNT', 2);
		userArr = arrayBuildFunc(dateArr, userList, 'COUNT', 2);
		netPaymentArr = arrayBuildFunc(dateArr, userList, 'AMOUNT', 2);
		reuserArr = arrayBuildFunc(dateArr, reuserList, 'COUNT', 2);
	}
	let totalUserArr = buildCumulArray(userArr, userPrevCount); // 이용회원 누적
	let totalPaymentArr = buildCumulArray(netPaymentArr, userPrevAmount); // 이용금액 누적	
	let reuserTotalArr = buildCumulArray(reuserArr, reuserPrevCount); // 재사용자 누적
	
	//***** 회원현황 GRAPH *****//
	// 누적 회원		
	let netArr = new Array(); // Net값 array
	for(let i = 0; i < dateArr.length; i++){
		netArr.push(memberArr[i]-withdrawArr[i]);
	}
	let cumulArr = buildCumulArray(netArr, moneybankPrevCount); // 누적회원
	
	// 회원현황 그래프 FUNC
	memberGraphDisplay(dateArr, memberArr, withdrawArr, cumulArr);
	
	//***** 이용현황 GRAPH *****//
	// 평균 선정산금액
	let avgArr = new Array(); // 평균금액
	for(let i = 0; i<dateArr.length; i++){
		let avgVal = (totalPaymentArr[i]/totalUserArr[i]);
		avgArr.push(avgVal);
	}
	// 이용현황 그래프 FUNC
	userAmountGraphDisplay(dateArr, totalUserArr, totalPaymentArr, avgArr);
	
	//***** 서비스 이용률 GRAPH *****//
	// 서비스 이용률
	let percentArr = new Array(); // 이용률
	for(let i = 0; i<dateArr.length; i++){
		let percentVal = 0;
		if(cumulArr[i]==0){
			percentVal = 0;
		}else{
			percentVal = 100*(totalUserArr[i]/cumulArr[i]);
		}
		percentArr.push(percentVal);
	}
	
	// 이용률 그래프 FUNC
	userRatioGraphDisplay(dateArr, cumulArr, totalUserArr, reuserTotalArr, percentArr);	
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
	
	// 시작일이 주중인 경우 그 전 일요일도 가져옴 
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

// Y축 데이터 날짜에 맞춰 ARRAY 만들어주는 FUNC (일,월 단위 = dateArr 은 날짜 / 주 단위 = dateArr은 주차수)
function arrayBuildFunc(dateArr, dataList, flag, unitFlag){
	
	let resultArr = [];
	if(dataList[0] != null){
		// array에 날짜 위치에 값 저장
		for(let j = 0; j < dataList.length; j++){ // 날짜 순으로 숫자 넣어주기
			for(let i = 0; i<dateArr.length; i++){
				if(unitFlag == 0){ // 일 단위
					let thisMap = dataList[j];
					let thisDate = dateArr[i];
					if(thisDate == thisMap.FOR_DATE){
						if(flag=="COUNT"){
							resultArr[i] = thisMap.COUNT;
						}else if(flag == "AMOUNT"){
							resultArr[i] = thisMap.AMOUNT;
						}
					}
				}else if(unitFlag == 1){ // 주 단위
					let thisMap = dataList[j];
					let thisWeek = dateArr[i];
					if(thisWeek == thisMap.WEEKCOUNT){
						if(flag=="COUNT"){
							resultArr[i] = thisMap.COUNT;
						}else if(flag == "AMOUNT"){
							resultArr[i] = thisMap.AMOUNT;
						}
					}
				}else if(unitFlag == 2){ // 월 단위
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

// 누적 ARRAY FUNC
function buildCumulArray(arr, startValue){
	
	let resultArr = cumulative(arr);
	
	for(let i = 0; i<resultArr.length; i++){
		let thisVal = resultArr[i];
		resultArr[i] = thisVal+startValue; 
	}
	
	return resultArr;
}

// 금년 주차 수 계산해주는 FUNC
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
        <li class="active"><a href="/admin/moneybank/${type}/management/info_tab1">현황 종합</a></li>
        <li><a href="/admin/moneybank/${type}/management/info_tab2">운영지표</a></li>
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

<!-- 메인 상단 정보 -->
<div class="colorTxtBoxArea">
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/user-round.png" alt="신규가입">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>머니뱅크 회원</h3></th>
                    <td><span class="gray">(명)</span></td>
                </tr>
                <tr>
                    <td colspan="2">•금일: <span id="prevUser"></span></td>
                </tr>
                <tr>
                    <td colspan="2">•누적: <span id="cumulUser"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/money-get.svg" alt="해지회원">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>서비스 원금누적</h3></th>
                    <td><span class="gray">(백만원)</span></td>
                </tr>
                <tr>
                    <td>•금일: <span id="prevTotal"></span></td>
                    <td><span id="prevTtlRepayCount"></span> 건</td>
                </tr>
                <tr>
                    <td>•누적: <span id="cumulTotal"></span></td>
                    <td><span id="cumulTtlRepayCount"></span> 건</td>
                </tr>
            </table>
		</div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/won-round.svg" alt="금액">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>상환 원금누적</h3></th>
                    <td><span class="gray">(백만원)</span></td>
                </tr>
                <tr>
                    <td>•금일: <span id="prevOriginal"></span></td>
                    <td><span id="prevOriginalCount"></span> 건</td>
                </tr>
                <tr>
                    <td>•누적: <span id="cumulOriginal"></span></td>
                    <td><span id="cumulOriginalCount"></span> 건</td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/scale.svg" alt="건수">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>상환 원금잔액</h3></th>
                    <td><span class="gray">(백만원)</span></td>
                </tr>
                <tr>
                    <td>•잔액총액 : <span id="remainTotal"></span></td>
                    <td><span id="cumulRemainCount"></span> 건</td>
                </tr>
            </table>
        </div>
    </article>
</div>

<!-- 경고 회원 리스트 -->
<div class="mArticleArea stateTableArea">
    <div class="stateBox sColorP">
        <div class="txt">
            <img src="/resources/rudicks/admin/img/icon/warning.svg" alt="경고">
            <p>경고</p>
        </div>
    </div>
    <div class="maxHeight">
        <table class="m-shadowTable style-gray">
            <thead>
                <tr>
                    <th>선정산ID</th>
                    <th>성명</th>
                    <th>회사명</th>
                    <th>선정산금액</th>
                    <th>선정산잔액</th>
                    <th>이상증후</th>
                    <th>연락처</th>
                    <th>프리즘</th>
                    <th>CRA</th>
                </tr>
            </thead>
            <tbody id="warnTableBody">
                <tr>
                	<th><span>조회된 데이터가 없습니다.</span></th>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- 검색 조건 -->
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

<!-- 그래프 영역 START -->
<article class="subBox">
    <header>
        <h4>머니뱅크 회원 현황</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac3p1-1"></canvas>
            
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>머니뱅크 이용 현황</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac3p1-2"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>서비스 이용률</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac3p1-3"></canvas>
        </div>
    </div>
</article>

<script src="/resources/chart-admin/ac3p1-1.js"></script>
<script src="/resources/chart-admin/ac3p1-2.js"></script>
<script src="/resources/chart-admin/ac3p1-3.js"></script>