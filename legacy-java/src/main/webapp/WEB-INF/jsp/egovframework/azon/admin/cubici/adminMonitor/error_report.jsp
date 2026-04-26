<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>

var pagingMaxNo = 0; // 페이징 번호 1, 11, 21, 31, ... -> 페이징 버튼 생성에 사용
var nowPageNo = 0; // 현재 페이징 번호 -> 페이징 버튼 활성화에 사용
// 기존 검색조건 유지하기 위한 전역변수
var varFromDate = ""; // 시작일
var varToDate = ""; // 종료일
var varSelectShop = ""; // 쇼핑몰
var varSelectStatus = ""; // 상태
var varScenarioName = "" ; // 시나리오명
var varSelectLimit = 10; // LIMIT 설정
var varRuntime = 0; // runtime

// 컬럼 이름 배열
var varTheadArray = new Array();

$(document).ready(function(){
	if("${resultCode}" === "0"){

		let toDate = new Date(formatDate("${toDate}"));
		toDate.setDate(toDate.getDate()+1);
		toDate = formatDate(toDate);
		
		$("#fromDate").val("${fromDate}");
		$("#toDate").val(toDate);
		
		// 에러로그 목록
		tableSearch();
	}else{
		alert("ErrorCode ::: " + "${resultCode}");
	}
	
	$(document).on('click', "#selectButton",function(){
		tableSearch();
	});
	
	$(document).on('click', "#cancel",function(){
		window.location.href = '/admin/cubici/adminMonitor/error_report';
	});
	
});

// 검색조건으로 검색할 때
function tableSearch(){
	
	// 선택옵션 숨기기
	$('.selectList').css('display','none');
	
	// 컬럼 초기화
	varTheadArray.length=0;
	
	for(let i=0; i<1; i++){
		varTheadArray.push("에러로그");
	}
	
	// 시작일
	let fromDate = formatDate($("#fromDate").val());
	varFromDate = new Date(fromDate);
	
	// 종료일
	let toDate = new Date(formatDate($("#toDate").val()));
	toDate.setDate(toDate.getDate()+1);
	toDate = formatDate(toDate);
	varToDate = toDate;
	
	// 쇼핑몰
	let selectShop = $("#selectShop option:selected").val();
	varSelectShop = selectShop;
	
	// 상태
	let selectStatus = $("#selectStatus option:selected").val();
	varSelectStatus = selectStatus;
	
	// 시나리오
	let scenarioName = $("#scenarioName").val();
	varScenarioName = scenarioName;
	
	errorReportFunc(1, undefined, fromDate, toDate, selectShop, selectStatus, scenarioName )
}

//에러 상세 목록
function errorReportFunc(pageNo, pageFlag, fromDate, toDate, selectShop, selectStatus, scenarioName){
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	// 페이징 버튼 이벤트로 함수 실행했을 때
	if(scenarioName === undefined){
		fromDate = varFromDate;
		toDate = varToDate;
		selectShop = varSelectShop;
		selectStatus = varSelectStatus;
		scenarioName = varScenarioName;
	}
	
	// LIMIT
	let tempNo = 10*(pageNo-1);
	let limitStr = tempNo + "," + 10;
	
	// 전역변수에 현재 몇페이지인지 저장
	nowPageNo = pageNo;
	// 전역변수에 새로운 페이징 번호 저장 11, 21, 31
	if(pageFlag !== undefined && (pageFlag === "next" || pageFlag === "previous")){
		pagingMaxNo = pageNo;
	}
	
	let shopTypeList = "";
	if(selectShop === "0"){ // 전체 선택
		shopTypeList = "${shopList}";
	} else {
		shopTypeList = selectShop;
	}
	
	let callUrl = "/admin/cubici/adminMonitor/error_report/get";
	let callBackFunc = "errorReportFuncResponse";
	let objParam = {
			fromDate : fromDate, // 시작일
			toDate : toDate, // 종료일
			selectShop : shopTypeList, // 쇼핑몰
			selectStatus : selectStatus, // 상태
			LIMIT : limitStr, // LIMIT
			NOWPAGENO : nowPageNo, // 현페이지
			SCENARIO : "%"+scenarioName+"%" // 시나리오
 	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}
 function errorReportFuncResponse(data){
	
	let getData = data.logData;
	if(getData.length === 0){
		$("#fixTable").empty().html("조회된 데이터가 없습니다.");
		$("#pagingButton").empty();
		//로딩바 해제
		$(".loadingSpinner").css({"display" : "none"});
		return false;
	}
	
	let maxRowNo = getData.length; // 불러온 데이터중 가장 마지막 번호
	
	// 테이블 다시 그리기
	let insertTable = '<div class="overflowBox mCustomScrollbar">';
	insertTable += '<div class="fixArea">';
	insertTable += '<div class="fixRow">';
	insertTable += '<table class="m-shadowTable">';
	insertTable += '<thead><tr><th>쇼핑몰</th><th>ID</th><th>시나리오</th><th>시작일</th><th>실행시간</th><th>상태</th></tr></thead>';
	insertTable += '<tbody id="fixTbody">';

	// 테이블 > 고정 컬림
	let insertFixTbody ="";
	for(let i=0; i<getData.length; i++){
		let getTableData = getData[i];
		
		let btnColor = "";
		let status="";
		let date = new Date(getTableData.INPUT_DATETIME);
		let detail = "";
		
		// 실행시간 및 시작일 계산 변수
		let runtime = getTableData.RUNTIME;
		let runM = 0; // 시
		let runH = 0; // 분
		let runS = 0; // 초
		let runTime = "";
		
		if(runtime == null){
			runtime = 0;
		}
		
		// 실행시간 변환
		if(runtime >= 3600){
			runH = parseInt(runtime / 3600);
			runM = parseInt((runtime - runH*3600) / 60);
			runS = runtime % 60;
		}else if(runtime >=60){
			runM = parseInt(runtime/60);
			runS = runtime%60;
		}else{
			runS = runtime;
		}
		
		runTime= runH +"시간 "+runM+"분 "+runS + "초";
		
		// 초단위 계산
		date.setSeconds(date.getSeconds()-runtime);
		
		// 초단위까지 자르기
		date = timestamp(date);
		
		if(getTableData.STATUS === "성공"){
			btnColor = "sColorLS";
			status ="성공";
		} else if(getTableData.STATUS === "실패"){
			btnColor = "sColorR";
			status="실패";
		}
		
		insertFixTbody += "<tr style='height:90px'>";
		insertFixTbody += "<td><div class='tIn'>"+ getTableData.CODE_NM +"</div></td>";
		insertFixTbody += "<td><div class='tIn'>"+ getTableData.SHOP_ID +"</div></td>";
		insertFixTbody += "<td><div class='tIn'>"+ getTableData.CAUSE +"</div></td>";
		insertFixTbody += "<td><div class='tIn'>"+ date +"</div></td>";
		insertFixTbody += "<td><div class='tIn'> "+runTime+"</div></td>";
		insertFixTbody += "<td><div class='tIn'><span class='sBtn "+btnColor+" rBtn'> "+ status +" </span><div></td>";
		insertFixTbody += "</tr>";
	}
	
	insertTable += insertFixTbody;
	insertTable += '</tbody></table></div>';
	insertTable += '<div class="rollRow"><table class="m-shadowTable">';   
	insertTable += '<thead id="scrollThead">';
	
	// 테이블 > 변동 컬럼
	// 테이블 헤드
	let insertScrollThead = "<tr>";
	insertScrollThead += "<th> "+varTheadArray[0]+" </th>";
	insertScrollThead += "</tr>";
	insertTable += insertScrollThead;
	insertTable += '</thead>';
	insertTable += '<tbody id="scrollTbody">';
	
	
	// 테이블 바디
	let insertScrollTbody = "";
	for(let i=0; i<getData.length; i++){
		insertScrollTbody += "<tr style='height:90px'>";
		for(let j=0; j<varTheadArray.length; j++){
			// 컬럼 태그
			if(j === 0){
				insertScrollTbody += "<th><div style = 'font-size:11px'>";
			} else {
				insertScrollTbody += "<td><div style = 'font-size:11px'>";
			}
			// 내용
			if(varTheadArray[j] === "에러로그"){
				insertScrollTbody += getData[i].ERROR_LOG.replace('class', '"class"');
			} 
			// 컬럼 태그
			if(j === 0){
				insertScrollTbody += "</div></th>";
			} else {
				insertScrollTbody += "</div></td>";
			}
		}
		insertScrollTbody += "</tr>";
	}
	insertTable += insertScrollTbody;
	insertTable += '</tbody></table></div></div></div>';
	
	$("#fixTable").html(insertTable);
	
	
	// 페이징
	let pageMaxCnt = data.cnt[0].count / varSelectLimit ;
	let currentPage = data.currentPage - 1;
	let pageCnt = Math.floor(currentPage / 10);
	
	// 페이징 버튼
	let pageHtml = "<ul>";
	
	if(pageMaxCnt <10){
		for(let i =1; i <= Math.ceil(pageMaxCnt); i++){
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='errorReportFunc(";
			pageHtml += i + ', undefined' + ',"' + varFromDate    + '","' + varToDate   + '","' + varSelectShop   + '","' + varSelectStatus +'");' + "'>" + i + "</a><li>";
		}
	} else if (pageMaxCnt >=10){
		if(pageCnt > 0){ // 이전
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='errorReportFunc(" + ((pageCnt)*10);
			pageHtml += ', "previous"' + ',"' + varFromDate   + '","' + varToDate  + '","' + varSelectShop   + '","' + varSelectStatus  +'");' + "'></a></li>"; 
		}
		for(let i=(pageCnt * 10) + 1; i<= (pageCnt*10)+10; i++){ // 1~ 10
			if(i>Math.ceil(pageMaxCnt)){
				break;
			}
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='errorReportFunc(";
			pageHtml += i + ', undefined' + ',"' + varFromDate    + '","' + varToDate   + '","' + varSelectShop   + '","' + varSelectStatus +'");' + "'>" + i + "</a><li>";
		}
		if(Math.floor(pageMaxCnt)>(pageCnt*10)+10){ // 다음
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='errorReportFunc(" + ((pageCnt+1)*10+1);
			pageHtml += ', "next"' + ',"' + varFromDate   + '","' + varToDate  + '","' + varSelectShop   + '","' + varSelectStatus  +'");' + "'></a></li>"; 
		}
	}
	
	pageHtml += '</ul>';
	$("#pagingButton").empty().html(pageHtml);
	
	// 페이징 버튼 활성화
	$('#pagingButton ul li').each(function (index, item) {
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
 
 // date 초단위까지 자르기
 function timestamp(today){ 
	 today.setHours(today.getHours() + 9); 
	 return today.toISOString().replace('T', ' ').substring(0, 19); 
	 }
 
 // 엔터키 이벤트
 function enterkey(){
	 if(window.event.keyCode == 13){
		 tableSearch();
	 }
 }
 
</script>
<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">시작</span>
                <div class="input">
                    <input type="text" class="startDatepicker" id="fromDate" placeholder="시작기간">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">종료</span>
                <div class="input">
                    <input type="text" class="endDatepicker" id="toDate" placeholder="종료기간">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">쇼핑몰</span>
                <div class="input">
                    <select id="selectShop">
                        <option value="0">전체</option>
                        <c:forEach var="shops" items="${shopInfoMap}">
                        	<option value='${shops.key}'>${shops.value}</option>
                        </c:forEach>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">상태</span>
                <div class="input">
                    <select id="selectStatus">
                        <option value="ALL">전체</option>
                        <option value="SUCCESS">성공</option>
                        <option value="FAIL">실패</option>
                    </select>
                </div>
            </div>
        </li>
             <li>
            <div class="btns">
                <button id="selectButton" class="sBtn sColorLB search">검색</button>
            </div>
        </li>
      </ul>
      <ul>
		<li>	
            <div class="fwBox">
            	<span class="ft">시나리오</span>
                <div class="input">
                    <input type="text" id="scenarioName" onkeyup="enterkey()" placeholder="시나리오...">
                </div>
            </div>
        </li>
      </ul>
</div>

<div class="tableSet">
    <div id="fixTable" class="fixTable">
    </div>
    <div class="m-paging" id="pagingButton">
    </div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>