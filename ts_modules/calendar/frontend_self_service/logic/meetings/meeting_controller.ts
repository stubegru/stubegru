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



    async clickOnMeetingHandler(meetingId: string) {
        let meeting = await CalendarModule.meetingService.get(meetingId);
        this.openFreeMeeting(meeting.id);
    }


    async openFreeMeeting(meetingId) {
        let m = CalendarModule.meetingView;

        m.setModalVisible(true);
        m.setModalTitle("Termindetails");
        await m.resetAllForms();

        const meeting = this.getMeeting(meetingId);
        m.setMeetingDetailData(meeting);

        let resp = await CalendarModule.meetingService.isBlock(meetingId);
        let isUnblocked = !resp.isBlocked;
        m.enableDetailMeetingForm(false);
        CalendarModule.meetingClientView.showAssignButtons(isUnblocked, false, false, false);
        CalendarModule.meetingClientView.setClientVisible(false);

        if (resp.isBlocked) {
            m.setInfoAlert(`Dieser Termin wird aktuell von einem anderen Nutzer bearbeitet. Daher kann dieser Termin aktuell nicht vergeben werden. Bitte buchen Sie einen anderen Termin oder versuchen Sie es zu einem späteren Zeitpunkt nochmal!`);
            await CalendarModule.calendarView.refresh();
            return;
        }

        CalendarModule.meetingClientView.setAssignAssignButtonEvent(() => {
            CalendarModule.meetingClientController.openMeetingForAssignment(meetingId);
        });

    }



}