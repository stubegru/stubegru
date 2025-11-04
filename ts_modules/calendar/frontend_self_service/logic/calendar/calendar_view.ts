import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import AssignFeedbackModal from "../meetings/assign_feedback_modal.js";
import { CalendarOptions, FullCalendarInstance } from "../../../../../components/fullcalendar/ts_wrapper.js";
import { Meeting } from "../meetings/meeting_service.js";
import MeetingView from "../meetings/meeting_view.js";
import CalendarFilterView, { TitleProperties } from "./calendar_filter_view.js";

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
            month: 'Monatsansicht',
            week: 'Wochenansicht',
            day: 'Tag',
            list: 'Listenansicht'
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
    filterView: CalendarFilterView;


    async init() {
        this.assignFeedbackModal = new AssignFeedbackModal();
        this.filterView = new CalendarFilterView();
        await this.filterView.init(this);

        let calendarEl = document.querySelector("#calendar_view_container") as HTMLElement;
        //@ts-expect-error
        this.fullCalendar = new FullCalendar.Calendar(calendarEl, this.calendarConfig);
        this.fullCalendar.render();

        this.refresh();
    }








    refresh = async () => {
        await CalendarModule.meetingController.refreshMeetingList();
        this.renderMeetings();
    }

    renderMeetings = () => {
        //Remove old meetings
        this.fullCalendar.removeAllEvents();

        let titleProperties: TitleProperties = { channel: false, owner: false, title: false };
        let elem = Stubegru.dom.querySelector("#calendar_view_title_properties");
        const selectedOptions = elem.querySelectorAll('option:checked');
        Array.from(selectedOptions).forEach((elem: HTMLOptionElement) => titleProperties[elem.value] = true);

        //Add new meetings
        let meetingList = CalendarModule.meetingController.meetingList;
        this.addMeetings(meetingList, titleProperties);
    }


    addMeetings(meetingList: Meeting[], titleProperties: TitleProperties) {
        //Generate events for fullcalendar
        let FCevents = [];
        let filter = this.filterView.generateFilterRules();

        for (let inMeeting of meetingList) {
            if (this.filterView.passedFilter(inMeeting, filter)) {
                let titlePropertyList = [];
                if (titleProperties.title) { titlePropertyList.push(inMeeting.title) }
                if (titleProperties.owner) { titlePropertyList.push(inMeeting.owner) }
                if (titleProperties.channel) { titlePropertyList.push(MeetingView.channelDescriptions[inMeeting.channel]) }

                let outMeeting = {
                    title: titlePropertyList.join(" | "),
                    start: `${inMeeting.date}T${inMeeting.start}`,
                    end: `${inMeeting.date}T${inMeeting.end}`,
                    extendedProps: inMeeting
                };
                FCevents.push(outMeeting);
            }
        }

        //Generate and add Eventsource
        this.fullCalendar.addEventSource({
            id: "free-events",
            events: FCevents,
            color: "#5cb85c",
            classNames: ["pointer"]
        });

    }

    setEventVisibility(eventSourceId, visible) {
        let allEvents = this.fullCalendar.getEvents();
        for (let ev of allEvents) {
            if (ev.source.id == eventSourceId) {
                ev.setProp("display", visible ? "auto" : "none");
            }
        }
    }



}


