class EventInstanceView {
    static async initModalForm(config) {
        //insert select options from config file
        let presetValues = config.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`#eventInstanceModalForm [name='${inputName}']`);
            valueList.forEach(value => selectElement.add(new Option(value)));
        }
        //insert userLists
        const allUsersList = await EventInstanceController.stubegru.modules.userUtils.getAllUsers();
        document.querySelectorAll(`#eventInstanceModalForm select[data-user="all"]`).forEach((elem) => {
            for (const userId in allUsersList) {
                const user = allUsersList[userId];
                elem.add(new Option(user.name, user.id));
            }
        });
        //init category select
        await EventInstanceView.refreshEventTypeSelect();
    }
    static async refreshEventTypeSelect() {
        const eventTypeList = await EventTypeController.getEventTypeList();
        const categorySelect = document.querySelector(`#eventInstanceModalForm select[name="category"]`);
        categorySelect.innerHTML = ""; //Clear last options
        categorySelect.add(new Option("Keine Angabe", ""));
        for (const eventTypeId in eventTypeList) {
            const eventType = eventTypeList[eventTypeId];
            categorySelect.add(new Option(eventType.name, eventType.id));
        }
        categorySelect.addEventListener("change", function () {
            const eventType = eventTypeList[this.value];
            EventInstanceView.applyEventTypeDefaults(eventType);
        });
    }
    static applyEventTypeDefaults(eventType) {
        if (!eventType) {
            return;
        }
        const mapping = EventInstanceController.config.modalForm.presetMapping["eventTypes"];
        for (const srcKey in mapping) {
            const destKey = mapping[srcKey];
            const srcValue = eventType[srcKey];
            EventInstanceView.setFormInput(destKey, srcValue);
        }
    }
    static async showModalForCreate(eventTypeId = "") {
        await EventInstanceView.resetModalForm();
        EventInstanceController.editMode = EditMode.CREATE;
        //Pre-select eventType
        const elem = document.querySelector("#eventInstanceModalForm [name='category']");
        elem.value = eventTypeId;
        elem.dispatchEvent(new Event("change"));
        EventInstanceView.renderCancelButton();
        EventInstanceView.setModalVisible(true);
    }
    static async showModalForUpdate(eventInstanceId) {
        await EventInstanceView.resetModalForm();
        let eventInstance = EventInstanceController.eventInstanceList[eventInstanceId];
        EventInstanceController.editMode = EditMode.UPDATE;
        EventInstanceController.currentEventInstanceId = eventInstanceId;
        for (const key in eventInstance) {
            const value = eventInstance[key];
            EventInstanceView.setFormInput(key, value);
        }
        EventInstanceView.renderCancelButton();
        EventInstanceView.setModalVisible(true);
    }
    static setFormInput(key, value) {
        let formElement = document.querySelector(`#eventInstanceModalForm [name='${key}']`);
        if (!formElement || value === undefined) {
            return;
        } //Skip if this attribute is not present
        switch (formElement.nodeName) {
            case "INPUT":
                let inputElement = formElement;
                let inputType = inputElement.getAttribute("type");
                if (inputType == "checkbox") {
                    EventInstanceView.setCheckboxValues(`#eventInstanceModalForm input[name='${key}']`, value);
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
                    EventInstanceView.setMultipleSelectValues(selectElement, value);
                }
                break;
            case "TEXTAREA":
                let textareaElement = formElement;
                textareaElement.value = value;
                break;
        }
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
        let form = document.getElementById("eventInstanceModalForm");
        let formData = new FormData(form);
        let o = [];
        //generate list of multi-select's names
        let multipleNamesList = [];
        let elementList = document.querySelectorAll(`#eventInstanceModalForm select[multiple]`);
        elementList.forEach(e => multipleNamesList.push(e.getAttribute("name")));
        //add special multiple keys
        multipleNamesList.push("visible"); //Mark visible-checkboxes as multiple
        for (const [key, value] of formData) {
            let attribute = {
                key: key,
                value: value,
                isMultiple: multipleNamesList.includes(key)
            };
            o.push(attribute);
        }
        return JSON.stringify(o);
    }
    /**
     * Show or hide EventInstanceModal. Modal is reset on hide automatically
     */
    static setModalVisible(visible) {
        //@ts-expect-error
        $("#eventInstanceModal").modal(visible ? "show" : "hide");
    }
    static async resetModalForm() {
        let form = document.getElementById("eventInstanceModalForm");
        form.reset();
        document.querySelectorAll(`#eventInstanceModalForm input[type='checkbox'][data-toggle='toggle']`).forEach(elem => { elem.dispatchEvent(new Event("change")); }); //trigger change event on toggles to update state
        EventInstanceController.editMode = undefined;
        EventInstanceController.currentEventInstanceId = undefined;
        await EventInstanceView.refreshEventTypeSelect();
    }
    static async renderListView(eventInstanceList) {
        const allUsersList = await EventInstanceController.stubegru.modules.userUtils.getAllUsers();
        const eventTypeList = await EventTypeController.getEventTypeList();
        let tableDataList = [];
        for (let eventInstanceId in eventInstanceList) {
            let eventInstance = eventInstanceList[eventInstanceId];
            let assigneeId = eventInstance.assigneesInternal ? eventInstance.assigneesInternal[0] : undefined;
            let assigneeName = (assigneeId && allUsersList[assigneeId]) ? allUsersList[assigneeId].name : "";
            const eventTypeId = eventInstance.category;
            const eventTypeName = (eventTypeId && eventTypeList[eventTypeId]) ? eventTypeList[eventTypeId].name : "";
            const startDate = eventInstance.startDate;
            let buttonsColumn = `
                    <button class='event-instance-edit-button btn btn-default' data-event-instance-id='${eventInstance.id}' title="Veranstaltung bearbeiten">
                        <i class='fa fa-pencil-alt'></i>
                    </button>
                    <button class='event-instance-delete-button btn btn-danger' data-event-instance-id='${eventInstance.id}' title="Veranstaltung löschen">
                        <i class='fa fa-times'></i>
                    </button>
                </td>
                </tr>`;
            tableDataList.push({
                name: eventInstance.name,
                date: startDate,
                category: eventTypeName,
                assignee: assigneeName,
                buttons: buttonsColumn
            });
        }
        let tableOptions = {
            data: tableDataList,
            columns: {
                name: "Name",
                date: "Datum",
                category: "Kategorie",
                assignee: "Verantwortlich",
                buttons: ""
            },
            rowsPerPage: 8,
            pagination: true,
            nextText: "<i class='fas fa-angle-right'>",
            prevText: "<i class='fas fa-angle-left'>",
            searchField: document.getElementById("eventInstanceFilter")
        };
        //@ts-expect-error
        $('#eventInstanceTable').tableSortable(tableOptions);
    }
    static renderCancelButton() {
        let checkbox = document.querySelector(`#eventInstanceModalForm [name="isCancelled"]`);
        if (checkbox.checked) {
            document.getElementById("eventInstanceCancelContainer").innerHTML =
                `<div class="alert alert-danger" style="margin-bottom:0px;">
                 <b><i class="far fa-times-circle"></i> Diese Veranstaltung ist abgesagt!</b>
             </div>`;
        }
        else {
            document.getElementById("eventInstanceCancelContainer").innerHTML =
                `<button class="btn btn-danger" type="button" id="cancelEventInstanceButton">
                       <i class="far fa-times-circle"></i> Veranstaltung absagen
                 </button>`;
            document.getElementById("cancelEventInstanceButton").addEventListener("click", EventInstanceController.cancelEvent);
        }
    }
}
