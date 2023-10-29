interface EventType {
    id: string;
    name: string;
    isPortfolio: boolean;
    descriptionInternal: string;
    descriptionExternal: string;
    visible: PublishingChannel[];
    targetGroups: DropdownOption[];
    assigneesInternal: DropdownOption[];
    assigneesExternal: DropdownOption[];
    expenseInternal: string;
    expenseExternal: string;
    notes: string;
    reminderInternal: MailReminder;
    assigneesPR: DropdownOption[];
    distributerPR: DropdownOption[];
    reminderPR: MailReminder;
}

interface PublishingChannel {
    name: string;
    isVisible: boolean;
}

interface DropdownOption {
    id: string;
    title: string;
    description: string;
}

interface MailReminder { //????????????
    date: Date;
    name: string;
    address: string;
}

interface EventTypeList {
    [index: string]: EventType;
}





interface StubegruObject {
    modules: StubegruModulesList;
    constants: StubegruConstantsList;
    currentView: string;
    currentUser: object;
}

interface StubegruConstantsList {
    [index: string]: string;
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
}

