$(document).ready(function () {

  $('#Header').load('./header.html');
  $('#Footer').load('./footer.html');
  $('#mobileGnb').load('./mobile-gnb.html');



  // 셀렉트
  (function () {
    let select = $('.select-wrap');

    for (let i = 0; i < select.length; i++) {
      let txt = select.eq(i).find('.selected').text();
      select.eq(i).find('.select').text(txt);
    }
    let closeTimer;

    $('.select-btn').click(function () {
      let tg = $(this).closest('.select-wrap').addClass('z-index-100').find('.option');

      $('.select-wrap').removeClass('z-index-100').parents('.select-z-index').removeClass('z-index-100');//24.01.12

      if (!$(this).parent().hasClass('active')) {
        $('.select-wrap .option').not(tg).slideUp(200).closest('.select-wrap').find('.select-box').removeClass('active').parents('.select-z-index').removeClass('z-index-100');
        $(this).parent().addClass('active').parents('.select-z-index').addClass('z-index-100');
        tg.slideDown(200);
        return false;
      }
      else {
        tg.slideUp(200);
        $(this).parent().removeClass('active');

        closeTimer = setTimeout(function () {
          $(this).closest('.select-wrap').removeClass('z-index-100').parents('.select-z-index').removeClass('z-index-100');
          clearTimeout(closeTimer);
        }, 500);

        return false;
      }
    });

    $('.option >li').click(function () {
      let txt = $(this).text();
      let tg = $(this).addClass('selected').siblings().removeClass('selected').closest('.select-wrap').find('.select');

      $(this).addClass('selected').siblings().removeClass('selected').parents('.select-z-index').removeClass('z-index-100');

      if (tg.prop("tagName") === "SPAN") {
        tg.text(txt);
      } else if (tg.prop("tagName") === "input") {
        tg.val(txt)
      }

      $(this).closest('.option').slideUp().prev('.select-box').removeClass('active')
      return false;
    });

    $('.option .btn').click(function () {
      $('.option').slideUp().closest('.select-wrap').removeClass('z-index-100').find('.select-box').removeClass('active');
    });

    $(document).on('click', function (e) {
      let tg = e.target;
      if (tg.closest('.select-wrap') === null) {
        $('.option').slideUp().closest('.select-wrap').removeClass('z-index-100').find('.select-box').removeClass('active');//24.01.12
      }
    });
  })();


  //파일 첨부
  $('input[type="file"]').change(function () {
    let file_name = $(this).val();

    $(this).closest('.file-box').find($('.file-input')).val(file_name.substring(file_name.lastIndexOf("\\") + 1));
    $(this).closest('.file-box').find($('.file-input'))
  });


  //아코디언 FAQ
  (function () {
    $('.accordion-header .btn').click(function () {
      let tg = $(this).closest('.accordion-header');

      $(this).text("닫기")
      $('.accordion-header .btn').not($(this)).text("보기");

      if (!$(tg).hasClass('open')) {
        $(tg).addClass('open').siblings('.accordion-header').removeClass('open').next().hide();
        $(tg).next().show();
        colspan();
      } else {
        $(tg).removeClass('open').next().hide();
        $(tg).find('.btn').text("보기");
        colspan();
      }
    });

    $(window).resize(function () {
      colspan();
    });

    function colspan() {
      if ($(window).width() > 1023) {
        $('.accordion-body td').attr("colspan", '4');
      } else if ($(window).width() <= 1023) {
        $('.accordion-body td').attr("colspan", '3');
      }
    }
  })();



  //페이지 네이션
  (function () {
    $('.pagination li').click(function () {
      $(this).addClass('active').siblings().removeClass('active');
      return false;
    })
  })();


  //탭 메뉴
  (function () {
    $('.tab a, .radio-tab').click(function () {// 24.01.22 radio-tab 추가
      let id = $(this).attr('data-tab');

      if (id !== undefined) {
        $(this).parent().addClass('active').siblings().removeClass('active');
        $(id).removeClass('d-none').siblings().addClass('d-none');
      }
    });
  })();


  //모바일 서브 네비게이션
  // (function () {
  //   $('.sub-nav li').click(function () {
  //     $(this).addClass('active').siblings().removeClass('active');
  //     return false;
  //   })
  // })();
  // 231204


  //툴팁 ui 플러그인
  $(document).tooltip();

  //안내툴팁
  (function () {
    $('.tooltip-btn').click(function () {
      if (!$(this).hasClass('active')) {

        if ($(this).hasClass('top')) {
          $(this).addClass('active').find('.pop-up').css({
            top: (($(this).find('.pop-up').innerHeight() + 15) * -1) + 'px'
          }).delay(100).animate({ opacity: 1 }, 500);
        }
        if ($(this).hasClass('bottom')) {
          $(this).addClass('active').find('.pop-up').css({
            top: (($(this).find('.pop-up').innerHeight() + 15) * 1) + 'px'
          }).delay(100).animate({ opacity: 1 }, 500);
        }

      } else {
        $(this).removeClass('active').find('.pop-up').animate({ opacity: 0 }, 500).delay(500);
      }
    });

    $(document).click(function (e) {
      let tg = e.target;
      if (tg.closest('.tooltip-btn') === null) {
        $('.tooltip-btn').removeClass('active').find('.pop-up').animate({ opacity: 0 }, 500).delay(500);
      }
    })
  })();


  //모달
  (function () {
    $('.modal-open').click(function () {
      let id = $(this).attr('data-id');

      $(id).removeClass('d-none').animate({ opacity: 1 }, 500).find('.modal').animate({ marginTop: 0 }, 300);
      let hei=$(id).find('.modal').height();//24.01.23

      if(hei>$(window).height()*.8){
        if($(id).find('.modal-content').height()>$(id).find('.modal').height()-$('.modal-header').height()){
        $(id).find('.modal').addClass('max');
        }
      }//24.01.23
    })
    $('.modal-close').click(function () {
      $(this).closest('.modal-wrap').animate({ opacity: 0 }, 500).find('.modal').animate({ marginTop: -50 + 'px' }, 300);
      let closeTimer = setTimeout(function () {
        $('.modal-wrap').addClass('d-none');
        clearTimeout(closeTimer);
      }, 500);
    });

    $('.modal-wrap').click(function (e) {
      let tg = e.target;
      if (tg.closest('.modal') === null) {
        $(this).find('.modal>.modal-close').trigger('click');
      }
    })
  })();


  //page-top
  $(window).scroll(function () {
    let scrTop = $(document).scrollTop();
    if (scrTop > $(window).height() / 2.5) {
      $('.page-top').fadeIn();
    } else {
      $('.page-top').fadeOut();
    }
  });

  $('.page-top').click(function () {
    $('html, body').animate({ scrollTop: '0' }, 400);
  })

  //데이트피커
  $('[data-toggle="datepicker"]').datepicker({
    format: 'yyyy-mm-dd',
    language: 'ko-KR',
    autoHide: 'true',
    zIndex:6000,
  });


  // 테이블 마지막 라인 24.01.23
  if($('.table tr:last-child').hasClass('d-none')){
     $('.table tr:last-child').prev().css({borderBottom:0});
  };

  // 선택옵션 - 표시 된 체크박스 사용 불가로 만들기 24.01.23
  $('.dis').prev('.checkbox').click(function(){
    return false;
  })

});
