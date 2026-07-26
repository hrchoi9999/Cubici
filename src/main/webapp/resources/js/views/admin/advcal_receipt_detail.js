
/*******************************************************************************
 * 
 * advcalreceipt_detail.js
 * 
 * @author ktkim
 * @since 2020-02-01
 * 
 ******************************************************************************/

(function() {
	
	function Advcalreceipt_detail() {
		
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
		
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {
			
			// 버튼 등의 이벤트 바인딩
			bindEvent();			

		}
		
		
		function bindEvent() {
			$(document).keypress(function(e) { if (e.keyCode == 13) e.preventDefault(); });

			// 저장 버튼 클릭 이벤트
			$("#btnSave").on("click", function() {
				
				var rs = confirm("정말로 저장하시겠습니까?");
				if(!rs) return;				
				
				var post_url = "/admin/cubici/receipt_detail_save"; //get form action url
				var request_method = "post"; //get form GET/POST method
				var formData = $("[name='frm']").serialize(); 

				$.ajax({ // 신용,은행,통화내역 저장.
					url : post_url,
					type: request_method,
					data : formData,
					dataType : 'json',
					error : function(request){
						console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
					}
					}).done(function(response){
						if (response.success == "N") {
		                    alert("저장 실패");
		                    return;
		                } else if (response.success =='Y') {

		                	fileUp();

		                } else {
		                    alert("<spring:message code='fail.common.msg' />");
		                }
					});								
			});
		}
		
		function fileUp(){ // 첨부파일 업로드
			var post_url = "/admin/cubici/receipt_detail_save_file"; //get form action url
			var request_method = "post"; //get form GET/POST method
			var frm = document.frm; // name
			var formData = new FormData(frm);

			$.ajax({
				url : post_url,
				type: request_method,
				data : formData,
				cache : false,
				processData : false,
				contentType : false,
				error : function(request){
					setTimeout(function () {
		            }, 1000);
					console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
				}
			}).done(function(response){
				if (response.success == "N") {
                    alert("저장 실패");
                    return;
                } else if (response.success =='Y') {
                	save_status();
                } else {
                    alert("<spring:message code='fail.common.msg' />");
                }

			});
		}
		
		function save_status(){ // 상태코드 저장
			var post_url = "/admin/cubici/receipt_detail_status_save"; //get form action url
			var request_method = "post"; //get form GET/POST method
			var frm = document.frm; // name
			var formData = new FormData(frm);

			$.ajax({
				url : post_url,
				type: request_method,
				data : formData,
				cache : false,
				processData : false,
				contentType : false,
				error : function(request){
					setTimeout(function () {
		            }, 1000);
					console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
				}
			}).done(function(response){
				if (response.success == "N") {
                    alert("저장 실패");
                    return;
                } else if (response.success =='Y') {
                	alert('모두 저장 성공');	
                	window.location.href='/admin/cubici/receipt';
                } else {
                    alert("<spring:message code='fail.common.msg' />");
                }

			});
		}
		
				
		function _finalize() {
		}
		
		return {
            init : _init,
            finalize : _finalize
        };
    };
    
    var advcalreceipt_detail = new Advcalreceipt_detail();
    advcalreceipt_detail.init();     
    
})();

function checkSize(data) {
	if (data.files && data.files[0].size > (6 * 1024 * 1024)) {
        alert("첨부파일 사이즈는 6MB 이내여야 합니다.!!!");
        data.value = null;
    }
}




