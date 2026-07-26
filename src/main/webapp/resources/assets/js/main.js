(function($) {
	'use strict';

	if(document.location.protocol == 'https:'){  // ssl 
		if ( document.domain.substring(0,4).toLowerCase() != 'www.' ) {
		window.location = document.URL.replace("//","//www.");
		}
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
