class CalendarController {

    static modal = new CalendarModal();
    static view = new CalendarView('#calendarViewContainer');

    static async init() {
        let C = CalendarController;
        await C.modal.init();

        $("#calendarNewMeetingButton").on("click", C.createMeeting);

        $("#calendarSettingsForeignToggle").on("change", function (event) {
            console.log($(this).prop('checked'));
        });

        $(document).on('click', '#calendarSettingsDropdown', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    /**
     * @returns {boolean} wether the current user has write permissions for calendar meetings
     */
    static isCalendarWriteUser() {
        const writePermission = stubegru.modules.userUtils.permissionRequests.find(e => e.name == "MEETINGS_WRITE");
        return writePermission.access;
    }

    static clickOnMeetingHandler(meeting) {
        (meeting.teilnehmer && meeting.teilnehmer != "") ?
            CalendarController.openAssignedMeeting(meeting.id) :
            CalendarController.openFreeMeeting(meeting.id);
    }

    static createMeeting() {
        let C = CalendarController;
        let m = C.modal;

        m.setModalVisible(true);
        m.setModalTitle("Termin erstellen");
        m.resetAllForms();
        m.showAssignButtons(false, false, false, false);
        m.setClientVisible(false);
        m.enableFooterButtons(true, true, false, true);

        const createMeetingCallback = async () => {
            let resp = await Meeting.createOnServer(m.getMeetingDetailData());
            stubegru.modules.alerts.alert(resp, "Termin erstellen");
            if (resp.status == "error") { throw new Error(resp.message); }
            await C.view.refresh();
            return resp;
        };

        m.setFooterSaveButtonEvent(async () => {
            let resp = await createMeetingCallback();
            C.openFreeMeeting(resp.dateId);
        });


        m.setFooterSaveCloseButtonEvent(async () => {
            await createMeetingCallback();
            m.setModalVisible(false);
        });
    }

    static openFreeMeeting(meetingId) {
        let C = CalendarController;
        let m = C.modal;
        let isWrite = C.isCalendarWriteUser();

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Freier Termin");
        m.resetAllForms();

        const meeting = Meeting.getById(meetingId);
        m.setMeetingDetailData(meeting);
        m.enableDetailMeetingForm(isWrite);

        m.showAssignButtons(true, false, false, false);
        m.setClientVisible(false);
        m.enableFooterButtons(isWrite, isWrite, isWrite, true);
    }

    static openAssignedMeeting(meetingId) {
        let C = CalendarController;
        let m = C.modal;

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Termin vergeben)");
        m.resetAllForms();

        const meeting = Meeting.getById(meetingId);
        m.setMeetingDetailData(meeting);
        m.enableDetailMeetingForm(false);

        m.showAssignButtons(false, false, true, false);

        m.setClientVisible(true);
        m.enableClientForm(false);
        m.setClientData(meeting.teilnehmer);

        m.enableFooterButtons(false, false, false, true);

        m.setInfoAlert(`<i class="fas fa-info-circle"></i> Dieser Termin ist bereits an einen Kunden vergeben. Bearbeiten des Termins ist nur möglich, nachdem die Kundendaten gelöscht wurden.`);
    }


}