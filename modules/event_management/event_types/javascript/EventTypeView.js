class EventTypeView {
    static initModalForm(config) {
        let presetValues = config.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`#eventTypeModalForm [name='${inputName}']`);
            valueList.forEach(value => selectElement.add(new Option(value)));
        }
    }
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
            let formElement = document.querySelector(`#eventTypeModalForm [name='${key}']`);
            if (!formElement) {
                continue;
            } //Skip if this attribute is not present
            switch (formElement.nodeName) {
                case "INPUT":
                    let inputElement = formElement;
                    let inputType = inputElement.getAttribute("type");
                    if (inputType == "checkbox") {
                        EventTypeView.setCheckboxValues(`#eventTypeModalForm input[name='${key}']`, value);
                        break;
                    }
                    inputElement.value = value;
                    break;
                case "SELECT":
                    let selectElement = formElement;
                    if (typeof value == "string") {
                        selectElement.value = value;
                    }
                    else {
                        EventTypeView.setMultipleSelectValues(selectElement, value);
                    }
                    break;
                case "TEXTAREA":
                    let textareaElement = formElement;
                    textareaElement.value = value;
                    break;
            }
        }
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
            checkboxElem.dispatchEvent(new Event("change")); //fire change event, to update toggle html
        }
    }
    static parseFormDataToJsonString() {
        let form = document.getElementById("eventTypeModalForm");
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
            let attribute = {
                key: key,
                value: value,
                isMultiple: multipleNamesList.includes(key)
            };
            o.push(attribute);
        }
        console.log(o);
        return JSON.stringify(o);
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
