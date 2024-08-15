import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarModule from "../calendar_module.js";
import ClassicEditor from '../../../../../components/ckeditor/v5/ckeditor.js';
export default class MailTemplateView {
    richTextEditor;
    async init() {
        const editorPlaceholder = Stubegru.dom.querySelector('#mailTemplateEditor'); //TODO: Refactor html ids to design rules
        this.richTextEditor = await ClassicEditor.create(editorPlaceholder);
        await this.showTemplateVariables(); //Show available template variables
        await this.initTemplateEditButtons();
        Stubegru.dom.querySelectorAll(".meeting-template-input").forEach(elem => Stubegru.dom.addEventListener(elem, "change", () => CalendarModule.meetingView.setUnsavedChanges(true)));
    }
    /**
    * Reset all inputs in the Calendar meeting mail template form
    */
    resetTemplateForm() {
        let form = Stubegru.dom.querySelector("#calendarTemplateForm");
        form.reset();
        this.richTextEditor.setData("");
    }
    setMailTemplateDropdown(templateList) {
        let selectHtml = "<option value=''>Bitte wählen...</option>";
        let postHtml;
        for (const template of templateList) {
            const ownId = UserUtils.currentUser.id;
            const optionString = `<option value='${template.id}' title='${template.text}' id='templateSelectOption${template.id}'>${template.titel}</option>`;
            if (ownId == template.ersteller) { //Add own entry at top
                selectHtml += optionString;
            }
            else {
                postHtml += optionString;
            }
        }
        selectHtml += postHtml;
        Stubegru.dom.querySelector("#calendarTemplate").innerHTML = selectHtml;
    }
    async initTemplateEditButtons() {
        Stubegru.dom.addEventListener("#calendarEditTemplateButton", "click", CalendarModule.mailTemplateController.showMailTemplateFormForUpdate);
        Stubegru.dom.addEventListener("#calendarNewTemplateButton", "click", CalendarModule.mailTemplateController.showMailTemplateFormForCreate);
        Stubegru.dom.addEventListener("#calendarTemplateForm", "submit", CalendarModule.mailTemplateController.saveMailTemplate);
        Stubegru.dom.addEventListener("#calendarCancelTemplateButton", "click", CalendarModule.mailTemplateController.cancelMailTemplateEdit);
        Stubegru.dom.addEventListener("#calendarDeleteTemplateButton", "click", CalendarModule.mailTemplateController.deleteMailTemplate);
    }
    async showTemplateVariables() {
        const templateVariableList = await CalendarModule.mailTemplateService.getTemplateVariables();
        let templateVariableObject = {
            meeting: { title: "Termin", items: [] },
            room: { title: "Beratungsraum", items: [] },
            client: { title: "Kunde", items: [] },
            extra: { title: "Sonstiges", items: [] }
        };
        for (const t of templateVariableList) {
            templateVariableObject[t.category].items.push(t);
        }
        let varHtml = ``;
        for (const categoryId in templateVariableObject) {
            const category = templateVariableObject[categoryId];
            varHtml += `<h4><b>${category.title}</b></h4><ul style="padding-inline-start: 10px">`;
            for (const t of category.items) {
                varHtml += `<li>
                                <b>${t.placeholder}</b> <br>
                                <small>${t.description}</small>
                            </li>`;
            }
            varHtml += `</ul><br>`;
        }
        Stubegru.dom.querySelector("#calendarTemplateVariablesContainer").innerHTML = varHtml;
    }
    setTemplateFormVisible(isVisible) {
        Stubegru.dom.slideToState("#newmail", isVisible);
    }
    getTemplateData() {
        let templateData = {};
        templateData.id = Stubegru.dom.querySelectorAsInput("#templateId").value;
        templateData.titel = Stubegru.dom.querySelectorAsInput("#templateTitle").value;
        templateData.betreff = Stubegru.dom.querySelectorAsInput("#templateSubject").value;
        templateData.text = this.richTextEditor.getData();
        return templateData;
    }
    setTemplateData(templateData) {
        Stubegru.dom.querySelectorAsInput("#templateId").value = templateData.id;
        Stubegru.dom.querySelectorAsInput("#templateTitle").value = templateData.titel;
        Stubegru.dom.querySelectorAsInput("#templateSubject").value = templateData.betreff;
        this.richTextEditor.setData(templateData.text);
    }
}
