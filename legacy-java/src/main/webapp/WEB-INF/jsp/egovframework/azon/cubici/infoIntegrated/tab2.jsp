<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<!--사용 차트-->
<script src="/resources/chart/bar-stacked.js"></script>

<script>
$(document).ready(function() {
	
	if ("${resultCode}" === "0") {
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
		
		for(let i=0; i<Number("${shopInfoMap.shop_count}"); i++){
			$("#selectShop").append("<option value="+shopTypeList[i]+">"+shopNameList[i]+"</option>");
		}
		
		$('#fromDate').val("${fromDate}");
		$('#toDate').val("${toDate}");
		
		// 매출 그래프
		salesGraph();
		// 반품 그래프
		returnGraph();
	} else {
		modalInfo("ErrorCode ::: " + "${resultCode}");
	}

	// 조회버튼
	$(document).on('click', "#selectButton", function(){
		salesGraph();
		returnGraph();
    });
	
	// Excel Download
	$("#sellPriceExcelBtn").on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41" || thisUser == "40"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess(1);
		}
	});
	
	$("#returnExcelBtn").on("click", function(){
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess(2);
		}
	});
});

// 매출 그래프
function salesGraph(){
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	// 파라미터
	let selectShop = $("#selectShop option:selected").val();
	let selectCondition = $("#selectCondition option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	
	let shopTypeList = "";
	if(selectShop === "0"){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}
	
	let callUrl = "/cubici/integratedInfo/salesGraph";
	let callBackFunc = "salesGraphResponse";
	let objParam = {
		FLAG : "tab2",
		SHOP_TYPE_LIST : shopTypeList,
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		fromDate : formatDate(fromDate),
		toDate : formatDate(toDate),
		SELECT_CONDITION : selectCondition,
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function salesGraphResponse(data){

	let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
	
	// 기준 구분
	let selectCondition = data.selectCondition;
	
	// 그래프 그리기 위해 필요한 배열 데이터
	let barStckedLabel = new Array(data.salesGraph.length);
	let barStckedAuctionData = new Array(data.salesGraph.length);
	let barStckedCoupangData = new Array(data.salesGraph.length);
	let barStckedElevenData = new Array(data.salesGraph.length);
	let barStckedGmarketData = new Array(data.salesGraph.length);
	let barStckedInterparkData = new Array(data.salesGraph.length);
	let barStckedNaverData = new Array(data.salesGraph.length);
	
	// 구분 플래그
	let FLAG = "";
	
	// 기준에 따라 플래그 나뉨
	if(selectCondition === "PRICE"){
		FLAG = "PRICE";
		// 당월 판매 금액
  		for(let i = 0; i<data.salesGraph.length; i++){
			barStckedLabel[i] = data.salesGraph[i].ORDERED_AT;
			barStckedAuctionData[i] = data.salesGraph[i].AUCTION_PRICE;
			barStckedCoupangData[i] = data.salesGraph[i].COUPANG_PRICE;
			barStckedElevenData[i] = data.salesGraph[i].ELEVEN_PRICE;
			barStckedGmarketData[i] = data.salesGraph[i].GMARKET_PRICE;
			barStckedInterparkData[i] = data.salesGraph[i].INTERPARK_PRICE;
			barStckedNaverData[i] = data.salesGraph[i].NAVER_PRICE;
			}  
	} else if (selectCondition === "QUANTITY"){
		FLAG = "QUANTITY";
		// 당월 판매 수량
		for(let i = 0; i<data.salesGraph.length; i++){
			barStckedLabel[i] = data.salesGraph[i].ORDERED_AT;
			barStckedAuctionData[i] = data.salesGraph[i].AUCTION_QUANTITY;
			barStckedCoupangData[i] = data.salesGraph[i].COUPANG_QUANTITY;
			barStckedElevenData[i] = data.salesGraph[i].ELEVEN_QUANTITY;
			barStckedGmarketData[i] = data.salesGraph[i].GMARKET_QUANTITY;
			barStckedInterparkData[i] = data.salesGraph[i].INTERPARK_QUANTITY;
			barStckedNaverData[i] = data.salesGraph[i].NAVER_QUANTITY;
			}
		}
	
	// 그래프에 들어가는 dataSets 초기화
	let dataSets = new Array(shopNameList.length);;

	// 임시 데이터 sets
	// 각 쇼핑몰에 맞는 데이터와 그래프 색을 지정해놓음
	let dataImsi = [
	   	 {
	         label: '인터파크',
	         data: barStckedInterparkData,
	         backgroundColor: '#0049ad',
	     },{
	         label: '지마켓',
	         data: barStckedGmarketData,
	         backgroundColor: '#f9a268',
	     },{
	         label: '옥션',
	         data: barStckedAuctionData,
	         backgroundColor: '#3de962',
	     },{
	         label: '11번가',
	         data: barStckedElevenData,
	         backgroundColor: '#fe7b90',
	     },{
	         label: '쿠팡',
	         data: barStckedCoupangData,
	         backgroundColor: '#26ccd2',
	     },{
	         label: '네이버',
	         data: barStckedNaverData,
	         backgroundColor: '#7c2dde',
	     }
	 ];
	
	// 계정에 등록되어 있는 쇼핑몰 리스트에 따라 dataSets에 넣어줌
	for(let i=0; i<shopNameList.length; i++){
		for(let j=0; j<dataImsi.length; j++){
			if(shopNameList[i] == dataImsi[j].label){
				dataSets[i]=dataImsi[j];
				continue;
			}
		}
	};
	
	// 그래프 그리기 위한 데이터 object
     let data1 = {
         datasets: dataSets,
         labels: barStckedLabel,
         FLAG : FLAG
     };
     
     ComboBarLineChart('bar-stcked', data1);
     
     // 로딩바 해제
     $(".loadingSpinner").css({"display" : "none"});
}

// 반품 그래프
function returnGraph(){
	
	// 파라미터
	let selectShop = $("#selectShop option:selected").val();
	let selectCondition = $("#selectCondition option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	
	let shopTypeList = "";
	if(selectShop === "0"){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}
	
	let callUrl = "/cubici/integratedInfo/returnGraph";
	let callBackFunc = "returnGraphResponse";
	let objParam = {
		FLAG : "tab2",
		SHOP_TYPE_LIST : shopTypeList,
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		fromDate : formatDate(fromDate),
		toDate : formatDate(toDate),
		SELECT_CONDITION : selectCondition,
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function returnGraphResponse(data){
	
	// 기준
	let selectCondition = data.selectCondition;
	let barStckedLabel2 = new Array(data.returnGraph.length);
	
	// 기준에 따른 플래그
	let FLAG = "";
	
	// 당월 판매액, 날짜
  	for(let i = 0; i<data.returnGraph.length; i++){
  		barStckedLabel2[i] = data.returnGraph[i].STD_DATE;
	}   
	
	// 날짜 중복 처리
	let uniqueArr = []; // 처리된 배열
	for (var i=0; i<barStckedLabel2.length; i++) {
		  if (uniqueArr.indexOf(barStckedLabel2[i]) === -1) 
			  uniqueArr.push(barStckedLabel2[i]);
		}
	
  	// uniqueArr 길이 만큼의 배열 생성
  	let barStckedExchangeData = new Array(uniqueArr.length);
	let barStckedReturnData = new Array(uniqueArr.length);
  
	// 기준에 따라 데이터 삽입
   	for(let i = 0; i<uniqueArr.length; i++){
   		for(let j = 0; j<data.returnGraph.length; j++){
   			if(selectCondition === "QUANTITY"){
   				FLAG = "QUANTITY";
   				// 반품, 교환 구분하여 데이터 삽입, 없는 데이터는 undefined
   				if(uniqueArr[i] == data.returnGraph[j].STD_DATE && data.returnGraph[j].DIVISION === "반품")	
	   				barStckedReturnData[i] = -data.returnGraph[j].QUANTITY;
		   	 	else if (uniqueArr[i] == data.returnGraph[j].STD_DATE && data.returnGraph[j].DIVISION === "교환")	
		   	 	barStckedExchangeData[i] = data.returnGraph[j].QUANTITY;
	   		}else if(selectCondition === "PRICE"){
	   			FLAG = "PRICE";
	   			if(uniqueArr[i] == data.returnGraph[j].STD_DATE && data.returnGraph[j].DIVISION === "반품")	
	   				barStckedReturnData[i] = -data.returnGraph[j].PRICE;
		   	 	else if (uniqueArr[i] == data.returnGraph[j].STD_DATE && data.returnGraph[j].DIVISION === "교환")	
		   	 	barStckedExchangeData[i] = data.returnGraph[j].PRICE;
	   		}
   		}
   	}
  	
    let data2 = {
        datasets: [
        	{
        		label: '반품',
		        data: barStckedReturnData,
		        backgroundColor: '#0049ad',
		    },
	    	{
	        	label: '교환',
	        	data: barStckedExchangeData,
	        	backgroundColor: '#f9a268',
	    	}
    	],
    	labels: uniqueArr,
        FLAG : FLAG
    };
    
     ComboBarLineChart2('bar-stcked-minus', data2);
}

//엑셀 다운 프로세스 (MKC 2021.04.13)
function doExcelDownloadProcess(graphNum) {
	
	// 그래프 번호 (판매금액 : 1 , 반품교환 : 2)
	let excelFlag = graphNum;
	
	// 쇼핑몰 선택 (코드 & 이름 저장)
	let selectShop = $("#selectShop option:selected").val();
	let shopTypeList = ""; // 쇼핑몰 코드
	let shopNameListStr = ""; // 쇼핑몰명
	if(selectShop === "0"){ // 전체 선택 시
		shopTypeList = "${shopInfoMap.shop_type_list}"; // 전체 쇼핑몰 코드
		
		let shopNameList = "${shopInfoMap.shop_name_list}";
		shopNameListStr = shopNameList.replace(/\^/gi, "").replace(/\|/gi, ","); // 전체 쇼핑몰명
		
	} else { // 쇼핑몰을 선택 시
		shopTypeList = selectShop; // 쇼핑몰 코드
		
		// 쇼핑몰명
		if(selectShop === "1"){
			shopNameListStr = "인터파크";
		}else if(selectShop === "2"){
			shopNameListStr = "지마켓";
		}else if(selectShop === "3"){
			shopNameListStr = "옥션";
		}else if(selectShop === "4"){
			shopNameListStr = "11번가";
		}else if(selectShop === "11"){
			shopNameListStr = "쿠팡";
		}else if(selectShop === "14"){
			shopNameListStr = "네이버";
		}
	}

	// 날짜
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	
	// 초기화
	if ($("#excelForm").html != null) {
		$("#excelForm").remove();
	}
	
	// form 태그 생성
	var formHtml = "";
	formHtml = '<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data" style="display: none">'
	formHtml += '<input type="hidden" name="userNo" value="${principal.user_no}">';
	formHtml += '<input type="hidden" name="coupang_settle_type" value="${principal.coupang_settlement_type}">';
	formHtml += '<input type="hidden" name="fromDate" value="'+formatDate(fromDate)+'">';
	formHtml += '<input type="hidden" name="toDate" value="'+formatDate(toDate)+'">';
	formHtml += '<input type="hidden" name="shop_type_list" value="'+shopTypeList+'">';
	formHtml += '<input type="hidden" name="shop_name_list" value="'+shopNameListStr+'">';
	formHtml += '<input type="hidden" name="interpark_id" value="${shopInfoMap.interpark_id}">';
	formHtml += '<input type="hidden" name="eleven_id" value="${shopInfoMap.eleven_id}">';
	formHtml += '<input type="hidden" name="gmarket_id" value="${shopInfoMap.gmarket_id}">';
	formHtml += '<input type="hidden" name="auction_id" value="${shopInfoMap.auction_id}">';
	formHtml += '<input type="hidden" name="naver_id" value="${shopInfoMap.naver_id}">';
	formHtml += '<input type="hidden" name="coupang_id" value="${shopInfoMap.coupang_id}">';
	formHtml += '<input type="hidden" name="excelFlag" value="'+excelFlag+'">';
	formHtml += '</form>';
	$(".excelDiv").append(formHtml);

	var excelFrm = document.excelForm;
	excelFrm.action = "/cubici/integratedInfo/excelDownload";
	excelFrm.submit();
}
</script>

<div class="m-options">
    <span class="baseDate pRight"><b>기준</b>${toDate}</span>
</div>
<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">쇼핑몰</span>
                <div class="input">
                    <select id="selectShop">
                        <option value="0">전체</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">기준</span>
                <div class="input">
                    <select id="selectCondition" class="form-control">
						<option value="PRICE">금액</option>
						<option value="QUANTITY">수량</option>
					</select>
                </div>
            </div>
        </li>
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
    </ul>
</div>

<article class="subBox">
    <header>
        <h4>쇼핑몰 결제 금액</h4>
        <ul class="btns">
            <li>
                <a class="iBtn excel" style="cursor: pointer" id="sellPriceExcelBtn">엑셀 다운로드</a>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="bar-stcked"></canvas>
        </div>
    </div>
</article>

<article class="subBox">
    <header>
        <h4>반품 및 교환</h4>
        <ul class="btns">
            <li class="infoArea">
                <a href="javascript:;" class="oiBtn infoBtn white">정보</a>
                <div class="infoMemo">
                    <h5><span></span></h5>
                    <div class="iCon">
                        <p>등록 판매금액을 기준으로 교환상품은 플러스로, 반품은 마이너스로 표시되었습니다.</p>
                    </div>
                </div>
            </li>
            <li>
                <a class="iBtn excel" style="cursor: pointer" id="returnExcelBtn">엑셀 다운로드</a>
                <div class="excelDiv"></div>
            </li>
        </ul>
    </header>
    <div class="contentArea">
        <div class="chartBox">
            <canvas id="bar-stcked-minus"></canvas>
        </div>
    </div>
</article>
