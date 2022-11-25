class CalendarController {

    static modal = new CalendarModal();
    static view = new CalendarView('#calendarViewContainer');
    static search = new CalendarSearch();
    static freeMeetingMode = false;

    static async init() {
        let C = CalendarController;
        await C.modal.init();
        C.initFilterMenu();

        $("#calendarNewMeetingButton").on("click", C.createMeeting);
    }

    static initFilterMenu() {
        $("#calendarSettingsForeignToggle").on("change", function (event) {
            const showOthers = !$(this).prop('checked');
            CalendarController.view.showOthersMeetings(showOthers);
        });
        $("#calendarSettingsAssignedToggle").on("change", function (event) {
            const showAssigned = !$(this).prop('checked');
            CalendarController.view.showAssignedMeetings(showAssigned);
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
            m.setUnsavedChanges(false);
            C.openFreeMeeting(resp.dateId);
        });


        m.setFooterSaveCloseButtonEvent(async () => {
            await createMeetingCallback();
            m.setUnsavedChanges(false);
            m.setModalVisible(false);
        });
    }

    static openFreeMeeting(meetingId) {
        let C = CalendarController;
        let m = C.modal;
        let isWrite = C.isCalendarWriteUser();

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Freier Termin)");
        m.resetAllForms();
        CalendarController.freeMeetingMode = true;

        const meeting = Meeting.getById(meetingId);
        m.setMeetingDetailData(meeting);
        m.enableDetailMeetingForm(isWrite);

        m.showAssignButtons(true, false, false, false);
        m.setClientVisible(false);
        m.enableFooterButtons(isWrite, isWrite, isWrite, true);

        m.setFooterSaveButtonEvent(async () => {
            meeting.applyProperties(m.getMeetingDetailData());
            let resp = await meeting.updateOnServer();
            stubegru.modules.alerts.alert(resp, "Termin speichern");
            if (resp.status == "error") { throw new Error(resp.message); }
            await C.view.refresh();
            m.setUnsavedChanges(false);
            C.openFreeMeeting(meetingId);
        });

        m.setFooterDeleteButtonEvent(() => {
            deleteConfirm("Termin löschen", "Soll dieser Termin wirklich gelöscht werden?", async () => {
                let resp = await meeting.deleteOnServer();
                stubegru.modules.alerts.alert(resp, "Termin löschen");
                if (resp.status == "error") { throw new Error(resp.message); }
                await C.view.refresh();
                m.setUnsavedChanges(false);
                m.setModalVisible(false);
            });
        });

        m.setAssignAssignButtonEvent(() => {
            C.openMeetingForAssignment(meetingId);
        });

    }

    static openMeetingForAssignment(meetingId) {
        let C = CalendarController;
        let m = C.modal;
        let meeting = Meeting.getById(meetingId);
        m.resetAllForms();
        m.setModalVisible(true);
        m.setModalTitle("Kundendaten eintragen");
        m.setClientVisible(true);
        m.showAssignButtons(false, true, false, true);
        m.enableDetailMeetingForm(false);
        m.enableFooterButtons(false, false, false, true);
        m.setMeetingDetailData(meeting);
        m.setInfoAlert("Bitte als nächstes Kundendaten speichern oder abbrechen. Der Termin kann nicht bearbeitet oder gelöscht werden solange die Kundendaten bearbeitet werden.");
        m.initClientChannelDropdown(meeting.channel);

        //Assign save button
        m.setAssignSaveButtonEvent(async () => {
            let resp = await meeting.assignClient(m.getClientData());
            stubegru.modules.alerts.alert(resp, "Kundendaten speichern");
            if (resp.status == "error") { throw new Error(resp.message); }
            await C.view.refresh();
            m.setUnsavedChanges(false);
            C.openAssignedMeeting(meetingId);
        });

        //Assign cancel button
        m.setAssignCancelButtonEvent(() => {
            m.setUnsavedChanges(false);
            C.openFreeMeeting(meetingId);
        })
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

        m.setInfoAlert(`Dieser Termin ist bereits an einen Kunden vergeben. Bearbeiten des Termins ist nur möglich, nachdem die Kundendaten gelöscht wurden.`);

        m.setAssignDeleteButtonEvent(() => {
            deleteConfirm("Kundendaten löschen", "Sollen die Kundendaten wirklich gelöscht werden? Der Kunde und der Berater werden darüber per Mail informiert.", async () => {
                let resp = await meeting.deleteClient();
                stubegru.modules.alerts.alert(resp, "Kundendaten löschen");
                if (resp.status == "error") { throw new Error(resp.message); }
                await C.view.refresh();
                m.setUnsavedChanges(false);
                C.openFreeMeeting(meetingId);
            });
        });
    }


}