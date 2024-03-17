class EventPortfolio {

    //@ts-expect-error
    static stubegru = window.stubegru as StubegruObject;
    static eventTypesConfig: EventTypesConfig;
    static eventTypeList: EventType[];
    static mode: PortfolioMode;

    static async fetchEventTypes(filter) {
        let resp = await fetch(`${EventPortfolio.stubegru.constants.BASE_URL}/modules/event_management/portfolio/get_portfolio_event_types.php?filter=${filter}`);
        let eventTypeList = await resp.json();
        return eventTypeList;
    }

    static async loadConfig(): Promise<EventTypesConfig> {
        try {
            let resp = await fetch(`${EventPortfolio.stubegru.constants.BASE_URL}/custom/event_management_config.json`);
            let config: EventMgmtConfig = await resp.json();
            return config.eventTypes;
        } catch (error) {
            console.error(`[Event Types] Could not load config file at 'custom/event_management_config.json'.`);
            throw error;
        }
    }

    static async renderEventTypes(eventTypeList: EventType[], mode: PortfolioMode, filter?: PortfolioFilter) {
        let html = ``;

        for (const eventId in eventTypeList) {
            const e: EventType = eventTypeList[eventId];

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

    static passedFilter(e: EventType, filter: PortfolioFilter): boolean {
        for (const rule of filter.rules) {
            const filterKey = rule.key;
            const currentValueList:string[] = e[filterKey];
            if (!currentValueList) { return false; }

            let tempReturn = false;
            for (const currentValue of currentValueList) {
                if (rule.allowedValues.indexOf(currentValue) >= 0) { tempReturn = true; }
            }
            if(tempReturn == false){return false;}
        }
        return true;
    }

    static onChangeFilter() {
        let filter: PortfolioFilter = { rules: [] };
        //Select all inputs with filter values
        document.querySelectorAll(".portfolio-filter-input").forEach((elem: HTMLSelectElement) => {
            //read multi-select values
            const inputName = elem.name;
            const selectedOptions = elem.querySelectorAll('option:checked');
            const selectedValues = Array.from(selectedOptions).map((el: HTMLOptionElement) => el.value);
            if (selectedValues.length > 0) { //only add rule, if there's any value selected
                //add it's values to filter rule
                const rule: PortfolioFilterRule = { key: inputName, allowedValues: selectedValues };
                filter.rules.push(rule);
            }
        })
        //re-render items with new filter
        console.log(filter);
        EventPortfolio.renderEventTypes(EventPortfolio.eventTypeList, EventPortfolio.mode, filter);
    }

    static async initPortfolio() {
        let filter = getParam("filter") || "";
        let mode: PortfolioMode = getParam("mode") as PortfolioMode || PortfolioMode.EXTERNAL;
        EventPortfolio.eventTypesConfig = await this.loadConfig();
        let eventTypeList = await EventPortfolio.fetchEventTypes(filter);
        EventPortfolio.eventTypeList = eventTypeList;
        EventPortfolio.mode = mode;
        await EventPortfolio.renderEventTypes(eventTypeList, mode);

        //insert select options from config file
        let presetValues = EventPortfolio.eventTypesConfig.modalForm.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`.portfolio-filter [name='${inputName}']`) as HTMLSelectElement;
            if (selectElement) {
                valueList.forEach(value => selectElement.add(new Option(value)));
            }
        }

        //add eventListener for filter inputs
        document.querySelectorAll(".portfolio-filter-input").forEach((elem: HTMLSelectElement) => {
            elem.addEventListener("change", EventPortfolio.onChangeFilter);
        })


        //@ts-expect-error
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Alle anzeigen", selector: ".portfolio-multiple-select" });

        if (mode == PortfolioMode.EXTERNAL) {
            document.querySelectorAll(".portfolio-internal").forEach((elem: HTMLElement) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-external").forEach((elem: HTMLElement) => elem.style.removeProperty("display"));
        }
        if (mode == PortfolioMode.INTERNAL) {
            document.querySelectorAll(".portfolio-external").forEach((elem: HTMLElement) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-internal").forEach((elem: HTMLElement) => elem.style.removeProperty("display"));
        }
    }
}



EventPortfolio.initPortfolio();








interface EventType {
    id: string;
    name: string;
    // isPortfolio: boolean;
    descriptionInternal: string;
    descriptionExternal: string;
    visible: string[]; //multiple toggles!
    targetGroups: string[];
    assigneesInternal: StubegruUser[];
    assigneesExternal: StubegruUser[];
    expenseInternal: string;
    expenseExternal: string;
    notes: string;
    reminderInternal: string; //Mailreminder!!!
    assigneesPR: string[];
    distributerPR: string[];
    reminderPR: string;
    announcementPR: string;
    bookableBy: string[];
    targetGroupsSchool: string[];
    timeDurations: string[];
    possibleLocations: string[];

}

enum PortfolioMode { "INTERNAL" = "internal", "EXTERNAL" = "external" };

interface PortfolioFilter {
    rules: PortfolioFilterRule[];
}

interface PortfolioFilterRule {
    key: string;
    allowedValues: string[];
}

interface PublishingChannel {
    name: string;
    isVisible: boolean;
}

interface DropdownOption {
    value: string;
    title: string;
    description: string;
}

interface MailReminder { //????????????
    date: Date;
    name: string;
    address: string;
}

interface EventMgmtConfig {
    eventTypes: EventTypesConfig;
}

interface EventTypesConfig {
    modalForm: FormConfig;
}

interface FormConfig {
    presetValues: StringIndexedList<string[]>
}

interface StringIndexedList<ListItem> {
    [index: string]: ListItem;
}


interface StubegruObject {
    modules: StubegruModulesList;
    constants: StringIndexedList<String>;
    currentView: string;
    currentUser: object;
}

interface StubegruModulesList {
    customEvents: object;
    alerts: StubegruAlertsModule;
    survey: object;
    notifications: object;
    userUtils: StubegruUserUtilsModule;
    menubar: object;
}

interface StubegruAlertsModule {
    deleteConfirm(pTitle: string, pDescription: string, callback: Function): void;
    alert(options: string | StubegruAlertOptions | StubegruHttpResponse, title?: string): void;
}

interface StubegruAlertOptions {
    text: string;
    type: string;
    title: string;
    mode?: string;
}

interface StubegruHttpResponse {
    status: string;
    message: string;
}


interface StubegruUserUtilsModule {
    updateAdminElements(): Promise<void>;
    getAllUsers(): Promise<StringIndexedList<StubegruUser>>;
}

interface StubegruUser {
    id: string;
    name: string;
    mail: string;
    account: string;
    role: string;
    erfassungsdatum: string;
    erfasser: string;
}

declare function getParam(name: string): string;

