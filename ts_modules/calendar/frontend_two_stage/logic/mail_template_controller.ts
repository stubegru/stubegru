import { MailTemplate } from "./mail_template_service.js";

export default class MailTemplateController {

    mailTemplateList : MailTemplate[];

    getMailTemplate(mailTemplateId) {
        return this.mailTemplateList.find(e => e.id == mailTemplateId);
    }
}