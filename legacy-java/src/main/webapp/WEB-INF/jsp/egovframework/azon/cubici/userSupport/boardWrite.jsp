<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>


<script type="text/javascript">
$(document).ready(function() {
	let selectDivision = $("#boardDivision").attr("id");
	selectMenuList(selectDivision);
	
	$("#boardInsert").on("click", function(){
		oEditors.getById['text-area webEditor'].exec("UPDATE_CONTENTS_FIELD", []);
		
		let WRITER = $("#WRITER").val();
		let TITLE = $("#TITLE").val();
		let CONTENT = $(".webEditor").val();
		let DIVISION = "${DIVISION}";
		let USERNO = "${principal.user_no}";
		let BOARD_DIVISION = $("#boardDivision").val();
		let OPEN_YN = $(':radio[name="OPEN_YN"]:checked').val();

		if(!boardValidator(TITLE, BOARD_DIVISION)){
			return false;
		}
		
		let callUrl = "/board/list/Insert";
		let callBackFunc="insertIntoBoard";
		let objParam = {
			GROUP_ORDER : 0,
			WRITER : WRITER,
			TITLE : TITLE,
			CONTENT : CONTENT,
			DIVISION : DIVISION,
			USER_NO : USERNO,
			OPEN_YN : OPEN_YN,
			BOARD_DIVISION : BOARD_DIVISION
		}
		
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
});

function insertIntoBoard(result){
	if(result.resultCode == 0){
			$(location).attr("href", "<c:url value='/board/qa/index' />");
	}else{
		modalInfo("게시글 등록 중 오류가 발생했습니다.");
	}
}

function boardValidator(TITLE, BOARD_DIVISION){
	if(TITLE === null || TITLE === "" || TITLE === undefined){
		modalInfo("제목을 입력해주세요.");
		return false;
	}
	if(TITLE.length > 49){
		modalInfo("제목을 50자 이내로 작성해주세요.");
		return false;
	}
	if(BOARD_DIVISION === "" || BOARD_DIVISION === null){
		modalInfo("구분을 선택해주세요.");
		return false;
	}
	return true;
}
</script>
		
<!-- Page 상단  끝 -->
<div class="c-boardSet">
	<ul class="c-boardList">
		<li>
			<label>작성자</label>
			<input id="WRITER" class="input-b input-bg" name="userName" type="text" value="${principal.username}"/>
		</li>
		<li>
			<fieldset>
				<legend>공개여부</legend>
				<span>공개여부</span>
				<input id="OPEN_Y" type="radio" name="OPEN_YN" value="Y" checked>
				<label for="OPEN_Y" class="checkBox"> 공개</label>
				<input id="OPEN_N" type="radio" name="OPEN_YN" value="N">
				<label for="OPEN_N" class="checkBox">비공개 </label>
			</fieldset>
		</li>
		<li>
			<label>구분</label>
			<select id="boardDivision"></select>
		</li>
		<li>
			<label>제목</label>
			<input id="TITLE" class="input-b" name="qnaTitle" type="text" placeholder="제목을 입력해 주세요. (50자 이내)">
		</li>
		<li>
			<label>내용</label>
			<textarea id="text-area webEditor" class="text-area webEditor" style="display:none;" placeholder="내용을 입력해 주세요. (500자 이내)"></textarea>
		</li>
	</ul>
    <div class="button-box">
		<button type="button" class="bBtn2 sColorLB" id="boardInsert">등록</button>
		<button type="button" class="bBtn2 sColorN" onclick="location.href='/board/qa/index'">취소</button>
    </div>
</div>