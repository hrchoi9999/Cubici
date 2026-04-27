
$(document).ready(function () {

	//일정&캘린더 페이지 변수
	const calender_page = $('.calendar-body');
	const today_btn = $('today');//오늘 버튼
	const prev = $('.prev-month');
	const next = $('.next-month');

	/* 로컬스토리지 키 형식 2021-3-1
		 지정일 인풋 키 형식 2012-03-03 */
	const week_arr = ["일", "월", "화", "수", "목", "금", "토"];

	const getDate = new Date();
	const getThisYear = getDate.getFullYear();
	const getThisMonth = getDate.getMonth();
	const getThisDate = getDate.getDate();
	const getThisDay = week_arr[getDate.getDay()];

	const this_year = $('.year');
	const this_month = $('.month');

	let reYear = getThisYear;// 변동 연도 받을 변수
	let reMonth = getThisMonth;// 변동 월 받을 변수


	//===========================================================================
	// 윤년을 판단하는 함수
	function isLeapYear(year) {
		return year % 400 == 0 || (year % 4 == 0 && year % 100 != 0);
	}
	// 월의 마지막 날짜를 리턴하는 함수
	function getLastDayOfMonth(year, month) {
		var monthDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		monthDay[1] = isLeapYear(year) ? 29 : 28;
		return monthDay[month - 1];
	}
	// 1년 1월 1일부터 지정날짜까지의 총일수
	function getTotalDay(year, month, day) {
		var totalDay =
			(year - 1) * 365 +
			Math.floor((year - 1) / 4) -
			Math.floor((year - 1) / 100) +
			Math.floor((year - 1) / 400);
		for (var i = 1; i < month; i++) totalDay += getLastDayOfMonth(year, i);
		totalDay += day;
		return totalDay;
	}
	// 요일을 숫자로
	function getDayOfWeekNum(year, month, day) {
		return getTotalDay(year, month, day) % 7;
	}
	// 요일을 문자로
	function getDayOfWeekStr(year, month, day) {
		return "일월화수목금토".charAt(getDayOfWeekNum(year, month, day));
	}
	//=======================================================================
	// 음력 데이터 (평달 - 작은달 :1,  큰달:2 )
	// (윤달이 있는 달 - 평달이 작고 윤달도 작으면 :3 , 평달이 작고 윤달이 크면 : 4)
	// (윤달이 있는 달 - 평달이 크고 윤달이 작으면 :5,  평달과 윤달이 모두 크면 : 6)
	var lunarMonthTable = [
		[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1] /* 2011 */,
		[2, 1, 2, 5, 2, 2, 1, 1, 2, 1, 2, 1],
		[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
		[1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
		[1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
		[2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
		[1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 2, 2],
		[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
		[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2] /* 여기 변경 */,
		[2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
		[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1] /* 2021 */,
		[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
		[1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
		[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
		[2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
		[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
		[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
		[2, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
		[2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
		[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
		[2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1] /* 2031 */,
		[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
		[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
		[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2],
		[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
		[2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
		[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
		[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
		[2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
		[2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1],
		[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2] /* 2041 */,
		[1, 5, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
		[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
		[2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2],
		[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
		[2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
		[2, 1, 2, 2, 4, 1, 2, 1, 1, 2, 1, 2],
		[1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1],
		[2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
		[1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2, 1],
		[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2] /* 2051 */,
		[1, 2, 1, 1, 2, 1, 1, 5, 2, 2, 2, 2],
		[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
		[1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
		[1, 2, 2, 1, 2, 4, 1, 1, 2, 1, 2, 1],
		[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
		[1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1],
		[2, 1, 2, 4, 2, 1, 2, 1, 2, 2, 1, 1],
		[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
		[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1],
		[2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2, 1] /* 2061 */,
		[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
		[2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
		[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
		[2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
		[1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2],
		[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
		[2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
		[1, 2, 1, 5, 1, 2, 1, 2, 2, 2, 1, 2],
		[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
		[2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2] /* 2071 */,
		[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
		[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
		[2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2, 1],
		[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
		[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],
		[2, 1, 2, 3, 2, 1, 2, 2, 2, 1, 2, 1],
		[2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
		[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
		[2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2, 2],
		[1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2] /* 2081 */,
		[1, 2, 2, 2, 1, 2, 3, 2, 1, 1, 2, 2],
		[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
		[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
		[1, 2, 1, 1, 6, 1, 2, 2, 1, 2, 1, 2],
		[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
		[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
		[1, 2, 1, 5, 1, 2, 1, 1, 2, 2, 2, 1],
		[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
		[2, 2, 2, 1, 2, 1, 1, 5, 1, 2, 2, 1],
		[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1] /* 2091 */,
		[2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
		[1, 2, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1],
		[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
		[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
		[2, 1, 2, 3, 2, 1, 1, 2, 2, 2, 1, 2],
		[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
		[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
		[2, 5, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2],
		[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
		[2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2, 1]
	];
	//=======================================================================
	// 계산을 빨리하기 위하여 기준 년도를 구한다.
	function getBaseDate(year, month, day) {
		var solYear, solMonth, solDay;
		var lunYear, lunMonth, lunDay;
		var lunLeapMonth, lunMonthDay;
		var solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if (year < 1800 || year > 2101) {
			throw "1800년부터 2101년까지만 확인 가능합니다.";
		}
		if (year >= 2080) {
			/* 기준일자 양력 2080년 1월 1일 (음력 2079년 12월 10일) */
			solYear = 2080;
			solMonth = 1;
			solDay = 1;
			lunYear = 2079;
			lunMonth = 12;
			lunDay = 10;
			lunLeapMonth = 0;
			solMonthDay[1] = 29; /* 2080 년 2월 28일 */
			lunMonthDay = 30; /* 2079년 12월 */
		} else if (year >= 2060) {
			/* 기준일자 양력 2060년 1월 1일 (음력 2059년 11월 28일) */
			solYear = 2060;
			solMonth = 1;
			solDay = 1;
			lunYear = 2059;
			lunMonth = 11;
			lunDay = 28;
			lunLeapMonth = 0;
			solMonthDay[1] = 29; /* 2060 년 2월 28일 */
			lunMonthDay = 30; /* 2059년 11월 */
		} else if (year >= 2040) {
			/* 기준일자 양력 2040년 1월 1일 (음력 2039년 11월 17일) */
			solYear = 2040;
			solMonth = 1;
			solDay = 1;
			lunYear = 2039;
			lunMonth = 11;
			lunDay = 17;
			lunLeapMonth = 0;
			solMonthDay[1] = 29; /* 2040 년 2월 28일 */
			lunMonthDay = 29; /* 2039년 11월 */
		} else if (year >= 2020) {
			/* 기준일자 양력 2020년 1월 1일 (음력 2019년 12월 7일) */
			solYear = 2020;
			solMonth = 1;
			solDay = 1;
			lunYear = 2019;
			lunMonth = 12;
			lunDay = 7;
			lunLeapMonth = 0;
			solMonthDay[1] = 29; /* 2020 년 2월 28일 */
			lunMonthDay = 30; /* 2019년 12월 */
		}
		return {
			solYear: solYear,
			solMonth: solMonth,
			solDay: solDay,
			lunYear: lunYear,
			lunMonth: lunMonth,
			lunDay: lunDay,
			solMonthDay: solMonthDay,
			lunLeapMonth: lunLeapMonth,
			lunMonthDay: lunMonthDay
		};
	}
	// 양력/음력, 음력/양력 변환
	// 인수 : 년,월,일, 타입(1이면 양력을 음력으로 2이면 음력을 양력으로), 음력일 경우 윤달인지(0이면 평달, 1이면 윤달)
	function calcLunar(year, month, day, type, leapmonth) {
		var baseDate = getBaseDate(year);
		var solYear = baseDate.solYear;
		var solMonth = baseDate.solMonth;
		var solDay = baseDate.solDay;
		var lunYear = baseDate.lunYear;
		var lunMonth = baseDate.lunMonth;
		var lunDay = baseDate.lunDay;
		var solMonthDay = baseDate.solMonthDay;
		var lunLeapMonth = baseDate.lunLeapMonth;
		var lunMonthDay = baseDate.lunMonthDay;
		while (true) {
			// 기준 년월일을 하루씩 늘려서 입력된 날짜와 같으면 그값을 리턴한다.
			if (type == 1 && year == solYear && month == solMonth && day == solDay) {
				// 날짜가 양력과 일치하면 음력을 리턴
				return {
					solYear: solYear,
					solMonth: solMonth,
					solDay: solDay,
					lunYear: lunYear,
					lunMonth: lunMonth,
					lunDay: lunDay,
					leapMonth: lunLeapMonth == 1 // 윤달 인지를 리턴
				};
			}
			if (
				type == 2 &&
				year == lunYear &&
				month == lunMonth &&
				day == lunDay &&
				leapmonth == lunLeapMonth
			) {
				// 날짜가 음력과 일치하면 양력을 리턴
				return {
					solYear: solYear,
					solMonth: solMonth,
					solDay: solDay,
					lunYear: lunYear,
					lunMonth: lunMonth,
					lunDay: lunDay,
					leapMonth: lunLeapMonth == 1 // 윤달 인지를 리턴
				};
			}
			//------------------------------------------------------------------------
			// 양력날짜를 더한다.
			if (solMonth == 12 && solDay == 31) {
				// 12월에 31일이면 년도 증가 1월 1일
				solYear++;
				solMonth = 1;
				solDay = 1;
				/* 윤년이면 2월을 29일로 */
				solMonthDay[1] = isLeapYear(solYear) ? 29 : 28;
			} else if (solMonthDay[solMonth - 1] == solDay) {
				// 일이 마지막 날이면 월증가 일이 1
				solMonth++;
				solDay = 1;
			} else {
				// 아니면 날짜 증가
				solDay++;
			}
			//------------------------------------------------------------------------
			// 음력 데이터 (평달 - 작은달 :1,  큰달:2 )
			// (윤달이 있는 달 - 평달이 작고 윤달도 작으면 : 3 , 평달이 작고 윤달이 크면 : 4)
			// (윤달이 있는 달 - 평달이 크고 윤달이 작으면 : 5,  평달과 윤달이 모두 크면 : 6)
			// 음력 날짜를 더한다.

			// 년도를 계산하기 위하여 인덱스 값 변경 2011년부터 이므로 년도에서 2011를 뺀다.
			var lunIndex = lunYear - 2011;
			if (
				lunMonth == 12 &&
				((lunarMonthTable[lunIndex][lunMonth - 1] == 1 && lunDay == 29) || // 작은달 말일
					(lunarMonthTable[lunIndex][lunMonth - 1] == 2 && lunDay == 30)) // 큰달 말일
			) {
				// 12월 말일이면 년도증가 월일은 1일로
				lunYear++;
				lunMonth = 1;
				lunDay = 1;

				// 년도가 변경되었으므로 인덱스값 조정
				lunIndex = lunYear - 2011;
				// 1월의 마지막 날짜가 큰달인지 작은달인지 판단한다.
				if (lunarMonthTable[lunIndex][lunMonth - 1] == 1) {
					lunMonthDay = 29;
				} else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2) {
					lunMonthDay = 30;
				}
			} else if (lunDay == lunMonthDay) {
				// 말일이라면 월과 마지막 날짜를 다시 조정한다.
				if (lunarMonthTable[lunIndex][lunMonth - 1] >= 3 && lunLeapMonth == 0) {
					// 윤달이라면 (배열 값이 3이상)
					lunDay = 1;
					lunLeapMonth = 1; // 윤달
				} else {
					// 평달이라면
					lunMonth++;
					lunDay = 1;
					lunLeapMonth = 0; // 평달
				}
				// 월의 마지막 날짜 계산
				if (lunarMonthTable[lunIndex][lunMonth - 1] == 1) {
					// 평달이면서 작은달은 29일
					lunMonthDay = 29;
				} else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2) {
					// 평달이면서 큰달은 30일
					lunMonthDay = 30;
				} else if (lunarMonthTable[lunIndex][lunMonth - 1] == 3) {
					// 윤달이 있는 달이면 (평달이 작고 윤달도 작으면 : 3)
					lunMonthDay = 29;
				} else if (
					lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
					lunLeapMonth == 0
				) {
					// 윤달이 있는 달이면 (평달이 작고 윤달이 크면 : 4)  -- 평달이라면
					lunMonthDay = 29;
				} else if (
					lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
					lunLeapMonth == 1
				) {
					// 윤달이 있는 달이면 (평달이 작고 윤달이 크면 : 4)  -- 윤달이라면
					lunMonthDay = 30;
				} else if (
					lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
					lunLeapMonth == 0
				) {
					// 윤달이 있는 달이면 (평달이 크고 윤달이 작으면 : 5)  -- 평달이라면
					lunMonthDay = 30;
				} else if (
					lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
					lunLeapMonth == 1
				) {
					// 윤달이 있는 달이면 (평달이 크고 윤달이 작으면 : 5)  -- 윤달이라면
					lunMonthDay = 29;
				} else if (lunarMonthTable[lunIndex][lunMonth - 1] == 6) {
					// 윤달이 있는 달이면 ( 평달과 윤달이 모두 크면 : 6)
					lunMonthDay = 30;
				}
			} else {
				// 일 증가
				lunDay++;
			}
		}
	}
	/**
	* 입력한 양력 날짜로 음력 날짜 반환
	*/
	function getLunar(year, month, day) {
		var o = calcLunar(year, month, day, 1);
		o.dayOfWeekStr = getDayOfWeekStr(year, month, day);
		o.dayOfWeekNum = getDayOfWeekNum(year, month, day);
		return o;
	}

	/**
	* 입력한 음력 날짜로 양력 날짜 반환
	* isLeapMonth : 입력한 음력 날짜가 윤달인가?
	*/
	function getSolar(year, month, day, isLeapMonth) {
		var o = calcLunar(year, month, day, 2, isLeapMonth ? 1 : 0);
		o.dayOfWeekStr = getDayOfWeekStr(o.solYear, o.solMonth, o.solDay);
		o.dayOfWeekNum = getDayOfWeekNum(o.solYear, o.solMonth, o.solDay);
		return o;
	}



	//월 변경
	prev.on('click', function () {//이전달
		if (Number(reMonth) > 0) {
			reMonth -= 1;
		} else if (reMonth === 0) {//1월일때
			reMonth = 11;
			reYear -= 1;
		}
		CreateCalendar(reYear, reMonth);

	});

	next.on('click', function () {//다음달
		if (reMonth < 11) {
			reMonth += 1;
		} else if (reMonth === 11) {//12월일때
			reMonth = 0;
			reYear += 1;
		}
		CreateCalendar(reYear, reMonth);

	});

	//----------------- 함수 정의--------------------//
	CreateCalendar(getThisYear, getThisMonth);

	//-----------캘린더 생성
	function CreateCalendar(year, month) {
		let all_size = $('.calendar-body .day').length; //달력칸 갯수
		let reDay = week_arr[new Date(year, month).getDay()];//시작요일
		let index = week_arr.indexOf(reDay);//시작요일 인덱스
		let monthTotal = 0;//월토탈 값


		//년.월 출력
		this_year.text(year);//변동 연도
		this_month.text(month + 1);//변동 월

		//공휴일삭제
		$('.day').not('.sun').removeClass('holiday');
		$('.day').removeClass('dis-txt').find('.holi').remove();


		//오늘 날짜 체크
		if (reYear == Number(getThisYear) && reMonth == Number(getThisMonth)) {
			$('.calendar-body .day').eq((index - 1) + Number(getThisDate)).addClass('today');
		} else {
			$('.calendar-body .day').removeClass('today');
		}

		$('.day-body').removeClass('block').find('.data-in').remove();


		//양력

		//큰달 1/3/5/7/8/10/12
		if (month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) {
			let size = (Number(all_size) - 31) - Number(index);
			let prev_size = 7 - (7 - Number(index));


			$('.calendar-body .day').eq(index).find('.day-header').find('.date').text(1);//첫칸 채우기

			//  이전달
			for (let i = 1; i <= prev_size; i++) {
				if (month === 0 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) {
					$('.calendar-body .day').eq(index - i).addClass('dis-txt').find('.date').text(32 - i);
				}
				if (month === 2) {//3월일때
					//2월이 윤달
					if (year % 100 !== 0 && year % 4 === 0 || year % 400 === 0) {
						for (let i = 1; i <= 29; i++) {
							$('.calendar-body .day').eq(index - i).addClass('dis-txt').find('.date').text(30 - i);
						}
					}

					//2월이 평달
					else if (year % 100 === 0 || year % 400 !== 0) {
						for (let i = 1; i <= 28; i++) {
							$('.calendar-body .day').eq(index - i).addClass('dis-txt').find('.date').text(29 - i);
						}
					}
				}
			}

			//이번달
			for (let i = 1; i < 31; i++) {
				$('.calendar-body .day').eq(index + i).removeClass('dis-txt').find('.date').text(i + 1);
			}

			//다음달
			for (let i = 0; i < size; i++) {
				$('.calendar-body .day').eq((index + 31) + i).addClass('dis-txt').find('.date').text(i + 1);
			}
		}

		//작은달 4/6/9/11
		else if (month === 3 || month === 5 || month === 8 || month === 10) {
			let size = (Number(all_size) - 30) - Number(index);
			let prev_size = 7 - (7 - Number(index));


			$('.calendar-body .day').eq(index).find('.day-header').find('.date').text(1);//첫칸 채우기

			//이전달
			for (let i = 1; i <= prev_size; i++) {
				$('.calendar-body .day').eq(index - i).addClass('dis-txt').find('.date').text(31 - i);
			}

			//이번달
			for (let i = 1; i < 30; i++) {
				$('.calendar-body .day').eq(index + i).removeClass('dis-txt').find('.date').text(i + 1);
			}

			//다음달
			for (let i = 0; i < size; i++) {
				$('.calendar-body .day').eq((index + 30) + i).addClass('dis-txt').find('.date').text(i + 1);
			}
		}

		//2월
		else if (month === 1) {// 2월 일때 윤달 구하기

			$('.calendar-body .day').eq(index).find('.day-header').find('.date').text(1);//첫칸 채우기

			//윤달
			if (year % 100 !== 0 && year % 4 === 0 || year % 400 === 0) {
				let size = (Number(all_size) - 29) - Number(index);
				let prev_size = 7 - (7 - Number(index));

				// 이전달
				for (let i = 1; i <= prev_size; i++) {
					$('.calendar-body .day').eq(index - i).addClass('dis-txt').find('.date').text(32 - i);
				}

				//이번달
				for (let i = 1; i <= 29; i++) {
					$('.calendar-body .day').eq(index + i).removeClass('dis-txt').find('.date').text(i + 1);
				}

				//다음달
				for (let i = 0; i < size; i++) {
					$('.calendar-body .day').eq((index + 29) + i).addClass('dis-txt').find('.date').text(i + 1);
				}
			}

			//평달

			else if (year % 100 === 0 || year % 400 !== 0) {
				let size = (Number(all_size) - 28) - Number(index);
				let prev_size = 7 - (7 - Number(index));

				//  이전달
				for (let i = 1; i <= prev_size; i++) {
					$('.calendar-body .day').eq(index - i).addClass('dis-txt').find('.date').text(32 - i);
				}

				//이번달
				for (let i = 1; i <= 28; i++) {
					$('.calendar-body .day').eq(index + i).removeClass('dis-txt').find('.date').text(i + 1);
				}

				//다음달
				for (let i = 0; i < size; i++) {
					$('.calendar-body .day').eq((index + 28) + i).addClass('dis-txt').find('.date').text(i + 1);
				}
			}
		}

		//양력휴일
		switch (month) {
			case (0):
				$('.calendar-body .day').eq(index).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">신정</span>');
				break;
			case (2):
				if (!$('.calendar-body .day').eq(index).hasClass('holiday') && !$('.calendar-body .day').eq(index).hasClass('saturday')) {
					$('.calendar-body .day').eq(index).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">3.1절</span>');
				} else if ($('.calendar-body .day').eq(index).hasClass('holiday')) {
					$('.calendar-body .day').eq(index).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">3.1절</span>');
					$('.calendar-body .day').eq(index + 1).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
				}
				else if ($('.calendar-body .day').eq(index).hasClass('saturday')) {
					$('.calendar-body .day').eq(index).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">3.1절</span>');
					$('.calendar-body .day').eq(index + 2).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
				}
				break;
			case (4):

				if (!$('.calendar-body .day').eq(index + 4).hasClass('holiday') && !$('.calendar-body .day').eq(index + 4).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 4).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">어린이날</span>');
				} else if ($('.calendar-body .day').eq(index + 4).hasClass('holiday')) {
					$('.calendar-body .day').eq(index + 4).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">어린이날</span>');
					$('.calendar-body .day').eq(index + 5).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체공휴일</span>');
				} else if ($('.calendar-body .day').eq(index + 4).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 4).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">어린이날</span>');
					$('.calendar-body .day').eq(index + 6).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체공휴일</span>');
				}
				break;
			case (5):

				$('.calendar-body .day').eq(index + 5).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">현충일</span>');
				break;
			case (7):
				if (!$('.calendar-body .day').eq(index + 14).hasClass('holiday') && !$('.calendar-body .day').eq(index + 14).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 14).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">광복절</span>');
				}
				else if ($('.calendar-body .day').eq(index + 14).hasClass('holiday')) {
					$('.calendar-body .day').eq(index + 14).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">광복절</span>');
					$('.calendar-body .day').eq(index + 15).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
				}
				else if ($('.calendar-body .day').eq(index + 14).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 14).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">광복절</span>');
					$('.calendar-body .day').eq(index + 16).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
				}
				break;
			case (9):
				if (!$('.calendar-body .day').eq(index + 2).hasClass('holiday') && !$('.calendar-body .day').eq(index + 2).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 2).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">개천절</span>');
				}
				else if ($('.calendar-body .day').eq(index + 2).hasClass('holiday')) {
					$('.calendar-body .day').eq(index + 2).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">개천절</span>');
					$('.calendar-body .day').eq(index + 3).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span></span>');
				}
				else if ($('.calendar-body .day').eq(index + 2).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 2).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">개천절</span>');
					$('.calendar-body .day').eq(index + 4).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span></span>');
				}

				if (!$('.calendar-body .day').eq(index + 8).hasClass('holiday') && !$('.calendar-body .day').eq(index + 8).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 8).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">한글날</span>');
				}
				else if ($('.calendar-body .day').eq(index + 8).hasClass('holiday')) {
					$('.calendar-body .day').eq(index + 8).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">한글날</span>');
					$('.calendar-body .day').eq(index + 9).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
				}
				else if ($('.calendar-body .day').eq(index + 8).hasClass('saturday')) {
					$('.calendar-body .day').eq(index + 8).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">한글날</span>');
					$('.calendar-body .day').eq(index + 10).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
				}


				break;
			case (11):
				$('.calendar-body .day').eq(index + 24).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">성탄절</span>');//성탄절
				break;
		}


		//음력 휴일

		var Knewyear = getSolar(reYear, 1, 1, 0)//구정
		var chuseok = getSolar(reYear, 8, 15, 0)//추석
		var Buddha = getSolar(reYear, 4, 8, 0)//석가탄신일

		//구정
		if (month + 1 == Knewyear.solMonth) {
			let prev = (Number(Knewyear.solDay) + (index - 1)) - 1;
			let tg = (Number(Knewyear.solDay) + index) - 1;
			let next = Number(Knewyear.solDay) + index;

			$('.calendar-body .day').eq(prev).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">구정연휴</span>');

			if (!$('.calendar-body .day').eq(tg).hasClass('holiday') && !$('.calendar-body .day').eq(tg).hasClass('saturday')) {
				$('.calendar-body .day').eq(tg).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">구정</span>');
			} else if (!$('.calendar-body .day').eq(tg).hasClass('holiday') || !$('.calendar-body .day').eq(tg).hasClass('saturday')) {
				$('.calendar-body .day').eq(tg).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">구정</span>');
				$('.calendar-body .day').eq(tg + 2).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
			}
			$('.calendar-body .day').eq(next).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">구정연휴</span>');;
		}

		//추석
		if (month + 1 == chuseok.solMonth) {
			let prev = (Number(chuseok.solDay) + (index - 1)) - 1;
			let tg = (Number(chuseok.solDay) + index) - 1;
			let next = Number(chuseok.solDay) + index;
			$('.calendar-body .day').eq(prev).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">추석연휴</span>');

			if (!$('.calendar-body .day').eq(tg).hasClass('holiday') && !$('.calendar-body .day').eq(tg).hasClass('saturday')) {
				$('.calendar-body .day').eq(tg).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">추석</span>');
			} else if (!$('.calendar-body .day').eq(tg).hasClass('holiday') || !$('.calendar-body .day').eq(tg).hasClass('saturday')) {
				$('.calendar-body .day').eq(tg).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">추석</span>');
				$('.calendar-body .day').eq(tg + 2).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
			}
			$('.calendar-body .day').eq(next).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">추석연휴</span>');
		}

		//석가탄신일
		if (month + 1 == Buddha.solMonth) {
			let tg = (Number(Buddha.solDay) + index) - 1;
			$('.calendar-body .day').eq(tg).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">석가탄신일</span>');
		}

		//공휴일겹침시 대체 휴일

		$('.day-header').each(function (index, el) {
			if ($(el).find('.holi').length > 1) {
				$(this).closest('.day').next('.day').addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">대체휴일</span>');
			}
		});

		//임시휴일 -- 양력

		var holidayTable = [
			["22대 국회의원선거", 2024, 4, 10, 1],
		];

		for (let i = 0; i < holidayTable.length; i++) {
			if (holidayTable[i][1] === reYear && holidayTable[i][2] === reMonth + 1) {
				$('.calendar-body .day').eq(index + Number(holidayTable[i][3])).addClass('holiday').find('.day-header').prepend('<span class="holi mr-5" style="font-size:.8em;">' + holidayTable[i][0] + '</span>');
			}
		}



		//데이터 출력
		let dataTable = [
			[2024, 1, 10, 23000, 3,],
			[2024, 1, 13, 240000000, 1],
			[2024, 1, 31, 24000, 1],
			[2024, 2, 15, 2435000, 1],
			[2024, 2, 16, 24350, 2],
		]

		for (let i = 0; i < dataTable.length; i++) {
			if (dataTable[i][0] === reYear && dataTable[i][1] === reMonth + 1) {

				let date = dataTable[i][2];
				$('.day').each(function (index, el) {
					let txt = $(el).find('.date').text();
					if (Number(txt) == date && !$(el).hasClass('dis-txt')) {
						let txt1 = dataTable[i][3];
						let txt2 = dataTable[i][4];

						$(el).find('.day-body').addClass('block');
						$(el).find('.item1').html('<span class="data-in">' + txt1.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + '</span> 원');
						$(el).find('.item2').html('<span class="data-in">' + txt2.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + '</span> 개');
					}
				});
			}
		}

		//월 토탈
		for (let i = 0; i < $('.day').length; i++) {
			let val = $('.day').eq(i).find('.item1 .data-in').text().toString().replace(/[^\d]+/g, "");
			monthTotal += Number(val);
			$('.total-data .data-in').text(monthTotal.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
		}
	}

	//일일정산내역 - 모바일
	// $('.day-body.block').mouseenter(function () {
	// 	let tg = $(this).closest('.day').index();

	// 	if (Number(tg + 1) % 7 === 0) {
	// 		console.log('a')
	// 		$(this).css({ left: 'auto', right: 5 + 'px', transformOrigin: 'right' })
	// 	}
	// });

	//일일정산내역 모달 열기
	//pc
	$('.day-body').click(function () {
		$('#Calculate').removeClass('d-none').animate({ opacity: 1 }, 500).find('.modal').animate({ marginTop: 0 }, 300);
	});
	//모바일



	//오늘(당월) 로 돌아가기

	$('.today-btn').click(function () {
		reYear = getThisYear;
		reMonth = getThisMonth;
		CreateCalendar(reYear, reMonth);
	});



});
