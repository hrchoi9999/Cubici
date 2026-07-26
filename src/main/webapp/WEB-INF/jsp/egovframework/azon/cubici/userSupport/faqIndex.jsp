<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script type="text/javascript">
let keyword = ""; // 검색 값

$(document).ready(function() {
	
	faqList(1);
	
	$('input[name="keyword"]').keyup(function(e){
		if(e.keyCode == 13){		
			faqList(1);
		};
	});
	
	$('#keywordbtn').click(function(){
		faqList(1);
	});
	
});

function faqList(CURRENTPAGE){
	keyword = $('input[name="keyword"]').val();

	currentPage = CURRENTPAGE-1;
	let	dataPerPage = 10;
	let dataCnt = currentPage * dataPerPage;
	
	let callUrl = "/board/list/get";
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
			trHtml += '<td class="state">' + item.BOARD_DIVISION + '</td>';
			trHtml += '<td class="subject"><a href = "javascript:faqDetailtoggle(' + "'" + 'viewButton_' + item.RNUM + "'" + ',' + item.BOARD_NO + ');">' + item.TITLE + '</a></td>'; 
			trHtml += '<td class="answer">';
			trHtml += '<a id="viewButton_' + item.RNUM + '" href = "javascript:faqDetailtoggle(' + "'" + 'viewButton_' + item.RNUM + "'" + ',' + item.BOARD_NO + ');"';
			trHtml += 'class="sBtn rBtn sColorLB">답변보기</td></tr>'; 
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
		let trHtml = '<tr><td colspan="7">조회된 결과가 없습니다.</td></tr>';
		$('#listTbody').empty().html(trHtml);
		$('#page').empty()
	}
	
}

function faqDetailtoggle(ViewButton, boardNo){

	let objParam = {
			BOARD_NO : boardNo
	}

	$.ajax({
		url : "/faq/detail/get",
		data : JSON.stringify(objParam),
		method : "POST",
		dataType : "JSON",
		contentType : "application/json; charset=utf-8",
		success : function(result) {
			if (result.resultCode == 0) {

				$('#contents').remove(); 
				$('.answer').children().show();
				$('#'+ViewButton).hide();
				$('.subject').children().css("color", "black");
				$('#'+ViewButton).parent().prev().children().css("color", "cornflowerblue");

				let trHtml = "";
				let tr = $('#'+ViewButton).parent().parent();

				trHtml += '<tr id="contents">';
				trHtml += '<td colspan="4" style="height: 150px; text-align: center;"><div id="CONTENT" style="width: 100%; padding:0px 180px 0px 180px; text-align:left; height:80px; font-size:15px;">'
						+ result.resultList.content + '</div><div style="text-align:right; margin-right:48px;">';
				trHtml += '<button id="closeBtn" class="sBtn rBtn sColorLG"  onclick="closeDetail(' + "'" + ViewButton + "'" + ')">공지닫기</button></td><div>';
				trHtml += '</tr>';

				tr.after(trHtml);
				
			} else {
				modalInfo("오류가 발생했습니다.");
			}
		},
		error : function(result) {
			modalInfo("서버 통신 오류");
		}
	}); 
}

function closeDetail(ViewButton) {
	$('#contents').remove();
	$('#'+ViewButton).show();
	$('.subject').children().css("color", "black");
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
            <table class="list" style="table-layout:fixed">
                <thead>
                    <th class="num" width="5%">No</th>
                    <th class="subject" width="15%">구분</th>
                    <th class="subject" width="60%">제목</th>
                    <th class="answer" width="20%">답변</th>
                </thead>
                <tbody id="listTbody">
                </tbody>
            </table>
        <div id="page" class="m-paging"></div>        
    </div>
</div>
       

