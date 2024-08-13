import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import { Meeting } from "../meetings/meeting_service.js";

export default class CalendarSearch {

    searchTimeout;

    constructor() {
        Stubegru.dom.querySelector("#calendarSearchClearButton").addEventListener("click", () => {
            this.setQuery("");
        })

        Stubegru.dom.querySelector("#calendarSearchInput").addEventListener("keyup change", this.triggerSearch);
    }

    triggerSearch() {
        if (this.searchTimeout) { clearTimeout(this.searchTimeout) }
        this.searchTimeout = setTimeout(this.doSearch, 500);
    }

    async doSearch() {
        Stubegru.dom.querySelector("#calendarSearchInfo").innerHTML = ""; //Clear alert

        let query = this.getQuery();
        if (!query || query.length < 1) {
            this.setResultVisible(false);
            return;
        }

        query = encodeURI(query);
        let resp = await Stubegru.fetch.getJson("ts_modules/calendar/backend/assignment/search_for_client.php", { query: query }) as CalendarClientSearchResult[];
        this.handleResult(resp);
    }

    handleResult(meetingList: CalendarClientSearchResult[]) {
        if (meetingList.length < 1) {
            this.showEmptyResultMessage();
            return;
        }

        let html = "";
        for (const meeting of meetingList) {
            html += `<tr class="calendar-search-result-button" data-meeting-id="${meeting.id}">
                        <td>${meeting.title}</td>
                        <td>${meeting.name}</td>
                        <td>${meeting.owner}</td>
                        <td>${Stubegru.utils.formatDate(meeting.date, "DD.MM.YYYY")}</td>
                        <td>${meeting.start.substring(0, 5)}</td>
                    </tr>`;
        }
        Stubegru.dom.querySelector("#calendarSearchResultTable").innerHTML = html;
        Stubegru.dom.querySelectorAll(".calendar-search-result-button").forEach(elem => elem.addEventListener("click", function () {
            let meetingId = elem.getAttribute("data-meeting-id");
            CalendarModule.meetingClientController.openAssignedMeeting(meetingId);
        }));
        this.setResultVisible(true);
    }

    showEmptyResultMessage = () => {
        let html = `<div class="alert alert-info">
                        Es wurden leider keine passenden Ergebnisse zur Suchanfrage "${this.getQuery()}" gefunden<br>
                        Zum Suchen bitte den Namen eines Kunde eingeben...
                    </div>`;
        Stubegru.dom.querySelector("#calendarSearchInfo").innerHTML = html;
    }

    setQuery(query: string) {
        Stubegru.dom.querySelectorAsInput("#calendarSearchInput").value = query;
    }

    getQuery() {
        return Stubegru.dom.querySelectorAsInput("#calendarSearchInput").value;
    }

    setResultVisible(isVisible) {
        Stubegru.dom.slideToState("#searchResultContainer", isVisible);
    }



}

interface CalendarClientSearchResult extends Meeting {
    name: string; //The client's name
}