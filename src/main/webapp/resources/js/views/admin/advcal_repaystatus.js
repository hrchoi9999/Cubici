

/*******************************************************************************
 * 
 * repaystat.js
 * 
 * @author ktkim
 * @since 2020-02-01
 * 
 ******************************************************************************/

(function() {
	
	function Repaystat() {
		
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
		$("#from_contract_date,#to_contract_date").datepicker({ dateFormat: 'yy-mm-dd' }).val();
		$('#from_contract_date').datepicker();
		$('#to_contract_date').datepicker();
		$("#from_expire_date,#to_expire_date").datepicker({ dateFormat: 'yy-mm-dd' }).val();
		$('#from_expire_date').datepicker();
		$('#to_expire_date').datepicker();
				
		
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
		
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {
			
			paging();
			
			// 버튼 등의 이벤트 바인딩
			bindEvent();
			

		}
		
		
		function bindEvent() {
			$(document).keypress(function(e) { if (e.keyCode == 13) e.preventDefault(); });

			// 조회 버튼 클릭 이벤트
			$("#btnSearch").on("click", function() {
				
				$("#frm").attr("action", "/admin/cubici/repayment");
				$("#frm").attr("method", "post");
				$("#frm").submit();
								
			});
			
			
			// 모달 내에서 TAB 기능
			$('ul.tabs li').click(function(){
				var tab_id = $(this).attr('data-tab');
			
				$('ul.tabs li').removeClass('current');
				$('.tab-content').removeClass('current');
			
				$(this).addClass('current');
				$("#"+tab_id).addClass('current');
			})

			$("#changeInfo").on("click", function(){
				
				let thisUserId = $("#thisUserId").val();
				let thisAdvcalId = $("#thisAdvcalId").val();
				let testDate = $("#forDate").val();
				let testAmount = $("#priceValue").val();
				let testShop = $("select[name=shopInfo]").val();
				var thisUserNo = $("#thisUserNo").val();
				
				getCalcData(thisUserId, thisAdvcalId, testDate, testAmount, testShop, thisUserNo);
				
			})
		
			
		}
		
			
		function paging(){
			$("[name='pageSize']").find("option[value='${page.pageSize}']").prop("selected",true);
		}
		
		function fnPage(page) {
		     $("#pageNo").val(page);
		    	 fn_search();	     		     
		}
		
		function _finalize() {
		}
		
		return {
            init : _init,
            finalize : _finalize
        };
    };
    
    var repaystat = new Repaystat();
    repaystat.init();
    
})();


function getModel(cnt){
	
	let user_no = $("#for_modal_user_no"+cnt).val();
	
	$.ajax({
		url: "/admin/cubici/repayment_detail",
		type: "post",
		global: true,
		dataType: "json",
		data: {
			user_no : user_no
		},
		success: function (result) {
			
			$("#thisUserId").val(result.rm.USER_ID);
			$("#thisAdvcalId").val(result.rm.ADVCAL_ID);
			$("#thisUserNo").val(result.rm.USER_NO);
			
			$("#USER_NM").text(result.rm.USER_NM);
			$("#USER_NM2").text(result.rm.USER_NM);
			$("#USER_ID").text(result.rm.USER_ID);
			$("#REG_DATETIME").text(result.rm.REG_DATETIME);
			$("#FIRM_NM").text(result.rm.FIRM_NM);
			$("#FIRM_ID").text(result.rm.FIRM_ID);
			$("#BUSINESS_TYPE").text(result.rm.BUSINESS_TYPE);
			$("#SECTORS").text(result.rm.SECTORS);
			$("#FIRM_SETUP_DATE").text(result.rm.FIRM_SETUP_DATE);
			$("#USER_PHONE").text(result.rm.USER_PHONE);
			$("#USER_EMAIL").text(result.rm.USER_EMAIL);
			$("#FIRM_TEL").text(result.rm.FIRM_TEL);
			$("#FIRM_ADDR").text(result.rm.FIRM_ADDR);
			$("#DEPOSIT_BANK").text(result.rm.DEPOSIT_BANK);
			$("#DEPOSIT_BANK2").text(result.rm.DEPOSIT_BANK);
			$("#ACCOUNT_NUM").text(result.rm.ACCOUNT_NUM);
			$("#ACCOUNT_NUM2").text(result.rm.ACCOUNT_NUM);
			$("#ADVCAL_AMOUNT").text(result.rm.ADVCAL_AMOUNT);
			$("#CUMULAT_REPAY_AMT").text(result.rm.CUMULAT_REPAY_AMT);
			$("#ADVCAL_REMAIN_AMT").text(result.rm.ADVCAL_REMAIN_AMT);
			$("#DAILY_CONT_CHARGE_RATE").text(result.rm.DAILY_CONT_CHARGE_RATE);
						
			var trHtml = '';		
			for(var i = 0; i<result.repayList.length; i++){				
				let thisMap = result.repayList[i];
				let rowNum = (i*=1)+1;				
				trHtml+='<tr>';
				trHtml+='<td align="center">'+rowNum+'</td>';
				trHtml+='<td>'+thisMap.DEPOSIT_DATE+'</td>';
				trHtml+='<td>입금</td>';
				trHtml+='<td>'+thisMap.REPAY_AMT+'</td>';
				trHtml+='<td>'+thisMap.REPAY_AMT+'</td>';
				trHtml+='<td>'+thisMap.USING_TERM+'</td>';
				trHtml+='<td>'+thisMap.CHARGE_AMT+'</td>';
				trHtml+='<td>'+thisMap.REMAIN_AMT+'</td>';
				trHtml+='</tr>';			
			}		
			$("#repayDetailTable > tbody").empty();		
			$("#repayDetailTable > tbody").html(trHtml);		
		}
	});	
	
	$("#detailModal").modal("show");
}


	function getPop_new(rowno){
		
		var advcal_id = $("#for_modal_advcal_id"+rowno).val();
		var yesno = $("#for_modal_evaluate_yn"+rowno).val();
		var sel = $("#for_sel_approval_yn"+rowno).val();
		
		$("#modal_user_nm").val($("#for_modal_user_nm"+rowno).val());
		$("#modal_user_id").val($("#for_modal_user_id"+rowno).val());
		$("#modal_user_no").val($("#for_modal_user_no"+rowno).val());
		$("#modal_user_phone").val($("#for_modal_user_phone"+rowno).val());
		
		if(advcal_id != null && advcal_id != ''){				
			$("#modal_advcal_id").val($("#for_modal_advcal_id"+rowno).val());
		} else{			
			$("#modal_advcal_id").val("");
		}
		if(yesno == 'Y'){
			$("#modal_evaluate_yn").val('YES');
		} else{
			$("#modal_evaluate_yn").val('NO');
		}
		if(sel == 'Y'){
			$("#sel_approval_yn1").prop('checked', true)
		} else{
			$("#sel_approval_yn2").prop('checked', true)
		}
		
		// 팝업 띄우기
		$('#approvalModal').modal('show');
		
	}
	
	
	function getCalcData(thisUserId, thisAdvcalId, testDate, testAmount, testShop, thisUserNo){
		
		$.ajax({
			url: "/admin/cubici/repayment_detail_test",
			method: "POST",
			data: {
				userId : thisUserId,
				advcalId : thisAdvcalId,
				forDate : testDate,
				testAmount : testAmount,
				shopType : testShop,
				user_no : thisUserNo
			},
			dataType : "json",
			success : function(resultx){				
				$.ajax({
					url: "/admin/cubici/repayment_detail",
					type: "post",
					global: true,
					dataType: "json",
					data: {
						user_no : thisUserNo
					},
					success: function (result) {
						
						$("#thisUserId").val(result.rm.USER_ID);
						$("#thisAdvcalId").val(result.rm.ADVCAL_ID);
						$("#thisUserNo").val(result.rm.USER_NO);
						
						$("#USER_NM").text(result.rm.USER_NM);
						$("#USER_NM2").text(result.rm.USER_NM);
						$("#USER_ID").text(result.rm.USER_ID);
						$("#REG_DATETIME").text(result.rm.REG_DATETIME);
						$("#FIRM_NM").text(result.rm.FIRM_NM);
						$("#FIRM_ID").text(result.rm.FIRM_ID);
						$("#BUSINESS_TYPE").text(result.rm.BUSINESS_TYPE);
						$("#SECTORS").text(result.rm.SECTORS);
						$("#FIRM_SETUP_DATE").text(result.rm.FIRM_SETUP_DATE);
						$("#USER_PHONE").text(result.rm.USER_PHONE);
						$("#USER_EMAIL").text(result.rm.USER_EMAIL);
						$("#FIRM_TEL").text(result.rm.FIRM_TEL);
						$("#FIRM_ADDR").text(result.rm.FIRM_ADDR);
						$("#DEPOSIT_BANK").text(result.rm.DEPOSIT_BANK);
						$("#DEPOSIT_BANK2").text(result.rm.DEPOSIT_BANK);
						$("#ACCOUNT_NUM").text(result.rm.ACCOUNT_NUM);
						$("#ACCOUNT_NUM2").text(result.rm.ACCOUNT_NUM);
						$("#ADVCAL_AMOUNT").text(result.rm.ADVCAL_AMOUNT);
						$("#CUMULAT_REPAY_AMT").text(result.rm.CUMULAT_REPAY_AMT);
						$("#ADVCAL_REMAIN_AMT").text(result.rm.ADVCAL_REMAIN_AMT);
						$("#DAILY_CONT_CHARGE_RATE").text(result.rm.DAILY_CONT_CHARGE_RATE);
									
						var trHtml = '';		
						for(var i = 0; i<result.repayList.length; i++){				
							let thisMap = result.repayList[i];
							let rowNum = (i*=1)+1;				
							trHtml+='<tr>';
							trHtml+='<td align="center">'+rowNum+'</td>';
							trHtml+='<td>'+thisMap.DEPOSIT_DATE+'</td>';
							trHtml+='<td>입금</td>';
							trHtml+='<td>'+thisMap.REPAY_AMT+'</td>';
							trHtml+='<td>'+thisMap.REPAY_AMT+'</td>';
							trHtml+='<td>'+thisMap.USING_TERM+'</td>';
							trHtml+='<td>'+thisMap.CHARGE_AMT+'</td>';
							trHtml+='<td>'+thisMap.REMAIN_AMT+'</td>';
							trHtml+='</tr>';			
						}		
						$("#repayDetailTable > tbody").empty();		
						$("#repayDetailTable > tbody").html(trHtml);		
					}
				});	
				
			},
			error : function(result){
				modalInfoFunc("서버 통신 오류");
			}
			
		})
	}
	
		
	/* 엑셀 다운로드
	2020. 08. 27
	by KJC */
	function doExcelDownloadProcess(){
		// form 태그 생성
		$(".excelSpan").append('<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data"><input type="hidden" name="flag" value="approval"></form>');
		// 선정산 승인 여부
		var adv_req = $(":input[name='adv_req']:checked").val();
		$("#excelForm").prepend('<input type="hidden" name="adv_req" value="'+adv_req+'">');
		// 선정산 심사 여부
		var evaluate_yn = $(":input[name='evaluate_yn']:checked").val();
		$("#excelForm").prepend('<input type="hidden" name="evaluate_yn" value="'+evaluate_yn+'">');
		// 선정산 상태
		var adv_status = $("select[name='adv_status']").val();
		$("#excelForm").prepend('<input type="hidden" name="adv_status" value="'+adv_status+'">');
		// 선정산 가능 금액
		var fromAmt = $("input[name='fromAmt']").val();
		var toAmt = $("input[name='toAmt']").val();
		$("#excelForm").prepend('<input type="hidden" name="fromAmt" value="'+fromAmt+'">');
		$("#excelForm").prepend('<input type="hidden" name="toAmt" value="'+toAmt+'">');
		// 선정산 신청일
		var fromDate = $("input[name='fromDate']").val();
		var toDate = $("input[name='toDate']").val();
		$("#excelForm").prepend('<input type="hidden" name="fromDate" value="'+fromDate+'">');
		$("#excelForm").prepend('<input type="hidden" name="toDate" value="'+toDate+'">');
		// 검색 이름
		var idname = $("select[name='idname']").val();
		$("#excelForm").prepend('<input type="hidden" name="idname" value="'+idname+'">');
		var search_txt = $("input[name='search_txt']").val();
		$("#excelForm").prepend('<input type="hidden" name="search_txt" value="'+search_txt+'">');
		
	    var f = document.excelForm;
	    f.action = "/admin/excelDownload";
	    f.submit();
	}

	function openTab(url, userNo) {
		var param = {
				userNo : userNo
		};		
		var win = postOpen('POST', url, param , '_blank');
		//win.focus();
	}

	function postOpen(verb, url, data, target) {
	    
	    var form = document.createElement("form");
	    form.action = location.origin + url;
	    form.method = verb;
	    form.target = target || "_self";
	    if (data) {
	      for (var key in data) {
	        var input = document.createElement("textarea");
	        input.name = key;
	        input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
	        form.appendChild(input);
	      }
	    }
	    form.style.display = 'none';
	    document.body.appendChild(form);
	    form.submit();
	}
	

