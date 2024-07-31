import Alert from '../../../../components/alert/alert.js';
import Stubegru from '../../../../components/stubegru_core/logic/stubegru.js';
import Meeting from './meeting_service.js';

export default class CalendarController {

    
    freeMeetingMode = false;

    async init() {
        

        
    }


   

    /**
     * @returns {boolean} wether the current user has write permissions for calendar meetings
     */
    isCalendarWriteUser(): boolean {
        //@ts-expect-error TODO: use new typescript stubegru-core API for userUtils
        const writePermission = stubegru.modules.userUtils.permissionRequests.find(e => e.name == "MEETINGS_WRITE");
        return writePermission.access;
    }

    async clickOnMeetingHandler(meetingId) {
        let meeting = Meeting.getById(meetingId);
        await meeting.updateFromServer();

        (meeting.teilnehmer && meeting.teilnehmer != "") ?
            this.openAssignedMeeting(meeting.id) :
            this.openFreeMeeting(meeting.id);
    }

    async createMeeting(keepValues = false) {
        let m = this.modal;

        m.setModalVisible(true);
        m.setModalTitle("Termin erstellen");
        if (!keepValues) { await m.resetAllForms(); }
        m.showAssignButtons(false, false, false, false);
        m.setClientVisible(false);
        m.enableFooterButtons(true, true, false, true);

        const createMeetingCallback = async () => {
            let resp = await Meeting.createOnServer(m.getMeetingDetailData());
            Alert.alertResp(resp, "Termin erstellen");
            if (resp.status == "error") { throw new Error(resp.message); }
            await this.view.refresh();
            return resp;
        };

        m.setFooterSaveButtonEvent(async (event) => {
            let resp = await createMeetingCallback();
            m.setUnsavedChanges(false);

            if (event.originalEvent.submitter.id == "calendarSaveNextMeetingButton") {
                this.createMeeting(true);
            } else {
                m.setModalVisible(false);
            }
        });
    }

    async openFreeMeeting(meetingId) {
        let C = CalendarController;
        let m = this.modal;
        let isWrite = this.isCalendarWriteUser();

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Freier Termin)");
        await m.resetAllForms();
        this.freeMeetingMode = true;

        const meeting = Meeting.getById(meetingId);
        m.setMeetingDetailData(meeting);

        let resp = await meeting.isBlock();

        //@ts-expect-error TODO: use new typescript stubegru-core API for current user id
        if (resp.blockId == stubegru.currentUser.id) {
            //If meeting is blocked by yourself => remove block 
            await meeting.setBlock(false);
            resp = await meeting.isBlock();
            Alert.alertSimple("Die Terminblockierung wurde aufgehoben");
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
            Alert.alertResp(resp, "Termin speichern");
            if (resp.status == "error") { throw new Error(resp.message); }
            await this.view.refresh();
            m.setUnsavedChanges(false);
            m.setModalVisible(false);
        });

        m.setFooterDeleteButtonEvent(async () => {
            await Alert.deleteConfirm("Termin löschen", "Soll dieser Termin wirklich gelöscht werden?")
            let resp = await meeting.deleteOnServer();
            Alert.alertResp(resp, "Termin löschen");
            if (resp.status == "error") { throw new Error(resp.message); }
            await this.view.refresh();
            m.setUnsavedChanges(false);
            m.setModalVisible(false);
        });

        m.setAssignAssignButtonEvent(() => {
            this.openMeetingForAssignment(meetingId);
        });

    }

    async openMeetingForAssignment(meetingId) {
        let C = CalendarController;
        let m = this.modal;
        let meeting = Meeting.getById(meetingId);

        await meeting.updateFromServer();
        if (meeting.teilnehmer && meeting.teilnehmer != "") {
            Alert.alert({ title: "Termin kann nicht vergeben werden", text: "Dieser Termin wurde bereits an einen Kunden vergeben. Bitte Seite neu laden...", type: "error" });
            return;
        }

        //Check for block
        let resp = await meeting.isBlock();
        //@ts-expect-error TODO: use new typescript stubegru-core API for userUtils
        if (resp.blockId == "0" || resp.blockId == stubegru.currentUser.id) {
            //Not blocked => block now and continue
            resp = await meeting.setBlock(true);
            if (resp.status != "success") {
                m.showBlockError("ubekannt", () => {
                    this.openFreeMeeting(meetingId);
                })
                return;
            }
            //@ts-expect-error TODO: Unterstand and fix events...
            this.modal.modal.addEventListener('hidden.bs.modal.remove-block', () => {
                meeting.setBlock(false);
                Alert.alertSimple("Die Terminblockierung wurde aufgehoben.");
                // TODO: what is happening here? $("#terminmodal").off('hidden.remove-block');
            });
        } else {
            m.showBlockError(resp.blockName, () => {
                this.openFreeMeeting(meetingId);
            });
            return;
        }

        await m.resetAllForms();
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
            this.view.assignFeedbackModal.resetAndShow();
            let resp = await meeting.assignClient(m.getClientData());
            this.view.assignFeedbackModal.showFeedback(resp);

            await this.view.refresh();
            m.setUnsavedChanges(false);
            // TODO: what is happening here? $("#terminmodal").off('hidden.remove-block');
            this.openAssignedMeeting(meetingId);
        });

        //Assign cancel button
        m.setAssignCancelButtonEvent(async () => {
            m.setUnsavedChanges(false);
            await meeting.setBlock(false);
            // TODO: what is happening here? $("#terminmodal").off('hidden.remove-block');
            this.openFreeMeeting(meetingId);
        })
    }

    async openAssignedMeeting(meetingId) {
        let C = CalendarController;
        let m = this.modal;

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Termin vergeben)");
        await m.resetAllForms();

        const meeting = Meeting.getById(meetingId);
        m.setMeetingDetailData(meeting);
        m.enableDetailMeetingForm(false);

        m.showAssignButtons(false, false, this.isCalendarWriteUser(), false);

        m.setClientVisible(true);
        m.enableClientForm(false);
        m.setClientData(meeting.teilnehmer);

        m.enableFooterButtons(false, false, false, true);

        m.setInfoAlert(`Dieser Termin ist bereits an einen Kunden vergeben. Bearbeiten des Termins ist nur möglich, nachdem die Kundendaten gelöscht wurden.`);

        m.setAssignDeleteButtonEvent(async () => {
            await Alert.deleteConfirm("Kundendaten löschen", "Sollen die Kundendaten wirklich gelöscht werden? Der Kunde und der Berater werden darüber per Mail informiert.");
            let resp = await meeting.deleteClient();
            resp.mode = "alert";
            await Stubegru.utils.wait(200); //Wait until the delete confirm alert is closed
            Alert.alertResp(resp, "Kundendaten löschen");
            if (resp.status == "error") { throw new Error(resp.message); }
            await this.view.refresh();
            m.setUnsavedChanges(false);
            this.openFreeMeeting(meetingId);
        });
    }

}