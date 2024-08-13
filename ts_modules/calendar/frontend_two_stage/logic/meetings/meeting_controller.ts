import Alert from '../../../../../components/alert/alert.js';
import UserUtils from '../../../../../components/user_utils/user_utils.js';
import CalendarModule from '../calendar_module.js';
import { Meeting } from './meeting_service.js';

export default class MeetingController {

    meetingList: Meeting[];

    async init() {
        await this.refreshMeetingList();
        setInterval(this.refreshMeetingList, 1000 * 60 * 5); //Refresh meetingList every 5 minutes
    }

    async refreshMeetingList() {
        this.meetingList = await CalendarModule.meetingService.getAll();
    }

    getMeeting(meetingId: string) {
        return this.meetingList.find(e => e.id == meetingId);
    }


    /**
     * @returns {boolean} wether the current user has write permissions for calendar meetings
     */
    isCalendarWriteUser(): boolean {
        const writePermission = UserUtils.currentUser.permissionRequests.find(e => e.name == "MEETINGS_WRITE");
        return writePermission.access;
    }

    async clickOnMeetingHandler(meetingId: string) {
        let meeting = this.getMeeting(meetingId); //TODO:refresh from server?

        (meeting.teilnehmer && Object.hasOwn(meeting.teilnehmer, "id")) ?
            CalendarModule.meetingClientController.openAssignedMeeting(meeting.id) :
            this.openFreeMeeting(meeting.id);
    }

    async createMeeting(keepValues = false) {
        let m = CalendarModule.meetingView;

        m.setModalVisible(true);
        m.setModalTitle("Termin erstellen");
        if (!keepValues) { await m.resetAllForms(); }
        CalendarModule.meetingClientView.showAssignButtons(false, false, false, false);
        CalendarModule.meetingClientView.setClientVisible(false);
        m.enableFooterButtons(true, true, false, true);

        const createMeetingCallback = async () => {
            try {
                const meetingData = m.getMeetingDetailData();
                let resp = await CalendarModule.meetingService.create(meetingData);
                Alert.alertResp(resp, "Termin erstellen");
                await CalendarModule.calendarView.refresh();
                return resp;
            } catch (error) { Alert.alertError(error); }
        };

        m.setFooterSaveButtonEvent(async (event) => {
            let resp = await createMeetingCallback();
            m.setUnsavedChanges(false);

            if (event.target.id == "calendarSaveNextMeetingButton") {
                this.createMeeting(true);
            } else {
                m.setModalVisible(false);
            }
        });
    }

    async openFreeMeeting(meetingId) {
        let m = CalendarModule.meetingView;
        let isWrite = this.isCalendarWriteUser();

        m.setModalVisible(true);
        m.setModalTitle("Termindetails (Freier Termin)");
        await m.resetAllForms();
        CalendarModule.state.freeMeetingMode = true;

        const meeting = this.getMeeting(meetingId);
        m.setMeetingDetailData(meeting);

        let resp = await CalendarModule.meetingService.isBlock(meetingId);

        if (resp.blockId == UserUtils.currentUser.id) {
            //If meeting is blocked by yourself => remove block 
            await CalendarModule.meetingService.setBlock(meetingId, false);
            resp = await CalendarModule.meetingService.isBlock(meetingId);
            Alert.alertSimple("Die Terminblockierung wurde aufgehoben");
        }

        let isUnblocked = (resp.blockId == "0");
        if (!isUnblocked) { m.setInfoAlert(`Dieser Termin wird bereits von einem anderen Nutzer bearbeitet. Daher kann dieser Termin aktuell nicht vergeben werden. Der Termin ist aktuell gesperrt durch: ${resp.blockName}.`); }

        m.enableDetailMeetingForm(isWrite && isUnblocked);
        CalendarModule.meetingClientView.showAssignButtons(isUnblocked, false, false, false);
        CalendarModule.meetingClientView.setClientVisible(false);
        m.enableFooterButtons(isWrite && isUnblocked, false, isWrite && isUnblocked, true);

        m.setFooterSaveButtonEvent(async () => {
            try {
                let resp = await CalendarModule.meetingService.update(m.getMeetingDetailData());
                Alert.alertResp(resp, "Termin speichern");
                await CalendarModule.calendarView.refresh();
                m.setUnsavedChanges(false);
                m.setModalVisible(false);
            } catch (error) { Alert.alertError(error); }
        });

        m.setFooterDeleteButtonEvent(async () => {
            try {
                await Alert.deleteConfirm("Termin löschen", "Soll dieser Termin wirklich gelöscht werden?")
                let resp = await CalendarModule.meetingService.delete(meetingId);
                Alert.alertResp(resp, "Termin löschen");
                await CalendarModule.calendarView.refresh();
                m.setUnsavedChanges(false);
                m.setModalVisible(false);
            } catch (error) { Alert.alertError(error); }
        });

        CalendarModule.meetingClientView.setAssignAssignButtonEvent(() => {
            CalendarModule.meetingClientController.openMeetingForAssignment(meetingId);
        });

    }



}