class EventTypeView {

    //@ts-expect-error
    static stubegru = window.stubegru as StubegruObject;
    static eventTypeList: EventTypeIndexedList = {};
    static editMode: EditMode;
    static currentEventTypeId: string;

    static init() {
        EventTypeView.refreshListView(); //Init event view
        setInterval(EventTypeView.refreshListView, 1000 * 60 * 15); //Refresh view every 15 minutes

        //Reset modal on hide
        let modal = document.getElementById("eventTypeModal");
        modal.addEventListener("hidden.bs.modal", EventTypeView.resetModalForm);

        //Register new event type button
        let newBtn = document.getElementById("eventTypeNewButton");
        newBtn.addEventListener("click", EventTypeView.newEventType);

        //Register modal's save-button
        document.getElementById("eventTypeModalForm").addEventListener("submit", event => {
            event.preventDefault(); //Don't trigger default submit actions
            let jsonString = EventTypeView.parseFormDataToJsonString();
            EventTypeView.editMode == EditMode.CREATE ? EventTypeController.create(jsonString) : EventTypeController.update(jsonString, EventTypeView.currentEventTypeId);
        })

        //@ts-expect-error Activate multi-selects
        MultiselectDropdown({ style: { width: "100%", padding: "5px" } });

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
            //console.log(key + " : " + value);

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

    static newEventType() {
        EventTypeView.resetModalForm();
        EventTypeView.editMode = EditMode.CREATE;
        EventTypeView.setModalVisible(true);
    }

    static resetModalForm() {
        let form = document.getElementById("eventTypeModalForm") as HTMLFormElement;
        form.reset();
        EventTypeView.editMode = undefined;
        EventTypeView.currentEventTypeId = undefined;
    }

    static editEventType(eventTypeId: string) {
        let eventType = EventTypeView.eventTypeList[eventTypeId];
        EventTypeView.editMode = EditMode.UPDATE;
        EventTypeView.currentEventTypeId = eventTypeId;

        //TODO set inputs elements with object properties...

        EventTypeView.setModalVisible(true);
    }

    static setModalVisible(visible: boolean) {
        //@ts-expect-error
        $("#eventTypeModal").modal(visible ? "show" : "hide");
    }

    static async refreshListView() {

        let eventTypeList = await EventTypeController.getAll();
        EventTypeView.eventTypeList = eventTypeList;

        let listElement = document.getElementById("eventTypeTableBody") as HTMLElement;
        listElement.innerHTML = "";

        for (let eventTypeId in eventTypeList) {
            let eventType = eventTypeList[eventTypeId];

            let tableRow = `<tr>
            <td>${eventType.name}</td>
            <td>???</td>
            <td>???</td>
            <td>
                <button class='event-type-create-button btn btn-success' data-event-type-id='${eventType.id}' title="Neue Veranstaltung dieser Kategorie anlegen">
                    <i class="fas fa-plus"></i>
                </button>
                <button class='event-type-edit-button btn btn-default' data-event-type-id='${eventType.id}' title="Kategorie bearbeiten">
                    <i class='fa fa-pencil-alt'></i>
                </button>
                <button class='event-type-delete-button btn btn-danger' data-event-type-id='${eventType.id}' title="Kategorie löschen">
                    <i class='fa fa-times'></i>
                </button>
            </td>
            </tr>`;

            listElement.innerHTML += tableRow;
        }

        //register delete button actions
        let deleteBtnList = document.querySelectorAll(".event-type-delete-button");
        deleteBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventTypeId = btn.getAttribute("data-event-type-id");
                EventTypeView.stubegru.modules.alerts.deleteConfirm("Abwesenheit löschen", "Soll diese Abwesenheit wirklich gelöscht werden?", async () => await EventTypeController.delete(eventTypeId));
            })
        });

        //register edit button actions
        let editBtnList = document.querySelectorAll(".event-type-edit-button");
        editBtnList.forEach(btn => {
            btn.addEventListener("click", () => {
                let eventTypeId = btn.getAttribute("data-event-type-id");
                EventTypeView.editEventType(eventTypeId);
            });
        });

        EventTypeView.stubegru.modules.userUtils.updateAdminElements()
    }

}


EventTypeView.init();