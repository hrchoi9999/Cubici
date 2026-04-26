<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<script type="text/javascript">

$(document).ready(function() {
	
	let selectDivision = $("#boardDivision").attr("id");
	selectMenuList(selectDivision);
	
	if(${not empty resultList}){
		let selectCode = "${resultList.BOARD_DIVISION}";
		$("#TITLE").val('${fn:replace(resultList.TITLE, "\'" ,"\\'")}');
		$("#webEditor").val('${fn:replace(resultList.CONTENT, "\'" ,"\\'")}');
		$("#boardDivision").val(selectCode).prop("selected", true);
	}
});

$(function(){
	$("#faqUpdate").on("click", function(){
		oEditors.getById["webEditor"].exec("UPDATE_CONTENTS_FIELD", []);
		
		let BOARD_NO = ${resultList.BOARD_NO};
		let TITLE = $("#TITLE").val();
		let CONTENT = $("#webEditor").val();
		let BOARD_DIVISION = $("#boardDivision option:selected").val();
		
		if(!faqVaildator(BOARD_DIVISION, TITLE)){
			return false;
		}
		
		let callUrl = "/admin/board/list/Update";
		let callBackFunc = "faqResponse";
		let objParam = {
			BOARD_NO: BOARD_NO,
			TITLE: TITLE,
			CONTENT: CONTENT,
			OPEN_YN: "Y",
			BOARD_DIVISION: BOARD_DIVISION
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
	
	$("#faqDelete").on("click", function(){
		
		let callUrl = "/admin/board/list/Delete";
		let callBackFunc = "faqResponse";
		let objParam = {
			GROUP_NO: ${resultList.GROUP_NO},
			DIVISION: ${resultList.DIVISION}
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
		modalInfo("게시글 수정 중 오류가 발생했습니다.");
	}
}

</script>

<!-- Page 상단  끝 -->
<div class="c-boardSet">
	<ul class="c-boardList">
		<li>
			<label>작성자</label>
			<input id="WRITER" class="input-b input-bg" name="userName" type="text" value="${resultList.USER_NM}" readonly/>
		</li>
		<li>
			<label>구분</label>
			<select id="boardDivision"></select>
		</li>
		<li>
			<label>제목</label>
			<input id="TITLE" class="input-b" name="qnaTitle" type="text" value="${resultList.TITLE}">
		</li>
		<li>
			<label>내용</label>
			<textarea class="webEditor" style="display:none;" placeholder="내용을 입력해 주세요. (500자 이내)"></textarea>
		</li>
	</ul>
    <div class="button-box">
		<button type="button" id="faqUpdate" class="bBtn2 sColorLB">수정</button>
		<button type="button" id="faqDelete" class="bBtn2 sColorR">삭제</button>
		<button type="button" class="bBtn2 sColorLG" onclick="history.back();">목록</button>
    </div>
</div>