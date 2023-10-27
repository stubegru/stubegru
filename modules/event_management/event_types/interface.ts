interface EventType{
    name:string;
    isPortfolio: boolean;
    descriptionInternal:string;
    descriptionExternal:string;
    visible: PublishingChannel[];
    targetGroups: DropdownOption[];
    assigneesInternal: DropdownOption[];
    assigneesExternal: DropdownOption[];
    expenseInternal: string;
    expenseExternal: string;
    notes:string;
    reminderInternal: MailReminder;
    assigneesPR: DropdownOption[];
    distributerPR: DropdownOption[];
    reminderPR: MailReminder;
}

interface PublishingChannel{
    name:string;
    isVisible:boolean;
}

interface DropdownOption{
    id:string;
    title:string;
    description:string;
}

interface MailReminder{ //????????????
    date: Date;
    name: string;
    address: string;
}