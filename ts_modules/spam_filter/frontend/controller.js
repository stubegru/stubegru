import Alert from "../../../components/alert/alert.js";
import SpamFilterModule from "./module.js";
export default class SpamFilterController {
    async init() {
        await this.refreshSpamFilterList();
    }
    async refreshSpamFilterList() {
        try {
            let spamfilterList = await SpamFilterModule.service.getAllSpamFilter();
            SpamFilterModule.view.updateListView(spamfilterList);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async handleSpamFilterEdit(spamfilterId) {
        try {
            SpamFilterModule.view.checkForRequiredFilterAttribute();
            let spamfilterData = SpamFilterModule.view.getModalFormData();
            spamfilterData.id = spamfilterId;
            const resp = await SpamFilterModule.service.updateSpamFilter(spamfilterData);
            Alert.alertResp(resp, "Spam Filter");
            SpamFilterModule.view.modal.hide(); //refresh spamfilter list via hide event
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async handleSpamFilterCreate() {
        try {
            SpamFilterModule.view.checkForRequiredFilterAttribute();
            let spamfilterData = SpamFilterModule.view.getModalFormData();
            const resp = await SpamFilterModule.service.createSpamFilter(spamfilterData);
            Alert.alertResp(resp, "Spam Filter");
            SpamFilterModule.view.modal.hide(); //refresh spamfilter list via hide event
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async handleSpamFilterDelete(spamfilterId) {
        try {
            let confirmResp = await Alert.deleteConfirm("Spam Filter löschen", "Möchtest du diesen Filter wirklich löschen?");
            let resp = await SpamFilterModule.service.deleteSpamFilter(spamfilterId);
            Alert.alertResp(resp, "Spam Filter");
            await this.refreshSpamFilterList();
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showSpamFilterModalForUpdate(spamfilterId) {
        try {
            const spamfilterData = await SpamFilterModule.service.getSpamFilter(spamfilterId);
            SpamFilterModule.view.setModalFormData(spamfilterData);
            SpamFilterModule.view.setModalSubmitEvent(() => {
                SpamFilterModule.controller.handleSpamFilterEdit(spamfilterId);
            });
            SpamFilterModule.view.setFooterInfoVisibility(true);
            SpamFilterModule.view.modal.show();
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showSpamFilterModalForCreate() {
        try {
            SpamFilterModule.view.setModalSubmitEvent(() => {
                SpamFilterModule.controller.handleSpamFilterCreate();
            });
            SpamFilterModule.view.setFooterInfoVisibility(false);
            SpamFilterModule.view.modal.show();
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
}
