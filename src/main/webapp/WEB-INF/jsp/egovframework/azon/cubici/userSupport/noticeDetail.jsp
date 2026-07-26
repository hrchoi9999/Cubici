<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<script src="/resources/rudicks/js/file.js"></script>
<script>
$(document).ready(function(){
	fileList('notice', '${param.BOARD_NO}', 'noticeFileList');
})

$(document).on('click', '.f-label', function(){
	$(this).children('.f-underline').addClass('f-active');
	
	let uuid = $(this).attr('id');
	let objParam = {
		uuid : uuid,
		enc_type : 'N'
	}
	let callUrl = "/file/download";
	cubici.Ajax.download.fnRequest(objParam, callUrl);
});

function noticeFileList(result){
	let data = result.fileList
	let fileHtml = '';
	
	for(const fileArr of data){
		fileHtml += '<tr><td>'
		fileHtml += '<label class="f-label" id="' + fileArr.uuid + '"><span class="oiBtn download f-pointer"></span>';
		fileHtml += '<span class="f-pointer f-underline">' + fileArr.file_name + '</span></label>'
		fileHtml += '<span class="gcspan">' + byteSize(parseInt(fileArr.file_size));
		fileHtml += '</td></tr>';
	}
	$('.file-table').append(fileHtml);
}
</script>
<!-- Page 상단  끝 -->
<div class="c-boardSet">
	<div class="c-boardList">
		<div class="board-title border-col100 flex-end b-border-1px">
			<h5 class="item-title">${resultList.title}</h5>
			<label for="writer" class="writer">작성자 :</label>
			<input id="writer" class="writer over-text" name="writer" type="text" value="${resultList.user_nm}" readonly /><span>|</span>
			<label for="inputDate" class="text-none">등록일 </label>
			<input id="inputDate" class="input-date" type="text" value="${resultList.reg_date}" readonly />
		</div>
		<table class="file-table"></table>
		<div class="text-area b-border-1px">
			${resultList.content}
		</div>
		<div class="button-box">
			<button type="button" class="bBtn2 sColorN" onclick="history.back();">목록</button>
		</div>
	</div>
</div>
