import AlertModule from "../../alert/alert_module.js";
import Stubegru from "../../stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../stubegru_core/logic/stubegru_fetch.js";
import DailyNewsModule from "./daily_news_module.js";


export default class DailyNewsController {
    async init() {
        this.refreshListView();
    }

    getDailyNews(dailyNewsId: string) {
        return DailyNewsModule.dailyNewsList.find(elem => (elem.id == dailyNewsId));
    }

    async refreshDailyNewsList() {
        try {
            let list = await DailyNewsModule.service.getAll();
            DailyNewsModule.dailyNewsList = list;
            return list;
        } catch (error) {
            AlertModule.alertError(error);
        }
    }


    async refreshListView() {
        try {
            let list = await this.refreshDailyNewsList();
            DailyNewsModule.view.renderListView(list);
        } catch (error) {
            AlertModule.alertError(error);
        }
    }

    async saveDailyNews() {
        let resp;
        try {
            let data = DailyNewsModule.view.getFormData();
            resp = await DailyNewsModule.service.update(data) as StubegruHttpResponse;
            DailyNewsModule.view.modal.hide();
            DailyNewsModule.controller.refreshListView();
            AlertModule.alertResp(resp);
        }
        catch (error) { AlertModule.alertError(error); }
    }

    async deleteDailyNews(dailyNewsId) {
        let resp;
        try {
            let confirmResp = await AlertModule.deleteConfirm("Nachricht löschen", "Soll die Nachricht wirklich gelöscht werden?");
            if (confirmResp.isConfirmed) {
                resp = await DailyNewsModule.service.delete(dailyNewsId) as StubegruHttpResponse;
                DailyNewsModule.controller.refreshListView();
                AlertModule.alertResp(resp);
            }
        }
        catch (error) { AlertModule.alertError(error); }
    }

    async moveDailyNewsToWiki(dailyNewsId) {
        let resp;
        try {
            let confirmResp = await AlertModule.deleteConfirm("In Wiki Artikel umwandeln?", "Soll diese Tagesaktuelle Info wirklich in einen Wiki Artikel umgewandelt werden? Die Tagesaktuelle Info wird dadurch gelöscht.", "Umwandeln");
            if (confirmResp.isConfirmed) {
                resp = await DailyNewsModule.service.moveToWiki(dailyNewsId) as StubegruHttpResponse;
                DailyNewsModule.controller.refreshListView();
                AlertModule.alertResp(resp);
            }
        }
        catch (error) { AlertModule.alertError(error); }
    }

    async showDailyNewsModalForUpdate(dailyNewsId: string) {
        try {
            let dailyNews = this.getDailyNews(dailyNewsId);
            DailyNewsModule.view.setFormData(dailyNews);
            DailyNewsModule.view.modal.show();
        }
        catch (error) { AlertModule.alertError(error); }
    }

    async showDailyNewsModalForCreate() {
        try {
            Stubegru.dom.querySelectorAsInput("#daily_news_id").value = "new";
            DailyNewsModule.view.modal.show();
        }
        catch (error) { AlertModule.alertError(error); }
    }
}
