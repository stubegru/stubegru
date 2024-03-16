class EventPortfolio {

    //@ts-expect-error
    static stubegru = window.stubegru as StubegruObject;
    static eventTypesConfig:EventTypesConfig;

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

    static async renderEventTypes(eventTypeList, mode) {
        let html = ``;

        for (const eventId in eventTypeList) {
            const e = eventTypeList[eventId];


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

    static async initPortfolio() {
        let filter = getParam("filter") || "";
        let mode = getParam("mode") || "external";
        EventPortfolio.eventTypesConfig = await this.loadConfig();
        let eventTypeList = await EventPortfolio.fetchEventTypes(filter);
        await EventPortfolio.renderEventTypes(eventTypeList, mode);

        if (mode == "external") {
            document.querySelectorAll(".portfolio-internal").forEach((elem:HTMLElement) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-external").forEach((elem:HTMLElement) => elem.style.removeProperty("display"));
        }
        if (mode == "internal") {
            document.querySelectorAll(".portfolio-external").forEach((elem:HTMLElement) => elem.style.display = "none");
            document.querySelectorAll(".portfolio-internal").forEach((elem:HTMLElement) => elem.style.removeProperty("display"));
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
    assigneesInternal: string[];
    assigneesExternal: string[];
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

declare function getParam(name:string) : string;

