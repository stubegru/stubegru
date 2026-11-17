import Stubegru from "../../../components/stubegru_core/logic/stubegru";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch";
import { TelephoneNoteObject } from "./telephone_note_module";

export default class TelephoneNoteService {

    async send(data: TelephoneNoteObject) {
        let resp = await Stubegru.fetch.postJson("ts_modules/telephone_note/backend/send_telephone_note.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

}
