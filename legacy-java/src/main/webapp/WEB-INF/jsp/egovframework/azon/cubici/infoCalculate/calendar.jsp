<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>

<sec:authorize access="isAuthenticated()">
	<sec:authentication property="principal" var="principal"/>
</sec:authorize>

<!--tui calendar CDN 시작-->
<link rel="stylesheet" type="text/css" href="/resources/rudicks/css/calendar/tui-calendar.css" />
<!-- If you use the default popups, use this. -->
<link rel="stylesheet" type="text/css" href="/resources/rudicks/css/calendar/tui-date-picker.css" />
<link rel="stylesheet" type="text/css" href="/resources/rudicks/css/calendar/tui-time-picker.css" />

<script src="/resources/rudicks/js/calendar/tui-code-snippet.min.js"></script>
<script src="/resources/rudicks/js/calendar/tui-time-picker.min.js"></script>
<script src="/resources/rudicks/js/calendar/tui-date-picker.min.js"></script>
<script src="/resources/rudicks/js/calendar/tui-calendar.js"></script>
<script src="/resources/rudicks/js/calendar/moment.min.js"></script>
<!--tui calendar CDN 끝-->

<script>
//오늘 날짜
const curr = new Date();
const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
const kr_curr = new Date(utc + KR_TIME_DIFF);
//console.log("utc :: "+utc+" KR_TIME_DIFF :: "+KR_TIME_DIFF+" kr_curr :: "+kr_curr);

const now = kr_curr;
const nowYear= now.getFullYear();
const nowMonth = (now.getMonth()+1) > 9 ? ''+(now.getMonth()+1) : '0'+(now.getMonth()+1);
const nowDay = now.getDate() > 9 ? ''+now.getDate() : '0'+now.getDate();
//console.log("현재 시간 :: "+now+" :: "+nowYear+"-"+nowMonth+"-"+nowDay);

var yearMonth = nowYear + '-' + nowMonth; // 조회 월

//공휴일
let holiday = [];

$(document).ready(function() {
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	if ("${resultCode}" === "0") {
		let shopTypeList = "${shopInfoMap.shop_type_list}".split(",");
		let shopNameList = "${shopInfoMap.shop_name_list}".replace("^", "").split("|^");
		
		for(let i=0; i<Number("${shopInfoMap.shop_count}"); i++){
			$("#selectShop").append("<option value="+shopTypeList[i]+">"+shopNameList[i]+"</option>");
		}
		
		calendarFunc();
		calculatePreFunc();
		settlementFunc();
		

		
	} else {
		modalInfo("ErrorCode ::: " + "${resultCode}");
	}

	// selectbox 이벤트
	$(document).on('change', "#selectShop", function(){  // 선택했을때 월 그대로
		
		// 로딩바
		$(".loadingSpinner").css({"display" : "inline-block"});
	
		$("#calendar").empty();
		$('.moveDay').off('click');
		calendarFunc();
		
		// 로딩바
		$(".loadingSpinner").css({"display" : "none"});
    });
	
	// Excel 버튼
	$("#excelBtn").on('click', function(){
		
		// 사용자 확인
		let thisUser = ${userCheck};
		if (thisUser == "41" || thisUser == "40"){
			modalInfo("사용 가능 회원이 아닙니다.");
		}else{
			doExcelDownloadProcess(yearMonth);
		}
	});
});

// 정산 예정액 합계(주간, 월간)
function calculatePreFunc(){
	let callUrl = "/cubici/calculateInfo/calendar/calculatePre";
	let callBackFunc = "calculatePreFuncResponse";
	let objParam = {
		// 프로시저는 shop_name_list, 쿼리는 shop_type_list
		SHOP_TYPE_LIST : "${shopInfoMap.shop_type_list}",
		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		AUCTION_ONLINE_REMIT_DATE : "${shopInfoMap.auction_online_remit_date}",
		ELEVEN_SHOP_GRADE_DATE : "${shopInfoMap.eleven_shop_grade_date}",
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function calculatePreFuncResponse(data){
	$("#weeklyPre").html(comma(data.weeklySum)+" <span class='unit'>원</span>");
	$("#monthPre").html(comma(data.monthSum)+" <span class='unit'>원</span>");
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "none"});
}

//정산 입금액 합계
function settlementFunc(){
	let callUrl = "/cubici/calculateInfo/calendar/settlementAmount";
	let callBackFunc = "settlementFuncResponse";
	let objParam = {
		SHOP_TYPE_LIST : "${shopInfoMap.shop_type_list}",
		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		ORDER_BY : "SHOP_TYPE",
		PRODUCT_NAME : "%%"
	}
	
	cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function settlementFuncResponse(data){
	$("#monthSettlement").html(comma(data.thisMonthSettlement)+" <span class='unit'>원</span>");	
}

// 캘린더
function calendarFunc(){
	
	let Calendar = tui.Calendar;
	
	var cal, resizeThrottled;
    var koWeek = ['일','월','화','수','목','금','토'];
    var MONTHLY_CUSTOM_THEME = {
        // month header 'dayname'
        'month.dayname.height': '30px',
        'month.dayname.paddingLeft': '10px',
        'month.dayname.fontSize': '16px',
        'month.dayname.fontWeight': '300',
        // month day grid cell 'day' 
        'month.holidayExceptThisMonth.color': '#ddd',
        'month.dayExceptThisMonth.color': '#ddd',
        'month.weekend.backgroundColor': 'rgba(188, 226, 255, 0.1)',
        'month.day.fontSize': '16px',
        'common.saturday.color': '#00F',
     	// creation guide style
        'common.creationGuide.backgroundColor': '#00ff0000',
        'common.creationGuide.border': '#ddd',

    };

    //캘린더 실행
    cal = new Calendar('#calendar', {
        defaultView: 'month',
        month: {
            daynames: koWeek,
        },
        week: {
            daynames: koWeek,
        },
        useCreationPopup: false,
        useDetailPopup: false,
        theme : MONTHLY_CUSTOM_THEME,
        template: {
            milestone: function(model) {
                return '<span class="calendar-font-icon ic-milestone-b"></span> <span style="background-color: ' + model.bgColor + '">' + model.title + '</span>';
            },
            allday: function(schedule) {
                return getTimeTemplate(schedule, true);
            },
            time: function(schedule) {
                return getTimeTemplate(schedule, false);
            }
        },
	});
    
    cal.setDate(yearMonth + '-' + nowDay); //calendar그릴 때 yearMonth에 저장된 날짜 넘기기 ( 날짜는 임의로 )

    // 캘린더 이벤트
    cal.on({
        'clickSchedule': function(e) {
        	dailyDetailModal(e.schedule.id);
	    },
	    'beforeCreateSchedule': function(e) {
	        //console.log('beforeCreateSchedule', e);
	        // open a creation popup
	        // If you dont' want to show any popup, just use `e.guide.clearGuideElement()`
	        // then close guide element(blue box from dragging or clicking days)
	        e.guide.clearGuideElement();
	    },
	    'afterRenderSchedule': function(e){
	    	setTimeout(holidayStyle(holiday),1000);
	    }
    });

    function getTimeTemplate(schedule, isAllDay) {
        var html = [];
        var start = moment(schedule.start.toUTCString());
        if (!isAllDay) {
            html.push('<strong>' + start.format('HH:mm') + '</strong> ');
        }
        if (schedule.isPrivate) {
            html.push('<span class="calendar-font-icon ic-lock-b"></span>');
            html.push(' Private');
        } else {
            if (schedule.isReadOnly) {
                html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
            } else if (schedule.recurrenceRule) {
                html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
            } else if (schedule.attendees.length) {
                html.push('<span class="calendar-font-icon ic-user-b"></span>');
            } else if (schedule.location) {
                html.push('<span class="calendar-font-icon ic-location-b"></span>');
            }
            html.push(' ' + schedule.title);
        }

        return html.join('');
    }

    function onClickNavi(e) {
		let action = getDataAction(e.target);
        
        let tempYearMonth = yearMonth.split("-");
    	let compareMonth = new Date(tempYearMonth[0], tempYearMonth[1]-1, "1");
        
        switch (action) {
            case 'move-prev':
            	let prevDate = new Date(compareMonth.setMonth(compareMonth.getMonth()-1));
				let prevYear= prevDate.getFullYear();
				let prevMonth = (prevDate.getMonth()+1) > 9 ? ''+(prevDate.getMonth()+1) : '0'+(prevDate.getMonth()+1);
				let prevDay = prevDate.getDate() > 9 ? ''+prevDate.getDate() : '0'+prevDate.getDate();
            	yearMonth = prevYear+"-"+prevMonth;
            	//alert("이전달 :: "+yearMonth);
                cal.prev();
                break;
            case 'move-next':
            	let nextDate = new Date(compareMonth.setMonth(compareMonth.getMonth()+1));
				let nextYear= nextDate.getFullYear();
				let nextMonth = (nextDate.getMonth()+1) > 9 ? ''+(nextDate.getMonth()+1) : '0'+(nextDate.getMonth()+1);
				let nextDay = nextDate.getDate() > 9 ? ''+nextDate.getDate() : '0'+nextDate.getDate();
            	yearMonth = nextYear+"-"+nextMonth;
            	//alert("다음달 :: "+yearMonth);
                cal.next();
                break;
            case 'move-today':
				yearMonth = nowYear + '-' + nowMonth; // 현재 월
				//alert("오늘 :: "+yearMonth);
                cal.today();
                break;
            default:
                return;
        }

        setRenderRangeText();
        setSchedules();
 	    // 로딩바
		$(".loadingSpinner").css({"display" : "none"});
    }

    function setTodayDateText(){
        var today = document.getElementById('todayDateText');
        today.innerHTML = moment(nowYear + '-' + nowMonth + '-' + nowDay).format('YYYY년 M월 DD일');        
    }

    function setRenderRangeText() {
        var prevMonth = document.getElementById('prevMonth');
        var nextMonth = document.getElementById('nextMonth');
        var renderRange = document.getElementById('renderRange');
        var options = cal.getOptions();
        var viewName = cal.getViewName();
      //var currentMonth = moment(cal.getDate().getTime()).format('M');
        var currentMonth = moment(yearMonth).format('M');
        var html = [];
        if (viewName === 'day') {
      //html.push(moment(cal.getDate().getTime()).format('YYYY년 M월 DD일'));
        	 html.push(moment(yearMonth).format('YYYY년 M월 DD일'));
        } else if (viewName === 'month' &&
            (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
      //html.push(moment(cal.getDate().getTime()).format('YYYY년 M월'));
        	html.push(moment(yearMonth).format('YYYY년 M월'));
        } else {
            html.push(moment(cal.getDateRangeStart().getTime()).format('YYYY년 M월 DD일'));
            html.push(' ~ ');
            html.push(moment(cal.getDateRangeEnd().getTime()).format(' YYYY년 M월 DD일'));
        }
        renderRange.innerHTML = html.join('');

        var prevTxt = Number(currentMonth) == 1 ? 12 : Number(currentMonth) - 1;
        var nextTxt =  Number(currentMonth) == 12 ? 1 : Number(currentMonth) + 1;
        prevMonth.innerText = prevTxt + '월';
        nextMonth.innerText = nextTxt + '월';
        
    }

    function setSchedules() {
        cal.clear();
       /* ********** 캘린더 파라미터 작업 ********** */
    	// 기본적으로 fromDate는 이번달 1일, toDate는 말일 (이번달만 예외 -> 자바에서 처리)
    	let fromDate = yearMonth + "-01";
    	
    	let tempYearMonth = yearMonth.split("-");
    	let tempToDate = new Date(tempYearMonth[0], tempYearMonth[1], 0); // 월말
    	let tempToDate2 = Number(tempToDate.getDate()) > 9 ? ''+tempToDate.getDate() : '0'+tempToDate.getDate();
    	let toDate = yearMonth+"-"+tempToDate2;
    	//console.log("tempYearMonth :: "+tempYearMonth+" fromDate :: "+fromDate+" toDate :: "+toDate);
    	
    	let compareDate1 = new Date(nowYear+"/"+nowMonth+"/"+nowDay); // 오늘 날짜랑
    	let compareDate2 = new Date(tempYearMonth[0]+"/"+tempYearMonth[1]+"/01"); // 가져올 날짜랑 월 비교 (전달이면 +, 다음달이면 -)
    	
    	let tempDateFlag = compareDate1.getYear()-compareDate2.getYear();
    	//console.log("tempDateFlag :: "+tempDateFlag);
    	let dateFlag = 0;
    	
    	if(tempDateFlag === 0){ // 같은 연도면 월 까지 빼기
    		dateFlag = compareDate1.getMonth()-compareDate2.getMonth();
    	} else { // 이전, 이후 연도면 그냥 넣고
    		dateFlag = tempDateFlag;
    	}
    	//console.log("nowMonth :: "+nowMonth+" tempYearMonth[1] :: "+tempYearMonth[1]+" compareDate1 :: "+compareDate1+" compareDate2 :: "+compareDate2+" dateFlag :: "+dateFlag);
    	
    	// 선택한 쇼핑몰
		let selectShop = $("#selectShop option:selected").val();
        let shopTypeList = "";
    	if(selectShop === undefined || selectShop === "0" ){ // 전체 선택
    		shopTypeList = "${shopInfoMap.shop_type_list}";
    	} else {
    		shopTypeList = selectShop;
    	}
       	
        let objParam = {
       		SHOP_TYPE_LIST : shopTypeList,
          		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
          		INTERPARK_ID : "${shopInfoMap.interpark_id}",
          		GMARKET_ID : "${shopInfoMap.gmarket_id}",
          		AUCTION_ID : "${shopInfoMap.auction_id}",
          		ELEVEN_ID : "${shopInfoMap.eleven_id}",
          		COUPANG_ID : "${shopInfoMap.coupang_id}",
          		NAVER_ID : "${shopInfoMap.naver_id}",
          		AUCTION_ONLINE_REMIT_DATE : "${shopInfoMap.auction_online_remit_date}",
          		ELEVEN_SHOP_GRADE_DATE : "${shopInfoMap.eleven_shop_grade_date}",
          		ORDER_BY : "SHOP_TYPE",
          		PRODUCT_NAME : "%%",
          		fromDate : fromDate,
          		toDate : toDate,
          		yearMonth : yearMonth,
          		dateFlag : dateFlag
        };
        
        let tempSchedules = new Array();
    	holiday = [];
    	
        $.ajax({
			cache : false,
			async : false,
			type : "POST",
			url : "/cubici/calculateInfo/calendar/get",
			data : JSON.stringify(objParam),
			dataType : "JSON",
			contentType : "application/json; charset=utf-8",
			success : function(result) {
				if (result.resultCode === 0) {
					
					for(var i=0; i<result.holidayList.length; i++){
						if(result.holidayList[i].DAY_OF_THE_WEEK != "01" && result.holidayList[i].DAY_OF_THE_WEEK != "02"){
							let h_date = result.holidayList[i].HOLIDAY_DATE.split("-");
							holiday.push(parseInt(h_date[2]));
						}
					}

			    	let sumSettlementData = 0;
					for(var i=0; i<result.settlementList.length; i++){
				    	let getData = result.settlementList[i];
				    
				    	sumSettlementData += result.settlementList[i].SETTLEMENT_AMOUNT;
				    	
				    	let settlementObj = {
					    	id : getData.SETTLEMENT_DATE,
					    	title : '₩ '+comma(getData.SETTLEMENT_AMOUNT),
					    	isAllDay : false,
					    	start : getData.SETTLEMENT_DATE+"T11:30:00+09:00",
					    	end : getData.SETTLEMENT_DATE+"T12:00:00+09:00",
					    	color : '#555',
					    	isVisible : true,
					    	bgColor : '#eee',
					    	dragBgColor : '#eee',
					    	borderColor : '#eee',
					    	calendarId : '1',
					    	category : 'allday',
					    	location : '',
					    	state : 'Busy',
				    	};
				    	tempSchedules.push(settlementObj);
				    	
				    	let preObj = {
						    	id : getData.SETTLEMENT_DATE,
						    	title : "총 : "+comma(getData.QUANTITY)+'개',
						    	isAllDay : false,
						    	start : getData.SETTLEMENT_DATE+"T12:30:00+09:00",
						    	end : getData.SETTLEMENT_DATE+"T13:00:00+09:00",
						    	color : '#555',
						    	isVisible : true,
						    	bgColor : '#eee',
						    	dragBgColor : '#eee',
						    	borderColor : '#eee',
						    	calendarId : '1',
						    	category : 'allday',
						    	location : '',
						    	state : 'Busy',
					    	};
					    tempSchedules.push(preObj);
					}
					
					let price = document.getElementById('price');
			        price.innerHTML = "TOTAL&nbsp&nbsp"+comma(sumSettlementData)+"원";     
					
				} else {
					modalInfo("ErrorCode ::: " + result.resultCode);
				}
			},
			error : function(result) {
				alert(cubici.AJAX_ERROR_MSG);
			}
		});
        
        //console.log(tempSchedules);
        cal.createSchedules(tempSchedules);
        
        return holiday;
    }

    function setEventListener() {
        $('.moveDay').on('click', onClickNavi);
        window.addEventListener('resize', resizeThrottled);
    }

    function getDataAction(target) {
        return target.dataset ? target.dataset.action : target.getAttribute('data-action');
    }

    resizeThrottled = tui.util.throttle(function() {
        cal.render();
    }, 50);

    window.cal = cal;

    setRenderRangeText();
    setSchedules();
    setEventListener();
    setTodayDateText();
}

//공휴일 날짜 색상
function holidayStyle(holiday){
	let c_day = document.getElementsByClassName("tui-full-calendar-weekday-grid-date");
	for(let i=0; i<c_day.length; i++){
		if(c_day[i].parentNode.style.color == "rgb(51, 51, 51)" || c_day[i].parentNode.style.color == "rgb(0, 0, 255)"){ // 해당월 평일 : 색상으로 구분
			for(let j=0; j<holiday.length; j++){
				if(holiday[j] == c_day[i].innerText){
					document.getElementsByClassName("tui-full-calendar-weekday-grid-header")[i].childNodes[1].style.color= "rgb(255, 64, 64)";
					document.getElementsByClassName("tui-full-calendar-weekday-grid-line")[i].classList.add('holiday');
					
				}
			}
		}
	}
}


// 일일 정산 상세내역 modal
function dailyDetailModal(selectDate){
	
	// 로딩바
	$(".loadingSpinner").css({"display" : "inline-block"});
	
	let selectShop = $("#selectShop option:selected").val();
	let shopTypeList = "";
	if(selectShop === undefined || selectShop === "0" ){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}";
	} else {
		shopTypeList = selectShop;
	}
	
	let tempYearMonth = selectDate.split("-");
	let compareDate1 = new Date(nowYear+"/"+nowMonth+"/"+nowDay); // 오늘 날짜랑
	let compareDate2 = new Date(tempYearMonth[0]+"/"+tempYearMonth[1]+"/"+tempYearMonth[2]); // 가져올 날짜랑 비교
	let dateFlag = 0;
	
	if(compareDate1.valueOf() <= compareDate2.valueOf()){
		dateFlag = 0;
	} else if(compareDate1.valueOf() > compareDate2.valueOf()){
		dateFlag = 1;
	}
	
	//console.log(selectDate+ " :: "+dateFlag);
	
	let callUrl = "/cubici/calculateInfo/calendar/detailModal";
	let callBackFunc = "dailyDetailModalResponse";
	let objParam = {
		SHOP_TYPE_LIST : shopTypeList,
		COUPANG_SETTLEMENT_TYPE : "${principal.coupang_settlement_type}",
		INTERPARK_ID : "${shopInfoMap.interpark_id}",
		GMARKET_ID : "${shopInfoMap.gmarket_id}",
		AUCTION_ID : "${shopInfoMap.auction_id}",
		ELEVEN_ID : "${shopInfoMap.eleven_id}",
		COUPANG_ID : "${shopInfoMap.coupang_id}",
		NAVER_ID : "${shopInfoMap.naver_id}",
		AUCTION_ONLINE_REMIT_DATE : "${shopInfoMap.auction_online_remit_date}",
		ELEVEN_SHOP_GRADE_DATE : "${shopInfoMap.eleven_shop_grade_date}",
		ORDER_BY : "SHOP_TYPE",
		fromDate : selectDate,
		toDate : selectDate,
		dateFlag : dateFlag,
		PRODUCT_NAME : "%%"
	}
	
	 cubici.Ajax.fnRequest(objParam, callUrl, callBackFunc);
}
function dailyDetailModalResponse(data){
	
	let dataLength = data.resultList.length;
	
	if(dataLength === 0){
		modalInfoFunc("해당 날짜에 데이터가 없습니다.");
	} else {
		// 데이터 초기화
		let tbodyHtml = "";
		let tempHtml = "";
		let sumOrderCount = 0;
		let sumSettlement = 0;
		
		// 데이터 삽입
		for(var i=0; i<data.resultList.length; i++){
			let getData = data.resultList[i];
			
			sumOrderCount += Number(getData.QUANTITY);
			sumSettlement += Number(getData.SETTLEMENT_AMOUNT);
			
			// 각 쇼핑몰 데이터
			tempHtml += "<tr><td><div class=\"tIn\">"+getData.SHOP+"</div></td>";
			tempHtml += "<td><div class=\"tIn\">"+comma(getData.QUANTITY)+"&nbsp개</div></td>";
			tempHtml += "<td><div class=\"tIn\">"+comma(getData.SETTLEMENT_AMOUNT)+"&nbsp원</div></td></tr>";
		}
		
		// 합계 데이터
		tbodyHtml += "<tr><td><strong><div class=\"fwBox\"><b>Total</b></div></strong></td>";
		tbodyHtml += "<td><strong><div class=\"fwBox\"><b>"+comma(sumOrderCount)+"&nbsp개</b></div></strong></td>";
		tbodyHtml += "<td><strong><div class=\"fwBox\"><b>"+comma(sumSettlement)+"&nbsp원</b></div></strong></td></tr>";
		tbodyHtml += tempHtml;
		
		// 기준 날짜
		let tempDate = data.resultList[0].SETTLEMENT_DATE.split("-");
		$("#modalStandardDate").empty().html("<span>"+tempDate[0]+"년 "+tempDate[1]+"월 "+tempDate[2]+"일</span>");
		$("#dailyDetailModalTbody").empty().html(tbodyHtml);
	}
	
	// 로딩바 해제
	$(".loadingSpinner").css({"display" : "none"});
	
	// 상세 모달 띄우기
	modalOpen("c3p1");
}

/*** Excel 다운로드 (MKC 2021.04.13) ***/
function doExcelDownloadProcess(yearMonth) {
	
	// 검색한 달 1일
	let fromDate = yearMonth + "-01";
	
	// 검색한 달 말일
	let arrYearMonth = yearMonth.split("-");
	let tempToDate = new Date(arrYearMonth[0], arrYearMonth[1], 0); // 월말
	let tempToDateStr = Number(tempToDate.getDate()) > 9 ? ''+tempToDate.getDate() : '0'+tempToDate.getDate();
	let toDate = yearMonth+"-"+tempToDateStr;
	let todayDateStr = nowYear+"-"+nowMonth+"-"+nowDay;
	
	// 전일 날짜
	let yesterDate = new Date();
	yesterDate.setDate(now.getDate()-1);
	
	let yesterYear= yesterDate.getFullYear();
	let yesterMonth = (yesterDate.getMonth()+1) > 9 ? ''+(yesterDate.getMonth()+1) : '0'+(yesterDate.getMonth()+1);
	let yesterDay = yesterDate.getDate() > 9 ? ''+yesterDate.getDate() : '0'+yesterDate.getDate();
	let yesterDateStr = yesterYear+"-"+yesterMonth+"-"+yesterDay;
	
	// 날짜 비교 & Flag 저장
	let todayDate = new Date(nowYear+"/"+nowMonth+"/"+nowDay);
	let compareFromDate = new Date(arrYearMonth[0]+"/"+arrYearMonth[1]+"/01"); // 가져올 날짜랑 월 비교 (전달이면 +, 다음달이면 -)
	let compareToDate = new Date(arrYearMonth[0]+"/"+arrYearMonth[1]+"/"+tempToDateStr);
	
	let dateFlag = 0;
	if(todayDate < compareFromDate){
		// 미래
		dateFlag = 2;
	}else if(compareFromDate <= todayDate && todayDate <= compareToDate){
		// 현재
		dateFlag = 1;
	}else if(todayDate > compareToDate){
		// 과거
		dateFlag = 0;
	}

	// 쇼핑몰 선택
	let selectShop = $("#selectShop option:selected").val();
	let shopTypeList = "";
	let shopNameListStr = "";
	if(selectShop === "0"){ // 전체 선택
		shopTypeList = "${shopInfoMap.shop_type_list}"; // 전체 쇼핑몰 코드
		
		let shopNameList = "${shopInfoMap.shop_name_list}";
		shopNameListStr = shopNameList.replace(/\^/gi, "").replace(/\|/gi, ","); // 전체 쇼핑몰명
		
	} else {
		shopTypeList = selectShop; // 쇼핑몰 코드
		
		// 쇼핑몰명
		if(selectShop === "1"){
			shopNameListStr = "인터파크";
		}else if(selectShop === "2"){
			shopNameListStr = "지마켓";
		}else if(selectShop === "3"){
			shopNameListStr = "옥션";
		}else if(selectShop === "4"){
			shopNameListStr = "11번가";
		}else if(selectShop === "11"){
			shopNameListStr = "쿠팡";
		}else if(selectShop === "14"){
			shopNameListStr = "네이버";
		}
	}
	
	// 초기화
	if ($("#excelForm").html != null) {
		$("#excelForm").remove();
	}

	// form 태그 생성
	var formHtml = "";
	formHtml = '<form id="excelForm" name="excelForm" method="post" enctype="multipart/form-data" style="display: none">'
	formHtml += '<input type="hidden" name="excelFlag" value="calendar">';
	formHtml += '<input type="hidden" name="userNo" value="${principal.user_no}">';
	formHtml += '<input type="hidden" name="coupang_settle_type" value="${principal.coupang_settlement_type}">';
	formHtml += '<input type="hidden" name="auction_online_remit_date" value="${shopInfoMap.auction_online_remit_date}">';
	formHtml += '<input type="hidden" name="eleven_shop_grade_date" value="${shopInfoMap.eleven_shop_grade_date}">';
	formHtml += '<input type="hidden" name="fromDate" value="'+fromDate+'">';
	formHtml += '<input type="hidden" name="toDate" value="'+toDate+'">';
	formHtml += '<input type="hidden" name="todayDate" value="'+todayDateStr+'">';
	formHtml += '<input type="hidden" name="yesterDate" value="'+yesterDateStr+'">';
	formHtml += '<input type="hidden" name="dateFlag" value="'+dateFlag+'">';
	formHtml += '<input type="hidden" name="shop_type_list" value="'+shopTypeList+'">';
	formHtml += '<input type="hidden" name="shop_name_list" value="'+shopNameListStr+'">';
	formHtml += '<input type="hidden" name="interpark_id" value="${shopInfoMap.interpark_id}">';
	formHtml += '<input type="hidden" name="eleven_id" value="${shopInfoMap.eleven_id}">';
	formHtml += '<input type="hidden" name="gmarket_id" value="${shopInfoMap.gmarket_id}">';
	formHtml += '<input type="hidden" name="auction_id" value="${shopInfoMap.auction_id}">';
	formHtml += '<input type="hidden" name="naver_id" value="${shopInfoMap.naver_id}">';
	formHtml += '<input type="hidden" name="coupang_id" value="${shopInfoMap.coupang_id}">';
	formHtml += '</form>';
	$(".excelDiv").append(formHtml);

	var exlForm = document.excelForm;
	exlForm.action = "/cubici/calculateInfo/settlement/excelDownload";
	exlForm.submit();
}
</script>
	
<article class="subBox">
	<div class="colContents">
		<dl>
			<dt>금주 정산 예정 잔액</dt>
			<dd id="weeklyPre">
			</dd>
		</dl>
		<dl>
			<dt class="lb">당월 잔여 정산 예상액</dt>
			<dd id="monthPre">
			</dd>
		</dl>
		<dl>
			<dt class="nv">당월 누적 정산 입금액</dt>
			<dd id="monthSettlement">
			</dd>
		</dl>
	</div>
</article>
<article class="subBox">
	<div class="calendarContents">
		<header class="cal-header">
			<div class="cal-btn prev">
                <span id="prevMonth" class="mTxt"></span>
                <button type="button" class="navBtn moveDay prev" data-action="move-prev">prev</button>
            </div>
            <div class="cal-btn next">
                <button type="button" class="navBtn moveDay next" data-action="move-next">next</button>
                <span id="nextMonth" class="mTxt"></span>
            </div>
            <div class="now-date">
                <div id="renderRange" ></div>
                <div class="price" id="price"></div>
            </div>
		</header>
		<div class="contentArea">
			<div class="cal-top">
				<div class="left-item">
					<button type="button" class="navBtn moveDay sBtn sColorLB rBtn" data-action="move-today">Today</button>
					<span id="todayDateText" class="todayTxt"></span>
				</div>
				<ul class="right-item">
					<li>
						<div class="fwBox">
							<span class="ft">쇼핑몰</span>
							<div class="input">
								<select id="selectShop">
									<option value="0">전체</option>
								</select>
							</div>
						</div>
					</li>
					<li class="infoArea">
						<a href="javascript:;" class="oiBtn infoBtn gray">정보</a>
						<div class="infoMemo">
							<h5 class="mt"><span>정산 캘린더 안내</span></h5>
                            <div class="iCon">
                                <p>
                                    금일이후 정산예정금액은 각 쇼핑몰의
                                    정산정책을 기반으로 산출된 금액이고,
                                    정산입금액은 쇼핑몰 입금금액을
                                    기준으로 표시됩니다. 해당일자 클릭 시,
                                    쇼핑몰 내역이 표시됩니다. 
                                </p>
                            </div>
						</div>
					</li>
					<li><a class="sBtn iBtn sColorN excel" style="cursor: pointer" id="excelBtn">엑셀 다운로드</a><div class="excelDiv"></div></li>
				</ul>
			</div>
			<div id="calendar" class="calendarBox"></div>
		</div>
	</div>
</article>

<!-- 상세내역 모달 -->
<div class="modal-container" id="c3p1">
	<div class="modal-wrapper">
		<header>
			<h2>일일 정산 상세내역</h2>
			<a href="javascript:;" class="modalClose">닫기</a>
		</header>
		<div class="modal-content">
			<div class="mInner auto mArticleArea">
				<article class="m-modalGrid">
					<div class="contentsArea">
						<div class="col-5">
							<ul class="item hasBottomLine">
								<li class="col-1">
									<div class="fwBox" >
										<span class="ft">기준일자</span>
										<div class="input" id="modalStandardDate">
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</article>
				<article>
					<div class="contentsArea">
						<div class="maxHeight long">
							<table class="m-shadowTable">
								<thead>
									<tr>
										<th>쇼핑몰</th>
										<th>수량</th>
										<th>정산금액</th>
									</tr>
								</thead>
								<tbody id="dailyDetailModalTbody">
								</tbody>
							</table>
						</div>
					</div>
				</article>
				<div class="btnArea">
					<a href="javascript:;" class="modalClose mBtn sColorLB">확인</a>
				</div>
			</div>
		</div>
	</div>
</div>
