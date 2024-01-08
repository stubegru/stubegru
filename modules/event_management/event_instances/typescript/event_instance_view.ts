class EventInstanceView {

    static async initModalForm(config: FormConfig) {
        //insert select options from config file
        let presetValues = config.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`#eventInstanceModalForm [name='${inputName}']`) as HTMLSelectElement;
            valueList.forEach(value => selectElement.add(new Option(value)));
        }

        //insert userLists
        const allUsersList = await EventInstanceController.stubegru.modules.userUtils.getAllUsers();
        document.querySelectorAll(`#eventInstanceModalForm select[data-user="all"]`).forEach((elem: HTMLSelectElement) => {
            for (const userId in allUsersList) {
                const user = allUsersList[userId];
                elem.add(new Option(user.name, user.id));
            }
        });
    }

    static showModalForCreate() {
        EventInstanceView.resetModalForm();
        EventInstanceController.editMode = EditMode.CREATE;
        EventInstanceView.setModalVisible(true);
    }

    static showModalForUpdate(eventInstanceId: string) {
        EventInstanceView.resetModalForm();
        let eventInstance = EventInstanceController.eventInstanceList[eventInstanceId];
        EventInstanceController.editMode = EditMode.UPDATE;
        EventInstanceController.currentEventInstanceId = eventInstanceId;

        for (const key in eventInstance) {
            const value = eventInstance[key];
            let formElement = document.querySelector(`#eventInstanceModalForm [name='${key}']`) as HTMLElement;
            if (!formElement) { continue; } //Skip if this attribute is not present

            switch (formElement.nodeName) {
                case "INPUT":
                    let inputElement = formElement as HTMLInputElement;
                    let inputType = inputElement.getAttribute("type");

                    if (inputType == "checkbox") {
                        EventInstanceView.setCheckboxValues(`#eventInstanceModalForm input[name='${key}']`, value);
                        break;
                    }

                    inputElement.value = value;
                    break;


                case "SELECT":
                    let selectElement = formElement as HTMLSelectElement;
                    if (typeof value == "string") {
                        selectElement.value = value;
                    } else {
                        EventInstanceView.setMultipleSelectValues(selectElement, value);
                    }
                    break;

                case "TEXTAREA":
                    let textareaElement = formElement as HTMLTextAreaElement;
                    textareaElement.value = value;
                    break;
            }
        }
        EventInstanceView.setModalVisible(true);
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
        let form = document.getElementById("eventInstanceModalForm") as HTMLFormElement;
        let formData = new FormData(form);
        let o = [];

        //generate list of multi-select's names
        let multipleNamesList = [];
        let elementList = document.querySelectorAll(`#eventInstanceModalForm select[multiple]`);
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
     * Show or hide EventInstanceModal. Modal is reset on hide automatically
     */
    static setModalVisible(visible: boolean) {
        //@ts-expect-error
        $("#eventInstanceModal").modal(visible ? "show" : "hide");
    }

    static resetModalForm() {
        let form = document.getElementById("eventInstanceModalForm") as HTMLFormElement;
        form.reset();
        document.querySelectorAll(`#eventInstanceModalForm input[type='checkbox'][data-toggle='toggle']`).forEach(elem => { elem.dispatchEvent(new Event("change")); }); //trigger change event on toggles to update state
        EventInstanceController.editMode = undefined;
        EventInstanceController.currentEventInstanceId = undefined;
    }

    static async renderListView(eventInstanceList: StringIndexedList<EventInstance>) {
        let listElement = document.getElementById("eventInstanceTableBody") as HTMLElement;
        listElement.innerHTML = "";
        const allUsersList = await EventInstanceController.stubegru.modules.userUtils.getAllUsers();


        for (let eventInstanceId in eventInstanceList) {
            let eventInstance = eventInstanceList[eventInstanceId];
            let assigneeId = eventInstance.assigneesInternal[0];
            let assigneeName = (assigneeId && allUsersList[assigneeId]) ? allUsersList[assigneeId].name : "";
            const isActive = eventInstance.isPortfolio ? "Ja" : "Nein";

            let tableRow = `<tr>
                <td>${eventInstance.name}</td>
                <td>${isActive}</td>
                <td>${assigneeName}</td>
                <td>
                    <button class='event-type-create-button btn btn-success' data-event-type-id='${eventInstance.id}' title="Neue Veranstaltung dieser Kategorie anlegen">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class='event-type-edit-button btn btn-default' data-event-type-id='${eventInstance.id}' title="Kategorie bearbeiten">
                        <i class='fa fa-pencil-alt'></i>
                    </button>
                    <button class='event-type-delete-button btn btn-danger' data-event-type-id='${eventInstance.id}' title="Kategorie löschen">
                        <i class='fa fa-times'></i>
                    </button>
                </td>
                </tr>`;

            listElement.innerHTML += tableRow;
        }
    }

}
