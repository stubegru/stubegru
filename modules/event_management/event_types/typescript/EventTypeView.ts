class EventTypeView {

    static showModalForCreate() {
        EventTypeView.resetModalForm();
        EventTypeController.editMode = EditMode.CREATE;
        EventTypeView.setModalVisible(true);
    }

    static showModalForUpdate(eventTypeId: string) {
        EventTypeView.resetModalForm();
        let eventType = EventTypeController.eventTypeList[eventTypeId];
        EventTypeController.editMode = EditMode.UPDATE;
        EventTypeController.currentEventTypeId = eventTypeId;

        //TODO set inputs elements with object properties...

        EventTypeView.setModalVisible(true);
    }

    /**
     * Show or hide EventTypeModal. Modal is reset on hide automatically
     */
    static setModalVisible(visible: boolean) {
        //@ts-expect-error
        $("#eventTypeModal").modal(visible ? "show" : "hide");
    }

    static resetModalForm() {
        let form = document.getElementById("eventTypeModalForm") as HTMLFormElement;
        form.reset();
        EventTypeController.editMode = undefined;
        EventTypeController.currentEventTypeId = undefined;
    }

    static renderListView(eventTypeList) {
        let listElement = document.getElementById("eventTypeTableBody") as HTMLElement;
        listElement.innerHTML = "";

        for (let eventTypeId in eventTypeList) {
            let eventType = eventTypeList[eventTypeId];
            let assignee = "Somebody";

            let tableRow = `<tr>
                <td>${eventType.name}</td>
                <td>${eventType.isPortfolio ? "Ja" : "Nein"}</td>
                <td>${assignee}</td>
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
    }

}
