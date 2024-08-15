import Alert from "../../../../../components/alert/alert.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import { MailTemplate } from "./mail_template_service.js";

export default class MailTemplateController {

    mailTemplateList: MailTemplate[];

    getMailTemplate(mailTemplateId) {
        return this.mailTemplateList.find(e => e.id == mailTemplateId);
    }

    async init() {
        await this.refreshMailTemplateDropdown();
    }

    private async refreshMailTemplateList() {
        try {
            let list = await CalendarModule.mailTemplateService.getAll();
            this.mailTemplateList = list;
            return list;
        } catch (error) {
            Alert.alertError(error);
        }
    }


    async refreshMailTemplateDropdown() {
        try {
            let list = await this.refreshMailTemplateList();
            await CalendarModule.mailTemplateView.setMailTemplateDropdown(list);
        } catch (error) {
            Alert.alertError(error);
        }
    }

    async showMailTemplateFormForUpdate() {
        try {
            const templateId = Stubegru.dom.querySelectorAsInput("#meeting_detail_mail_template").value;

            if (templateId == null || templateId == "") {
                Alert.alert({
                    title: "Mailvorlage bearbeiten:",
                    text: "Bitte erst eine Mailvorlage auswählen",
                    type: "warning",
                    mode: "toast"
                });
                return;
            }

            const template = CalendarModule.mailTemplateController.getMailTemplate(templateId);
            CalendarModule.mailTemplateView.setTemplateData(template);
            CalendarModule.mailTemplateView.setTemplateFormVisible(true);
        } catch (error) {
            Alert.alertError(error);
        }
    }

    async showMailTemplateFormForCreate() {
        try {
            CalendarModule.mailTemplateView.resetTemplateForm();
            Stubegru.dom.querySelectorAsInput("#mail_template_id").value = "new";
            CalendarModule.mailTemplateView.setTemplateFormVisible(true);
        } catch (error) {
            Alert.alertError(error);
        }
    }


    async saveMailTemplate(event: Event) {
        try {
            event.preventDefault();
            let templateId = Stubegru.dom.querySelectorAsInput("#mail_template_id").value;
            let templateData = CalendarModule.mailTemplateView.getTemplateData();
            let resp;

            if (templateId == "new") {
                //create new Template
                resp = await CalendarModule.mailTemplateService.create(templateData);
                templateId = resp.optionId;
            } else {
                //update existing Template
                resp = await CalendarModule.mailTemplateService.update(templateData);
            }

            Alert.alertResp(resp, "Mailvorlage speichern")
            if (resp.status != "success") { return }

            //Refresh template list
            await CalendarModule.mailTemplateController.refreshMailTemplateDropdown();
            CalendarModule.mailTemplateView.resetTemplateForm();
            CalendarModule.mailTemplateView.setTemplateFormVisible(false);

            //auto-select previously edited/created template
            Stubegru.dom.querySelectorAsInput("#meeting_detail_mail_template").value = templateId;
            Stubegru.dom.querySelector("#meeting_detail_mail_template").dispatchEvent(new Event("change"));
        } catch (error) {
            Alert.alertError(error);
        }
    }


    async cancelMailTemplateEdit() {
        try {
            CalendarModule.mailTemplateView.resetTemplateForm();
            CalendarModule.mailTemplateView.setTemplateFormVisible(false);
        } catch (error) {
            Alert.alertError(error);
        }
    }


    async deleteMailTemplate() {
        try {
            let confirmResp = await Alert.deleteConfirm("Mailvorlage löschen", "Soll diese Mailvorlage wirklich gelöscht werden?");
            if (confirmResp.isConfirmed) {
                let templateId = Stubegru.dom.querySelectorAsInput("#mail_template_id").value;
                if (templateId != "new") {
                    let resp = await CalendarModule.mailTemplateService.delete(templateId);

                    Alert.alertResp(resp, "Mailvorlage Löschen")
                    if (resp.status != "success") { return }

                    CalendarModule.mailTemplateController.refreshMailTemplateDropdown();
                }
                CalendarModule.mailTemplateView.resetTemplateForm();
                CalendarModule.mailTemplateView.setTemplateFormVisible(false);
            }
        } catch (error) {
            Alert.alertError(error);
        }
    }

}