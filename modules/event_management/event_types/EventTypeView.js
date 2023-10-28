class EventTypeView {
    static init() {
        EventTypeView.refreshListView(); //Init event view
        setInterval(EventTypeView.refreshListView, 1000 * 60 * 15); //Refresh view every 15 minutes
        //Reset modal on hide
        let modal = document.getElementById("eventTypeModal");
        modal.addEventListener("hidden.bs.modal", EventTypeView.resetModalForm);
        //Register new event type button
        let newBtn = document.getElementById("eventTypeNewButton");
        newBtn.addEventListener("click", EventTypeView.newEventType);
    }
    static newEventType() {
        EventTypeView.resetModalForm();
        EventTypeView.setModalVisible(true);
    }
    static resetModalForm() {
        let form = document.getElementById("eventTypeModalForm");
        form.reset();
    }
    static editEventType(eventTypeId) {
        let eventType = EventTypeView.eventTypeList[eventTypeId];
        //TODO set inputs elements with object properties...
        EventTypeView.setModalVisible(true);
    }
    static setModalVisible(visible) {
        //@ts-expect-error
        $("#eventTypeModal").modal(visible ? "show" : "hide");
    }
    static async refreshListView() {
        let eventTypeList = await EventTypeController.refreshEventTypeList();
        EventTypeView.eventTypeList = eventTypeList;
        let listElement = document.getElementById("eventTypeList");
        listElement.innerHTML = "";
        for (let eventTypeId in eventTypeList) {
            let eventType = eventTypeList[eventTypeId];
            let tableRow = `<tr><td>${eventType.name}</td><td><button class='event-edit-button btn btn-default permission-EVENT_TYPE_WRITE permission-required' data-event-type-id='${eventType.id}'><i class='fa fa-pencil-alt'></i></button></td><td><button class='event-delete-button btn btn-danger permission-EVENT_TYPE_WRITE permission-required' data-event-type-id='${eventType.id}'><i class='fa fa-times'></i></button></td></tr>`;
            listElement.innerHTML += tableRow;
        }
        //register delete button actions
        let deleteBtnList = document.querySelectorAll(".event-type-delete-button");
        for (const btn of deleteBtnList) {
            let eventTypeId = btn.getAttribute("data-event-type-id");
            EventTypeView.stubegru.modules.alerts.deleteConfirm("Abwesenheit löschen", "Soll diese Abwesenheit wirklich gelöscht werden?", async () => await EventTypeController.delete(eventTypeId));
        }
        //register edit button actions
        let editBtnList = document.querySelectorAll(".event-type-edit-button");
        for (const btn of editBtnList) {
            let eventTypeId = btn.getAttribute("data-event-type-id");
            EventTypeView.editEventType(eventTypeId);
        }
        EventTypeView.stubegru.modules.userUtils.updateAdminElements();
    }
}
//@ts-expect-error
EventTypeView.stubegru = window.stubegru;
EventTypeView.eventTypeList = {};
EventTypeView.init();
