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

interface EventMgmtConfig {
    eventTypes: EventTypesConfig;
}

interface EventTypesConfig {
    modalForm: FormConfig;
}

interface FormConfig {
    presetValues: StringIndexedList<SelectOption[]>
    presetMapping: StringIndexedList<StringIndexedList<string>>
}

interface SelectOption {
    name: string,
    value: string
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

