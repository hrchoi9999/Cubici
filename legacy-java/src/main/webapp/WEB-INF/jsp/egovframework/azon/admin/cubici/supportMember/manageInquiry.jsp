<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<style>
.state {width:8%;}
.user {width:10%;}
</style>
<script type="text/javascript">
let QnaHtml = "";
let keyword = ""; //검색값

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

//게시글 파라미터 값 넘기기
function boardList(CURRENTPAGE){

	if(CURRENTPAGE != 0){
		$('#currentPageNum').val(CURRENTPAGE);//하단 페이지 이동할때 값 저장하는 곳으로 전달
		currentPageNum = $('#currentPageNum').val();//값 세팅
	}else if($('#currentPageNum').val() == ""){
		currentPageNum = $('#currentPageNum').val()+1; // 첫 메인화면 들어올시 빈 값이면 +1 로 첫페이지를 맞춤
	}else{
		currentPageNum = $('#currentPageNum').val(); // 상세를 보고 나왔을시 페이지 값 유지
	}

	keyword = $('input[name="keyword"]').val();
	
	let currentPage = currentPageNum-1;// 현재 폐이지값 -1은 밑에 수식계산을 위해
	let	dataPerPage = 10; // 폐이지마다 보여줄 리스트 갯수
	let dataCnt = currentPage * dataPerPage; //현재 폐이지
	
	let callUrl = "/admin/board/list/get";
	let callBackFunc = "boardListResponse";
	let objParam = {
			dataPerPage : dataPerPage,// 페이지마다 보여줄 리스트 갯수
			currentPage : currentPage,// 현재 폐이지
			dataCnt : dataCnt, // dataPerPage에 따른 현재 페이지 갯수
			keyword : keyword, // 검색 키워드
			DIVISION: "01"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

//게시글 가져오기
function boardListResponse(data){
	//tr 생성
	let dataList = data.resultList;
	if(dataList.length > 0){
		let trHtml = '';// 게시글 리스트
			$.each(dataList, function (index, item) {
			trHtml += '<tr><td class="state">' + item.RNUM + '</td>';
			if(item.OPEN_YN === "Y"){
				trHtml += '<td class="state">공개</td>';
			}else{
				trHtml += '<td class="state">비공개</td>';
			}
			trHtml += '<td class="state">' + item.BOARD_DIVISION + '</td>';
			trHtml += '<td class="user">' + item.USER_NM + '</td>';
			trHtml += '<td class="subject"><a href="javascript:boardDetailFunc('+ item.GROUP_NO + ');">' + item.TITLE + '</a></td>'; 
			trHtml += '<td class="date" style="width:11%">' + item.REG_DATE + '</td>';

			if(item.ANSWER_DATE === null){
				trHtml += '<td class="date" style="width:11%">답변요청</td>'
			}else{
				if(item.ANSWER_MODIFY_DATE === null){
					trHtml += '<td class="date" style="width:11%">' + item.ANSWER_DATE + '</td>';
				}else{
					trHtml += '<td class="date" style="width:11%">' + item.ANSWER_MODIFY_DATE + '</td>';
				}
			}
			if(item.COMMENT_CNT === 1){
				trHtml += '<td class="answer" style="width:10%"><span class="sBtn rBtn sColorLB">답변완료</span></td></tr>';
			}else{
				trHtml += '<td class="answer" style="width:10%"><span class="sBtn rBtn sColorLG">답변대기</span></td></tr>';				
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
	
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ //1~10
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
		let trHtml = '<tr><td colspan="8">조회된 결과가 없습니다.</td></tr>';
		$('#listTbody').empty().html(trHtml);
		$('#page').empty()
	}
	
}

function boardDetailFunc(groupNo){
	
	let form= $("<form></form>");
	form.attr("name", "detailForm");
	form.attr("method", "get");
	form.attr("action", "<c:url value='/admin/board/manageInquiry/detail'/>");
	
	form.append($("<input />", {type: "hidden", name: "GROUP_NO", value: groupNo}));
	form.append($("<input />", {type: "hidden", name: "DIVISION", value: "01"}));
	
	form.appendTo("body");
	
	form.submit();
}

</script>

<div class="m-baordSet">
    <div class="boardTop">
        <div class="bRight">
            <div class="fwBox">
                <div class="input search">
                    <input type="text" name="keyword" placeholder="검색">
                    <button id="keywordbtn" class="oiBtn search">검색</button>
                </div>
            </div>
        </div>
    </div>
    <div class="boardList">
            <table class="list">
                <thead>
                     <th class="state">No</th>
                    <th class="state">공개여부</th>
                    <th class="state">구분</th>
                    <th class="user">작성자</th>
                    <th class="subject">제목</th>
                    <th class="date" style="width:11%">등록일자</th>
                    <th class="date" style="width:11%">답변일자</th>
                    <th class="answer" style="width:10%">답변상태</th>
                </thead>
                <tbody id = "listTbody">     
                </tbody>
            </table>
            <div id="page" class="m-paging"></div>
     <div style = "display:none"><!-- 페이지값 저장 -->
            <input type="text" id="currentPageNum"/></div>
    </div>
</div>