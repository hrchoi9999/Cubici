/*******************************************************************************
 * 
 * idpwdreset.js
 * 
 ******************************************************************************/
(function() {
	function IDPWD() {
		
		/* 
		 * private variables
		 */
		var idpwd = null;
		
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {
			
			bindEvent();
			// 이름/휴대폰 번호로 찾기  선택
			$("input:radio[id='chk_type_mobile']").prop("checked", true);
			$("#divMail").find("input, button").prop("disabled", true);		
			
		}
		
		function bindEvent() {
		
			$("#chk_type_mobile").on("click", function() {
				$("#divMobile").find("input, button").prop("disabled", false);
				$("#divMail").find("input, button").prop("disabled", true);
				$("input:radio[id='chk_type_mobile']").prop("checked", true);
				$("input:radio[id='chk_type_email']").prop("checked", false);
			});
						
			$("#chk_type_email").on("click", function() {
				$("#divMobile").find("input, button").prop("disabled", true);
				$("#divMail").find("input, button").prop("disabled", false);
				$("input:radio[id='chk_type_mobile']").prop("checked", false);
				$("input:radio[id='chk_type_email']").prop("checked", true);
			});	
			
			
		
//			$("#j_username, #password").keydown(function(event) {
//		        if (event.keyCode == 13)
//		        	$("#loginForm").click();
//		    });						
					
			$("#frmIdSearch").submit(function(event){
				event.preventDefault(); //prevent default action
			
				var checkedMobile = $("input:radio[id='chk_type_mobile']:checked").length;
				var checkedEmail = $("input:radio[id='chk_type_email']:checked").length;
								
				if(checkedMobile == 1 && checkedEmail == 0){
					var name1 = $.trim($("#name1").val());
			        var mobile = $.trim($("#mobile").val());
			        
			        if (name1 == "") {
			            alert("이름을 입력해주세요.");
			            $("#name1").focus();
			            return false;
			        }
			        
			        if (mobile == "") {
			            alert("전화번호를 입력해주세요.");
			            $("#mobile").focus();
			            return false;
			        }
			        
				} else if(checkedMobile == 0 && checkedEmail == 1){
					var name2 = $.trim($("#name2").val());
					var email = $.trim($("#email").val());
					
					if (name2 == "") {
			            alert("이름을 입력해주세요.");
			            $("#name2").focus();
			            return false;
			        }
					
					if (email == "") {
			            alert("이메일 주소를 입력해주세요.");
			            $("#email").focus();
			            return false;
			        }
					
					// 이메일 형식 체크
					var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
					var result = checkRegexp($("#email"), emailRegex);
					if(!result) {
						alert("이메일 형식을 확인하세요.");
						$("#email").val('');
						$("#email").focus();
						return false;
					}
					
				}
						        
//		        $("#j_password").val(CryptoJS.SHA256(txtPasswd + Config.SHA256_SALT));
//				
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
	                	alert("일치하는 정보가 없습니다.");
	                } else if (response.success =='Y') {
	                	alert("아이디는 "+response.userId+" 입니다.");
	                //	window.location.href=response.sUrl;
	                	window.location.href='/login'; // 로그인 페이지.
	                } else {
	                    alert("<spring:message code='fail.common.msg' />");
	                }
				});
			});			
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
    
    var idpwd = new IDPWD();
    idpwd.init();
    
})();

//# sourceURL=login.js