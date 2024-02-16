async function fetchEventInstances(filter) {
    let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/event_management/portfolio/get_portfolio_event_instances.php?filter=${filter}`);
    let eventInstanceList = await resp.json();
    return eventInstanceList;
}

async function renderEventInstances(eventInstanceList) {
    let html = ``;

    for (const eventId in eventInstanceList) {
        let e = new EventInstance();
        e = eventInstanceList[eventId];

        html += `
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">${e.name}</h3>
              </div>
              <div class="panel-body">
                Kategorie: ${e.category}<br>
                Datum: ${e.startDate} bis ${e.endDate}<br>
                Uhrzeit: ${e.startTime} bis ${e.endTime}<br>
                Ort: ${e.location}<br>
                <br>
                ${e.announcementPR}
              </div>
            </div>
            `;
    }

    document.getElementById("portfolioContainer").innerHTML = html;
}

async function initPortfolio() {
    let filter = getParam("filter") || "";
    let eventInstanceList = await fetchEventInstances(filter);
    await renderEventInstances(eventInstanceList)
}

initPortfolio();

class EventInstance {
    id
    name
    category
    isCancelled
    assigneesInternal
    startDate
    startTime
    endDate
    endTime
    location
    cooperation
    maxParticipants
    notes
    reminderInternal
    participantsCount
    expenseZSB
    expenseSHK
    monitoringNotes
    assigneesPR
    distributerPR
    reminderPR
    announcementPR
}
