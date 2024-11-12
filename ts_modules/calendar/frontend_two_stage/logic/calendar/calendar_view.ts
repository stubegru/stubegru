import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import Toggle from "../../../../../components/toggles/toggle.js";
import CalendarModule from "../calendar_module.js";
import AssignFeedbackModal from "../meetings/assign_feedback_modal.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarSearch from "./calendar_search.js";

//Manually load fullcalendar files
import { CalendarOptions, FullCalendarInstance } from "../../fullcalendar/ts_wrapper.js";
import { Meeting } from "../meetings/meeting_service.js";

export default class CalendarView {


    calendarConfig: CalendarOptions = {
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
            CalendarModule.meetingController.clickOnMeetingHandler(info.event.extendedProps.id);
        }
    };

    fullCalendar: FullCalendarInstance;
    assignFeedbackModal: AssignFeedbackModal;
    foreignToggle: Toggle;
    assignedToggle: Toggle;
    search: CalendarSearch;


    init() {
        this.search = new CalendarSearch();
        this.assignFeedbackModal = new AssignFeedbackModal();

        let calendarEl = document.querySelector("#calendar_view_container") as HTMLElement;
        //@ts-expect-error
        this.fullCalendar = new FullCalendar.Calendar(calendarEl, this.calendarConfig);
        this.fullCalendar.render();

        this.initFilterMenu();
        this.refresh();

        Stubegru.dom.addEventListener("#calendar_new_meeting_button", "click", () => CalendarModule.meetingController.createMeeting());

        //render calendar when the calendar box collapses to open
        Stubegru.dom.addEventListener('#collapse_calendar', 'shown.bs.collapse', () => { this.fullCalendar.render(); })
    }


    initFilterMenu() {
        this.foreignToggle = new Toggle("#calendar_settings_foreign_toggle");
        this.assignedToggle = new Toggle("#calendar_settings_assigned_toggle");


        this.foreignToggle.addEventListener("change", (event) => {
            const showOthers = !this.foreignToggle.getState();
            this.showOthersMeetings(showOthers);
        });
        this.assignedToggle.addEventListener("change", (event) => {
            const showAssigned = !this.assignedToggle.getState();
            this.showAssignedMeetings(showAssigned);
        });

        //Dont hide Calendar Settings dropdown when clicking on a toggle
        //@ts-expect-error
        $(document).on('click', '#calendar_settings_dropdown', function (e) { e.preventDefault(); e.stopPropagation(); });
    }



    refresh = async () => {
        this.fullCalendar.removeAllEvents();
        await CalendarModule.meetingController.refreshMeetingList();
        let meetingList = CalendarModule.meetingController.meetingList;
        this.addMeetings(meetingList);
        this.showAssignedMeetings(CalendarModule.state.assignedVisible);
        this.showOthersMeetings(CalendarModule.state.othersVisible);
    }


    addMeetings(meetingList: Meeting[]) {
        //Generate events for fullcalendar
        let ownUserId = UserUtils.currentUser.id;
        let ownEvents = { free: [], halfAssigned: [], assigned: [] };
        let othersEvents = { free: [], halfAssigned: [], assigned: [] };

        for (let inMeeting of meetingList) {
            let outMeeting = {
                title: inMeeting.owner,
                start: `${inMeeting.date}T${inMeeting.start}`,
                end: `${inMeeting.date}T${inMeeting.end}`,
                extendedProps: inMeeting
            };

            // Sort meetings by free/halfAssigned/assigned and own/others
            if (inMeeting.ownerId == ownUserId) {
                if (inMeeting.teilnehmer && inMeeting.teilnehmer != "") {
                    ownEvents.assigned.push(outMeeting) //MeetingClient is set
                } else if (inMeeting.blocked == "0") {
                    ownEvents.free.push(outMeeting); //MeetingClient is NOT set and block is NOT set
                } else {
                    ownEvents.halfAssigned.push(outMeeting); //MeetingClient is NOT set but block is set

                }
            } else {
                if (inMeeting.teilnehmer && inMeeting.teilnehmer != "") {
                    othersEvents.assigned.push(outMeeting) //MeetingClient is set
                } else if (inMeeting.blocked == "0") {
                    othersEvents.free.push(outMeeting); //MeetingClient is NOT set and block is NOT set
                } else {
                    othersEvents.halfAssigned.push(outMeeting); //MeetingClient is NOT set but block is set

                }
            }
        }

        //Generate and add Eventsource
        this.fullCalendar.addEventSource({
            id: "stubegru-own-free-events",
            events: ownEvents.free,
            color: "#5cb85c",
            classNames: ["pointer"]
        });
        this.fullCalendar.addEventSource({
            id: "stubegru-own-half-assigned-events",
            events: ownEvents.halfAssigned,
            color: "#ff9d00",
            classNames: ["pointer"]
        });
        this.fullCalendar.addEventSource({
            id: "stubegru-own-assigned-events",
            events: ownEvents.assigned,
            color: "#d9534f",
            classNames: ["pointer"]
        });
        this.fullCalendar.addEventSource({
            id: "stubegru-others-free-events",
            events: othersEvents.free,
            color: "#5cb85c",
            classNames: ["pointer"]
        });
        this.fullCalendar.addEventSource({
            id: "stubegru-others-half-assigned-events",
            events: othersEvents.halfAssigned,
            color: "#ff9d00",
            classNames: ["pointer"]
        });
        this.fullCalendar.addEventSource({
            id: "stubegru-others-assigned-events",
            events: othersEvents.assigned,
            color: "#d9534f",
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

    showOthersMeetings = (isVisible) => {
        CalendarModule.state.othersVisible = isVisible;
        this.setEventVisibility("stubegru-others-free-events", isVisible);
        if (!isVisible || CalendarModule.state.assignedVisible) {
            this.setEventVisibility("stubegru-others-assigned-events", isVisible);
            this.setEventVisibility("stubegru-others-half-assigned-events", isVisible);
        }
    }

    showAssignedMeetings = (isVisible) => {
        CalendarModule.state.assignedVisible = isVisible;
        this.setEventVisibility("stubegru-own-assigned-events", isVisible);
        this.setEventVisibility("stubegru-own-half-assigned-events", isVisible);
        if (!isVisible || CalendarModule.state.othersVisible) {
            this.setEventVisibility("stubegru-others-assigned-events", isVisible);
            this.setEventVisibility("stubegru-others-half-assigned-events", isVisible);
        }
    }


}