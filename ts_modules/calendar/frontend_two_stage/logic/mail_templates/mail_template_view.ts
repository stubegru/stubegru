import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarModule from "../calendar_module.js";
import { MailTemplate } from "./mail_template_service.js";
import ClassicEditor from '../../../../../components/ckeditor/v5/ckeditor.js'


export default class MailTemplateView {

    richTextEditor: ClassicEditor;

    async init() {
        const editorPlaceholder = Stubegru.dom.querySelector('#mailTemplateEditor'); //TODO: Refactor html ids to design rules
        this.richTextEditor = await ClassicEditor.create(editorPlaceholder, { height: "200px" });
        await this.showTemplateVariables(); //Show available template variables
        await this.initTemplateEditButtons();

        Stubegru.dom.querySelectorAll(".meeting-template-input").forEach(elem => elem.addEventListener("change", () => CalendarModule.meetingView.setUnsavedChanges(true)));
    }

    /**
    * Reset all inputs in the Calendar meeting mail template form
    */
    resetTemplateForm() {
        let form = Stubegru.dom.querySelector("#calendarTemplateForm") as HTMLFormElement;
        form.reset();
        this.richTextEditor.setData("");
    }

    setMailTemplateDropdown(templateList: MailTemplate[]) {
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
        Stubegru.dom.querySelector("#calendarEditTemplateButton").addEventListener("click", CalendarModule.mailTemplateController.showMailTemplateFormForUpdate);

        Stubegru.dom.querySelector("#calendarNewTemplateButton").addEventListener("click", CalendarModule.mailTemplateController.showMailTemplateFormForCreate);

        Stubegru.dom.querySelector("#calendarTemplateForm").addEventListener("submit", CalendarModule.mailTemplateController.saveMailTemplate);

        Stubegru.dom.querySelector("#calendarCancelTemplateButton").addEventListener("click", CalendarModule.mailTemplateController.cancelMailTemplateEdit);

        Stubegru.dom.querySelector("#calendarDeleteTemplateButton").addEventListener("click", CalendarModule.mailTemplateController.deleteMailTemplate);
    }

    private async showTemplateVariables() {
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

