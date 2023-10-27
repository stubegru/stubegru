class EventTypeView {
    static init() {
        this.refreshListView(); //Init event view
        setInterval(this.refreshListView, 1000 * 60 * 15); //Refresh view every 15 minutes
        //Reset modal on hide
        let modal = document.getElementById("eventTypeModal");
        modal.addEventListener("hidden.bs.modal", this.resetModalForm);
    }
    static resetModalForm() {
        let form = document.getElementById("eventForm");
        form.reset();
    }
    static editEventType(eventTypeId) {
        let eventType = this.eventTypeList[eventTypeId];
        //TODO set inputs elements with object properties...
        //show modal
        //$("#eventTypeModal").modal("show"); //TODO use typescript compatible solution
    }
    static async refreshListView() {
        let eventTypeList = await EventTypeController.getAll();
        this.eventTypeList = eventTypeList;
        let listElement = document.getElementById("eventTypeList");
        listElement.innerHTML = "";
        for (let eventTypeId in eventTypeList) {
            let eventType = eventTypeList[eventTypeId];
            let tableRow = `<tr><td>${eventType.name}</td><td><button class='event-edit-button btn btn-default permission-EVENT_TYPE_WRITE permission-required' data-event-id='${eventType.id}'><i class='fa fa-pencil-alt'></i></button></td><td><button class='event-delete-button btn btn-danger permission-EVENT_TYPE_WRITE permission-required' data-event-id='${eventType.id}'><i class='fa fa-times'></i></button></td></tr>`;
            listElement.innerHTML += tableRow;
        }
        //register delete button actions
        // $(".event-delete-button").on("click", function () {
        //     let eventId = $(this).attr("data-event-id");
        //     deleteEvent(eventId);
        // })
        // //register edit button actions
        // $(".event-edit-button").on("click", function () {
        //     let eventId = $(this).attr("data-event-id");
        //     editEventType(eventId);
        // })
        // stubegru.modules.userUtils.updateAdminElements()
    }
}
EventTypeView.eventTypeList = {};
