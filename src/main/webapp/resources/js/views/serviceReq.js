/*******************************************************************************
 * 
 * serviceReq.js
 * 
 * @author ktkim
 * @since 2020-02-01
 * 
 ******************************************************************************/

	$(document).ready(function() {
		
		// 서비스 신청중 체크박스 변경 불가.
		disabledCheck();
		
		// 서비스신청 완료후 현재 날짜.
		getDate();
		
		// 임시 안내
		inform(); 
		
	});
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	
	function getDate(){
		var tblCalendarYYMMDD = document.getElementById("tblCalendarYYMMDD");
        tblCalendarYYMMDD.innerHTML = yyyy + "년 " + mm + "월 " + dd + "일";                      
    }
	
    function goUrl(){
		window.document.location.href="/";
	}
	
	function goRequest(){
		
		var chLength = $('input:checkbox[name="advcal"]:checked').length;
		if(chLength < 1){
			alert('선정산을 하기위한  쇼핑몰을 최소 1개 이상 선택해야 합니다.!!');
			return false;
		}
		
		var isch = fileCheck();
		if(isch == false) return;
		
		var yn = confirm('선정산서비스 신청을 하시겠습니까?');
		if(yn==false){
			return false;
		}
		
		var post_url = "/serviceReqApply"; //get form action url
		var request_method = "post"; //get form GET/POST method
		var enc_type = "multipart/form-data"
		var arr = new Array();
		
		//체크된 리스트 저장
        $('input[name="advcal"]').each(function(idx){
        	
        	arr.push($("input[name=shoptype]:eq(" + idx + ")").val());
//        	arr.push($("input[name=shopid]:eq(" + idx + ")").val());
        	
        	// value값이 아닌 체크여부로 해결.  
        	var isChk = $('input:checkbox[name="advcal"]:eq(' + idx + ')').is(':checked');
        	if(isChk == true){
        		arr.push('Y');
        	}else{
        		arr.push('N');
        	}
        });
		
		
		$.ajax({
			url : post_url,
			type: request_method,
			enctype: enc_type,
			data : {
					shopList : arr // 배열
				},
			error : function(request){
				setTimeout(function () {
	            }, 1000);
				console.log("통신중 에러가 발생하였습니다.\n"+"code:"+request.status+"\nmessage:"+request.responseText);
			}
			}).done(function(response){ // = .success
				var txtId = $.trim($("#txtId").val());
				if (response.success == "N") {
                    alert("저장 실패");
                    return;
                } else if (response.success =='Y') {
                	
                	goConfirm();

                } else {
                    alert("<spring:message code='fail.common.msg' />");
                }
			});
	}
	
	function goConfirm(){
		
//		var text = '헬로페이를 신청해 주셔서 감사합니다!\n'
//			+ '회원정보와 신청하신 내용을 바탕으로\n'
//		+'합리적인 헬로페이 이용조건을 심사 평가한 결과를\n'
//		+'“서비스 조건확인” 메뉴를 통해서 확인하실 수 있습니다.\n'
//		+'평일 업무시간(10:00~19:00) 기준\n'
//		+'본 심사 및 평가는 통상 4시간 정도가 소요됩니다. \n'
//		+'잠시만 기다려 주시기 바랍니다.\n\n'
//		+'헬로페이 고객지원: 02-6925-6373 / 카톡 아이디 찾기\n'
//		+'cublicLoan';
		
//		var text = '헬로페이 서비스를 신청해 주셔서 감사합니다!\n'
//			+ '회원정보와 신청하신 내용을 바탕으로\n'
//		+'합리적인 헬로페이 이용조건을 심사 평가한 후 결과를\n'
//		+'이메일과 문자로 통보해 드리겠습니다.\n'
//		+'서비스신청 관련 서류제출안내 페이지로 이동합니다.';
		
		var text = '헬로페이 선정산 서비스 접수가 완료되었습니다!\n'
			+ '서비스를 신청해 주셔서 감사합니다!\n'
			+ '서비스 제공가능 여부를 신속하게 검토해서 결과를 알려드리도록 하겠습니다.\n'
		+'서비스신청 관련 서류제출안내 페이지로 이동합니다.';
		
		var post_url = "/serviceConfirm"; //get form action url
		var request_method = "post"; //get form GET/POST method
		var frm = document.fregist;
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
			}).done(function(response){ // = .success
				if (response.success == "N") {
                    alert("저장 실패");
                    return;
                } else if (response.success =='Y') {                	
                	//alert(text);
                	modalInformingFunc("신청 완료", text); // 팝업 제목은 신청 완료, 내용은 text
                	window.document.location.href="/serviceReqDoc";
                } else {
                    alert("<spring:message code='fail.common.msg' />");
                }
			});	
		
	}
	
	function fileCheck(){
		
		if($("#saubjadeungrokj").val() == '') {
			alert('사업자등록증은 필수 업로드 항목입니다.!!');
			return false;
		}
		if($("#daepyojasinbunj").val() == '') {
			alert('대표자 신분증은 필수 업로드 항목입니다.!!');
			return false;
		}
		if($("#business_type").val() == 2) {
			if($("#bubindeunggibu").val() == '') {
				alert('법인등기부등록증은 필수 업로드 항목입니다.!!');
				return false;
			}
		}		
		
		return true;
		
	}

		
	// 서비스 신청중 체크박스 변경 불가.
	function disabledCheck(){
		var hellopay_req_yn = $("#hellopay_req_yn").val();
		var hellopay_status = $("#hellopay_status").val();
		var evaluate_yn = $("#evaluate_yn").val();
		var approval_yn = $("#approval_yn").val();
		
		
		if(hellopay_req_yn == 'Y' && evaluate_yn != 'Y' && approval_yn != 'Y'){ // 선정산 신청 후 심사 전
//			var txt = '현재 신청하신 선정산서비스에 대하여 심사 중입니다.\n'
//				+ '심사와 승인이 모두 완료되면 문자와 메일로 통보해 드리겠습니다.\n'
//				+'서비스 신청에 관련한 서류제출안내 페이지로 이동합니다.';
//			alert(txt);
//			window.document.location.href="/serviceReqDocument";
			inform();
			}
		
		if(hellopay_req_yn == 'Y' && evaluate_yn == 'Y' && approval_yn != 'Y'){ // 선정산 신청 후  심사 후
//			var txt = '현재 신청하신 선정산서비스에 대하여 심사완료 후 승인 대기증입니다.\n'
//				+ '승인이 완료되면 문자와 메일로 통보해 드리겠습니다.';
//			alert(txt);
//			window.document.location.href="/";	
			inform();
		} 
		
		if(approval_yn == 'Y' && hellopay_status == 8){ // 선정산 승인 후
//			var txt = '선정산 신청이 완료되어 승인된 회원입니다.\n'
//				+ '서비스 이용현황 페이지로 이동합니다.';
//			alert(txt);
//			window.document.location.href="/serviceUse";
			
			inform();	

		} 

		if(approval_yn == 'Y' && hellopay_status == 9){ // 선정산 계약 후
//			alert('선정산 서비스 이용 고객입니다.\n서비스 계약내용 페이지로 이동합니다.');
//			window.document.location.href="/serviceReqResult";
			inform();
		}
				
	}
	
	
	function inform(){
		
		// 페이지 구현 뒤 MODAL(확인 누르면 다시 MAIN으로 이동)
		var insertHtml = "";
		insertHtml+="안녕하세요, 회원님.<br>" 
		insertHtml+="현재 헬로페이 선정산 서비스는 사업제휴 P2P 자금운영사의<br>사정에 따라 서비스 운영이 잠시 중단된 상태입니다. " 
		insertHtml+="빠른 기간<br>안에 다시 서비스가 운영될 수 있도록 노력하겠습니다.<br>감사합니다.<br>" 
		insertHtml+="<br>큐빅아이";
		
		modalInformingFunc("서비스 안내", insertHtml);
		$('#infoModelClose').on('click', function(){
			window.document.location.href="/";			
		});		
		
	}
	
  
//# sourceURL=serviceReq.js