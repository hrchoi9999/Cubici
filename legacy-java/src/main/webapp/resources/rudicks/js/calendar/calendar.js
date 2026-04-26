'use strict';

var CalendarList = [];

function CalendarInfo() {
    this.id = null;
    this.name = null;
    this.checked = true;
    this.color = null;
    this.bgColor = null;
    this.borderColor = null;
    this.dragBgColor = null;
}

function addCalendar(calendar) {
    CalendarList.push(calendar);
}

function findCalendar(id) {
    var found;

    CalendarList.forEach(function(calendar) {
        if (calendar.id === id) {
            found = calendar;
        }
    });

    return found || CalendarList[0];
}


(function() {
    var calendar;
    var id = 0;

    calendar = new CalendarInfo();
    id += 1;
    calendar.id = String(id);
    calendar.name = '쇼핑몰';
    calendar.color = '#555';
    calendar.bgColor = '#d1ebff';
    calendar.dragBgColor = '#eff8ff';
    calendar.borderColor = '#eff8ff';
    addCalendar(calendar);

    calendar = new CalendarInfo();
    id += 1;
    calendar.id = String(id);
    calendar.name = 'Events';
    calendar.color = '#555';
    calendar.bgColor = '#eee';
    calendar.dragBgColor = '#eee';
    calendar.borderColor = '#eee';
    addCalendar(calendar);


})();

(function(window, Calendar) {

    var cal, resizeThrottled;
    var useCreationPopup = true;
    var useDetailPopup = true;
    var datePicker, selectedCalendar;
    var koWeek = ['월','화','수','목','금','토','일'];
    var MONTHLY_CUSTOM_THEME = {
        // month header 'dayname'
        'month.dayname.height': '30px',
        'month.dayname.paddingLeft': '10px',
        'month.dayname.fontSize': '14px',
        'month.dayname.fontWeight': '300',

        // month day grid cell 'day'
        'month.holidayExceptThisMonth.color': '#ddd',
        'month.dayExceptThisMonth.color': '#ddd',
        'month.weekend.backgroundColor': '#fff',
        'month.day.fontSize': '15px',
        'month.day.fontWeight': '400'
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
        useCreationPopup: useCreationPopup,
        useDetailPopup: useDetailPopup,
        calendars: CalendarList,
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

    // 캘린더 이벤트
    cal.on({
        'clickDayname': function(date) {
            if (calendar.getViewName() === 'week') {
                calendar.setDate(new Date(event.date));
                calendar.changeView('day', true);
            }
        },
        'beforeCreateSchedule': function(e) {
            saveNewSchedule(e);
        },
        'beforeUpdateSchedule': function(e) {
            var schedule = e.schedule;
            var changes = e.changes;

            console.log('beforeUpdateSchedule', e);

            cal.updateSchedule(schedule.id, schedule.calendarId, changes);
            refreshScheduleVisibility();
        },
        'beforeDeleteSchedule': function(e) {
            console.log('beforeDeleteSchedule', e);
            cal.deleteSchedule(e.schedule.id, e.schedule.calendarId);
        },
        'afterRenderSchedule': function(e) {
            var schedule = e.schedule;
        },
        'clickTimezonesCollapseBtn': function(timezonesCollapsed) {
            console.log('timezonesCollapsed', timezonesCollapsed);

            if (timezonesCollapsed) {
                cal.setTheme({
                    'week.daygridLeft.width': '77px',
                    'week.timegridLeft.width': '77px'
                });
            } else {
                cal.setTheme({
                    'week.daygridLeft.width': '60px',
                    'week.timegridLeft.width': '60px'
                });
            }

            return true;
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
        var action = getDataAction(e.target);

        switch (action) {
            case 'move-prev':
                cal.prev();
                break;
            case 'move-next':
                cal.next();
                break;
            case 'move-today':
                cal.today();
                break;
            default:
                return;
        }

        setRenderRangeText();
        setSchedules();
    }

    function onNewSchedule() {
        var title = $('#new-schedule-title').val();
        var location = $('#new-schedule-location').val();
        var isAllDay = document.getElementById('new-schedule-allday').checked;
        var start = datePicker.getStartDate();
        var end = datePicker.getEndDate();
        var calendar = selectedCalendar ? selectedCalendar : CalendarList[0];

        if (!title) {
            return;
        }

        console.log('calendar.id ', calendar.id)
        cal.createSchedules([{
            id: '1',
            calendarId: calendar.id,
            title: title,
            isAllDay: isAllDay,
            start: start,
            end: end,
            category: isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            color: calendar.color,
            bgColor: calendar.bgColor,
            dragBgColor: calendar.bgColor,
            borderColor: calendar.borderColor,
            raw: {
                location: location
            },
            state: 'Busy'
        }]);

        $('#modal-new-schedule').modal('hide');
    }

    function onChangeNewScheduleCalendar(e) {
        var target = $(e.target).closest('a[role="menuitem"]')[0];
        var calendarId = getDataAction(target);
        changeNewScheduleCalendar(calendarId);
    }

    function changeNewScheduleCalendar(calendarId) {
        var calendarNameElement = document.getElementById('calendarName');
        var calendar = findCalendar(calendarId);
        var html = [];

        html.push('<span class="calendar-bar" style="background-color: ' + calendar.bgColor + '; border-color:' + calendar.borderColor + ';"></span>');
        html.push('<span class="calendar-name">' + calendar.name + '</span>');

        calendarNameElement.innerHTML = html.join('');

        selectedCalendar = calendar;
    }

    function createNewSchedule(event) {
        var start = event.start ? new Date(event.start.getTime()) : new Date();
        var end = event.end ? new Date(event.end.getTime()) : moment().add(1, 'hours').toDate();

        if (useCreationPopup) {
            cal.openCreationPopup({
                start: start,
                end: end
            });
        }
    }
    function saveNewSchedule(scheduleData) {
        //console.log('scheduleData ', scheduleData)
        var calendar = scheduleData.calendar || findCalendar(scheduleData.calendarId);
        var schedule = {
            id: '1',
            title: scheduleData.title,
            // isAllDay: scheduleData.isAllDay,
            start: scheduleData.start,
            end: scheduleData.end,
            category: 'allday',
            // category: scheduleData.isAllDay ? 'allday' : 'time',
            // dueDateClass: '',
            color: calendar.color,
            bgColor: calendar.bgColor,
            dragBgColor: calendar.bgColor,
            borderColor: calendar.borderColor,
            location: scheduleData.location,
            // raw: {
            //     class: scheduleData.raw['class']
            // },
            // state: scheduleData.state
        };
        if (calendar) {
            schedule.calendarId = calendar.id;
            schedule.color = calendar.color;
            schedule.bgColor = calendar.bgColor;
            schedule.borderColor = calendar.borderColor;
        }

        cal.createSchedules([schedule]);

        refreshScheduleVisibility();
    }


    function refreshScheduleVisibility() {
        CalendarList.forEach(function(calendar) {
            cal.toggleSchedules(calendar.id, !calendar.checked, false);
        });

        cal.render(true);
    }

    function setTodayDateText(){
        var today = document.getElementById('todayDateText');
        today.innerHTML = moment(cal.getDate().getTime()).format('YYYY년 M월 DD일');
    }


    function setRenderRangeText() {
        var prevMonth = document.getElementById('prevMonth');
        var nextMonth = document.getElementById('nextMonth');
        var renderRange = document.getElementById('renderRange');
        var options = cal.getOptions();
        var viewName = cal.getViewName();
        var currentMonth = moment(cal.getDate().getTime()).format('M');
        var html = [];
        if (viewName === 'day') {
            html.push(moment(cal.getDate().getTime()).format('YYYY년 M월 DD일'));
        } else if (viewName === 'month' &&
            (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)) {
            html.push(moment(cal.getDate().getTime()).format('YYYY년 M월'));
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
        var schedules = [
			{
                id: '1',
                title: 'Workout for 2021-04-06<br>과연',
                isAllDay: false,
                start: '2021-03-30T11:30:00+09:00',
                end: '2021-03-30T12:00:00+09:00',
                color: '#555',
                isVisible: true,
                bgColor: '#eee',
                dragBgColor: '#eee',
                borderColor: '#eee',
                calendarId: '1',
                category: 'allday',
                location: '',
                state: 'Busy'
            },
            {
                id: '1',
                title: '2Workout for 2021-04-06<br>과연',
                isAllDay: false,
                start: '2021-03-31T11:30:00+09:00',
                end: '2021-03-31T12:00:00+09:00',
                color: '#555',
                isVisible: true,
                bgColor: '#eee',
                dragBgColor: '#eee',
                borderColor: '#eee',
                calendarId: '1',
                category: 'allday',
                location: '',
                state: 'Busy'
            },
       		{id: 3, title: 'Workout for 2021-04-06<br>과연', isAllDay: false, start: '2021-04-01T11:30:00+09:00', end: '2021-04-01T12:00:00+09:00', goingDuration: 30, comingDuration: 30, color: '#555', isVisible: true, bgColor: '#eee', dragBgColor: '#eee', borderColor: '#eee', calendarId: '1', category: 'allday', dueDateClass: '', customStyle: 'cursor: pointer;', isPending: false, isFocused: false, isReadOnly: false, isPrivate: false, location: '', attendees: '', recurrenceRule: '', state: ''},
       		{id: 4, title: 'Workout for 2021-04-06<br>과연', isAllDay: false, start: '2021-04-02T11:30:00+09:00', end: '2021-04-02T12:00:00+09:00', goingDuration: 30, comingDuration: 30, color: '#555', isVisible: true, bgColor: '#eee', dragBgColor: '#eee', borderColor: '#eee', calendarId: '1', category: 'allday', dueDateClass: '', customStyle: 'cursor: pointer;', isPending: false, isFocused: false, isReadOnly: false, isPrivate: false, location: '', attendees: '', recurrenceRule: '', state: ''}
       	];
        // generateSchedule(cal.getViewName(), cal.getDateRangeStart(), cal.getDateRangeEnd());
        cal.createSchedules(schedules);
        // cal.createSchedules(schedules);
        refreshScheduleVisibility();
    }

    function setEventListener() {
        $('.moveDay').on('click', onClickNavi);

        $('#btn-save-schedule').on('click', onNewSchedule);
        $('#btn-new-schedule').on('click', createNewSchedule);

        $('#dropdownMenu-calendars-list').on('click', onChangeNewScheduleCalendar);

        window.addEventListener('resize', resizeThrottled);
    }

    function getDataAction(target) {
        return target.dataset ? target.dataset.action : target.getAttribute('data-action');
    }

    resizeThrottled = tui.util.throttle(function() {
        cal.render();
    }, 50);

    window.cal = cal;

    // setDropdownCalendarType();
    setRenderRangeText();
    setSchedules();
    setEventListener();
    setTodayDateText();
})(window, tui.Calendar);

// set calendars category
(function() {
    var calendarList = document.getElementById('calendarList');
    var html = [];
    CalendarList.forEach(function(calendar) {
        html.push('<option value="'+calendar.id+'">' + calendar.name + '</option>');
    });
    calendarList.innerHTML = html.join('\n');
})();

