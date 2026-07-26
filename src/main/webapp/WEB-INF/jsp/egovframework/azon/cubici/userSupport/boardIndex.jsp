<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script type="text/javascript">
let keyword = "";

$(document).ready(function() {
	
	boardList(0);
	
	$('input[name="keyword"]').keyup(function(e){
		if(e.keyCode == 13){
			$('#currentPageNum').val("");
			boardList(1);
		};
	});

	$('#keywordbtn').click(function(){
		$('#currentPageNum').val("");
		boardList(1);
	});
    
});

function boardList(CURRENTPAGE){

	if(CURRENTPAGE != 0){
		$('#currentPageNum').val(CURRENTPAGE);
		currentPageNum = $('#currentPageNum').val();
	}else if($('#currentPageNum').val() == ""){
		currentPageNum = $('#currentPageNum').val()+1;
	}else{
		currentPageNum = $('#currentPageNum').val();
	}

	keyword = $('input[name="keyword"]').val();
	
	let currentPage = currentPageNum-1;
	let	dataPerPage = 10;
	let dataCnt = currentPage * dataPerPage;
	
	let callUrl = "/board/list/get";
	let callBackFunc = "boardListResponse";
	let objParam = {
			dataPerPage : dataPerPage,
			currentPage : currentPage,
			dataCnt : dataCnt,
			keyword : keyword,
			DIVISION: "01"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function boardListResponse(data){
	
	let dataList = data.resultList;
	if(dataList.length > 0){
		let trHtml = '';
			$.each(dataList, function (index, item) {
			trHtml += '<tr><td class="user">' + item.RNUM + '</td>';
			if(item.OPEN_YN === "Y"){
				trHtml += '<td class="state">공개</td>';
			}else{
				trHtml += '<td class="state">비공개</td>';
			}
			trHtml += '<td class="state">' + item.BOARD_DIVISION + '</td>';
			trHtml += '<td class="user">' + item.USER_NM + '</td>';
			trHtml += '<td class="subject"><a href="javascript:boardDetailFunc(' + "'" + item.OPEN_YN + "'" + ',' + item.GROUP_NO + ',' + item.USER_NO + ');">' + item.TITLE + '</a></td>'; 
			trHtml += '<td class="date">' + item.REG_DATE + '</td>';
			if(item.COMMENT_CNT === 1){
				trHtml += '<td class="reply"><span>답변완료</span></td></tr>';
			}else{
				trHtml += '<td class="answer"><span>답변대기</span></td></tr>';				
			}
		});
		$('#listTbody').empty().html(trHtml);
		
		let pageHtml = "";
		pageHtml += "<ul>";

		let pageMaxCnt = Math.ceil(dataList[0].CNT / data.dataPerPage);
		let dataPerPage = data.dataPerPage;
		let currentPage = data.currentPage;
		let pageCnt = Math.floor(currentPage / 10);
		
		if(pageCnt != 0){
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:boardList(" + ((pageCnt)*10) + ")'> < </a></li>";
		}
	
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){
			if( i > pageMaxCnt) {
				break;
			}
			
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:boardList(" + i + ")'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:boardList(" + i + ")'>" + i + "</a></li>";
			}
		}	
		
		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:boardList(" + ((pageCnt+1)*10 + 1) + ")'> > </a></li>";
		}
		
		pageHtml += '</ul>';
		$('#page').empty().html(pageHtml);
	} else {
		let trHtml = '<tr><td colspan="7">조회된 결과가 없습니다.</td></tr>'; 
		$('#listTbody').empty().html(trHtml);
		$('#page').empty()
	}
	
}

function boardDetailFunc(openYN, groupNo, userNo){
	let user_grade = 0;
	let sessionUserNo = "";
	
	if(${not empty principal}){
		user_grade = "${principal.user_type}";
		sessionUserNo = "${principal.user_no}";
	}
	
	if((openYN === "N" && String(userNo) !== sessionUserNo) && (openYN === "N" && user_grade !== "00")){
		modalInfo("비공개 게시글 입니다.");
		return false;
	}else{
		let form= $("<form></form>");
		form.attr("name", "detailForm");
		form.attr("method", "get");
		form.attr("action", "<c:url value='/board/qa/detail'/>");
		
		form.append($("<input />", {type: "hidden", name: "GROUP_NO", value: groupNo}));
		form.append($("<input />", {type: "hidden", name: "DIVISION", value: "01"}));
		
		form.appendTo("body");
		
		form.submit();
	}
} 

function loginCheck(){
	if(${empty principal}){
		modalInfo("로그인 후 이용바랍니다.");
		return false;
	}
	$(location).attr("href", "<c:url value='/board/qa/write' />");
}
</script>

<div class="m-baordSet">
	<div class="boardTop">
		<div class="bLeft">
			<a href="javascript:loginCheck();" class="aiBtn writeW sColorLB">글쓰기</a>
		</div>
		<div class="bRight">
			<div class="fwBox h45">
				<div class="input search">
					<input type="text" name="keyword" placeholder="검색어를 입력해주세요.">
					<button id="keywordbtn" class="oiBtn2">검색</button>
				</div>
			</div>
		</div>
	</div>
	<div class="boardList">
		<table class="list">
			<thead>
				<th class="user">No</th>
				<th class="state">공개여부</th>
				<th class="state">구분</th>
				<th class="user">작성자</th>
				<th class="subject">제목</th>
				<th class="date">등록일</th>
				<th class="answer" style="width:10%">답변상태</th>
			</thead>
			<tbody id="listTbody">
       		</tbody>
		</table>
        <div id="page" class="m-paging">        
        </div>
        <div style = "display:none"> <!-- 페이지값 저장 -->
            <input type="text" id="currentPageNum"/>
		</div>
	</div>
</div>