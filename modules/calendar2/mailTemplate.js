class MailTemplate {

    static mailTemplateList = [];


    static async fetchMailTemplates() {
        MailTemplate.mailTemplateList = [];
        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/templates/get_templates.php`);
        let data = await resp.json();

        for (const mailTemplateData of data) {
            let r = new MailTemplate(mailTemplateData);
            MailTemplate.mailTemplateList.push(r);
        }
    }

    static getById(mailTemplateId) {
        return MailTemplate.mailTemplateList.find(e => e.id == mailTemplateId);
    }

    constructor(mailTemplateData) {
        this.id = mailTemplateData.id;
        this.betreff = mailTemplateData.betreff;
        this.ersteller = mailTemplateData.ersteller;
        this.letzteaenderung = mailTemplateData.letzteaenderung;
        this.text = mailTemplateData.text;
        this.titel = mailTemplateData.titel;
    }

    applyProperties(data) {
        for (const propName in data) {
            this[propName] = data[propName];
        }
    }


    async updateOnServer() {
        let formData = this.toFormData();

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/templates/save_template.php`;
        let mailTemplateResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        mailTemplateResp = await mailTemplateResp.json();
        return mailTemplateResp;
    }

    static async createOnServer(mailTemplateData) {
        mailTemplateData.id = "new";
        let m = new MailTemplate(mailTemplateData);
        let formData = m.toFormData();

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/templates/save_template.php`;
        let resp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        resp = await resp.json();
        return resp;
    }



    toFormData() {
        let formData = new FormData();
        formData.append("templateId", this.id);
        formData.append("subject", this.betreff);
        formData.append("text", this.text);
        formData.append("title", this.titel);
        //formData.append("letzteaenderung", this.letzteaenderung);
        //formData.append("ersteller", this.ersteller);
        return formData;
    }

    async deleteOnServer() {
        let formData = new FormData();
        formData.append("templateId", this.id);

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/templates/delete_template.php`;
        let mailTemplateResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        mailTemplateResp = await mailTemplateResp.json();
        return mailTemplateResp;
    }

}