/*
 * 웹페이지 레이아웃 이벤트
*/
$(document).ready(function() {
	//최상단 이동
	$('.goTopBtn').on('click', function(e) {
		e.preventDefault();
		$('html, body').stop().animate({ scrollTop: 0 }, 500);
	});

	//서브메뉴 클릭이벤트
	$('#snb > li > a').on('click', function(e) {
		e.preventDefault();
		var $this = $(this).closest('li');
		var state = $this.find('ul').css('display');
		if (state == 'none') {
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

	function checkSnb() {
		var $this = $(this).closest('li');
		var state = $this.find('ul').css('display');
		state == 'none' ? $this.removeClass('open') : $this.addClass('open');
	}

	//서브메뉴 스크롤시 고정
	if ($('.subContainer .snbArea').length > 0) {
		var snbTop = $('.subContainer .snbArea').offset().top;
		$(window).on('scroll', function() {
			var scrollTop = $(window).scrollTop() + 150;
			var pos = scrollTop - snbTop;
			if (scrollTop > snbTop) {
				$('.subContainer .snbArea').css({ top: pos });
			} else {
				$('.subContainer .snbArea').css({ top: 0 });
			}

		});
	}

	//datepicker
	$.datepicker.setDefaults({
		dateFormat: 'yy-mm-dd',
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

	$(".startDatepicker").datepicker({
		onClose: function(data) {
			$('.endDatepicker').datepicker('option', 'minDate', data);
		}
	});

	$(".endDatepicker").datepicker({
		onClose: function(data) {
			$('.startDatepicker').datepicker('option', 'maxDate', data);
		}
	});
	
	$(".billDatepicker").datepicker({minDate:0});

	$(".startDatepicker").datepicker().css({ "z-index": 999 });
	$(".endDatepicker").datepicker().css({ "z-index": 999 });

	//파일 업로드 버튼
	$('.fileBtn input').on('change', function(e) {
		var filePath = $(this).val();
		$(this).parents('.file').find('input[type="text"]').val(filePath);
	});
});

/* 파일업로드 */
$(document).ready(function() {
	$('.fileLabel input').on('change', function() {
		$(this).closest('label').find('span').text($(this).val());
	});
});

/*
 * 탭
*/
$(document).ready(function() {
	$('.tabArea').each(function() {
		if ($('.tabArea').length > 0) {
			$(this).find('.m-tab').find('a').on('click', function(e) {
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
$.fn.doFixTable = function() {

	//커스텀 스크롤바 - 플러그인
	$(this).find(".overflowBox").mCustomScrollbar({
		axis: "yx",
		theme: 'dark-thick',
		scrollInertia: 100,
		callbacks: {
			whileScrolling: function() {
				$(this).closest('.overflowBox').find('.fixRow').css({ left: -this.mcs.left });
				$(this).closest('.overflowBox').find('.m-shadowTable').find('thead').find('th').css({ top: -this.mcs.top });
			},
		}
	});

	//넘치는 글자 팝업
	$(this).find('.tIn').each(function(e) {

		var txt = $(this).children().first().length > 0 ? $(this).children().first().text() : $(this).text();

		if (txt.length > 18) {
			$(this).addClass('viewMoreText').attr('data-content', txt);
			var tagName = $(this).children().first().prop("tagName");
			var slice = sliceTxt(txt, 12);

			switch (tagName) {
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
	function sliceTxt(txt, num) {
		var result = txt.substr(0, num) + '<i class="more">...more</i>';
		return result;
	}

	// 팝업 마우스 오버 효과
	$('.viewMoreText').hover(function() {

		var fullText = $(this).data('content');

		var tagName = $(this).children().first().prop("tagName");
		switch (tagName) {
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
				$(this).append('<div class="moreMessageBox">' + fullText + '</div>');
		}

		var mBoxHeight = $('.moreMessageBox').outerHeight();
		var paddingTop = $(this).offset().top - $(this).closest('.overflowBox').offset().top;
		var rowHeight = $(this).closest('table').find('td').outerHeight();
		var paddingBottom = $(this).closest('.overflowBox').outerHeight() - paddingTop - rowHeight;
		var posY = paddingBottom < mBoxHeight ? rowHeight - 10 : -mBoxHeight + 20;
		var postion = { left: 0, bottom: posY };
		$('.moreMessageBox').css(postion);
	}, function() {
		$('.moreMessageBox').remove();
	});

	//고정 테이블 너비 맞춤
	var padding = $(this).find('.fixRow').width() + 10;
	$(this).find('.overflowBox .fixArea').css({ 'padding-left': padding });
};

// 재고관리 따로
$.fn.doFixTable2 = function() {

	//커스텀 스크롤바 - 플러그인
	$(this).find(".overflowBox").mCustomScrollbar({
		axis: "yx",
		theme: 'dark-thick',
		scrollInertia: 100,
		callbacks: {
			whileScrolling: function() {
				$(this).closest('.overflowBox').find('.fixRow').css({ left: -this.mcs.left });
				$(this).closest('.overflowBox').find('.m-shadowTable').find('thead').find('th').css({ top: -this.mcs.top });
			},
		}
	});

	//넘치는 글자 팝업
	$(this).find('.tIn').each(function(e) {

		var txt = $(this).children().first().length > 0 ? $(this).children().find('div').text() : $(this).text();

		if (txt.length > 19) {
			$(this).addClass('viewMoreText').attr('data-content', txt); // 여기서.. i가 들어감
			var tagName = $(this).children().first().prop("tagName");
			var slice = sliceTxt(txt, 19);

			switch (tagName) {
				case 'A':
					slice = sliceTxt(txt, 5);
					$(this).children().first().html(slice);
				case 'LABEL':
					break;
				case 'DIV':
					break;
				case 'SPAN':
					break;
				case 'INPUT':
					break;
				case 'I':
					break;
				default:
					$(this).html(slice);
			}
		}

	});

	//글자 자르기
	function sliceTxt(txt, num) {
		var result = txt.substr(0, num) + '<i class="more">...more</i>';
		return result;
	}

	// 팝업 마우스 오버 효과
	$('.viewMoreText').hover(function() {

		var fullText = $(this).data('content');

		var tagName = $(this).children().first().prop("tagName");
		switch (tagName) {
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
				$(this).append('<div class="moreMessageBox">' + fullText + '</div>');
		}

		var mBoxHeight = $('.moreMessageBox').outerHeight();
		var paddingTop = $(this).offset().top - $(this).closest('.overflowBox').offset().top;
		var rowHeight = $(this).closest('table').find('td').outerHeight();
		var paddingBottom = $(this).closest('.overflowBox').outerHeight() - paddingTop - rowHeight;
		var posY = paddingBottom < mBoxHeight ? rowHeight - 10 : -mBoxHeight + 20;
		var postion = { left: 0, bottom: posY };
		$('.moreMessageBox').css(postion);
	}, function() {
		$('.moreMessageBox').remove();
	});

	//고정 테이블 너비 맞춤
	var padding = $(this).find('.fixRow').width() + 10;
	$(this).find('.overflowBox .fixArea').css({ 'padding-left': padding });
};

//y축만 고정되는 틀고정 테이블 
$(document).ready(function() {
	$('.maxHeight').each(function() {

		var boxHeight = $(this).outerHeight();
		var tableHeight = $(this).find('table').outerHeight();

		if ($(this).find('table').length > 0) {
			if ($(this).find('tfoot').length > 0) {
				var pos = tableHeight - boxHeight;
				$(this).find('tfoot').find('th').css({
					'position': 'relative',
					'z-index': '9',
					'top': -pos,
				});
			}

			$(this).on('scroll', function() {
				$(this).find('thead').find('th').css({
					'position': 'relative',
					'z-index': '9',
					'top': $(this).scrollTop() - 1,
				});
				if ($(this).find('tfoot').length > 0) {
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
$(document).ready(function() {
	$('.modalOpen').on('click', modalOpen);
	$('.modalClose').on('click', function(e) {
		if ($(this).parents('.modal-container').hasClass('resetClose')) {
			$(this).parents('.modal-container').find(":input").val('');
			$(this).parents('.modal-container').find("select").change();
		} 
		$(this).parents('.modal-container').removeClass('active').fadeOut(300);
	});

	$('.modal-container').on('click', function(e) {
		if ($(this).hasClass('alert')) return;
		if ($(this).hasClass('reset')) return;
		if (!$('.modal-wrapper').has(e.target).length) {
			$(this).removeClass('active').fadeOut(300);
			if ($(this).hasClass('nresetClose')) return;
			if ($(this).hasClass('resetClose')){
					$(this).find(":input").val('');
					$(this).find("select").change();
					return;
				}
			$(":input").val('');
			$("select").change();
			//$('body').css({'overflow': 'inherit'});
		}
	});
});


function modalOpen(modalId) {
	let target = "";

	if ($(this).data('modal') === undefined) { // 함수로 넘겼을 때
		target = modalId;
	} else { // a태그로 넘겼을 때(루딕스 방식)->calendar.jsp 612번째 줄
		target = $(this).data('modal');
	}

	if ($('.modal-container.active').length > 0 || $('.modal-container.show').length > 0) {
		var $this = $('.modal-container.active').length > 0 ? $('.modal-container.active') : $('.modal-container.show');
		var thisZindex = Number($this.css('z-index')) + 1;
		$('.modal-container#' + target).css({ 'z-index': thisZindex });
	}
	$('.modal-container#' + target).fadeIn(300).addClass('active');
	$(window).width() < 1920 ? $('.modal-container#' + target).css({ 'min-width': '1920px' }) : '';
	//if(!$('.modal-container#' + target).hasClass('alert')) $('body').css({'overflow': 'hidden'});

	$(window).on('scroll', function() {
		$('.modal-container').css({
			left: 0 - $(this).scrollLeft(),
		});
	});
}

function modalDataIdClose(btnId) {
	$(btnId).parents('.modal-container').removeClass('active').fadeOut(300);
	$(btnId).parents('.modal-container').find(":input").val('');
	$(btnId).parents('.modal-container').find("select").change();
}

//공통 모달 info	
// 2021-05-03 by YMG
function modalInfo(text) {

	let modalButton = ""; // 모달 버튼 띄우기

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
function modalReload(text) {

	let modalButton = ""; // 모달 버튼 띄우기

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
 * 인포 버튼
*/
$(document).ready(function() {
	$(document).on('click', ".infoBtn", function() {
		infoMemoOpen($(this));
	});
	$('body').on('click', function(e) {
		if (!$('.infoArea').has(e.target).length) {
			infoMemoClose();
		}
	});
});

function infoMemoOpen(e) {
	//e.preventDefault();

	if (e.hasClass('active')) {
		infoMemoClose();
	} else {
		infoMemoClose();

		//모달창일 경우 위치 조정
		if (e.closest('.modal-container').length > 0) {
			var frameOffset = e.closest('.modal-content').offset().left;
			var frameWidth = e.closest('.modal-content').outerWidth();
			var thisOffsetLeft = e.offset().left - frameOffset;
			var thisOffsetRight = (frameOffset + frameWidth) - e.offset().left;
			var memoWidth = $('.infoArea .infoMemo').outerWidth() / 2;
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
			var position = memoWidth > thisOffsetLeft ? posLeft : (memoWidth > thisOffsetRight ? posRight : '');

			checkPadding ? e.closest('.infoArea').find('.infoMemo').css(position) : '';

		}

		//위치값 갖고있을경우 위치 조정
		if (e.data('position')) {
			//$(this).data('position') == 'top' ? '' : '';
			var position = {
				top: -e.closest('.infoArea').find('.infoMemo').outerHeight() - 20,
			};
			e.closest('.infoArea').find('.infoMemo').addClass('top').css(position)
		}

		e.addClass('active').closest('.infoArea').find('.infoMemo').fadeIn(200);
	}
}

function infoMemoClose() {
	$('.infoBtn').removeClass('active');
	$('.infoMemo').fadeOut(300);
}

/*
 * 스마트 에디터
*/
//DB값 저장을 위해 애디터를 내용을 밖으로 빼줌
let oEditors = [];

$.fn.smartEditor = function() {
	$(this).each(function() {
		var thisClass = $(this).attr('class');
		// var idName = $(this).closest('.modal-container').length > 0 ? thisClass + $(this).closest('.modal-container').index() : thisClass;
		var addId = $(this).attr('id', thisClass);

		nhn.husky.EZCreator.createInIFrame({
			oAppRef: oEditors,
			elPlaceHolder: thisClass,
			sSkinURI: "/resources/rudicks/smart-editor/SmartEditor2Skin.html",
			fCreator: "createSEditor2",
			htParams: {
				bUseToolbar: true,
				bUseVerticalResizer: false,
				bUseModeChanger: true
			},
		});
	});
};


$(document).ready(function() {
	$('.webEditor').smartEditor();
});



/*
 * 필터 커스텀 셀렉트
*/
$(document).ready(function() {
	$('.openFilter').on('click', function() {
		$(this).closest('.m-filter').find('.selectList').fadeToggle(100);
	});
	$('body').on('click', function(e) {
		if (!$('.m-filter').has(e.target).length) {
			$('.selectList').fadeOut(300);
		}
	});
	/* $('.selectList .btns .sBtn').on('click', function(){
		 $(this).closest('.m-filter').find('.selectList').fadeToggle(100);
	 });*/

});

/*
 * 순차적 애니메이션
*/
$(document).ready(function() {
	//로드시 애니메이션
	$('.showAni').StartAni();

	//스크롤 애니메이션
	if ($('.scrollAni').length > 0) {
		scrollAni();
		$(window).on('scroll', scrollAni);
	}
});

//순차적 애니메이션
$.fn.ShowAni = function(speed, delay, hide) {

	$(this).each(function() {
		let $this = $(this).find('.sObj');
		let num = $this.length;

		$this.css({ 'opacity': 0, 'transform': 'translateY(50px)' });

		for (let i = 0; i < num; i++) {
			let dis = $this.eq(i).hasClass('horizontal') ? 'translateX' : 'translateY';
			$this.eq(i).hasClass('horizontal') ?
				(
					$this.eq(i).hasClass('sRight') ? $this.eq(i).css({ 'transform': 'translateX(50px)' }) : $this.eq(i).css({ 'transform': 'translateX(-50px)' })
				)
				: '';

			$this.eq(i).delay(i * delay).animate({ resize: 'none' }, 0, function() {
				$(this).css({
					'opacity': hide ? 0 : 1,
					'transform': dis + '(' + (hide ? '50px' : '0px') + ')',
					'transition': 'all ' + speed,
				}).addClass('showEnd');

			});
		}
	});
};

//순차적 애니메이션 실행
$.fn.StartAni = function() {
	let padding = 800;
	//let pos = $(this).offset().top - padding;

	let delay = $(this).data('delay') ? $(this).data('delay') : 200;
	$(this).ShowAni('.6s', delay);

};

function scrollAni() {
	let scrollTop = $(window).scrollTop();

	$('.scrollAni').each(function() {
		let padding = $(window).height() - 200;
		let pos = $(this).offset().top - padding;
		let delay = $(this).data('delay') ? $(this).data('delay') : 100;
		if (scrollTop > pos) {
			!$(this).hasClass('pause') ? $(this).ShowAni('1s', delay) : '';
			$(this).addClass('pause');
		}
	});
}

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

let mTypeResult = '';

function modalOpenType(type, mType){
	let callUrl = '/expire/modal';
	let callBackFunc = 'modalResponse';
	mTypeResult = mType;
	let objParam = {
			type : type
		}
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function modalResponse(data){
	let modalList = data.resultList;
 	let modalType = [];
	let modalCookie = data.modalCookie;
	let modalCheckId = '.dayClose';
	
	$.each(modalList, function(i, item){
		if(item.modalId != 0){
			modalType.push(item.modalId);
			modalContent(item);
		}
	});
	modalType.push(mTypeResult);
	
	CookieModal(modalType, modalCookie, modalCheckId);
}

function modalContent(item){
	$('#free_expire_date, #using_expire_date').text(item.expire_date);
	$('#charge_name').text(item.charge_name);
	$('#start_date').text(item.start_date);
	$('#contract_date').text(item.contract_date);
	$('#contract_expire_date').text(item.contract_expire_date);
}

function CookieModal(modalType, modalCookie, modalCheckId){
	$.each(modalType, function(i, item){
		if(item && modalCookie.indexOf(item) === -1){
			modalOpen(item)
		}
	});
	
	$(modalCheckId).on("click", function(){
		let name = $(this).parents('.modal-container').attr("id");
		let value = "sad";

		let callUrl = "/cubici/cookie";
		let callBackFunc = "CookieResponse";
		let objParam = {
			name : name,
			value : value
		}
		cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
	});
}

function CookieResponse(data){
	let modalId = "#" + data.modalName;
	$(modalId).removeClass('active').fadeOut(300);
}

function checkBizOverlap(objParam) {
	let callUrl = '/checkBizOverlap';
	let callBackFunc = 'checkBizOverlapResponse';
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}

function checkBizOverlapResponse(result){
	let bizStatus = result.resultMap.bizNumAuth;
	if (result.resultCode === 0) {
		if (bizStatus === "01" || bizStatus === "02") {
			if (result.resultMap.COUNT === 0) {
				modalInfo("사업자번호 유효성이 확인되었습니다.");
				return true;
			} else {
				modalInfo("중복된 사업자 번호입니다.");
			}
		} else {
			modalInfo("사업자 등록번호가 올바르지 않습니다. 확인후 다시 입력해 주세요.");
		}
	} else {
		modalInfo("관리자에게 문의 바랍니다.");
	}
}

function processEnd(){
	let callUrl = "/moneybank/processEnd";
	let callBackFunc = "processEndResponse";
	let objParam = { }
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function processEndResponse(result){
	window.location.href = "/moneybank/intro/advpay";
}