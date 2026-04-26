<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
let fromDate = "";//시작일 전역변수
let toDate = "";//종료일 전역변수
let dateUnit = "";//일 주 월 분석단위

$(document).ready(function(){
	
	if(fromDate == "" && toDate == ""){
		$("#fromDate").val("${fromDate}");// 초기값 시작일 셋팅
		$("#toDate").val("${toDate}");// 초기값 종료일 셋팅
		fromDate = $("#fromDate").val();
		toDate = $("#toDate").val();
		dateUnit = $("#DateUnit option:selected").val(); //분석단위
	}
	
	if(${resultCode} === 0){
		totalChart(fromDate, toDate); //종합 차트
	}else{
		console.log("resultCode ::: ${resultCode}");
	}
	
	$("#keywordBtn").on("click", function(){
		
		fromDate = $("#fromDate").val(); // 시작일
		toDate = $("#toDate").val(); // 종료일 
		dateUnit = $("#DateUnit option:selected").val(); //분석단위
		
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
	
	let callUrl = "/admin/cubici/infoIntegrated/moneybank_tab2/totalchart";
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
	let dataListContract = result.resultListContract;//db list (누적 계약)
	let dataListRepayment = result.resultListRepayment;//db list (상환누적)
	
	if(dateUnit == "Today"){
		barLabel = getDatesStartToLast(fromDate,toDate);//분석일이 일단위 일시 일단위 barLabel을 채워줌
	}else if(dateUnit == "Week"){
		barLabel = weekFunc(fromDate, toDate);//분석일이 주단위 일시 주단위 barLabel을 채워줌
	}else if(dateUnit == "Month"){// 분석일이 월 단위일경우 월 단위를 채워줌
		barLabel = monthFunc(fromDate, toDate);
	}
	
	let mbNewRequest = arrAccumFunc(barLabel, dataListContract, "MONEYBANK_REQUEST_DATE", "TOTAL_PAYMENT"); // 신규신청
	let mbJudgePrice = arrAccumFunc(barLabel, dataListContract, "MONEYBANK_REQUEST_DATE", "JUDGE_SUM"); // 심사금액
	let mbContractPrice = arrAccumFunc(barLabel, dataListContract, "APPROVAL_DATE", "TOTAL_PAYMENT"); // 계약금액
	let mbAccumContract = arrAccumFunc(barLabel, dataListContract, "APPROVAL_DATE", "APP_SUM"); // 계약 누적
	
	let mbNewRequestPercent = arrAccumFunc(barLabel, dataListContract, "MONEYBANK_REQUEST_DATE", "TOTAL_PAYMENT");//퍼센트 계산
	
	if(dataListContract[0].APP_TOTAL_PAYMENT != null){
		mbNewRequestPercent[0] = dataListContract[0].APP_TOTAL_PAYMENT + mbNewRequestPercent[0];//누적 초기값 설정
	}
	if(dataListContract[0].APP_ACCUM_SUM != null){
		mbAccumContract[0] = dataListContract[0].APP_ACCUM_SUM + mbAccumContract[0];//누적 초기값 설정
	}
	
	
	let mbContractPercent = arrCompareFunc(arrAccumulate(mbNewRequestPercent), arrAccumulate(mbAccumContract), "%"); // 계약/신청%
	
	let mbAccumRepay = arrAccumFunc(barLabel, dataListRepayment, "REPAYMENT_DATE", "TOTAL_REPAYMENT_AMOUNT");//누적상환
	let mbBalance = arrAccumFunc(barLabel, dataListRepayment, "REPAYMENT_DATE", "ORIGINAL_AMOUNT", "balance");//원금 잔액
	
	
	if(dataListRepayment[0].ACCUM_REPAY != null){
		mbAccumRepay[0] = dataListRepayment[0].ACCUM_REPAY + mbAccumRepay[0];//누적 초기값 설정
	}
	
	let mbBalancePercent = arrCompareFunc(arrAccumulate(mbAccumContract), mbBalance, "%");//잔액 %
	let togetherPayPercent = payFunc(barLabel);
	let togetherPay = arrCompareFunc(togetherPayPercent, mbBalance, "*");
	
	
	//week 일시 마지막 날짜는 토요일 이기떄문에 배열에서 지워준다.
	if(dateUnit == "Week"){
		barLabel.pop();
	}

	requestChartView(barLabel, mbNewRequest, mbJudgePrice, mbContractPrice, mbContractPercent);//신청 차트
	repayChartView(barLabel, mbAccumContract, mbAccumRepay, mbBalance, mbBalancePercent); // 계약 차트
	payChartView(barLabel, togetherPay, togetherPayPercent); // 수수료차트

		
}

//수수료 함수 (현재 투게더만)
function payFunc(arr){
	resultarr = [];
	for(i = 0; i < arr.length; i++){
		resultValue = parseFloat(0.05);
		resultarr.push(resultValue);
	}	
	return resultarr;
}

//누적 배열함수
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
		}else if(flag == "*"){
			arrCompareResultValue = Math.round(parseFloat(arr2[i]*arr1[i]));

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
		if(dateUnit == "Month"){
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
function arrAccumFunc(dateArr, dataList, dateKey, valueKey, flag){
	
	let resultArr = []; // 결과 값 배열
	let resultDayCompare = ""; //날짜 비교
	let resultValue = ""; // value 값 셋팅
	let SEQCheck = ""; //seq 체크
	let balanceNum = parseInt(dataList[0]["ACCUM_REMAIN"]); // 잔액 초기값
	let zeroCheck = "";// resultValue 가 0일때 체크
	if(isNaN(balanceNum)){
		balanceNum = 0;
	}
	if(dateUnit == "Month"){
		for(i=0; i < dateArr.length; i++){
			resultValue = 0;
			for(j=0; j < dataList.length; j++){
				zeroCheck = "N";
				//null 값 체크
				if (dataList[j][valueKey] ==null || dataList[j][dateKey] ==null){
					continue;
				}
				//잔액 비교할때만 사용
				if(flag == "balance"){
					let MdepositDate = dataList[j]["DEPOSIT_DATE"];
					// 잔액은 마이너스
					if(dateArr[i] == dataList[j][dateKey].substr(0,7)){
						balanceNum -= parseInt(dataList[j][valueKey])
						resultValue = balanceNum;
						if(dataList[j][valueKey] == 0){
							zeroCheck = "Y";
						}
					} 
					// depositDate 와 비교해서 Total_Payment 넣기
					if(MdepositDate.substr(0,7) == dateArr[i]){
						if(dataList[j]["SEQ"] != SEQCheck || SEQCheck == ""){
							resultValue += parseInt(dataList[j]["TOTAL_PAYMENT"]);
							SEQCheck = dataList[j]["SEQ"]
							balanceNum = resultValue;
						}
					}
				}else if(dateArr[i] == dataList[j][dateKey].substr(0,7)){
					resultValue += parseInt(dataList[j][valueKey]);// 해당 월의 갯수 합산
				}
			}
			if(flag == "balance"){
				if(resultValue != 0 || zeroCheck == "Y"){
					balanceNum  = resultValue;
				}
				resultArr.push(balanceNum);
			}else{
				resultArr.push(resultValue);
			}
		}
	}else{
		for(i=0; i < dateArr.length; i++){
			resultValue = 0;
			//마지막 값일때 분석단위별 셋팅
			if(i == dateArr.length-1){
				if(dateUnit == "Today"){
					resultDayCompare = dateArr[i];
				}else if(dateUnit == "Week"){
					break
				}
			//중복을 피하기 위해 마지막 전값 까지의 비교값 셋팅
			}else if(i != dateArr.length-2){
				resultDayCompare = formatDate(dayCalculation(dateArr[i+1], 1, "-"));
			}else{
				// 분석 단위별 마지막 전값의 셋팅
				if(dateUnit == "Today"){
					resultDayCompare = formatDate(dayCalculation(dateArr[i+1], 1, "-"));
				}else if(dateUnit == "Week"){
					resultDayCompare = dateArr[i+1];
				}
			}
			//위의 값을 토대로 dateArrp[i] 와 비교하여 value값 셋팅
			for(j=0; j < dataList.length; j++){
				zeroCheck = "N";
				if (dataList[j][valueKey] ==null || dataList[j][dateKey] ==null){
					continue;
				}
				if(flag == "balance"){
					let depositDate = dataList[j]["DEPOSIT_DATE"];
					//주단위 일때 주단위 일요일 날짜 지정
					if(dateUnit == "Week"){
						fromdayNum = new Date(depositDate).getDay();
						depositDate = formatDate(dayCalculation(depositDate, fromdayNum, "-"));//날짜 일 계산 함수이용
						
					}

					if(dateArr[i] <= dataList[j][dateKey] && resultDayCompare >= dataList[j][dateKey]){
						balanceNum -= parseInt(dataList[j][valueKey])
						resultValue = balanceNum;
						if(dataList[j][valueKey] == 0){
							zeroCheck = "Y";
						}
					}
					// totalPayment 값 resultValue 더해주기
					if((depositDate <= dateArr[i] && dateArr[i] < dataList[j]["REPAYMENT_DATE"] && dataList[j]["ACCUM_REMAIN"] == null) || depositDate == dateArr[i] ){
						if(dataList[j]["SEQ"] != SEQCheck || SEQCheck == ""){
							resultValue += parseInt(dataList[j]["TOTAL_PAYMENT"]);
							if(dateUnit == "Today" ){
								resultValue += parseInt(balanceNum);
							}
							SEQCheck = dataList[j]["SEQ"];
							balanceNum = resultValue;
						}
					}
					
				}else{
					if(dateArr[i] <= dataList[j][dateKey] && resultDayCompare >= dataList[j][dateKey]){
						resultValue += parseInt(dataList[j][valueKey]);
						if(dataList[j][valueKey] == 0){
							zeroCheck = "Y";
						}
					}
				}
			}
		if(flag == "balance"){
			if(resultValue != 0 || zeroCheck == "Y"){
				balanceNum  = resultValue;
			}
			resultArr.push(balanceNum);
		}else{
			resultArr.push(resultValue);
		}
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
        <li><a href="/admin/cubici/infoIntegrated/moneybank_tab1">현황 종합</a></li>
        <li class="active"><a href="/admin/cubici/infoIntegrated/moneybank_tab2">운영지표</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${toDate}</span>
    </div>
</div>

<div class="colorTxtBoxArea">
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/img/icon/doc-pen.svg" alt="신규가입">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>신규 신청</h3>
                <p class="bold"><b>${resultList.MONEYBANK_NEW_APPLY}</b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/img/icon/doc-search.svg" alt="해지회원">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>신규 심사</h3>
                <p class="bold"><b>${resultList.MONEYBANK_NEW_JUDGE}</b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/img/icon/shack-hands.svg" alt="금액">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>신규 계약</h3>
                <p class="bold"><b>${resultList.MONEYBANK_NEW_CONTRACT}</b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            <img src="/resources/rudicks/img/icon/doc-del.svg" alt="건수">
        </div>
        <div class="txtBox num">
            <div class="txt">
                <h3>계약 종료</h3>
                <p class="bold"><b>${resultList.MONEYBANK_CONTRACT_END}</b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            머니뱅크<br>운영건수
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b>${resultListOperCount}</b> 건</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            머니뱅크<br>상환금액
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b>${resultList.MONEYBANK_TODAY_PRIN}</b> 백만원</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            머니뱅크<br>원금잔액
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b>${resultList.MONEYBANK_ACCUM_BALANCE}</b> 백만원</p>
            </div>
        </div>
    </article>
    <article>
        <div class="colorBox">
            머니뱅크<br>수수료
        </div>
        <div class="txtBox num">
            <div class="txt">
                <p class="bold"><b>${resultList.MONEYBANK_FEE}</b> 백만원</p>
            </div>
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
                    <select dir="rtl" id="DateUnit">
                        <option value=Today>일</option>
                        <option value=Week>주</option>
                        <option value=Month>월</option>
                    </select>
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
        <h4>신청/심사/계약</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p2-2-1"></canvas>
            <script src="/resources/chart-admin/ac1p2-2-1.js"></script>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>계약/상환/잔액</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p2-2-2"></canvas>
            <script src="/resources/chart-admin/ac1p2-2-2.js"></script>
        </div>
    </div>
</article>


<article class="subBox">
    <header>
        <h4>머니뱅크 수수료</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="ac1p2-2-3"></canvas>
            <script src="/resources/chart-admin/ac1p2-2-3.js"></script>
        </div>
    </div>
</article>