import { StringIndexedList } from "../../stubegru_core/logic/stubegru_interfaces.js";
import DailyNewsController from "./daily_news_controller.js";
import DailyNewsService from "./daily_news_service.js";
import DailyNewsView from "./daily_news_view.js";

export default class DailyNewsModule {

    static state = {
        showOnlyCurrentMessages: false
    };
    static dailyNewsList: DailyNewsObject[]; 

    static service: DailyNewsService;
    static controller: DailyNewsController;
    static view: DailyNewsView;

    static async init() {
        DailyNewsModule.service = new DailyNewsService();
        DailyNewsModule.controller = new DailyNewsController();
        DailyNewsModule.view = new DailyNewsView();

        await DailyNewsModule.controller.init();
        await DailyNewsModule.view.init();
    }
}

await DailyNewsModule.init();



export interface DailyNewsObject {
    id: string;
    inhalt: string;
    titel: string;
    prioritaet: number;
    erfasser?: string;
    erfassungsdatum?: string;
    beginn: string;
    ende: string;
  }
  









