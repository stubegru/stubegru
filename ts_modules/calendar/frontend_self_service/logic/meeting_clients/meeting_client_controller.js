import Alert from "../../../../../components/alert/alert.js";
import CalendarModule from "../calendar_module.js";
export default class MeetingClientController {
    init() { }
    async openMeetingForAssignment(meetingId) {
        let m = CalendarModule.meetingView;
        let meeting = await CalendarModule.meetingService.get(meetingId);
        if (meeting.teilnehmer && Object.hasOwn(meeting.teilnehmer, "id")) {
            Alert.alert({ title: "Termin kann nicht vergeben werden", text: "Dieser Termin wurde bereits an einen Kunden vergeben. Bitte Seite neu laden...", type: "error" });
            return;
        }
        //Check for block //TODO: Real block management
        let resp = await CalendarModule.meetingService.isBlock(meeting.id);
        if (resp.blockId == "0") {
            //Not blocked => block now and continue
            let resp2 = await CalendarModule.meetingService.setBlock(meeting.id, true);
            if (resp2.status != "success") {
                await m.showBlockError();
                CalendarModule.meetingController.openFreeMeeting(meetingId);
                return;
            }
            CalendarModule.meetingView.modal.addEventListener('hidden.bs.modal.remove-block', () => {
                CalendarModule.meetingService.setBlock(meeting.id, false);
                Alert.alertSimple("Die Terminblockierung wurde aufgehoben.");
                CalendarModule.meetingView.modal.removeEventListener('hidden.bs.modal.remove-block');
            });
        }
        else {
            await m.showBlockError();
            return;
        }
        await m.resetAllForms();
        m.setModalVisible(true);
        m.setModalTitle("Termin buchen");
        CalendarModule.meetingClientView.setClientVisible(true);
        CalendarModule.meetingClientView.showAssignButtons(false, true, false, true);
        m.enableDetailMeetingForm(false);
        m.setMeetingDetailData(meeting);
        m.setInfoAlert("Der Termin wurde für Sie reserviert, bis Sie alle Daten eingetragen haben.<br> Falls Sie die Terminbuchung abbrechen möchten, nutzen Sie bitte unbedingt den <b>'Terminbuchung Abbrechen'</b> Button.");
        CalendarModule.meetingClientView.initClientChannelDropdown(meeting.channel);
        //Assign save button
        CalendarModule.meetingClientView.setAssignSaveButtonEvent(async () => {
            try {
                CalendarModule.meetingClientView.assignFeedbackModal.resetAndShow();
                const clientData = CalendarModule.meetingClientView.getClientData();
                let resp = await CalendarModule.meetingClientService.assignClient(meetingId, clientData);
                CalendarModule.meetingClientView.assignFeedbackModal.showFeedback(resp, meeting);
                await CalendarModule.calendarView.refresh();
                m.setUnsavedChanges(false);
                CalendarModule.meetingView.modal.removeEventListener('hidden.bs.modal.remove-block');
                m.setModalVisible(false);
            }
            catch (error) {
                Alert.alertError(error);
            }
        });
        //Assign cancel button
        CalendarModule.meetingClientView.setAssignCancelButtonEvent(async () => {
            m.setUnsavedChanges(false);
            await CalendarModule.meetingService.setBlock(meeting.id, false);
            CalendarModule.meetingView.modal.removeEventListener('hidden.bs.modal.remove-block');
            CalendarModule.meetingController.openFreeMeeting(meetingId);
        });
    }
}
