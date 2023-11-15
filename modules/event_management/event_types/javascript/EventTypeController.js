class EventTypeController {
    static async getAll() {
        try {
            let resp = await fetch(`${EventTypeView.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/get_all_event_types.php`);
            let eventTypeList = await resp.json();
            return eventTypeList;
        }
        catch (error) {
            EventTypeView.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Abrufen der Veranstaltungskategorien ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
    static async get(eventTypeId) {
        try {
            let resp = await fetch(`${EventTypeView.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/get_event_type.php?eventTypeId=${eventTypeId}`);
            let eventType = await resp.json();
            return eventType;
        }
        catch (error) {
            EventTypeView.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Abrufen der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
    static async delete(eventTypeId) {
        try {
            let formData = new FormData();
            formData.append("eventTypeId", eventTypeId);
            let resp = await fetch(`${EventTypeView.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/delete_event_type.php`, {
                method: 'POST',
                body: formData
            });
            let parsedResp = await resp.json();
            if (!parsedResp.status || parsedResp.status == "error") {
                throw new Error(parsedResp.message);
            }
            EventTypeView.stubegru.modules.alerts.alert(parsedResp);
        }
        catch (error) {
            EventTypeView.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Löschen der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
}
