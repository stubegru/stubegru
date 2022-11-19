class CalendarView {


    static config = {
        initialView: 'dayGridMonth',
        businessHours: {
            // days of week. an array of zero-based day of week integers (0=Sunday)
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: '08:00',
            endTime: '16:00'
        },
        weekends: false,
        headerToolbar: {
            start: 'dayGridMonth timeGridWeek',
            center: 'title',
            end: 'prev,next'
        },
        buttonText: {
            today: 'Heute',
            month: 'Monat',
            week: 'Woche',
            day: 'Tag',
            list: 'Liste'
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false //use 24 hour syntax (17:00 instead of 5:00 pm)
        },
        eventClick: function (info) {
            info.jsEvent.preventDefault(); // don't let the browser navigate
            CalendarController.clickOnMeetingHandler(info.event.extendedProps);
        }
    }


    constructor(elemSelector) {
        let calendarEl = document.querySelector(elemSelector);
        this.fullCalendar = new FullCalendar.Calendar(calendarEl, CalendarView.config);
        this.fullCalendar.render();
        this.refresh();

        //render calendar when the calendar box collapses to open
        $('#collapseCalendar').on('shown.bs.collapse', () => { this.fullCalendar.render(); })
    }

    refresh = async () => {
        this.fullCalendar.removeAllEvents();
        await Meeting.fetchMeetings();
        let meetingList = Meeting.meetingList;
        this.addMeetings(meetingList);
    }


    addMeetings(meetingList) {
        //Generate events for fullcalendar
        let ownUserId = stubegru.currentUser.id;
        let ownEvents = [];
        let othersEvents = [];

        for (let inMeeting of meetingList) {
            let outMeeting = {
                title: inMeeting.title,
                start: `${inMeeting.date}T${inMeeting.start}`,
                end: `${inMeeting.date}T${inMeeting.end}`,
                extendedProps: inMeeting
            };

            if (inMeeting.ownerId == ownUserId) { ownEvents.push(outMeeting); } else { othersEvents.push(outMeeting); }
        }

        //Generate and add Eventsource
        this.fullCalendar.addEventSource({
            id: "stubegru-own-events",
            events: ownEvents,
            color: "#2196f3",
            classNames: ["pointer"]
        });

        this.fullCalendar.addEventSource({
            id: "stubegru-others-events",
            events: othersEvents,
            color: "#999ca1",
            classNames: ["pointer"]
        });
    }


}