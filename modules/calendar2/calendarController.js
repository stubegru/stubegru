class CalendarController {

    static modal = new CalendarModal();
    static view = new CalendarView('#calendarViewContainer');

    static async init() {

        //Load meetings to view
        await Meeting.fetchMeetings();
        let meetingList = Meeting.meetingList;
        CalendarController.view.addMeetings(meetingList);

        await CalendarController.modal.init();

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

        if(meeting.teilnehmer && meeting.teilnehmer != "") {
            CalendarController.modal.setClientData(meeting.teilnehmer);
            CalendarController.modal.setClientVisible(true);
        }

        CalendarController.modal.setModalVisible(true);
    }


}