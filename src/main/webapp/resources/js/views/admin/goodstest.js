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
				
				$("#frm").attr("action", "/goodstest");
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
	

