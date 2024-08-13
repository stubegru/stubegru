import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
export default class MailTemplateService {
    async delete(templateId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/templates/delete_template.php", { id: templateId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/templates/get_templates.php");
    }
    async update(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/templates/save_template.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async create(data) {
        data.id = "new";
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/templates/save_template.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async getTemplateVariables() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/templates/get_template_variables.php");
    }
}
