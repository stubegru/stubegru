import Stubegru from "../../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../../components/stubegru_core/logic/stubegru_fetch.js";

export default class MailTemplateService {


    async delete(templateId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/templates/delete_template.php", { id: templateId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/templates/get_templates.php") as MailTemplate[];
    }

    async update(data: MailTemplate) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/templates/save_template.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async create(data: MailTemplate) {
        data.id = "new";
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/templates/save_template.php", data) as CreateMailTemplateHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async getTemplateVariables() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/templates/get_template_variables.php") as MailTemplateVariable[];
    }
}

export interface MailTemplate {
    betreff: string;
    ersteller: string;
    id: string;
    letzteaenderung: string;
    text: string;
    titel: string;
}

export interface CreateMailTemplateHttpResponse extends StubegruHttpResponse {
    templateId: string;
}

export interface MailTemplateVariable {
    category: string;
    description: string;
    placeholder: string;
    property: string;
}