import SpamFilterController from "./controller";
import SpamFilterService from "./service";
import SpamFilterView from "./view";

export default class SpamFilterModule {

    static state = {};

    static service: SpamFilterService;
    static controller: SpamFilterController;
    static view: SpamFilterView;

    static async init() {
        SpamFilterModule.service = new SpamFilterService();
        SpamFilterModule.controller = new SpamFilterController();
        SpamFilterModule.view = new SpamFilterView();

        await SpamFilterModule.controller.init();
    }
}













