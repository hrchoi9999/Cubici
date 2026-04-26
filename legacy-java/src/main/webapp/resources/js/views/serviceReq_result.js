/*******************************************************************************
 * 
 * serviceReq_result.js
 * 
 * @author ktkim
 * @since 2020-02-01
 * 
 ******************************************************************************/

	$(document).ready(function() {
		
		chkVal();
		
	});
	
    var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	
//	function getDate(){        
//        var tblCalendarYYMMDD = document.getElementById("tblCalendarYYMMDD");
//        tblCalendarYYMMDD.innerHTML = yyyy + "년 " + mm + "월 " + dd + "일";                      
//    }
	
	function goUrl(){
		window.document.location.href="/";
	}
	
	function chkVal(){		
		var hellopay_status = $("#hellopay_status").val();
				
		if(hellopay_status != 8 && hellopay_status != 9  ){
			alert('선정산 서비스 계약내용이 없습니다.!!\n 메인페이지로 이동합니다.');
			window.document.location.href="/";
		}
	}
	   
  
//# sourceURL=serviceReq_result.js