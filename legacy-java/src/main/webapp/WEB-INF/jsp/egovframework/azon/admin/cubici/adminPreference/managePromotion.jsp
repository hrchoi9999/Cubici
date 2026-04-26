<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
let PCKeyword = "";
let SKeyword = "";
let PNKeyword = "";

let partner_division = "";

$(document).ready(function(){
	promotionList(0);

	$('input[name="search"]').keyup(function(e){
		if(e.keyCode == 13){
			$("#currentPageNum").val("");
			promotionList(1);
		}
	});

	$("#searchBtn").click(function(){
		$("#currentPageNum").val("");
		promotionList(1);
	});
	
	$("#start_date").datepicker('option', 'minDate', '0');
});

$(document).on("click", "#end_date_span", function(){
	if(!$("#start_date").val()){
		$('#ui-datepicker-div').hide();
		modalInfo("시작일자를 선택해주세요.");
		return false;
	}
	return true;
});

$(document).on("click", "#promotionInsert", function(){
	let charge_code = $('#charge_code').val();
	
	let callUrl = "/admin/cubici/adminPreference/promoCodeSelect";
	let callBackFunc = "promoCodeSelectFunc";
	let objParam = {
		charge_code : charge_code		
	};
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function promoCodeSelectFunc(data){
	modalOpen("promotion-modal");
	$("#modal-title").text("연계코드 등록");
	$("#promotionEnroll").show();
	$("#promotionUpdate, #promotionDelete, #span_promo_code, #span_input_date").hide();
	$("#promo_target").removeAttr("disabled");
	$("#partner_type, #input_date").removeAttr("readonly");
	
	$("#partner_division_div").html('<select id="partner_division"></select>');
	
	let divisionSelect = data.partnerDivisionSelect;
	let divisionSelectHtml = '<option value="">선택</option>';
	divisionSelectHtml += '<option value="CBCI">자체</option>'
	
	let chargeSelect = data.chargeNameSelect;
	let checkHtml = '';
	
	$.each(divisionSelect, function(index, item){
		divisionSelectHtml = divisionSelectHtml + '<option value="' + item.SELECT_CD + '">' + item.SELECT_NM + '</option>'
	});
	
	$.each(chargeSelect, function(index, item){
		checkHtml = checkHtml + '<label><input type="checkbox" name="chargeCode" value="' + item.charge_code + '">&nbsp;' + item.charge_name +'</label>&nbsp;&nbsp;'
	});
	
	$("#partner_division").html(divisionSelectHtml);
	$("#charge_code").html(checkHtml);
}

$(document).on("change", "#partner_division", function(){
	partner_division = $("#partner_division option:selected").val();
	
	if(partner_division == ""){
		$("#partner_code_div").html('');
		return
	}
	
	let callUrl = "/admin/cubici/adminPreference/partnerCodeSelect";
	let callBackFunc = "partnerCodeSelectResponse";
	let objParam = {
			partner_division : partner_division
	};
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function partnerCodeSelectResponse(data){
	let codeSelect = data.partnerCodeSelect;
	let selectHtml = '';
	
	if(codeSelect.length !== 0){
		selectHtml = '<select id="partner_code"></select>';
		$("#partner_code_div").html(selectHtml);
		selectHtml += '<option value="">선택</option>';
		
		$.each(codeSelect, function(index, item){
			selectHtml = selectHtml + '<option value="' + item.partner_code + '">' + item.partner_nm + '</option>'
		});
		$("#partner_code").html(selectHtml);
		
	}else{
		$("#partner_code_div").html(selectHtml);
	}
}

function promotionList(CURRENTPAGE){
	if(CURRENTPAGE != 0){
		$("#currentPageNum").val(CURRENTPAGE);
		currentPageNum = $("#currentPageNum").val();
	}else if($("#currentPageNum").val() == ""){
		currentPageNum = $("#currentPageNum").val()+1;
	}else{
		currentPageNum = $("#currentPageNum").val(); 
	}
	
	PCKeyword = $("#PCKeyword").val();
	SKeyword = $("#SKeyword").val();
	PNKeyword = $("#PNKeyword").val();
	
	let currentPage = currentPageNum-1;			
	let dataPerPage = 10; 					
	let dataCnt = currentPage * dataPerPage;	
	
	let callUrl = "/admin/cubici/adminPreference/promotionlist";
	let callBackFunc = "promotionListResponse";
	let objParam = {
			dataPerPage : dataPerPage
		  , currentPage : currentPage
		  , dataCnt : dataCnt
		  , PCKeyword : PCKeyword
		  , SKeyword : SKeyword
		  , PNKeyword : PNKeyword
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function promotionListResponse(data){
	let count = data.promotionCount;
	let promotionList = data.promotionlist;
	
	$('#promoTotal').text(count.promoTotal + " 개");
	$('#promoOpr').text(count.promoOpr + " 개");
	$('#promoEnd').text(count.promoEnd + " 개");
	
	if(promotionList.length > 0){
		let trHtml = '';
		$.each(promotionList, function(index, item){
			trHtml += "<tr>";
			trHtml += "<td><div class='tIn'>"+ item.status +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.start_date +"</div></td>";
			trHtml += "<td><div class='tIn' value='" + item.partner_code + "'>"+ item.partner_nm +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.promo_name +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.promo_code +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.promo_target +"</div></td>";
			trHtml += "<td><div class='tIn' value='" + item.charge_code + "'>"+ item.charge_name +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.discount_rate +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.discount_amount +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.free_period +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.free_period_unit +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.sub_id +"</div></td>";
			trHtml += "<td><div class='tIn'><a href='javascript:promotionDetail(\"" + item.promo_code + "\")' class='sBtn sColorN rBtn'>상세보기</a></div></td></tr>";
		});
		$("#listTbody").empty().html(trHtml)
		
		let pageHtml = "";
		pageHtml += "<ul>";
		
		let pageMaxCnt = Math.ceil(promotionList[0].CNT/ data.dataPerPage);
		let dataPerPage = data.dataPerPage; 		
		let currentPage = data.currentPage; 		
		let pageCnt = Math.floor(currentPage / 10); 
		
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ 
			if( i > pageMaxCnt) {
				break;
			}
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:promotionList(" + i + ');' + "'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:promotionList(" + i + ');' + "'>" + i + "</a></li>";
			}
		}
		
	if(pageCnt+1 < (pageMaxCnt/10)){
		pageHtml += "<li><a class='oiBtn next' href = 'javascript:promotionList(" + ((pageCnt+1)*10 + 1) + ')' + "'> > </a></li>";
	}
	pageHtml += "</ul>";
	$("#pagingButton").empty().html(pageHtml);
	
	}else {
		let trHtml = '<tr><td colspan="15">조회된 결과가 없습니다.</td></tr>'; 
		$('#listTbody').empty().html(trHtml);
		$('#pagingButton').empty();
	}
}

function promotionDetail(promo_code){ 
	let callUrl = "/admin/cubici/adminPreference/promotiondetail";
	let callBackFunc = "chargeDetailModalResponse";
	let objParam = {
			promo_code : promo_code
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function chargeDetailModalResponse(data){
	let dataList = data.promotiondetail;
	let chargeSelect = data.chargeNameSelect;
	let checkArr = data.checkArr;
	let checkHtml = '';
	
	if(data.resultCode == 0){
		$("#partner_division_div").html('<input type="text" id="partner_division">');
		$("#partner_code_div").html('<input type="text" id="partner_code">');
		$("#charge_code").html('<input type="checkbox" name="chargeCode">');
		
		$.each(chargeSelect, function(index, item){
			checkHtml = checkHtml + '<label><input type="checkbox" name="chargeCode" value="' + item.charge_code + '">&nbsp;' + item.charge_name +'</label>&nbsp;&nbsp;'
		});
		
		$("#charge_code").html(checkHtml);
		
		$.each(checkArr, function(i, item){
			$("input[name=chargeCode][value=" + item + "]").prop("checked", true); 
		});
		
		$('#promo_code').val(dataList.promo_code);
		$('#promo_name').val(dataList.promo_name);
		$('#promo_target').val(dataList.promo_target);
		$('#start_date').val(dataList.start_date);
		$('#end_date').val(dataList.end_date);
		$('#input_date').val(dataList.input_date);
		$('#partner_division').val(dataList.partner_division).prop('selected', true);
		$('#partner_code').val(dataList.partner_code).prop('selected', true);
		$('#free_period').val(dataList.free_period);
		$('#free_period_unit').val(dataList.free_period_unit);
		$('#sub_id').val(dataList.sub_id).prop('selected', true);
		$('#discount_rate').val(dataList.discount_rate);
		$('#discount_amount').val(dataList.discount_amount);
		$('#promo_detail').val(dataList.promo_detail);
		
		modalOpen('promotion-modal');
		$("#modal-title").text("연계코드 상세");
		$("#promotionEnroll").hide();
		$("#promotionUpdate, #promotionDelete, #span_input_date, #span_promo_code").show();
		$("#span_promo_code, #input_date").attr("readonly", true);
		$("#promo_target, #partner_division, #partner_code").attr("disabled",true);
	}
}

$(document).on("click", "#promotionEnroll", function(){
	let promo_code = $("#promo_target option:selected").val() + $("#partner_code option:selected").val();
	let promo_name = $("#promo_name").val();
	let promo_target = $("#promo_target option:selected").val();
	let partnerDivision = $("#partner_division option:selected").val();
	let partner_code = $("#partner_code option:selected").val();
	let charge_code = $("input:checkbox[name=chargeCode]:checked").val();
	let start_date = $("#start_date").val();
	let end_date = $("#end_date").val();
	let sub_id = $("#sub_id option:selected").val();
	let free_period = $("#free_period").val();
	let free_period_unit = $("#free_period_unit option:selected").val();
	let discount_rate = $("#discount_rate").val();
	let discount_amount = $("#discount_amount").val();
	let promo_detail = $("#promo_detail").val();
	
	if(partner_code == null || partner_code == "" || partner_code == undefined){
		partner_code = "CBCI";
	}
	
	if(!dataValidate(promo_name, start_date, end_date, promo_target, partnerDivision, partner_code, charge_code, free_period, free_period_unit, discount_rate, discount_amount)){
		return false;
	}
	
	let objParam = {
		promo_code : promo_code
	  , promo_name : promo_name
	  , promo_target : promo_target
	  , partner_division : partnerDivision
	  , partner_code : partner_code
	  , charge_code : charge_code
	  , start_date : start_date
	  , end_date : end_date
	  , sub_id : sub_id
	  , free_period : free_period
	  , free_period_unit : free_period_unit
	  , discount_rate : discount_rate
	  , discount_amount : discount_amount
	  , promo_detail : promo_detail
	};
	
	let chkArr = [];
	
	$("input:checkbox[name=chargeCode]:checked").each(function(i,item){
		chkArr.push(item.value);
	});
	
	objParam.charge_code = chkArr;
	
	let callUrl = "/admin/cubici/adminPreference/promotioninsert";
	let callBackFunc = "promotionModalResponse";
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

$(document).on("click","#promotionUpdate", function(){
	let promo_code = $("#promo_code").val();
	let promo_name = $("#promo_name").val();
	let promo_target = $("#promo_target").val();
	let partnerDivision = $("#partner_division option:checked").val();
	let partner_code = $("#partner_code").val();
	let charge_code = $("input:checkbox[name=chargeCode]:checked").val();
	let start_date = $("#start_date").val();
	let end_date = $("#end_date").val();
	let sub_id = $("#sub_id option:selected").val();
	let free_period = $("#free_period").val();
	let free_period_unit = $("#free_period_unit option:selected").val();
	let discount_rate = $("#discount_rate").val();
	let discount_amount = $("#discount_amount").val();
	let promo_detail = $("#promo_detail").val();
	
	if(!updateValidate(promo_name, start_date, end_date, charge_code, free_period, free_period_unit, discount_rate, discount_amount)){
		return false;
	}
	
	let callUrl = "/admin/cubici/adminPreference/promotionupdate";
	let callBackFunc = "promotionModalResponse";
	let objParam = {
		  promo_code : promo_code
		, promo_name : promo_name
		, promo_target : promo_target
		, partner_code : partner_code
		, charge_code : charge_code
		, start_date : start_date
		, end_date : end_date
		, sub_id : sub_id
		, free_period : free_period
		, free_period_unit : free_period_unit
		, discount_rate : discount_rate
		, discount_amount : discount_amount
		, promo_detail : promo_detail
	}
	
	let chkArr = [];
	
	$("input:checkbox[name=chargeCode]:checked").each(function(i,item){
		chkArr.push(item.value);
	});
	
	objParam.charge_code = chkArr;
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

$(document).on("click","#promotionDelete", function(){
	let promo_code = $("#promo_code").val();
	
	let callUrl = "/admin/cubici/adminPreference/promotiondelete";
	let callBackFunc = "promotionModalResponse";
	let objParam = {
			promo_code : promo_code
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function dataValidate(promo_name, start_date, end_date, promo_target, partnerDivision, partner_code, charge_code, free_period, free_period_unit, discount_rate, discount_amount){
	if(promo_name === null || promo_name === "" || promo_name === undefined){
		modalInfo("연계코드명을 입력해주세요");
		return false;
	}
	if(start_date === null || start_date === "" || start_date === undefined){
		modalInfo("시작일자를 선택해주세요");
		return false;
	}
	if(end_date === null || end_date === "" || end_date === undefined){
		modalInfo("종료일자를 선택해주세요");
		return false;
	}
	if(start_date == end_date){
		modalInfo("종료일자를 시작일자보다 이후로 선택해주세요.");
		return false;
	}
	if(promo_target === null || promo_target === "" || promo_target === undefined){
		modalInfo("대상을 선택해주세요");
		return false;
	}
	if(partnerDivision === null || partnerDivision === "" || partnerDivision === undefined){
		modalInfo("구분을 선택해주세요");
		return false;
	}
	if(partnerDivision != "CBCI"){
		if(partner_code === null || partner_code === "" || partner_code === undefined){
			modalInfo("협력사코드를 선택해주세요");
			return false;
		}
	}
	if(charge_code === null ||charge_code === "" || charge_code === undefined){
		modalInfo("연계요금제를 선택해주세요");
		return false;
	}

	if(free_period_unit && (free_period === null || free_period === "" || free_period ===  undefined)){
		modalInfo("무료 기간을 입력해주세요.");
		return false;
	}
	
	if(free_period && (free_period_unit === null || free_period_unit === "" || free_period_unit ===  undefined)){
		modalInfo("단위를 선택해주세요.");
		return false;
	}
	
	if(discount_rate.length > 0 && discount_amount.length > 0){
		modalInfo("두 가지 할인 중 하나만 입력해주세요.")
		return false;
	}

	return true;
}

function updateValidate(promo_name, start_date, end_date, charge_code, free_period, free_period_unit, discount_rate, discount_amount){
	if(promo_name === null || promo_name === "" || promo_name === undefined){
		modalInfo("연계코드명을 입력해주세요");
		return false;
	}
	if(start_date === null || start_date === "" || start_date === undefined){
		modalInfo("시작일자를 선택해주세요");
		return false;
	}
	if(end_date === null || end_date === "" || end_date === undefined){
		modalInfo("종료일자를 선택해주세요");
		return false;
	}
	if(start_date == end_date){
		modalInfo("종료일자를 시작일자보다 이후로 선택해주세요.");
		return false;
	}
	
	if(charge_code === null ||charge_code === "" || charge_code === undefined){
		modalInfo("연계요금제를 선택해주세요");
		return false;
	}
	
	if(free_period_unit && (free_period === null || free_period === "" || free_period ===  undefined)){
		modalInfo("무료 기간을 입력해주세요.");
		return false;
	}
	
	if(free_period && (free_period_unit === null || free_period_unit === "" || free_period_unit ===  undefined)){
		modalInfo("단위를 선택해주세요.");
		return false;
	}
	
	if(discount_rate.length > 0 && discount_amount.length > 0){
		modalInfo("두 가지 할인 중 하나만 입력해주세요.")
		return false;
	}
	return true;
}

function promotionModalResponse(result){
	if(result.resultCode == 0){
		$(location).attr("href", "managePromotion");
	}
}
</script>

<!-- 상단 검색창 -->
<div class="m-search">
	<ul>
		<li>
			<div class="fwBox">
				<span class="ft">연계코드</span>
				<div class="input">
					<input type="text" id="PCKeyword" name="search">
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">운영상태</span>
				<div class="input">
					<select id="SKeyword" name="search">
						<option value="" selected>선택</option>
						<option value="Y">운영</option>
						<option value="N">종료</option>
					</select>
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">협력사</span>
				<div class="input">
					<input type="text" id="PNKeyword" name="search">
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<div class="btns w100p">
					<button class="sBtn sColorLB search" id="searchBtn">검색</button>
				</div>
			</div>
		</li>
	</ul>
</div>

<div class="tableSet">
	<div class="m-options">
		<div class="pRight">
			<div class="fwBox">
				<span class="ft">보기기준</span>
				<div class="input">
					<select>
						<option value="">최근순</option>
					</select>
				</div>
			</div>
			<div class="btns">
				<a href="javascript:;" data-toggle="modal" class="rBtn2 sColorLB" id="promotionInsert">연계코드 추가</a>
			</div>
		</div>
	</div>

	<div class="contentsArea">
		<div class="service-table fix-header">
			<table class="txt-center">
				<thead>
					<tr>
						<th class="b-b" rowspan="2">상태</th>
						<th class="b-b" rowspan="2">시작 일자
						</th>
						<th class="b-b" rowspan="2">협력사명</th>
						<th class="b-b" rowspan="2">연계이름</th>
						<th class="b-b" rowspan="2">연계코드</th>
						<th class="b-b" rowspan="2">주요대상
						</th>
						<th class="b-b" rowspan="2">연계요금제</th>
						<th class="b-b" colspan="2">혜택조건</th>
						<th class="b-b" colspan="2">무료기간</th>
						<th class="b-b" rowspan="2">제공ID수</th>
						<th class="b-b" rowspan="2">상세 보기
						</th>
					</tr>
					<tr class="b-b">
						<th class="b-b">% 할인</th>
						<th class="b-b">금액할인</th>
						<th class="b-b">기간</th>
						<th class="b-b">단위</th>
					</tr>
				</thead>
				<tbody id="listTbody">
				</tbody>
			</table>
		</div>
		<div class="fixBottom">
			<ul class="tableTotal txt-lefts">
				<li><span class="txt">전체 :</span><span class="result" id="promoTotal"></span></li>
				<li><span class="txt">운영 :</span><span class="result" id="promoOpr"></span></li>
				<li><span class="txt">종료 :</span><span class="result" id="promoEnd"></span></li>
			</ul>
		</div>
		<div id="pagingButton" class="m-paging"></div>
     		<div style = "display:none">
            	<input type="text" id="currentPageNum"/>
            </div>
	</div>
</div>

<jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/managePromotionModal.jsp" flush="true" />