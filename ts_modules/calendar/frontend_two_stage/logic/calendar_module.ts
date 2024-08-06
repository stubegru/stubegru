import MeetingController from "./meetings/meeting_controller.js";
import CalendarView from "./calendar/calendar_view.js";
import MailTemplateController from "./mail_templates/mail_template_controller.js";
import MailTemplateService from "./mail_templates/mail_template_service.js";
import MailTemplateView from "./mail_templates/mail_template_view.js";
import MeetingService from "./meetings/meeting_service.js";
import RoomController from "./rooms/room_controller.js";
import RoomService from "./rooms/room_service.js";
import RoomView from "./rooms/room_view.js";
import MeetingView from "./meetings/meeting_view.js";

export default class CalendarModule {

    static state = {
        someProp: false
    };

    static meetingService: MeetingService;
    static roomService: RoomService;
    static mailTemplateService: MailTemplateService;

    static meetingController: MeetingController;
    static roomController: RoomController;
    static mailTemplateController: MailTemplateController;

    static calendarView: CalendarView;
    static meetingView: MeetingView;
    static roomView: RoomView;
    static mailTemplateView: MailTemplateView;

    static async init() {
        CalendarModule.meetingService = new MeetingService();
        CalendarModule.roomService = new RoomService();
        CalendarModule.mailTemplateService = new MailTemplateService();

        CalendarModule.meetingController = new MeetingController();
        await CalendarModule.meetingController.init();
        CalendarModule.roomController = new RoomController();
        await CalendarModule.roomController.init();
        CalendarModule.mailTemplateController = new MailTemplateController();
        await CalendarModule.mailTemplateController.init();

        CalendarModule.calendarView = new CalendarView();
        await CalendarModule.calendarView.init();
        CalendarModule.meetingView = new MeetingView();
        await CalendarModule.meetingView.init();
        CalendarModule.roomView = new RoomView();
        await CalendarModule.roomView.init();
        CalendarModule.mailTemplateView = new MailTemplateView();
        await CalendarModule.mailTemplateView.init();
    }
}

await CalendarModule.init();










