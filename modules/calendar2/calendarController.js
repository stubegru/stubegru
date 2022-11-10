class CalendarController {

    static modal = new CalendarModal();
    static view = new CalendarView('#calendarViewContainer');

    static init() {



        //loadDates();
        getRooms();
        getTemplates();
        getAdvisorsForCalendar();
        CKEDITOR.replace('mailTemplateEditor'); //Richtexteditor initialisieren

        $("#terminmodal").on('hidden.bs.modal', resetCalendarForm); //Reset terminmodal wenn es ausgeblendet wird

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
        CalendarController.modal.showClientData(meeting.teilnehmer);

        resetRoomForm();
        resetTemplateForm();

        CalendarController.modal.showModal(true);
    }


}