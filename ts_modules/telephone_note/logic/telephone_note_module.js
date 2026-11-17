import TelephoneNoteController from "./telephone_note_controller";
import TelephoneNoteService from "./telephone_note_service";
import TelephoneNoteView from "./telephone_note_view";
class TelephoneNoteModule {
    static state = {};
    static service;
    static controller;
    static view;
    static async init() {
        TelephoneNoteModule.service = new TelephoneNoteService();
        TelephoneNoteModule.controller = new TelephoneNoteController();
        TelephoneNoteModule.view = new TelephoneNoteView();
        await TelephoneNoteModule.controller.init();
    }
}
export default TelephoneNoteModule;
await TelephoneNoteModule.init();
