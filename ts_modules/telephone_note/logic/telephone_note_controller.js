import Alert from "../../../components/alert/alert.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru";
import UserUtils from "../../../components/user_utils/user_utils.js";
import TelephoneNoteModule from "./telephone_note_module.js";
export default class TelephoneNoteController {
    async init() {
        await this.refreshRecipientsList();
    }
    async refreshRecipientsList() {
        try {
            let list = await UserUtils.getUserListByPermission("RECEIVE_TELEPHONE_NOTE");
            await TelephoneNoteModule.view.setRecipientsList(list);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async handleSendTelephoneNote() {
        const submitButton = Stubegru.dom.querySelector("#telephone_note_form_submit_button");
        const originalContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        try {
            let data = TelephoneNoteModule.view.getFormData();
            let resp = await TelephoneNoteModule.service.send(data);
            Alert.alertResp(resp);
            TelephoneNoteModule.view.resetForm();
        }
        catch (error) {
            Alert.alertError(error);
        }
        finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalContent;
        }
    }
}
