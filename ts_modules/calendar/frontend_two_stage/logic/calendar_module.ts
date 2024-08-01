import CalendarController from "./calendar_controller.js";
import CalendarView from "./calendar_view.js";
import MailTemplateService from "./mail_template_service.js";
import MeetingService from "./meeting_service.js";
import RoomController from "./room_controller.js";
import RoomService from "./room_service.js";
import RoomView from "./room_view.js";

export default class CalendarModule {

    static state = {
        someProp: false
    };

    static CalendarList: CalendarObject[]; 

    static meetingService: MeetingService;
    static roomService: RoomService;
    static mailTemplateService: MailTemplateService;
    static calendarController: CalendarController;
    static roomController: RoomController;
    static mailTemplateController: MailTemplateController;
    static calendarView: CalendarView;
    static roomView: RoomView;
    static mailTemplateView: MailTemplateView;

    static async init() {
        CalendarModule.meetingService = new MeetingService();
        CalendarModule.roomService = new RoomService();
        CalendarModule.mailTemplateService = new MailTemplateService();
        CalendarModule.controller = new CalendarController();
        CalendarModule.view = new CalendarView();

        await CalendarModule.view.init('#calendarViewContainer');
        await CalendarModule.controller.init();
    }
}

await CalendarModule.init();
  









