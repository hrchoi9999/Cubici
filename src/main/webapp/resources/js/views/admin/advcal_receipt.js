
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
		
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {
			
			// 버튼 등의 이벤트 바인딩
			bindEvent();
			

		}
		
		
		function bindEvent() {
			$(document).keypress(function(e) { if (e.keyCode == 13) e.preventDefault(); });

			// 조회 버튼 클릭 이벤트
			$("#btnSearch").on("click", function(e) {
				e.preventDefault();
				
			//	$("#totalCnt").val('');
				
				$("#frm").attr("action", "/admin/cubici/receipt");
				$("#frm").attr("method", "post");
				$("#frm").submit();
								
			});
								
			
			// 엑셀 다운로드 클릭 이벤트 
//			$("#btnExcel").on("click", function() {
//				var shopInfo = $("#cmbShopInfo1 option:selected")[0].id;
//				var dueDate = $("#txtDueDate1").val();
//				var inFromDate = dueDate.split(" - ")[0];
//				var inToDate = dueDate.split(" - ")[1];
//				
//				var obj = {
//					shopType: shopInfo,
//					fromDate: inFromDate,
//					toDate: inToDate,
//					prdCode: "",
//					userId: userId
//				}
//				cfCustomExcelDownloadDyn("/calculate/findExcel", obj);
//			});
		}
		
		
		
//		function fnPage(page) {
//			
//			alert('21123');
//			
//		     $("#pageNo").val(page);
//		    	 fn_search();	     		     
//		}
		
		function _finalize() {
		}
		
		return {
            init : _init,
            finalize : _finalize
        };
    };
    
    
    var advcalstat = new Advcalstat();
    advcalstat.init();     
    
})();


	$(document).ready(function(){
		//paging	
		$("[name='pageSize']").find("option[value='${page.pageSize}']").prop("selected",true);
	});	
	
	
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
	
	function fnPage(page) {
		
		 $("#pageNo").val(page);
		 
		 $("#frm").attr("action", "/admin/cubici/receipt");
		 $("#frm").attr("method", "post");
		 $("#frm").submit();     		     
	}
	/* 엑셀 다운로드
	2020. 08. 27
	by KJC */
	function doExcelDownloadProcess(){
		// form 태그 생성
		$(".excelSpan").append('<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data"><input type="hidden" name="flag" value="receipt"></form>');
		// 개인/법인
		var bizType = $(":input[name='bizType']:checked").val();
		$("#excelForm").prepend('<input type="hidden" name="bizType" value="'+bizType+'">');
		// 신규 여부
		var newYn = $(":input[name='newYn']:checked").val();
		$("#excelForm").prepend('<input type="hidden" name="newYn" value="'+newYn+'">');
		// 선정산 상태
		var adv_status = $("select[name='adv_status']").val();
		$("#excelForm").prepend('<input type="hidden" name="adv_status" value="'+adv_status+'">');
		// 선정산 금액
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

