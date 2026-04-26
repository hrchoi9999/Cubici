<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<script>
let PNKeyword = "";		
let PSKeyword = "";		
let RNKeyword = "";		
let PCKeyword = "";	
let bizComplete = false;
let divisionComplete = false;

$(document).ready(function(){
	partnerList(0);
	$('input[name="search"]').keyup(function(e){
		if(e.keyCode == 13){
			$("#currentPageNum").val("");
			partnerList(1);
		}
	});

	$("#searchBtn").click(function(){
		$("#currentPageNum").val("");
		partnerList(1);
	});
	
	let selectDivision = $("#partnerType").attr("id");
	selectMenuList(selectDivision);
	
	$("#partner_id").on("change keyup", function(){
		if(bizComplete){
			bizComplete = false;
		}
	});
	
	$("#partnerType, #division_code").on("change keyup", function(){
		if(divisionComplete){
			divisionComplete = false;
		}
	});
});	

function partnerList(CURRENTPAGE){
	if(CURRENTPAGE != 0){
		$("#currentPageNum").val(CURRENTPAGE);
		currentPageNum = $("#currentPageNum").val();
	}else if($("#currentPageNum").val() == ""){
		currentPageNum = $("#currentPageNum").val()+1;
	}else{
		currentPageNum = $("#currentPageNum").val(); 
	}

	PNKeyword = $("#PNKeyword").val();    	
	PSKeyword = $("#PSKeyword option:selected").val(); 	
	RNKeyword = $("#RNKeyword").val(); 			
	PCKeyword = $("#PCKeyword").val();			
	
	let currentPage = currentPageNum-1;			
	let dataPerPage = 10; 					
	let dataCnt = currentPage * dataPerPage;	
	
	let callUrl = "/admin/cubici/adminPreference/partnerList";
	let callBackFunc = "partnerListResponse";
	let objParam = {
			dataPerPage : dataPerPage
		  , currentPage : currentPage
		  , dataCnt : dataCnt
		  , PNKeyword : PNKeyword
		  , PSKeyword : PSKeyword
		  , RNKeyword : RNKeyword
		  , PCKeyword : PCKeyword
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function partnerListResponse(data){
	let cnt = data.partnerCodeCount;
	let partnerList = data.partnerList; 
	
	$('#partnerTotal').text(cnt.partnerTotal + " 개");
	$('#partnerTypeBA').text(cnt.partnerTypeBA+ " 개");
	$('#partnerTypeBB').text(cnt.partnerTypeBB+ " 개");
	$('#partnerTypeCO').text(cnt.partnerTypeCO+ " 개");
	$('#partnerTypeFI').text(cnt.partnerTypeFI+ " 개");
	$('#partnerTypeMN').text(cnt.partnerTypeMN+ " 개");
	$('#partnerTypeTH').text(cnt.partnerTypeTH+ " 개");
	
	if(partnerList.length > 0){
		let trHtml = '';
		$.each(partnerList, function(index, item){
			trHtml += "<tr>";
			trHtml += "<td><div class='tIn'>"+ item.partner_status +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.input_date +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.partner_type +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.partner_nm +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.partner_code +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.rep_nm +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.partner_id +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.manager_nm +"</div></td>";
			trHtml += "<td><div class='tIn'>"+ item.manager_phone +"</div></td>";
			trHtml += "<td><div class='tIn'><a href='javascript:partnerDetail(" + item.partner_id + ")' class='sBtn sColorN rBtn'>상세보기</a></div></td></tr>";
		});
		$("#listTbody").empty().html(trHtml)
		
		let pageHtml = "";
		pageHtml += "<ul>";
		
		let pageMaxCnt = Math.ceil(partnerList[0].CNT/ data.dataPerPage);
		let dataPerPage = data.dataPerPage; 		
		let currentPage = data.currentPage; 		
		let pageCnt = Math.floor(currentPage / 10); 
		
		for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ 
			if( i > pageMaxCnt) {
				break;
			}
			if(i-1  == data.currentPage){
				pageHtml += "<li><a class='num active' href = 'javascript:partnerList(" + i + ');' + "'>" + i + "</a></li>";
			}else{ 
				pageHtml += "<li><a class='num' href = 'javascript:partnerList(" + i + ');' + "'>" + i + "</a></li>";
			}
		}
		if(pageCnt+1 < (pageMaxCnt/10)){
			pageHtml += "<li><a class='oiBtn next' href = 'javascript:partnerList(" + ((pageCnt+1)*10 + 1) + ')' + "'> > </a></li>";
		}
		pageHtml += "</ul>";
		$("#pagingButton").empty().html(pageHtml);
	}else {
		let trHtml = '<tr><td colspan="10">조회된 결과가 없습니다.</td></tr>'; 
		$('#listTbody').empty().html(trHtml);
		$('#pagingButton').empty();
	}
}

$(document).on("click","#addrSearch",function(){
	let pop = window.open("/addrSearch","pop","width=570,height=420, scrollbars=yes, resizable=yes");
});

function jusoCallBack(roadFullAddr,roadAddrPart1,addrDetail,roadAddrPart2,engAddr, jibunAddr, zipNo, admCd, rnMgtSn, bdMgtSn,detBdNmList,bdNm,bdKdcd,siNm,sggNm,emdNm,liNm,rn,udrtYn,buldMnnm,buldSlno,mtYn,lnbrMnnm,lnbrSlno,emdNo){
	$("#partner_zip").val(zipNo);
	$("#partner_address").val(roadFullAddr);
}

function partnerDetail(partner_id){		
	let callUrl = "/admin/cubici/adminPreference/partnerdetail";
	let callBackFunc = "partnerDetailModalResponse";
	let objParam = {
			partner_id : partner_id
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function partnerDetailModalResponse(data){
	let dataList = data.partnerDetail; 
	
	if(data.resultCode == 0){
		$('#partner_code').val(dataList[0].partner_code);
		$('#input_date').val(dataList[0].input_date);
		$('#partner_nm').val(dataList[0].partner_nm);
		$('#partner_id').val(dataList[0].partner_id);
		$('#rep_nm').val(dataList[0].rep_nm);
		$('#partner_zip').val(dataList[0].partner_zip);
		$('#partner_address').val(dataList[0].partner_address);
		$('#partner_status').val(dataList[0].partner_status).prop('selected', true);
		$('#partnerType').val(dataList[0].partner_type).prop('selected', true);
		$('#detail').val(dataList[0].detail);
		
		bizComplete = true;
		
		$.each(dataList, function(i, item){
			let managerArr = [item.manager_nm, item.manager_rank , item.manager_email, item.manager_phone];
			let name = []; 
			if(item.manager_type == '00'){
				name = $('input[name="sup"]');
			} else if(item.manager_type == '01'){
				name = $('input[name="manager"]');
			}
			managerInfo(name, managerArr);
		});
	
		modalOpen('partner-modal');
		$("#modal-title").text("협력사 상세");
		$("#partnerUpdate, #span_input_date, #partnerDelete, #span_partner_code").show();
		$("#partnerEnroll, #divisionChk, #span_division_code").hide();
		$("#partnerType").attr("disabled",true);
		$("#input_date, #partner_address").attr("readonly",true);
	} 
}

function managerInfo(name, managerArr){
	$.each(name, function(i, item){
		$(item).val(managerArr[i]);
	});
}

$(document).on("click", "#partnerInsert", function(){
	modalOpen("partner-modal");
	$("#modal-title").text("협력사 등록");
	$("#partnerEnroll, #divisionChk, #span_division_code").show();
	$("#partnerUpdate, #partnerDelete, #span_input_date, #span_partner_code").hide();		
	$("#partnerType").removeAttr("disabled");
});

$(document).on("click","#partnerEnroll, #partnerUpdate", function(){
	let partner_code = "";
	let partner_nm = $("#partner_nm").val();
	let partner_id = $("#partner_id").val();
	let rep_nm = $("#rep_nm").val();
	let partner_zip = $("#partner_zip").val();
	let partner_address = $("#partner_address").val();
	let partner_status = $("#partner_status option:selected").val();
	let partner_type = $("#partnerType option:selected").val();
	let detail = $("#detail").val();
	let sup_nm = $("#sup_nm").val();
	let sup_rank = $("#sup_rank").val();
	let sup_email = $("#sup_email").val();
	let sup_phone = $("#sup_phone").val();
	let manager_type = "";
	let manager_nm = "";
	let manager_rank = "";
	let manager_email = "";
	let manager_phone = "";
	let data = [];
		
	for(let i = 0 ; i < 2 ; i++){
		let jsondata = {
				partner_code : partner_code
		};
		if(i == 0){
			manager_type = "00";
			manager_nm = $("#sup_nm").val();
			manager_rank = $("#sup_rank").val();
			manager_email = $("#sup_email").val();
			manager_phone = $("#sup_phone").val();
		}
		if(i == 1){
			manager_type = "01";
			manager_nm = $("#manager_nm").val();
			manager_rank = $("#manager_rank").val();
			manager_email = $("#manager_email").val();
			manager_phone = $("#manager_phone").val();
		}
		jsondata.manager_type = manager_type;
		jsondata.manager_nm = manager_nm;
		jsondata.manager_rank = manager_rank;
		jsondata.manager_email = manager_email;
		jsondata.manager_phone = manager_phone;

		data[i] = jsondata;
	}

	if(!dataValidate(partner_id, partner_nm, rep_nm, partner_zip, partner_status, partner_type, division_code , sup_nm, sup_rank, sup_email, sup_phone, manager_nm, manager_rank, manager_email, manager_phone)){
		return false;
	}
	
	let callUrl = "";
	let callBackFunc = "partnerModalResponse";
	let objParam = {};
	
	let partnerBtnId = $(this).attr("id");
	
	switch(partnerBtnId){
		case "partnerEnroll" :
			callUrl = "/admin/cubici/adminPreference/partnerinsert";
			
			if(!divisionComplete){
				modalInfo("구분 코드를 확인해주세요.");
				return false;
			}
			
			objParam ={
					  partner_code : $("#partnerType").val() + $("#division_code").val()
					, partner_id : partner_id
					, partner_nm : partner_nm
					, rep_nm : rep_nm
					, partner_zip : partner_zip
					, partner_address : partner_address
					, partner_status : partner_status
					, partner_type : partner_type
					, division_code : division_code
					, detail : detail
					, data : data
			}
			break;
			
		case "partnerUpdate" :
			callUrl = "/admin/cubici/adminPreference/partnerupdate";

			divisionComplete = true;
			
			objParam ={
					  partner_code : $("#partner_code").val()
					, partner_id : partner_id
					, partner_nm : partner_nm
					, rep_nm : rep_nm
					, partner_zip : partner_zip
					, partner_address : partner_address
					, partner_status : partner_status
					, partner_type : partner_type
					, division_code : division_code
					, detail : detail
					, data : data
			}
			break;
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc); 
});

$(document).on("click","#partnerDelete", function(){
	let partner_id = $("#partner_id").val();
	
	let callUrl = "/admin/cubici/adminPreference/partnerdelete";
	let callBackFunc = "partnerModalResponse";
	let objParam = {
			partner_id : partner_id
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function partnerModalResponse(result){
	if(result.resultCode == 0){
		$(location).attr("href",  "managePartner");
	}
} 

$(document).on('click', "#btnBizChk", function(){
	let bizNum = $.trim($("#partner_id").val());
	if (bizNum.length <= 0) {
		modalInfo("사업자번호를 입력해주세요.");
		return false;
	}

	let bizNoForm = ckBisNo(bizNum);
	if(bizNoForm === false){
		modalInfo("사업자 등록번호 형식이 올바르지 않습니다.");
		return false;
	}
	checkBizOverlap({FIRM_ID: bizNum, flag : 'partner'});
});


function dataValidate(partner_id, partner_nm, rep_nm, partner_zip, partner_status, partner_type, division_code, sup_nm, sup_rank, sup_email, sup_phone, manager_nm, manager_rank, manager_email, manager_phone){
	if(partner_nm === null || partner_nm === "" || partner_nm === undefined){
		modalInfo("회사명을 입력해주세요");
		return false;
	}
	if(partner_id === null || partner_id === "" || partner_id === undefined){
		modalInfo("사업자번호를 입력해주세요");
		return false;
	}
	if(!bizComplete){
		modalInfo("사업자 번호를 확인해주세요");
		return false;
	}
	if(rep_nm === null || rep_nm === "" || rep_nm === undefined){
		modalInfo("대표이사명을 입력해주세요");
		return false;
	}
	if(partner_zip === null || partner_zip === "" || partner_zip === undefined){
		modalInfo("주소를 입력해주세요");
		return false;
	}
	if(partner_status === null || partner_status === "" || partner_status === undefined){
		modalInfo("운영 상태를 선택해주세요");
		return false;
	}
	if(partner_type === null || partner_type === "" || partner_type === undefined){
		modalInfo("업종을 선택해주세요");
		return false;
	}
	if(division_code === null || division_code === "" || division_code === undefined){
		modalInfo("구분코드를 입력해주세요");
		return false;
	}
	if((sup_nm === null || sup_nm === "" || sup_nm === undefined) && (sup_rank.length > 0 || sup_email.length > 0 || sup_phone.length > 0)){
		modalInfo("책임자명을 입력해주세요");
		return false;
	}
	if((manager_nm === null || manager_nm === "" || manager_nm === undefined) && (manager_rank.length > 0 || manager_email.length > 0 || manager_phone.length > 0)){
		modalInfo("담당자명을 입력해주세요");
		return false;
	}

	let emailForm = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
	if(sup_email.length > 0){
		if(!emailForm.test(sup_email)) {
			modalInfo("이메일 형식이 올바르지 않습니다.");
			return false;
		}
	}
	if(manager_email.length > 0){
		if(!emailForm.test(manager_email)) {
			modalInfo("이메일 형식이 올바르지 않습니다.");
			return false;
		}	
	}
	
	let phoneForm = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/;
	if(sup_phone.length > 0){
		if(!phoneForm.test(sup_phone)){
			modalInfo("전화번호 형식이 올바르지 않습니다.");
			return false;
		}
	}
	if(manager_phone.length > 0){
		if(!phoneForm.test(manager_phone)){
			modalInfo("전화번호 형식이 올바르지 않습니다.");
			return false;
		}
	}
	return true;
}

$(document).on('click', "#divisionChk", function(){
	let partner_type = $("#partnerType option:selected").val();
	let division_code = $.trim($("#division_code").val());
	
	if(partner_type === null || partner_type === "" || partner_type === undefined){
		modalInfo("업종을 선택해주세요");
		return false;
	}
	if(division_code.length <= 0) {
		modalInfo("구분코드를 입력해주세요.");
		return false;
	}
	
	let partnerTypeForm = /^[A-Z]+$/;
	if(!partnerTypeForm.test(division_code)){
		modalInfo("대문자 2글자를 입력해주세요.");
		return false;
	}

	let callUrl = "/admin/cubici/adminPreference/divisionCodeAuth";
	let callBackFunc = "divisionCodeAuthResponse";
	let objParam = {
			partner_code : partner_type + division_code
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
});

function divisionCodeAuthResponse(data){
	let divisionCodeAuth = data.divisionCodeAuth;
	if(data.resultCode == 0){
		if(divisionCodeAuth == 0){
			divisionComplete = true;
			modalInfo("사용가능한 코드입니다.");
		}else {
			modalInfo("중복된 코드입니다.")
		}
	}
}
</script>

<div class="m-search">
	<ul>
		<li>
			<div class="fwBox">
				<span class="ft">회사명</span>
				<div class="input">
					<input type="text" id="PNKeyword" name="search">
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">상태</span>
				<div class="input">
					<select id="PSKeyword" name="search">
						<option value="">선 택</option>
						<option value="00">운영</option>
						<option value="01">종료</option>
					</select>
				</div>
			</div>
		</li>
		<li>
			<div class="fwBox">
				<span class="ft">대표자</span>
				<div class="input">
					<input type="text" id="RNKeyword" name="search">
				</div>
			</div>

		</li>
		<li>
			<div class="fwBox">
				<span class="ft-w">협력사 코드</span>
				<div class="input">
					<input type="text" id="PCKeyword" name="search">
				</div>
			</div>
		</li>
		<li>
			<div class="btns">
				<button class="sBtn sColorLB search" id="searchBtn">검색</button>
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
				<a href="javascript:;" data-toggle="modal" class="rBtn2 sColorLB" id="partnerInsert">기업 추가</a>
			</div>
		</div>
	</div>
	
	<div class="contentsArea">
		<div class="service-table fix-header">
			<table class="txt-center">
				<thead>
					<tr>
						<th class="b-b" rowspan="2">상태</th>
						<th class="b-b" rowspan="2">등록 일자
						</th>
						<th class="b-b" rowspan="2">구분</th>
						<th class="b-b" rowspan="2">회사명</th>
						<th class="b-b" rowspan="2">협력사 코드
						</th>
						<th class="b-b" rowspan="2">대표자</th>
						<th class="b-b" rowspan="2">사업자번호</th>
						<th class="b-b" colspan="2">담당자</th>
						<th class="b-b" rowspan="2">상세 보기
						</th>
					</tr>
					<tr class="b-b">
						<th class="b-b">이름</th>
						<th class="b-b">전화</th>
					</tr>
				</thead>
				<tbody id="listTbody">
				</tbody>
			</table>
		</div>
		<div class="fixBottom">
			<ul class="tableTotal txt-lefts">
				<li><span class="txt">전체 :</span><span class="result" id="partnerTotal"></span></li>
				<li><span class="txt">은행 :</span><span class="result" id="partnerTypeBA"></span></li>
				<li><span class="txt">B2B도매 :</span><span class="result" id="partnerTypeBB"></span></li>
				<li><span class="txt">마케팅 :</span><span class="result" id="partnerTypeCO"></span></li>
				<li><span class="txt">금융 :</span><span class="result" id="partnerTypeFI"></span></li>
				<li><span class="txt">제조 :</span><span class="result" id="partnerTypeMN"></span></li>
				<li><span class="txt">기타 :</span><span class="result" id="partnerTypeTH"></span></li>
			</ul>
		</div>
		<div id="pagingButton" class="m-paging"></div>
     		<div style = "display:none">
            	<input type="text" id="currentPageNum"/>
            </div>
	</div>
</div>

<jsp:include page="/WEB-INF/jsp/egovframework/azon/admin/cubici/adminPreference/managePartnerModal.jsp" flush="true" />