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
		if(dateUnit == "week"){
			fromdayNum = new Date(fromDate).getDay();
			fromDate = formatDate(dayCalculation(fromDate, fromdayNum, "-"));//날짜 일 계산 함수이용
			todayNum = 6 - new Date(toDate).getDay();
			toDate = formatDate(dayCalculation(toDate, todayNum, "+"));//날짜 일 계산 함수이용
		}else if(dateUnit == "month"){
			fromDate = MonthFirsrOrLast(fromDate, "first");
			toDate = MonthFirsrOrLast(toDate, "last");//월 시작일(월의 1일) 종료일(월의 마지막일) 계산
		}
		
		totalChart(fromDate, toDate); // 종합 차트
	});
	
});

//활동 지표 그래프
function totalChart(fromDate, toDate){
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab3/activityIndicatorData";
	let callBackFunc = "totalChartResponse";
	let objParam = {
			fromDate : fromDate,
			toDate : toDate
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

//totalChart callback 함수
function totalChartResponse(result){
	let barLabel = "";
	let dataList = result.ActivityList;
	let mArr = "";
	
	if(dateUnit == "day"){
		barLabel = getDatesStartToLast(fromDate,toDate);//분석일이 일단위 일시 일단위 barLabel을 채워줌
	}else if(dateUnit == "week"){
		barLabel = weekFunc(fromDate, toDate);//분석일이 주단위 일시 주단위 barLabel을 채워줌
	}else if(dateUnit == "month"){// 분석일이 월 단위일경우 월 단위를 채워줌
		barLabel = monthFunc(fromDate, toDate);
	}
	
	//arrAccumFunc 함수로 차트 Arr을 구함
	let visitant = arrAccumFunc(barLabel, dataList, "STANDARD_DATE", "VISIT_COUNT");
	let averUsageTime = arrAccumFunc(barLabel, dataList, "STANDARD_DATE", "AVG_USE_TIME");
	let pageView = arrAccumFunc(barLabel, dataList, "STANDARD_DATE", "PAGE_VIEWS_COUNT");
	
	//week 일시 마지막 날짜는 토요일 이기떄문에 배열에서 지워준다.
	if(dateUnit == "week"){
		barLabel.pop();
		//주일때 평균 값
		for(i=0; i < averUsageTime.length; i++){
			averUsageTime[i] = Math.round(averUsageTime[i]/7);
		}
	}
	//월일때 평균 값
	if(dateUnit == "month"){
		mArr = MonthDayArr(barLabel);
		for(i=0; i < averUsageTime.length; i++){
			averUsageTime[i] = Math.round(averUsageTime[i]/mArr[i]);
		}
	}
	
	visitantChartView(visitant, barLabel);
	averUsageChartView(averUsageTime, barLabel);
	pageViewChartView(pageView, barLabel)
}

// 월별 날짜 값 배열
function MonthDayArr(barLabel){
	let resultArr = [];
	let DateValue = "";
	let resultValue = "";
	
	for(i=0; i < barLabel.length; i++){
		DateValue = new Date(barLabel[i].substring(0,4), barLabel[i].substring(barLabel[i].length-2), 0);
		DateValue = formatDate(DateValue);
		resultValue = parseInt(DateValue.substring(DateValue.length-2));
		resultArr.push(resultValue);
	}
	return resultArr
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
				}else if(dateUnit == "month"){
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

//해당 일자 더하기 빼기
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
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab1">종합 지표</a></li>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab2">매출 지표</a></li>
        <li class="active"><a href="/admin/cubici/infoIntegrated/cubici_tab3">활동 지표</a></li>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab4">이용료 지표</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${toDate}</span>
    </div>
</div>

<div class="m-search">
    <ul>
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
        <h4>방문자</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p1-3-1"></canvas>
            <script src="/resources/chart-admin/ac1p1-3-1.js"></script>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>평균 이용시간</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p1-3-2"></canvas>
            <script src="/resources/chart-admin/ac1p1-3-2.js"></script>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>페이지 뷰</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p1-3-3"></canvas>
            <script src="/resources/chart-admin/ac1p1-3-3.js"></script>
        </div>
    </div>
</article>