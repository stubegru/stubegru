class EventInstanceController {

    //@ts-expect-error
    static stubegru = window.stubegru as StubegruObject;
    static eventInstanceList: StringIndexedList<EventInstance> = {};
    static editMode: EditMode;
    static currentEventInstanceId: string;
    static config: EventInstancesConfig;

    static async init() {
        EventInstanceController.config = await EventInstanceController.loadConfig();

        await EventInstanceView.initModalForm(EventInstanceController.config.modalForm);
        EventInstanceCalendarView.init();

        await EventInstanceController.handleGetAllEventInstances(); //Init event view
        setInterval(EventInstanceController.handleGetAllEventInstances, 1000 * 60 * 15); //Refresh the view every 15 minutes

        //Reset modal on hide
        let modal = document.getElementById("eventInstanceModal");
        modal.addEventListener("hidden.bs.modal", EventInstanceView.resetModalForm);

        //Register new event instance button
        let newBtn = document.getElementById("eventInstanceNewButton");
        newBtn.addEventListener("click", () => EventInstanceView.showModalForCreate());

        //Register modal's save-button
        document.getElementById("eventInstanceModalForm").addEventListener("submit", event => {
            event.preventDefault(); //Don't trigger default submit actions
            let jsonString = EventInstanceView.parseFormDataToJsonString();

            EventInstanceController.editMode == EditMode.CREATE ? EventInstanceController.handleCreateEventInstance(jsonString) : EventInstanceController.handleUpdateEventInstance(jsonString);
        })

        //@ts-expect-error Activate multi-selects
        MultiselectDropdown({ style: { width: "100%", padding: "5px" }, placeholder: "Keine Angabe", selector: ".event-instance-multiple-select" });

    }

    static async loadConfig(): Promise<EventInstancesConfig> {
        try {
            let resp = await fetch(`${EventInstanceController.stubegru.constants.BASE_URL}/custom/event_management_config.json`);
            let config: eventMgmtConfig = await resp.json();
            return config.eventInstances;
        } catch (error) {
            console.error(`[event instances] Could not load config file at 'custom/event_management_config.json'.`);
            throw error;
        }
    }


    static async handleUpdateEventInstance(jsonString: string) {
        try {
            let resp = await EventInstanceService.update(EventInstanceController.currentEventInstanceId, jsonString);
            EventInstanceController.stubegru.modules.alerts.alert(resp);
            EventInstanceView.setModalVisible(false);
            EventInstanceController.handleGetAllEventInstances();
        } catch (error) {
            EventInstanceController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Speichern der Veranstaltung ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }

    static async handleCreateEventInstance(jsonString: string) {
        try {
            let resp = await EventInstanceService.create(jsonString);
            EventInstanceController.stubegru.modules.alerts.alert(resp);
            EventInstanceView.setModalVisible(false);
            EventInstanceController.handleGetAllEventInstances();
        } catch (error) {
            EventInstanceController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Erstellen der Veranstaltung ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }

    static async handleDeleteEventInstance(eventInstanceId: string) {
        try {
            let resp = await EventInstanceService.delete(eventInstanceId);
            EventInstanceController.stubegru.modules.alerts.alert(resp);
            EventInstanceController.handleGetAllEventInstances();
        } catch (error) {
            EventInstanceController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Löschen der Veranstaltung ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }

    static async handleGetAllEventInstances() {
        try {
            let eventInstanceList = await EventInstanceService.getAll();
            EventInstanceController.eventInstanceList = eventInstanceList;
            await EventInstanceView.renderListView(eventInstanceList);
            EventInstanceCalendarView.setEvents(eventInstanceList);
            EventInstanceController.registerDeleteButtons();
            EventInstanceController.registerEditButtons();
            EventInstanceController.stubegru.modules.userUtils.updateAdminElements()
        } catch (error) {
            EventInstanceController.stubegru.modules.alerts.alert({ title: "Netzwerkfehler", text: `Beim Abrufen der Veranstaltungen ist ein Fehler aufgetreten. <br><br> Fehler: <i>${error.message}</i>`, type: "error" });
        }
    }


    static registerEditButtons() {
        let editBtnList = document.querySelectorAll(".event-instance-edit-button");
        editBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventInstanceId = btn.getAttribute("data-event-instance-id");
                EventInstanceView.showModalForUpdate(eventInstanceId);
            });
        });
    }

    static registerDeleteButtons() {
        let deleteBtnList = document.querySelectorAll(".event-instance-delete-button");
        deleteBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventInstanceId = btn.getAttribute("data-event-instance-id");
                EventInstanceController.stubegru.modules.alerts.deleteConfirm("Veranstaltung löschen", "Soll diese Veranstaltung wirklich gelöscht werden?", () => EventInstanceController.handleDeleteEventInstance(eventInstanceId));
            });
        });
    }



}

EventInstanceController.init();