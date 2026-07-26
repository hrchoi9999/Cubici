(function($) {
	'use strict';
	
	if(document.location.protocol == 'https:'){  // ssl 
		if ( document.domain.substring(0,4).toLowerCase() != 'www.' ) {
		window.location = document.URL.replace("//","//www.");
		}
	}
	
	$(document).ready(function() {
		
//		$('body').css('overflow', 'auto');
		$('body').css('overflow', 'visible');
		
		checkCookie();
		
		// modalInformingFunc("서비스 장애 공지", "현재 큐빅아이가 이용하고 있는 IDC의 기술적 장애로 접속이 원할하지 않고 있습니다. 가능한 신속하게 장애를 해결하기 위하여 IDC 측과 노력하고 있습니다. 잠시 후에 다시 접속해 주시면 감사하겠습니다. 불편을 드려 대단히 죄송합니다.<br><br>- 큐빅아이");
		
		
	});	
	
	// 이벤트 팝업
	var stop_pop = document.notice_form.chkbox_pop;
	$(document).on("click", "#closeBtn", function(event){
		if(stop_pop.checked){
				closeWin("stop");
		}else{
				closeWin();
		}
	});
	
	// 쿠키 확인
	function checkCookie(){		
		var user = getCookie("username");
		if(user != "") {
			$('#mainModal').hide(); 
		} else{
			$('#mainModal').show(); 
		}
	}
	
	// 팝업창 닫기
	function closeWin(flag) {
		//if ( document.notice_form.chkbox_pop.checked ){
		if(flag==='stop'){
	 		var user = "user";
			setCookie("username", user, 1); // 1 일 동안 팝업창이 안뜸.				
	    }
	 	document.getElementById("mainModal").style.display = "none";
	}
	
	/* Create revolution slider function */
	function revSlider( param ) {
		jQuery(param).show().revolution({
			/* options are 'auto', 'fullwidth' or 'fullscreen' */
			delay: '6000',
			sliderLayout: 'auto',
			responsiveLevels: [1400, 1366, 992, 480],
			gridwidth:[1400, 1366, 992, 480],
			gridheight:[900, 600, 550, 500],
			stopLoop: 'on',
			stopAfterLoops: 0,
			stopAtSlide: 1,
			navigation: {
				arrows: {
					enable: true,
					style: 'arrow-icon',
					hide_onleave: false
				},
				bullets: {
					enable: false,
					style: 'hesperiden',
					hide_onleave: false,
					h_align: 'center',
					v_align: 'bottom',
					h_offset: 0,
					v_offset: 20,
					space: 5
				}
			}
		});
	}
	
	
	$('#advcal_amount').on('change', function (e) {
	    var optionSelected = $("option:selected", this);
	    var valueSelected = this.value;	    
	    var day = $('#advcal_day').val();	    
	    
	    if(valueSelected==1000000 && day == 10) $('#charge').val('6,600'+'원');
	    if(valueSelected==1000000 && day == 15) $('#charge').val('7,975'+'원');
	    if(valueSelected==1000000 && day == 30) $('#charge').val('12,650'+'원');
	    if(valueSelected==3000000 && day == 10) $('#charge').val('19,800'+'원');
	    if(valueSelected==3000000 && day == 15) $('#charge').val('23,925'+'원');
	    if(valueSelected==3000000 && day == 30) $('#charge').val('37,950'+'원');
	    if(valueSelected==5000000 && day == 10) $('#charge').val('33,000'+'원');
	    if(valueSelected==5000000 && day == 15) $('#charge').val('39,875'+'원');
	    if(valueSelected==5000000 && day == 30) $('#charge').val('63,250'+'원');
	    if(valueSelected==7000000 && day == 10) $('#charge').val('46,200'+'원');
	    if(valueSelected==7000000 && day == 15) $('#charge').val('55,825'+'원');
	    if(valueSelected==7000000 && day == 30) $('#charge').val('88,550'+'원');
	    if(valueSelected==9000000 && day == 10) $('#charge').val('59,400'+'원');
	    if(valueSelected==9000000 && day == 15) $('#charge').val('71,775'+'원');
	    if(valueSelected==9000000 && day == 30) $('#charge').val('113,850'+'원');
	    	    
	});
	
	$('#advcal_day').on('change', function (e) {
	    var optionSelected = $("option:selected", this);
	    var valueSelected = this.value;	    
	    var amt = $('#advcal_amount').val();
	    
	    if(amt == 1000000 && valueSelected == 10) $('#charge').val('6,600'+'원');
	    if(amt == 1000000 && valueSelected == 15) $('#charge').val('7,975'+'원');
	    if(amt == 1000000 && valueSelected == 30) $('#charge').val('12,650'+'원');
	    if(amt == 3000000 && valueSelected == 10) $('#charge').val('19,800'+'원');
	    if(amt == 3000000 && valueSelected == 15) $('#charge').val('23,925'+'원');
	    if(amt == 3000000 && valueSelected == 30) $('#charge').val('37,950'+'원');
	    if(amt == 5000000 && valueSelected == 10) $('#charge').val('33,000'+'원');
	    if(amt == 5000000 && valueSelected == 15) $('#charge').val('39,875'+'원');
	    if(amt == 5000000 && valueSelected == 30) $('#charge').val('63,250'+'원');
	    if(amt == 7000000 && valueSelected == 10) $('#charge').val('46,200'+'원');
	    if(amt == 7000000 && valueSelected == 15) $('#charge').val('55,825'+'원');
	    if(amt == 7000000 && valueSelected == 30) $('#charge').val('88,550'+'원');
	    if(amt == 9000000 && valueSelected == 10) $('#charge').val('59,400'+'원');
	    if(amt == 9000000 && valueSelected == 15) $('#charge').val('71,775'+'원');
	    if(amt == 9000000 && valueSelected == 30) $('#charge').val('113,850'+'원');
	    
	});
	
//	//이벤트 팝업
//	function eventPopWindow(title, w, h) {
//		   var left = (screen.width/4)-(w/2);
//		   var top = (screen.height/4)-(h/2);
//		   return window.open("/main/pop", title, 'toolbar=no, location=default, directories=no, status=no, menubar=no, scrollbars=no, resizable=0, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
//	}
	
	$(document).on("click", "#toRegBtn", function(event){
		window.location.href='/register';	
	});
	
	var revId = $('#rev_slider_1');
	if (revId.length) {
		revSlider(revId);
	}
	revId.bind("revolution.slide.onvideostop",function (e,data) { 
		 //data.videotype = 'html5';
		 var player = data.video; 
		 //player.play(); 
	 });

	$("#partners").owlCarousel({
		loop:true,
		margin:0,
		nav:true,
		dots:true,
		autoplay:true,
		autoplayTimeout:3000,
		autoplayHoverPause:false,
		responsive:{
			0:{ items:1 },
			375:{ items:2 },
			992:{ items:5 },
			1366:{ items:7 }
		}
	});
})(jQuery);
