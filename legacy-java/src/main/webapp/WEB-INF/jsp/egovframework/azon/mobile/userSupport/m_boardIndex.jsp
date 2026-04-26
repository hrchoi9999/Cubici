<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script type="text/javascript">
let keyword = ""; //검색값

$(document).ready(function() {
	
	// 현재 폐이지 키워드 값이 없을때 첫페이지로
	if ("${resultCode}" === "0") {
		boardList(0);
	} else {
		console.log("ErrorCode :: "+"${resultCode}");
		modalInfo("관리자에게 문의 바랍니다.");
	}
	
	// 엔터 입력시 키업 함수 활성화
	$('input[name="keyword"]').keyup(function(e){
		if(e.keyCode == 13){
			$('#currentPageNum').val("");
			boardList(1);//엔터 입력시 폐이지는 1폐이지로
		};
	});

	// 검색 키 클릭시 검색이벤트
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
	
	let callUrl = "/board/list/get";
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

	let dataList = data.resultList;
	if(dataList.length > 0){
		let liList = ''; // 게시글 리스트
		$.each(dataList, function (index, item) {
			liList += '<li><a href="javascript:boardDetailFunc(' + "'" + item.OPEN_YN + "'" + ',' + item.GROUP_NO + ',' + item.USER_NO + ');" class="modalOpen" data-modal="boardView-qna"><span class="subject">' + item.RNUM+'.'+ item.TITLE + '</span>';
			if(item.COMMENT_CNT === 1){
				liList += '<span class="sBtn rBtn sColorLB">답변완료</span></a>';
			}else{
				liList += '<span class="sBtn rBtn sColorLG">답변대기</span></a>';				
			}
			liList += '<ul class="info">';
			if(item.OPEN_YN === "Y"){
				liList += '<li class="openY">공개</li>';
			}else{
				liList += '<li class="openN">비공개</li>';
			}
			liList += '<li>'+item.BOARD_DIVISION+'</li>';
			liList += '<li>작성자<b>'+item.USER_NM+'</b></li>';
			liList += '<li>등록일<b>'+item.REG_DATE+'</b></li></ul></li>';
		});
		
		$('#listBody').empty().html(liList);
		
		// 페이징
		let pageHtml = "";
		pageHtml += "<ul>";

		let pageMaxCnt = Math.ceil(dataList[0].CNT / data.dataPerPage); // 총 페이지 갯수
		let dataPerPage = data.dataPerPage; // 한 페이지에 보여줄 값 (10)
		let currentPage = data.currentPage; // 현재 페이지 위치
		let pageCnt = Math.floor(currentPage / 10);  //현재 페이징 위치 (1~10, 11~20)
		
		// 페이지 구간이 두번째 구간부터는 이전으로 가는 이벤트	
		if(pageCnt != 0){
			pageHtml += "<li><a class='oiBtn prev' href = 'javascript:boardList(" + ((pageCnt)*10)
			pageHtml += ',"' + keyword + '")' + "'> < </a></li>";
		}
	
		// 10 페이지 단위 씩만 보여줌
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ //1~10
			if( i > pageMaxCnt) {
				break;
			}
			// 현재 페이지 처리
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:boardList("
				pageHtml +=  i + ',"' + keyword + '");';
				pageHtml += "'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:boardList("
				pageHtml +=  i + ',"' + keyword + '");';
				pageHtml += "'>" + i + "</a></li>";
			}
		}	
		
		// 10 페이지 단위로 다음 페이지로
		if(pageCnt+1 < (pageMaxCnt/10)){
			// 다음
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:boardList(" + ((pageCnt+1)*10 + 1) 
			pageHtml += ',"' + keyword + '")' + "'> > </a></li>";
		}
		
		pageHtml += '</ul>';
		$('#page').empty().html(pageHtml);
	} else {
		let liList = '<tr><td colspan="5">조회된 결과가 없습니다.</td></tr>'; // 조회결과가 없을시 데이터 없음
		$('#listBody').empty().html(liList);
		$('#page').empty()
	}
	
}

//게시글 상세보기
function boardDetailFunc(openYN, groupNo, userNo){
	let user_grade = 0;
	let sessionUserNo = "";
	
	// model에 있는 User값 가져오기
	if(${not empty User}){
		user_grade = "${User.USER_TYPE}";
		sessionUserNo = "${User.USER_NO}";
	}
	if((openYN === "N" && String(userNo) !== sessionUserNo) && (openYN === "N" && user_grade !== "00")){
		modalInfo("비공개 게시글 입니다.");
		return false;
	}else{
		
		let form= $("<form></form>");
		form.attr("name", "detailForm");
		form.attr("method", "get");
		form.attr("action", "<c:url value='/m/board/qa/detail'/>");
		
		form.append($("<input />", {type: "hidden", name: "GROUP_NO", value: groupNo}));
		form.append($("<input />", {type: "hidden", name: "DIVISION", value: "01"}));
		
		form.appendTo("body");
		
		form.submit();
	}
} 

//개시글 작성
function loginCheck(){
	if(${empty User}){
		modalInfo("로그인 후 이용바랍니다.");
		return false;
	}
	$(location).attr("href", "<c:url value='/m/board/qa/write' />");
}
</script>

<div class="m-baordSet">
    <div class="boardTop">
        <a href="javascript:loginCheck();" class="mBtn sColorLB aiBtn write">글쓰기</a>
        <div class="fwBox">
            <div class="input search">
                <input type="text" name="keyword" placeholder="검색">
                <button id="keywordbtn" class="oiBtn search">검색</button>
            </div>
        </div>
    </div>
    <article class="subBox">
        <header>
            <h4>Q&A</h4>
        </header>
        <div class="boardList">
            <ul class="list" id="listBody">
	        </ul>
        </div>
    </article>
    <div id="page" class="m-paging">
    </div>
    <div style = "display:none"><!-- 페이지값 저장 -->
        <input type="text" id="currentPageNum"/>
    </div>
</div>

