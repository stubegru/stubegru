import Alert from "../../../../../components/alert/alert.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarModule from "../calendar_module.js";

export default class MeetingClientController {
    init() { }

    async openMeetingForAssignment(meetingId) {
        let m = CalendarModule.meetingView;
        let meeting = CalendarModule.meetingController.getMeeting(meetingId); //TODO: refresh from server?

        if (meeting.teilnehmer && Object.hasOwn(meeting.teilnehmer, "id")) {
            Alert.alert({ title: "Termin kann nicht vergeben werden", text: "Dieser Termin wurde bereits an einen Kunden vergeben. Bitte Seite neu laden...", type: "error" });
            return;
        }

        //Check for block
        let resp = await CalendarModule.meetingService.isBlock(meeting.id);
        if (resp.blockId == "0" || resp.blockId == UserUtils.currentUser.id) {
            //Not blocked => block now and continue
            let resp2 = await CalendarModule.meetingService.setBlock(meeting.id, true);
            if (resp2.status != "success") {
                await m.showBlockError("unbekannt");
                CalendarModule.meetingController.openFreeMeeting(meetingId);
                return;
            }
            CalendarModule.meetingView.modal.addEventListener('hidden.bs.modal.remove-block', () => {
                CalendarModule.meetingService.setBlock(meeting.id, false);
                Alert.alertSimple("Die Terminblockierung wurde aufgehoben.");
                // TODO: what is happening here? $("#terminmodal").off('hidden.remove-block');
            });
        } else {
            await m.showBlockError(resp.blockName);
            CalendarModule.meetingController.openFreeMeeting(meetingId);
            return;
        }

        await m.resetAllForms();
        m.setModalVisible(true);
        m.setModalTitle("Kundendaten eintragen");
        CalendarModule.meetingClientView.setClientVisible(true);
        CalendarModule.meetingClientView.showAssignButtons(false, true, false, true);
        m.enableDetailMeetingForm(false);
        m.enableFooterButtons(false, false, false, true);
        m.setMeetingDetailData(meeting);
        m.setInfoAlert("Bitte als nächstes Kundendaten speichern oder abbrechen. Der Termin kann nicht bearbeitet oder gelöscht werden solange die Kundendaten bearbeitet werden.");
        CalendarModule.meetingClientView.initClientChannelDropdown(meeting.channel);

        //Assign save button
        CalendarModule.meetingClientView.setAssignSaveButtonEvent(async () => {
            try {
                CalendarModule.meetingClientView.assignFeedbackModal.resetAndShow();
                const clientData = CalendarModule.meetingClientView.getClientData();
                let resp = await CalendarModule.meetingClientService.assignClient(clientData);
                CalendarModule.meetingClientView.assignFeedbackModal.showFeedback(resp);

                await CalendarModule.calendarView.refresh();
                m.setUnsavedChanges(false);
                // TODO: what is happening here? $("#terminmodal").off('hidden.remove-block');
                this.openAssignedMeeting(meetingId);
            } catch (error) { Alert.alertError(error); }
        });

        //Assign cancel button
        CalendarModule.meetingClientView.setAssignCancelButtonEvent(async () => {
            m.setUnsavedChanges(false);
            await CalendarModule.meetingService.setBlock(meeting.id, false);
            // TODO: what is happening here? $("#terminmodal").off('hidden.remove-block');
            CalendarModule.meetingController.openFreeMeeting(meetingId);
        })
    }

    async openAssignedMeeting(meetingId) {
        let m = CalendarModule.meetingView;
        let cv = CalendarModule.meetingClientView;

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Termin vergeben)");
        await m.resetAllForms();

        const meeting = CalendarModule.meetingController.getMeeting(meetingId);
        m.setMeetingDetailData(meeting);
        m.enableDetailMeetingForm(false);

        cv.showAssignButtons(false, false, CalendarModule.meetingController.isCalendarWriteUser(), false);

        cv.setClientVisible(true);
        cv.enableClientForm(false);
        cv.setClientData(meeting.teilnehmer);

        m.enableFooterButtons(false, false, false, true);

        m.setInfoAlert(`Dieser Termin ist bereits an einen Kunden vergeben. Bearbeiten des Termins ist nur möglich, nachdem die Kundendaten gelöscht wurden.`);

        cv.setAssignDeleteButtonEvent(async () => {
            try {
                let confirmResp = await Alert.deleteConfirm("Kundendaten löschen", "Sollen die Kundendaten wirklich gelöscht werden? Der Kunde und der Berater werden darüber per Mail informiert.");
                if (confirmResp.isConfirmed) {
                    let resp = await CalendarModule.meetingClientService.deleteClient(meetingId);
                    resp.mode = "alert";
                    await Stubegru.utils.wait(200); //Wait until the delete confirm alert is closed
                    Alert.alertResp(resp, "Kundendaten löschen");
                    if (resp.status == "error") { throw new Error(resp.message); }
                    await CalendarModule.calendarView.refresh();
                    m.setUnsavedChanges(false);
                    CalendarModule.meetingController.openFreeMeeting(meetingId);
                }
            } catch (error) { Alert.alertError(error); }
        });
    }
}