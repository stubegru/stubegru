import DailyNewsController from "./daily_news_controller.js";
import DailyNewsService from "./daily_news_service.js";
import DailyNewsView from "./daily_news_view.js";
class DailyNewsModule {
    static state = {
        showOnlyCurrentMessages: false
    };
    static dailyNewsList;
    static service;
    static controller;
    static view;
    static async init() {
        DailyNewsModule.service = new DailyNewsService();
        DailyNewsModule.controller = new DailyNewsController();
        DailyNewsModule.view = new DailyNewsView();
        await DailyNewsModule.view.init();
        await DailyNewsModule.controller.init();
    }
}
export default DailyNewsModule;
await DailyNewsModule.init();
