import Stubegru from '../../../components/stubegru_core/logic/stubegru.js';
import TelephoneNoteModule from "./telephone_note_module.js";
export default class TelephoneNoteView {
    form;
    constructor() {
        this.form = Stubegru.dom.querySelector('#telephone_note_form');
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            TelephoneNoteModule.controller.handleSendTelephoneNote();
        });
        this.resetForm();
    }
    resetForm = () => {
        this.form.reset();
    };
    getFormData() {
        return {
            name: Stubegru.dom.querySelectorAsInput("#telephone_note_form_name").value,
            studentId: Stubegru.dom.querySelectorAsInput("#telephone_note_form_student_id").value,
            phone: Stubegru.dom.querySelectorAsInput("#telephone_note_form_phone").value,
            mail: Stubegru.dom.querySelectorAsInput("#telephone_note_form_mail").value,
            note: Stubegru.dom.querySelectorAsInput("#telephone_note_form_note").value,
            recipient: Stubegru.dom.querySelectorAsInput("#telephone_note_form_recipients").value,
            issue: Stubegru.dom.querySelectorAsInput("#telephone_note_form_issue").value
        };
    }
    setRecipientsList(userList) {
        let html = "<option value=''>Bitte wählen...</option>";
        for (const user of userList) {
            html += `<option value="${user.mail}">${user.name}</option>`;
        }
        Stubegru.dom.querySelector("#telephone_note_form_recipients").innerHTML = html;
    }
}
