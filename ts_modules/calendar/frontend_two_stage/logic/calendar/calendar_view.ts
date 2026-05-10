import { CalendarOptions, FullCalendarInstance } from "../../../../../components/fullcalendar/ts_wrapper.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import AssignFeedbackModal from "../meetings/assign_feedback_modal.js";
import { Meeting } from "../meetings/meeting_service.js";
import CalendarFilterView from "./calendar_filter_view.js";
import CalendarSearch from "./calendar_search.js";

export default class CalendarView {

    calendarConfig: CalendarOptions = {
        height: "600px",
        locale: 'de',
        initialView: 'dayGridMonth',
        businessHours: {
            // days of week. an array of zero-based day of week integers (0=Sunday)
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: '08:00',
            endTime: '16:00'
        },
        weekends: false,
        headerToolbar: {
            start: 'dayGridMonth timeGridWeek listMonth',
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
            CalendarModule.meetingController.clickOnMeetingHandler(info.event.extendedProps.id);
        }
    };

    fullCalendar: FullCalendarInstance;
    assignFeedbackModal: AssignFeedbackModal;
    search: CalendarSearch;
    filterView: CalendarFilterView;


    async init() {
        this.search = new CalendarSearch();
        this.assignFeedbackModal = new AssignFeedbackModal();
        this.filterView = new CalendarFilterView();

        let calendarEl = document.querySelector("#calendar_view_container") as HTMLElement;
        //@ts-expect-error
        this.fullCalendar = new FullCalendar.Calendar(calendarEl, this.calendarConfig);
        this.fullCalendar.render();

        await CalendarModule.meetingController.refreshMeetingList();
        await this.filterView.init(this, CalendarModule.meetingController.meetingList);
        this.refreshView();

        Stubegru.dom.addEventListener("#calendar_new_meeting_button", "click", () => CalendarModule.meetingController.createMeeting());

        //render calendar when the calendar box collapses to open
        Stubegru.dom.addEventListener('#collapse_calendar', 'shown.bs.collapse', () => { this.fullCalendar.render(); })
    }

    refreshMeetingList = async () => {
        await CalendarModule.meetingController.refreshMeetingList();
        this.refreshView();
    }

    refreshView = () => {
        //Remove old meetings
        this.fullCalendar.removeAllEvents();
        //Add new meetings
        let meetingList = CalendarModule.meetingController.meetingList;
        this.renderMeetings(meetingList);
    }


    renderMeetings(meetingList: Meeting[]) {
        //Generate events for fullcalendar
        let FCevents = [];
        let filter = this.filterView.generateFilterRules();

        for (let inMeeting of meetingList) {
            // TODO: is this a good place to add isAssigned property?
            inMeeting.isAssigned = inMeeting.teilnehmer && inMeeting.teilnehmer != "";
            inMeeting.filterAssignState = inMeeting.isAssigned ? "assigned" : "free";

            if (this.filterView.passedFilter(inMeeting, filter)) {

                let meetingColor = inMeeting.isAssigned ? "#d9534f" : inMeeting.isBlocked ? "#ff9d00" : "#5cb85c";

                let outMeeting = {
                    title: inMeeting.owner,
                    start: `${inMeeting.date}T${inMeeting.start}`,
                    end: `${inMeeting.date}T${inMeeting.end}`,
                    extendedProps: inMeeting,
                    color: meetingColor
                };
                FCevents.push(outMeeting);
            }
        }

        //Generate and add Eventsource
        this.fullCalendar.addEventSource({
            id: "stubegru-events",
            events: FCevents,
            classNames: ["pointer"]
        });
    }

}


