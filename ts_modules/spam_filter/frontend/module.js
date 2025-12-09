import SpamFilterController from "./controller.js";
import SpamFilterService from "./service.js";
import SpamFilterView from "./view.js";
class SpamFilterModule {
    static state = {};
    static service;
    static controller;
    static view;
    static async init() {
        SpamFilterModule.service = new SpamFilterService();
        SpamFilterModule.controller = new SpamFilterController();
        SpamFilterModule.view = new SpamFilterView();
        await SpamFilterModule.controller.init();
    }
}
export default SpamFilterModule;
SpamFilterModule.init();
