import TelephoneNoteController from "./telephone_note_controller.js";
import TelephoneNoteService from "./telephone_note_service.js";
import TelephoneNoteView from "./telephone_note_view.js";
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
