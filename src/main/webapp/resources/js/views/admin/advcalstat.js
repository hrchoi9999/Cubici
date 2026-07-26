/*******************************************************************************
 * 
 * advcalstat.js
 * 
 * @author ktkim
 * @since 2020-02-01
 * 
 ******************************************************************************/

(function() {
	
	function Advcalstat() {
		
		// 분석기간
		$.datepicker.setDefaults({
	        dateFormat: 'yymmdd',
	        prevText: '이전 달',
	        nextText: '다음 달',
	        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
	        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
	        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
	        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
	        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
	        showMonthAfterYear: true,
	        yearSuffix: '년'
	    });
		$("#fromDate,#toDate").datepicker({ dateFormat: 'yy-mm-dd' }).val();
		$('#fromDate').datepicker();
		$('#toDate').datepicker();
		
		// 쇼핑몰 구분
		var shopCODE_ID = $("#shopCODE_ID").val();
		var shopName;
		switch(shopCODE_ID){
			case '1':
				shopName = '인터파크';
				break;
			case '2':
				shopName = '지마켓';
				break;
			case '3':
				shopName = '옥션';
				break;
			case '4':
				shopName = '11번가';
				break;
			case '11':
				shopName = '쿠팡';
				break;
			case '12':
				shopName = '티몬';
				break;
			case '13':
				shopName = '웨메프';
				break;
			case '14':
				shopName = '네이버';
				break;
			default:
				shopName = '전체';
				break;
		}
		
		/* 초기화 메소드 */
		function _init() {
			
			paging();
			// 버튼 등의 이벤트 바인딩
			bindEvent();
		}
		
		function bindEvent() {
			
			$(document).keypress(function(e) { if (e.keyCode == 13) e.preventDefault(); });

			// 조회 버튼 클릭 이벤트
			$("#btnSearch").on("click", function() {
				
				$("#frm").attr("action", "/admin/cubici/advcalstat");
				$("#frm").attr("method", "post");
				$("#frm").submit();
								
			});
		}
		
		function paging(){
			$("[name='pageSize']").find("option[value='${page.pageSize}']").prop("selected",true);	
		}
		
		function fnPage(page) {
		     $("#pageNo").val(page);	     
		    	 fn_search();	     		     
		}
		
		function _finalize() { }
		
		return {
            init : _init,
            finalize : _finalize
        };
    };
    
    var advcalstat = new Advcalstat();
    advcalstat.init();     
    
})();

/* 엑셀 다운로드
2020. 08. 27
by KJC */
function doExcelDownloadProcess(){
	// 선정산 신청 여부
	var adv_req = $(":input[name='adv_req']:checked").val();
	//console.log(adv_req);
	$("#excelForm").prepend('<input type="hidden" name="adv_req" value="'+adv_req+'">');
	// 선정산 심사 여부
	var evaluate_yn = $(":input[name='evaluate_yn']:checked").val();
	//console.log(evaluate_yn);
	$("#excelForm").prepend('<input type="hidden" name="evaluate_yn" value="'+evaluate_yn+'">');
	// 선정산 상태
	var adv_status = $("select[name='adv_status']").val();
	//console.log(adv_status);
	$("#excelForm").prepend('<input type="hidden" name="adv_status" value="'+adv_status+'">');
	// 선정산 가능 금액
	var fromAmt = $("input[name='fromAmt']").val();
	var toAmt = $("input[name='toAmt']").val();
	//console.log(fromAmt+" ::: "+toAmt);
	$("#excelForm").prepend('<input type="hidden" name="fromAmt" value="'+fromAmt+'">');
	$("#excelForm").prepend('<input type="hidden" name="toAmt" value="'+toAmt+'">');
	// 선정산 신청일
	var fromDate = $("input[name='fromDate']").val();
	var toDate = $("input[name='toDate']").val();
	//console.log(fromDate+" ::: "+toDate);
	$("#excelForm").prepend('<input type="hidden" name="fromDate" value="'+fromDate+'">');
	$("#excelForm").prepend('<input type="hidden" name="toDate" value="'+toDate+'">');
	// 검색 이름
	var idname = $("select[name='idname']").val();
	$("#excelForm").prepend('<input type="hidden" name="idname" value="'+idname+'">');
	var search_txt = $("input[name='search_txt']").val();
	$("#excelForm").prepend('<input type="hidden" name="search_txt" value="'+search_txt+'">');
	//console.log(idname+" ::: "+search_txt);
	
    var f = document.excelForm;
    f.action = "/admin/excelDownload";
    f.submit();
}

function getPop(rowno){
	
	var advcal_id = $("#for_modal_advcal_id"+rowno).val();		
	var yesno = $("#for_modal_evaluate_yn"+rowno).val();
	var sel = $("#for_sel_approval_yn"+rowno).val();
	var status = $("#for_modal_hellopay_status"+rowno).val();
	
	$("#modal_user_nm").val($("#for_modal_user_nm"+rowno).val());
	$("#modal_user_id").val($("#for_modal_user_id"+rowno).val());
	$("#modal_firm_nm").val($("#for_modal_firm_nm"+rowno).val());
	$("#modal_business_type_nm").val($("#for_modal_business_type_nm"+rowno).val());
	$("#modal_evaluate_yn").val($("#for_modal_evaluate_yn"+rowno).val());

	
	var advcal_amount = $("#for_modal_advcal_amount"+rowno).val();		
	$("#modal_advcal_amount").val(comma2(advcal_amount)+'원');
	
	var daily_cont_charge_rate = $("#for_modal_daily_cont_charge_rate"+rowno).val();
	$("#modal_daily_cont_charge_rate").val(daily_cont_charge_rate+'%');
	
	
	if(advcal_id != null && advcal_id != ''){				
		$("#modal_advcal_id").val($("#for_modal_advcal_id"+rowno).val());				
	} else{			
		$("#modal_advcal_id").val("");
	}
	
	if(yesno == 'Y'){
		$("#modal_evaluate_yn").val('심사완료');
	} else{
		$("#modal_evaluate_yn").val('미완료');
	}
	
	if(status == 'request'){
		$("#modal_hellopay_status").val('신청');
	} else if(status == 'judge'){
		$("#modal_hellopay_status").val('심사');
	} else if(status == 'deny'){
		$("#modal_hellopay_status").val('거부');
	} else if(status == 'approval'){
		$("#modal_hellopay_status").val('승인완료');
	} else if(status == 'contract'){
		$("#modal_hellopay_status").val('계약');
	} else if(status == 'mng'){
		$("#modal_hellopay_status").val('관리');
	} else if(status == 'expire'){
		$("#modal_hellopay_status").val('만료');
	} 
			
	// 팝업 띄우기
	$('#stateModal').modal('show');
	
}

function comma2(str) {
	str = String(str);		
	if(str.indexOf(",") > 0) {
		str = str.replace(/,/gi, '');
	}		
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}
