<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
let fromDate = "";//시작일 전역변수
let toDate = "";//종료일 전역변수
let dateUnit = "day";//일 주 월 분석단위

$(document).ready(function(){
	//구분 셀렉트 박스 옵션
	let selectDivision = $('.selectDivision')[0].id;
	selectMenuList(selectDivision);
	
	if(fromDate == "" && toDate == ""){
		$("#fromDate").val("${fromDate}");// 초기값 시작일 셋팅
		$("#toDate").val("${toDate}");// 초기값 종료일 셋팅
		fromDate = $("#fromDate").val();
		toDate = $("#toDate").val();
	}

	if(${resultCode} === 0){
		totalChart(fromDate, toDate); //종합 차트
	}else{
		console.log("resultCode ::: ${resultCode}");
	}
	
	$("#keywordBtn").on("click", function(){
		
		fromDate = $("#fromDate").val(); // 시작일
		toDate = $("#toDate").val(); // 종료일 
		dateUnit = $('#'+selectDivision).val(); //분석단위
		
		if(dateUnit == ""){
			alert("분석단위를 선택해주세요");
			return;
		}
		
		//주단위 분석시 시작일을 일요일로 종료일을 토요일로 셋팅
		if(dateUnit == "Week"){
			fromdayNum = new Date(fromDate).getDay();
			fromDate = formatDate(dayCalculation(fromDate, fromdayNum, "-"));//날짜 일 계산 함수이용
			todayNum = 6 - new Date(toDate).getDay();
			toDate = formatDate(dayCalculation(toDate, todayNum, "+"));//날짜 일 계산 함수이용
		}else if(dateUnit == "Month"){
			fromDate = MonthFirsrOrLast(fromDate, "first");
			toDate = MonthFirsrOrLast(toDate, "last");//월 시작일(월의 1일) 종료일(월의 마지막일) 계산
		}
		
		totalChart(fromDate, toDate); // 종합 차트
	});
	
});

//회원 현황 그래프
function totalChart(fromDate, toDate){
	
	let callUrl = "/admin/cubici/infoIntegrated/moneybank_tab1/totalchart";
	let callBackFunc = "totalChartResponse";
	let objParam = {
			fromDate : fromDate,
			toDate : toDate
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// totalChart callback 함수
function totalChartResponse(result){

	let barLabel = "";//차트 하단 값
	let dataListUser = result.resultListUser;//db데이터 list 회원 현황
	let dataListUsage = result.resultListUsage;//db데이터 list 이용 현황
	let dataListService = result.resultListService;//db데이터 list 서비스 이용율
	
	if(dateUnit == "day"){
		barLabel = getDatesStartToLast(fromDate,toDate);//분석일이 일단위 일시 일단위 barLabel을 채워줌
	}else if(dateUnit == "week"){
		barLabel = weekFunc(fromDate, toDate);//분석일이 주단위 일시 주단위 barLabel을 채워줌
	}else if(dateUnit == "month"){// 분석일이 월 단위일경우 월 단위를 채워줌
		barLabel = monthFunc(fromDate, toDate);
	}
	
	//arrAccumFunc 함수로 차트 하단값, db데이터List, 날짜칼럼, 구해올 칼럼을 보냄
	let mbNewUser = arrAccumFunc(barLabel, dataListUser, "TRI_DATE", "TRI_CNT"); // 신규가입
	let mbTermination = arrAccumFunc(barLabel, dataListUser, "TA_DATE", "TA_CNT"); // 가입해지
	let mbAccumulate = arrCompareFunc( mbNewUser, mbTermination, "-"); // 누적회원
	
	//누적 함수를 보내야 하므로 arr[0] 값에 시작일 전날까지의 데이터와 arr[0]값을 더함 해지값을 빼줘야함
	mbAccumulate[0] = dataListUser[0].ACCUM_COUNT + mbAccumulate[0] - dataListUser[0].ACCUM_TN_COUNT;
	
	//arrCountAverageFunc 함수로 차트 하단값, db데이터List, 날짜칼럼, 구해올 칼럼을 보냄
	let mbUserMember = arrDayCountAverageFunc(barLabel, dataListUsage, "APPROVAL_DATE", "EXPIRATION_DATE"); //	이용회원	
	let mbUseNumber = arrDayCountAverageFunc(barLabel, dataListUsage, "APPROVAL_DATE", "EXPIRATION_DATE"); // 이용건수
	let mbCalculateAverage = arrDayCountAverageFunc(barLabel, dataListUsage, "APPROVAL_DATE", "EXPIRATION_DATE", "TOTAL_PAYMENT"); // 선정산 평균 비용;
	
	//arrCountAverageFunc 함수로 차트 하단값, db데이터List, 날짜칼럼, 구해올 칼럼을 보냄
	let serviceReUser = arrDayCountAverageFunc(barLabel, dataListService, "APPROVAL_DATE", "EXPIRATION_DATE"); // 서비스 재이용자
	//퍼센트 값을 구하기위한 함수
	let mbServiceAccumulate = arrAccumulate(mbAccumulate);
	let servicePercent = arrCompareFunc( mbServiceAccumulate, mbUserMember, "%");
	
	//week 일시 마지막 날짜는 토요일 이기떄문에 배열에서 지워준다.
	if(dateUnit == "week"){
		barLabel.pop();
	}
	
	userChartView(mbNewUser, mbTermination, mbAccumulate, barLabel);
	usageChartView(mbUserMember ,mbUseNumber ,mbCalculateAverage ,barLabel);
	serviceChartView(mbAccumulate ,mbUserMember ,serviceReUser, servicePercent ,barLabel);
}
// 누적 배열함수
function arrAccumulate(arr){
	resultarr = [];
	resultValue = 0;
	for(i = 0; i < arr.length; i++){
		resultValue += arr[i];
		resultarr.push(resultValue);
	}	
	return resultarr;
}

// 배열 비교 계산 함수
function arrCompareFunc(arr1, arr2, flag){
	let arrCompareResultValue = "";
	let	arrCompareResultarr = [];
	
	for(i=0; i < arr1.length; i++){
		if(flag == "-"){
			arrCompareResultValue = arr1[i]-arr2[i];
		}else if(flag == "%"){
			arrCompareResultValue = parseInt(arr2[i]/arr1[i]*100);
		}
		if(isNaN(arrCompareResultValue)){
			arrCompareResultValue = 0;
		}
		arrCompareResultarr.push(arrCompareResultValue);
	}
	return arrCompareResultarr;
}

// Count와 Average arr 만들기
function arrDayCountAverageFunc(dateArr, dataList, dateKey1, dateKey2, valueKey){
	
	let resultArr = []; // 결과 값 배열
	let resultCount = ""; // Count 값 셋팅
	let resultValue = "";
	let resultDateArr = "";
	
	for(i=0; i < dateArr.length; i++){
		resultValue = 0; 
		resultCount = 0;
		resultDateArr = "";
		if(dateUnit == "month"){
			resultDateArr = dateArr[i] +"-31";
		}else{
			resultDateArr = dateArr[i];
		}
		for(j=0; j < dataList.length; j++){
			if (dataList[j][dateKey1] ==null){
				continue;
			}
			if(resultDateArr >= dataList[j][dateKey1] && dataList[j][dateKey2] >= resultDateArr){
				if(valueKey != undefined){
					resultValue += parseInt(dataList[j][valueKey]);// 일 갯수 합산
				}
				resultCount +=1
			}
		}
		if(valueKey != undefined){
			resultValue = resultValue/resultCount;
			if(isNaN(resultValue)){
				resultValue = 0;
			}
			resultArr.push(resultValue);
		}else{
			resultArr.push(resultCount);
		}
		
	}
	return resultArr;
}

//시작일 ~ 종료일 주단위 설정
function weekFunc(fromDate, toDate){
	let weekLabel = getDatesStartToLast(fromDate, toDate); //시작 값부터 마지막날까지 일단위로 구한다.
	let weekArr = [];//담을 배열 선언
	let weekCompare = "";//요일 값 비교 선언
	let weekValue = "";//value 값
	for(i=0; i < weekLabel.length; i++){
		weekCompare =	new Date(weekLabel[i]).getDay();// 요일 값을 가져옴
		if(i == 0 && weekCompare != 0){
			weekValue = formatDate(dayCalculation(weekLabel[i], weekCompare, "-"));// 첫 일이 일요일이 아닐시 계산 로직
		}else if(weekCompare == 0){
			weekValue = weekLabel[i];//일요일인 경우만 value에 담는다
		}else if(i == weekLabel.length-1){
			weekCompare = 6 - weekCompare; // 토요일로 셋팅
			weekValue = formatDate(dayCalculation(weekLabel[i], weekCompare, "+")); // 마지막 일이 토요일이 아닐시 계산로직
		}else{
			weekValue = "";//해당 사항이 없을시 빈값으로 셋팅
		}
		
		//빈값이 아닐시 weekArr에 value를 담는다.
		if(weekValue != ""){
			weekArr.push(weekValue);
		}
	}
	return weekArr;
}

//월단위 배열생성
function monthFunc(fromDate, toDate){
	let MonthArr = [];//담을 배열 선언
	fromDate = fromDate.substr(0,7);
	toDate = toDate.substr(0,7);
	MonthArr.push(fromDate);//배열 처음 값 설정
	
	 while(fromDate < toDate){
		fromDate = new Date(fromDate);
		fromDate.setMonth(fromDate.getMonth()+1);
		fromDate = formatDate(fromDate);
		fromDate = fromDate.substr(0,7);// 월만 필요하므로 substr로 월단위 자르기
		MonthArr.push(fromDate);// 배열에 삽입
	}
	return MonthArr;
}

//월의 시작일 종료일 생성
function MonthFirsrOrLast(date, flag){
	let arr = date.split("-");
	let folDay = "";
	
	if(flag == "first"){
		arr[1] = String(parseInt(arr[1])-1);
		folDay = new Date(arr[0], arr[1], 1);//해당월의 1일을 가져옴
	}else if(flag == "last"){
		folDay = new Date(arr[0], arr[1], 0);//해당월의 마지막일을 가져옴
	}
	folDay = formatDate(folDay);

	return folDay;
}

// 해당 일자 더하기 빼기
function dayCalculation(date, num, flag){
	
	let dt = new Date(date);
	let dt_v = new Date(date);
	
	if(flag == "+"){
		dt_v.setDate(dt.getDate()+num);
	}else if(flag == "-"){
		dt_v.setDate(dt.getDate()-num);
	}
	return dt_v;
}

//배열 만들기
function arrAccumFunc(dateArr, dataList, dateKey, valueKey){
	
	let resultArr = []; // 결과 값 배열
	let resultDayCompare = ""; //날짜 비교
	let resultValue = ""; // value 값 셋팅
	if(dateUnit == "month"){
		for(i=0; i < dateArr.length; i++){
			resultValue = 0;
			for(j=0; j < dataList.length; j++){
				if (dataList[j][valueKey] ==null || dataList[j][dateKey] ==null){
					continue;
				}
				if(dateArr[i] == dataList[j][dateKey].substr(0,7)){
					resultValue += parseInt(dataList[j][valueKey]);// 해당 월의 갯수 합산
				}
			}
			resultArr.push(resultValue);
		}
	}else{
		for(i=0; i < dateArr.length; i++){
			resultValue = 0;
			//마지막 값일때 분석단위별 셋팅
			if(i == dateArr.length-1){
				if(dateUnit == "day"){
					resultDayCompare = dateArr[i];
				}else if(dateUnit == "week"){
					break
				}
			//중복을 피하기 위해 마지막 전값 까지의 비교값 셋팅
			}else if(i != dateArr.length-2){
				resultDayCompare = formatDate(dayCalculation(dateArr[i+1], 1, "-"));
			}else{
				// 분석 단위별 마지막 전값의 셋팅
				if(dateUnit == "day"){
					resultDayCompare = formatDate(dayCalculation(dateArr[i+1], 1, "-"));
				}else if(dateUnit == "week"){
					resultDayCompare = dateArr[i+1];
				}
			}
			//위의 값을 토대로 dateArrp[i] 와 비교하여 value값 셋팅
			for(j=0; j < dataList.length; j++){
				if (dataList[j][valueKey] ==null || dataList[j][dateKey] ==null){
					continue;
				}
				if(dateArr[i] <= dataList[j][dateKey] && resultDayCompare >= dataList[j][dateKey]){
					resultValue += parseInt(dataList[j][valueKey]);
				}
			}
		resultArr.push(resultValue);
		}
	}
	 
	return resultArr;
}

//날짜 사이 모든 날(x축) 값 뽑는 함수
function getDatesStartToLast(startDate, lastDate) {
	var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
	if(!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
	var result = [];
	var curDate = new Date(startDate);
	while(curDate <= new Date(lastDate)) {
		result.push(curDate.toISOString().split("T")[0]);
		curDate.setDate(curDate.getDate() + 1);
	}
	return result;
}
</script>
<div class="m-tab">
    <ul>
        <li class="active"><a href="/admin/cubici/infoIntegrated/moneybank_tab1">현황 종합</a></li>
        <li><a href="/admin/cubici/infoIntegrated/moneybank_tab2">운영지표</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="infoArea">
            <a href="javascript:;" class="oiBtn infoBtn navy">정보</a>
            <div class="infoMemo">
                <div class="iCon">
                    <p>• 기준일자 : 금일 하루 전(D-1)을 기준일자로 합니다.   </p>
                    <p>• 누적 : 기준일자까지의 누적 합계 </p>
                </div>
            </div>
        </span>
        <span class="baseDate pRight"><b>기준</b>${toDate}</span>
    </div>
</div>

<div class="colorTxtBoxArea">
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/user-round.png" alt="신규가입">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>머니뱅크 가입승인</h3></th>
                </tr>
                <tr>
                    <td>•금일: ${resultList.MONEYBANK_TODAY_USER}</td>
                </tr>
                <tr>
                    <td>•누적: ${resultList.MONEYBANK_ACCUM_USER}</td>
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
                    <th><h3>서비스 원금</h3></th>
                    <td><span class="gray">(백만원)</span></td>
                </tr>
                <tr>
                    <td>•금일: ${resultList.MONEYBANK_TODAY_SERVICE}</td>
                    <td>${resultList.MONEYBANK_TODAY_SERVICE_COUNT} 건</td>
                </tr>
                <tr>
                    <td>•누적: ${resultList.MONEYBANK_ACCUM_SERVICE}</td>
                    <td>${resultList.MONEYBANK_ACCUM_SERVICE_COUNT} 건</td>
                </tr>
            </table>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/admin/img/icon/won-round.svg" alt="금액">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>상환 원금</h3></th>
                    <td><span class="gray">(백만원)</span></td>
                </tr>
                <tr>
                    <td>•금일: ${resultList.MONEYBANK_TODAY_PRIN}</td>
                    <td>${resultList.MONEYBANK_TODAY_PRIN_COUNT} 건</td>
                </tr>
                <tr>
                    <td>•누적 :${resultList.MONEYBANK_ACCUM_PRIN}</td>
                    <td>${resultList.MONEYBANK_ACCUM_PRIN_COUNT} 건</td>
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
                    <th colspan="2"><h3>상환 원금잔액</h3></th>
                </tr>
                <tr>
                    <td>•금일: ${resultList.MONEYBANK_ACCUM_BALANCE}</td>
                    <td>${resultList.MONEYBANK_ACCUM_BALANCE_COUNT} 건</td>
                </tr>
            </table>
        </div>
    </article>
</div>

<div class="m-search">
    <ul>
        <!-- <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">구분</span>
                <div class="input">
                    <select>
                        <option value="">전체</option>
                    </select>
                </div>
            </div>
        </li> -->
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">분석단위</span>
                <div class="input">
					<select class = "selectDivision" id ="DateAnalysisUnit"></select>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">시작</span>
                <div class="input">
                    <input type="text" id="fromDate" class="startDatepicker" placeholder="시작기간" readonly>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">종료</span>
                <div class="input">
                    <input type="text" id="toDate" class="endDatepicker" placeholder="종료기간" readonly>
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button id="keywordBtn" class="sBtn sColorLB search">검색</button>
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
        <h4>회원 현황</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p2-1"></canvas>
            <script src="/resources/chart-admin/ac1p2-1.js"></script>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>이용 현황</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p2-2"></canvas>
            <script src="/resources/chart-admin/ac1p2-2.js"></script>
        </div>
    </div>
</article>


<article class="subBox">
    <header>
        <h4>서비스 이용율</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p2-3"></canvas>
            <script src="/resources/chart-admin/ac1p2-3.js"></script>
        </div>
    </div>
</article>


