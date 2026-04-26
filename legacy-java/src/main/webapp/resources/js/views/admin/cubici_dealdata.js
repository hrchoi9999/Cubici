/*******************************************************************************
 * 
 * cubici_dealdata.js
 * 
 * @author ktkim
 * @since 2020-01-17
 * @DESC 회원가입 페이지 스크립트
 * 
 ******************************************************************************/
(function() {
	
	function Js() {
		
	
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {
			
						
			bindEvent();
		}
		
		
		function bindEvent() {
			
			// 중복확인
			$("#excel").on("click", function() {
				var f = document.form1;
		        f.action = "/admin/dealdata_excel";
		        f.submit();
			});
			
		}		
		
		
		
		
		
		function _finalize() {
		}
		
		return {
            init : _init,
            finalize : _finalize
        };
    };
    
    var js = new Js();
    js.init();
    
})();

