import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
export default class DailyNewsService {
    async delete(dailyNewsId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/daily_news/backend/delete_daily_news.php", { id: dailyNewsId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async moveToWiki(dailyNewsId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/daily_news/backend/move_to_wiki.php", { id: dailyNewsId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/daily_news/backend/get_all_daily_news.php");
    }
    async update(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/daily_news/backend/save_daily_news.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
