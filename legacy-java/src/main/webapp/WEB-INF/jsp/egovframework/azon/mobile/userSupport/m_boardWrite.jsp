<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style>
	.boardList_td{color: #000000; text-align:center; font-size:15px; padding:2px; border-bottom:1px solid #ddd;}
	.boardList_td2{text-align:center; border-bottom:1px solid #ddd;}
	.boardList_td2 select{width:200px; text-align:center;}
</style>

<script type="text/javascript">

$(document).ready(function() {
	//구분 셀렉트 박스 옵션
	let selectDivision = $("#boardDivision").attr("id");
	selectMenuList(selectDivision);
	
	//셀렉트 박스 선택
	$("#boardDivision").val("${resultList[0].BOARD_DIVISION}").prop("selected", true);
	// 작성일
/* 	document.getElementById('writeDate').value= new Date().toISOString().slice(0,10); */
});
//게시글 쓰기 함수
function boardInsertFunc(){
	let WRITER = $("#WRITER").val(); // 글쓴이
	let TITLE = $("#TITLE").val(); // 글 제목
	let CONTENT = $("#CONTENT").val(); //글 내용
	let DIVISION = "${DIVISION}"; // 1:QnA 2:FAQ 3:서비스 공지
	let USERNO = ${User.USER_NO}; // 유저 번호
	let BOARD_DIVISION = $("#BOARD_DIVISION").val();//구분 값
	CONTENT = CONTENT.replace(/(?:\r\n|\r|\n)/g, '<br>');//textarea <br> 치환
	
	let OPEN_YN = $(':radio[name="OPEN_YN"]:checked').val(); // QnA 게시판 에서만 체크 값 사용
	
	if(TITLE === null || TITLE === "" || TITLE === undefined){
		modalInfo("제목을 입력해주세요.");
		return false;
	}
	if(CONTENT === null || CONTENT === "" || CONTENT === undefined){
		modalInfo("내용을 입력해주세요.");
		return false;
	}
	if(TITLE.length > 49){
		modalInfo("제목을 50자 이내로 작성해주세요.");
		return false;
	}
	if(CONTENT.length > 499){
		modalInfo("내용을 500자 이내로 작성해주세요.");
		return false;
	}
	if(BOARD_DIVISION === "선택" || BOARD_DIVISION === null){
		modalInfo("구분을 선택해주세요.");
		return false;
	}
	
	let callUrl = "/board/list/Insert";
	let callBackFunc="insertIntoBoard";
	let objParam = {
		GROUP_ORDER : 0, // 그룹 순서, 게시글은 0부터
		WRITER : WRITER, // 글 작성자
		TITLE : TITLE,	// 글 제목
		CONTENT : CONTENT, // 글 내용
		DIVISION : DIVISION, // 01:QnA 02:FAQ 03:서비스공지
		USER_NO : USERNO, // 유저 번호
		OPEN_YN : OPEN_YN, // 공개여부(QnA를 제외하고는 모두 공개)
		BOARD_DIVISION : BOARD_DIVISION //구분
		
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function insertIntoBoard(result){
	if(result.resultCode == 0){
			$(location).attr("href", "<c:url value='/m/board/qa/index' />");
	}else{
		modalInfo("게시글 등록 중 오류가 발생했습니다.");
	}
}

</script>

<div class="subBox">
    <header>
        <h4>글쓰기</h4>
    </header>
    <div class="contentArea">
        <div class="mArticleArea">
            <article class="m-modalGrid">
                <ul class="item vertical">
                   <%--  <li>
                        <div class="fwBox">
                            <span class="ft">회원 ID</span>
                            <div class="input">
                                <input type="text" value="${User.USER_ID}" readonly> 
                            </div>
                        </div>
                    </li> --%>
                    <li>
                        <div class="fwBox">
                            <span class="ft">회원명</span>
                            <div class="input">
                                <input type="text" id="WRITER" value="${User.USER_NM}" readonly>
                            </div>
                        </div>
                    </li>
                    <li>
                        <!-- <div class="fwBox">
                            <span class="ft">작성일</span>
                            <div class="input">
                                <input type="text" value="" id="writeDate" readonly>
                            </div>
                        </div> -->
                    </li>
                    <li>
                        <div class="fwBox tac">
                            <label class="checkBox col-1">
                               <input type="radio" id="OPEN_Y" name="OPEN_YN" value="Y" checked>
                                <span>공개</span>
                            </label>
                            <label class="checkBox col-1">
                                <input type="radio" id="OPEN_N" name="OPEN_YN" value="N">
                                <span>비공개</span>
                            </label>
                        </div>
                    </li>
                  <!--   <li>
                        <div class="fwBox">
                            <span class="ft">비밀번호</span>
                            <div class="input">
                                <input type="password" id="passWord" placeholder="비밀번호 입력">
                            </div>
                        </div>
                    </li>
                    <li class="btn">
                        <div class="fwBox">
                            <div class="input">
                                <input type="password" id="chkPassWord" placeholder="비밀번호 재입력">
                            </div>
                        </div>
                        <div class="fwBtn wide">
                            <a href="javascript:;" class="mBtn sColorLB">확인</a>
                        </div>
                    </li> -->
                </ul>
                <ul class="item vertical hasTopLine">
                    <li class="col-2">
                        <div class="fwBox">
                            <span class="ft">제목</span>
                            <div class="input">
                                <input type="text" id="TITLE" placeholder="제목을 입력해 주세요.(50자 이내)">
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="fwBox">
                            <span class="ft">구분</span>
                            <div class="input">
                                <select id =BOARD_DIVISION>
                                </select>
                            </div>
                        </div>
                    </li>
                </ul>
            </article>
            <div class="boardContent write">
                <div><textarea id="CONTENT" class="webEditor"  style="width: 100%; height: 200px;" placeholder="내용을 입력해 주세요.(500자 이내)"></textarea></div>
            </div>

            <div class="btnArea">
                <a href="javascript:;" class="modalClose mBtn sColorLB" onclick="javascript:boardInsertFunc();">등록</a>
              <!--   <a href="javascript:;" class="modalClose mBtn sColorLB">수정</a> -->
                <a href="javascript:;" class="modalClose mBtn sColorN" onclick="location.href='/m/board/qa/index'">목록</a>
            </div>
        </div>
    </div>
</div>