<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<style>
#CONTENT{
	width: 80%; 
	resize: none; 
	border: 0; 
	cursor:default; 
	outline:none;
}
</style>

<script type="text/javascript">
let keyword = ""; // 검색 값

$(document).ready(function() {
	
	// 현재 폐이지 키워드 값이 없을때 첫페이지로
	if ("${resultCode}" === "0") {
		faqList(1);
	} else {
		console.log("ErrorCode :: "+"${resultCode}");
		modalInfo("관리자에게 문의 바랍니다.");
	}
	
	// 엔터 입력시 키업 함수 활성화
	$('input[name="keyword"]').keyup(function(e){
		if(e.keyCode == 13){		
			faqList(1);//엔터 입력시 폐이지는 1폐이지로
		};
	});
	
	// 검색 키 클릭시 검색이벤트
	$('#keywordbtn').click(function(){
		faqList(1);
	});
	
});

// 게시글 파라미터 값 넘기기
function faqList(CURRENTPAGE){
	keyword = $('input[name="keyword"]').val();

	currentPage = CURRENTPAGE-1;// 현재 폐이지값 -1은 밑에 수식계산을 위해
	let	dataPerPage = 10; // 폐이지마다 보여줄 리스트 갯수
	let dataCnt = currentPage * dataPerPage; //현재 폐이지
	
	let callUrl = "/board/list/get";
	let callBackFunc = "faqListResponse";
	let objParam = {
			dataPerPage : dataPerPage,// 페이지마다 보여줄 리스트 갯수
			currentPage : currentPage,// 현재 폐이지
			dataCnt : dataCnt, // dataPerPage에 따른 현재 페이지 갯수
			keyword : keyword, // 검색 키워드
			DIVISION: "02"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

// 게시글 가져오기
function faqListResponse(data){

	//tr 생성
	let dataList = data.resultList;
	if(dataList.length > 0){
		let trHtml = '';//게시글 리스트
			$.each(dataList, function (index, item) {
			trHtml += '<tr><td class="num">' + item.RNUM + '</td>';
			/* trHtml += '<td class="state">' + item.BOARD_DIVISION + '</td>' */
			trHtml += '<td class="subject"><a href = "javascript:faqDetailtoggle(' + "'" + 'viewButton_' + item.RNUM + "'" + ',' + item.BOARD_NO + ');">' + item.TITLE + '</a></td>'; 
			trHtml += '<td class="answer" id="viewButton_' + item.RNUM + '">';
			trHtml += '<a href = "javascript:faqDetailtoggle(' + "'" + 'viewButton_' + item.RNUM + "'" + ',' + item.BOARD_NO + ');"';
			trHtml += 'class="sBtn rBtn sColorLB">답변보기</button></td></tr>'; 
		});
		$('#listTbody').empty().html(trHtml);
				
		// 페이징
		let pageHtml = "";
		pageHtml += "<ul>";

		let pageMaxCnt = Math.ceil(dataList[0].CNT / data.dataPerPage); // 총 페이지 갯수
		let dataPerPage = data.dataPerPage; // 한 페이지에 보여줄 값 (10)
		let currentPage = data.currentPage; // 현재 페이지 위치
		let pageCnt = Math.floor(currentPage / 10);  //현재 페이징 위치 (1~10, 11~20)
		
		// 페이지 구간이 두번째 구간부터는 이전으로 가는 이벤트	
		if(pageCnt != 0){
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:faqList(" + ((pageCnt)*10)
			pageHtml += ',"' + keyword + '")' + "'> < </a></li>";
		}
	
		// 10 페이지 단위 씩만 보여줌
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ //1~10
			if( i > pageMaxCnt) {
				break;
			}
			// 현재 페이지 처리
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:faqList("
				pageHtml +=  i + ',"' + keyword + '");';
				pageHtml += "'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:faqList("
				pageHtml +=  i + ',"' + keyword + '");';
				pageHtml += "'>" + i + "</a></li>";
			}
		}	
		
		// 10 페이지 단위로 다음 페이지로
		if(pageCnt+1 < (pageMaxCnt/10)){
			// 다음
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:faqList(" + ((pageCnt+1)*10 + 1) 
			pageHtml += ',"' + keyword + '")' + "'> > </a></li>";
		}
		
		pageHtml += '</ul>';
		$('#page').empty().html(pageHtml);
	} else {
		let trHtml = '<tr><td colspan="5">조회된 결과가 없습니다.</td></tr>'; // 조회결과가 없을시 데이터 없음
		$('#listTbody').empty().html(trHtml);
		$('#page').empty()
	}
	
}

//게시판 상세보기 ViewButton으로 버튼의 고유 id 값을 가져옴
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

				// 상세보기 이후 상세보기 클릭시 내용을 지우고 보여주기
				$('#contents').remove(); 
				$('.answer').show();
				$('#'+ViewButton).hide();
				$('.subject').children().css("color", "black");
				$('#'+ViewButton).prev().children().css("color",
						"cornflowerblue");

				let trHtml = "";
				let tr = $('#'+ViewButton).parent(); //버튼있는 tr

				trHtml += '<tr id="contents">';
				trHtml += '<td colspan="3" style="height: 150px; text-align: center;"><textarea id="CONTENT" rows="6" style="margin-left:8px; font-size:15px;"readonly="readonly">'
						+ result.resultList.CONTENT + '</textarea><div style="text-align:right; margin-right:40px;">';
				trHtml += '<button id="closeBtn" class="sBtn rBtn sColorLG"  onclick="closeDetail(' + "'" + ViewButton + "'" + ')">공지닫기</button></td><div>';
				trHtml += '</tr>';

				tr.after(trHtml);
				
			} else {
				modalInfo("오류가 발생했습니다."); // ajax 내부 오류시
			}
		},
		error : function(result) {
			modalInfo("서버 통신 오류"); // Contoroller단 오류시
		}
	}); 
}

//  FAQ 공지닫기 버튼 이벤트
function closeDetail(ViewButton) {
	$('#contents').remove();
	$('#'+ViewButton).show();
	$('.subject').children().css("color", "black");
}
</script>

<div class="m-baordSet">
    <div class="boardTop">
        <!--
        <a href="javascript:;" class="mBtn sColorLB aiBtn write">글쓰기</a>
        -->
        <div class="fwBox">
            <div class="input search">
        		<input type="text" name="keyword" placeholder="검색">
                <button id="keywordbtn" class="oiBtn search">검색</button>
            </div>
        </div>
    </div>
 <!--    <div class="subBox">
	    <header>
	        <h4>FAQ</h4>
	    </header> -->
	    <div class="boardList">
	            <table class="list">
	                <thead>
	                    <th class="num">No</th>
	                    <th class="subject">제목</th>
	                    <th class="answer">답변</th>
	                </thead>
	                <tbody id ="listTbody">
	                </tbody>
	            </table>
            <div id="page" class="m-paging"></div>
	    </div>
	</div>
<!-- </div> -->

<script>
    //faq 내용 토글
    $('.boardList .subject a, .boardList .answer a').on('click', function(e){
        e.preventDefault();
        $(this).closest('tr').next('tr').hasClass('answerContents') ? $(this).closest('tr').next('tr').toggle() : '';
    });
</script>