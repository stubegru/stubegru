import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
export default class QuickLinkService {
    async get(quickLinkId) {
        return await Stubegru.fetch.getJson("ts_modules/quick_link/backend/get_quick_link.php", { id: quickLinkId });
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/quick_link/backend/get_all_quick_link.php");
    }
    async delete(quickLinkId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/quick_link/backend/delete_quick_link.php", { id: quickLinkId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async update(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/quick_link/backend/update_quick_link.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async create(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/quick_link/backend/create_quick_link.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
