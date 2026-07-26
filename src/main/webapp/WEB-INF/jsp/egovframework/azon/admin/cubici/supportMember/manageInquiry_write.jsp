<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script type="text/javascript">

$(document).ready(function(){
	let groupNo = "${param.GROUP_NO}";
	$("#qnaedit").on("click", function(){
		if("${resultList[0].COMMENT_CNT}" === "1"){
			insertComment(groupNo)
		}else if("${resultList[0].COMMENT_CNT}" === "2"){
			updateComment()
		}
	});
	
	$("textarea[name=content]").val('${fn:replace(resultList[1].CONTENT, "\'" ,"\\'")}');
});

//답변 등록
function insertComment(groupNo){
	oEditors.getById['webEditor'].exec("UPDATE_CONTENTS_FIELD", []);
	
	let CONTENT = $("#webEditor").val();

	let callUrl = "/admin/board/manageInquiry/CommentWrite";
	let callBackFunc = "insertCommentResponse";
	let objParam = {
		GROUP_NO: groupNo,
		CONTENT: CONTENT,
		DIVISION: "01",	
		USER_NO: ${principal.admin_type},
		USER_NM: "${principal.username}"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function insertCommentResponse(result){
	if(result.resultCode == 0){
		window.history.back();
	}else{
		modalInfo("답글 등록 중 오류가 발생했습니다.");
	}
}

//답변 수정
function updateComment(){	
	oEditors.getById['webEditor'].exec("UPDATE_CONTENTS_FIELD", []);
	
	let boardNo = "${resultList[1].BOARD_NO}"
	let CONTENT = $("#webEditor").val();
	
	let callUrl = "/admin/board/manageInquiry/CommentUpdate";
	let callBackFunc = "updateCommentResponse";
	let objParam = {
		BOARD_NO: boardNo,
		CONTENT: CONTENT,
		USER_NO: ${principal.admin_type},
		USER_NM: "${principal.username}"
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function updateCommentResponse(result){
	if(result.resultCode == 0){
		window.history.back();
	}else{
		modalInfo("답글 수정 중 오류가 발생했습니다.");
	}
}

</script>
<div class="c-boardSet">
	<ul class="c-boardList" id="commentEdit">
		<li>
			<label>내용</label>
			<textarea class="webEditor" name="content" style="display:none;"></textarea>
		</li>
	</ul>
	<div class="button-box" id="buttonBox">
		<button type='button' id='qnaedit' class='bBtn2 sColorLB'>확인</button>
		<button type="button" class="bBtn2 sColorN" onclick="history.back();">취소</button>
	</div>
</div>
