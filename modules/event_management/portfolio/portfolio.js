class EventPortfolio {
    static async fetchEventTypes(filter) {
        let resp = await fetch(`${EventPortfolio.stubegru.constants.BASE_URL}/modules/event_management/portfolio/get_portfolio_event_types.php?filter=${filter}`);
        let eventTypeList = await resp.json();
        return eventTypeList;
    }
    static async loadConfig() {
        try {
            let resp = await fetch(`${EventPortfolio.stubegru.constants.BASE_URL}/custom/event_management_config.json`);
            let config = await resp.json();
            return config.eventTypes;
        }
        catch (error) {
            console.error(`[Event Types] Could not load config file at 'custom/event_management_config.json'.`);
            throw error;
        }
    }
    static async renderEventTypes(eventTypeList, mode) {
        let html = ``;
        for (const eventId in eventTypeList) {
            const e = eventTypeList[eventId];
            //Check if this eventType is visible in this mode ("internal"/"external")
            if (!e.visible || e.visible.indexOf(mode) < 0) {
                continue; //Don't render this item, because it should not be visible in this mode
            }
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
                </div>`;
                    }
                }
                assigneeHtml += "</div>";
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
    static async initPortfolio() {
        let filter = getParam("filter") || "";
        let mode = getParam("mode") || "external";
        EventPortfolio.eventTypesConfig = await this.loadConfig();
        let eventTypeList = await EventPortfolio.fetchEventTypes(filter);
        await EventPortfolio.renderEventTypes(eventTypeList, mode);
        //insert select options from config file
        let presetValues = EventPortfolio.eventTypesConfig.modalForm.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`.portfolio-filter [name='${inputName}']`);
            if (selectElement) {
                valueList.forEach(value => selectElement.add(new Option(value)));
            }
        }
        //@ts-expect-error
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Alle anzeigen", selector: ".portfolio-multiple-select" });
        if (mode == "external") {
            document.querySelectorAll(".portfolio-internal").forEach((elem) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-external").forEach((elem) => elem.style.removeProperty("display"));
        }
        if (mode == "internal") {
            document.querySelectorAll(".portfolio-external").forEach((elem) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-internal").forEach((elem) => elem.style.removeProperty("display"));
        }
    }
}
//@ts-expect-error
EventPortfolio.stubegru = window.stubegru;
EventPortfolio.initPortfolio();
