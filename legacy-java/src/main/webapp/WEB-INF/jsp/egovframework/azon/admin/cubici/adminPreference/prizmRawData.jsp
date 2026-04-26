<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<script>
$(document).ready(function(){
	// 구분 셀렉트 박스 옵션
	let selectDivision = $("#RawDataTable").attr("id");
	selectMenuList(selectDivision); // 메뉴 select box
	selectDivision = $("#shopList").attr("id");
	selectMenuList(selectDivision);

	$("#RawDataTable").on("change", RawDataTable);//테이블 셀렉트 박스
	$("#colList").on("change", colList);//테이블 칼럼 셀렉트박스
	$("#deleteValue").on("click", deleteValue);//행삭제 버튼
	$("#resetValue").on("click", resetValue);//목록 초기화 버튼
	$("#colTypeValue").on("change", colTypeChange);//타입 라디오 변환
	$("#calculListValue").on("change", calculValue);//계산식 라디오 변환
	$("#calculEnrollModalBtn, #calculDetailModalBtn").on("click", calculModal);//계산식 등록 및 수정 버튼
	$("#excelBtn").on("click", doExcelDownloadProcess);
	
});
$(document).on("click",".modalClose", modalDataClose);//비동기 모달 닫기

function RawDataTable(){
	if($("#RawDataTable option:selected").val() == "") {
		$("#colList").empty();
		$("#colListValue").empty();
		$("#colTypeValue").empty();
		$("#calculListValue").empty();
		$("#tableName").text("테이블을 선택해 주세요")
		return;
	}
	$("#colListValue").empty();
	$("#calculListValue").empty();
	let tableNameText = $("option:selected", this).text();
	let tableNameValue = $(this).val();
	let tableType = ["sale", "settlement", "return", "goods", "stock", "withdraw"];
	let tableTypeValue = "";
	let typeDivision = 0;
	
	tableColList(tableNameValue);
	$("#tableName").text(tableNameText);
	
	for(let i = 0, len = tableType.length; i < len; i++){
		typeCount = tableNameValue.indexOf(tableType[i].toUpperCase());
		if(typeCount !== -1){
			tableTypeValue = tableType[i];
		}
	}
	
	switch(tableTypeValue){
		case "sale":
			typeDivision = "00";
			break;
		case "return":
			typeDivision = "01";
			break;
		case "withdraw": case "settlement":
			typeDivision = "02";
			break;
		case "goods":
			typeDivision = "03";
			break;
		case "stock":
			typeDivision = "04";
			break;
	}
	
	let objParam = {
			flag : "type",
			raw_data_division : typeDivision,
			selectedId : "#colTypeValue"
	}
	rawDataList(objParam);
	
	if(!shopListCheck()){
		modalInfo("테이블을 선택해 주세요.");
		return;
	}
}

function tableColList(tableNameValue){
	let callUrl = "/admin/cubici/adminPreference/rawDataList";
	let callBackFunc = "tableColListResponse";
	let objParam = {
			flag : "colList",
			table_name : tableNameValue
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function tableColListResponse(result){
	let colListHtml = '<option value = ""> 선택 </option>';
	let colList = result.List;
	
	if(result.resultCode === 0){
		for (let i = 0, len = colList.length; i < len; i++){
			colValue = colList[i]
			colListHtml += '<option value = "' + colValue.column_name + '">' + colValue.column_comment + '</option>'
		}
		$("#colList").html(colListHtml);
	}
}

function colList(){
	if($(this).val() == "") return
	let colId = $(this).val();
	let colText = $("option:selected", this).text();
	let liHtml = '<li><label><input type="radio" name="colvalue"><span id="' + colId + '"><b>' + colText + '</b></span></label></li>';
	let validCheck = $("#colListValue").find("#" +colId).attr("id");
	
	(typeof validCheck != "undefined") ? modalInfo("중복된 칼럼입니다.") : $("#colListValue").append(liHtml);
}

function deleteValue(){
	colDeleteId = $("#colListValue").find("input[name=colvalue]:checked").next().attr("id");
	if(typeof colDeleteId == "undefined")modalInfo("행을 선택해주세요");
	$("#"+colDeleteId).closest("li").remove();
}

function resetValue(){
	colResetValue = $("#colListValue").html();
	(colResetValue == "") ? modalInfo("초기화할 목록이 없습니다.") : $("#colListValue").empty();
}

function colTypeChange(){
	typeId = $("#colTypeValue").find("input[name=typevalue]:checked").next().attr("id");
	shopValue = $("#checkShop").val();
	
	let objParam = {
			flag : "calcul",
			raw_data_division : "05",
			raw_data_id : typeId,
			raw_data_shop : shopValue,
			selectedId : "#calculListValue"
	}
	rawDataList(objParam)
}

function calculValue(){
	let calculId = $("#calculListValue").find("input[name=calculvalue]:checked").next().attr("id");
	let selectedId = ""
	
	if(typeof calculId === "undefined" ) return false;
	($(this).attr("id") == "calculListValue") ? selectedId = "#calculDetail" : selectedId = "modalDetail";
	
	let objParam = {
			flag : "content",
			raw_data_division : "05",
			raw_data_no : calculId,
			selectedId : selectedId
	}
	rawDataList(objParam)
}

function calculModal(){
	let modalId = $(this).attr("id");
	let colTypeCheck = $("#colTypeValue").find("input[name=typevalue]:checked").val();
	let btnDetail = "<a href='javascript:;' class='mBtn sColorLB' id='calculUpdate'>수정</a><a href='javascript:;' class='mBtn sColorR' id='calculDelete'>삭제</a>";
	let btnEnroll = "<a href='javascript:;' class='mBtn sColorLB' id='calculEnroll'>등록</a>";
	let btnHtml = "";
	
	if(!shopListCheck()){
		modalInfo("테이블을 선택해 주세요.");
		return;
	}
	
	if(colTypeCheck == null || colTypeCheck == undefined || colTypeCheck == ""){
		modalInfo("선택된 타입이 없습니다.");
		return;
	}
	
	if(modalId == "calculDetailModalBtn") {
		if(typeof calculValue() !== "undefined"){
			modalInfo("수정할 계산식을 선택해 주세요.");
			return;
		}
	}
	modalOpen("calculModal");
	(modalId === "calculDetailModalBtn") ? btnHtml = btnDetail : btnHtml = btnEnroll
	btnHtml += " <a href='javascript:;' class='modalClose mBtn sColorN' id='calculModalClose'>확인</a>";
	$("#calculBtn").html(btnHtml);
}

function rawDataList(objParam){
	let callUrl = "/admin/cubici/adminPreference/rawDataList";
	let callBackFunc = "rawDataListResponse";
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function rawDataListResponse(result){
	let List = result.List;
	let selectedId = result.selectedId;
	let liHtml = "";
	let nameValue = "";
	let calculId = "";

	switch(selectedId){
		case "#colTypeValue":
			nameValue = "typevalue";
			break;
		case "#calculListValue":
			nameValue = "calculvalue";
			break;
		case "#calculDetail":
			nameValue = "calculDetail";
			break;
		case "modalDetail":
			$("#calculNo").val(List[0].raw_data_no);
			$("#calculTitle").val(List[0].raw_data_title);
			$("#calculContent").val(List[0].raw_data_content);
			return;
			break;
	}

	if(result.resultCode === 0){
		for(let i = 0, len = List.length; i < len; i++){
			ListValue = List[i]
			if(selectedId == "#calculListValue")ListValue.raw_data_id = ListValue.raw_data_no;
			else if(selectedId == "#calculDetail")ListValue.raw_data_title = ListValue.raw_data_content;
			liHtml += '<li><label><input type="radio" name="' + nameValue + '"><span id="' + ListValue.raw_data_id + '"><b>' + ListValue.raw_data_title + '</b></span></label></li>';	
		}
		$(selectedId).empty(liHtml);
		$(selectedId).append(liHtml);
	}
}

//계산식 CRUD
$(document).on("click", "#calculEnroll, #calculUpdate, #calculDelete", function(e){
	
	let raw_data_id = $("#colTypeValue").find("input[name=typevalue]:checked").next().attr("id");
	let raw_data_shop = $("#shopList").val();
	let raw_data_title = $("#calculTitle").val();
	let raw_data_content = $("#calculContent").val();
	let raw_data_no = $("#calculNo").val();
	raw_data_content = raw_data_content.replace(/(?:\r\n|\r|\n)/g, '<br>');
	let calculEventId = $(this).attr("id");
	
	if(!calculCheck(raw_data_id, raw_data_shop, raw_data_title, raw_data_content)) return;
	
	let objParam = {
			raw_data_id : raw_data_id,
			raw_data_shop : raw_data_shop,
			raw_data_title : raw_data_title,
			raw_data_content : raw_data_content
	}
	let callUrl = "";
	let callBackFunc = "rawDataCalculResponse";
	switch(calculEventId){
		case "calculEnroll":
			callUrl = "/admin/cubici/adminPreference/rawDataCalculInsert";
			break;
		case "calculUpdate":
			objParam.raw_data_no = raw_data_no;
			callUrl = "/admin/cubici/adminPreference/rawDataCalculUpdate";
			break;
		case "calculDelete":
			objParam.raw_data_no = raw_data_no;
			callUrl = "/admin/cubici/adminPreference/rawDataCalculDelete";
			break;
		
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);

	btnId = "#" + calculEventId;
	
	modalDataIdClose(btnId);
});

function rawDataCalculResponse(result){
	if(result.resultCode == "0"){
		$("#calculDetail").empty();
		colTypeChange();
	}
}

function calculCheck(raw_data_id, raw_data_shop, raw_data_title, raw_data_content){
	if(raw_data_id === null || raw_data_id === "" || typeof raw_data_id === "undefined" ){
		modalInfo("타입이 선택되지 않았습니다.");
		return false;
	}
	if(raw_data_shop === null || raw_data_shop === "" || typeof raw_data_shop === "undefined" ){
		modalInfo("쇼핑몰을 선택해주세요");
		return false;
	}
	if(raw_data_title === null || raw_data_title === "" || typeof raw_data_title === "undefined" ){
		modalInfo("제목을 입력해주세요");
		return false;
	}
	if(raw_data_content === null || raw_data_content === "" || typeof raw_data_content === "undefined" ){
		modalInfo("계산식을 입력해주세요.");
		return false;
	}
	return true;
}

function shopListCheck(){
	let shopListSelected = $("#RawDataTable option:selected").text().split(" ");
	
	if(shopListSelected[0] == "") return false;

	$("#shopList").find("option").each(function(){
		let shopList = $(this).text();
		if(shopList == shopListSelected[0]){
			$("#shopList").val($(this).val());
			$("#checkShop").val($(this).val());
		}
	});
	
	return true;
}

function doExcelDownloadProcess(){
	
	let tableName = $("#RawDataTable option:selected").val();
	let tableComment = $("#RawDataTable option:selected").text();
	let objParam = {};
	let colListArray = [];
	let colListParam = {};
	
	$("#colListValue").find("span").each(function(){
		colListParam[$(this).attr("id")] = $(this).text();
	});
	
	if(Object.keys(colListParam).length === 0){
		modalInfo("선택된 칼럼이 없습니다.");
		return;
	}
	
	colListArray.push(colListParam);
	
	let colListArrayJson = JSON.stringify(colListArray);
	
	let excelForm = '';
	excelForm = '<form name="rawDataExcel" method="post" enctype="multipart/form-data" style="display:none;">';
	excelForm += '<input type="hidden" name="tableName" value="'+tableName+'">';
	excelForm += '<input type="hidden" name="tableComment" value="'+tableComment+'">';
	excelForm += '<input type="hidden" name="data" value="">';
	excelForm += '<input type="hidden" name="fromDate" value="2022-01-13">';
	excelForm += '<input type="hidden" name="toDate" value="2022-01-18"></form>';
	$("#rawDataExcelDiv").html(excelForm);
	$("input[name=data]").val(colListArrayJson);
	
	document.rawDataExcel.action = "/admin/cubici/adminPreference/rawDataExcel";
	document.rawDataExcel.submit();
}
</script>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/adminPreference/prizmConfig">Prizm</a></li>
        <li><a href="/admin/cubici/adminPreference/craConfig">CRA Index</a></li>
        <li class="active"><a href="/admin/cubici/adminPreference/prizmRawData">RawData</a></li>
    </ul>
</div>

<div class="selectSetArea">
	<div class="m-search">
		<ul>
			<li class="col-1d5">
				<div class="fwBox">
	                <span class="ft">테이블</span>
                 <div class="input">
                 	<input type="hidden" id="checkShop">
                    <select class="form-control" id="RawDataTable"></select>
                </div>
            </div>
			</li>
			<li class="col-1d5">
				<div class="fwBox">
	                <span class="ft">시작 일자</span>
                 <div class="input">
                    <select class="form-control"></select>
                </div>
            </div>
			</li>
			<li class="col-1d5">
				<div class="fwBox">
	                <span class="ft">종료 일자</span>
                 <div class="input">
                    <select class="form-control"></select>
                </div>
            </div>
			</li>
			<li class="col-1d5">
				<div class="btns">
					<button class="sBtn sColorLB" id="excelBtn" style="padding:0;">엑셀 다운로드</button>
            	</div>
			</li>
		</ul>
	</div>
	<div class="selectSet">
        <article>
            <header>
                <h4 id="tableName">테이블을 선택해 주세요.</h4>
            </header>
            <div class="contentArea">
                <div class="selectMulti">
                    <div class="fwBox" style="margin-bottom:15px;">
                       <select class="ListSelect" id="colList"></select>
                    </div>
                    <ul id="colListValue"></ul>
                </div>
                <div class="btns">
                    <a href="javascript:;" class="sBtn sColorR" id="deleteValue">행삭제</a>
                    <a href="javascript:;" class="sBtn sColorR2" id="resetValue">목록 초기화</a>
                </div>
            </div>
        </article>
         <article>
            <header>
                <h4>타입</h4>
            </header>
            <div class="contentArea">
                <div class="selectMulti">
                    <ul id="colTypeValue" style="margin-top:41px;"></ul>
                </div>
            </div>
        </article>
        <article>
            <header>
                <h4>계산식</h4>
            </header>
            <div class="contentArea">
                <div class="selectMulti">
                    <ul id="calculListValue" style="margin-top:41px;"></ul>
                </div>
               	<div class="btns">
	                <a href="javascript:;" class="sBtn sColorLB" id="calculEnrollModalBtn">계산식 등록</a>
	                <a href="javascript:;" class="sBtn sColorLG" id="calculDetailModalBtn">계산식 수정</a>
           		</div>
            </div>
        </article>
	</div>
	    <div id = "calculDetail"></div>
	    <div id = "rawDataExcelDiv"></div>
</div>

<div class="modal-container resetClose" id="calculModal">
    <div class="modal-wrapper">
        <header>
            <h2>계산식 등록</h2>
            <a href="javascript:;" class="modalClose">닫기</a>
        </header>
        <div class="modal-content">
            <div class="mInner auto mArticleArea">
                <article>
                    <p class="noticeTxt">
                        계산식 등록 및 변경을 위해서 아래 정보를 확인하고<br>
                        변경된 내용을 수정해 주세요
                    </p>
                </article>
                <article class="m-modalGrid">
                    <div class="formMaxWrap">
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">쇼핑몰</span>
                                    <div class="input">
                                        <select id ="shopList" disabled></select>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox">
                                    <span class="ft">제목</span>
                                    <div class="input">
                                    	<input type="hidden" id="calculNo">
                                        <input type="text" id="calculTitle" placeholder="제목 입력">
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul class="item">
                            <li>
                                <div class="fwBox" style="height:130px">
                                    <span class="ft">계산식</span>
                                    <div class="input">
                                        <textarea id="calculContent" placeholder="계산식 입력"></textarea>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </article>
                <div class="formMaxWrap">
                    <div class="btnArea" id="calculBtn"></div>
                </div>
            </div>
        </div>
    </div>
</div>
