import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import Toggle from "../../../../../components/toggles/toggle.js";
import AssignFeedbackModal from "./assign_feedback_modal.js";
import MeetingController from "../meetings/meeting_controller.js";
import CalendarModal from "./calendar_modal.js";

export default class CalendarView {


    static config = {
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
            MeetingController.clickOnMeetingHandler(info.event.extendedProps.id);
        }
    }
    assignedVisible: boolean;
    othersVisible: boolean;
    fullCalendar: any;
    assignFeedbackModal: AssignFeedbackModal;
     foreignToggle: Toggle;
     assignedToggle: Toggle;


    init(elemSelector) {
        modal = new CalendarModal();
        search = new CalendarSearch();

        
        
        await this.modal.init();
        this.initFilterMenu();


        this.assignedVisible = true;
        this.othersVisible = true;
        let calendarEl = document.querySelector(elemSelector);
        this.fullCalendar = new FullCalendar.Calendar(calendarEl, CalendarView.config);
        this.fullCalendar.render();
        this.assignFeedbackModal = new AssignFeedbackModal();
        this.refresh();

        Stubegru.dom.querySelector("#calendarNewMeetingButton").addEventListener("click", () => this.createMeeting());
        
        //render calendar when the calendar box collapses to open
        $('#collapseCalendar').on('shown.bs.collapse', () => { this.fullCalendar.render(); })
    }

    
     initFilterMenu() {
         this.foreignToggle = new Toggle("#calendarSettingsForeignToggle");
         this.assignedToggle = new Toggle("#calendarSettingsAssignedToggle");
 
 
         this.foreignToggle.addEventListener("change", (event) => {
             const showOthers = !this.foreignToggle.getState();
             this.view.showOthersMeetings(showOthers);
         });
         this.assignedToggle.addEventListener("change", (event) => {
             const showAssigned = !this.assignedToggle.getState();
             this.view.showAssignedMeetings(showAssigned);
         });
 
         //TODO: Is this neccessary?
         // $(document).on('click', '#calendarSettingsDropdown', function (e) {
         //     e.preventDefault();
         //     e.stopPropagation();
         // });
     }
 
 

    refresh = async () => {
        this.fullCalendar.removeAllEvents();
        await Meeting.fetchMeetings();
        let meetingList = Meeting.meetingList;
        this.addMeetings(meetingList);
        this.showAssignedMeetings(this.assignedVisible);
        this.showOthersMeetings(this.othersVisible);
    }


    addMeetings(meetingList) {
        //Generate events for fullcalendar
        let ownUserId = Stubegru.currentUser.id;
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
            } else {
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
        this.othersVisible = isVisible;
        this.setEventVisibility("stubegru-others-free-events", isVisible);
        if (!isVisible || this.assignedVisible) {
            this.setEventVisibility("stubegru-others-assigned-events", isVisible);
        }
    }

    showAssignedMeetings = (isVisible) => {
        this.assignedVisible = isVisible;
        this.setEventVisibility("stubegru-own-assigned-events", isVisible);
        if (!isVisible || this.othersVisible) {
            this.setEventVisibility("stubegru-others-assigned-events", isVisible);
        }
    }


}