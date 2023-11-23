class EventTypeView {
    static showModalForCreate() {
        EventTypeView.resetModalForm();
        EventTypeController.editMode = EditMode.CREATE;
        EventTypeView.setModalVisible(true);
    }
    static showModalForUpdate(eventTypeId) {
        EventTypeView.resetModalForm();
        let eventType = EventTypeController.eventTypeList[eventTypeId];
        EventTypeController.editMode = EditMode.UPDATE;
        EventTypeController.currentEventTypeId = eventTypeId;
        for (const key in eventType) {
            const value = eventType[key];
            console.log(`\ncurrently at "${key}" : ${value}`);
            switch (typeof value) {
                case "string":
                    let input = document.querySelector(`#eventTypeModalForm input[name='${key}'], #eventTypeModalForm textarea[name='${key}'], #eventTypeModalForm select[name='${key}']`);
                    if (input && input.getAttribute("type") == "checkbox") {
                        input.checked = (value == "on");
                        input.dispatchEvent(new Event("change")); //fire change event, to update toggle html
                        console.log(`--> setting checkbox ${key} to value ${input.checked}`);
                    }
                    if (input) {
                        input.value = value;
                    }
                    else {
                        console.log(`--> ignoring ${key} because no matching input was found`);
                    }
                    break;
                case "object":
                    let input2 = document.querySelector(`#eventTypeModalForm select[name='${key}']`);
                    if (input2) {
                        EventTypeView.setMultipleSelectValues(input2, value);
                    }
                    else {
                        EventTypeView.setCheckboxValues(`#eventTypeModalForm input[name='${key}']`, value);
                    }
                    break;
                default:
                    console.log(`--> ignoring ${key} because its value is of type ${typeof value}`);
                    break;
            }
        }
        //TODO set inputs elements with object properties...
        EventTypeView.setModalVisible(true);
    }
    static setMultipleSelectValues(selectElement, values) {
        for (const option of selectElement) {
            option.selected = (values.indexOf(option.value) != -1);
        }
    }
    static setCheckboxValues(selector, values) {
        let checkBoxList = document.querySelectorAll(selector);
        for (const checkboxElem of checkBoxList) {
            checkboxElem.checked = (values.indexOf(checkboxElem.getAttribute("value")) != -1);
        }
    }
    /**
     * Show or hide EventTypeModal. Modal is reset on hide automatically
     */
    static setModalVisible(visible) {
        //@ts-expect-error
        $("#eventTypeModal").modal(visible ? "show" : "hide");
    }
    static resetModalForm() {
        let form = document.getElementById("eventTypeModalForm");
        form.reset();
        document.querySelectorAll(`#eventTypeModalForm input[type='checkbox'][data-toggle='toggle']`).forEach(elem => { elem.dispatchEvent(new Event("change")); }); //trigger change event on toggles to update state
        EventTypeController.editMode = undefined;
        EventTypeController.currentEventTypeId = undefined;
    }
    static renderListView(eventTypeList) {
        let listElement = document.getElementById("eventTypeTableBody");
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
