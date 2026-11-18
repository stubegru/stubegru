import TelephoneNoteController from "./telephone_note_controller.js";
import TelephoneNoteService from "./telephone_note_service.js";
import TelephoneNoteView from "./telephone_note_view.js";

export default class TelephoneNoteModule {

    static state = {};

    static service: TelephoneNoteService;
    static controller: TelephoneNoteController;
    static view: TelephoneNoteView;

    static async init() {
        TelephoneNoteModule.service = new TelephoneNoteService();
        TelephoneNoteModule.controller = new TelephoneNoteController();
        TelephoneNoteModule.view = new TelephoneNoteView();

        await TelephoneNoteModule.controller.init();
    }
}

await TelephoneNoteModule.init();



export interface TelephoneNoteObject {
    name: string;
    studentId: string;
    phone: string;
    mail: string;
    note: string;
    recipient: string;
    issue: string;
}