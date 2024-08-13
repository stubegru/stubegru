import CalendarView from "./calendar/calendar_view.js";
import MailTemplateController from "./mail_templates/mail_template_controller.js";
import MailTemplateService from "./mail_templates/mail_template_service.js";
import MailTemplateView from "./mail_templates/mail_template_view.js";
import MeetingClientController from "./meeting_clients/meeting_client_controller.js";
import MeetingClientService from "./meeting_clients/meeting_client_service.js";
import MeetingClientView from "./meeting_clients/meeting_client_view.js";
import MeetingController from "./meetings/meeting_controller.js";
import MeetingService from "./meetings/meeting_service.js";
import MeetingView from "./meetings/meeting_view.js";
import RoomController from "./rooms/room_controller.js";
import RoomService from "./rooms/room_service.js";
import RoomView from "./rooms/room_view.js";

export default class CalendarModule {

    static state = {
        freeMeetingMode: false,
        unsavedChanges: false,
        blockedMeeting: false,
        assignedVisible: true,
        othersVisible: true,
    }

    static meetingService: MeetingService;
    static meetingClientService: MeetingClientService;
    static roomService: RoomService;
    static mailTemplateService: MailTemplateService;

    static meetingController: MeetingController;
    static meetingClientController: MeetingClientController;
    static roomController: RoomController;
    static mailTemplateController: MailTemplateController;

    static calendarView: CalendarView;
    static meetingView: MeetingView;
    static meetingClientView: MeetingClientView;
    static roomView: RoomView;
    static mailTemplateView: MailTemplateView;

    static async init() {
        CalendarModule.meetingService = new MeetingService();
        CalendarModule.meetingClientService = new MeetingClientService();
        CalendarModule.roomService = new RoomService();
        CalendarModule.mailTemplateService = new MailTemplateService();

        CalendarModule.meetingController = new MeetingController();
        await CalendarModule.meetingController.init();
        CalendarModule.meetingClientController = new MeetingClientController();
        await CalendarModule.meetingClientController.init();
        CalendarModule.roomController = new RoomController();
        await CalendarModule.roomController.init();
        CalendarModule.mailTemplateController = new MailTemplateController();
        await CalendarModule.mailTemplateController.init();

        CalendarModule.calendarView = new CalendarView();
        await CalendarModule.calendarView.init();
        CalendarModule.meetingView = new MeetingView();
        await CalendarModule.meetingView.init();
        CalendarModule.meetingClientView = new MeetingClientView();
        await CalendarModule.meetingClientView.init();
        CalendarModule.roomView = new RoomView();
        await CalendarModule.roomView.init();
        CalendarModule.mailTemplateView = new MailTemplateView();
        await CalendarModule.mailTemplateView.init();
    }
}

await CalendarModule.init();










