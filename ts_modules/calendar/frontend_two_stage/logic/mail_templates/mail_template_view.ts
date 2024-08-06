import Alert from "../../../../../components/alert/alert.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarModule from "../calendar_module.js";
import { MailTemplate } from "./mail_template_service.js";
import ClassicEditor from '../../../../../components/ckeditor/v5/ckeditor.js'


export default class MailTemplateView {

    richTextEditor: ClassicEditor;

    async init(){
        const editorPlaceholder = Stubegru.dom.querySelector('#mailTemplateEditor'); //TODO: Refactor html ids to design rules
        this.richTextEditor = await ClassicEditor.create(editorPlaceholder, { height: "200px" });
    }

    /**
    * Reset all inputs in the Calendar meeting mail template form
    */
    resetTemplateForm() {
        let form = Stubegru.dom.querySelector("#calendarTemplateForm") as HTMLFormElement;
        form.reset();
        this.richTextEditor.setData("");
    }

    setTemplateDropdown(templateList: MailTemplate[]) {
        let selectHtml = "<option value=''>Bitte wählen...</option>";
        let postHtml;
        for (const template of templateList) {
            const ownId = UserUtils.currentUser.id;
            const optionString = `<option value='Stubegru.dom.querySelector{template.id}' title='Stubegru.dom.querySelector{template.text}' id='templateSelectOptionStubegru.dom.querySelector{template.id}'>Stubegru.dom.querySelector{template.titel}</option>`
            if (ownId == template.ersteller) { //Add own entry at top
                selectHtml += optionString;
            } else {
                postHtml += optionString;
            }
        }
        selectHtml += postHtml;
        Stubegru.dom.querySelector("#calendarTemplate").innerHTML = selectHtml;
    }

    async initTemplateEditButtons() {
        Stubegru.dom.querySelector("#calendarEditTemplateButton").addEventListener("click", () => {
            const templateId = Stubegru.dom.querySelectorAsInput("#calendarTemplate").value;

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
            this.setTemplateData(template);
            this.setTemplateFormVisible(true);
        });

        Stubegru.dom.querySelector("#calendarNewTemplateButton").addEventListener("click", () => {
            this.resetTemplateForm();
            Stubegru.dom.querySelectorAsInput("#templateId").value = "new";
            this.setTemplateFormVisible(true);
        });

        Stubegru.dom.querySelector("#calendarTemplateForm").addEventListener("submit", async (event) => {
            event.preventDefault();
            let templateId = Stubegru.dom.querySelectorAsInput("#templateId").value;
            let templateData = this.getTemplateData();
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
            await MailTemplate.fetchMailTemplates();
            this.setTemplateDropdown(MailTemplate.mailTemplateList);
            this.resetTemplateForm();
            this.setTemplateFormVisible(false);

            //auto-select previously edited/created template
            Stubegru.dom.querySelectorAsInput("#calendarTemplate").value = templateId;
            Stubegru.dom.querySelector("#calendarTemplate").dispatchEvent(new Event("change"));
        });

        Stubegru.dom.querySelector("#calendarCancelTemplateButton").addEventListener("click", () => {
            this.resetTemplateForm();
            this.setTemplateFormVisible(false);
        });

        Stubegru.dom.querySelector("#calendarDeleteTemplateButton").addEventListener("click", async () => {
            await Alert.deleteConfirm("Mailvorlage löschen", "Soll diese Mailvorlage wirklich gelöscht werden?");
            let templateId = Stubegru.dom.querySelectorAsInput("#templateId").value;
            if (templateId != "new") {
                let resp = await CalendarModule.mailTemplateService.delete(templateId);

                Alert.alertResp(resp, "Mailvorlage Löschen")
                if (resp.status != "success") { return }

                await MailTemplate.fetchMailTemplates();
                this.setTemplateDropdown(MailTemplate.mailTemplateList);
            }
            this.resetTemplateForm();
            this.setTemplateFormVisible(false);
        });


        //Show available template variables
        const templateVariableList = await CalendarModule.mailTemplateService.getTemplateVariables();
        let templateVariableObject = {
            meeting: { title: "Termin", items: [] },
            room: { title: "Beratungsraum", items: [] },
            client: { title: "Kunde", items: [] },
            extra: { title: "Sonstiges", items: [] }
        };

        for (const t of templateVariableList) { templateVariableObject[t.category].items.push(t); }

        let varHtml = ``;
        for (const categoryId in templateVariableObject) {
            const category = templateVariableObject[categoryId];
            varHtml += `<h4><b>Stubegru.dom.querySelector{category.title}</b></h4><ul style="padding-inline-start: 10px">`;
            for (const t of category.items) {
                varHtml += `<li>
                                <b>Stubegru.dom.querySelector{t.placeholder}</b> <br>
                                <small>Stubegru.dom.querySelector{t.description}</small>
                            </li>`;
            }
            varHtml += `</ul><br>`;
        }

        Stubegru.dom.querySelector("#calendarTemplateVariablesContainer").innerHTML = varHtml;
    }

    setTemplateFormVisible(isVisible: boolean) {
        Stubegru.dom.slideToState("#newmail", isVisible);
    }

    getTemplateData() {
        let templateData = {} as MailTemplate;
        templateData.id = Stubegru.dom.querySelectorAsInput("#templateId").value;
        templateData.titel = Stubegru.dom.querySelectorAsInput("#templateTitle").value;
        templateData.betreff = Stubegru.dom.querySelectorAsInput("#templateSubject").value;
        templateData.text = this.richTextEditor.getData();
        return templateData;
    }

    setTemplateData(templateData: MailTemplate) {
        Stubegru.dom.querySelectorAsInput("#templateId").value = templateData.id;
        Stubegru.dom.querySelectorAsInput("#templateTitle").value = templateData.titel;
        Stubegru.dom.querySelectorAsInput("#templateSubject").value = templateData.betreff;
        this.richTextEditor.setData(templateData.text)
    }
}

