class EventInstanceCalendarView {
    static init() {
        let calendarEl = document.querySelector("#eventInstanceCalendarView");
        //@ts-expect-error
        EventInstanceCalendarView.fullCalendar = new FullCalendar.Calendar(calendarEl, EventInstanceCalendarView.config);
        //@ts-expect-error --- Re-render calendar after switching the tab
        $("#eventInstanceCalendarViewButton").on('shown.bs.tab', () => EventInstanceCalendarView.fullCalendar.render());
    }
    static setEvents(eventInstanceList) {
        EventInstanceCalendarView.removeAllEvents();
        EventInstanceCalendarView.addEvents(eventInstanceList);
    }
    static removeAllEvents() {
        EventInstanceCalendarView.fullCalendar.removeAllEvents();
    }
    static addEvents(eventInstanceList) {
        let fcEventList = [];
        //convert EventInstances to fullcalendar events
        for (let index in eventInstanceList) {
            let inMeeting = eventInstanceList[index];
            let outMeeting = {
                title: inMeeting.name,
                start: `${inMeeting.startDate}T${inMeeting.startTime}`,
                end: `${inMeeting.endDate}T${inMeeting.endTime}`,
                extendedProps: inMeeting
            };
            fcEventList.push(outMeeting);
        }
        //Generate and add Eventsource
        EventInstanceCalendarView.fullCalendar.addEventSource({
            id: "event-instances",
            events: fcEventList,
            color: "#5cb85c",
            classNames: ["pointer"]
        });
    }
}
EventInstanceCalendarView.config = {
    locale: 'de',
    initialView: 'dayGridMonth',
    businessHours: {
        // days of week. an array of zero-based day of week integers (0=Sunday)
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '16:00'
    },
    weekends: true,
    firstDay: 1,
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
        EventInstanceView.showModalForUpdate(info.event.extendedProps.id);
    }
};
