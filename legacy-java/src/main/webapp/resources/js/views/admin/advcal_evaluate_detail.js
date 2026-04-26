
/*******************************************************************************
 * 
 * advcalevaluate_detail.js
 * 
 * @author ktkim
 * @since 2020-02-01
 * 
 ******************************************************************************/

(function() {
	
	var advcal_yn = "N";
		
	$(document).ready(function()
	{		
		// 최종 선정산 금액 초기화
//		var shop_due_amount = $('#shop_due_amount').val();
//	    var advcal_rate = $('#advcal_rate').val();
//	    var amt = comma(Math.round(shop_due_amount * advcal_rate / 100));
//	    $('#advcal_amount').val(amt);
//	    
//	    // 최종 선정산 금액 이벤트
//		$('#advcal_rate').on('change', function (e) {
//		    var shop_due_amount = $('#shop_due_amount').val();
//		    var advcal_rate = $('#advcal_rate').val();
//		    var amt = comma(Math.round(shop_due_amount * advcal_rate / 100));
//		    $('#advcal_amount').val(amt);
//		});
		
		// 주문건당한도(최대금액) 초기화
	    var case_order_amount = comma(Math.round($('#case_order_amount').val()));
	    $('#case_order_amount').val(case_order_amount);
		
		// 최종 선정산 금액 이벤트
		$('#case_order_amount').on('change', function (e) {
			var case_order_amount = comma(Math.round($('#case_order_amount').val()));
		    $('#case_order_amount').val(case_order_amount);
		});
		
	});
			
	function Advcalevaluate_detail() {
		
		// 달력
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
//		$("tonghwa_date1,tonghwa_date2,tonghwa_date3,tonghwa_date4,tonghwa_date5").datepicker({ dateFormat: 'yy-mm-dd' }).val();
		$('#tonghwa_date1').datepicker();
		$('#tonghwa_date2').datepicker();
		$('#tonghwa_date3').datepicker();
		$('#tonghwa_date4').datepicker();
		$('#tonghwa_date5').datepicker();
			
		
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
		
		// 주문건당한도 변경 이벤트
		$("#case_order_amount").on("change keyup", function() {
			advcal_yn = "N";		    		    	    
		});
		// 최종선정산비율 변경 이벤트
		$("#advcal_rate").on("change keyup", function() {
			advcal_yn = "N";	    		    	    
		});
		
		
		
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {
			
			// 버튼 등의 이벤트 바인딩
			bindEvent();			

		}
		
		
		function bindEvent() {
			$(document).keypress(function(e) { if (e.keyCode == 13) e.preventDefault(); });	
			
//			$("#advcal_amount").on("focus", function() {				
//				var val = $("#advcal_amount").val();				
//				if(!isEmpty(val)){
//					val = val.replace(/,/g,''); // ,제거
//					$("#advcal_amount").val(val);
//				}				
//			});			
//			
//			$("#advcal_amount").on("blur", function() {				
//				var val = $("#advcal_amount").val();
//				if(!isEmpty(val) && isNumeric(val)){
//					val = currencyFormatter(val);
//					$("#advcal_amount").val(val);
//				}			
//			});
			
			$("#case_order_amount").on("focus", function() {				
				var val = $("#case_order_amount").val();				
				if(!isEmpty(val)){
					val = val.replace(/,/g,''); // ,제거
					$("#case_order_amount").val(val);
				}				
			});			
			
			$("#case_order_amount").on("blur", function() {				
				var val = $("#case_order_amount").val();
				if(!isEmpty(val) && isNumeric(val)){
					val = currencyFormatter(val);
					$("#case_order_amount").val(val);
				}			
			});
			
			
			// 정산예정금 불러오기 클릭 이벤트
			$("#btnAdvCal").on("click", function() {
				
				if(!valCheck2()) return;
				
				$("#cover-spin").css({"display": "block"});
				
				var post_url = "/admin/cubici/evaluate_detail_advcal"; //get form action url
				var request_method = "post"; //get form GET/POST method
				var case_order_amount = $("#case_order_amount").val().replace(/,/g, "");
				
				$.ajax({ // 신용,은행,통화내역 저장.
					url : post_url,
					type: request_method,
					data : {user_no:$("#user_no").val(), case_order_amount:case_order_amount, advcal_rate:$("#advcal_rate").val()},
					dataType : 'json',
					error : function(request){
						$("#cover-spin").css({"display": "none"});
						console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);	
					}
					}).done(function(response){
						if (response.success == "N") {
							$("#cover-spin").css({"display": "none"});
		                    alert("가져오기 실패!!");
		                    return;
		                } else if (response.success =='Y') {
		                	$("#cover-spin").css({"display": "none"});
		                	
		                	var am = comma(response.advcal_amount);
		                	$("#advcal_amount").val(am);
//		                	$("#cal_avail_amount").val(am);
		                	$("#shop_due_amount").val(comma(response.shop_due_amount));
		                	$("#advcal_rate_label").val($("#advcal_rate").val());
		                	
		                } else {
		                	$("#cover-spin").css({"display": "none"});
		                    alert("<spring:message code='fail.common.msg' />");
		                }
					});	
				
				
											
			});

			// 저장 버튼 클릭 이벤트
			$("#btnSave").on("click", function() {
				
				if(!valCheck()) return;
								
				var rs = confirm("정말로 저장하시겠습니까?");
				if(!rs) return;
				
				$("#cover-spin").css({"display": "block"});
								
				var post_url = "/admin/cubici/evaluate_detail_save"; //get form action url
				var request_method = "post"; //get form GET/POST method
				var formData = $("[name='frm']").serialize(); // 데이타 가져옴

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
		                    alert("저장 실패");
		                    return;
		                } else if (response.success =='Y') {
		                	$("#cover-spin").css({"display": "none"});
		                	alert("저장에 성공했습니다.");
		                	window.location.href='/admin/cubici/evaluate';
		                } else {
		                	$("#cover-spin").css({"display": "none"});
		                    alert("<spring:message code='fail.common.msg' />");
		                }
					});								
			});
		}
		
		function valCheck() {
			
			if(advcal_yn == 'N'){
				alert("먼저 정산예정금 불러오기 버튼을 눌러주세요!!");
				return false;
			}
			
			// Prism 등급
			var prism_grade = $("#prism_grade").val();
			if(prism_grade == null || prism_grade == "") {
				alert("Prism 등급을 입력하시기 바랍니다.");
				$("#prism_grade").focus();
				return false;
			}
			
			// Prism 점수
			var prism_score = $("#prism_score").val();
			if(prism_score == null || prism_score == "") {
				alert("Prism 점수을 입력하시기 바랍니다.");
				$("#prism_score").focus();
				return false;
			}
			
			if(prism_score < 1){
				alert("Prism 점수는 0 보다 커야 합니다.");
				$("#prism_score").focus();
				return false;
			}			
			
			// 기준수수료율
			var standard_charge_rate = $("#standard_charge_rate").val();
			if(standard_charge_rate == null || standard_charge_rate == "") {
				alert("기준수수료율을 입력하시기 바랍니다.");
				$("#standard_charge_rate").focus();
				return false;
			}
			
			if(standard_charge_rate == 0 ||  standard_charge_rate > 100){
				alert("기준수수료율은 0 보다 크고 100 이하여야 합니다.");
				$("#standard_charge_rate").focus();
				return false;
			}			
			
			// 최종 선정산 금액
			var advcal_amount = $("#advcal_amount").val();
			if(advcal_amount == null || advcal_amount == "") {
				alert("최종 선정산 금액을 입력하시기 바랍니다.");
				$("#advcal_amount").focus();
				return false;
			}
			
			// 주문건당 한도금액
			var case_order_amount = $("#case_order_amount").val();
			if(case_order_amount == null || case_order_amount == "") {
				alert("주문건당 한도금액을 입력하시기 바랍니다.");
				$("#case_order_amount").focus();
				return false;
			}
			
			// 최종 수수료율
			var daily_cont_charge_rate = $("#daily_cont_charge_rate").val();
			if(daily_cont_charge_rate == null || daily_cont_charge_rate == "") {
				alert("최종 수수료율을 입력하시기 바랍니다.");
				$("#daily_cont_charge_rate").focus();
				return false;
			}
			
			if(daily_cont_charge_rate == 0 ||  daily_cont_charge_rate > 100){
				alert("최종 수수료율은 0보다 크고 100 이하여야 합니다.");
				$("#daily_cont_charge_rate").focus();
				return false;
			}
			
			// 최종 선정산비율
			var advcal_rate = $("#advcal_rate").val();
			if(advcal_rate == null || advcal_rate == "") {
				alert("최종 선정산비율을 입력하시기 바랍니다.");
				$("#advcal_rate").focus();
				return false;
			}
			
			// 조정이유
			var comment = $("#comment").val();
			if(comment == null || comment == "") {
				alert("조정이유를 입력하시기 바랍니다.");
				$("#comment").focus();
				return false;
			}
			
			// 접수서류 및 전화확인 심사 완료 여부 및 선정산 심사완료 여부 선택
			var receipt_yn = $("#receipt_yn").val();
			var chk_radio = document.getElementsByName('evaluate_yn');
			var evaluate_yn = null;
			for(var i=0;i<chk_radio.length;i++){
				if(chk_radio[i].checked == true){ 
					evaluate_yn = chk_radio[i].value;
				}
			}
			if(evaluate_yn == "Y") $("#hellopay_status").val('6'); // 상태값  : 심사완료
			else $("#hellopay_status").val('5'); // 상태값 : 심사중
			
			if(evaluate_yn == "Y" && receipt_yn == "N") {
			alert("접수서류 및 전화확인 심사완료여부가\n완료이어야 평가완료가 가능합니다.!!");
			return false;
			}
			
			advcal_yn = 'N';
			
			return true;
		}
		
		function valCheck2(){
			// 주문건당 한도금액
			var case_order_amount = $("#case_order_amount").val();
			
			if(case_order_amount == null || case_order_amount == "") {
				alert("주문건당 한도금액을 입력하시기 바랍니다.");
				$("#case_order_amount").focus();
				return false;
			}			
			
			if(case_order_amount < 1){
				alert("주문건당 한도금액은 0 보다 커야 합니다.");
				$("#case_order_amount").focus();
				return false;
			}
			
			// 최종 수수료율
			var daily_cont_charge_rate = $("#daily_cont_charge_rate").val();
			if(daily_cont_charge_rate == null || daily_cont_charge_rate == "") {
				alert("최종 수수료율을 입력하시기 바랍니다.");
				$("#daily_cont_charge_rate").focus();
				return false;
			}
			
			if(daily_cont_charge_rate == 0 ||  daily_cont_charge_rate > 100){
				alert("최종 수수료율은 0보다 크고 100 이하여야 합니다.");
				$("#daily_cont_charge_rate").focus();
				return false;
			}
			
			// 최종 선정산비율
			var advcal_rate = $("#advcal_rate").val();
			if(advcal_rate == null || advcal_rate == "") {
				alert("최종 선정산비율을 입력하시기 바랍니다.");
				$("#advcal_rate").focus();				
				return false;
			}
			
			if(advcal_rate == 0 ||  advcal_rate > 100){
				alert("최종 선정산비율은 0 보다 크고 100 이하여야 합니다.");
				$("#advcal_rate").focus();
				return false;
			}
			
			advcal_yn = "Y";
			
			return true;
		}	
		
		
		function isEmpty(value){
			if(value.length == 0 || value == null){
				return true;
			} else{
				return false;
			}
		}
		
		function isNumeric(value){
			var regExp = /^[0-9]+$/g;
			return regExp.test(value);
		}
		
		function currencyFormatter(amt){
			return amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}		
			
		function _finalize() {
		}
		
		return {
            init : _init,
            finalize : _finalize
        };
    };
    
    var advcalevaluate_detail = new Advcalevaluate_detail();
    advcalevaluate_detail.init();     
    
})();

