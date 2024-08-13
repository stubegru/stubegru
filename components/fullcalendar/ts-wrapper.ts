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