/*
 * 웹페이지 레이아웃 이벤트
*/
$(document).ready(function(){
    //최상단 이동
    $('.goTopBtn').on('click', function(e){
        e.preventDefault();
        $('html, body').stop().animate({scrollTop: 0}, 500);
    });

     //헤더 스크롤 애니메이션
     checkHeader();
     $(window).on('scroll', function(){
         checkHeader();
         $('#header').css({left: 0 - $(this).scrollLeft()});
     });

     $('#gnb > li.has > a').on('click', function(e){
        e.preventDefault();
        var $this = $(this).closest('li');
        var state = $this.find('ul').css('display');
        if(state == 'none'){
            $('#gnb > li').removeClass('open');
            $('#gnb > li > ul').slideUp(200);
            $this.find('ul').slideDown(200);
            $this.addClass('open');
        } else {
            $this.find('ul').slideUp(200);
            $this.removeClass('open');
        }
    });
 
     //서브메뉴 클릭이벤트
     $('#snb > li > a').on('click', function(e){
        e.preventDefault();
        var $this = $(this).closest('li');
        var state = $this.find('ul').css('display');
        if(state == 'none'){
            $('#snb > li').removeClass('open');
            $('#snb > li > ul').slideUp(200);
            $this.find('ul').slideDown(200);
            $this.addClass('open');
        } else {
            $this.find('ul').slideUp(200);
            $this.removeClass('open');
        }
    });
    $('#snb > li > a').each(checkSnb);

    function checkSnb(){
       var $this = $(this).closest('li');
       var state = $this.find('ul').css('display');
       state == 'none' ? $this.removeClass('open') : $this.addClass('open');
    }

    //서브메뉴 스크롤시 고정
    if($('.subContainer .snbArea').length > 0){
        var snbTop = $('.subContainer .snbArea').offset().top;
        $(window).on('scroll', function(){
            var scrollTop = $(window).scrollTop() + 150;
            var pos = scrollTop - snbTop;
            if(scrollTop > snbTop){
                $('.subContainer .snbArea').css({top: pos});
            } else {
                $('.subContainer .snbArea').css({top: 0});
            }

        });
    }

     //datepicker
     $.datepicker.setDefaults({
        dateFormat: 'yy/mm/dd',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });
     $( "input.datepicker").datepicker();
     $( "input.datepicker").datepicker().css({"z-index":999});

     //파일 업로드 버튼
     $('.fileBtn input').on('change', function(e){
         var filePath = $(this).val();
         $(this).parents('.file').find('input[type="text"]').val(filePath);
     });
});

/* 파일업로드 */
$(document).ready(function(){
    $('.fileLabel input').on('change', function(){
        $(this).closest('label').find('span').text($(this).val());
    });
});

/*
 * 탭
*/
$(document).ready(function(){
    $('.tabArea').each(function(){
        if($('.tabArea').length > 0){
            $(this).find('.m-tab').find('a').on('click', function(e){
                e.preventDefault();
                var pos = $(this).closest('li').index();
                $(this).closest('.m-tab').find('li').removeClass('active');
                $(this).closest('li').addClass('active');
                $(this).closest('.tabArea').find('.m-tabBox').removeClass('active');
                $(this).closest('.tabArea').find('.m-tabBox').eq(pos).addClass('active');
            });
        }
    });
    
});



/*
 * 틀고정 테이블
 * 
 * ! 테이블의 높이값을 고정시켜야 합니다.
 * ! 높이값 유지를 위해 넘치는 내용은 팝업박스로 처리하였습니다.
*/

$.fn.doFixTable = function(){
   
   //커스텀 스크롤바 - 플러그인
   $(this).find(".overflowBox").mCustomScrollbar({
        axis:"yx",
        theme: 'dark-thick',
        scrollInertia: 100,
        callbacks:{
            whileScrolling:function(){ 
                $(this).closest('.overflowBox').find('.fixRow').css({left: -this.mcs.left});
                $(this).closest('.overflowBox').find('.m-shadowTable').find('thead').find('th').css({top: -this.mcs.top});
            },
        }
    });

    //넘치는 글자 팝업
    $(this).find('.tIn').each(function(e){
    
        var txt = $(this).children().first().length > 0 ? $(this).children().first().text() : $(this).text();
    
        if(txt.length > 18){
            $(this).addClass('viewMoreText').attr('data-content', txt);
            var tagName = $(this).children().first().prop("tagName");
            var slice = sliceTxt(txt, 12);

            switch(tagName){
                case 'A':
                    slice = sliceTxt(txt, 12);
                    $(this).children().first().html(slice);
                    break;
                case 'LABEL':
                    break;
                case 'DIV':
                    break;
                case 'SPAN':
                    break;
                case 'INPUT':
                    break;
                default:
                    $(this).html(slice);
            }
        }
        
    });

    //글자 자르기
    function sliceTxt(txt, num){
        var result = txt.substr(0, num) + '<i class="more">...more</i>';
        return result;
    }

    // 팝업 마우스 오버 효과
    $('.viewMoreText').hover(function(){

        var fullText =  $(this).data('content');

        var tagName = $(this).children().first().prop("tagName");
        switch(tagName){
            case 'A':
                $(this).append('<div class="moreMessageBox"></div>').find('a').clone().text(fullText).appendTo('.moreMessageBox');
                break;
            case 'LABEL':
                break;
            case 'DIV':
                break;
            case 'SPAN':
                break;
            default:
                $(this).append('<div class="moreMessageBox">'+fullText+'</div>');
        }

        var mBoxHeight = $('.moreMessageBox').outerHeight ();
        var paddingTop = $(this).offset().top - $(this).closest('.overflowBox').offset().top;
        var rowHeight = $(this).closest('table').find('td').outerHeight();
        var paddingBottom =  $(this).closest('.overflowBox').outerHeight() - paddingTop - rowHeight;
        var posY = paddingBottom < mBoxHeight ? rowHeight - 10 : -mBoxHeight + 20;
        var postion = { left: 0, bottom: posY };
        $('.moreMessageBox').css(postion);
    },function(){
        $('.moreMessageBox').remove();
    });

    //고정 테이블 너비 맞춤
    var padding = $(this).find('.fixRow').width() + 10;
    $(this).find('.overflowBox .fixArea').css({'padding-left': padding});
};


//y축만 고정되는 틀고정 테이블 
$(document).ready(function(){
    $('.maxHeight').each(function(){

        var boxHeight = $(this).outerHeight();
        var tableHeight = $(this).find('table').outerHeight();

        if($(this).find('table').length > 0){
            if($(this).find('tfoot').length > 0){
                var pos = tableHeight - boxHeight;
                $(this).find('tfoot').find('th').css({
                    'position': 'relative', 
                    'z-index': '9', 
                    'top': -pos,
                });
            }
    
            $(this).on('scroll', function(){
                $(this).find('thead').find('th').css({
                    'position': 'relative', 
                    'z-index': '9', 
                    'top': $(this).scrollTop() - 1,
                });

                if($(this).hasClass('fixY')){
                    var pos = $(this).scrollLeft();
                    $(this).find('tr').each(function(){
                        $(this).find('*').eq(0).css({
                            'position': 'relative',
                            'z-index': '10', 
                            'left' : pos,
                        });
                    });
                    $(this).find('thead').find('th').eq(0).css({
                        'z-index': '11', 
                    });
                }

                if($(this).find('tfoot').length > 0){
                    var pos = tableHeight - boxHeight - $(this).scrollTop();
                    $(this).find('tfoot').find('th').css({
                        'position': 'relative', 
                        'z-index': '9', 
                        'top': -pos,
                    });
                }
                
            });
        }
    });
    
});

/*
 * 모달창
*/
$(document).ready(function(){
    $('.modalOpen').on('click', modalOpen);
    $('.modalClose').on('click', modalClose);
    $('.modal-container').on('click', function(e){
        if($(this).hasClass('alert')) return;
        if(!$('.modal-wrapper').has(e.target).length){
            $(this).removeClass('active').fadeOut(300);
            //$('body').css({'overflow': 'inherit'});
            
        }
    });
});


function modalOpen(modalId){
    let target = "";
    
	if($(this).data('modal') === undefined){ // 함수로 넘겼을 때
		target = modalId;
	}else{ // a태그로 넘겼을 때(루딕스 방식)->calendar.jsp 612번째 줄
		target = $(this).data('modal');
	}
	
    if($('.modal-container.active').length > 0 || $('.modal-container.show').length > 0){
        var $this = $('.modal-container.active').length > 0 ? $('.modal-container.active') : $('.modal-container.show');
        var thisZindex = Number($this.css('z-index')) + 1;
        $('.modal-container#' + target).css({'z-index': thisZindex});
    }
    $('.modal-container#' + target).fadeIn(300).addClass('active');
  

    $(window).on('scroll', function(){
        $('.modal-container').css({
            left: 0 - $(this).scrollLeft(),
        });
    });

    //$('.webEditor').smartEditor();
  
}
function modalClose(){
    $(this).parents('.modal-container').removeClass('active').fadeOut(300);
    //$('body').css({'overflow': 'inherit'});
}

/*
 * 인포 버튼
*/
$(document).ready(function(){
    $('.infoBtn').on('click', infoMemoOpen);
    $('body').on('click', function(e){
        if(!$('.infoArea').has(e.target).length){
            infoMemoClose();
        }
    });
});

function infoMemoOpen(e){
    e.preventDefault();

    if($(this).hasClass('active')){
        infoMemoClose();
    } else {
        infoMemoClose();

        //모바일일 경우 위치 조정
        var x = e.pageX;
        var y = e.pageY; 
        var top = $(this).offset().top;
        var memePos = y - top;
        var fixPos = '40%';
        $(this).addClass('active').closest('.infoArea').find('.infoMemo').css({'top': '40%'});


        //모달창일 경우 위치 조정
        if($(this).closest('.modal-container').length > 0){
            var frameOffset = $(this).closest('.modal-content').offset().left;
            var frameWidth = $(this).closest('.modal-content').outerWidth();
            var thisOffsetLeft = $(this).offset().left - frameOffset;
            var thisOffsetRight = (frameOffset + frameWidth) - $(this).offset().left;
            var memoWidth  = $('.infoArea .infoMemo').outerWidth() / 2;
            var checkPadding = memoWidth > thisOffsetLeft || memoWidth > thisOffsetRight ? true : false;
            var posLeft = {
                left: '0',
                right: 'auto',
                transform: 'translateX(0)'
            };
            var posRight = {
                left: 'auto',
                right: '0',
                transform: 'translateX(0)'
            };
            var position = memoWidth > thisOffsetLeft ? posLeft : (memoWidth > thisOffsetRight ? posRight: '');
        
            checkPadding ? $(this).closest('.infoArea').find('.infoMemo').css(position) : '';
            
        }

        //위치값 갖고있을경우 위치 조정
        /*
        if($(this).data('position')){
            //$(this).data('position') == 'top' ? '' : '';
            var position = {
                top: -$(this).closest('.infoArea').find('.infoMemo').outerHeight() - 20,
            };
            $(this).closest('.infoArea').find('.infoMemo').addClass('top').css(position)
        }
        */
    
        $(this).addClass('active').closest('.infoArea').find('.infoMemo').fadeIn(200);
    }
}

function infoMemoClose(){
    $('.infoBtn').removeClass('active');
    $('.infoMemo').fadeOut(300);
}

/*
 * 스마트 에디터
*/


/*
$.fn.smartEditor = function(){
    $(this).each(function(){
        var thisClass = $(this).attr('class');
        var idName = $(this).closest('.modal-container').length > 0 ? thisClass + $(this).closest('.modal-container').index() : thisClass;
        var addId = $(this).attr('id', idName);
     
        console.log(idName);
        var oEditors = [];
        nhn.husky.EZCreator.createInIFrame({
            oAppRef: oEditors,
            elPlaceHolder: idName,  
            sSkinURI: "/smart-editor/SmartEditor2Skin.html",  
            fCreator: "createSEditor2",
            htParams : { 
                bUseToolbar : true, 
                bUseVerticalResizer : false, 
                bUseModeChanger : false 
            }
        });
    });
};
$(document).ready(function(){
    $('.webEditor').smartEditor();
});
*/




/*
 * 필터 커스텀 셀렉트
*/
/*
$(document).ready(function(){
    $('.openFilter').on('click', function(){
        $(this).closest('.m-filter').find('.selectList').fadeToggle(100);
    });
    $('body').on('click', function(e){
        if(!$('.m-filter').has(e.target).length){
            $('.selectList').fadeOut(300);
        }
    });
    $('.selectList .btns .sBtn').on('click', function(){
        $(this).closest('.m-filter').find('.selectList').fadeToggle(100);
    });
    
});
*/

/*
 * 순차적 애니메이션
*/
$(document).ready(function(){
    //로드시 애니메이션
    $('.showAni').StartAni();

    //스크롤 애니메이션
    if($('.scrollAni').length > 0){
        scrollAni();
        $(window).on('scroll', scrollAni);
    }
});

//순차적 애니메이션
$.fn.ShowAni = function(speed, delay, hide){
 
    $(this).each(function(){
        let $this = $(this).find('.sObj');
        let num = $this.length;

        $this.css({'opacity': 0, 'transform': 'translateY(50px)'});
  
        for(let i = 0; i < num; i++){
            let dis = $this.eq(i).hasClass('horizontal') ? 'translateX' : 'translateY';
            $this.eq(i).hasClass('horizontal') ?  
            (
                $this.eq(i).hasClass('sRight') ? $this.eq(i).css({'transform':'translateX(50px)'}) : $this.eq(i).css({'transform':'translateX(-50px)'})
            )
            : '';

            $this.eq(i).delay(i * delay).animate({resize: 'none'}, 0, function(){
                $(this).css({
                    'opacity': hide ? 0 : 1, 
                    'transform': dis +'('+ (hide ? '50px' : '0px') +')', 
                    'transition' : 'all ' + speed,
                }).addClass('showEnd');
                
            });
        }
    });
};

//순차적 애니메이션 실행
$.fn.StartAni = function(){
    let padding = 800;
    //let pos = $(this).offset().top - padding;

    let delay = $(this).data('delay') ? $(this).data('delay') : 200;
    $(this).ShowAni('.6s', delay);
    
};

function scrollAni(){
    let scrollTop =  $(window).scrollTop();

    $('.scrollAni').each(function(){
        let padding = $(window).height() - 200;
        let pos = $(this).offset().top - padding;
        let delay = $(this).data('delay') ? $(this).data('delay') : 100;
        if(scrollTop > pos){
            !$(this).hasClass('pause') ? $(this).ShowAni('1s', delay) : '';
            $(this).addClass('pause');
        }
    });
}

function checkHeader(){
    let scrollTop =  $(window).scrollTop();
    scrollTop > $('.topLine').height() ? $('#header').addClass('on') : $('#header').removeClass('on');
}

//공통 모달 info
// 2021-05-03 by YMG
function modalInfo(text){

	let modalButton=""; // 모달 버튼 띄우기
	
	modalButton += '<li style="display:none"><a id="modalOpenButton" href="javascript:;" class="modalOpen sBtn rBtn sColorN" data-modal="modal-info"></a></li>';
    
    // body 뒷 부분에 html 태그 삽입
	$('body').append(modalButton);
	
	// 클릭이벤트 재설정
	$('.modalOpen').on('click', modalOpen);
	
	// 모달창에 text 삽입
	$('#CommonModal').text(text);
	
	$('#modalOpenButton').trigger('click', modalOpen); // 클릭 이벤트 강제 실행
    $('#modalOpenButton').parent().remove(); // 이벤트 마지막 버튼 삭제 
}
function modalReload(text){
	
	let modalButton=""; // 모달 버튼 띄우기
	
	modalButton += '<li style="display:none"><a id="modalOpenButton" href="javascript:;" class="modalOpen sBtn rBtn sColorN" data-modal="modal-reload"></a></li>';
    
    // body 뒷 부분에 html 태그 삽입
	$('body').append(modalButton);
	
	// 클릭이벤트 재설정
	$('.modalOpen').on('click', modalOpen);
	
	// 모달창에 text 삽입
	$('#CommonModal2').text(text);
	
	$('#modalOpenButton').trigger('click', modalOpen); // 클릭 이벤트 강제 실행
    $('#modalOpenButton').parent().remove(); // 이벤트 마지막 버튼 삭제 
}

/* 
* 셀렉트 박스 공통 함수
* 2022. 01. 05
* by YMG
*/
function selectMenuList(selectMenu) {
	let callUrl = "/selectBoxList";
	let objParam = {
		SELECT_CLASS : selectMenu
	};
	let callBackFunc = "selectMenuResponse";
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc, false);
}

function selectMenuResponse(selectListData){
	let selectDivision = '<option value =""> 선택 </option>';
	let selectListBox = selectListData.selectSelectListBox;
	let selectClass = selectListData.selectClass;
	
	// 옵션 생성
	if (selectListData.resultCode === 0) {
		for (let i = 0, len = selectListBox.length; i < len; i++) {
			selectDivision += '<option value ="' + selectListBox[i].SELECT_CD + '">' + selectListBox[i].SELECT_NM + '</option>';
		}
		// 옵션 html에 넣기
		$("#" + selectClass).html(selectDivision);
	}
}