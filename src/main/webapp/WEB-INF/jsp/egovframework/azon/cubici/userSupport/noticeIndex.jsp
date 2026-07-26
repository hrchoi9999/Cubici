<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<script type="text/javascript">
let keyword = "";

$(document).ready(function() {

	noticeList(0);
	
	$('input[name="keyword"]').keyup(function(e){
		if(e.keyCode == 13){
			$('#currentPageNum').val("");
			noticeList(1);
		};
	});

	$('#keywordbtn').click(function(){
		$('#currentPageNum').val("");
		noticeList(1);
	});

});

function noticeList(CURRENTPAGE){

	if(CURRENTPAGE != 0){
		$('#currentPageNum').val(CURRENTPAGE);
		currentPageNum = $('#currentPageNum').val();
	}else if($('#currentPageNum').val() == ""){
		currentPageNum = $('#currentPageNum').val()+1;
	}else{
		currentPageNum = $('#currentPageNum').val();유지
	}
	
	keyword = $('input[name="keyword"]').val();
	
	currentPage = currentPageNum-1;
	let	dataPerPage = 10;
	let dataCnt = currentPage * dataPerPage;
	
	let callUrl = "/board/list/get";
	let callBackFunc = "noticeListResponse";
	let objParam = {
			dataPerPage : dataPerPage,
			currentPage : currentPage,
			dataCnt : dataCnt,
			keyword : keyword,
			DIVISION: "03"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function noticeListResponse(data){
	
	let dataList = data.resultList;
	if(dataList.length > 0){
		let trHtml = '';// 게시글 리스트
			$.each(dataList, function (index, item) {
			trHtml += '<tr><td class="num">' + item.RNUM + '</td>';
			trHtml += '<td class="state">' + item.BOARD_DIVISION + '</td>'
			trHtml += '<td class="subject"><a href="javascript:noticeDetail(' + item.BOARD_NO + ');">' + item.TITLE + '</a></td>'; 
			trHtml += '<td class="date">' + item.REG_DATE + '</td>';
			trHtml += '<td class="answer">';
			trHtml += '<a href="javascript:noticeDetail(' + item.BOARD_NO + ');" class="sBtn rBtn sColorLB">공지보기</button></td></tr>';
		});
		$('#listTbody').empty().html(trHtml);
		
		let pageHtml = "";
		pageHtml += "<ul>";

		let pageMaxCnt = Math.ceil(dataList[0].CNT / data.dataPerPage);
		let dataPerPage = data.dataPerPage;
		let currentPage = data.currentPage;
		let pageCnt = Math.floor(currentPage / 10);
		
		if(pageCnt != 0){
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:noticeList(" + ((pageCnt)*10) + ")'> < </a></li>";
		}
	
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){
			if( i > pageMaxCnt) {
				break;
			}

			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:noticeList(" + i + ")'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:noticeList(" + i + ")'>" + i + "</a></li>";
			}
		}	
		
		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:noticeList(" + ((pageCnt+1)*10 + 1) + ")'> > </a></li>";
		}
		pageHtml += '</ul>';
		$('#page').empty().html(pageHtml);
	} else {
		let trHtml = '<tr><td colspan="7">조회된 결과가 없습니다.</td></tr>';
		$('#listTbody').empty().html(trHtml);
		$('#page').empty()
	}
	
}

function noticeDetail(boardNo){

	let form= $("<form></form>");
	form.attr("name", "detailForm");
	form.attr("method", "get");
	form.attr("action", "<c:url value='/board/notice/detail'/>");
	
	
	form.append($("<input />", {type: "hidden", name: "BOARD_NO", value: boardNo}));
	form.append($("<input />", {type: "hidden", name: "DIVISION", value: "03"}));
	
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
				<th class="num">No</th>
				<th class="subject">구분</th>
				<th class="subject">제목</th>
				<th class="date">등록일</th>
				<th class="date">공지사항</th>
			</thead>
			<tbody id="listTbody">
			</tbody>
		</table>
		<div id="page" class="m-paging"></div>
		<div style="display: none">
			<!-- 페이지값 저장 -->
			<input type="text" id="currentPageNum" />
		</div>
	</div>
</div>
