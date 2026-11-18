import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch.js";
import { AbsenceObject } from "./absence_module.js";

export default class AbsenceService {

    async get(absenceId: string) {
        return await Stubegru.fetch.getJson("ts_modules/absence/backend/get_absence.php", { id: absenceId }) as AbsenceObject;
    }

    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/absence/backend/get_all_absence.php") as AbsenceObject[];
    }

    async delete(absenceId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/absence/backend/delete_absence.php", { id: absenceId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async update(data: AbsenceObject) {
        let resp = await Stubegru.fetch.postJson("ts_modules/absence/backend/update_absence.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async create(data: Omit<AbsenceObject, "id">) {
        let resp = await Stubegru.fetch.postJson("ts_modules/absence/backend/create_absence.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }
}
