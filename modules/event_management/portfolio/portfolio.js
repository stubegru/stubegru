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
    static async renderEventTypes(eventTypeList, mode, filter) {
        let html = ``;
        for (const eventId in eventTypeList) {
            const e = eventTypeList[eventId];
            //Check if this eventType is visible in this mode ("internal"/"external")
            if (!e.visible || e.visible.indexOf(mode) < 0) {
                continue; //Don't render this item, because it should not be visible in this mode
            }
            if (filter && !EventPortfolio.passedFilter(e, filter)) {
                continue;
            }
            if (mode == PortfolioMode.INTERNAL) {
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
                    <b>Möglicher Ort:</b> ${e.possibleLocations}
                    <br>
                    <b>Möglicher Zeitumfang:</b> ${e.timeDurations}
                    <br>
                    <b>Verantwortlich:</b> ${assigneeHtml}
                </div>
            </div>
            `;
            }
            else if (mode == PortfolioMode.EXTERNAL) {
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
    static passedFilter(e, filter) {
        for (const rule of filter.rules) {
            const filterKey = rule.key;
            const currentValueList = e[filterKey];
            if (!currentValueList) {
                return false;
            }
            let tempReturn = false;
            for (const currentValue of currentValueList) {
                if (rule.allowedValues.indexOf(currentValue) >= 0) {
                    tempReturn = true;
                }
            }
            if (tempReturn == false) {
                return false;
            }
        }
        return true;
    }
    static onChangeFilter() {
        let filter = { rules: [] };
        //Select all inputs with filter values
        document.querySelectorAll(".portfolio-filter-input").forEach((elem) => {
            //read multi-select values
            const inputName = elem.name;
            const selectedOptions = elem.querySelectorAll('option:checked');
            const selectedValues = Array.from(selectedOptions).map((el) => el.value);
            if (selectedValues.length > 0) { //only add rule, if there's any value selected
                //add it's values to filter rule
                const rule = { key: inputName, allowedValues: selectedValues };
                filter.rules.push(rule);
            }
        });
        //re-render items with new filter
        console.log(filter);
        EventPortfolio.renderEventTypes(EventPortfolio.eventTypeList, EventPortfolio.mode, filter);
    }
    static async initPortfolio() {
        let filter = getParam("filter") || "";
        let mode = getParam("mode") || PortfolioMode.EXTERNAL;
        EventPortfolio.eventTypesConfig = await this.loadConfig();
        let eventTypeList = await EventPortfolio.fetchEventTypes(filter);
        EventPortfolio.eventTypeList = eventTypeList;
        EventPortfolio.mode = mode;
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
        //add eventListener for filter inputs
        document.querySelectorAll(".portfolio-filter-input").forEach((elem) => {
            elem.addEventListener("change", EventPortfolio.onChangeFilter);
        });
        //@ts-expect-error
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Alle anzeigen", selector: ".portfolio-multiple-select" });
        if (mode == PortfolioMode.EXTERNAL) {
            document.querySelectorAll(".portfolio-internal").forEach((elem) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-external").forEach((elem) => elem.style.removeProperty("display"));
        }
        if (mode == PortfolioMode.INTERNAL) {
            document.querySelectorAll(".portfolio-external").forEach((elem) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-internal").forEach((elem) => elem.style.removeProperty("display"));
        }
    }
}
//@ts-expect-error
EventPortfolio.stubegru = window.stubegru;
EventPortfolio.initPortfolio();
var PortfolioMode;
(function (PortfolioMode) {
    PortfolioMode["INTERNAL"] = "internal";
    PortfolioMode["EXTERNAL"] = "external";
})(PortfolioMode || (PortfolioMode = {}));
;
