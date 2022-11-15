class CalendarController {

    static modal = new CalendarModal();
    static view = new CalendarView('#calendarViewContainer');

    static async init() {

        await Meeting.fetchMeetings();
        let meetingList = Meeting.meetingList;
        CalendarController.view.addMeetings(meetingList);

        //TODO use new room and template functions
        Room.fetchRooms();
        getTemplates();
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
        CalendarController.modal.resetAllForms();
        CalendarController.modal.setMeetingDetailData(meeting);
        //TODO check if meeting has clientdata
        CalendarController.modal.setClientData(meeting.teilnehmer);
        CalendarController.modal.setModalVisible(true);
    }


}