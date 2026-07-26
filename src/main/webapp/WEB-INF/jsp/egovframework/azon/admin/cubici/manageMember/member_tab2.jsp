<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script>
let TheadArray = [];

$(document).ready(function(){
	if("${resultCode}" === "0"){
		$("#fromDate").val("${fromDate}");
		$("#toDate").val("${toDate}");
		userList(0);
	}else{
		modalInfo("관리자에게 문의해주세요.")
	}
	
	$(document).on('click', "#selectButton", function(){
		$('#currentPageNum').val('');
		userList(1);
	});
	
	$(document).on('click', "#optionBtn", function(){
		let currentPageNum = $('#currentPageNum').val();
		userList(currentPageNum);
	});
});

function userList(CURRENTPAGE){
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	if(CURRENTPAGE != 0){
		$('#currentPageNum').val(CURRENTPAGE);
		currentPageNum = $('#currentPageNum').val();
	}else if($('#currentPageNum').val() == ""){
		currentPageNum = $('#currentPageNum').val()+1;
	}else{
		currentPageNum = $('#currentPageNum').val();
	}
	
	TheadArray.length = 0;
	$(".columnCheck").each(function(){
		if(this.checked){
			let theadStr = $(this).parent().find("span").text();
			TheadArray.push(theadStr.slice(0,theadStr.length));
		}else{
			TheadArray.push(false);
		}
	});
	
	let NKeyword = $("#NKeyword").val();
	let CKeyword = $("#CKeyword").val()
	let IdKeyword = $("#IdKeyword").val();
	let useService = $("#useService option:selected").val();
	let fromDate = $("#fromDate").val();
	let toDate = $("#toDate").val();
	let selectOrderBy = $("#tableOrderBy option:selected").val();
	
	let currentPage = currentPageNum-1;
	let	dataPerPage = 10;
	let dataCnt = currentPage * dataPerPage;
	
	let callUrl = "/admin/cubici/manageMember/member_tab2";
	let callBackFunc = "userStatusResponse";
	let objParam = {
			NKeyword : NKeyword,
			CKeyword : CKeyword,
			fromDate : fromDate,
			toDate : toDate,
			IdKeyword : IdKeyword,
			useService : useService,
			dataCnt : dataCnt,
			dataPerPage : dataPerPage,
			selectOrderBy : selectOrderBy,
			currentPage : currentPage
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function userStatusResponse(data){
	let dataList = data.userStatusList;

	let TableHtml = '<div class="overflowBox mCustomScrollbar">';
	TableHtml += '<div class="fixArea">';
	TableHtml += '<div class="fixRow">';
	TableHtml += '<table class="m-shadowTable">';
	TableHtml += '<thead><tr><th>이용서비스</th><th>가입일자</th><th>회원ID</th><th>회원명</th></tr></thead>';
	TableHtml += '<tbody id="fixTbody">';
	
	let FixTbody = '';
	let ScrollTbody = '';
	if(dataList.length > 0){
		let trHtml = '';
		let btnColor = '';
		let userType = '';
		
		$.each(dataList, function(i, item){
			userType = item.user_type;

			switch(userType){
				case '01':
					btnColor = 'sColorLS';
					break;
				case '02':
					btnColor = 'sColorN';
					break;
				case '97':
					btnColor = 'sColorY';
					break;
			}

			FixTbody += '<tr>';
			FixTbody += '<td><div class="tIn"><span class="sBtn ' + btnColor + ' rBtn">' + item.auth_name + '</span><div></td>';
			FixTbody += '<td><div class="tIn">' + item.reg_date + '</div></td>';
			FixTbody += '<td><div class="tIn">' + item.user_id + '</div></td>';
			FixTbody += '<td><div class="tIn"><a href="javascript:statusDetail('+ "'" + item.user_code + "'" + ');">' + item.user_nm + '</a></div></td>';
			FixTbody += '</tr>';
			
			ScrollTbodyValueArray = [item.firm_nm, item.user_phone, item.firm_tel, item.shop_count, item.firm_addr] 
			ScrollTbody += '<tr>';
			$.each(TheadArray, function(i, item){
				if(item){
					ScrollTbody += '<td><div class="tIn">' + ScrollTbodyValueArray[i] + '</div></td>';
				}
			});
			ScrollTbody += '</tr>';
		});
		
	}
	TableHtml += FixTbody;
	TableHtml += '</tbody></table></div>';
	TableHtml += '<div class="rollRow"><table class="m-shadowTable">';
	TableHtml += '<thead id ="scrollThead">';
	
	let ChangeThead = '<tr>';
	$.each(TheadArray, function(i, item){
		if(item){
			ChangeThead += '<th>' + item + '</th>';
		}
	});
	ChangeThead += '</tr>';
	
	TableHtml += ChangeThead;
	TableHtml += '</thead>';
	TableHtml += '<tbody id="scrollTbody">';
	TableHtml += ScrollTbody;
	TableHtml += '</tbody></table></div></div></div>';
	
	$("#fixTable").html(TableHtml);
					  
	let sumMap = data.userStatusSum;
	
	let TableSum = '<div class="fixBottom"><ul class="tableTotal"><li><span class="txt">전체</span>';
	TableSum += '<span class="result"> ' + sumMap.total_count + ' 건</span></li>';
	TableSum += '<li><span class="txt">큐빅아이 회원</span>';
	TableSum += '<span class="result">' + sumMap.cubici_count + ' 명</span></li>';
	TableSum += '<li><span class="txt">머니뱅크 회원</span>';
	TableSum += '<span class="result">' + sumMap.mb_count + ' 명</span></li></ul></div>';
	$("#fixTable").append(TableSum); 
	
	let pageHtml = "";
	pageHtml += "<ul>";

	let pageMaxCnt = Math.ceil(sumMap.total_count / data.dataPerPage);
	let dataPerPage = data.dataPerPage;
	let currentPage = data.currentPage;
	let pageCnt = Math.floor(currentPage / 10);
	
	if(pageCnt != 0){
		pageHtml += "<li><a class='oiBtn prev' href = 'javascript:userList(" + ((pageCnt)*10) + ")'> < </a></li>";
	}

	for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){
		if( i > pageMaxCnt) {
			break;
		}
		
		if(i-1  == data.currentPage){
			pageHtml += "<li><a class='num active' href = 'javascript:userList(" + i + ")'>" + i + "</a></li>";
		}else{ 
			pageHtml += "<li><a class='num' href = 'javascript:userList(" + i + ")'>" + i + "</a></li>";
		}
	}	
	
	if(pageCnt+1 < (pageMaxCnt/10)){
		pageHtml += "<li><a class='oiBtn next' href = 'javascript:userList(" + ((pageCnt+1)*10 + 1) + ")'> > </a></li>";
	}
	
	pageHtml += '</ul>';
	$('#page').empty().html(pageHtml);
	
	$('#fixTable').doFixTable();
	
	$(".loadingSpinner").css({"display" : "none"});
}

function statusDetail(code){
	let form= $("<form></form>");
	form.attr("name", "detailForm");
	form.attr("method", "get");
	form.attr("action", "<c:url value='/admin/cubici/manageMember/userstatus'/>");
	form.append($("<input />", {type: "hidden", name: "code", value: code}));
	form.appendTo("body");
	form.submit();
}

</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/manageMember/member_tab1">회원 종합</a></li>
        <li class="active"><a href="/admin/cubici/manageMember/member_tab2">회원 정보</a></li>
        <li><a href="/admin/cubici/manageMember/member_tab3">휴면/해지</a></li>
    </ul>
</div>

<div class="m-options">
    <div class="pRight">
        <span class="baseDate pRight"><b>기준</b>${standardDate}</span>
    </div>
</div>

<div class="m-search">
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">회원명</span>
                <div class="input">
                    <input type="text" id="NKeyword" placeholder="회원명">
                </div>
            </div>
        </li>
        <li>
            <div class="fwBox">
                <span class="ft">회사명</span>
                <div class="input">
                    <input type="text" id="CKeyword" placeholder="회사명">
                </div>
            </div>
        </li>
        <li>
			<div class="fwBox">
				<span class="ft">가입기간</span>
				<div class="input">
					<input type="text" class="startDatepicker" id="fromDate" placeholder="시작기간" autocomplete='off' readonly>
				</div>
				~
				<div class="input">
					<input type="text" class="endDatepicker" id="toDate" placeholder="종료기간" autocomplete='off' readonly>
				</div>
			</div>
		</li>
    </ul>
    <ul>
        <li>
            <div class="fwBox">
                <span class="ft">회원ID</span>
                <div class="input">
                    <input type="text" id="IdKeyword" placeholder="회원ID">
                </div>
            </div>
        </li>
        <li>
           <div class="fwBox">
               <span class="ft">이용 서비스</span>
                 <div class="input">
                    <select id = "useService" class="form-control">
                    	<option value="">전체</option>
                    	<c:forEach var="use" items="${userStatusList}">
                    		<option value="${use.auth_type}">${use.auth_name}</option> 
                    	</c:forEach>
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
                        <option value="reg_date">가입일자</option>
                        <option value="user_nm">회원명</option>
                        <option value="firm_nm">회사명</option>
                        <option value="shop_count">운영몰 수</option>
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
                            <span>이용서비스</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>가입일자</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="required" disabled checked>
                            <span>회원ID</span>
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
                            <input type="checkbox" class="columnCheck" checked>
                            <span>회사명</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>핸드폰</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>대표전화</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>운영몰</span>
                        </label>
                    </li>
                    <li>
                        <label class="dotCheckBox">
                            <input type="checkbox" class="columnCheck" checked>
                            <span>주소</span>
                        </label>
                    </li>
                    <li class="btns">
                        <button class="sBtn sColorLB wBtn" id="optionBtn">옵션 확인</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="fixTable" class="fixTable">
    </div>
    <div class="m-paging" id="page">
    </div>
    <div style = "display:none"> <!-- 페이지값 저장 -->
        <input type="text" id="currentPageNum"/>
	</div>
    <script>
        $('#fixTable').doFixTable();
    </script>
</div>