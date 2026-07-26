<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script type="text/javascript">
let keyword = "";

$(document).ready(function() {

	faqList(0);

	$('input[name="keyword"]').keyup(function(e){
		if(e.keyCode == 13){		
			faqList(1);
		};
	});
	
	$('#keywordbtn').click(function(){
		faqList(1);
	});
	
});

//게시글 파라미터 값 넘기기
function faqList(CURRENTPAGE){
	
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
	
	let callUrl = "/admin/board/list/get";
	let callBackFunc = "faqListResponse";
	let objParam = {
			dataPerPage : dataPerPage,
			currentPage : currentPage,
			dataCnt : dataCnt,
			keyword : keyword,
			DIVISION: "02"
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function faqListResponse(data){

	let dataList = data.resultList;
	if(dataList.length > 0){
		let trHtml = '';
			$.each(dataList, function (index, item) {
			trHtml += '<tr><td class="num">' + item.RNUM + '</td>';
			/* trHtml += '<td class="state">' + item.BOARD_DIVISION + '</td>' */
			trHtml += '<td class="subject"><a href = "javascript:faqDetail(' + item.BOARD_NO + ');">' + item.TITLE + '</a></td>'; 
			trHtml += '<td class="answer"> <a href = "javascript:faqDetail(' + item.BOARD_NO + ');" class="sBtn rBtn sColorLB">상세보기</button></td></tr>';
		});
		$('#listTbody').empty().html(trHtml);
				
		let pageHtml = "";
		pageHtml += "<ul>";

		let pageMaxCnt = Math.ceil(dataList[0].CNT / data.dataPerPage);
		let dataPerPage = data.dataPerPage;
		let currentPage = data.currentPage;
		let pageCnt = Math.floor(currentPage / 10);
		
		if(pageCnt != 0){
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:faqList(" + ((pageCnt)*10) + ")'> < </a></li>";
		}
	
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){
			if( i > pageMaxCnt) {
				break;
			}
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:faqList(" + i + ")'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:faqList(" + i + ")'>" + i + "</a></li>";
			}
		}	
		
		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:faqList(" + ((pageCnt+1)*10 + 1) + ")'> > </a></li>";
		}
		
		pageHtml += '</ul>';
		$('#page').empty().html(pageHtml);
	} else {
		let trHtml = '<tr><td colspan="5">조회된 결과가 없습니다.</td></tr>';
		$('#listTbody').empty().html(trHtml);
		$('#page').empty()
	}
	
}

function faqDetail(boardNo){

	let form= $("<form></form>");
	form.attr("name", "detailForm");
	form.attr("method", "get");
	form.attr("action", "<c:url value='/admin/cubici/supportMember/manageBoard_tab2/detail'/>");
	
	
	form.append($("<input />", {type: "hidden", name: "BOARD_NO", value: boardNo}));
	form.append($("<input />", {type: "hidden", name: "DIVISION", value: "02"}));
	
	form.appendTo("body");
	
	form.submit();
		
}

</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/supportMember/manageBoard_tab1">서비스 공지</a></li>
        <li class="active"><a href="/admin/cubici/supportMember/manageBoard_tab2">FAQ</a></li>
    </ul>
</div>

<div class="m-baordSet">
    <div class="boardTop">
    	<div class="bLeft">
    		<a href="<c:url value='/admin/cubici/supportMember/manageBoard_tab2/write'/>" class="sBtn sColorLB aiBtn write">글쓰기</a>
    	</div>
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
                   <!--  <th class="subject">구분</th> -->
                    <th class="subject">제목</th>
                    <th class="answer">답변</th>
                </thead>
                <tbody id="listTbody">
                </tbody>
            </table>
        <div id="page" class="m-paging"></div>  
        <div style = "display:none"><!-- 페이지값 저장 -->
            <input type="text" id="currentPageNum"/>
        </div>
    </div>      
</div>
