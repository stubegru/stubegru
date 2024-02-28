class EventTypeView {
    static async initModalForm(config) {
        //insert select options from config file
        let presetValues = config.presetValues;
        for (const inputName in presetValues) {
            const valueList = presetValues[inputName];
            const selectElement = document.querySelector(`#eventTypeModalForm [name='${inputName}']`);
            valueList.forEach(value => selectElement.add(new Option(value)));
        }
        //insert userLists
        const allUsersList = await EventTypeController.stubegru.modules.userUtils.getAllUsers();
        document.querySelectorAll(`#eventTypeModalForm select[data-user="all"]`).forEach((elem) => {
            for (const userId in allUsersList) {
                const user = allUsersList[userId];
                elem.add(new Option(user.name, user.id));
            }
        });
    }
    static initListView() {
        let tableOptions = {
            data: [],
            columns: {
                name: "Name",
                assignee: "Verantwortlich",
                buttons: ""
            },
            rowsPerPage: 8,
            pagination: true,
            nextText: "<i class='fas fa-angle-right'>",
            prevText: "<i class='fas fa-angle-left'>",
            searchField: document.getElementById("eventTypeTableFilter"),
            tableDidUpdate: EventTypeView.onUpdateListView
        };
        //@ts-expect-error
        EventTypeView.sortableTable = $('#eventTypeTable').tableSortable(tableOptions);
    }
    static onUpdateListView() {
        EventTypeController.registerDeleteButtons();
        EventTypeController.registerPlusButtons();
        EventTypeController.registerEditButtons();
        EventTypeController.stubegru.modules.userUtils.updateAdminElements();
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
    static async renderListView(eventTypeList) {
        const allUsersList = await EventTypeController.stubegru.modules.userUtils.getAllUsers();
        let tableDataList = [];
        for (let eventTypeId in eventTypeList) {
            let eventType = eventTypeList[eventTypeId];
            let assigneeId = eventType.assigneesInternal ? eventType.assigneesInternal[0] : undefined;
            let assigneeName = (assigneeId && allUsersList[assigneeId]) ? allUsersList[assigneeId].name : "";
            //const isActive = eventType.isPortfolio ? "Ja" : "Nein";
            let buttonsColumn = `
                    <button class='event-type-plus-button btn btn-success' data-event-type-id='${eventType.id}' title="Neue Veranstaltung dieser Kategorie anlegen">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class='event-type-edit-button btn btn-default' data-event-type-id='${eventType.id}' title="Kategorie bearbeiten">
                        <i class='fa fa-pencil-alt'></i>
                    </button>
                    <button class='event-type-delete-button btn btn-danger' data-event-type-id='${eventType.id}' title="Kategorie löschen">
                        <i class='fa fa-times'></i>
                    </button>`;
            tableDataList.push({
                name: eventType.name,
                assignee: assigneeName,
                buttons: buttonsColumn
            });
        }
        //Add table data and refresh
        EventTypeView.sortableTable.setData(tableDataList, null);
        //Keep sorting state consistent (the table plugin does not care about this...)
        let sort = EventTypeView.sortableTable._sorting;
        sort.currentCol = sort.currentCol == '' ? "name" : sort.currentCol;
        sort.dir = sort.dir == '' ? "desc" : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
        EventTypeView.sortableTable.sortData(sort.currentCol, sort.dir);
    }
}
