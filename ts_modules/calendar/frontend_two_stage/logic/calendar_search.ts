class CalendarSearch {

    searchTimeout;

    constructor() {
        $("#calendarSearchClearButton").on("click", () => {
            this.setQuery("");
        })

        $("#calendarSearchInput").on("keyup change", this.triggerSearch);
    }

    triggerSearch = () => {
        if (this.searchTimeout) { clearTimeout(this.searchTimeout) }
        this.searchTimeout = setTimeout(this.doSearch, 500);
    }

    doSearch = async () => {
        $("#calendarSearchInfo").html(""); //Clear alert

        let query = this.getQuery();
        if (!query || query.length < 1) {
            this.setResultVisible(false);
            return;
        }

        query = encodeURI(query);
        const url = `${stubegru.constants.BASE_URL}/modules/calendar/backend/assignment/search_for_client.php?query=${query}`;
        let resp = await fetch(url);
        resp = await resp.json();
        this.handleResult(resp);
    }

    handleResult = (meetingList) => {
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
                        <td>${formatDate(meeting.date,"DD.MM.YYYY")}</td>
                        <td>${meeting.start.substr(0,5)}</td>
                    </tr>`;
        }
        $("#calendarSearchResultTable").html(html);
        $(".calendar-search-result-button").on("click", function () {
            let meetingId = $(this).attr("data-meeting-id");
            CalendarController.openAssignedMeeting(meetingId);
        });
        this.setResultVisible(true);
    }

    showEmptyResultMessage = () => {
        let html = `<div class="alert alert-info">
                        Es wurden leider keine passenden Ergebnisse zur Suchanfrage "${this.getQuery()}" gefunden<br>
                        Zum Suchen bitte den Namen eines Kunde eingeben...
                    </div>`;
        $("#calendarSearchInfo").html(html);
    }

    setQuery(query) {
        $("#calendarSearchInput").val(query);
    }

    getQuery() {
        return $("#calendarSearchInput").val();
    }

    setResultVisible(isVisible) {
        isVisible ?
            $("#searchResultContainer").slideDown() :
            $("#searchResultContainer").slideUp();
    }









}