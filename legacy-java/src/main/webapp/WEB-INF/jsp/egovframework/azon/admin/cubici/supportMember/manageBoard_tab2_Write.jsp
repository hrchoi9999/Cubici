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

	$("#webEditor").val('A.');
});

$(function(){
	$("#faqEnroll").on("click", function(){
		
		oEditors.getById["webEditor"].exec("UPDATE_CONTENTS_FIELD", []);
		
		let WRITER = $("#WRITER").val();
		let TITLE = $("#TITLE").val();
		let CONTENT = $("#webEditor").val();
		let DIVISION = "${DIVISION}";
		let USERNO = "${principal.admin_type}";
		let BOARD_DIVISION = $("#boardDivision option:selected").val();
		
		if(!faqVaildator(BOARD_DIVISION, TITLE)){
			return false;
		}
		
		let callUrl = "/admin/board/list/Insert";
		let callBackFunc="faqResponse";
		let objParam = {
			GROUP_ORDER : 0,
			WRITER : WRITER,
			TITLE : TITLE,
			CONTENT : CONTENT,
			DIVISION : DIVISION,
			USER_NO : USERNO,
			OPEN_YN : "Y",
			BOARD_DIVISION : BOARD_DIVISION
			
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
});

function faqVaildator(DIVISION, TITLE){
	if(DIVISION === "선택" || DIVISION === null || DIVISION === ""){
		modalInfo("구분을 선택해주세요.");
		return false;
	}
	if(TITLE === null || TITLE === "" || TITLE === undefined){
		modalInfo("제목을 입력해주세요");
		return false;
	}
	if(TITLE.length > 49){
		modalInfo("제목을 50자 이내로 작성해주세요.");
		return false;
	}
	return true;
}

function faqResponse(result){
	if(result.resultCode == 0){
		$(location).attr("href", "<c:url value='/admin/cubici/supportMember/manageBoard_tab2' />");
	}else{
		modalInfo("게시글 등록 중 오류가 발생했습니다.");
	}
}

</script>
		
<!-- Page 상단  끝 -->
<div class="c-boardSet">
	<ul class="c-boardList">
		<li>
			<label>작성자</label>
			<input id="WRITER" class="input-b input-bg" name="userName" type="text" value="${principal.username}" readonly/>
		</li>
		<li>
			<label>구분</label>
			<select id="boardDivision"></select>
		</li>
		<li>
			<label>제목</label>
			<input id="TITLE" class="input-b" name="qnaTitle" type="text" placeholder="제목을 입력해 주세요.(50자 이내)">
		</li>
		<li>
			<label>내용</label>
			<textarea class="webEditor" style="display:none;" placeholder="내용을 입력해 주세요. (500자 이내)"></textarea>
		</li>
	</ul>
    <div class="button-box">
		<button type="button" id="faqEnroll" class="bBtn2 sColorLB">등록</button>
		<button type="button" class="bBtn2 sColorLG" onclick="history.back();">목록</button>
    </div>
</div>