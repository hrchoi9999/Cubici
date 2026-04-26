/*
* 메인 슬라이드
*/
let mainSlide = new Swiper('#mainSlide', {
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
    //loop: 'auto',
});

$(document).ready(function(){
    //슬라이드 애니메이션
    $('.slideAni .swiper-slide-active').ShowAni('.6s', 150);

    mainSlide.on('slideChangeTransitionStart', function () {
        $('.slideAni .swiper-slide').ShowAni('.6s', 150, true);
    });
    mainSlide.on('slideChangeTransitionEnd', function () {
        $('.slideAni .swiper-slide-active').ShowAni('.6s', 100);
    });
});

//슬라이드 클릭시 스크롤
$('.scrollTarget').on('click', function(){
    let target = $(this).data('target');
    let pos = $('.' + target).offset().top - 80;
    $('html, body').stop().animate({scrollTop: pos}, 800);
});

/*
 * 액션페널
*/
//애니메이션 효과
let state = true;
let vScrollTop =  $(window).scrollTop();
let vPos = $('.actionVisual').offset().top - $(window).height() + 100;
checkVisual();

$(window).on('scroll', function(){
    vScrollTop =  $(window).scrollTop();
    checkVisual();
});

function checkVisual(){
    if(vScrollTop > vPos){
        //$('.act01').removeClass('on').addClass('on');
        if(state){
            $('.actArea.on').ShowAni('.6s', 100);
            state = false;
        }
    }
}

//패널 탭
$('.tabList li').on('click', function(e){
    e.preventDefault();
    if(!$(this).hasClass('on')){
        let target = $(this).find('a').attr('href');
        $('.actArea, .tabList li').removeClass('on');
        $(this).addClass('on');
        $(target).addClass('on');
        $('.actArea.on').ShowAni('.6s', 100);
        state = false;
    }
});
$('.openTab').on('click', function(e){
    e.preventDefault();
    let target = $(this).attr('href');
    $('.actArea').removeClass('on');
    $(target).addClass('on');
    $('.actArea.on').ShowAni('.6s', 100);
});

//예상 수수료 조회
$(document).on('click',"#commissionSearch", function(){
	
	let check = validationCheck();
	
	if(check == true){
	let service = $('#service').val(); // 서비스
	let necessaryFunds = Number($('#necessaryFunds').val()); // 필요자금
	let userPeriod = Number($('#userPeriod').val()); // 이용기간
	let commission = 0; // 예상 수수료
	
		if(service=="danbie"){
			if(necessaryFunds==300){
				switch(userPeriod){
					case 10:
					commission=12010;
					break;
					case 15:
					commission=16518;
					break;
					case 30:
					commission=31585;
					break;
				}
			}else if(necessaryFunds==500){
				switch(userPeriod){
					case 10:
					commission=20015;
					break;
					case 15:
					commission=27530;
					break;
					case 30:
					commission=52642;
					break;
				}
			}else if(necessaryFunds==1000){
				switch(userPeriod){
					case 10:
					commission=40030;
					break;
					case 15:
					commission=55060;
					break;
					case 30:
					commission=105285;
					break;
				}
			}
			$("#commission").html(comma(commission));
		}
	}
});

//유효성 검사
function validationCheck(){
	
	let service = $('#service').val(); // 서비스
	let necessaryFunds = $('#necessaryFunds').val(); // 필요자금
	let userPeriod = $('#userPeriod').val(); // 이용기간
	
	if(service == null || service == "") {
		modalInfo("서비스를 선택해 주세요.");
		return false;
	}
	
	if(necessaryFunds == null || necessaryFunds == "") {
		modalInfo("필요자금을 선택해주세요.");
		return false;
	}
	
	if(userPeriod == null || userPeriod == "") {
		modalInfo("이용기간을 선택해주세요.");
		return false;
	}
	
	return true;
}
