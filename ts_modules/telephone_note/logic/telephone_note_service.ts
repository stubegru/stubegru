import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch.js";
import { TelephoneNoteObject } from "./telephone_note_module.js";

export default class TelephoneNoteService {

    async send(data: TelephoneNoteObject) {
        let resp = await Stubegru.fetch.postJson("ts_modules/telephone_note/backend/send_telephone_note.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

}
