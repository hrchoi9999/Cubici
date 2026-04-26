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
				
				$("#frm").attr("action", "/admin/cubici/approval");
				$("#frm").attr("method", "post");
				$("#frm").submit();
								
			});
			
			$("#saveApproval").on("click", function() {
				var evaluate_date = $("#modal_evaluate_date").val();
				var str1 = evaluate_date.replace(/-/g,''); // ,제거
				var str2 = str1.substring(0, 8);
				
//				if(str2 != getToday()){
//					alert('정산예정금을 가져온 날짜가 오늘 날짜와 일치하지 않습니다.\n 심사평가 페이지에서 정산예정금을 다시 불러오세요!!');
//					return;
//				}
								
				// 중복버튼 클릭 방지.
				$("#saveApproval").prop("disabled", true);
				$("#cover-spin").css({"display": "block"});
				
				var post_url = "/admin/cubici/approval_save"; //get form action url
				var request_method = "post"; //get form GET/POST method
				var formData = $("[id='frm2']").serialize(); // 데이타 가져옴 
				var userId = $("[id='modal_user_id']").val();
				var userPhone = $("[id='modal_user_phone']").val();
				var userNm = $("[id='modal_user_nm']").val();
				
				$.ajax({ // 신용,은행,통화내역 저장.
					url : post_url,
					type: request_method,
					data : formData,
					dataType : 'json',
					error : function(request){
						$("#cover-spin").css({"display": "none"});
						console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
					}
					}).done(function(response){
						if (response.success == "N") {
							$("#cover-spin").css({"display": "none"});
		                    alert("저장 실패 !!");
		                    return;
		                } else if (response.success =='Y') {
		                	$("#cover-spin").css({"display": "none"});
		                	// 메일 보내기 함수 호출
		                	sendMail(userId, userNm, userPhone, response.approvalYn);
		                	
		                } else {
		                	$("#cover-spin").css({"display": "none"});
		                    alert("<spring:message code='fail.common.msg' />");
		                }
						
						$("#saveApproval").prop("disabled", false);
						
					});				
			});			
			
		}
		
		function sendMail(userId, userNm, userPhone, approvalYn){
			$.ajax({ // 신용,은행,통화내역 저장.
				url : '/admin/member/sendMail',
				type: 'post',
				data : {userId, userNm, approvalYn},
				dataType : 'json',
				error : function(request){
					console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
				}
				}).done(function(response){
					if (response.success == "N") {
	                    alert("저장 실패 !!");
	                    return;
	                } else if (response.success =='Y') {
	                	// 문자 보내기 함수 호출
	                	sendSms(userId, userNm, userPhone, approvalYn);
	                } else {
	                    alert("<spring:message code='fail.common.msg' />");
	                }
				});
		}
		
		function sendSms(userId, userNm, userPhone, approvalYn){
			$.ajax({ 
				url : '/admin/member/sendSms',
				type: 'post',
				data : {userId, userNm, userPhone, approvalYn},
				dataType : 'json',
				error : function(request){
					console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
				}
				}).done(function(response){
					if (response.success == "N") {
	                    alert("저장 실패 !!");
	                    return;
	                } else if (response.success =='Y') {
	                	alert("정상적으로 데이타를 저장을 하고\n이메일과 SMS를 보냈습니다.");
	                	window.location.href='/admin/cubici/approval';
	                } else {
	                    alert("<spring:message code='fail.common.msg' />");
	                }
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

function getPop(rowno){

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
	$("#modal_evaluate_date").val($("#for_modal_evaluate_date"+rowno).val());
	
	// 팝업 띄우기
	$('#approvalModal').modal('show');
}

function getToday(){
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
  //  return year + "-" + month + "-" + day;
    return year + month + day;
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
