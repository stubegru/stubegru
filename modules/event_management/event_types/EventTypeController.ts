class EventTypeController {
    static async delete(eventTypeId: string) {
        throw new Error("Method not implemented.");
    }

    static async refreshEventTypeList(): Promise<EventTypeList> {
        try {
            EventTypeView.eventTypeList = {}; //Reset static EventType list

            let resp = await fetch(`${EventTypeView.stubegru.constants.BASE_URL}/modules/event_management/event_types/get_event_types.php`);
            let eventTypeList: EventType[] = await resp.json();
            for (const e of eventTypeList) { EventTypeView.eventTypeList[e.id] = e; }
            return EventTypeView.eventTypeList;
        } catch (error) {
            EventTypeView.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Abrufen der Veranstaltungskategorien ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
}

