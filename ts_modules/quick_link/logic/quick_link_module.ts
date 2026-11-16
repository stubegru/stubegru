import QuickLinkController from "./quick_link_controller.js";
import QuickLinkService from "./quick_link_service.js";
import QuickLinkView from "./quick_link_view.js";

export default class QuickLinkModule {

    static state = {};

    static service: QuickLinkService;
    static controller: QuickLinkController;
    static view: QuickLinkView;

    static async init() {
        QuickLinkModule.service = new QuickLinkService();
        QuickLinkModule.controller = new QuickLinkController();
        QuickLinkModule.view = new QuickLinkView();

        await QuickLinkModule.controller.init();
    }
}

await QuickLinkModule.init();



export interface QuickLinkObject {
    id: string;
    title: string;
    url: string;
}