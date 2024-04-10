import AlertModule from "../../alert/alert_module.js";
import Stubegru from "../../stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../stubegru_core/logic/stubegru_fetch.js";
import DailyNewsModule, { DailyNewsObject } from "./daily_news_module.js";

export default class DailyNewsService {


    async delete(dailyNewsId) {
        let resp = await Stubegru.fetch.post("ts_modules/daily_news/backend/delete_daily_news.php", { id: dailyNewsId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async moveToWiki(dailyNewsId) {
        let resp = await Stubegru.fetch.post("ts_modules/daily_news/backend/move_to_wiki.php", { id: dailyNewsId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async getAll() {
        return await Stubegru.fetch.get("ts_modules/daily_news/backend/get_all_daily_news.php") as DailyNewsObject[];
    }

    async update(data) {
        let resp = await Stubegru.fetch.post("ts_modules/daily_news/backend/save_daily_news.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }
}
