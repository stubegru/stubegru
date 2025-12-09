import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
export default class SpamFilterService {
    async getAllSpamFilter() {
        const resp = await Stubegru.fetch.getJson("ts_modules/spam_filter/backend/get_spam_filter.php");
        return resp;
    }
    async getSpamFilter(spamFilterId) {
        const resp = await Stubegru.fetch.getJson("ts_modules/spam_filter/backend/get_spam_filter.php", { spamFilterId: spamFilterId });
        return resp;
    }
    async updateSpamFilter(spamFilterData) {
        let resp = await Stubegru.fetch.postJson("ts_modules/spam_filter/backend/update_spam_filter.php", spamFilterData);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async createSpamFilter(spamFilterData) {
        let resp = await Stubegru.fetch.postJson("ts_modules/spam_filter/backend/create_spam_filter.php", spamFilterData);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async deleteSpamFilter(spamFilterId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/spam_filter/backend/delete_spam_filter.php", { spamFilterId: spamFilterId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
