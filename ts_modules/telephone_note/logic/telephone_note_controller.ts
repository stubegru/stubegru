import Alert from "../../../components/alert/alert.js";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch.js";
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
        } catch (error) {
            Alert.alertError(error);
        }
    }

    async handleSendTelephoneNote() {
        try {
            let data = TelephoneNoteModule.view.getFormData();
            let resp = await TelephoneNoteModule.service.send(data) as StubegruHttpResponse;
            Alert.alertResp(resp);
            TelephoneNoteModule.view.resetForm();
        }
        catch (error) { Alert.alertError(error); }
    }
}
