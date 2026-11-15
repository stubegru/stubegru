import QuickLinkController from "./quick_link_controller.js";
import QuickLinkService from "./quick_link_service.js";
import QuickLinkView from "./quick_link_view.js";
class QuickLinkModule {
    static state = {};
    static service;
    static controller;
    static view;
    static async init() {
        QuickLinkModule.service = new QuickLinkService();
        QuickLinkModule.controller = new QuickLinkController();
        QuickLinkModule.view = new QuickLinkView();
        await QuickLinkModule.view.init();
        await QuickLinkModule.controller.init();
    }
}
export default QuickLinkModule;
await QuickLinkModule.init();
