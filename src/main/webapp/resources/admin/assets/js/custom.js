function frame_resize(frame){
	var fh = $(frame).contents().find('body').height();
	//var fh = jQuery(frame.contentWindow.document).height();
	//console.log(fh);
	$(frame).contents().find('body').addClass("iframe-body");
	$(frame).animate({'height':(fh + 100)+ 'px'}).stop;
	//$(frame).height(fh + 100);
}

jQuery(function($) {
	/*
    $.fn.extend({
        scrollRight: function(val) {
            if (val === undefined) {
                return this[0].scrollWidth - (this[0].scrollLeft + this[0].clientWidth) + 1
            }
            return this.scrollLeft(this[0].scrollWidth - this[0].clientWidth - val)
        }
    });
	$(".table-responsive").prepend($('<div class="table-wrap"><span class="arrow arrow-left d-none"></span><span class="arrow arrow-right"></span></div>'));
	$(".table-responsive").on("scroll",function(){
		if($(this).scrollRight()>1){
			$(this).parent().find(".arrow-left").addClass("d-none");
			$(this).parent().find(".arrow-right").removeClass("d-none")
		}else{
			$(this).parent().find(".arrow-left").removeClass("d-none");
			$(this).parent().find(".arrow-right").addClass("d-none")
		}
	});
	*/
	if ( $.fn.DataTable.isDataTable('.dataTable') ) {
		$('.dataTable').DataTable().destroy();
	}
	$('.dataTable').DataTable({
		scrollX: true,
		select: true,
		responsive:true,
		//dom: '<l"top">t<"bottom"p>',
		//dom: 'lBfrtip',
		dom: 'ltp',
		pagingType: "full_numbers",
        buttons: [ 'colvis' ],
        language: {
        	"sLengthMenu":     " _MENU_개씩 보기",
        	buttons: {
                colvis: 'Select Column'
            }
        }
	});
	//$('.dataTables_filter input').attr('placeholder','Search...');
});

$('.datetimepicker').datetimepicker({
	format:'Y년 m월 d일() H:i',
	//closeOnDateSelect:true,
	//closeOnTimeSelect:true,
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
	
$.datepicker.regional["ko"] = {
    closeText: "닫기",
    prevText: "이전달",
    nextText: "다음달",
    currentText: "오늘",
    monthNames: ["1월(JAN)","2월(FEB)","3월(MAR)","4월(APR)","5월(MAY)","6월(JUN)", "7월(JUL)","8월(AUG)","9월(SEP)","10월(OCT)","11월(NOV)","12월(DEC)"],
    monthNamesShort: ["1월","2월","3월","4월","5월","6월", "7월","8월","9월","10월","11월","12월"],
    dayNames: ["일","월","화","수","목","금","토"],
    dayNamesShort: ["일","월","화","수","목","금","토"],
    dayNamesMin: ["일","월","화","수","목","금","토"],
    weekHeader: "Wk",
    dateFormat: "yy-mm-dd",
    firstDay: 0,
    isRTL: false,
    showMonthAfterYear: true,
    yearSuffix: "",
	changeMonth: true,
	changeYear: true, 
	showOn: 'both', 
	//buttonImage: '<?=$g4[path]?>/images/icon/calendar.gif', 
	buttonText: "<i class='fa fa-calendar'></i>", 
	buttonImageOnly: false, 
	showButtonPanel: true,
	zIndex:"2",
	showButtonPanel:false
};
$.datepicker.setDefaults($.datepicker.regional["ko"]);
$(".datepicker").datepicker({});
var today = new Date();
var yr = today.getFullYear();
$(".datebirth").datepicker({dateFormat: "ymmdd",showMonthAfterYear: false,yearRange: "1900:"+ yr,showAnimation: 'slide',showOn:'focus',showButtonPanel: false});
$('.custom-file').filestyle();
$('#modal_iframe').contents().resize( function() {
	parent_frame_resize(this);
});
$('.pop-modal').click(function(){
	var link_href = $(this).attr("href");
	jQuery('#modal_iframe').attr('src',link_href)
	$('#pop_modal').modal('show');
});
$('#pop_modal').on('shown.bs.modal',function(){
	frame_resize("#modal_iframe");
	$('#pop_modal').find("iframe.fade").addClass("in");
	$('html').addClass('modal-open-html')
});
$('#pop_modal').on('hidden.bs.modal', function (e) {
	jQuery('#modal_iframe').attr('src','')
	jQuery('#modal_iframe').height('0')
	$('#pop_modal').find('.modal-dialog').removeClass("modal-sm");
	$('html').removeClass('modal-open-html')
});
var headerHeight = 56;

!function(a,b){"use strict";var c,d;if(a.uaMatch=function(a){a=a.toLowerCase();var b=/(opr)[\/]([\w.]+)/.exec(a)||/(chrome)[ \/]([\w.]+)/.exec(a)||/(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("trident")>=0&&/(rv)(?::| )([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[],c=/(ipad)/.exec(a)||/(iphone)/.exec(a)||/(android)/.exec(a)||/(windows phone)/.exec(a)||/(win)/.exec(a)||/(mac)/.exec(a)||/(linux)/.exec(a)||/(cros)/i.exec(a)||[];return{browser:b[3]||b[1]||"",version:b[2]||"0",platform:c[0]||""}},c=a.uaMatch(b.navigator.userAgent),d={},c.browser&&(d[c.browser]=!0,d.version=c.version,d.versionNumber=parseInt(c.version)),c.platform&&(d[c.platform]=!0),(d.android||d.ipad||d.iphone||d["windows phone"])&&(d.mobile=!0),(d.cros||d.mac||d.linux||d.win)&&(d.desktop=!0),(d.chrome||d.opr||d.safari)&&(d.webkit=!0),d.rv){var e="msie";c.browser=e,d[e]=!0}if(d.opr){var f="opera";c.browser=f,d[f]=!0}if(d.safari&&d.android){var g="android";c.browser=g,d[g]=!0}d.name=c.browser,d.platform=c.platform,a.browser=d}(jQuery,window);

var Utility = {
    str_replace: function(c, d, b) {
        var a = c.split(d);
        return a.join(b);
    },
    str_exists: function(b, c) {
        var a = b.split(c);
        if (a[0] === b) {
            return false;
        } else {
            return true;
        }
    },
    getViewPort: function() {
        var e = window, a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return {
            width: e[a + 'Width'],
            height: e[a + 'Height']
        };
    },
    getSidebarViewportHeight: function () {
        var h;
        h = $(window).height() - headerHeight;
        return h;
    },
    sidebar_resizing: function() {
        if ($('#topnav').hasClass('navbar-fixed-top')) {
            $('.static-sidebar').css('top', headerHeight + 'px');
        } else {
            var scr = $('body').scrollTop();

            $('.static-sidebar').css('top', '0px');


            if (scr < headerHeight) {
                $('.static-sidebar').css('top',(headerHeight - scr) + 'px');
            } else {
                $('.static-sidebar').css('top','0px');
            }
        }
    },
    toggle_leftbar: function() {
        var menuCollapsed = localStorage.getItem('collapsed_menu');
        
        $('body').toggleClass('sidebar-collapsed');
        Utility.switch_leftbaricons();

        if (menuCollapsed == "true")
            localStorage.setItem('collapsed_menu', "false");
        else if (menuCollapsed == "false")
            localStorage.setItem('collapsed_menu', "true");
        
        setTimeout(function(){                  // wait 500ms before calling resize
            $(window).trigger('resize');        // so toggle happens faster instead of
        }, 500);                                // sticking out
    }, 
    switch_leftbaricons: function() {
        if ($('body').hasClass('sidebar-collapsed')) {
            $('#trigger-sidebar i').removeClass('ti-shift-left').addClass('ti-shift-right');
        } else {
            $('#trigger-sidebar i').removeClass('ti-shift-right').addClass('ti-shift-left');
        }
    },
    autocollapse: function() {
        var navbar = $('header.navbar');
        var menu = $('header.navbar .navbar-collapse');

        $('body').removeClass('topnav-collapsed');
        $('#topnav .navbar-left').addClass('in');
        $('#navbar-links-toggle').parent('li').hide();
        $(menu).insertAfter('header.navbar .logo-area');


        if((navbar.innerHeight() > headerHeight) || ($(window).innerWidth()<1024)) { // check if we've got 2 lines Or less than 786px

            $('body').addClass('topnav-collapsed');
            $('#topnav .navbar-left').removeClass('in');
            $('#navbar-links-toggle').parent('li').show();

            navbar.append(menu.detach());
        }
    }
};
function getInputDayLabel(date) {
	var week = new Array("일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일")
	var today = new Date(date).getDay();
	var todayLabel = week[today];
	return todayLabel;
}
(function($) {
    // ScrollSidebar
    // ------------------------------
    $.scrollSidebar = function(element, options) {
        var defaults = {};
        var plugin = this;

        plugin.settings = {};
        var $element = $(element),
            element = element;

    }
    $.fn.scrollSidebar = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('scrollSidebar')) {
                var plugin = new $.scrollSidebar(this, options);
                $(this).data('scrollSidebar', plugin);
            };
        });
    };
    // ------------------------------
    // Sidebar Accordion Menu
    // ------------------------------
    $.sidebarAccordion = function(element, options) {
        var defaults = {};
        var plugin = this;

        plugin.settings = {};
        var $element = $(element),
            element = element;

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            var menuCollapsed = localStorage.getItem('collapsed_menu');
            if (menuCollapsed === null) {
                localStorage.setItem('collapsed_menu', "false");
            }
            if (menuCollapsed === "true") {
                $('body').addClass('sidebar-collapsed');
            }

            $('body').on('click', 'ul.acc-menu a', function() {
                var LIs = $(this).closest('ul.acc-menu').children('li');
                $(this).closest('li').addClass('clicked');
                $.each( LIs, function(i) {
                    if( $(LIs[i]).hasClass('clicked') ) {
                        $(LIs[i]).removeClass('clicked');
                        return true;
                    }
                    $(LIs[i]).find('ul.acc-menu:visible').slideToggle({duration: 100});
                    $(LIs[i]).removeClass('open');
                });

                if (!$('body').hasClass('sidebar-collapsed') || $(this).parents('ul.acc-menu').length > 1) {
                    if($(this).siblings('ul.acc-menu:visible').length>0)
                        $(this).closest('li').removeClass('open');
                    else
                        $(this).closest('li').addClass('open');
                        $(this).siblings('ul.acc-menu').slideToggle({duration: 100});
                }
            });

            var targetAnchor;
            $.each ($('ul.acc-menu a'), function() {
                if( this.href == window.location ) {
                    targetAnchor = this;
                    return false;
                };
            });

            var parent = $(targetAnchor).closest('li');
            while(true) {
                parent.addClass('active');
                parent.closest('ul.acc-menu').show().closest('li').addClass('open');
                parent = $(parent).parents('li').eq(0);
                if( $(parent).parents('ul.acc-menu').length <= 0 ) break;
            };

            var liHasUlChild = $('li').filter(function(){
                return $(this).find('ul.acc-menu').length;
            });
            $(liHasUlChild).addClass('hasChild');
        };
        plugin.init();
    }
    $.fn.sidebarAccordion = function(options) {
        return this.each(function() {
            if (undefined === $(this).data('sidebarAccordion')) {
                var plugin = new $.sidebarAccordion(this, options);
                $(this).data('sidebarAccordion', plugin);
            }
        });
    }
})(jQuery);

jQuery(document).ready(function () {
	//frame_resize($('#inc_iframe'));
	jQuery('iframe').on("load", function() {
		frame_resize(this);
	});
    enquire.register("screen and (max-width: 1024px)", {
        match : function() {
            //small
            if (!($('body').hasClass('sidebar-scroll'))) { //if not already added
                $('.static-sidebar').addClass('scroll-pane');
                $('.static-sidebar > .sidebar').addClass('scroll-content');
            }
        },  
        unmatch : function() {
            //big
            if (!($('body').hasClass('sidebar-scroll'))) { //if not already added
                $('.static-sidebar').removeClass('scroll-pane has-scrollbar');
                $('.static-sidebar > .sidebar').removeClass('scroll-content');
                $('.static-sidebar > .sidebar').css('margin-right','');
                $('.static-sidebar > .sidebar').css('right','');
            }
        }
    });

    if ($('body').hasClass('sidebar-scroll')) {
        $('.static-sidebar').addClass('scroll-pane');
        $('.sidebar').addClass('scroll-content');
    }

    Utility.sidebar_resizing();
    $('body').sidebarAccordion();
    $('#trigger-sidebar>a').click(function () {
        Utility.toggle_leftbar();
    });

    $('#trigger-fullscreen').click(function () {
        Utility.toggle_fullscreen(document.documentElement);
    });

    $('body').on('click', '.yamm .dropdown-menu, .dropdown-menu-form', function(e) {
      e.stopPropagation()
    })
    
    $('.dropdown-menu a[data-toggle="tab"]').click(function (e) {
        e.stopPropagation();
        $(this).tab('show');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        $(this).closest('.dropdown').removeClass('active');        
    });

    enquire.register("screen and (max-width: 1024px)", {
        match : function() {  //smallscreen
            $('body').addClass('sidebar-collapsed');
             if ($('body').hasClass('sidebar-collapsed')) {
                setWidthtoContent();
             }
            $(window).on('resize', setWidthtoContent);
        },
        unmatch : function() {  //bigscreen
            $('body').removeClass('sidebar-collapsed');
            $(window).off('resize', setWidthtoContent);
        }
    });
        
    function setWidthtoContent() {
        var w = $('#wrapper').innerWidth();
    }

    // Autocollapse
    Utility.autocollapse();

	// datatable 가로스크롤 추가하고 나서 테이블 헤더 깨짐
	setTimeout(function(){
        $(window).trigger('resize');
    }, 500);

});

$(window).bind("load", function() { 
    $('body').scrollSidebar();
    $(window).trigger('resize');
});


$(window).scroll(function(){
    Utility.sidebar_resizing();
	if (jQuery(this).scrollTop() > 100) {
		jQuery('.scrollup').fadeIn();
	} else {
		jQuery('.scrollup').fadeOut();
	}
		$('.scrollup').click(function() {
			$('html, body').animate({ scrollTop: 0 });
			return false;
		});
});

$(window).resize(function(){
    Utility.autocollapse();
    Utility.sidebar_resizing();
    Utility.switch_leftbaricons();
});
