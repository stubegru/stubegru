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
        let validEventTypes = [];
        //Collect all EventTypes that should be rendered
        for (const eventId in eventTypeList) {
            const eventType = eventTypeList[eventId];
            //Check if this eventType is visible in this mode ("internal"/"external")
            if (!eventType.visible || eventType.visible.indexOf(mode) < 0) {
                continue; //Don't render this item, because it should not be visible in this mode
            }
            //Skip this item if there is a filter set but this filter is not passed
            if (filter && !EventPortfolio.passedFilter(eventType, filter)) {
                continue;
            }
            validEventTypes.push(eventType);
        }
        //Sort eventTypes by name
        validEventTypes.sort((x, y) => ((x.name < y.name) ? -1 : ((x.name > y.name) ? 1 : 0)));
        //Render all valid EventTypes
        for (const e of validEventTypes) {
            if (mode == PortfolioMode.INTERNAL) {
                /**********************
                 * INTERNAL RENDERING *
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
                /**********************
                 * EXTERNAL RENDERING *
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
        if (validEventTypes.length == 0) {
            html = `<div class="alert alert-warning text-center"> <h5>Für Ihre Filter-Einstellungen wurden keine passenden Veranstaltungen gefunden!</h5></div>`;
        }
        document.getElementById("portfolioContainer").innerHTML = html;
    }
    static passedFilter(eventType, filter) {
        //Rules are interpreted as conjunction (ALL rules must be fulfilled to pass the filter)
        for (const rule of filter.rules) {
            const filterKey = rule.key;
            const eventTypesValueList = eventType[filterKey];
            //If this property is not set for this eventType -> rule not fulfilled -> filter not passed -> return false
            if (!eventTypesValueList) {
                return false;
            }
            //Check if there's at least one element that is contained in rule's and in eventType's array
            if (!hasIntersection(rule.allowedValues, eventTypesValueList)) {
                return false;
            }
        }
        //If this statement is reached -> all rules were fulfilled -> filter is passed -> return true
        return true;
        //Checks wether there's at least one element that is contained in both of the two arrays of strings
        function hasIntersection(arr1, arr2) {
            return (arr1.filter(element => arr2.includes(element)).length > 0);
        }
    }
    static onChangeFilter() {
        let filter = { rules: [] };
        //Select all inputs with filter values
        document.querySelectorAll(".portfolio-filter-input").forEach((elem) => {
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
        //re-render items with new filter
        EventPortfolio.renderEventTypes(EventPortfolio.eventTypeList, EventPortfolio.mode, filter);
    }
    static async initPortfolio() {
        //Set mode (internal/external)
        let filter = getParam("filter") || "";
        let mode = getParam("mode") || PortfolioMode.EXTERNAL;
        EventPortfolio.mode = mode;
        if (mode == PortfolioMode.EXTERNAL) {
            document.querySelectorAll(".portfolio-internal").forEach((elem) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-external").forEach((elem) => elem.style.removeProperty("display"));
        }
        if (mode == PortfolioMode.INTERNAL) {
            document.querySelectorAll(".portfolio-external").forEach((elem) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-internal").forEach((elem) => elem.style.removeProperty("display"));
        }
        //Fetch EventTypes and render them
        let eventTypeList = await EventPortfolio.fetchEventTypes(filter);
        EventPortfolio.eventTypeList = eventTypeList;
        await EventPortfolio.renderEventTypes(eventTypeList, mode);
        //Load json config
        EventPortfolio.eventTypesConfig = await this.loadConfig();
        //Insert select options from config file
        let presetValues = EventPortfolio.eventTypesConfig.modalForm.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`.portfolio-filter-input[name='${inputName}']`);
            if (selectElement) {
                valueList.forEach(value => selectElement.add(new Option(value)));
            }
        }
        //Add eventListener for filter inputs
        document.querySelectorAll(".portfolio-filter-input").forEach((elem) => {
            elem.addEventListener("change", EventPortfolio.onChangeFilter);
        });
        //Init multiple selects
        //@ts-expect-error
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Alle anzeigen", selector: ".portfolio-multiple-select" });
    }
}
//@ts-expect-error
EventPortfolio.stubegru = window.stubegru;
EventPortfolio.initPortfolio();
