<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<script>
$(document).ready(function(){
	let groupNo = "${param.GROUP_NO}";
	$("#Comment").on("click", function(){
		boardDetailFunc(groupNo)
	});
});

function boardDetailFunc(groupNo){
	
	let form= $("<form></form>");
	form.attr("name", "detailForm");
	form.attr("method", "get");
	form.attr("action", "<c:url value='/admin/board/manageInquiry/write'/>");
	
	form.append($("<input />", {type: "hidden", name: "GROUP_NO", value: groupNo}));
	form.append($("<input />", {type: "hidden", name: "DIVISION", value: "01"}));
	
	form.appendTo("body");
	
	form.submit();
}

</script>
<div class="c-boardSet">
	<div class="c-boardList">
	<c:forEach var="List" items="${resultList}" varStatus="status">
		<div class="board-title border-col100 flex-end b-border-1px">
			<h5 class="item-title">${List.TITLE}</h5>
			<label for="writer" class="writer">작성자 :</label>
			<input id="writer" class="writer over-text" name="writer" type="text" value="${List.USER_NM}" readonly /><span>|</span>
			<c:if test="${status.index eq 0}">
				<label for="no" class="s-write">회원번호 :</label>
				<input id="no" class="s-writev over-text" name="no" type="text" value="${List.USER_NO}" readonly /><span>|</span>
				<label for="division" class="s-write">구분 :</label>
				<input id="division" class="writer over-text" name="division" type="text" value="${List.BOARD_DIVISION}" readonly /><span>|</span>
				<label for="open" class="s-write">공개여부 :</label>
				<input id="open" class="writer over-text" name="open" type="text" value="${List.OPEN_YN eq 'Y' ? '공개':'비공개'}" readonly /><span>|</span>
			</c:if>
			<label for="inputDate" class="text-none">작성일 </label>
			<c:choose>
				<c:when test="${not empty List.MODIFY_DATE}">
					<c:set var="date" value="${List.MODIFY_DATE}"/>
				</c:when>
				<c:otherwise>
					<c:set var="date" value="${List.REG_DATE}"/>
				</c:otherwise>
			</c:choose>
			<input id="inputDate" class="m-input-date" type="text" value="${date}" readonly />
		</div>
		<div class="text-area b-border-1px">
			${List.CONTENT}
		</div>
	</c:forEach>
	</div>
	<div class="button-box">       
		<button type="button" id="Comment" class="bBtn2 sColorLB">답변등록</button>
		<button type="button" class="bBtn2 sColorN" onclick="history.back();">목록</button>
	</div>
</div>
