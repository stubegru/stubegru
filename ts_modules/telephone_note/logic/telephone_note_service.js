import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
export default class TelephoneNoteService {
    async send(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/telephone_note/backend/send_telephone_note.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
