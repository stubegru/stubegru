import Alert from "../../../components/alert/alert";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch";
import UserUtils from "../../../components/user_utils/user_utils";
import TelephoneNoteModule from "./telephone_note_module";


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
