import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import Toggle from "../../../../../components/toggles/toggle.js";
import CalendarModule from "../calendar_module.js";
import AssignFeedbackModal from "../meetings/assign_feedback_modal.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarSearch from "./calendar_search.js";
export default class CalendarView {
    calendarConfig = {
        locale: 'de',
        initialView: 'dayGridMonth',
        businessHours: {
            // days of week. an array of zero-based day of week integers (0=Sunday)
            daysOfWeek: [1, 2, 3, 4, 5],
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
    fullCalendar;
    assignFeedbackModal;
    foreignToggle;
    assignedToggle;
    search;
    init() {
        this.search = new CalendarSearch();
        this.assignFeedbackModal = new AssignFeedbackModal();
        let calendarEl = document.querySelector("#calendarViewContainer");
        //@ts-expect-error
        this.fullCalendar = new FullCalendar.Calendar(calendarEl, this.calendarConfig);
        this.fullCalendar.render();
        this.initFilterMenu();
        this.refresh();
        Stubegru.dom.querySelector("#calendarNewMeetingButton").addEventListener("click", () => CalendarModule.meetingController.createMeeting());
        //render calendar when the calendar box collapses to open
        Stubegru.dom.querySelector('#collapseCalendar').addEventListener('shown.bs.collapse', () => { this.fullCalendar.render(); }); //TODO: Check if this bs specific event is handled without jquery
    }
    initFilterMenu() {
        this.foreignToggle = new Toggle("#calendarSettingsForeignToggle");
        this.assignedToggle = new Toggle("#calendarSettingsAssignedToggle");
        this.foreignToggle.addEventListener("change", (event) => {
            const showOthers = !this.foreignToggle.getState();
            this.showOthersMeetings(showOthers);
        });
        this.assignedToggle.addEventListener("change", (event) => {
            const showAssigned = !this.assignedToggle.getState();
            this.showAssignedMeetings(showAssigned);
        });
        //TODO: Is this neccessary?
        // $(document).on('click', '#calendarSettingsDropdown', function (e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        // });
    }
    refresh = async () => {
        this.fullCalendar.removeAllEvents();
        await CalendarModule.meetingController.refreshMeetingList();
        let meetingList = CalendarModule.meetingController.meetingList;
        this.addMeetings(meetingList);
        this.showAssignedMeetings(CalendarModule.state.assignedVisible);
        this.showOthersMeetings(CalendarModule.state.othersVisible);
    };
    addMeetings(meetingList) {
        //Generate events for fullcalendar
        let ownUserId = UserUtils.currentUser.id;
        let ownEvents = { free: [], assigned: [] };
        let othersEvents = { free: [], assigned: [] };
        for (let inMeeting of meetingList) {
            let outMeeting = {
                title: inMeeting.owner,
                start: `${inMeeting.date}T${inMeeting.start}`,
                end: `${inMeeting.date}T${inMeeting.end}`,
                extendedProps: inMeeting
            };
            //Sort meetings by free/assigned and own/others
            if (inMeeting.ownerId == ownUserId) {
                (inMeeting.teilnehmer && inMeeting.teilnehmer != "") ?
                    ownEvents.assigned.push(outMeeting) :
                    ownEvents.free.push(outMeeting);
            }
            else {
                (inMeeting.teilnehmer && inMeeting.teilnehmer != "") ?
                    othersEvents.assigned.push(outMeeting) :
                    othersEvents.free.push(outMeeting);
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
        }
    };
    showAssignedMeetings = (isVisible) => {
        CalendarModule.state.assignedVisible = isVisible;
        this.setEventVisibility("stubegru-own-assigned-events", isVisible);
        if (!isVisible || CalendarModule.state.othersVisible) {
            this.setEventVisibility("stubegru-others-assigned-events", isVisible);
        }
    };
}
