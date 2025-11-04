export declare class FullCalendarInstance {
    constructor(el: HTMLElement, optionOverrides?: Object);
    render(): void;
    removeAllEvents(): void;
    getEvents(): FullCalendarEvent[];
    addEventSource(eventSource: FullCalendarEventSource): void;
}

export interface FullCalendarEventSource {
    id: string;
    events: FullCalendarEvent[];
    color: string;
    classNames: string[];
}

export interface FullCalendarEvent {
    title: string;
    start: string;
    end: string;
    extendedProps: Object;
    source: FullCalendarEventSource;

    setProp: (name: string, value: any) => void;
}

export interface CalendarOptions {
    locale: string;
    initialView: string;
    businessHours: BusinessHours;
    weekends: boolean;
    headerToolbar: HeaderToolbar;
    buttonText: ButtonText;
    eventTimeFormat: EventTimeFormat;
    height?:string;
    eventClick: (event) => void;
}

interface BusinessHours {
    daysOfWeek: number[]; // Array of zero-based day of week integers (0=Sunday)
    startTime: string;
    endTime: string;
}

interface HeaderToolbar {
    start: string;
    center: string;
    end: string;
}

interface ButtonText {
    today: string;
    month: string;
    week: string;
    day: string;
    list: string;
}

interface EventTimeFormat {
    hour: string;
    minute: string;
    hour12: boolean;
}

