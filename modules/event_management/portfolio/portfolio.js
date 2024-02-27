async function fetchEventTypes(filter) {
    let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/event_management/portfolio/get_portfolio_event_types.php?filter=${filter}`);
    let eventTypeList = await resp.json();
    return eventTypeList;
}

async function renderEventTypes(eventTypeList, mode) {
    let html = ``;

    for (const eventId in eventTypeList) {
        let e = new EventType();
        e = eventTypeList[eventId];


        if (mode == "internal") {

            /***********************
             * INTERNAL RENDERING
             **********************/

            let assigneeHtml = `<div class="row">`;
            if (e.assigneesInternal) {
                for (const assignee of e.assigneesInternal) {
                    assigneeHtml += `
                <div class="col-md-4">
                    <div class="alert alert-success">
                        <b>Name:</b> ${assignee.name}
                        <br>
                        <b>Mail:</b> <a href="mailto:${assignee.mail}">${assignee.mail}</a>
                    </div>
                </div>`
                }
            }
            assigneeHtml += "</div>"

            html += `
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">${e.name}</h3>
                </div>

                <div class="panel-body">
                    <b>Beschreibung:</b>
                    <div class="well">${e.descriptionInternal}</div>
                    <br>
                    <b>Zielgruppe:</b> ${e.targetGroups}
                    <br>
                    <b>Verantwortlich:</b> ${assigneeHtml}
                </div>
            </div>
            `;
        }


        else if (mode == "external") {

            /***********************
             * EXTERNAL RENDERING
             **********************/

            html += `
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title">${e.name}</h3>
                    </div>
    
                    <div class="panel-body">
                        <b>Beschreibung:</b>
                        <div class="well">${e.descriptionExternal}</div>
                        <br>
                        <b>Zielgruppe:</b> ${e.targetGroups}
                    </div>
                </div>
                `;
        }
    }


    document.getElementById("portfolioContainer").innerHTML = html;
}

async function initPortfolio() {
    let filter = getParam("filter") || "";
    let mode = getParam("mode") || "external";
    let eventTypeList = await fetchEventTypes(filter);
    await renderEventTypes(eventTypeList, mode);

    if (mode == "external") {
        document.querySelectorAll(".portfolio-internal").forEach(elem => elem.style.display = "none");
        document.querySelectorAll(".portfolio-external").forEach(elem => elem.style.removeProperty("display"));
    }
    if (mode == "internal") {
        document.querySelectorAll(".portfolio-external").forEach(elem => elem.style.display = "none");
        document.querySelectorAll(".portfolio-internal").forEach(elem => elem.style.removeProperty("display"));
    }
}

initPortfolio();

class EventType {
    id
    name
    descriptionInternal
    descriptionExternal
    visible
    targetGroups
    assigneesInternal
    assigneesExternal
    expenseInternal
    expenseExternal
    notes
    reminderInternal
    assigneesPR
    distributerPR
    reminderPR
    announcementPR
}
