class CalendarController {

    static modal = new CalendarModal();
    static view = new CalendarView('#calendarViewContainer');

    static async init() {

        await Meeting.fetchMeetings();
        let meetingList = Meeting.meetingList;
        CalendarController.view.addMeetings(meetingList);

        //TODO use new room and template functions
        getRooms();
        getTemplates();
        //TODO use new get advisor function
        CalendarController.modal.initAdvisorDropdown();
        CKEDITOR.replace('mailTemplateEditor'); //Richtexteditor initialisieren

        $("#terminmodal").on('hidden.bs.modal', CalendarController.modal.resetAllForms); //Reset modal forms on hide event

        $("#calendarSettingsForeignToggle").on("change", function (event) {
            console.log($(this).prop('checked'));
        });

        $(document).on('click', '#calendarSettingsDropdown', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });


       
    }

    static clickOnMeetingHandler(meeting) {
        //Show event details in modal
        CalendarController.modal.showMeetingData(meeting);
        //TODO check if meeting has clientdata
        CalendarController.modal.showClientData(meeting.teilnehmer);

        //TODO use new room and template functions
        resetRoomForm();
        resetTemplateForm();

        CalendarController.modal.showModal(true);
    }


}