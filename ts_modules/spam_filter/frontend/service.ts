import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../components/stubegru_core/logic/stubegru_fetch.js";
import { SpamFilter } from "./model.js";

export default class SpamFilterService {

    async getAllSpamFilter() {
        const resp = await Stubegru.fetch.getJson("ts_modules/spam_filter/backend/get_spam_filter.php") as SpamFilter[];
        return resp;
    }

    async getSpamFilter(spamFilterId: string) {
        const resp = await Stubegru.fetch.getJson("ts_modules/spam_filter/backend/get_spam_filter.php", { spamFilterId: spamFilterId }) as SpamFilter;
        return resp;
    }

    async updateSpamFilter(spamFilterData: SpamFilter) {
        let resp = await Stubegru.fetch.postJson("ts_modules/spam_filter/backend/update_spam_filter.php", spamFilterData) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async createSpamFilter(spamFilterData: Omit<SpamFilter, "id">) {
        let resp = await Stubegru.fetch.postJson("ts_modules/spam_filter/backend/create_spam_filter.php", spamFilterData) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async deleteSpamFilter(spamFilterId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/spam_filter/backend/delete_spam_filter.php", { spamFilterId: spamFilterId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }
}
