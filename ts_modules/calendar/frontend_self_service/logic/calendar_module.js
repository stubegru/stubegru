import CalendarView from "./calendar/calendar_view.js";
import MeetingClientController from "./meeting_clients/meeting_client_controller.js";
import MeetingClientService from "./meeting_clients/meeting_client_service.js";
import MeetingClientView from "./meeting_clients/meeting_client_view.js";
import MeetingController from "./meetings/meeting_controller.js";
import MeetingService from "./meetings/meeting_service.js";
import MeetingView from "./meetings/meeting_view.js";
class CalendarModule {
    static state = {
        unsavedChanges: false,
    };
    static meetingService;
    static meetingClientService;
    static calendarView;
    static meetingView;
    static meetingClientView;
    static meetingController;
    static meetingClientController;
    static async init() {
        CalendarModule.meetingService = new MeetingService();
        CalendarModule.meetingClientService = new MeetingClientService();
        CalendarModule.calendarView = new CalendarView();
        CalendarModule.meetingView = new MeetingView();
        CalendarModule.meetingClientView = new MeetingClientView();
        CalendarModule.meetingController = new MeetingController();
        CalendarModule.meetingClientController = new MeetingClientController();
        await CalendarModule.calendarView.init();
        await CalendarModule.meetingView.init();
        await CalendarModule.meetingClientView.init();
        await CalendarModule.meetingController.init();
        await CalendarModule.meetingClientController.init();
    }
}
export default CalendarModule;
await CalendarModule.init();
