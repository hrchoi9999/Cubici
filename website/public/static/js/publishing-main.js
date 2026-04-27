/*
* 메인 슬라이드
*/

$(document).ready(function(){
	setSwiper();
	nextSlide();
	firstSlider();
});

function setSwiper() {
	mainSlide = new Swiper('#mainSlide', {
		autoplay: {
			delay: 6000,
		},
		effect: 'fade',
		speed: 1000,
		pagination: {
			el: '#mainSlide .swiper-pagination',
			type: 'bullets',
			clickable: true,
		},
		navigation: {
			nextEl: '#mainSlide .swiper-button-next',
			prevEl: '#mainSlide .swiper-button-prev',
		},
		//loop: 'auto',
	});
}


//로그인 전 슬라이드
function firstSlider(){
	var first_slider = new Swiper(".first-slider", {
		loop:'true',
		autoplay: {
			delay: 6000,
		},
		pagination: {
			el: ".first-slider-pagination",
		},
	});

	$('.first-control .stop-btn').click(function(){
		if(!$(this).hasClass('stop')){
		$(this).addClass('stop');
		next_slider.autoplay.stop();
		}else{
			$(this).removeClass('stop');
			next_slider.autoplay.start();
		}
	})
}
//로그인 후 슬라이드
function nextSlide(){
	var next_slider = new Swiper(".next-slider", {
		loop:'true',
		autoplay: {
			delay: 6000,
		},
		pagination: {
			el: ".next-slider-pagination",
		},
	});

	$('.next-control .stop-btn').click(function(){
		if(!$(this).hasClass('stop')){
		$(this).addClass('stop');
		next_slider.autoplay.stop();
		}else{
			$(this).removeClass('stop');
			next_slider.autoplay.start();
		}
	});

}
