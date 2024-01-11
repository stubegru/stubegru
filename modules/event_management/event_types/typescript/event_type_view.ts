class EventTypeView {

    static async initModalForm(config: FormConfig) {
        //insert select options from config file
        let presetValues = config.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`#eventTypeModalForm [name='${inputName}']`) as HTMLSelectElement;
            valueList.forEach(value => selectElement.add(new Option(value)));
        }

        //insert userLists
        const allUsersList = await EventTypeController.stubegru.modules.userUtils.getAllUsers();
        document.querySelectorAll(`#eventTypeModalForm select[data-user="all"]`).forEach((elem: HTMLSelectElement) => {
            for (const userId in allUsersList) {
                const user = allUsersList[userId];
                elem.add(new Option(user.name, user.id));
            }
        });
    }

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

        for (const key in eventType) {
            const value = eventType[key];
            let formElement = document.querySelector(`#eventTypeModalForm [name='${key}']`) as HTMLElement;
            if (!formElement) { continue; } //Skip if this attribute is not present

            switch (formElement.nodeName) {
                case "INPUT":
                    let inputElement = formElement as HTMLInputElement;
                    let inputType = inputElement.getAttribute("type");

                    if (inputType == "checkbox") {
                        EventTypeView.setCheckboxValues(`#eventTypeModalForm input[name='${key}']`, value);
                        break;
                    }

                    inputElement.value = value;
                    break;


                case "SELECT":
                    let selectElement = formElement as HTMLSelectElement;
                    if (typeof value == "string") {
                        selectElement.value = value;
                    } else {
                        EventTypeView.setMultipleSelectValues(selectElement, value);
                    }
                    break;

                case "TEXTAREA":
                    let textareaElement = formElement as HTMLTextAreaElement;
                    textareaElement.value = value;
                    break;
            }
        }
        EventTypeView.setModalVisible(true);
    }

    static setMultipleSelectValues(selectElement: HTMLSelectElement, values: string[]) {
        for (const option of selectElement) {
            option.selected = (values.indexOf(option.value) != -1);
        }
    }

    static setCheckboxValues(selector: string, values: string[]) {
        let checkBoxList = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;

        for (const checkboxElem of checkBoxList) {
            checkboxElem.checked = (values.indexOf(checkboxElem.getAttribute("value")) != -1);
            checkboxElem.dispatchEvent(new Event("change")); //fire change event, to update toggle html
        }
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
            let attribute: HttpTransportAttribute = {
                key: key,
                value: value as string,
                isMultiple: multipleNamesList.includes(key)
            }
            o.push(attribute);
        }

        return JSON.stringify(o);
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
        document.querySelectorAll(`#eventTypeModalForm input[type='checkbox'][data-toggle='toggle']`).forEach(elem => { elem.dispatchEvent(new Event("change")); }); //trigger change event on toggles to update state
        EventTypeController.editMode = undefined;
        EventTypeController.currentEventTypeId = undefined;
    }

    static async renderListView(eventTypeList: StringIndexedList<EventType>) {
        let listElement = document.getElementById("eventTypeTableBody") as HTMLElement;
        listElement.innerHTML = "";
        const allUsersList = await EventTypeController.stubegru.modules.userUtils.getAllUsers();


        for (let eventTypeId in eventTypeList) {
            let eventType = eventTypeList[eventTypeId];
            let assigneeId = eventType.assigneesInternal ? eventType.assigneesInternal[0] : undefined;
            let assigneeName = (assigneeId && allUsersList[assigneeId]) ? allUsersList[assigneeId].name : "";
            const isActive = eventType.isPortfolio ? "Ja" : "Nein";

            let tableRow = `<tr>
                <td>${eventType.name}</td>
                <td>${isActive}</td>
                <td>${assigneeName}</td>
                <td>
                    <button class='event-type-plus-button btn btn-success' data-event-type-id='${eventType.id}' title="Neue Veranstaltung dieser Kategorie anlegen">
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
