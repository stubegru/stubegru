import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import MeetingView from "../meetings/meeting_view.js";
import MultiselectDropdown from "../../../../../components/multi_select_dropdown/multiselect-dropdown.js";
class CalendarFilterView {
    calendarView;
    static channelDescriptions = {
        "personally": "Persönlich vor Ort",
        "phone": "Telefon",
        "webmeeting": "Webmeeting",
    };
    async init(parent) {
        this.calendarView = parent;
        //Add EventListener for Title-Properties select
        Stubegru.dom.addEventListener("#calendar_view_title_properties", "change", this.calendarView.renderMeetings);
        await this.initFilterDropdowns();
        //Add eventListener for filter inputs
        document.querySelectorAll(".calendar-filter-input").forEach((elem) => {
            Stubegru.dom.addEventListener(elem, "change", this.calendarView.renderMeetings);
        });
        //Init multiple selects
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Alle anzeigen", selector: ".calendar-multiple-select" });
    }
    async initFilterDropdowns() {
        const channelFilterElem = Stubegru.dom.querySelector(`.calendar-filter-input[name='channel']`);
        for (let propName in CalendarFilterView.channelDescriptions) {
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
            //Special case: Special meeting channel attributes ("all","digital")
            if (inputName == "channel") {
                if (selectedValues.length > 0) {
                    selectedValues.push("all");
                }
                if (selectedValues.includes("phone") || selectedValues.includes("webmeeting")) {
                    selectedValues.push("digital");
                }
            }
            if (selectedValues.length > 0) { //only add rule, if there's any value selected
                //add it's values to filter rule
                const rule = { key: inputName, allowedValues: selectedValues };
                filter.rules.push(rule);
            }
        });
        return filter;
    }
}
export default CalendarFilterView;
