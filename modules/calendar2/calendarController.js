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
        m.setModalTitle("Termindetails (Freier Termin)");
        m.resetAllForms();

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
            C.openFreeMeeting(meetingId);
        });

        m.setFooterDeleteButtonEvent(() => {
            deleteConfirm("Termin löschen", "Soll dieser Termin wirklich gelöscht werden?", async () => {
                let resp = await meeting.deleteOnServer();
                stubegru.modules.alerts.alert(resp, "Termin löschen");
                if (resp.status == "error") { throw new Error(resp.message); }
                await C.view.refresh();
                m.setModalVisible(false);
            });
        });

        m.setAssignAssignButtonEvent(() => {
            C.openMeetingForAssignment(meetingId);
        });

        m.setMeetingDetailChangeListener(() => {
            m.showAssignButtons(false, false, false, false);
            m.setInfoAlert("Es wurden Änderungen am Termin vorgenommen. Bitte Termin speichern bevor er an einen Kunden vergeben werden kann.")
        })
    }

    static openMeetingForAssignment(meetingId) {
        let C = CalendarController;
        let m = C.modal;
        let meeting = Meeting.getById(meetingId);
        m.resetClientForm();
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
            C.openAssignedMeeting(meetingId);
        });

        //Assign cancel button
        m.setAssignCancelButtonEvent(() => {
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
            deleteConfirm("Kundendaten löschen", "Sollen die Kundendaten wirklich gelöscht werden? Der Kunde und der Berater werden darüber per Mail informiert.", async() => {
                let resp = await meeting.deleteClient();
                stubegru.modules.alerts.alert(resp, "Kundendaten löschen");
                if (resp.status == "error") { throw new Error(resp.message); }
                await C.view.refresh();
                C.openFreeMeeting(meetingId);
            });
        });
    }


}