import DailyNewsController from "./daily_news_controller.js";
import DailyNewsService from "./daily_news_service.js";
import DailyNewsView from "./daily_news_view.js";

export default class DailyNews {

    static state = {
        showOnlyCurrentMessages: false
    };

    static service: DailyNewsService;
    static controller: DailyNewsController;
    static view: DailyNewsView;

    static async init() {
        DailyNews.service = new DailyNewsService();
        DailyNews.controller = new DailyNewsController();
        DailyNews.view = new DailyNewsView();

        await DailyNews.controller.init();
        await DailyNews.view.init();
        //DailyNews.service.init();
    }
}

await DailyNews.init();









