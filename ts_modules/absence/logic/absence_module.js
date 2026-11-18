import AbsenceController from "./absence_controller.js";
import AbsenceService from "./absence_service.js";
import AbsenceView from "./absence_view.js";
class AbsenceModule {
    static state = {};
    static service;
    static controller;
    static view;
    static async init() {
        AbsenceModule.service = new AbsenceService();
        AbsenceModule.controller = new AbsenceController();
        AbsenceModule.view = new AbsenceView();
        await AbsenceModule.controller.init();
    }
}
export default AbsenceModule;
await AbsenceModule.init();
