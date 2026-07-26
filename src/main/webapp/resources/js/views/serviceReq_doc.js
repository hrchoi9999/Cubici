/*******************************************************************************
 * 
 * serviceReq_doc.js
 * 
 * @author ktkim
 * @since 2020-02-01
 * 
 ******************************************************************************/

(function() {
	
	function Doc() {
		
		/* 
		 * 초기화 메소드
		 */
		
		function _init() {
			bindEvent();
		}
		
		function bindEvent() {	
					
			// 폰으로 보내기.
			$("#btnDoc").on("click", function() {
				
				var business_type = $("[name='business_type']").val();	
				var file_name = '';
				if (business_type == 1) {
					location.href = '/personalBizDoc.zip';
				} else if(business_type == 2){
					location.href = '/lawBizDoc.zip';
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
    
    var doc = new Doc();
    doc.init();
    
})();