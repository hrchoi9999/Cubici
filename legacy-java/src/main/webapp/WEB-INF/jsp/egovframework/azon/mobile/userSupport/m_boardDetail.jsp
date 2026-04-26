<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<style type="text/css">
	.boardList_td{color: #000000; text-align:center; font-size:0.22rem; padding:2px; border-bottom:1px solid #ddd;}
	.boardList_td2{text-align:center; border-bottom:1px solid #ddd;}
	.boardList_td2 select{width:98%; text-align:center; height:3vh; font-size:0.22rem;}
	.sColorDeleteB{background: #CD5C5C; color: #fff}
	.sColorDeleteB:hover{background: #A52A2A;}
</style>

<script type="text/javascript">
//구분 셀렉트 박스 옵션

$(document).ready(function() {
	// 답변이 없을시 버튼 보여주기
	if(${resultList[0].COMMENT_CNT == 1}){
		$("#UpdateBtn").css("display", "");
		$("#DeleteBtn").css("display", "");
	}
	//구분 셀렉트 박스 옵션
	let selectDivision = $("#boardDivision").attr("id");
	selectMenuList(selectDivision);
	
	//셀렉트 박스 선택
	$("#boardDivision").val("${resultList[0].BOARD_DIVISION}").prop("selected", true);
	
	//textarea <br> 치환
	let textareaInsert = '${resultList[0].CONTENT}';
	textareaInsert = textareaInsert.replaceAll("<br>", "\r\n");
	//textarea 값 넣기
	$("#CONTENT").html(textareaInsert);
});

//게시글 수정
function boardUpdate(groupNo){
	
	if($("#replyCheck").val() != undefined){
		modalInfo("답글이 달려 수정이 불가합니다.");
		return false;
	}

	let BOARD_NO = ${ORIGINAL_BOARD_NO};
	let TITLE = $("#TITLE").val();
	let CONTENT = $("#CONTENT").val();
	let OPEN_YN = $(':radio[name="OPEN_YN"]:checked').val();
	let BOARD_DIVISION = $("#boardDivision").val();
	CONTENT = CONTENT.replace(/(?:\r\n|\r|\n)/g, '<br>');
	
	if(TITLE === null || TITLE === "" || TITLE === undefined){ // 글자수 제한 추가
		modalInfo("제목을 입력해주세요");
		return false;
	}
	if(CONTENT === null || CONTENT === "" || CONTENT === undefined){
		modalInfo("내용을 입력해주세요");
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
	 
}

function updateBoardContent(result){
		if(result.cntResultCode == 25){
			modalInfo("답글이 달려 수정이 불가합니다.")
		}else if(result.resultCode == 0){
			$(location).attr("href", "<c:url value='/m//board/qa/index' />");
		}else{
			modalInfo("게시글 수정 중 오류가 발생했습니다.");
		}
}

// 게시글 삭제
function boardDelete(groupNo){
	
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
	
}

function deleteBoardContent(result){
	if(result.cntResultCode == 25){
		modalInfo("답글이 달려 삭제가 불가합니다.")
	}else if(result.resultCode == 0){
		$(location).attr("href", "<c:url value='/m/board/qa/index' />");
	}else{
		modalInfo("게시글 삭제 중 오류가 발생했습니다.");
	}
}



</script>

<!-- Page 상단  끝 -->
<div>
	<div style=" font-size: 14px; text-align: left;">
		<!-- <div style="width:80%; text-align:left; font-size:20px; margin-left: auto; margin-right: auto; padding:30px 0;">Q&A</div> -->
			<table id="QnATable" style="width: 97%; font-size: 14px; border-collapse: separate; border-spacing: 0 2px; margin-left: 5px; margin-right: auto;">
				<colgroup>
					<col width="20%">
					<col width="30%">
					<col width="20%">
					<col width="30%">
				</colgroup>
					<tbody>
						<c:choose>
							<c:when test="${selfFlag eq 'self' && resultList[0].COMMENT_CNT == 1}">
								<c:forEach var="list" items="${resultList}" begin="0" end="0">
									<tr>
										<td class="boardList_td" style ="height:5vh; border-top:1px solid #ddd;">작성자</td>
										<td class="boardList_td2" colspan=3 style="border-top:1px solid #ddd;">
											<input type="text" id="WRITER" value="${list.USER_NM}" style="width: 98%; height:3vh; background-color: #e2e2e2; border: 0.01px solid #000000; padding:5px 10px; font-size:0.22rem;" readonly>
										</td>
									</tr>
									<tr>
										<td class="boardList_td" style ="height:5vh;">공개 여부</td>
										<td class="boardList_td2" colspan=3>
												<input type="radio" id="OPEN_Y" name="OPEN_YN" value="Y" <c:if test="${list.OPEN_YN eq 'Y'}" >checked</c:if> />
												<label for="OPEN_Y" style="cursor:pointer; padding-right:20px; font-size:0.22rem;">공개</label>
												<input type="radio" id="OPEN_N" name="OPEN_YN" value="N" <c:if test="${list.OPEN_YN eq 'N'}" >checked</c:if> />
												<label for="OPEN_N" style="cursor:pointer; font-size:0.22rem;">비공개</label>
										</td>
									<tr>
									<tr>
										<td class="boardList_td" style ="height:5vh;">구분</td>
										<td class="boardList_td2" colspan=3>
											<select id=boardDivision></select>
										</td>
									</tr>
										<td class="boardList_td" style ="height:5vh;">제목</td>
										<td class="boardList_td2" colspan=3>
											<input type="text" id="TITLE" value="${list.TITLE}" style="width: 98%; height:3vh; padding:5px 10px; border: 0.01px solid #000000; font-size:0.22rem;" placeholder="제목을 입력해 주세요.(50자 이내)">
										</td>
									</tr>
									<tr>
										<td class="boardList_td2" style="padding:3px 0;" colspan=4>
											<textarea id="CONTENT" rows="10" style="width: 98%; resize: none; padding:10px 10px; font-size:0.22rem;" placeholder="내용을 입력해 주세요.(500자 이내)"></textarea>
										</td>
									</tr>
								</c:forEach>
							</c:when>
							<c:otherwise>
								<c:forEach var="list" items="${resultList}" begin="0" end="0">
									<tr>
										<td colspan="4" style="font-size:15px; padding:10px 0 10px 0px;  border-top:1.5px solid #ddd;">${list.TITLE}<br>
											<span style="font-size:10px; color:#A9A9A9;" >작성자:${list.USER_NM} &nbsp;&nbsp;|&nbsp;&nbsp; 등록일:${list.REG_DATE}</span>
										</td>
									</tr>
									<tr>
										<td colspan="4" valign="top" align="left" style="border-bottom:1.5px solid #696969; text-align: left; padding:10px 0 0 0; border-top:1px solid #ddd;  font-size:8px;">
											<div style="min-height:150px">
												${list.CONTENT}
											</div>
										</td>
									</tr>
								</c:forEach>
							</c:otherwise>
						</c:choose>
						
						<!-- 게시글 답변 -->
						<c:forEach var="commentList" items="${resultList}" begin="1">
							<tr class ="commentNum" >
								<td colspan=4 style="font-size:15px; padding:10px 0 10px 0;">└ 답변<br>
									<span style="font-size:10px; color:#A9A9A9;" >작성자:${commentList.USER_NM} &nbsp;&nbsp;|&nbsp;&nbsp; 등록일:${commentList.REG_DATE}</span>
								</td>
							<tr class ="commentNum">
								<td colspan=4 id="replyCheck" class="boardList_td2" valign="top" align="left" style="text-align: left; padding:10px 0 0 0; border-top:1px solid #ddd; border-bottom:1.5px solid #ddd;  font-size:8px;">
									<div style="min-height:150px">
										${commentList.CONTENT}
									</div>
								</td>
							</tr>
						</c:forEach>
					</tbody>
				</table>
				<div style=" margin: auto; text-align: center; padding-top:15px;">
					<c:if test="${selfFlag eq 'self' && resultList[0].COMMENT_CNT == 1}">
						<button type="button" id="UpdateBtn" class="sBtn rBtn sColorLB" style="display:none; font-size: 0.22rem; padding:0.29rem; line-height: 0.07rem;" onclick="boardUpdate('${resultList[0].GROUP_NO}');">수정</button>
						<button type="button" id="DeleteBtn" class="sBtn rBtn sColorDeleteB" style="display:none; font-size: 0.22rem; padding:0.29rem; line-height: 0.07rem;" onclick="boardDelete('${resultList[0].GROUP_NO}');">삭제</button>
					</c:if>
					<button type="button" style="font-size: 0.22rem; padding:0.29rem;line-height: 0.07rem;" class="sBtn rBtn sColorLG" onclick="history.back();">목록</button>
				</div>
		</div>
</div>
									
