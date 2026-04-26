<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script src="/resources/rudicks/js/file.js"></script>
<script type="text/javascript">
let filesArr = [];
let filesize = 0;
let fileCount = 0;
let fileid = 0;
let existfile = [];

$(document).ready(function() {
	//구분 셀렉트 박스 옵션
	let selectDivision = $("#boardDivision").attr("id");
	selectMenuList(selectDivision);
	if(${not empty resultList}){
		let selectCode = "${resultList.BOARD_DIVISION}";
		
		$("#TITLE").val('${fn:replace(resultList.TITLE, "\'" ,"\\'")}');
		$("#webEditor").val('${fn:replace(resultList.CONTENT, "\'" ,"\\'")}');
		$("#boardDivision").val(selectCode).prop("selected", true);
		$("#WRITER").val('${resultList.USER_NM}');
	}
	
	$('#file').on('change',function(){
		let files = $(this)[0].files;
		let fileHtml = '';

		if(!fileVaildator(files)){
			return false;
		}

		for(const file of files){
			let reader = new FileReader();
			reader.onload = function(){
				filesArr.push(file);
			};
			reader.readAsDataURL(file);
			
			fileHtml += '<label class="checkBox upload" id="' + fileid + '">';
			fileHtml += '<input type="checkbox" class="chkfile">';
			fileHtml += '<input type="hidden" value="' + file.size + '">';
			fileHtml += '<span style="width:auto;">' + file.name + '</span> (' + byteSize(parseInt(file.size)) + ')';
			fileHtml += '</label>';
			
			filesize += file.size;
			fileCount++;
			fileid++;
		}
		$('.input-upload').append(fileHtml);
		byteWord('.b-word');
	});
	
	fileList('notice', '${resultList.BOARD_NO}', 'noticeFileList');
});

function noticeFileList(result){
	let data = result.fileList
	let fileHtml = '';
	
	for(const fileArr of data){
		fileHtml += '<label class="checkBox" id="' + fileArr.uuid + '">';
		fileHtml += '<input type="checkbox" class="chkfile">';
		fileHtml += '<input type="hidden" value="' + fileArr.file_size + '">'
		fileHtml += '<span style="width:auto;">' + fileArr.file_name + '</span> (' + byteSize(parseInt(fileArr.file_size)) + ')';
		fileHtml += '</label>';
		
		existfile.push(fileArr.uuid);
		filesize += parseInt(fileArr.file_size);
		fileCount++;
	}
	$('.input-upload').append(fileHtml);
	byteWord('.b-word');
}

$(document).on('click', '.btn-upload-delete', function(){
	$('.chkfile:checked').each(function(){
		deletefileid = $(this).parent('label').attr('id');
		thisClass = $(this).parent('.upload').attr('id');
		size = $(this).next().val();
		
		filesize -= size;
		fileCount--
		
		if(thisClass !== undefined){
			delete filesArr[deletefileid]
		}
		
		$(this).closest('label').remove();
	});
	byteWord('.b-word');
});

$(function(){
	$('#noticeEnroll, #noticeUpdate').on('click', function(){
		let objParam = new FormData();
	
		oEditors.getById['webEditor'].exec('UPDATE_CONTENTS_FIELD', []);
		
		let WRITER = $('#WRITER').val();
		let TITLE = $('#TITLE').val();
		let CONTENT = $('#webEditor').val();
		let DIVISION = '${DIVISION}';
		let USER_NO = ${principal.admin_type};
		let BOARD_DIVISION = $('#boardDivision option:selected').val();
		let BOARD_NO = '${resultList.BOARD_NO}';
		let btnId = $(this).attr('id');
		
		if(!noticeVaildator(BOARD_DIVISION, TITLE)){
			return false;
		}
		
		if(BOARD_NO !== ''){
			BOARD_NO = parseInt(BOARD_NO);
		}
		
		let delfile = existfile;
		
		$('.input-upload').children(':not(.upload)').each(function(i){
			delfile = delfile.filter((e) => e !== $(this).attr("id"));
		});
		
		for(i = 0; i < filesArr.length; i++){
			objParam.append('file', filesArr[i]);
		}
		
		let callUrl = '';
		let data = {
				BOARD_NO : BOARD_NO,
				TITLE : TITLE,
				CONTENT : CONTENT,
				OPEN_YN : 'Y',
				BOARD_DIVISION : BOARD_DIVISION,
				delfile : delfile
			}
		let callBackFunc='noticeResponse';
		
		if(btnId === 'noticeEnroll'){
			callUrl = '/admin/board/list/file/Insert';
			data.GROUP_ORDER = 0;
			data.WRITER = WRITER;
			data.DIVISION = DIVISION;
			data.USER_NO = USER_NO;
		} else if(btnId === 'noticeUpdate'){
			callUrl = '/admin/board/list/file/Update';
		}
		objParam.append('data', new Blob([JSON.stringify(data)], {type : 'application/json'}));
		cubici.Ajax.file.fnRequest(objParam, callUrl, callBackFunc);
	});
});	

function noticeVaildator(DIVISION, TITLE){
	if(DIVISION === ""){
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

$(function(){
	$('#noticeDelete').on('click', function(){
		let objParam = {
			GROUP_NO : '${resultList.GROUP_NO}',
			DIVISION : '${resultList.DIVISION}',
			BOARD_NO : '${resultList.BOARD_NO}'
		}
		let callUrl = '/admin/board/list/Delete';
		let callBackFunc = 'noticeResponse';
		
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
});

function noticeResponse(result){
	if(result.description){
		modalInfo(result.description);
	}else if(result.resultCode == 0){
		$(location).attr("href", "<c:url value='/admin/cubici/supportMember/manageBoard_tab1' />");
	}else {
		modalInfo("게시글 등록 중 오류가 발생했습니다.");
	}
}
</script>
		
<!-- Page 상단  끝 -->
<div class="c-boardSet">
	<ul class="c-boardList">
		<li>
			<label for="userName">작성자</label>
			<input id="WRITER" class="input-b input-bg" name="userName" type="text" value="${principal.username}" readonly/>
		</li>
		<li>
			<label>구분</label>
			<select id="boardDivision"></select>
		</li>
		<li>
			<label for="TITLE">제목</label>
			<input id="TITLE" class="input-b" type="text" placeholder="제목을 입력해 주세요. (50자 이내)">
		</li>
		<li>
			<label>첨부 파일</label>
			<label for="file" class="btn-upload">파일찾기</label>
			<input id="file" type="file" multiple>
			<div class="b-word"> 총 0 KB (0개) / 2GB</div>
		</li>
		<li style="height:auto">
			<label>파일 목록</label>
			<div class="input-upload"></div>
			<button class="btn-upload-delete">파일삭제</button>
		</li>
		<li>
			<label for="CONTENT">내용</label>
			<textarea class="webEditor" style="display:none;" placeholder="내용을 입력해 주세요. (500자 이내)"></textarea>
		</li>
	</ul>
    <div class="button-box">
		<c:choose>
			<c:when test="${not empty resultList}">
				<button type="button" id="noticeUpdate" class="bBtn2 sColorLB">수정</button>
				<button type="button" id="noticeDelete" class="bBtn2 sColorR">삭제</button>
			</c:when>
			<c:otherwise>
				<button type="button" id="noticeEnroll" class="bBtn2 sColorLB">등록</button>
			</c:otherwise>
		</c:choose>
		<button type="button" class="bBtn2 sColorLG" onclick="history.back();">목록</button>
    </div>
</div>
