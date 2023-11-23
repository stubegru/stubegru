class EventTypeController {

    //@ts-expect-error
    static stubegru = window.stubegru as StubegruObject;
    static eventTypeList: EventTypeIndexedList = {};
    static editMode: EditMode;
    static currentEventTypeId: string;

    static init() {
        EventTypeController.handleGetAllEventTypes(); //Init event view
        setInterval(EventTypeController.handleGetAllEventTypes, 1000 * 60 * 15); //Refresh view every 15 minutes

        //Reset modal on hide
        let modal = document.getElementById("eventTypeModal");
        modal.addEventListener("hidden.bs.modal", EventTypeView.resetModalForm);

        //Register new event type button
        let newBtn = document.getElementById("eventTypeNewButton");
        newBtn.addEventListener("click", EventTypeView.showModalForCreate);

        //Register modal's save-button
        document.getElementById("eventTypeModalForm").addEventListener("submit", event => {
            event.preventDefault(); //Don't trigger default submit actions
            let jsonString = EventTypeController.parseFormDataToJsonString();

            EventTypeController.editMode == EditMode.CREATE ? EventTypeController.handleCreateEventType(jsonString) : EventTypeController.handleUpdateEventType(jsonString);
        })

        //@ts-expect-error Activate multi-selects
        MultiselectDropdown({ style: { width: "100%", padding: "5px" } });

    }


    static async handleUpdateEventType(jsonString: string) {
        try {
            let resp = await EventTypeService.update(EventTypeController.currentEventTypeId, jsonString);
            EventTypeController.stubegru.modules.alerts.alert(resp);
            EventTypeView.setModalVisible(false);
            EventTypeController.handleGetAllEventTypes();
        } catch (error) {
            EventTypeController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Speichern der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }

    static async handleCreateEventType(jsonString: string) {
        try {
            let resp = await EventTypeService.create(jsonString);
            EventTypeController.stubegru.modules.alerts.alert(resp);
            EventTypeView.setModalVisible(false);
            EventTypeController.handleGetAllEventTypes();
        } catch (error) {
            EventTypeController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Erstellen der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }

    static async handleDeleteEventType(eventTypeId: string) {
        try {
            let resp = await EventTypeService.delete(eventTypeId);
            EventTypeController.stubegru.modules.alerts.alert(resp);
            EventTypeController.handleGetAllEventTypes();
        } catch (error) {
            EventTypeController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Löschen der Veranstaltungskategorie ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }

    static async handleGetAllEventTypes() {
        try {
            let eventTypeList = await EventTypeService.getAll();
            EventTypeController.eventTypeList = eventTypeList;
            EventTypeView.renderListView(eventTypeList);
            EventTypeController.registerDeleteButtons();
            EventTypeController.registerEditButtons();
            EventTypeController.stubegru.modules.userUtils.updateAdminElements()
        } catch (error) {
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

    static registerDeleteButtons() {
        let deleteBtnList = document.querySelectorAll(".event-type-delete-button");
        deleteBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventTypeId = btn.getAttribute("data-event-type-id");
                EventTypeController.stubegru.modules.alerts.deleteConfirm("Veranstaltungskategorie löschen", "Soll diese Veranstaltungskategorie wirklich gelöscht werden?", () => EventTypeController.handleDeleteEventType(eventTypeId));
            });
        });
    }


    static parseFormDataToJsonString(): string {
        let form = document.getElementById("eventTypeModalForm") as HTMLFormElement;
        let formData = new FormData(form);
        let o = [];

        //generate list of multi-select's names
        let multipleNamesList = [];
        let elementList = document.querySelectorAll(`#eventTypeModalForm select[multiple]`);
        elementList.forEach(e => multipleNamesList.push(e.getAttribute("name")));

        //add special multiple keys
        multipleNamesList.push("visible"); //Mark visible-checkboxes as multiple


        for (const [key, value] of formData) {
            console.log(key + " : " + value);

            let attribute: HttpTransportAttribute = {
                key: key,
                value: value as string,
                isMultiple: multipleNamesList.includes(key)
            }
            o.push(attribute);
        }

        console.log(o);
        return JSON.stringify(o);
    }
}

EventTypeController.init();