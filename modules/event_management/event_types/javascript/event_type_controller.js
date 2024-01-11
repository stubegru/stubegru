class EventTypeController {
    static async init() {
        EventTypeController.config = await EventTypeController.loadConfig();
        await EventTypeView.initModalForm(EventTypeController.config.modalForm);
        await EventTypeController.handleGetAllEventTypes(); //Init event view
        setInterval(EventTypeController.handleGetAllEventTypes, 1000 * 60 * 15); //Refresh the view every 15 minutes
        //Reset modal on hide
        let modal = document.getElementById("eventTypeModal");
        modal.addEventListener("hidden.bs.modal", EventTypeView.resetModalForm);
        //Register new event type button
        let newBtn = document.getElementById("eventTypeNewButton");
        newBtn.addEventListener("click", EventTypeView.showModalForCreate);
        //Register modal's save-button
        document.getElementById("eventTypeModalForm").addEventListener("submit", event => {
            event.preventDefault(); //Don't trigger default submit actions
            let jsonString = EventTypeView.parseFormDataToJsonString();
            EventTypeController.editMode == EditMode.CREATE ? EventTypeController.handleCreateEventType(jsonString) : EventTypeController.handleUpdateEventType(jsonString);
        });
        //@ts-expect-error Activate multi-selects
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Keine Angabe", selector: ".event-type-multiple-select" });
    }
    static async loadConfig() {
        try {
            let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/custom/event_management_config.json`);
            let config = await resp.json();
            return config.eventTypes;
        }
        catch (error) {
            console.error(`[Event Types] Could not load config file at 'custom/event_management_config.json'.`);
            throw error;
        }
    }
    static async getEventTypeList() {
        if (Object.keys(EventTypeController.eventTypeList).length > 0) {
            return EventTypeController.eventTypeList;
        }
        else
            return await EventTypeService.getAll();
    }
    static async handleUpdateEventType(jsonString) {
        try {
            let resp = await EventTypeService.update(EventTypeController.currentEventTypeId, jsonString);
            EventTypeController.stubegru.modules.alerts.alert(resp);
            EventTypeView.setModalVisible(false);
            EventTypeController.handleGetAllEventTypes();
        }
        catch (error) {
            EventTypeController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Speichern der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
    static async handleCreateEventType(jsonString) {
        try {
            let resp = await EventTypeService.create(jsonString);
            EventTypeController.stubegru.modules.alerts.alert(resp);
            EventTypeView.setModalVisible(false);
            EventTypeController.handleGetAllEventTypes();
        }
        catch (error) {
            EventTypeController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Erstellen der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
    static async handleDeleteEventType(eventTypeId) {
        try {
            let resp = await EventTypeService.delete(eventTypeId);
            EventTypeController.stubegru.modules.alerts.alert(resp);
            EventTypeController.handleGetAllEventTypes();
        }
        catch (error) {
            EventTypeController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Löschen der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
    static async handleGetAllEventTypes() {
        try {
            let eventTypeList = await EventTypeService.getAll();
            EventTypeController.eventTypeList = eventTypeList;
            await EventTypeView.renderListView(eventTypeList);
            EventTypeController.registerDeleteButtons();
            EventTypeController.registerPlusButtons();
            EventTypeController.registerEditButtons();
            EventTypeController.stubegru.modules.userUtils.updateAdminElements();
        }
        catch (error) {
            EventTypeController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Abrufen der Veranstaltungskategorien ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }
    static registerEditButtons() {
        let editBtnList = document.querySelectorAll(".event-type-edit-button");
        editBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventTypeId = btn.getAttribute("data-event-type-id");
                EventTypeView.showModalForUpdate(eventTypeId);
            });
        });
    }
    static registerPlusButtons() {
        let plusBtnList = document.querySelectorAll(".event-type-plus-button");
        plusBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventTypeId = btn.getAttribute("data-event-type-id");
                EventInstanceView.showModalForCreate(eventTypeId);
            });
        });
    }
    static registerDeleteButtons() {
        let deleteBtnList = document.querySelectorAll(".event-type-delete-button");
        deleteBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventTypeId = btn.getAttribute("data-event-type-id");
                EventTypeController.stubegru.modules.alerts.deleteConfirm("Veranstaltungskategorie löschen", "Soll diese Veranstaltungskategorie wirklich gelöscht werden?", () => EventTypeController.handleDeleteEventType(eventTypeId));
            });
        });
    }
}
//@ts-expect-error
EventTypeController.stubegru = window.stubegru;
EventTypeController.eventTypeList = {};
EventTypeController.init();
