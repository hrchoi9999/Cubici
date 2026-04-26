<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script>

$(document).ready(function() {
	//textarea > smarteditor
	if("${selfFlag}" == "self" && ${resultList[0].COMMENT_CNT == 1}){
		let selectDivision = $("#boardDivision").attr("id");
		selectMenuList(selectDivision);
		
		$("#boardDivision").val("${resultList[0].BOARD_DIVISION}").prop("selected", true);
		$("#open_"+"${resultList[0].OPEN_YN}").prop("checked", true);
		$("#title").val('${fn:replace(resultList[0].TITLE, "\'" ,"\\'")}');
		$("textarea[name=content]").val('${fn:replace(resultList[0].CONTENT, "\'" ,"\\'")}');

		buttonBox();
	}else{
		$("#writerUser").val("${resultList[0].USER_NM}");
		$("#reg_date").val("${resultList[0].REG_DATE}");
		$("#title").html('${fn:replace(resultList[0].TITLE, "\'" ,"\\'")}');
		$("#content").html('${fn:replace(resultList[0].CONTENT, "\'" ,"\\'")}');
	}

	if(${resultList[0].COMMENT_CNT == 2}){
		let replyHtml = "";
		
		replyHtml += '<div class="reply"><span>답변완료</span></div>';
		replyHtml += '<div class="text-area">${resultList[1].CONTENT}</div><div>';
		replyHtml += '<label class="writer">작성자 :</label><input class="writer over-text input-op" type="text" value="${resultList[1].USER_NM}" readonly />';
		replyHtml += '<span>|</span>';
		replyHtml += '<label class="text-none">등록일 </label><input class="input-date input-op" type="text" value="${resultList[1].REG_DATE}" readonly /></div>';
		
		$("#reply-box").html(replyHtml);
	}
	
});

function buttonBox(){
	let buttonHtml = "";
	
	buttonHtml += "<button type='button' id='UpdateBtn' class='bBtn2 sColorLB'>수정</button>";
	buttonHtml += "<button type='button' id='DeleteBtn' class='bBtn2 sColorR'>삭제</button>";
	
	$("#buttonBox").prepend(buttonHtml);
}

$(document).on("click", "#UpdateBtn", function(){
	oEditors.getById['text-area webEditor'].exec("UPDATE_CONTENTS_FIELD", []);
	
	if($("#replyCheck").val() != undefined){
		modalInfo("답글이 달려 수정이 불가합니다.");
		return false;
	}
	
	let BOARD_NO = "${resultList[0].BOARD_NO}";
	let TITLE = $("#title").val();
	let CONTENT = $("textarea[name=content]").val(); //글 내용
	let OPEN_YN = $(':radio[name="open_yn"]:checked').val();
	let BOARD_DIVISION = $("#boardDivision").val();
	let groupNo = "${param.GROUP_NO}";
	
	if(!boardValidator(TITLE, BOARD_DIVISION)){
		return false;
	}
	
	let callUrl = "/board/list/Update";
	let callBackFunc = "updateBoardContent";
	let objParam = {
		BOARD_NO : BOARD_NO,
		TITLE : TITLE,
		CONTENT : CONTENT,
		OPEN_YN : OPEN_YN,
		GROUP_NO: groupNo,
		DIVISION: "01",
		BOARD_DIVISION : BOARD_DIVISION
	}

	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function updateBoardContent(result){
	if(result.cntResultCode == 25){
		modalInfo("답글이 달려 수정이 불가합니다.")
	}else if(result.resultCode == 0){
		$(location).attr("href", "<c:url value='/board/qa/index' />");
	}else{
		modalInfo("게시글 수정 중 오류가 발생했습니다.");
	}
}

function boardValidator(TITLE, BOARD_DIVISION){
	if(TITLE === null || TITLE === "" || TITLE === undefined){
		modalInfo("제목을 입력해주세요");
		return false;
	}
	if(TITLE.length > 49){
		modalInfo("제목을 50자 이내로 작성해주세요.");
		return false;
	}
	if(BOARD_DIVISION === null || BOARD_DIVISION === "" || BOARD_DIVISION === undefined){ 
		modalInfo("구분을 선택해주세요.");
		return false;
	}
	return true;
}

$(document).on("click", "#DeleteBtn", function(){
	let groupNo = "${param.GROUP_NO}";
	
	if($("#replyCheck").val() != undefined){
		modalInfo("답글이 달려 삭제가 불가합니다.");
		return false;
	}

	let callUrl = "/board/list/Delete";
	let callBackFunc = "deleteBoardContent";
	let objParam = {
		GROUP_NO: groupNo,
		DIVISION: "01"
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function deleteBoardContent(result){
	if(result.cntResultCode == 25){
		modalInfo("답글이 달려 삭제가 불가합니다.")
	}else if(result.resultCode == 0){
		$(location).attr("href", "<c:url value='/board/qa/index' />");
	}else{
		modalInfo("게시글 삭제 중 오류가 발생했습니다.");
	}
}

</script>

<!-- Page 상단  끝 -->
<div class="c-boardSet">
	<c:choose>
		<c:when test="${selfFlag eq 'self' && resultList[0].COMMENT_CNT == 1}">
			<ul class="c-boardList">
				<li>
					<label>작성자</label>
					<input id="writer" class="input-b input-bg" type="text" value="${principal.username}"/>
				</li>
				<li>
					<fieldset>
						<legend>공개여부</legend>
						<span>공개여부</span>
						<input id="open_Y" type="radio" name="open_yn" value="Y">
						<label for="open_Y" class="checkBox"> 공개</label>
						<input id="open_N" type="radio" name="open_yn" value="N">
						<label for="open_N" class="checkBox">비공개 </label>
					</fieldset>
				</li>
				<li>
					<label>구분</label>
					<select id="boardDivision"></select>
				</li>
				<li>
					<label>제목</label>
					<input id="title" class="input-b" type="text">
				</li>
				<li>
					<label>내용</label>
					<textarea class="text-area webEditor" name="content" style="display:none;"></textarea>
				</li>
			</ul>
		</c:when>
		<c:otherwise>
			<div class="c-boardList">
				<div class="board-title flex-end b-border-1px">
					<h5 class="item-title" id="title"></h5>
					<label class="writer">작성자 :</label>
					<input class="writer over-text" type="text" id="writerUser" readonly />
					<span>|</span>
					<label class="text-none">등록일 </label>
					<input class="input-date" type="text" id="reg_date" readonly />
				</div>
				<div class="qna-area">
					<div class="question flex-col" id="content"></div>
			</div>
		</c:otherwise>
	</c:choose>
	<!-- 게시글 답변 -->
		<div class="reply-box" id="reply-box"></div>
	<div class="button-box" id="buttonBox">       
		<button type="button" class="bBtn2 sColorN" onclick="history.back();">목록</button>
	</div>
	</div>
</div>