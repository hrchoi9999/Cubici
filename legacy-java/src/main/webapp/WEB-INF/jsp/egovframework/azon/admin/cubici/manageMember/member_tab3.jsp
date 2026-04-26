<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>

var pagingMaxNo = 0; // 페이징 번호 1, 11, 21, 31, ... -> 페이징 버튼 생성에 사용
var nowPageNo = 0; // 현재 페이징 번호 -> 페이징 버튼 활성화에 사용
// 기존 검색조건 유지하기 위한 전역변수
var varSelectDivision = ""; // 구분
var varFromDate = ""; // 시작일
var varToDate = ""; // 종료일
var varSelectLimit = 10; // LIMIT 설정
var varSelectOrderBy = ""; // ORDER BY 설정
var varUserName = ""; // 회원명
var varCompanyName =""; // 회사명
var varUserId =""; // 회원 ID
var varPartnerFirm = ""; // 협력사

// 컬럼 이름 배열
var varTheadArray = new Array();

$(document).ready(function(){
	
	if("${resultCode}" === "0"){
	
		$("#fromDate").val("${fromDate}");
		$("#toDate").val("${toDate}");

		// 회원상세 목록
		tableSearch();
	}else{
		alert("ErrorCode ::: " + "${resultCode}");
	}
	
	$(document).on('click', "#selectButton",function(){
		tableSearch();
	});

	// 협력사 - 서비스 구분
	$(document).on('change', "#partnerFirm", function(){
		changeServiceDivision($("#partnerFirm option:selected").val());
	});
	
	$(document).on('click', "#cancel",function(){
		window.location.href = '/admin/cubici/manageMember/member_tab3';
	});
	
});

//협력사 - 서비스 구분
function changeServiceDivision(data){
	
	let firmNo = data.split('=')[0];
	let firmNm = data.split('=')[1];

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

// 검색조건으로 검색할 때
function tableSearch(){
	
	// 선택옵션 숨기기
	$('.selectList').css('display','none');
	
	// 컬럼 초기화
	varTheadArray.length=0;
	
	$(".columnCheck").each(function(){
		if(this.checked){
			let theadStr = $(this).parent().find("span").text();
			varTheadArray.push(theadStr.slice(0,theadStr.length));
		}
	});
	
	// 회원명
	let userName = $("#userName").val();
	varUserName = userName;
	
	// 회사명
	let companyName = $("#companyName").val();
	varCompanyName = companyName;
	
	// 회원ID
	let userId = $("#userId").val();
	varUserId = userId;
	
	// 협력사
	let partnerFirm = $("#partnerFirm option:selected").val().split('=')[0];
	varPartnerFirm = partnerFirm;
	
	// 시작일
	let fromDate = formatDate($("#fromDate").val());
	varFromDate = fromDate;
	
	// 종료일
	let toDate = formatDate($("#toDate").val());
	varToDate = toDate;
	
	// ORDER BY 설정
	let selectOrderBy = $("#tableOrderBy option:selected").val();
	varSelectOrderBy = selectOrderBy;
	
	// 서비스 구분
	let selectDivision = $("#serviceDivision option:selected").val();
	varSelectDivision = selectDivision;
	
	userWithdrawFunc(1, undefined, userName, companyName, userId, partnerFirm, fromDate, toDate, selectOrderBy, selectDivision )
}

//회원 상세 목록
function userWithdrawFunc(pageNo, pageFlag, userName, companyName, userId, partnerFirm, fromDate, toDate, selectOrderBy, selectDivision){
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	// 페이징 버튼 이벤트로 함수 실행했을 때
	if(selectDivision === undefined){
		userName = varUserName;
		companyName = varCompanyName;
		userId = varUserId;
		partnerFirm = varPartnerFirm;
		fromDate = varFromDate;
		toDate = varToDate;
		selectOrderBy = varSelectOrderBy;
		selectDivision = varSelectDivision;
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
	
	let callUrl = "/admin/cubici/manageMember/member_tab3/get";
	let callBackFunc = "userWithdrawFuncResponse";
	let objParam = {
			detailFlag : "tableList",
			fromDate : fromDate, // 시작일
			toDate : toDate, // 종료일
			LIMIT : limitStr, // LIMIT
			ORDER_BY : selectOrderBy, // ORDER BY
			USER_NAME : "%" + userName + "%", // 회원명
			COMPANY_NAME : "%" + companyName + "%", // 회사명
			USER_ID : "%" + userId + "%", // 회원ID
			PARTNERFIRM : partnerFirm, // 협력사
			SERVICE : selectDivision, // 서비스 구분
			NOWPAGENO : nowPageNo // 현페이지
 	}
	
 	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}
function userWithdrawFuncResponse(data){

	// 사용할 해지 데이터
	let getData = data.withdrawDetailList;
	
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
	insertTable += '<thead><tr><th>해지신청</th><th>해지서비스</th><th>해지일자</th><th>회원명</th></th><th>회사명</th></tr></thead>';
	insertTable += '<tbody id="fixTbody">';

	// 테이블 > 고정 컬림
	let insertFixTbody ="";
	for(let i=0; i<getData.length; i++){
		
		let getTableData = getData[i];
		
		let btnColor = "";
		let service="";
		let date = getTableData.WITHDRAW_DATE;
		let re_date = getTableData.WITHDRAW_REQUEST_DATE;
		
		if(date == null){
			date = "-";
		} else if( date != null){
			date = formatDate(getTableData.WITHDRAW_DATE);
		}
		
		if(re_date == null){
			re_date = "-";
		} else if( re_date != null){
			re_date = formatDate(getTableData.WITHDRAW_REQUEST_DATE);
		}
		
		if(getTableData.FLAG === "CUBICI"){
			btnColor = "sColorLS";
			service ="큐빅아이";
		} else if(getTableData.FLAG === "MONEYBANK"){
			btnColor = "sColorN";
			service="머니뱅크";
		}
		
		insertFixTbody += "<tr>";
		insertFixTbody += "<td><div class='tIn'>"+ re_date +"</div></td>";
		insertFixTbody += "<td><div class='tIn'><span class='sBtn "+btnColor+" rBtn'> "+ service +" </span><div></td>";
		insertFixTbody += "<td><div class='tIn'>"+ date +"</div></td>";
		insertFixTbody += "<td><div class='tIn'><a href='javascript:;' class='underline modalOpen' data-modal='member_detail' onclick='selectOrderDetails("+getTableData.USER_NO+");'>"+getTableData.USER_NM+"</a></div></td>";
		insertFixTbody += "<td><div class='tIn'><a href='javascript:;' class='underline modalOpen' data-modal='member_detail' onclick='selectOrderDetails("+getTableData.USER_NO+");'>"+getTableData.FIRM_NM+"</a></div></td>";
		insertFixTbody += "</tr>";
	}
	
	insertTable += insertFixTbody;
	insertTable += '</tbody></table></div>';
	insertTable += '<div class="rollRow"><table class="m-shadowTable">';
	insertTable += '<thead id ="scrollThead">';
	
	// 테이블 > 변동 컬럼
	// 테이블 헤드
	let insertScrollThead = "<tr>";
	for(let i=0; i<varTheadArray.length; i++){
		insertScrollThead += "<th>"+varTheadArray[i]+"</th>";
	}
	insertScrollThead += "</tr>";
	insertTable += insertScrollThead;
	insertTable += '</thead>';
	insertTable += '<tbody id="scrollTbody">';
	
	// 테이블 바디
	let insertScrollTbody = "";
	for(let i=0; i<getData.length; i++){
		let getTableData = getData[i];
		insertScrollTbody += "<tr>";
		for(let i=0; i<varTheadArray.length; i++){
			// 컬럼 태그
			if(i === 0){
				insertScrollTbody += "<th><div class='tIn'>";
			} else {
				insertScrollTbody += "<td><div class='tIn'>";
			}
			// 내용
			 if(varTheadArray[i] === "대표자"){
				insertScrollTbody += getTableData.USER_NM;
			} else if(varTheadArray[i] === "핸드폰"){
				insertScrollTbody += getTableData.USER_PHONE;
			}  else if(varTheadArray[i] === "운영 쇼핑몰"){
				insertScrollTbody += getTableData.SHOP_COUNT + "개";
			} else if(varTheadArray[i] === "선정산 잔액"){
				insertScrollTbody += getTableData.FEE + "원";
			} else if(varTheadArray[i] === "해지 확인"){
				if(getTableData.WITHDRAW_DATE == null){
				insertScrollTbody += " <input type=\"checkbox\" onclick=\"modalInfoCancel("+getTableData.USER_NO+",'정말로 해지하시겠습니까?'"+")\">";
				} else{
				insertScrollTbody += " <input type=\"checkbox\" id=\"checkWithdraw\" disabled checked=\"checked\">";
				}
			} else if(varTheadArray[i] === "선정산 서비스"){
				if(getTableData.DIVISION == '00'){
				insertScrollTbody += '단비';
				} else {
				insertScrollTbody += getTableData.DIVISION ;
				}
			}
			
			// 컬럼 태그
			if(i === 0){
				insertScrollTbody += "</div></th>";
			} else{
				insertScrollTbody += "</div></td>";
			}
		}
		insertScrollTbody += "</tr>";
	}
	insertTable += insertScrollTbody;
	insertTable += '</tbody></table></div></div></div>';
	$("#fixTable").html(insertTable);
	
	// 집계 초기화
	let sumData = 0;
	let cubiciAmount = 0;
	let moneyAmount = 0;
	let req_cubiciAmount = 0;
	let req_moneyAmount = 0;
	
	for(let i=0; i<data.userSumList.length; i++){
		if(data.userSumList[i].FLAG == "CUBICI")
			cubiciAmount = data.userSumList[i].CNT;
		else if(data.userSumList[i].FLAG == "MONEYBANK")
			moneyAmount = data.userSumList[i].CNT;
	}
	
	for(let i=0; i<data.userAppSumList.length; i++){
		if(data.userAppSumList[i].FLAG == "CUBICI")
			req_cubiciAmount = data.userAppSumList[i].CNT;
		else if(data.userAppSumList[i].FLAG == "MONEYBANK")
			req_moneyAmount = data.userAppSumList[i].CNT;
	}
	
	sumData = cubiciAmount + moneyAmount;
	
	// 총 합계
	let insertTableSum = '<div class="fixBottom"><ul class="tableTotal"><li><span class="txt">해지&nbsp&nbsp|&nbsp&nbsp</span>';
	insertTableSum += '<span class="result"> 큐빅아이 : '+cubiciAmount+' 명&nbsp&nbsp머니뱅크 : '+moneyAmount+'&nbsp명</span></li>';
	insertTableSum += '<li><span class="txt">해지 신청&nbsp&nbsp|&nbsp&nbsp</span>';
	insertTableSum += '<span class="result"> 큐빅아이 : '+req_cubiciAmount+' 명&nbsp&nbsp머니뱅크 : '+req_moneyAmount+'&nbsp명</span></li>';
	$("#fixTable").append(insertTableSum); 
	
	// 페이징
	let pageMaxCnt = sumData / varSelectLimit ;
	let currentPage = data.currentPage - 1;
	let pageCnt = Math.floor(currentPage / 10);
	
	// 페이징 버튼
	let pageHtml = "<ul>";
	
	if(pageMaxCnt <10){
		for(let i =1; i <= Math.ceil(pageMaxCnt); i++){
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='userWithdrawFunc(";
			pageHtml += i + ', undefined' + ',"' + varUserName   + '","' + varCompanyName  + '","' + varUserId  + '","' + varPartnerFirm  + '","' + varFromDate  + '","' + varToDate  + '","' + varSelectOrderBy  + '","' + varSelectDivision  +'");' + "'>" + i + "</a><li>";
		}
	} else if (pageMaxCnt >=10){
		if(pageCnt > 0){ // 이전
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='userWithdrawFunc(" + ((pageCnt)*10);
			pageHtml += ', "previous"' + ',"' + varUserName  + '","' + varCompanyName + '","' + varUserId  + '","' + varPartnerFirm  + '","' + varFromDate  + '","' + varToDate  + '","' + varSelectOrderBy  + '","' + varSelectDivision  +'");' + "'></a></li>"; 
		}
		for(let i=(pageCnt * 10) + 1; i<= (pageCnt*10)+10; i++){ // 1~ 10
			if(i>Math.ceil(pageMaxCnt)){
				break;
			}
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='userWithdrawFunc(";
			pageHtml += i + ', undefined' + ',"' + varUserName   + '","' + varCompanyName  + '","' + varUserId  + '","' + varPartnerFirm  + '","' + varFromDate  + '","' + varToDate  + '","' + varSelectOrderBy  + '","' + varSelectDivision  +'");' + "'>" + i + "</a><li>";
		}
		if(Math.floor(pageMaxCnt)>(pageCnt*10)+10){ // 다음
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='userWithdrawFunc(" + ((pageCnt+1)*10+1);
			pageHtml += ', "next"' + ',"' + varUserName  + '","' + varCompanyName + '","' + varUserId  + '","' + varPartnerFirm  + '","' + varFromDate  + '","' + varToDate  + '","' + varSelectOrderBy  + '","' + varSelectDivision  +'");' + "'></a></li>"; 
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
// 해지 모달
function modalInfoCancel(userNo,text){

	let modalButton=""; // 모달 버튼 띄우기
	
	modalButton += '<li style="display:none"><a id="modalOpenButton" href="javascript:;" class="modalOpen sBtn rBtn sColorN" data-modal="modal-info-cancel"></a></li>';
    
    // body 뒷 부분에 html 태그 삽입
	$('body').append(modalButton);
	
	// 클릭이벤트 재설정
	$('.modalOpen').on('click', modalOpen);
	
	// 모달창에 text 삽입
	$('#CommonModal2').text(text);
	
	$('#modalOpenButton').trigger('click', modalOpen); // 클릭 이벤트 강제 실행
    $('#modalOpenButton').parent().remove(); // 이벤트 마지막 버튼 삭제 
    
    $(document).on('click',"#confirm",function(){
		updateWithdraw(userNo);
	});
    
}

function updateWithdraw(userNo){

	let callUrl = "/admin/cubici/manageMember/member_tab3/updWithdraw";
	let callBackFunc = "updWithdrawFuncResponse";
	let objParam = {
			USER_NO : userNo
 	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
};

function updWithdrawFuncResponse(data){
	if(data.resultCode === 0){
		window.location.href = '/admin/cubici/manageMember/member_tab3';
	} else{
		alert("error :: " + data.resultCode);
	}
}
 // 회원정보 모달
function selectOrderDetails(userNo){
			

	let selectDivision = $("#serviceDivision option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	
	let url = "/admin/cubici/manageMember/member_tab4?FLAG=orderDetail&USER_NO="+userNo+"&SELECT_DIVISION="+selectDivision+"&fromDate="+fromDate+"&toDate="+toDate;
	
	window.location.href = url;
	
	/*
	let callUrl = "/admin/cubici/manageMember/member_tab2/detailUserNo";
	let callBackFunc = "detailUserNoFuncResponse";
	let objParam = {
		FLAG: "orderDetail",
		USER_NO : userNo,
		SELECT_DIVISION : selectDivision,
		fromDate : fromDate,
		toDate : toDate,
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	*/
}
// 해지 상세 모달
function detailUserNoFuncResponse(data){
	
	// 기본 정보
	let USER_NM = "<p>"+data.userDetailList[0].USER_NM+"</p>";
	let USER_ID = "<p>"+data.userDetailList[0].USER_ID+"</p>";
	let REG_DATE = "<p>"+formatDate(data.userDetailList[0].REG_DATE)+"</p>";
	let FIRM_NM = "<p>"+data.userDetailList[0].FIRM_NM+"</p>";
	let FIRM_ID = "<p>"+data.userDetailList[0].FIRM_ID+"</p>";
	let REPRESENTATIVE = "<p>"+data.userDetailList[0].USER_NM+"</p>";
	let SECTOR = "<p>"+data.userDetailList[0].SECTORS+"</p>";
	let FIRM_SETUP_DATE = "<p>"+data.userDetailList[0].FIRM_SETUP_DATE+"</p>";
	let USER_PHONE = "<p>"+data.userDetailList[0].USER_PHONE+"</p>";
	let USER_EMAIL = "<p>"+data.userDetailList[0].USER_ID+"</p>";
	let FIRM_TEL = "<p>"+data.userDetailList[0].FIRM_TEL+"</p>";
	let FIRM_FAX = "<p>"+data.userDetailList[0].FIRM_FAX+"</p>";
	let ZIP_CODE_VALUE  = "<p>"+data.userDetailList[0].FIRM_ZIP_CODE+"</p>";
	let ADDR_VALUE   = "<p>"+data.userDetailList[0].FIRM_ADDR+"</p>";
	let BIZ_TYPE   = "<p>"+data.userDetailList[0].BIZ_TYPE+"</p>";
	
	$("#USER_NM").empty().html(USER_NM);
	$("#USER_ID").empty().html(USER_ID);
	$("#REG_DATE").empty().html(REG_DATE);
	$("#FIRM_NM").empty().html(FIRM_NM);
	$("#FIRM_ID").empty().html(FIRM_ID);
	$("#REPRESENTATIVE").empty().html(REPRESENTATIVE);
	$("#SECTOR").empty().html(SECTOR);
	$("#FIRM_SETUP_DATE").empty().html(FIRM_SETUP_DATE);
	$("#USER_PHONE").empty().html(USER_PHONE);
	$("#USER_EMAIL").empty().html(USER_EMAIL);
	$("#FIRM_TEL").empty().html(FIRM_TEL);
	$("#FIRM_FAX").empty().html(FIRM_FAX);
	$("#ZIP_CODE_VALUE").empty().html(ZIP_CODE_VALUE);
	$("#ADDR_VALUE").empty().html(ADDR_VALUE);
	$("#BIZ_TYPE").empty().html(BIZ_TYPE);
	
	// 운영 쇼핑몰 선정산 대상
	let shop_html = "";
	let shop_en ="";
	
	for(let i=0; i<data.shopList.length; i++){
		if(data.shopList[i].SHOP_NAME == "인터파크")
			shop_en = "interpark";
		else if(data.shopList[i].SHOP_NAME == "쿠팡")
			shop_en = "coupang";
		else if(data.shopList[i].SHOP_NAME == "네이버")
			shop_en = "naver";
		else if(data.shopList[i].SHOP_NAME == "지마켓")
			shop_en = "gmarket";
		else if(data.shopList[i].SHOP_NAME == "옥션")
			shop_en = "auction";
		else if(data.shopList[i].SHOP_NAME == "11번가")
			shop_en = "11st";
		
		shop_html += "<div class='labelBox'><label class='checkBox'><input type='checkbox'><span><img src='/resources/rudicks/img/partner-color/partner-sq-"+shop_en+".jpg' alt='"+data.shopList[i].SHOP_NAME+"'>"+data.shopList[i].SHOP_NAME+"</span></label></div>"
	}
	
	$("#shoppingMall").empty().html(shop_html);
	
	// 기본정보 끝

	// 머니뱅크
	// 날짜 NULL 처리
	let DEPOSIT_DATE = "-";
	let EXPIRATION_DATE = "-";
	
	if(data.moneybankList.length !== 0){
	
	if(data.moneybankList[0].DEPOSIT_DATE !== "-")
		DEPOSIT_DATE = formatDate(data.moneybankList[0].DEPOSIT_DATE);
	
	if(data.moneybankList[0].EXPIRATION_DATE !== "-")
		EXPIRATION_DATE = formatDate(data.moneybankList[0].EXPIRATION_DATE);
	
	let REQUEST_DATE   = "<p>"+formatDate(data.moneybankList[0].MONEYBANK_REQUEST_DATE)+"</p>";
	let FIRST_APPROVAL_DATE   = "<p>"+formatDate(data.moneybankList[0].FIRST_APPROVAL_DATE)+"</p>";
	let APPROVAL_DATE   = "<p>"+formatDate(data.moneybankList[0].APPROVAL_DATE)+"</p>";
	
	$("#REQUEST_DATE").empty().html(REQUEST_DATE);
	$("#FIRST_APPROVAL_DATE").empty().html(FIRST_APPROVAL_DATE);
	$("#REQUESTING_DATE").empty().html(REQUEST_DATE);
	$("#EXPIRATION_DATE").empty().html(EXPIRATION_DATE);
	$("#APPROVAL_DATE").empty().html(APPROVAL_DATE);
	
	$("#useCount").empty().html(data.moneybankList.length);
	
	$("#prizm_detail_grade").empty().html(data.moneybankList[0].PRIZM_GRADE);
	
	let modal_moneybank_table_html = "";
	for(let i=0; i<data.moneybankList.length; i++){
		modal_moneybank_table_html += "<tr><td><div class='tIn'>"+DEPOSIT_DATE+"</div></td><td><div class='tIn'>"+data.moneybankList[0].DIVISION+"</div></td>  <td><div class='tIn'>"+ comma(data.moneybankList[0].TOTAL_PAYMENT)+"</div></td><td><div class='tIn'>"+EXPIRATION_DATE+"</div></td><td><div class='tIn'>"+data.moneybankList[0].USAGE_PERIOD+"일</div></td> <td><div class='tIn'>"+data.moneybankList[0].DAILY_USAGE_FEE+"%</div></td> <td><div class='tIn'>"+data.moneybankList[0].PRIZM_GRADE+"</div></td> <td><div class='tIn'><a href='javascript:;'class='sBtn sColorLS rBtn'>해제</a></div></td> </tr>"
		} 
	
	$("#useHistory").empty().html(modal_moneybank_table_html);
	
	}
	
	modalOpen("member_detail");
	
}
</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/manageMember/member_tab1">회원 종합</a></li>
        <li><a href="/admin/cubici/manageMember/member_tab2">회원 정보</a></li>
        <li class="active"><a href="/admin/cubici/manageMember/member_tab3">휴면/해지</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
    </div>
</div>

<%-- <div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">회원명</span>
                <div class="input">
                    <input type="text" id="userName" placeholder="회원명">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회사명</span>
                <div class="input">
                    <input type="text" id="companyName" placeholder="회사명">
                </div>
            </div>
        </li>
        <!-- <li>
            <div class="fwBox">
                <span class="ft">해지시작</span>
                <div class="input">
                    <input type="text" class="startDatepicker" id="fromDate" placeholder="시작기간">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">해지종료</span>
                <div class="input">
                    <input type="text" class="endDatepicker" id="toDate" placeholder="종료기간">
                </div>
            </div>
        </li> -->
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">회원ID</span>
                <div class="input">
                    <input type="text" id="userId" placeholder="회원ID">
                </div>
            </div>
        </li>
        <li>
           <div class="fwBox">
               <span class="ft">협력사</span>
                 <div class="input">
                    <select id = "partnerFirm" class="form-control">
                        <option value="all">전체</option>
                        <c:forEach var = "list" items ="${partnerFirm}">
                        	<option value="${list}">${list}</option>
                       	</c:forEach>
                    </select>
                </div>
            </div>
        </li>
       <li>
            <div class="fwBox">
                <span class="ft">서비스 구분</span>
                 <div class="input">
                    <select id = "serviceDivision" class="form-control">
                        <option value = 'all'>전체</option>
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
</div>
 --%>
<div class="m-search">
	<ul>
		<li>
			<div class="fwBox">
				<span class="ft">회원명</span>
				<div class="input">
					<input type="text" id="userName" placeholder="회원명">
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">회사명</span>
				<div class="input">
					<input type="text" id="companyName" placeholder="회사명">
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft-w">휴면/해지 일</span>
				<div class="input">
					<input type="text" class="startDatepicker" id="fromDate" placeholder="시작기간">
				</div>
				~
				<div class="input">
					<input type="text" class="endDatepicker" id="toDate" placeholder="종료기간">
				</div>
			</div>
		</li>
	</ul>
	<ul>
		<li>
			<div class="fwBox">
				<span class="ft">회원ID</span>
				<div class="input">
					<input type="text" id="userId" placeholder="회원ID">
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">협력사</span>
				<div class="input">
					<select id = "partnerFirm" class="form-control">
                        <option value="all">전체</option>
                        <c:forEach var = "list" items ="${partnerFirm}">
                        	<option value="${list}">${list}</option>
                       	</c:forEach>
                    </select>
				</div>
			</div>

		</li>
		<li class="fw">
			<div class="fwBox col-1">
				<span class="ft">구분</span>
				<div class="input">
					<select id = "serviceDivision" class="form-control">
                        <option value = 'all'>전체</option>
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
</div>

<div class="tableSet">
    <div class="m-options">
        <div class="pRight">
            <div class="fwBox">
                <span class="ft">보기설정</span>
                <div class="input">
                    <select id ="tableOrderBy">
                        <option value="REGDATE">가입일자</option>
                        <option value="USER_NM">회원명</option>
                        <option value="FIRM_NM">회사명</option>
                        <option value="SHOP_COUNT">운영몰 수</option>
                    </select>
                </div>
            </div>
            <span class="btns">
                <a href="javascript:;" class="sBtn sColorLG excel">엑셀 다운로드</a>
            </span>
            <div class="m-filter">
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorN setting openFilter">선택옵션</a>
                </div>
                 <ul class="selectList">
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>해지신청</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>해지서비스</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>해지일자</span>
                        </label>
                    </li>
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
                            <input type="checkbox" id="productNM" class="columnCheck" checked>
                            <span>대표자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productNM" class="columnCheck" checked>
                            <span>핸드폰</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productNM" class="columnCheck" checked>
                            <span>운영 쇼핑몰</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productNM" class="columnCheck" checked>
                            <span>선정산 서비스</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productNM" class="columnCheck" checked>
                            <span>선정산 잔액</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" id="productNM" class="columnCheck" checked>
                            <span>해지 확인</span>
                        </label>
                    </li>
                    <li class="btns">
                        <button class="sBtn sColorLB wBtn" onclick="tableSearch();">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable">
    </div>
    <div class="m-paging" id="pagingButton">
    </div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>

<!------ 회원정보 MODAL ------>
<div class="modal-container" id="member_detail" style="display: none;">
    <div class="modal-wrapper">
        <header>
            <h2>회원정보</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner mArticleArea tabArea">
                <article class="m-modalGrid">
                    <header>
                        <h3>기본 정보</h3>
                        <span class="btns">
                            <a href="javascript:;" class="sBtn sColorLG" disabled>수정</a>
                            <a href="javascript:;" class="sBtn sColorLB" disabled>확인</a>
                        </span>
                    </header>
                    <div class="contentsArea">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이름</span>
                                    <div class="input" placeholder="이름" id="USER_NM">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">회원ID</span>
                                     <div class="input" placeholder="회원ID" id="USER_ID">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">최초가입</span>
                                     <div class="input" placeholder="최초가입" id="REG_DATE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">상호</span>
                                        <div class="input" placeholder="상호" id="FIRM_NM">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">사업자번호</span>
                                        <div class="input" placeholder="사업자번호" id="FIRM_ID">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">대표자</span>
                                        <div class="input" placeholder="대표자" id="REPRESENTATIVE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">사업구분</span>
                                        <div class="input" placeholder="사업구분" ID="BIZ_TYPE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">취급상품</span>
                                        <div class="input" placeholder="취급상품" ID="SECTOR">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">설립연도</span>
                                        <div class="input" placeholder="설립연도" ID="FIRM_SETUP_DATE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">연락처</span>
                                        <div class="input" placeholder="연락처" ID="USER_PHONE">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">이메일</span>
                                        <div class="input" placeholder="이메일" ID="USER_EMAIL">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">전화</span>
                                        <div class="input" placeholder="전화" ID="FIRM_TEL">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">팩스</span>
                                        <div class="input" placeholder="팩스" ID="FIRM_FAX">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">본사 주소</span>
                                        <div class="input" placeholder="우편번호 검색" ID="ZIP_CODE_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li class="col-2">
                                <div class="fwBox">
                                        <div class="input" placeholder="상세주소" ID ="ADDR_VALUE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">창고 주소</span>
                                        <div class="input" placeholder="우편번호 검색" ID="STORAGE_ZIP_CODE_VALUE">
                                    </div>
                                </div>
                            </li>
                            <li class="col-2">
                                <div class="fwBox">
                                        <div class="input" placeholder="상세주소" ID="STORAGE_ADDR_VALUE">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <article class="m-tab">
                    <ul>
                        <li class="active"><h2><a href="javascript:;">기본정보</a></h2></li>
                        <li><h2><a href="javascript:;">머니뱅크</a></h2></li>
                        <li><h2><a href="javascript:;">추가서류</a></h2></li>
                    </ul>
                </article>
                <div class="m-tabBox active">
                    <article class="m-modalGrid">
                        <header>
                            <div class="m-options">
                                <h3>사업정보</h3>
                                <div class="pRight">
                                    <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
                                </div>
                            </div>
                        </header>
                        <div class="contentsArea">
                            <ul class="item">
                                <li class="col-1">
                                    <div class="fwBox autoHeight">
                                        <div class="ft">
                                            <p>
                                                <b>운영 쇼핑몰</b><br>
                                                선정산 대상
                                            </p>
                                        </div>
                                        <div class="input">
                                            <div class="checkArea" id="shoppingMall">
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <ul class="item">
                                <li>
                                    <div class="fwBox">
                                        <span class="ft">월 매출<i>(백만)</i></span>
                                        <div class="input">
                                            <input type="text" placeholder="금액">
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="fwBox">
                                        <span class="ft">월 정산액<i>(백만)</i></span>
                                        <div class="input">
                                            <input type="text" placeholder="금액">
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="fwBox">
                                        <span class="ft">등록 SKU 수</span>
                                        <div class="input">
                                            <input type="text" placeholder="금액">
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <ul class="item">
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">등록계좌</span>
                                        <div class="input">
                                            <input type="text" placeholder="은행">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-2">
                                    <div class="fwBox">
                                        <div class="input">
                                            <input type="text" placeholder="계좌번호">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <div class="fwBox">
                                        <span class="ft">상한 계좌</span>
                                        <div class="input">
                                            <input type="text" placeholder="은행">
                                        </div>
                                    </div>
                                </li>
                                <li class="col-2">
                                    <div class="fwBox">
                                        <div class="input">
                                            <input type="text" placeholder="계좌번호">
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <header>
                            <h3>회원평가</h3>
                            <span class="btns ">
                                <a href="javascript:;" class="sBtn sColorLG">작성</a>
                                <a href="javascript:;" class="sBtn sColorLG">수정</a>
                                <a href="javascript:;" class="sBtn sColorLB">확인</a>
                            </span>
                        </header>
                        <div class="contentsArea">
                            <div class="fwBox textarea">
                                <div class="input">
                                    <textarea placeholder="회원평가를 작성하여주세요"></textarea>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
                <div class="m-tabBox">
                    <article class="m-modalGrid">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">머니뱅크 회원가입</span>
                                    <div class="input">
                                        <span id="REQUEST_DATE">-</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">최초 계약일자</span>
                                    <div class="input">
                                        <span id="FIRST_APPROVAL_DATE"></span>
                                    </div>
                                </div>
                            </li>
                            <li class="m-options">
                                <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
                            </li>
                        </ul>
                    </article>
                    <article class="m-modalGrid">
                        <div class="mini-header">진행 상태</div>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">신청</span>
                                    <div class="input">
                                        <span id="REQUESTING_DATE">-</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">신청완료</span>
                                    <div class="input">
                                        <span id="">-</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">심사</span>
                                    <div class="input">
                                        <span>-</span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">승인</span>
                                    <div class="input">
                                        <span id="APPROVAL_DATE">-</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">상환</span>
                                    <div class="input">
                                        <span id ="EXPIRATION_DATE">-</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="fwBox">
                                    <span class="ft">거부</span>
                                    <div class="input">
                                        <span>-</span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </article>
                    <article class="m-modalGrid">
                        <div class="mini-header">프리즘 상세정보</div>
                        <div class="contentsArea">
                            <div class="item-col">
                                <div class="col-1 colorBox">
                                    <span class="bold"><b id="prizm_detail_grade">-</b>등급</span>
                                </div>
                                <div class="col-5">
                                    <ul class="item">
                                        <li>
                                            <div class="fwBox">
                                                <span class="ft">종합</span>
                                                <div class="input">
                                                    <span class="tColorLB">60/100</span>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="fwBox">
                                                <span class="ft">기업</span>
                                                <div class="input">
                                                    <span>60/100</span>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="fwBox">
                                                <span class="ft">매출</span>
                                                <div class="input">
                                                    <span class="tColorR">60/100</span>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                    <ul class="item">
                                        <li>
                                            <div class="fwBox">
                                                <span class="ft">정산</span>
                                                <div class="input">
                                                    <span class="tColorLB">60/100</span>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="fwBox">
                                                <span class="ft">고객</span>
                                                <div class="input">
                                                    <span class="tColorLB">60/100</span>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="fwBox">
                                                <span class="ft">운영</span>
                                                <div class="input">
                                                    <span class="tColorR">60/100</span>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <div class="mini-header">제출 서류</div>
                        <ul class="item">
                            <li class="col-5">
                                <div class="fwBox">
                                    <div class="input labelList">
                                        <label class="checkBox">
                                            <input type="checkbox">
                                            <span>신분증</span>
                                        </label>
                                        <label class="checkBox">
                                            <input type="checkbox">
                                            <span>금융거래확인서</span>
                                        </label>
                                        <label class="checkBox">
                                            <input type="checkbox">
                                            <span>사업자등록증</span>
                                        </label>
                                        <label class="checkBox">
                                            <input type="checkbox">
                                            <span>기타 1</span>
                                        </label>
                                    </div>
                                </div>
                            </li>
                            <li class="col-1">
                                <a href="javascript:;" class="sBtn sColorLB wBtn modalOpen" data-modal="ac2p1-3-file">파일 업로드</a>
                            </li>
                        </ul>
                    </article>
                    <article class="m-modalGrid">
                        <div class="mini-header">이용 이력 : <b id="useCount"></b> 건</div>
                        <div class="maxHeight long">
                            <table class="m-shadowTable">
                                <thead>
                                    <tr>
                                        <th>일자</th>
                                        <th>이용 서비스</th>
                                        <th>이용총액</th>
                                        <th>상환완료</th>
                                        <th>서비스 기간</th>
                                        <th>수수료 %</th>
                                        <th>Prism 등급</th>
                                        <th>평가</th>
                                    </tr>
                                </thead>
                                <tbody id="useHistory">
                                </tbody>
                            </table>
                        </div>
                    </article>
                </div>
                <div class="m-tabBox">
                    <article class="m-modalGrid">
                        <header>
                            <div class="m-options">
                                <h3>공통 서류</h3>
                                <div class="pRight">
                                    <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
                                </div>
                            </div>
                        </header>
                        <div class="contentsArea">
                            <ul class="item">
                                <li class="col-4">
                                    <div class="fwBox">
                                        <span class="ft">담당자</span>
                                        <div class="input">
                                            <select>
                                                <option value="">선택</option>
                                            </select>
                                        </div>
                                    </div>
                                </li>
                                <li class="col-1">
                                    <a href="javascript:;" class="sBtn sColorLB wBtn">확인</a>
                                </li>
                                <li class="col-5"></li>
                            </ul>
                            <div class="item-noPading">
                                <ul class="item">
                                    <li class="col-8">
                                        <div class="fwBox">
                                            <span class="ft">개인사업자</span>
                                            <div class="input labelList">
                                                <label class="checkBox">
                                                    <input type="checkbox">
                                                    <span>대표 인감증명 원본</span>
                                                </label>
                                                <label class="checkBox">
                                                    <input type="checkbox">
                                                    <span>대표 주민등록등본 원본</span>
                                                </label>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="btns">
                                        <a href="javascript:;" class="iBtn sBtn sColorLG wBtn upload">업로드</a>
                                    </li>
                                    <li class="btns">
                                        <a href="javascript:;" class="iBtn sBtn sColorN wBtn download">다운로드</a>
                                    </li>
                                </ul>
                                <ul class="item">
                                    <li class="col-8">
                                        <div class="fwBox">
                                            <span class="ft">법인</span>
                                            <div class="input labelList">
                                                <label class="checkBox">
                                                    <input type="checkbox">
                                                    <span>법인 인감증명 원본</span>
                                                </label>
                                                <label class="checkBox">
                                                    <input type="checkbox">
                                                    <span>법인 등기부등록 원본</span>
                                                </label>
                                                <label class="checkBox">
                                                    <input type="checkbox">
                                                    <span>이사회 회의록</span>
                                                </label>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="btns">
                                        <a href="javascript:;" class="iBtn sBtn sColorLG wBtn upload">업로드</a>
                                    </li>
                                    <li class="btns">
                                        <a href="javascript:;" class="iBtn sBtn sColorN wBtn download">다운로드</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <header>
                            <h3>증빙 서류</h3>
                        </header>
                        <div class="item-noPading">
                            <ul class="item">
                                <li class="col-8">
                                    <div class="fwBox">
                                        <div class="pfList">
                                            <dl>
                                                <dt>국세완납증명서(원본)</dt>
                                                <dd><i class="oiBtn pass"></i></dd>
                                            </dl>
                                            <dl>
                                                <dt>지방세 완납(원본)</dt>
                                                <dd><i class="oiBtn fail"></i></dd>
                                            </dl>
                                            <dl>
                                                <dt>개인정보조회동의</dt>
                                                <dd><i class="oiBtn fail"></i></dd>
                                            </dl>
                                        </div>
                                    </div>
                                </li>
                                <li class="col-2 btns">
                                    <a href="javascript:;" class="iBtn sBtn sColorLG wBtn upload">파일 업로드</a>
                                </li>
                            </ul>
                            <ul class="item">
                                <li class="col-8">
                                    <div class="fwBox">
                                        <div class="pfList">
                                            <dl>
                                                <dt>주거래 통장(송금용)</dt>
                                                <dd><i class="oiBtn pass"></i></dd>
                                            </dl>
                                            <dl>
                                                <dt>농협 요구불 통장</dt>
                                                <dd><i class="oiBtn fail"></i></dd>
                                            </dl>
                                            <dl>
                                                <dt>공란보충용 위임장</dt>
                                                <dd><i class="oiBtn fail"></i></dd>
                                            </dl>
                                        </div>
                                    </div>
                                </li>
                                <li class="col-2 btns">
                                    <a href="javascript:;" class="iBtn sBtn sColorN wBtn download">파일 다운로드</a>
                                </li>
                            </ul>
                        </div>
                    </article>
                    <article class="m-modalGrid">
                        <header>
                            <h3>쇼핑몰 양도 서류</h3>
                        </header>
                        <div class="maxHeight long">
                            <table class="m-shadowTable">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>등록 쇼핑몰</th>
                                        <th>채권양도양수 계약서</th>
                                        <th>판매대금 지급보류 신청서</th>
                                        <th>채권양도 통지서</th>
                                        <th>채권양도 통지 위임장</th>
                                        <th>서류 업로드</th>
                                        <th>다운로드</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><div class="tIn">1</div></td>
                                        <td><div class="tIn">지마켓</div></td>
                                        <td><div class="tIn"><i class="oiBtn pass"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn pass"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn pass"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn fail"></i></div></td>
                                        <td><div class="tIn"><a href="javascript:;" class="oiBtn upload">업로드</a></div></td>
                                        <td><div class="tIn"><a href="javascript:;" class="oiBtn download">다운로드</a></div></td>
                                    </tr>
                                    <tr>
                                        <td><div class="tIn">1</div></td>
                                        <td><div class="tIn">지마켓</div></td>
                                        <td><div class="tIn"><i class="oiBtn pass"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn fail"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn fail"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn fail"></i></div></td>
                                        <td><div class="tIn"><a href="javascript:;" class="oiBtn upload">업로드</a></div></td>
                                        <td><div class="tIn"><a href="javascript:;" class="oiBtn download">다운로드</a></div></td>
                                    </tr>
                                    <tr>
                                        <td><div class="tIn">1</div></td>
                                        <td><div class="tIn">지마켓</div></td>
                                        <td><div class="tIn"><i class="oiBtn pass"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn pass"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn fail"></i></div></td>
                                        <td><div class="tIn"><i class="oiBtn fail"></i></div></td>
                                        <td><div class="tIn"><a href="javascript:;" class="oiBtn upload">업로드</a></div></td>
                                        <td><div class="tIn"><a href="javascript:;" class="oiBtn download">다운로드</a></div></td>
                                    </tr>
                                </tbody>
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

<!-- 모달 -->
<div class="modal-container alert-pass" id="modal-info-cancel">
	<div class="modal-wrapper">
		<header><h2>서비스 안내</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="alert-content">
			<div class="alert-txt">
				<div id="CommonModal2" class="txtBox" style="text-align: center; padding:0">
				</div>
			</div>
				<div class="btnArea">
				<a href="javascript:;" class="modalClose sBtn sColorLS2" id="confirm">확인</a>
				<a href="javascript:;" class="modalClose sBtn sColorR" id="cancel">취소</a>
			</div>
		</div>
	</div>
</div>
