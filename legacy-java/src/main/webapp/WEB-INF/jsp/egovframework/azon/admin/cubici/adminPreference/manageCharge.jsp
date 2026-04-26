<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<script>
let CKeyword = "" ;
let OKeyword = "" ; 
let NKeyword = "";

$(document).ready(function(){
	manageChargeList(0);
	
	$('input[name="search"]').keyup(function(e){
		if(e.keyCode == 13){
			$("#currentPageNum").val("");
			manageChargeList(1);
		}
	});

	$("#searchBtn").click(function(){
		$("#currentPageNum").val("");
		manageChargeList(1);
	});
 });	

function manageChargeList(CURRENTPAGE){
	if(CURRENTPAGE != 0){
		$("#currentPageNum").val(CURRENTPAGE);
		currentPageNum = $("#currentPageNum").val();
	}else if($("#currentPageNum").val() == ""){
		currentPageNum = $("#currentPageNum").val()+1;
	}else{
		currentPageNum = $("#currentPageNum").val(); 
	}
	CKeyword = $("#CKeyword option:selected").val();    	
	OKeyword = $("#OKeyword option:selected").val(); 	
	NKeyword = $("#NKeyword").val(); 			
	
	let currentPage = currentPageNum-1;			
	let dataPerPage = 10; 					
	let dataCnt = currentPage * dataPerPage;	
	
	let callUrl = "/admin/cubici/adminPreference/chargeList";
	let callBackFunc = "chargeListResponse";
	let objParam = {
			dataPerPage : dataPerPage
		  , currentPage : currentPage
		  , dataCnt : dataCnt
		  , CKeyword : CKeyword
		  , OKeyword : OKeyword
		  , NKeyword : NKeyword
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function chargeListResponse(data){
	let count = data.chargeCount;
	let chargeList = data.chargeList; 
	
	$('#chargeTotal').text(count.chargeTotal + " 개");
	$('#chargeOpr').text(count.chargeOpr + " 개");
	$('#chargeEnd').text(count.chargeEnd + " 개");
	
	if(chargeList.length > 0){
		let trHtml = '';
		$.each(chargeList, function(index, item){
			trHtml += "<tr>";
			trHtml += "<td><div class='tIn'>"+ item.status +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.regi_date +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.charge_name +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.amount +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.sub_id +" 개</div></td>";
			trHtml += "<td><div class='tIn'>"+ "무제한" +"</div></td>";
			trHtml += "<td><div class='tIn'><a href='javascript:chargeDetail(\"" + item.charge_code + "\")' class='sBtn sColorN rBtn'>상세보기</a></div></td></tr>";
		});
		$("#listTbody").empty().html(trHtml)
		
		let pageHtml = "";
		pageHtml += "<ul>";
		
		let pageMaxCnt = Math.ceil(chargeList[0].CNT/ data.dataPerPage);
		let dataPerPage = data.dataPerPage; 		
		let currentPage = data.currentPage; 		
		let pageCnt = Math.floor(currentPage / 10); 
		
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ 
			if( i > pageMaxCnt) {
				break;
			}
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:chargeList(" + i + ');' + "'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:chargeList(" + i + ');' + "'>" + i + "</a></li>";
			}
		}
		
		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:chargeList(" + ((pageCnt+1)*10 + 1) + ')' + "'> > </a></li>";
		}
		pageHtml += "</ul>";
		$("#pagingButton").empty().html(pageHtml);
	
	}else {
		let trHtml = '<tr><td colspan="10">조회된 결과가 없습니다.</td></tr>'; 
		$('#listTbody').empty().html(trHtml);
		$('#pagingButton').empty();
	}
}

$(document).on("click", "#chargeInsert", function(){
	modalOpen("charge-modal");
	$("#modal-title").text("요금제 등록");
	$("#chargeEnroll").show();
	$("#chargeUpdate, #chargeDelete, #span_regi_date, #span_charge_code").hide();
});

$(document).on("click", "#chargeEnroll", function(){
	let charge_code = $("#charge_type").val() + $("#sub_period").val();
	let charge_name = $("#charge_name").val();
	let charge_type = $("#charge_type").val();
	let start_date = $("#start_date").val();
	let expire_date = $("#expire_date").val();
	let sub_id = $("#sub_id").val();
	let sales_count = $("#sales_count").val();
	let product_count = $("#product_count").val();
	let amount = $("#amount").val();
	let sub_period = $("#sub_period").val();
	let sub_unit = $("#sub_unit").val();
	let charge_detail = $("#charge_detail").val();
	
	if(!dataValidate(charge_name, charge_type, start_date, expire_date, sub_id, amount, sub_period, sub_unit)){
		return false;
	}
	
	let callUrl = "/admin/cubici/adminPreference/chargeinsert";
	let callBackFunc = "chargeModalResponse";
	let objParam = {
		  charge_code : charge_code
		, charge_name : charge_name
		, charge_type : charge_type
		, start_date : start_date
		, expire_date : expire_date
		, sub_id : sub_id
		, sales_count : sales_count
		, product_count : product_count
		, amount : amount
		, sub_period : sub_period
		, sub_unit : sub_unit
		, charge_detail : charge_detail
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc); 
});

function chargeDetail(charge_code){ 
	let callUrl = "/admin/cubici/adminPreference/chargeDetail";
	let callBackFunc = "chargeDetailModalResponse";
	let objParam = {
			charge_code : charge_code
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function chargeDetailModalResponse(data){
	let dataList = data.chargeDetail;
	
	if(data.resultCode == 0){
		$('#charge_code').val(dataList.charge_code);
		$('#charge_name').val(dataList.charge_name);
		$('#charge_type').val(dataList.charge_type);
		$('#start_date').val(dataList.start_date);
		$('#expire_date').val(dataList.expire_date);
		$('#regi_date').val(dataList.regi_date);
		$('#sub_id').val(dataList.sub_id).prop('selected', true);
		$('#sales_count').val(dataList.sales_count);
		$('#product_count').val(dataList.product_count);
		$('#amount').val(dataList.amount);
		$('#sub_period').val(dataList.sub_period);
		$('#sub_unit').val(dataList.sub_unit).prop('selected', true);
		$('#charge_detail').val(dataList.charge_detail);
		
		modalOpen('charge-modal');
		$("#modal-title").text("요금제 상세");
		$("#chargeEnroll").hide();
		$("#chargeUpdate, #chargeDelete, #span_regi_date, #span_charge_code").show();
		$("#span_charge_code, #sub_period, #regi_date").attr("readonly", true);
		$("#charge_type").attr("disabled",true);
	}
}

$(document).on("click","#chargeUpdate", function(){
	let charge_code = $("#charge_code").val();
	let charge_name = $("#charge_name").val();
	let charge_type = $("#charge_type option:selected").val();
	let start_date = $("#start_date").val();
	let expire_date = $("#expire_date").val();
	let sub_id = $("#sub_id option:selected").val();
	let sales_count = $("#sales_count").val();
	let product_count = $("#product_count").val();
	let amount = $("#amount").val();
	let sub_period = $("#sub_period").val();
	let sub_unit = $("#sub_unit option:selected").val();
	let charge_detail = $("#charge_detail").val();
	
	let callUrl = "/admin/cubici/adminPreference/chargeupdate";
	let callBackFunc = "chargeModalResponse";
	let objParam = {
		  charge_code : charge_code
		, charge_name : charge_name
		, charge_type : charge_type
		, start_date : start_date
		, expire_date : expire_date
		, sub_id : sub_id
		, sales_count : sales_count
		, product_count : product_count
		, amount : amount
		, sub_period : sub_period
		, sub_unit : sub_unit
		, charge_detail : charge_detail
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function dataValidate(charge_name, charge_type, start_date, expire_date, sub_id, amount, sub_period, sub_unit){
	if(charge_name === null || charge_name === "" || charge_name === undefined){
		modalInfo("요금제명을 입력해주세요");
		return false;
	}
	if(charge_type === null || charge_type === "" || charge_type === undefined){
		modalInfo("구분을 선택해주세요");
		return false;
	}
	if(start_date === null || start_date === "" || start_date === undefined){
		modalInfo("시작일자를 입력해주세요");
		return false;
	}
	if(expire_date === null || expire_date === "" || expire_date === undefined){
		modalInfo("종료일자를 입력해주세요");
		return false;
	}
	if(sub_id === null || sub_id === "" || sub_id === undefined){
		modalInfo("제공 ID 수를 선택해주세요");
		return false;
	}
	if(amount === null || amount === "" || amount === undefined){
		modalInfo("기준금액을 입력해주세요");
		return false;
	}
	if(sub_period === null || sub_period === "" || sub_period === undefined){
		modalInfo("서비스 기간을 입력해주세요");
		return false;
	}
	if(sub_period.length < 2){
		modalInfo("서비스 기간을 두자리로 입력해주세요");
		return false;
	}
	if(sub_unit === null || sub_unit === "" || sub_unit === undefined){
		modalInfo("단위를 선택해주세요");
		return false;
	}
	return true;
}

$(document).on("click","#chargeDelete", function(){
	let charge_code = $("#charge_code").val();
	
	let callUrl = "/admin/cubici/adminPreference/chargedelete";
	let callBackFunc = "chargeModalResponse";
	let objParam = {
			charge_code : charge_code
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function chargeModalResponse(result){
	if(result.resultCode == 0){
		$(location).attr("href", "manageCharge");
	}
} 
</script>

<!-- 상단 검색창 -->
<div class="m-search">
	<ul>
		<li>
			<div class="fwBox">
				<span class="ft">요금제</span>
				<div class="input">
					<select id="CKeyword" name="search">
						<option value="" selected>전체</option>
						<option value="B">기본요금</option>
						<option value="A">부가요금</option>
						<option value="M">조건부요금</option>
						<option value="O">기타요금</option>
						<option value="F">무료요금</option>
					</select>
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">운영상태</span>
				<div class="input">
					<select id="OKeyword" name="search">
						<option value="" selected>선택</option>
						<option value="00">운영</option>
						<option value="01">종료</option>
					</select>
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">요금제명</span>
				<div class="input">
	               <input type="text" class="charge_name" id="NKeyword" name="search" value="">
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
				<span class="ft">보기설정</span>
				<div class="input">
					<select>
						<option value="">최근순</option>
					</select>
				</div>
			</div>
			<div class="btns">
				<a href="javascript:;" data-toggle="modal" class="rBtn2 sColorLB" id="chargeInsert">요금제 추가</a>
			</div>
		</div>
	</div>

	<div class="contentsArea">
		<div class="service-table fix-header">
			<table class="txt-center">
				<thead>
					<tr>
						<th class="b-b" rowspan="2">상태</th>
						<th class="b-b" rowspan="2">등록 일자</th>
						<th class="b-b" rowspan="2">요금제</th>
						<th class="b-b" rowspan="2">기준금액(VAT제외)</th>
						<th class="b-b" rowspan="2">제공 ID수</th>
						<th class="b-b" rowspan="2">거래 건수</th>
						<th class="b-b" rowspan="2">상세 보기</th>
					</tr>
				</thead>
				<tbody id="listTbody">
				</tbody>
			</table>
		</div>
		<div class="fixBottom">
			<ul class="tableTotal txt-lefts">
				<li><span class="txt">전체 :</span><span class="result" id="chargeTotal"></span></li>
				<li><span class="txt">운영 :</span><span class="result" id="chargeOpr"></span></li>
				<li><span class="txt">종료 :</span><span class="result" id="chargeEnd"></span></li>
			</ul>
		</div>
		<div id="pagingButton" class="m-paging"></div>
     		<div style = "display:none">
            	<input type="text" id="currentPageNum"/>
            </div>
	</div>
</div>

<jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/manageChargeModal.jsp" flush="true" />