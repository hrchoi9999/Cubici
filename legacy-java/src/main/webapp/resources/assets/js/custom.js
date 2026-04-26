function frame_resize(frame){
	var h = $(frame).contents().height();
	//$(frame).animate({'height':(h + 30)+ 'px'}).stop;
	$(frame).height(h);
	$(frame).contents().find('body').addClass("iframe-body");
}
function parent_modal_sm(target){
	window.parent.$('#pop_modal').find('.modal-dialog').addClass("modal-sm");
}
function parent_modal_lg(target){
	window.parent.$('#pop_modal').find('.modal-dialog').removeClass("modal-sm");
}

window.closeModal = function(){
	$('#pop_modal').modal('hide');
};
function navbar_responsive(){
    //smooth scroll
	if($(window).width() > 768){
		smoothScroll.init({
			selector: '[data-scroll="scroll"]', // Selector for links (must be a class, ID, data attribute, or element tag)
			speed: 1000, // Integer. How fast to complete the scroll in milliseconds
			easing: 'easeInOutCubic', // Easing pattern to use
			offset: 52, // Integer. How far to offset the scrolling anchor location in pixels
			callback: function (anchor, toggle) {} // Function to run after scrolling
		});
		$('.nav-item > a.nav-link[data-toggle="dropdown"]').attr('data-hover','dropdown').attr('data-scroll','scroll').attr('data-toggle','').attr('href',$(this).data('href'));
	}else{
		$('.nav-item > a.nav-link[data-hover="dropdown"]').attr('data-hover','').attr('data-scroll','').attr('data-toggle','dropdown').attr('href','');
	}
}
$(function () {
	//preloader
	$(window).preloader({ delay: 50 });
	$(".sticky-nav").sticky({topSpacing:0});
	//shrink header
    $(document).on("scroll", function () {
        if ($(document).scrollTop() > 150) {
           /* $(".navbar-transparent").addClass("fixed-top");*/
        } else
        {
            $(".navbar-transparent").removeClass("fixed-top");
        }
    });
//back to top
    if ($('#back-to-top').length) {
        var scrollTrigger = 100, // px
                backToTop = function () {
                    var scrollTop = $(window).scrollTop();
                    if (scrollTop > scrollTrigger) {
                        $('#back-to-top').addClass('show');
                    } else {
                        $('#back-to-top').removeClass('show');
                    }
                };
        backToTop();
        $(window).on('scroll', function () {
            backToTop();
        });
        $('#back-to-top').on('click', function (e) {
            e.preventDefault();
            $('html,body').animate({
                scrollTop: 0
            }, 700);
        });
    }

    wow = new WOW(
            {
                boxClass: 'wow',
                animateClass: 'animated',
                offset: 0,
                mobile: true,
                live: true
            }
    );
    wow.init();
	navbar_responsive();
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
	$('.custom-select').selectpicker();
	$('.custom-file').filestyle();
	jQuery("iframe").on('load',function() { frame_resize(this); 	});
	$('#modal_iframe').on('load', function() {frame_resize(this);});
	$('[data-toggle="pop-modal"]').click(function(){
		var link_href = $(this).data("href");
		jQuery('#modal_iframe').attr('src',link_href);
		jQuery('#pop_modal .modal-header h3').text($(this).data('title'));
		//jQuery('#pop_modal').find('#modal_document').removeClass('modal-lg').removeClass('modal-md').removeClass('modal-sm').addClass('modal-'+$(this).data('size'));
		jQuery('#pop_modal').find('#modal_document').addClass('modal-'+$(this).data('size'));
		$('#pop_modal').modal('show');
		//e.preventDefault();
	});
	$('#pop_modal').on('shown.bs.modal',function(){
		frame_resize("#modal_iframe");
		jQuery('#pop_modal').find("iframe.fade").addClass("in");
		jQuery('html').addClass('modal-open-html')
	});
	$('#pop_modal').on('hidden.bs.modal', function (e) {
		jQuery('#modal_iframe').attr('src','')
		jQuery('#modal_iframe').height('0')
		$('#pop_modal').find('.modal-dialog').removeClass("modal-sm modal-md modal-lg");
		$('html').removeClass('modal-open-html')
	});
	$('[data-toggle="close-modal"]').click(function(){
		parent.closeModal();
	});

	var nowDate = new Date();
	var today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0, 0);
	var maxLimitDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()-30, 0, 0, 0, 0);
	$('.daterange').daterangepicker({
		alwaysShowCalendars:true,
		autoApply:true,
		timePicker: true,
		//autoUpdateInput: false,
		ranges: {},
		startDate: maxLimitDate,
		endDate: today,
		maxDate: today,
		timePicker24Hour : true,
		locale:{
			format: 'YYYY.MM.DD HH:mm' ,
			monthNames:['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
			dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
			cancelLabel:'',cancelClass:'close',
			applyLabel:'확인',applyClass:'btn-primary btn-lg',
		},
		}, function(start, end, label) {
	  console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
	  console.log([moment(), moment()]);
	});
	$('.datetimepicker').datetimepicker({
		format:'Y년 m월 d일() H:i',
		lang:'ko',
		//showOn: "button",
		months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
		dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"],
		dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
		/*onSelect: function(e) {
			var date = new Date($(".datetimepicker").datetimepicker({ dateFormat: 'yy-mm-dd' }).val()),
			week = new Array('일', '월', '화', '수', '목', '금', '토');
			if (week[date.getDay()]!= undefined) {
				$(".datetimepicker").val($(".datetimepicker").val()+" "+(week[date.getDay()])); 
			}
		}*/
	});
});
$(window).resize(function(){
	navbar_responsive();
});
