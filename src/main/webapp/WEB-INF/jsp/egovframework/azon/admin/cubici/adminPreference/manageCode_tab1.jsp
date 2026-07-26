<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>

// 페이징을 위한 전역변수
var pagingMaxNo = 0; // 페이징 번호 1, 11, 21, 31, ... -> 페이징 버튼 생성에 사용
var nowPageNo = 0; // 현재 페이징 번호 -> 페이징 버튼 활성화에 사용

//기존 검색조건 유지하기 위한 전역변수
var varFirmNm = ""; // 회사명
var varLinkedNm = ""; // 연계명
var varTaskManager= ""; // 담당자
var varSelectOrderBy = ""; // ORDER BY 설정

$(document).ready(function(){
	
	tableSearch();
	
	$(document).on('click', "#searchBtn",function(){
		tableSearch();
	});
	
});
// 검색
function tableSearch(){
	
	let FirmNm = $("#FIRM_NM option:selected").val();
	varFirmNm = FirmNm;
	
	let LinkedNm = $("#LINKED_NM").val();
	varLinkedNm = LinkedNm;
	
	let TaskManager = $("#TASK_MANAGER").val();
	varTaskManager = TaskManager;
	
	let SelectOrderBy = $("#ORDER_BY option:selected").val();
	varSelectOrderBy = SelectOrderBy;
	
	linkedCodeFunc(1,undefined, FirmNm, LinkedNm, TaskManager, SelectOrderBy)
	
}

function linkedCodeFunc(pageNo, pageFlag, FirmNm, LinkedNm, TaskManager, SelectOrderBy){
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	// LIMIT
	let tempNo = 10*(pageNo-1);
	let limitStr = tempNo + "," + 10;
	// 전역변수에 현재 몇페이지인지 저장
	nowPageNo = pageNo;
	// 전역변수에 새로운 페이징 번호 저장 11, 21, 31
	if(pageFlag !== undefined && (pageFlag === "next" || pageFlag === "previous")){
		pagingMaxNo = pageNo;
	}
	
	let callUrl = "/admin/cubici/adminPreference/manageCode_tab1_Select";
	let callBackFunc = "linkedCodeSelectResponse";
	let objParam = {
			LIMIT : limitStr, // LIMIT
			ORDER_BY : SelectOrderBy, // ORDER_BY
			FIRM_NM : FirmNm, // 회사명
			LINKED_NM : "%" + LinkedNm + "%", // 연계명
			TASK_MANAGER : "%" + TaskManager + "%", // 담당자
			NOWPAGENO : nowPageNo // 현페이지
 	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function linkedCodeSelectResponse(data){
	// 연계코드 관리 - 연계코드 (tab1) data
	let getData = data.linkedCodeMap;
	
	if(getData.length === 0){
		$("#fixTable").empty().html("조회된 데이터가 없습니다.");
		$("#pagingButton").empty();
		//로딩바 해제
		$(".loadingSpinner").css({"display" : "none"}); 
		return false;
	}
	
	let maxRowNo = getData.length; // 불러온 데이터중 가장 마지막 번호
	
	// 테이블 다시 그리기
	let insertTable = '<div class="fixTable">';
	insertTable += '<div class="maxHeight row10">';
	insertTable += '<table class="m-shadowTable btnShort">';
	insertTable += '<thead><tr><th>상태</th><th>회사명</th><th>연계명</th><th>연계인증 번호</th><th>추천기관 번호</th><th>등록일</th><th>담당자</th><th>전화</th><th>상세보기</th></tr></thead>';
	insertTable += '<tbody id="fixTbody">';
	
	for(let i=0; i<getData.length; i++){
		let getTableData = getData[i];
		
		let btnColor = "";
		
		if(getTableData.LINKED_STATUS === "운영"){
			btnColor = "sColorGN";
		} else if(getTableData.LINKED_STATUS === "완료"){
			btnColor = "sColorG";
		} else if(getTableData.LINKED_STATUS === "중지"){
			btnColor = "sColorY";
		}
		
		insertTable += "<tr>";
		insertTable += "<td><div class='tIn'><span class='sBtn "+btnColor+" rBtn'> "+getTableData.LINKED_STATUS+" </span><div></td>";
		insertTable += "<td><div class='tIn'>"+ getTableData.FIRM_NM +"</div></td>";
		insertTable += "<td><div class='tIn'>"+ getTableData.LINKED_NM +"</div></td>";
		insertTable += "<td><div class='tIn'>"+ getTableData.LINKED_CODE +"</div></td>";
		insertTable += "<td><div class='tIn'>"+ getTableData.RECOMMENDED_CODE +"</div></td>";
		insertTable += "<td><div class='tIn'>"+ getTableData.REGI_DATE +"</div></td>";
		insertTable += "<td><div class='tIn'>"+ getTableData.TASK_MANAGER +"</div></td>";
		insertTable += "<td><div class='tIn'>"+ getTableData.TASK_MANAGER_TEL +"</div></td>";
		insertTable += "<td><div class='tIn'><span class='sBtn sColorN rBtn' onclick='gotoTab2("+getTableData.LINKED_NO+")'> 보기 </span><div></td>";
		insertTable += "</tr>";
	}
	insertTable += '</tbody></table></div>';
	$("#fixTable").html(insertTable);

	// 총 건수
	let insertTableSum = '<div class="fixBottom"><ul class="tableTotal"><li><span class="txt">전체</span>';
	insertTableSum += '<span class="result"> '+ data.sumCount[0].CNT +' 건</span></li></ul></div>';
	$("#fixTable").append(insertTableSum);

	// 페이징
	let pageMaxCnt = data.sumCount[0].CNT / 10 ;
	let currentPage = data.currentPage - 1;
	let pageCnt = Math.floor(currentPage / 10);
	
	// 페이징 버튼
	let pageHtml = "<ul>";
	
	if(pageMaxCnt <10){
		for(let i =1; i <= Math.ceil(pageMaxCnt); i++){
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='linkedCodeFunc(";
			pageHtml += i + ', undefined' + ',"' + varFirmNm   + '","' + varLinkedNm  + '","' + varTaskManager  + '","' + varSelectOrderBy  + '");' + "'>" + i + "</a><li>";
		}
	} else if (pageMaxCnt >=10){
		if(pageCnt > 0){ // 이전
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:;' onclick='linkedCodeFunc(" + ((pageCnt)*10);
			pageHtml += ', "previous"' + ',"' + varFirmNm   + '","' + varLinkedNm  + '","' + varTaskManager  + '","' + varSelectOrderBy   + '");' + "'></a></li>"; 
		}
		for(let i=(pageCnt * 10) + 1; i<= (pageCnt*10)+10; i++){ // 1~ 10
			if(i>Math.ceil(pageMaxCnt)){
				break;
			}
			pageHtml += "<li><a class='num' href ='javascript:;' onclick='linkedCodeFunc(";
			pageHtml += i + ', undefined' + ',"' + varFirmNm   + '","' + varLinkedNm  + '","' + varTaskManager  + '","' + varSelectOrderBy  + '");' + "'>" + i + "</a><li>";
		}
		if(Math.floor(pageMaxCnt)>(pageCnt*10)+10){ // 다음
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:;' onclick='linkedCodeFunc(" + ((pageCnt+1)*10+1);
			pageHtml += ', "next"' + ',"' + varFirmNm   + '","' + varLinkedNm  + '","' + varTaskManager  + '","' + varSelectOrderBy  + '");' + "'></a></li>"; 
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
function gotoTab2(data){

	let callUrl = "/admin/cubici/adminPreference/manageCode_tab1_gotoTab2";
	let callBackFunc = "gotoTab2response";
	let objParam = {
			LINKED_NO : data
 	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	
}

function gotoTab2response(data){
	
	let form = document.createElement('form');
	form.setAttribute('method','get');
	form.setAttribute('action','/admin/cubici/adminPreference/manageCode_tab2');
	document.charset= "utf-8";
	for(let key in data){
		let hiddenField = document.createElement("input");
		hiddenField.setAttribute('type','hidden');
		hiddenField.setAttribute('name',key);
		hiddenField.setAttribute('value',JSON.stringify(data[key]));
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit(); 
}
</script>

<div class="m-tab">
    <ul>
        <li class="active"><a href="/admin/cubici/adminPreference/manageCode_tab1">연계코드</a></li>
        <li><a href="/admin/cubici/adminPreference/manageCode_tab2">연계코드 등록</a></li>
    </ul>
</div>

<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">회사명</span>
                <div class="input">
                    <select id="FIRM_NM">
                        <option value="ALL">전체</option>
                    </select>
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">연계명</span>
                <div class="input">
                    <input type="text" placeholder="연계명" id="LINKED_NM">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">담당자</span>
                <div class="input">
                    <input type="text" placeholder="담당자" id="TASK_MANAGER">
                </div>
            </div>
        </li>
        <li>
            <div class="btns">
                <button class="sBtn sColorLB search" id="searchBtn">검색</button>
            </div>
        </li>
    </ul>

</div>

<div class="tableSet mArticleArea">
    <div class="m-options">
        <div class="pRight">
            <div class="fwBox">
                <span class="ft">보기기준</span>
                <div class="input" id="ORDER_BY">
                    <select>
                        <option value="DESC">최근순</option>
                        <option value="ASC">과거순</option>
                    </select>
                </div>
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