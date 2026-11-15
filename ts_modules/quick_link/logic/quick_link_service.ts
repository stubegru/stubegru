import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch.js";
import { QuickLinkObject } from "./quick_link_module.js";

export default class QuickLinkService {

    async get(quickLinkId: string) {
        return await Stubegru.fetch.getJson("ts_modules/quick_link/backend/get_quick_link.php", { id: quickLinkId }) as QuickLinkObject;
    }

    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/quick_link/backend/get_all_quick_link.php") as QuickLinkObject[];
    }

    async delete(quickLinkId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/quick_link/backend/delete_quick_link.php", { id: quickLinkId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async update(data: QuickLinkObject) {
        let resp = await Stubegru.fetch.postJson("ts_modules/quick_link/backend/update_quick_link.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async create(data: Omit<QuickLinkObject, "id">) {
        let resp = await Stubegru.fetch.postJson("ts_modules/quick_link/backend/create_quick_link.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }
}
