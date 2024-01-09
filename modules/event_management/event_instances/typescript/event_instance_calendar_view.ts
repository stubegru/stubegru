declare class FullCalendarInstance {
    constructor(el: HTMLElement, optionOverrides?: Object);
    render(): void;
    destroy(): void;
    removeAllEvents(): void;
    addEventSource(eventSource: FullCalendarEventSource): void;
}

interface FullCalendarEventSource {
    id: string;
    events: FullCalendarEvent[];
    color: string;
    classNames: string[];
}

interface FullCalendarEvent {
    title: string;
    start: string;
    end: string;
    extendedProps: Object;
}



class EventInstanceCalendarView {

    static fullCalendar: FullCalendarInstance;

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
            //CalendarController.clickOnMeetingHandler(info.event.extendedProps.id);
        }
    }

    static init() {
        //Init Calendar view
        let calendarEl = document.querySelector("#eventInstanceCalendarView");
        //@ts-expect-error
        EventInstanceCalendarView.fullCalendar = new FullCalendar.Calendar(calendarEl, EventInstanceCalendarView.config);
        EventInstanceCalendarView.fullCalendar.render();

        //Refresh calendar after switching the tab
        //let calendarBox = document.querySelector("TODO SELCETOR") as HTMLElement;
        //calendarBox.addEventListener('shown.bs.collapse', EventInstanceCalendarView.fullCalendar.render)
    }


    static removeAllEvents() {
        EventInstanceCalendarView.fullCalendar.removeAllEvents();
    }

    static addMeetings(meetingList) {
        let eventList : FullCalendarEvent[] = [];

        for (let inMeeting of meetingList) {
            let outMeeting = {
                title: inMeeting.owner,
                start: `${inMeeting.date}T${inMeeting.start}`,
                end: `${inMeeting.date}T${inMeeting.end}`,
                extendedProps: inMeeting
            };
            eventList.push(outMeeting);
        }

        //Generate and add Eventsource
        EventInstanceCalendarView.fullCalendar.addEventSource({
            id: "stubegru-own-free-events",
            events: eventList,
            color: "#5cb85c",
            classNames: ["pointer"]
        });
    }
}