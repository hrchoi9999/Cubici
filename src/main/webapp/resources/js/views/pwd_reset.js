/*******************************************************************************
 * 
 * pwdreset.js
 * 
 ******************************************************************************/
(function() {
	function PWDRESET() {
		
		/* 
		 * private variables
		 */
		var pwdreset = null;
		
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {			
			bindEvent();			
		}
		
		function bindEvent() {
					
			$("#frmPwd").submit(function(event){
				event.preventDefault(); //prevent default action
			
				var obj = validationCheck();			
				console.log(obj);
				
				if(obj){					
					var txtPasswd = $("#password1").val();
			        $("#j_password").val(CryptoJS.SHA256(txtPasswd + cubici.SHA256_SALT));
					
					var post_url = $(this).attr("action"); //get form action url
					var request_method = $(this).attr("method"); //get form GET/POST method
					var form_data = $(this).serialize(); //Encode form elements for submission
					
					$.ajax({
						url : post_url,
						type: request_method,
						data : form_data
					}).done(function(response){ // = .success
					//	$("#server-results").html(response);
						if (response.success == 'N') {
		                	alert("비밀번호 변경 실패!\n홈페이지 하단의 관리자에게 문의하세요.");
		                } else if (response.success =='Y') {
		                	alert("성공적으로 비밀번호를 변경했습니다.");
		                //	window.location.href=response.sUrl;
		                	window.location.href='/login'; // 로그인 페이지.
		                } else {
		                    alert("<spring:message code='fail.common.msg' />");
		                }
					});
				}				
			});	
			
			
		}
		
		function validationCheck(){
			
			var userNm = $.trim($("#userNm").val());
			if (userNm == "") {
	            alert("이름을 입력해주세요.");
	            $("#userNm").focus();
	            return false;
	        }
			
			var mobile = $.trim($("#mobile").val());
			if (mobile == "") {
	            alert("휴대폰번호를 입력해주세요.");
	            $("#mobile").focus();
	            return false;
	        }
			
			var userId = $.trim($("#userId").val());
			if (userId == "") {
	            alert("아이디를 입력해주세요.");
	            $("#userId").focus();
	            return false;
	        }
			
			// 비밀번호 체크
			var password1 = $("#password1").val();
			var password2 = $("#password2").val();
			if(password1.length < 1) {
				alert("비밀번호를 입력해 주세요.");
				$("#password1").focus();
				return false;
			}
			var regExpPw = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&()+=]).*$/;
			var result = checkRegexp($("#password1"), regExpPw);
			if(!result) {
				alert("비밀번호는 영문자, 숫자, 특수문자를 조합하여 8자 이상 15자 이하로 입력하시기 바랍니다.");
				$("#password1").val('');
				$("#password1").focus();
				return false;
			} 			
			if(password2.length<1) {
				alert("확인 비밀번호를 입력해 주세요.");
				$("#password2").focus();
				return false;
			}
			if(password1!=password2) {
				alert("비밀번호가 일치하지 않습니다.");
				$("#password1").val('');
				$("#password2").val('');
				$("#password1").focus();
				return false;
			}
			
			return true;
		}
		
		function checkRegexp(o, regexp) {
			if (!(regexp.test(o.val()))) {
				return false;
			} else {
				return true;
			}
		}
		
		function _finalize() {
		}
		
		return {
            init : _init,
            finalize : _finalize
        };
    };
    
    var pwdreset = new PWDRESET();
    pwdreset.init();
    
})();
