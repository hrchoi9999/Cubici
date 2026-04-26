<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
$(document).ready(function(){
	
	if("${resultCode}" === "0"){
		
		$('#fromDate').val("${fromDate}");
		$('#toDate').val("${toDate}");
		
		memberStatus();
		
	} else {
		modalInfo("ErrorCode ::: " + "${resultCode}");
	}
	
	// 조회버튼
	$(document).on('click', "#selectButton", function(){
		memberStatus();
    });
	
	// 협력사 - 서비스 구분
	$(document).on('change', "#partnerFirm", function(){
		changeServiceDivision($("#partnerFirm option:selected").val());
	});
	
});

//협력사 - 서비스 구분
function changeServiceDivision(data){
	
	let firmNo = data.split('=')[0];
	/* let firmNm = data.split('=')[1]; */

	let callUrl = "/admin/cubici/manageMember/changeServiceDivision";
	let callBackFunc = "changeServiceDivisionResponse";
	let objParam = {
			firmNo : firmNo
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function changeServiceDivisionResponse(data){
	
	let html = "";
	html += "<option value='all'>전체</option>";
	
	for(let i =0; i<data.serviceDivision.length; i++){
		html += "<option value='"+data.serviceDivision[i].DIVISION+"'>"+data.serviceDivision[i].PRODUCT_NAME+"</option>";
	}
	
	$("#serviceDivision").html(html);
}

// 신청/심사/계약
function memberStatus(){

	let analysisUnit = $("#selectCondition option:selected").val(); 
	let fromDate;
	let toDate;
	let testLabel = [];
	let partnerFirm = $("#partnerFirm option:selected").val().split('=')[0];
	let serviceDivision = $("#serviceDivision option:selected").val();
	
	if(analysisUnit==="MONTH") {
		fromDate = formatDateMonth($("#fromDate").val());
		toDate = formatDateMonth($("#toDate").val());
	}else if(analysisUnit==="WEEK"){
		fromDate = formatDate($("#fromDate").val());
		toDate = formatDate($("#toDate").val());
		testLabel = getDateStartToLast(fromDate, toDate, 1);
		fromDate = testLabel[0];
		let tDate = new Date(testLabel[testLabel.length-1]);
		tDate.setDate(tDate.getDate()+6);
		toDate = formatDate(tDate);
		analysisUnit = "DAY";
	}else if(analysisUnit==="DAY") {
		fromDate = formatDate($("#fromDate").val());
		toDate = formatDate($("#toDate").val());
	}
	
	let callUrl = "/admin/cubici/manageMember/member_tab1/get";
	let callBackFunc = "memberStatusResponse";
	let objParam = {
			fromDate : fromDate,
			toDate : toDate,
			dateFlag : analysisUnit,
			partnerFirm : partnerFirm,
			serviceDivision : serviceDivision
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
};

// 신청/심사/계약 그래프
function memberStatusResponse(data){
	
	let fromDate; 
	let toDate;
	let barLabel = [];
	
	// 전일 증가
	$('#member_yesterday').html(data.Member_yesterday+"명");
	$('#moneybank_yesterday').html(data.Moneybank_yesterday+"명");
	$('#withdraw_yesterday').html(data.Withdraw_yesterday+"명");

	// 큐빅아이, 머니뱅크, 가입해지 누적
	$('#cumulateWithdraw').html(data.Withdraw_today+"명");
	$('#cumulateMember').html(data.Member_today+"명");
	$('#cumulateMoneybank').html(data.Moneybank_today+"명"); 
	
	// 일별
	if($("#selectCondition option:selected").val() === "DAY"){
		fromDate=formatDate($("#fromDate").val());
		toDate=formatDate($("#toDate").val());
		barLabel = getDatesStartToLast(fromDate,toDate);
	}
	// 주별
	else if($("#selectCondition option:selected").val() === "WEEK"){
		fromDate=formatDate($("#fromDate").val());
		toDate=formatDate($("#toDate").val());
		barLabel = getDateStartToLast(fromDate, toDate, 1);
	}
	// 월별
	else if($("#selectCondition option:selected").val() === "MONTH"){
		fromDate=formatDateMonth($("#fromDate").val());
		toDate=formatDateMonth($("#toDate").val());
		barLabel = getMonthDatesStartToLast(fromDate,toDate);
	}

	var stackedCubici = [];
	var stackedMoneybank = [];
	var stackedWithdraw = [];
	
	if($("#selectCondition option:selected").val() != "WEEK"){
	
		// 누적 큐빅아이
		for(let i=0; i<barLabel.length; i++){
		let  increase=0;
			for(let j=0; j<data.memberStatusMap.length;j++){
				if(barLabel[i] == data.memberStatusMap[j].REG_DATE){
					increase++;
					if(stackedCubici[i-1] == undefined)
						stackedCubici[i]=data.cumulateMember+increase;
					else
						stackedCubici[i]=stackedCubici[i-1]+increase;
				}
				if(stackedCubici[i] == null){
					stackedCubici[i]=stackedCubici[i-1];
				}
				if(stackedCubici[i] == undefined){
					stackedCubici[i]=data.cumulateMember;
				}
			}
			if(data.memberStatusMap.length == 0) {
				var stackedCubici = new Array(barLabel.length);
				for(let j=0; j<barLabel.length; j++){
					stackedCubici[j]=data.cumulateMember;
				}
			}
		}
		
		// 누적 머니뱅크
		for(let i=0; i<barLabel.length; i++){
		let increase =0;
			for(let j=0; j<data.moneybankStatusMap.length;j++){
				if(barLabel[i] == data.moneybankStatusMap[j].MONEYBANK_REQUEST_DATE){
					increase++;
					if(stackedMoneybank[i-1] == undefined)
						stackedMoneybank[i]=data.cumulateMoneybank+increase;
					else
						stackedMoneybank[i]=stackedMoneybank[i-1]+increase;
				}
				if(stackedMoneybank[i] == null){
					stackedMoneybank[i]=stackedMoneybank[i-1];
				}
				if(stackedMoneybank[i] == undefined){
					stackedMoneybank[i]=data.cumulateMoneybank;
				}
			}
			if(data.moneybankStatusMap.length == 0) {
				var stackedMoneybank = new Array(barLabel.length);
				for(let j=0; j<barLabel.length; j++){
					stackedMoneybank[j]=data.cumulateMoneybank;
				}
			}
		}
		
		// 누적 해지
		for(let i=0; i<barLabel.length; i++){
		let increase =0;
			for(let j=0; j<data.withdrawStatusMap.length;j++){
				if(barLabel[i] == data.withdrawStatusMap[j].WITHDRAW_DATE){
					increase++;
					if(stackedWithdraw[i-1] == undefined)
						stackedWithdraw[i] = data.cumulateWithdraw+increase;
					else
						stackedWithdraw[i]=stackedWithdraw[i-1]+increase;
				}
				if(stackedWithdraw[i] == null){
					stackedWithdraw[i]=stackedWithdraw[i-1];
				}
			 	if(stackedWithdraw[i] == undefined){
					stackedWithdraw[i]=data.cumulateWithdraw;
				} 
			}
			if(data.withdrawStatusMap.length == 0) {
				var stackedWithdraw = new Array(barLabel.length);
				for(let j=0; j<barLabel.length; j++){
				stackedWithdraw[j]=data.cumulateWithdraw;
				}
			}
		}
	} else if($("#selectCondition option:selected").val() == "WEEK"){
		
		stackedCubici[0] = data.cumulateMember;
		stackedMoneybank[0] = data.cumulateMoneybank;
		stackedWithdraw[0] = data.cumulateWithdraw;
		
		let k = 1;
		
		// 누적 큐빅아이
		for(let i=0; i<barLabel.length; i++){
		let  increase=0;
			for(let j=0; j<data.memberStatusMap.length;j++){
				if(barLabel[i] < data.memberStatusMap[j].REG_DATE && data.memberStatusMap[j].REG_DATE < barLabel[i+1] ){
					increase++;
					if(stackedCubici[k-1] == undefined)
						stackedCubici[k] = data.cumulateMember+increase;
					else
						stackedCubici[k]=stackedCubici[k-1]+increase;
				}	
				if(stackedCubici[k] == null){
					stackedCubici[k]=stackedCubici[k-1];
				}
			 	if(stackedCubici[k] == undefined){
			 		stackedCubici[k]=data.cumulateMember;
				} 
			}
			if(data.memberStatusMap.length == 0) {
				var stackedCubici = new Array(barLabel.length);
				for(let j=0; j<barLabel.length; j++){
					stackedCubici[j]=data.cumulateMember;
				}
			}
			k++;
		}
		
		k=1;
		
		// 누적 머니뱅크
		for(let i=0; i<barLabel.length; i++){
			let  increase=0;
				for(let j=0; j<data.moneybankStatusMap.length;j++){
					if(barLabel[i] < data.moneybankStatusMap[j].MONEYBANK_REQUEST_DATE && data.moneybankStatusMap[j].MONEYBANK_REQUEST_DATE <= barLabel[i+1] ){
						increase++;
						if(stackedMoneybank[k-1] == undefined)
							stackedMoneybank[k] = data.cumulateMoneybank+increase;
						else
							stackedMoneybank[k]=stackedMoneybank[k-1]+increase;
					}	
					if(stackedMoneybank[k] == null){
						stackedMoneybank[k]=stackedMoneybank[k-1];
					}
				 	if(stackedMoneybank[k] == undefined){
				 		stackedMoneybank[k]=data.cumulateMoneybank;
					} 
				}
				if(data.moneybankStatusMap.length == 0) {
					var stackedMoneybank = new Array(barLabel.length);
					for(let j=0; j<barLabel.length; j++){
						stackedMoneybank[j]=data.cumulateMoneybank;
					}
				}
				k++;
			}
		
		k=1;
		
		// 누적 해지회원
		for(let i=0; i<barLabel.length; i++){
			let  increase=0;
				for(let j=0; j<data.withdrawStatusMap.length;j++){
					if(barLabel[i] < data.withdrawStatusMap[j].WITHDRAW_DATE && data.withdrawStatusMap[j].WITHDRAW_DATE < barLabel[i+1] ){
						increase++;
						if(stackedWithdraw[k-1] == undefined)
							stackedWithdraw[k] = data.cumulateWithdraw+increase;
						else
							stackedWithdraw[k]=stackedWithdraw[k-1]+increase;
					}	
					if(stackedWithdraw[k] == null){
						stackedWithdraw[k]=stackedWithdraw[k-1];
					}
				 	if(stackedWithdraw[k] == undefined){
				 		stackedWithdraw[k]=data.cumulateWithdraw;
					} 
				}
				if(data.withdrawStatusMap.length == 0) {
					var stackedWithdraw = new Array(barLabel.length);
					for(let j=0; j<barLabel.length; j++){
						stackedWithdraw[j]=data.cumulateWithdraw;
					}
				}
				k++;
			}
		
	}
	
	// 누적 해지 값은 음수
	for(let i=0; i<stackedWithdraw.length; i++){
		stackedWithdraw[i]=-(stackedWithdraw[i])
	}
	
	// 머니뱅크 비율
	let percentage = [];
	for(let i=0; i<barLabel.length; i++){
		percentage[i]=(stackedMoneybank[i]/stackedCubici[i]*100).toFixed(2);
	}
	
	memberStatusGraph(barLabel,stackedCubici,stackedWithdraw,stackedMoneybank,percentage);
}

// 날짜 사이 모든 날(x축) 값 뽑는 함수
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

//날짜 사이 모든 날(x축) 값 뽑는 함수
function getMonthDatesStartToLast(startDate, lastDate) {
	var regex = RegExp(/^\d{4}-(0[1-9]|1[012])$/);
	if(!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
	var result = [];
	var curDate = new Date(startDate);
	
	while(curDate <= new Date(lastDate)) {
		result.push(curDate.toISOString().substr(0,7));
		curDate.setDate(curDate.getDate() + 1);
	}
	
	// 날짜 중복 처리
	let uniqueArr = []; // 처리된 배열
	for (var i=0; i<result.length; i++) {
		  if (uniqueArr.indexOf(result[i]) === -1) 
			  uniqueArr.push(result[i]);
		}
	
	return uniqueArr;
}

//날짜 형태 변경(yyyy-mm-dd)
function formatDateMonth(date) {
	var d = new Date(date), month = '' + (d.getMonth() + 1), year = d.getFullYear();
	if (month.length < 2) {
		month = '0' + month;
	}
	return [year, month].join('-');
}

//X축 날짜 ARRAY 가져오는 FUNC (unitFlag ::: 0 = days , 1 = weeks, 2 = months)
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

/* //누적 함수
function cumulative(arr){
    var cArray = [];

    //최초 누적값 추가
    cArray.push(arr[0]);

    //누적배열 생성
    arr.reduce(function(acc, cur, i){
        cArray.push(acc + cur);
        return acc + cur;
    });

    return cArray;
} */

</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="/admin/cubici/manageMember/member_tab1">회원 종합</a></li>
        <li><a href="/admin/cubici/manageMember/member_tab2">회원 정보</a></li>
        <li><a href="/admin/cubici/manageMember/member_tab3">휴면/해지</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
    </div>
</div>

<div class="colorTxtBoxArea">
    <article>
        <div class="colorBox">
            큐빅아이
        </div>
        <div class="txtBox">
            <table>
                <tr>
                   <td>•&nbsp;전일&nbsp;:&nbsp;<span id="member_yesterday"></span></td>
                </tr>
                <tr>
                    <td>•&nbsp;누적&nbsp;:&nbsp;<span id="cumulateMember"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox">
            머니뱅크
        </div>
        <div class="txtBox">
            <table>
                <tr>
                  <td>•&nbsp;전일&nbsp;:&nbsp;<span id="moneybank_yesterday"></span></td>
                </tr>
                <tr>
                    <td>•&nbsp;누적&nbsp;:&nbsp;<span id="cumulateMoneybank"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox">
            가입해지
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <td>•&nbsp;전일&nbsp;:&nbsp;<span id="withdraw_yesterday"></span></td>
                </tr>
                <tr>
                    <td>•&nbsp;누적&nbsp;:&nbsp;<span id="cumulateWithdraw"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox">
            제휴 회원
        </div>
        <div class="txtBox">
            <table>
                <tr>
                  <td>•&nbsp;전일&nbsp;:&nbsp;<span id=""></span></td>
                </tr>
                <tr>
                    <td>•&nbsp;누적&nbsp;:&nbsp;<span id=""></span></td>
                </tr>
            </table>
        </div>
    </article>
</div>

<div class="m-search">
	<ul>
		<li class="col-1d5">
			<div class="fwBox">
				<span class="ft">협력사</span>
				<div class="input">
					<select id="partnerFirm" class="form-control">
						<option value="all">전체</option>
						<c:forEach var="list" items="${partnerFirm}">
							<option value="${list}">${list}</option>
						</c:forEach>
					</select>
				</div>
			</div>
		</li>
		<li class="col-1d5">
			<div class="fwBox">
				<span class="ft">서비스 구분</span>
				<div class="input">
					<select id="serviceDivision" class="form-control">
						<option value='all'>전체</option>
					</select>
				</div>
			</div>
		</li>
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
					<select id="selectCondition" class="form-control">
						<option value="DAY">일 단위</option>
						<option value="WEEK">주 단위</option>
						<option value="MONTH">월 단위</option>
					</select>
				</div>
			</div>
		</li>
	</ul>
	<ul>

		<li>
			<div class="fwBox">
				<span class="ft">시작</span>
				<div class="input">
					<input type="text" class="startDatepicker" placeholder="시작기간" id="fromDate" autocomplete="off">
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">종료</span>
				<div class="input">
					<input type="text" class="endDatepicker" placeholder="종료기간" id="toDate" autocomplete="off">
				</div>
			</div>
		</li>
		<li>
			<div class="btns">
				<button class="sBtn sColorLB search" id="selectButton">검색</button>
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
            <canvas id="ac2p1-1"></canvas>
        </div>
    </div>
</article>

<script src="/resources/chart-admin/ac2p1-1.js"></script>