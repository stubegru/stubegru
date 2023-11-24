interface EventType {
    id: string;
    name: string;
    isPortfolio: boolean;
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

}

interface HttpTransportAttribute {
    key: string;
    value: string;
    isMultiple: boolean;
}

enum EditMode {
    "CREATE", "UPDATE"
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

interface eventMgmtConfig {
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
    getAllUsers(): Promise<StubegruUser[]>;
}

interface StubegruUser {
    id: string;
    name: string;
    mail: string;
    account: string;
    role: string;
    erfassungsdatum: string;
    erfasser : string;
}

