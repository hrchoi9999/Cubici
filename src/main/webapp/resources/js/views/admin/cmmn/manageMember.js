let user_code = new URLSearchParams(window. location.search).get('code'); 

$(document).ready(function(){
	tabInfo(0);
	
	$(this).on('click', '#paytab, #mbTab, #docTab',function(){
		history(1, $(this).attr("id"));
	});
	
	$('.listBtn').click(function(){
		let link =  window.location.pathname;
		let division = link.substr(7,1)
		
		if(division === 'c'){
			location.href='/admin/cubici/manageMember/member_tab2';
		} else if(division === 'm'){
			location.href='/admin/moneybank/management/usageList';
		}
	});
});


function goBack(){
	event.stopPropagation();
	history.back();
}

$(document).on('click', '#EnrollEvalbtns' ,function(){
	let detail = $('#evaldetail').val();
	
	if($('#evaldetail').val().length == 0) {
		modalInfo("평가 내용을 입력해주세요");
		return false;
	}
	evalEnroll(user_code, detail);
});

$(document).on('click', '#ModEvalbtns' ,function(){
	let detail = $('#evaldetail').val();
	
	if(detail.length == 0){
		modalInfo('평가 내용을 입력해주세요')
		return false;
	}
	evalModify(user_code, detail);
});

function evalEnroll(user_code, detail) {
	let callUrl = "/admin/cubici/manageMember/userstatus/evalenroll";
	let callbackFunc = redirect;
	let objParam = {
			code : user_code ,
			detail : detail
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callbackFunc);
}

function evalModify(user_code , detail) {
	let callUrl = "/admin/cubici/manageMember/userstatus/evalemodify";
	let callbackFunc = redirectMod;
	let objParam = {
			code : user_code ,
			detail : detail
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callbackFunc);
} 

function redirect(data){
	if(data.resultCode == 0){
		modalInfo("글등록")
		$('#EnrollEvalbtns').text('수정');
		$('#EnrollEvalbtns').attr('id', 'ModEvalbtns');
	}
}
function redirectMod(){
	modalInfo("글수정")
}

function tabInfo(currentPage){
	let dataPerPage = 10; 					
	let dataCnt = currentPage * dataPerPage;
	let mbid = $('#mbid').val();

	let callUrl = '/admin/moneybank/management/tabInfo';
	let callBackFunc = 'tabInfoResponse';
	let objParam = {
			user_code : user_code
		  , mbid : mbid
		  , dataPerPage : dataPerPage
		  , currentPage : currentPage
		  , dataCnt : dataCnt
   	};
	fileList('duplicateRegNo', mbid, 'documentList');
	fileList('duplicateMain', mbid, 'documentList');
	fileList('duplicateDemand', mbid, 'documentList');
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function tabInfoResponse(data){
	let mbDocTab = data.findMbTab;
	let history = data.history;
	
	$('#first_date').attr('value',mbDocTab.mb_first_reg_date);
	$('#product_code2').attr('value',mbDocTab.mb_product_code);
	$('#mbInfoMbid').attr('value',mbDocTab.mbid);
	$('#req_date').attr('value',mbDocTab.mb_request_date);
	$('#cont_date').attr('value',mbDocTab.mb_contract_date);
	$('#cont_exp_date2').attr('value',mbDocTab.mb_contract_expire_date);
	$('#biz_chk').text(mbDocTab.biz_no_chk);
	$('#reg_chk').text(mbDocTab.reg_no_chk);
	$('#national_chk').text(mbDocTab.national_tax_chk);
	$('#local_chk').text(mbDocTab.local_tax_chk);
	$('#health_chk').text(mbDocTab.health_insurance_chk);
	
	if(history.length > 0) {
		$('#usageCnt').text(history[0].CNT);
	}else {
		$('#usageCnt').text("0");
	}
}

let uuidArr = [];

function documentList(result){
	let fileList = result.fileList;
	
	$.each(fileList, function(i, item){
		uuidArr.push(item.uuid);
	});
	
	if(uuidArr.length === 3){
		$('.fileDownload').each(function (i, item) {
			$(item).attr('id', uuidArr[i])
		});
	}
}

function history(currentPage, tabId){
	currentPage = currentPage-1;
	let dataPerPage = 10; 					
	let dataCnt = currentPage * dataPerPage;
	let mbid = $('#mbid').val();
	
	let callUrl = '';
	let callBackFunc = 'historyTable';
	let objParam = {
			user_code : user_code
		  , mbid : mbid
		  , dataPerPage : dataPerPage
		  , currentPage : currentPage
		  , dataCnt : dataCnt
	}
	
	switch(tabId){
		case 'paytab' :
			callUrl = '/admin/cubici/manageMember/userstatus/paymentList';
			break;
		case 'mbTab' : case 'docTab':
			callUrl = '/admin/moneybank/management/history/'+ tabId;
			break;
	}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function historyTable(data){
	let payment = data.paymentList;
	let history = data.history;
	let trHtml = '';
	
	if(data.id === 'paytab'){
		if (payment.length > 0) {
			let tbodyHtml = "";
			$.each(payment, function(i, item){
				if(!item.change_date || !item.refund_amount || !item.promo_name){
					item.change_date = " ";
					item.refund_amount = " ";
					item.promo_name = " ";
				}
				tbodyHtml += "<tr>";
				tbodyHtml += "<td><div class='tIn'>"+ item.rnum+"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.payment_date +"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.charge_name +"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.start_date +"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.end_date +"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.amount +"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.change_date +"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.promo_name +"</div></td>";
				tbodyHtml += "<td><div class='tIn'>"+ item.refund_amount +"</div></td>";
			});
			$("#listTbody").empty().html(tbodyHtml);
		}else {
			trHtml = '<tr><td colspan="10">조회된 결과가 없습니다.</td></tr>';
			$('#listTbody').empty().html(trHtml);
			$('#pagingButton').empty();
		}
	} else if(data.id === 'mbTab' || data.id === 'docTab') {
		if(history.length > 0){
			$.each(history, function(i, item){
				trHtml += '<tr>';
				trHtml += '<td><div class="tIn">' + item.RNUM + '</div></td>';
				trHtml += '<td><div class="tIn">' + item.mb_contract_date + '</div></td>';
				trHtml += '<td><div class="tIn">' + item.mb_product_code + '</div></td>';
				if(data.id === 'mbTab'){
					trHtml += '<td><div class="tIn">' + item.calculate_deposit_amount + '</div></td>';
					trHtml += '<td><div class="tIn">' + item.mb_contract_expire_date + '</div></td>';
					trHtml += '<td><div class="tIn">' + item.service_day + ' 일</div></td>';
					trHtml += '<td><div class="tIn">' + item.fee_rate + ' %</div></td>';
					trHtml += '<td><div class="tIn">' + item.PCS + '</div></td>';
					trHtml += '<td><div class="tIn">' + item.PCM + '</div></td>';
				}else {
					trHtml += '<td><div class="tIn">' + item.mbid + '</div></td>';
					trHtml += '<td><div class="tIn"><a href="javascript:;"  class="oiBtn download">다운로드</a></div></td>';
				}
				trHtml += '</tr>';
			});
		}else {
			trHtml = '<tr><td colspan="10">조회된 결과가 없습니다.</td></tr>';
			$('#mbTbody, #docTbody').empty().html(trHtml);
			$('#mbPagingButton, #docPagingButton').empty();
		}
		if(data.id === 'mbTab'){
			$('#mbTbody').empty().append(trHtml);
		}else{
			$('#docTbody').empty().append(trHtml);
		}
	}
	historyResponse(data);
}

function historyResponse(data){
	let tabId = data.id;
	let history = data.history;
	let payment = data.paymentList;
	let pageMaxCnt = '';

	if(tabId === 'paytab'){
		if (payment.length > 0) {
			pageMaxCnt = Math.ceil(payment[0].CNT/ data.dataPerPage);
		} 
	} else if(tabId === 'mbTab' || tabId === 'docTab') {
		if(history.length > 0){
			pageMaxCnt = Math.ceil(history[0].CNT/ data.dataPerPage);
		}
	}
	let pageCnt = Math.floor(data.currentPage / 10); 
	let pageHtml = '';
	pageHtml += '<ul>';

	for(let i = (pageCnt * 10) + 1; i <= (pageCnt*10) + 10; i++){ 
		if(i > pageMaxCnt) {
			break;
		}
		if(i-1  == data.currentPage){
			pageHtml += '<li><a class="num active" href="javascript:history('+ i + ',\'' + tabId + '\');' + '">' + i + '</a></li>';
		}else{ 
			pageHtml += '<li><a class="num" href="javascript:history('+ i + ',\'' + tabId + '\');' + '">' + i + '</a></li>';
		}
	}
	if(pageCnt+1 < (pageMaxCnt/10)){
		pageHtml += '<li><a class="oiBtn next" href = "javascript:history('+ ((pageCnt+1)*10 + 1) + ',\'' + tabId + '\');' + '"> > </a></li>';
	}
	pageHtml += '</ul>';
	$("#pagingButton ,#mbPagingButton, #docPagingButton").empty().html(pageHtml);
}

$(document).on('click', '.fileDownload', function(){
	let uuid = $(this).attr('id');
	
	let objParam = {
		uuid : uuid,
		enc_type : 'N'
	}
	let callUrl = '/file/download';
	cubici.Ajax.download.fnRequest(objParam, callUrl);
});