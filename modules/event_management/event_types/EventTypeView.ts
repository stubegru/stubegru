class EventTypeView {

    //@ts-expect-error
    static stubegru = document.stubegru as StubegruObject;
    static eventTypeList: EventTypeList = {};

    static init() {
        this.refreshListView(); //Init event view
        setInterval(this.refreshListView, 1000 * 60 * 15); //Refresh view every 15 minutes

        //Reset modal on hide
        let modal = document.getElementById("eventTypeModal");
        modal.addEventListener("hidden.bs.modal", this.resetModalForm);
    }

    static resetModalForm() {
        let form = document.getElementById("eventForm") as HTMLFormElement;
        form.reset();
    }


    static editEventType(eventTypeId: string) {

        let eventType = this.eventTypeList[eventTypeId];

        //TODO set inputs elements with object properties...

        //@ts-expect-error Show modal
        $("#eventTypeModal").modal("show");
    }




    static async refreshListView() {

        let eventTypeList = await EventTypeController.getAll();
        this.eventTypeList = eventTypeList;

        let listElement = document.getElementById("eventTypeList") as HTMLElement;
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
            this.stubegru.modules.alerts.deleteConfirm("Abwesenheit löschen", "Soll diese Abwesenheit wirklich gelöscht werden?", async () => await EventTypeController.delete(eventTypeId));
        }


        //register edit button actions
        let editBtnList = document.querySelectorAll(".event-type-edit-button");
        for (const btn of editBtnList) {
            let eventTypeId = btn.getAttribute("data-event-type-id");
            this.editEventType(eventTypeId);
        }

        this.stubegru.modules.userUtils.updateAdminElements()
    }

}