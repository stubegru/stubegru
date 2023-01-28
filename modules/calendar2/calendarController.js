class CalendarController {

    static modal = new CalendarModal();
    static view = new CalendarView('#calendarViewContainer');
    static search = new CalendarSearch();
    static freeMeetingMode = false;

    static async init() {
        let C = CalendarController;
        await C.modal.init();
        C.initFilterMenu();

        $("#calendarNewMeetingButton").on("click", () => C.createMeeting());
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

    static async clickOnMeetingHandler(meetingId) {
        let meeting = Meeting.getById(meetingId);
        await meeting.updateFromServer();

        (meeting.teilnehmer && meeting.teilnehmer != "") ?
            CalendarController.openAssignedMeeting(meeting.id) :
            CalendarController.openFreeMeeting(meeting.id);
    }

    static createMeeting(keepValues) {
        let C = CalendarController;
        let m = C.modal;

        m.setModalVisible(true);
        m.setModalTitle("Termin erstellen");
        if (!keepValues) { m.resetAllForms(); }
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

        m.setFooterSaveButtonEvent(async (event) => {
            let resp = await createMeetingCallback();
            m.setUnsavedChanges(false);

            if (event.originalEvent.submitter.id == "calendarSaveNextMeetingButton") {
                C.createMeeting(true);
            } else {
                m.setModalVisible(false);
            }
        });
    }

    static async openFreeMeeting(meetingId) {
        let C = CalendarController;
        let m = C.modal;
        let isWrite = C.isCalendarWriteUser();

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Freier Termin)");
        m.resetAllForms();
        CalendarController.freeMeetingMode = true;

        const meeting = Meeting.getById(meetingId);
        m.setMeetingDetailData(meeting);

        let resp = await meeting.isBlock();

        if (resp.blockId == stubegru.currentUser.id) {
            //If meeting is blocked by yourself => remove block 
            await meeting.setBlock(false);
            resp = await meeting.isBlock();
            stubegru.modules.alerts.alert("Die Terminblockierung wurde aufgehoben");
        }

        let isUnblocked = resp.blockId == "0";
        if (!isUnblocked) { m.setInfoAlert(`Dieser Termin wird bereits von einem anderen Nutzer bearbeitet. Daher kann dieser Termin aktuell nicht vergeben werden. Der Termin ist aktuell gesperrt durch: ${resp.blockName}.`); }

        m.enableDetailMeetingForm(isWrite && isUnblocked);
        m.showAssignButtons(isUnblocked, false, false, false);
        m.setClientVisible(false);
        m.enableFooterButtons(isWrite && isUnblocked, false, isWrite && isUnblocked, true);

        m.setFooterSaveButtonEvent(async () => {
            meeting.applyProperties(m.getMeetingDetailData());
            let resp = await meeting.updateOnServer();
            stubegru.modules.alerts.alert(resp, "Termin speichern");
            if (resp.status == "error") { throw new Error(resp.message); }
            await C.view.refresh();
            m.setUnsavedChanges(false);
            m.setModalVisible(false);
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

    static async openMeetingForAssignment(meetingId) {
        let C = CalendarController;
        let m = C.modal;
        let meeting = Meeting.getById(meetingId);

        //Check for block
        let resp = await meeting.isBlock();
        if (resp.blockId == "0" || resp.blockId == stubegru.currentUser.id) {
            //Not blocked => block now and continue
            resp = await meeting.setBlock(true);
            if (resp.status != "success") {
                m.showBlockError("ubekannt", () => {
                    C.openFreeMeeting(meetingId);
                })
                return;
            }
            $("#terminmodal").on('hidden.bs.modal.remove-block', () => {
                meeting.setBlock(false);
                stubegru.modules.alerts.alert("Die Terminblockierung wurde aufgehoben.");
                $("#terminmodal").off('hidden.remove-block');
            });
        } else {
            m.showBlockError(resp.blockName, () => {
                C.openFreeMeeting(meetingId);
            });
            return;
        }

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
            $("#terminmodal").off('hidden.remove-block');
            C.openAssignedMeeting(meetingId);
        });

        //Assign cancel button
        m.setAssignCancelButtonEvent(async () => {
            m.setUnsavedChanges(false);
            await meeting.setBlock(false);
            $("#terminmodal").off('hidden.remove-block');
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

        m.showAssignButtons(false, false, C.isCalendarWriteUser(), false);

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