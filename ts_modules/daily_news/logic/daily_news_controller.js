import Alert from "../../../components/alert/alert.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import DailyNewsModule from "./daily_news_module.js";
export default class DailyNewsController {
    async init() {
        await this.refreshListView();
    }
    getDailyNews(dailyNewsId) {
        return DailyNewsModule.dailyNewsList.find(elem => (elem.id == dailyNewsId));
    }
    async refreshDailyNewsList() {
        try {
            let list = await DailyNewsModule.service.getAll();
            DailyNewsModule.dailyNewsList = list;
            return list;
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async refreshListView() {
        try {
            let list = await this.refreshDailyNewsList();
            await DailyNewsModule.view.renderListView(list);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async saveDailyNews() {
        let resp;
        try {
            let data = DailyNewsModule.view.getFormData();
            resp = await DailyNewsModule.service.update(data);
            DailyNewsModule.view.modal.hide();
            DailyNewsModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async deleteDailyNews(dailyNewsId) {
        let resp;
        try {
            let confirmResp = await Alert.deleteConfirm("Nachricht löschen", "Soll die Nachricht wirklich gelöscht werden?");
            resp = await DailyNewsModule.service.delete(dailyNewsId);
            DailyNewsModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async moveDailyNewsToWiki(dailyNewsId) {
        let resp;
        try {
            let confirmResp = await Alert.deleteConfirm("In Wiki Artikel umwandeln?", "Soll diese Tagesaktuelle Info wirklich in einen Wiki Artikel umgewandelt werden? Die Tagesaktuelle Info wird dadurch gelöscht.", "Umwandeln");
            resp = await DailyNewsModule.service.moveToWiki(dailyNewsId);
            DailyNewsModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showDailyNewsModalForUpdate(dailyNewsId) {
        try {
            DailyNewsModule.view.modal.show();
            let dailyNews = this.getDailyNews(dailyNewsId);
            DailyNewsModule.view.setFormData(dailyNews);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showDailyNewsModalForCreate() {
        try {
            Stubegru.dom.querySelectorAsInput("#daily_news_id").value = "new";
            DailyNewsModule.view.modal.show();
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
}
