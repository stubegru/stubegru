import Alert from "../../../components/alert/alert.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch.js";
import QuickLinkModule from "./quick_link_module.js";


export default class QuickLinkController {

    async init() {
        await this.refreshListView();
    }

    async refreshListView() {
        try {
            let list = await QuickLinkModule.service.getAll();
            await QuickLinkModule.view.renderListView(list);
        } catch (error) {
            Alert.alertError(error);
        }
    }

    async handleCreateQuickLink() {
        try {
            Stubegru.utils.showButtonSpinner("#quick_link_modal_submit_button");
            let data = QuickLinkModule.view.getFormData();
            let resp = await QuickLinkModule.service.create(data) as StubegruHttpResponse;
            QuickLinkModule.view.modal.hide();
            QuickLinkModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) { Alert.alertError(error); }
        finally {
            Stubegru.utils.removeButtonSpinner("#quick_link_modal_submit_button");
        }
    }

    async handleUpdateQuickLink() {
        try {
            Stubegru.utils.showButtonSpinner("#quick_link_modal_submit_button");
            let data = QuickLinkModule.view.getFormData();
            let resp = await QuickLinkModule.service.update(data) as StubegruHttpResponse;
            QuickLinkModule.view.modal.hide();
            QuickLinkModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) { Alert.alertError(error); }
        finally {
            Stubegru.utils.removeButtonSpinner("#quick_link_modal_submit_button");
        }
    }

    async handleDeleteQuickLink(quickLinkId: string) {
        try {
            let confirmResp = await Alert.deleteConfirm("Quicklink löschen", "Soll dieser Quicklink wirklich gelöscht werden?");
            if (confirmResp != true) { return; }
            let resp = await QuickLinkModule.service.delete(quickLinkId) as StubegruHttpResponse;
            QuickLinkModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) { Alert.alertError(error); }
    }

    async showQuickLinkModalForUpdate(quickLinkId: string) {
        try {
            let quickLink = await QuickLinkModule.service.get(quickLinkId);
            QuickLinkModule.view.setFormData(quickLink);
            QuickLinkModule.view.modal.show();
        }
        catch (error) { Alert.alertError(error); }
    }

    async showQuickLinkModalForCreate() {
        try {
            Stubegru.dom.querySelectorAsInput("#quick_link_modal_form_id").value = "new";
            QuickLinkModule.view.modal.show();
        }
        catch (error) { Alert.alertError(error); }
    }
}
