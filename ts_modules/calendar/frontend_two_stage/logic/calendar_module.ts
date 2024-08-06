import MeetingController from "./meetings/meeting_controller.js";
import CalendarView from "./calendar_view/calendar_view.js";
import MailTemplateController from "./mail_templates/mail_template_controller.js";
import MailTemplateService from "./mail_templates/mail_template_service.js";
import MailTemplateView from "./mail_templates/mail_template_view.js";
import MeetingService from "./meetings/meeting_service.js";
import RoomController from "./rooms/room_controller.js";
import RoomService from "./rooms/room_service.js";
import RoomView from "./rooms/room_view.js";

export default class CalendarModule {

    static state = {
        someProp: false
    };

    static CalendarList: CalendarObject[]; 

    static meetingService: MeetingService;
    static roomService: RoomService;
    static mailTemplateService: MailTemplateService;
    static calendarController: MeetingController;
    static roomController: RoomController;
    static mailTemplateController: MailTemplateController;
    static calendarView: CalendarView;
    static roomView: RoomView;
    static mailTemplateView: MailTemplateView;

    static async init() {
        CalendarModule.meetingService = new MeetingService();
        CalendarModule.roomService = new RoomService();
        CalendarModule.mailTemplateService = new MailTemplateService();
        CalendarModule.controller = new MeetingController();
        CalendarModule.view = new CalendarView();

        await CalendarModule.view.init('#calendarViewContainer');
        await CalendarModule.controller.init();
    }
}

await CalendarModule.init();
  









