import Alert from "../../../components/alert/alert.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch.js";
import AbsenceModule from "./absence_module.js";


export default class AbsenceController {

    async init() {
        await this.refreshListView();
    }

    async refreshListView() {
        try {
            let list = await AbsenceModule.service.getAll();
            await AbsenceModule.view.renderListView(list);
        } catch (error) {
            Alert.alertError(error);
        }
    }

    async handleCreateAbsence() {
        try {
            Stubegru.utils.showButtonSpinner("#absence_modal_submit_button");
            let data = AbsenceModule.view.getFormData();
            let resp = await AbsenceModule.service.create(data) as StubegruHttpResponse;
            AbsenceModule.view.modal.hide();
            AbsenceModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) { Alert.alertError(error); }
        finally {
            Stubegru.utils.removeButtonSpinner("#absence_modal_submit_button");
        }
    }

    async handleUpdateAbsence() {
        try {
            Stubegru.utils.showButtonSpinner("#absence_modal_submit_button");
            let data = AbsenceModule.view.getFormData();
            let resp = await AbsenceModule.service.update(data) as StubegruHttpResponse;
            AbsenceModule.view.modal.hide();
            AbsenceModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) { Alert.alertError(error); }
        finally {
            Stubegru.utils.removeButtonSpinner("#absence_modal_submit_button");
        }
    }

    async handleDeleteAbsence(absenceId: string) {
        try {
            let confirmResp = await Alert.deleteConfirm("Abwesenheit löschen", "Soll diese Abwesenheit wirklich gelöscht werden?");
            if (confirmResp != true) { return; }
            let resp = await AbsenceModule.service.delete(absenceId) as StubegruHttpResponse;
            AbsenceModule.controller.refreshListView();
            Alert.alertResp(resp);
        }
        catch (error) { Alert.alertError(error); }
    }

    async showAbsenceModalForUpdate(absenceId: string) {
        try {
            let absence = await AbsenceModule.service.get(absenceId);
            AbsenceModule.view.setFormData(absence);
            AbsenceModule.view.modal.show();
        }
        catch (error) { Alert.alertError(error); }
    }

    async showAbsenceModalForCreate() {
        try {
            Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value = "new";
            AbsenceModule.view.modal.show();
        }
        catch (error) { Alert.alertError(error); }
    }
}
