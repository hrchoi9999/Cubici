<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!--사용 차트-->
<script src="/resources/chart-admin/cubici_tab1_chart.js"></script>

<script>
$(document).ready(function(){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	setTopData('topData');
	setMemChart("${fromDate}","${toDate}",'day','','');
	setRegiPeriodChart("${fromDate}","${toDate}",'day','','');
	setRegiPartnerChart("${fromDate}","${toDate}",'day');
	
	$("#fromDate").val("${fromDate}");
	$("#toDate").val("${toDate}");
	
	//구분 셀렉트 박스 옵션
	let selectDivision = $('.selectDivision')[0].id;
	selectMenuList(selectDivision);
	
	$(document).on('click','#searchBtn',function(){
		
		let fromDate = formatDate($("#fromDate").val()); // 시작일
		let toDate = formatDate($("#toDate").val()); // 종료일
		let dateFlag = $('#'+selectDivision).val();
		let partnerNm = $('#mbPartner').val();
		let serviceNm = $('#mbService').val();
		
		if(dateFlag == ""){
			alert("분석단위를 선택해주세요");
			return;
		}
		
		setMemChart(fromDate,toDate,dateFlag,partnerNm,serviceNm);
		setRegiPeriodChart(fromDate,toDate,dateFlag,partnerNm,serviceNm);
		setRegiPartnerChart(fromDate,toDate,dateFlag);
	});	
});

function setTopData(flag){
	
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/tab1Data";
	let callBackFunc = "tab1DataResponse";
	let objParam = {
		flag : flag
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);		
}
function tab1DataResponse(data){	
	$('#todayNewMem').html(data.todayNewMem);
	$('#thisMonthNewMem').html(data.thisMonthNewMem);
	$('#lastMonthNewMem').html(data.lastMonthNewMem);
	$('#todayWdMem').html(data.todayWdMem);
	$('#thisMonthWdMem').html(data.thisMonthWdMem);
	$('#lastMonthWdMem').html(data.lastMonthWdMem);
	$('#todaySales').html(comma(data.todaySales));
	$('#todayQuantity').html(comma(data.todayQuantity));
	$('#thisMonthSales').html(comma(data.thisMonthSales));
	$('#thisMonthQuantity').html(comma(data.thisMonthQuantity));
	$('#lastMonthSales').html(comma(data.lastMonthSales));
	$('#lastMonthQuantity').html(comma(data.lastMonthQuantity));
	$('#todaySetAmount').html(comma(data.todaySetAmount));
	$('#thisMonthSetAmount').html(comma(data.thisMonthSetAmount));
	$('#lastMonthSetAmount').html(comma(data.lastMonthSetAmount));
	$('#todaySKU').html(comma(data.todaySKU));
	$('#thisMonthSKU').html(comma(data.thisMonthSKU));
	$('#lastMonthSKU').html(comma(data.lastMonthSKU));	

	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
}

//가입자 수
function setMemChart(fromDate,toDate,dateFlag,partnerNm,serviceNm){

	let productType = "";
	if(serviceNm == 'advCalc'){
		productType = '선정산';
	} else if(serviceNm == 'advPay') {
		productType = '선지급';
	}
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/memChartData";
	let callBackFunc = "setMemChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		dateFlag : dateFlag,
		PARTNER : partnerNm,
		PRODUCT_TYPE : productType
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}
function setMemChartResponse(data){
	let newUser = [];
	let outUser = [];
	let lineData = [];
	let barLabel = [];
	
	for(let i=0; i<data.newMemMap.length; i++){
		if(data.dateFlag === 'day'){
			barLabel.push(formatDate(data.newMemMap[i].REG_DATE));
		} else if (data.dateFlag === 'week') {
			barLabel.push(data.newMemMap[i].YEARMONTH + " " + data.newMemMap[i].MONTHOFWEEK + "주");
		} else if (data.dateFlag === 'month') {
			barLabel.push(data.newMemMap[i].YEARMONTH);
		}
		newUser.push(data.newMemMap[i].COUNT);
		outUser.push(data.wdMemMap[i].COUNT);
		lineData.push(data.newMemMap[i].COUNT - data.wdMemMap[i].COUNT );
	}	
	lineData[0] = lineData[0] + data.memTotal - data.wdMemTotal;
	
	memChartFunc('memChart', newUser, outUser, lineData, barLabel);
}

//가입기간
function setRegiPeriodChart(fromDate,toDate,dateFlag,partnerNm,serviceNm){
	let productType = "";
	if(serviceNm == 'advCalc'){
		productType = '선정산';
	} else if(serviceNm == 'advPay') {
		productType = '선지급';
	}
	
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/regiPeriodChartData";
	let callBackFunc = "setRegiPeriodChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		dateFlag : dateFlag,
		PARTNER : partnerNm,
		PRODUCT_TYPE : productType
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}
function setRegiPeriodChartResponse(data){
	let cubiciPeriod = [];
	let moneyPeriod = [];
	let barLabel = [];
	
	for(let i=0; i<data.cubiciPeriodMap.length; i++){
		if(data.dateFlag === 'day'){
			barLabel.push(formatDate(data.cubiciPeriodMap[i].DATE));
		} else if (data.dateFlag === 'week') {
			barLabel.push(data.cubiciPeriodMap[i].YEARMONTH + " " + data.cubiciPeriodMap[i].MONTHOFWEEK + "주");
		} else if (data.dateFlag === 'month') {
			barLabel.push(data.cubiciPeriodMap[i].YEARMONTH);
		}
		cubiciPeriod.push(data.cubiciPeriodMap[i].period);
		moneyPeriod.push(data.moneyPeriodMap[i].period);
	}	
	
	regiPeriodChartFunc('regiPeriodChart', cubiciPeriod, moneyPeriod, barLabel);
}

//가입채널
function setRegiPartnerChart(fromDate, toDate, dateFlag){
	let callUrl = "/admin/cubici/infoIntegrated/cubici_tab1/regiPartnerData";
	let callBackFunc = "setRegiPartnerChartResponse";
	let objParam = {
		fromDate : fromDate,
		toDate : toDate,
		dateFlag : dateFlag
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);	
}

function setRegiPartnerChartResponse(data) {
	let cubiciMem = []; //큐빅아이 회원
	let partner1 = []; //제휴 회원
	let barStckedLabel = [];
	
	for(let i=0; i<data.regiPartnerMap.length; i++){
		if(data.dateFlag === 'day'){
			barStckedLabel.push(data.regiPartnerMap[i].REG_DATE);
		} else if (data.dateFlag === 'week') {
			barStckedLabel.push(data.regiPartnerMap[i].YEARMONTH + " " + data.regiPartnerMap[i].MONTHOFWEEK + "주");
		} else if (data.dateFlag === 'month') {
			barStckedLabel.push(data.regiPartnerMap[i].YEARMONTH);
		}
		cubiciMem.push(data.regiPartnerMap[i].COUNT);
		partner1.push(data.regiPartnerMap1[i].COUNT);
	}		
	regiPartnerChartFunc('regiPartnerChart', cubiciMem, partner1, cubiciMem, cubiciMem, barStckedLabel);
}
</script>

<div class="m-tab">
 	<ul>
        <li class="active"><a href="/admin/cubici/infoIntegrated/cubici_tab1">종합 지표</a></li>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab2">매출 지표</a></li>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab3">활동 지표</a></li>
        <li><a href="/admin/cubici/infoIntegrated/cubici_tab4">이용료 지표</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="infoArea">
            <a href="javascript:;" class="oiBtn infoBtn navy">정보</a>
            <div class="infoMemo">
                <div class="iCon">
                    <p>• 금일 : 기준일자(D) 하루 전 (D-1)기준으로 산출됩니다.</p>
                    <p>• 당월 : 당월 1일부터 D-1까지의 누적 합계 </p>
                    <p>• 전월 : 전월 1일부터 말일까지의 합계 </p>
                </div>
            </div>
        </span>
        <span class="baseDate pRight"><b>기준</b>${toDate}</span>
    </div>
</div>

<div class="colorTxtBoxArea">
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-01.png" alt="신규가입">
        </div>
        <div class="txtBox">
            <table id="newMemData">
                <tr>
                    <th><h3>큐빅아이 신규가입</h3></th>
                </tr>
                <tr>
                    <td>•금일 : <span id="todayNewMem"></span></td>
                </tr>
                <tr>
                    <td>•당월 : <span id="thisMonthNewMem"></span></td>
                </tr>
                <tr>
                    <td>•전월 : <span id="lastMonthNewMem"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-02.png" alt="해지회원">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>큐빅아이 해지회원</h3></th>
                </tr>
                <tr>
                    <td>•금일 : <span id="todayWdMem"></span></td>
                </tr>
                <tr>
                    <td>•당월 : <span id="thisMonthWdMem"></span></td>
                </tr>
                <tr>
                    <td>•전월 : <span id="lastMonthWdMem"></span></td>
                </tr>
            </table>
		</div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-03.png" alt="금액">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>이용료 수입 (백만원)</h3></th>
                </tr>
                <tr>
                    <td>•금일 : 000</td>
                </tr>
                <tr>
                    <td>•당월 : 000</td>
                </tr>
                <tr>
                    <td>•전월 : 000</td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-04.png" alt="명">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>휴면회원 (명)</h3></th>
                </tr>
                <tr>
                    <td>•금일 : <span id="todayWdMem"></span></td>
                </tr>
                <tr>
                    <td>•당월 : <span id="thisMonthWdMem"></span></td>
                </tr>
                <tr>
                    <td>•전월 : <span id="lastMonthWdMem"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-05.png" alt="금액">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>매출금액 (백만원)</h3></th>
                </tr>
                <tr>
                    <td>•금일 : <span id="todaySales"></span></td>
                </tr>
                <tr>
                    <td>•당월 : <span id="thisMonthSales"></span></td>
                </tr>
                <tr>
                    <td>•전월 : <span id="lastMonthSales"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-06.png" alt="건">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>판매수량</h3></th>
                </tr>
                <tr>
                    <td>•금일 : <span id="todayQuantity"></span></td>
                </tr>
                <tr>
                    <td>•당월 : <span id="thisMonthQuantity"></span></td>
                </tr>
                <tr>
                    <td>•전월 : <span id="lastMonthQuantity"></span></td>
                </tr>
            </table>
		</div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-08.png" alt="찾기">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>정산금액 (백만원)</h3></th>
                </tr>
                <tr>
                    <td>•금일 : <span id="todaySetAmount"></span></td>
                </tr>
                <tr>
                    <td>•당월 : <span id="thisMonthSetAmount"></span></td>
                </tr>
                <tr>
                    <td>•전월 : <span id="lastMonthSetAmount"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-07.png" alt="상승">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>등록 SKU 수</h3></th>
                </tr>
                <tr>
                    <td>•금일 : <span id="todaySKU"></span></td>
                </tr>
                <tr>
                    <td>•당월 : <span id="thisMonthSKU"></span></td>
                </tr>
                <tr>
                	<td>•전월 : <span id="lastMonthSKU"></span></td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-09.png" alt="명">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>방문자 수</h3></th>
                </tr>
                <tr>
                    <td>•금일 : 000</td>
                </tr>
                <tr>
                    <td>•당월 : 000</td>
                </tr>
                <tr>
                    <td>•전월 : 000</td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-10.png" alt="그룹">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>최대동시 접속</h3></th>
                </tr>
                <tr>
                    <td>•금일 : 000</td>
                </tr>
                <tr>
                    <td>•당월 : 000</td>
                </tr>
                <tr>
                    <td>•전월 : 000</td>
                </tr>
            </table>
		</div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-11.png" alt="시간">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>평균 이용시간</h3></th>
                </tr>
                <tr>
                    <td>•금일 : 000</td>
                </tr>
                <tr>
                    <td>•당월 : 000</td>
                </tr>
                <tr>
                    <td>•전월 : 000</td>
                </tr>
            </table>
        </div>
    </article>
    <article>
        <div class="colorBox2">
            <img src="/resources/img/icon/icon-12.png" alt="건">
        </div>
        <div class="txtBox">
            <table>
                <tr>
                    <th><h3>평균등록 쇼핑몰</h3></th>
                </tr>
                <tr>
                    <td>•금일 : 000</td>
                </tr>
                <tr>
                    <td>•당월 : 000</td>
                </tr>
                <tr>
                    <td>•전월 : 000</td>
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
                    <select id="mbPartner">
                    	<option value="">전체</option>
                    	<option value="FI32">헬로핀테크</option>
                    </select>
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">서비스</span>
                <div class="input">
                    <select id="mbService">
                    	<option value="">전체</option>
                        <option value="advCalc">선정산</option>
                        <option value="advPay">선지급</option>
                    </select>
                </div>
            </div>
        </li>
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
                    <input type="text" class="startDatepicker" id="fromDate" placeholder="시작기간">
                </div>
            </div>
        </li>
        <li class="col-1d5">
            <div class="fwBox">
                <span class="ft">종료</span>
                <div class="input">
                    <input type="text" class="endDatepicker" id="toDate" placeholder="종료기간">
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button id="searchBtn" class="sBtn sColorLB search">검색</button>
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
        <h4>회원가입</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="memChart"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>가입 기간</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="regiPeriodChart"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>가입 채널</h4>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="regiPartnerChart"></canvas>
        </div>
    </div>
</article>