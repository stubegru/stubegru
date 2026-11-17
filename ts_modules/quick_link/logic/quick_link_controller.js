import Alert from "../../../components/alert/alert.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import QuickLinkModule from "./quick_link_module.js";
export default class QuickLinkController {
    async init() {
        await this.refreshListView();
    }
    async refreshListView() {
        try {
            let list = await QuickLinkModule.service.getAll();
            await QuickLinkModule.view.renderListView(list);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async handleCreateQuickLink() {
        try {
            let data = QuickLinkModule.view.getFormData();
            let resp = await QuickLinkModule.service.create(data);
            QuickLinkModule.view.modal.hide();
            QuickLinkModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async handleUpdateQuickLink() {
        try {
            let data = QuickLinkModule.view.getFormData();
            let resp = await QuickLinkModule.service.update(data);
            QuickLinkModule.view.modal.hide();
            QuickLinkModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async handleDeleteQuickLink(quickLinkId) {
        try {
            let confirmResp = await Alert.deleteConfirm("Quicklink löschen", "Soll dieser Quicklink wirklich gelöscht werden?");
            if (confirmResp != true) {
                return;
            }
            let resp = await QuickLinkModule.service.delete(quickLinkId);
            QuickLinkModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showQuickLinkModalForUpdate(quickLinkId) {
        try {
            let quickLink = await QuickLinkModule.service.get(quickLinkId);
            QuickLinkModule.view.setFormData(quickLink);
            QuickLinkModule.view.modal.show();
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showQuickLinkModalForCreate() {
        try {
            Stubegru.dom.querySelectorAsInput("#quick_link_modal_form_id").value = "new";
            QuickLinkModule.view.modal.show();
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
}
