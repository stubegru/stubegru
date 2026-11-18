import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
export default class AbsenceService {
    async get(absenceId) {
        return await Stubegru.fetch.getJson("ts_modules/absence/backend/get_absence.php", { id: absenceId });
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/absence/backend/get_all_absence.php");
    }
    async delete(absenceId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/absence/backend/delete_absence.php", { id: absenceId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async update(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/absence/backend/update_absence.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async create(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/absence/backend/create_absence.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
