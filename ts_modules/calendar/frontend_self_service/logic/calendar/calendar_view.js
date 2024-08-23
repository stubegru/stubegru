import MultiselectDropdown from "../../../../../components/multi_select_dropdown/multiselect-dropdown.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import AssignFeedbackModal from "../meetings/assign_feedback_modal.js";
import MeetingView from "../meetings/meeting_view.js";
export default class CalendarView {
    calendarConfig = {
        height: "600px",
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
    fullCalendar;
    assignFeedbackModal;
    async init() {
        this.assignFeedbackModal = new AssignFeedbackModal();
        let calendarEl = document.querySelector("#calendar_view_container");
        //@ts-expect-error
        this.fullCalendar = new FullCalendar.Calendar(calendarEl, this.calendarConfig);
        this.fullCalendar.render();
        this.refresh();
        //render calendar when the calendar box collapses to open
        Stubegru.dom.addEventListener('#collapse_calendar', 'shown.bs.collapse', () => { this.fullCalendar.render(); });
        //Add EventListener for Title-Properties select
        Stubegru.dom.addEventListener("#calendar_view_title_properties", "change", this.renderMeetings);
        //Insert select options from config file
        await this.initFilterDropdowns();
        //Add eventListener for filter inputs
        document.querySelectorAll(".calendar-filter-input").forEach((elem) => {
            Stubegru.dom.addEventListener(elem, "change", this.renderMeetings);
        });
        //Init multiple selects
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Alle anzeigen", selector: ".calendar-multiple-select" });
    }
    async initFilterDropdowns() {
        const channelFilterElem = Stubegru.dom.querySelector(`.calendar-filter-input[name='channel']`);
        for (let propName in MeetingView.channelDescriptions) {
            channelFilterElem.add(new Option(MeetingView.channelDescriptions[propName], propName));
        }
        ;
        const ownerFilterElem = Stubegru.dom.querySelector(`.calendar-filter-input[name='ownerId']`);
        let advisorList = await CalendarModule.meetingService.getAdvisorList();
        for (let user of advisorList) {
            ownerFilterElem.add(new Option(user.name, user.id));
        }
        ;
    }
    passedFilter(meeting, filter) {
        //Rules are interpreted as conjunction (ALL rules must be fulfilled to pass the filter)
        for (const rule of filter.rules) {
            const filterKey = rule.key;
            const meetingValue = String(meeting[filterKey]);
            //If this property is not set for this eventType -> rule not fulfilled -> filter not passed -> return false
            if (!meetingValue) {
                return false;
            }
            //Check if there's at least one element that is contained in rule's and in eventType's array
            if (!rule.allowedValues.includes(meetingValue)) {
                return false;
            }
        }
        //If this statement is reached -> all rules were fulfilled -> filter is passed -> return true
        return true;
    }
    generateFilterRules() {
        let filter = { rules: [] };
        //Select all inputs with filter values
        document.querySelectorAll(".calendar-filter-input").forEach((elem) => {
            //read multi-select values
            const inputName = elem.name;
            const selectedOptions = elem.querySelectorAll('option:checked');
            //Creates an array with all SELECTED values as items. If nothing is selected (no filter set) it creates an empty array
            const selectedValues = Array.from(selectedOptions).map((el) => el.value);
            if (selectedValues.length > 0) { //only add rule, if there's any value selected
                //add it's values to filter rule
                const rule = { key: inputName, allowedValues: selectedValues };
                filter.rules.push(rule);
            }
        });
        return filter;
    }
    refresh = async () => {
        await CalendarModule.meetingController.refreshMeetingList();
        this.renderMeetings();
    };
    renderMeetings = () => {
        //Remove old meetings
        this.fullCalendar.removeAllEvents();
        let titleProperties = { channel: false, owner: false, title: false };
        let elem = Stubegru.dom.querySelector("#calendar_view_title_properties");
        const selectedOptions = elem.querySelectorAll('option:checked');
        Array.from(selectedOptions).forEach((elem) => titleProperties[elem.value] = true);
        //Add new meetings
        let meetingList = CalendarModule.meetingController.meetingList;
        this.addMeetings(meetingList, titleProperties);
    };
    addMeetings(meetingList, titleProperties) {
        //Generate events for fullcalendar
        let FCevents = [];
        let filter = this.generateFilterRules();
        for (let inMeeting of meetingList) {
            if (this.passedFilter(inMeeting, filter)) {
                let titlePropertyList = [];
                if (titleProperties.title) {
                    titlePropertyList.push(inMeeting.title);
                }
                if (titleProperties.owner) {
                    titlePropertyList.push(inMeeting.owner);
                }
                if (titleProperties.channel) {
                    titlePropertyList.push(MeetingView.channelDescriptions[inMeeting.channel]);
                }
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
