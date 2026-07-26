<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<script src="/resources/js/views/admin/mail.js"></script>
<script type="text/javascript">

let smsHtml = ""; 

$(document).ready(function() {
	let selectDivision = $("#SMSMenu").attr("id");
	selectMenuList(selectDivision)
	
	$("#SMSMenu").on("change", function(){
		let selectMenu = $("#SMSMenu option:selected").val();
		selectDvisionFunc(selectMenu);
	}) 
	
	if(${not empty resultList}){
		$("#SMSMenu").val("${resultList.SMS_MENU}").prop("selected", true);
		$("#SMSKey").val("${resultList.SMS_KEY}").prop("selected", true);
		$("#SMSKey").attr("disabled", true);
		$("#SMSCode").val("${resultList.SMS_CODE}");
		$("#SMSCode").attr("readonly", true); 
		$("#SMSItem").val("${resultList.SMS_ITEM}");
		$("#TITLE").val('${fn:replace(resultList.SMS_TITLE, "\'" ,"\\'")}');
		$("#webEditor").val('${fn:replace(resultList.SMS_CONTENT, "\'" ,"\\'")}');
		
		let selectMenu = $("#SMSMenu option:selected").val();
		let selectCode = "${resultList.SMS_DIVISION}";
		
		selectDvisionFunc(selectMenu);
		
		$(".selectDivision").eq(1).val(selectCode).prop("selected", true);
		("${resultList.SMS_MODIFY_USER_NM}" == "") ? $("#WRITER").val("${resultList.SMS_REG_USER_NM}") : $("#WRITER").val("${resultList.SMS_MODIFY_USER_NM}");
	}
	("${resultList.SMS_KEY}" === "00") ? $("#TITLE").text("요약") : $("#TITLE").text("제목");
});

function selectDvisionFunc(selectMenu){
	switch(selectMenu){
		case "CB":
			$('.selectDivision')[1].id = 'SMSCubici';
			break;
		case "MB":
			$('.selectDivision')[1].id = 'SMSMoneyBank';
			break;
		case "TH":
			$('.selectDivision')[1].id = 'SMSEtc';
			break;
	}
	selectDivision = $('.selectDivision').eq(1).attr("id");
	selectMenuList(selectDivision);
}

$(function(){
	$("#SMSEnroll, #SMSUpdate, #SMSDelete").on("click", function(e){
		oEditors.getById["webEditor"].exec("UPDATE_CONTENTS_FIELD", []);
		
		WRITER = $("#WRITER").val();
		SMSKey = $("#SMSKey").val();
		SMSCode = $("#SMSCode").val();
		SMSMenu = $("#SMSMenu").val();
		SMSDivision = $('.selectDivision').eq(1).val();
		SMSItem = $("#SMSItem").val();
		TITLE = $("#TITLE").val();
		CONTENT = (SMSKey == '01') ? $("#webEditor").val() : replaceSmsContent($("#webEditor").val());
		SEND_CONTENT = $("#webEditor").val().replace(/\n/g, "");
		SMSeventId = $(e.target).attr("id");
		
		if(!(SMSeventId === "SMSDelete")){
			if(!SMSValidate(SMSKey, SMSDivision, SMSCode, TITLE, SMSItem, CONTENT, SMSMenu, SEND_CONTENT)){
				return false;
			}
		}
		
		let callUrl = "";
		let objParam = {
			SMS_KEY : SMSKey,
			SMS_CODE : SMSCode,
			SMS_MENU : SMSMenu,
			SMS_DIVISION : SMSDivision,
			SMS_ITEM : SMSItem,
			SMS_TITLE : TITLE,
			SMS_CONTENT : CONTENT,
			SMS_SEND_CONTENT : SEND_CONTENT,
			SMS_REG_USER_NM : WRITER
		}
		let callBackFunc="smsResponse";
		
		switch(SMSeventId){
			case "SMSEnroll":
				callUrl = "/admin/sms/insert";
				break;
			case "SMSUpdate":
				if(SMSKey !== "${resultList.SMS_KEY}"){
					modalInfo("분류는 수정이 불가능합니다.");
					return false;
				}
				objParam.SMS_NO = "${resultList.SMS_NO}"
				callUrl = "/admin/sms/update";
				break;
			case "SMSDelete":
				objParam = {
					SMS_NO: "${resultList.SMS_NO}",
					SMS_KEY: "${resultList.SMS_KEY}"
				}
				callUrl = "/admin/sms/delete";
				break;
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
	
	$("#SMSKey").change(function(){
		let SMSKey = $("#SMSKey").val();
		let smsFormBtnHtml = "";
		
		if (SMSKey == "00"){
			oEditors.getById["webEditor"].exec("SET_IR", [""]); // 에디터 내에 있는 내용 삭제
			$("#TITLE").text("요약");
		}else if(SMSKey == "01"){
			$("#SMSItem").parents("li").after(smsFormBtnHtml);
			$("#TITLE").text("제목");
			oEditors.getById["webEditor"].exec("SET_IR", [""]);
			oEditors.getById["webEditor"].exec("PASTE_HTML", [mailHtml]);
		}
	});
});

function replaceSmsContent(data) {
	return data.replace(/<\/p>/g, '\n').replace(/<[^>]*>?/g, '').replace(/&nbsp;/g, '');
}

function SMSValidate(SMSKey, SMSDivision, SMSCode, TITLE, SMSItem, CONTENT, SMSMenu, SEND_CONTENT){
	if(SMSKey === null || SMSKey === "선택" || SMSKey === undefined ){
		modalInfo("분류를 선택해주세요.");
		return false;
	}
	if(SMSMenu === null || SMSMenu === "" || SMSMenu === undefined ){
		modalInfo("메뉴를 선택해주세요.");
		return false;
	}
	if(SMSDivision === null || SMSDivision === "" || SMSDivision === undefined ){
		modalInfo("구분을 선택해주세요.");
		return false;
	}
	if(isNaN(parseInt(SMSCode)) || SMSCode.length == 1){
		modalInfo("두 자릿수 숫자 SMS코드를 입력해주세요.");
		return false;
	}
	if(SMSItem === null || SMSItem === "" || SMSItem === undefined){
		modalInfo("항목을 입력해주세요.");
		return false;
	}
	if(SMSItem.length > 30){
		modalInfo("항목을 30자 이내로 작성해주세요.");
		return false;
	}
	if(TITLE === null || TITLE === "" || TITLE === undefined){
		modalInfo("제목을 입력해주세요");
		return false;
	}
	if(TITLE.length > 30){
		modalInfo("제목을 50자 이내로 작성해주세요.");
		return false;
	}
	if(CONTENT === null || CONTENT === "" || CONTENT === undefined || CONTENT === "<p><br></p>"){
		modalInfo("글 내용을 입력해주세요.");
		return false;
	}
	if(!(SEND_CONTENT)){
		modalInfo("메일 형식이 올바르지 않습니다.");
		return false;
	}
	return true;
}

function smsResponse(result){
	if(result.CheckResultCode == 25){
		modalInfo("중복된 SMS코드 입니다. 다른 코드를 입력해주세요")
	}else if(result.resultCode == 0){
		if(result.FormCheck == "00"){
			$(location).attr("href", "<c:url value='/admin/cubici/supportMember/manageSms' />");
		}else if(result.FormCheck == "01"){
			$(location).attr("href", "<c:url value='/admin/cubici/supportMember/manageEmail' />");
		}
	}else{
		modalInfo("게시글 등록 중 오류가 발생했습니다.");
	}
}

</script>
		
<div class="c-boardSet">
	<ul class="c-boardList">
		<li>
			<label for="WRITER">작성자</label>
			<input id="WRITER" class="input-b input-bg" type="text" value="${principal.username}" readonly/>
		</li>
		<li>
			<label>분류</label>
			<select id="SMSKey">
				<option value="선택"> 선택 </option>
				<option value="00">문자 </option>
				<option value="01">메일 </option>
			</select>
		</li>
		<li>
			<label for="SMSMenu">메뉴</label>
			<select class="selectDivision" id="SMSMenu"></select>
			<label for="smsDivision">구분</label>
			<select class="selectDivision" id="smsDivision"></select>
		</li>
		<li>
			<label>SMS코드</label>
			<input id="SMSCode" class="input-b"  type="text" placeholder="두자리수 코드 숫자만 넣어주세요" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
		</li>
		<li>
			<label>항목</label>
			<input id="SMSItem" class="input-b" type="text" placeholder="항목을 입력해 주세요.(30자 이내)">
		</li>
		<li>
			<label>제목</label>
			<input id="TITLE" class="input-b" type="text" placeholder="내용을 입력해 주세요.(50자 이내)">
		</li>
		<li>
			<label for="webEditor">내용</label>
			<textarea class="webEditor" name="webEditor" style="display:none;" placeholder="내용을 입력해 주세요. (500자 이내)"></textarea>
		</li>
	</ul>
    <div class="button-box">
   		<c:choose>
			<c:when test="${not empty resultList}">
				<button type="button" id="SMSUpdate" class="bBtn2 sColorLB">수정</button>
				<button type="button" id="SMSDelete" class="bBtn2 sColorR">삭제</button>
			</c:when>
			<c:otherwise>
				<button type="button" id="SMSEnroll" class="bBtn2 sColorLB">등록</button>
			</c:otherwise>
		</c:choose>
		<button type="button" class="bBtn2 sColorLG" onclick="history.back();">목록</button>
    </div>
</div>
           