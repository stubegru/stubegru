import { Modal } from '../../../components/bootstrap/v3/ts_wrapper.js';
import Stubegru from '../../../components/stubegru_core/logic/stubegru.js';
import StubegruToggle from '../../../components/stubegru_toggle/stubegru_toggle.js';
import UserUtils from '../../../components/user_utils/user_utils.js';
import AbsenceModule, { AbsenceObject } from "./absence_module.js";



export default class AbsenceView {
    modal: Modal;
    form: HTMLFormElement;

    viewFutureToggle: StubegruToggle;
    wholeDayToggle: StubegruToggle;
    recurringToggle: StubegruToggle;
    notificationToggle: StubegruToggle;

    constructor() {

        this.modal = new Modal('#absence_modal');
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);

        Stubegru.dom.querySelector("#absence_create_button").addEventListener("click", AbsenceModule.controller.showAbsenceModalForCreate);

        this.viewFutureToggle = new StubegruToggle("#absence_modal_view_future_toggle");
        this.wholeDayToggle = new StubegruToggle("#absence_modal_form_whole_day_toggle");
        this.recurringToggle = new StubegruToggle("#absence_modal_form_recurring_toggle");
        this.notificationToggle = new StubegruToggle("#absence_modal_notification_toggle");

        this.form = Stubegru.dom.querySelector('#absence_modal_form') as HTMLFormElement;
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            const absenceId = Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value;
            if (absenceId == "new") {
                AbsenceModule.controller.handleCreateAbsence();
            }
            else {
                AbsenceModule.controller.handleUpdateAbsence();
            }
        });

        this.resetModalForm();
    }


    resetModalForm = () => {
        this.form.reset();
    }


    setFormData(absence: AbsenceObject) {
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value = absence.id;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_title").value = absence.title;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_url").value = absence.url;
    }

    getFormData(): AbsenceObject {
        return {
            id: Stubegru.dom.querySelectorAsInput('#absence_modal_form_id').value,
            title: Stubegru.dom.querySelectorAsInput('#absence_modal_form_title').value,
            url: Stubegru.dom.querySelectorAsInput('#absence_modal_form_url').value,
        }
    }

    async renderListView(absenceList: AbsenceObject[]) {

        let html = "";

        for (let l of absenceList) {
            html += `
                <tr class="absence-row text-primary" data-absence-url="${l.url}" style="cursor: pointer;">
                    <td style="font-size: 1.15em; vertical-align: middle;">
                        <i class="fas fa-arrow-right"></i>&nbsp; ${l.title}
                    </td>
                    <td>
                            <button class="btn btn-default absence-edit-button permission-ABSENCE_WRITE permission-required" data-absence-id="${l.id}">
                                <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                            </button>
                    </td>
                    <td>
                            <button class="btn btn-danger absence-delete-button permission-ABSENCE_WRITE permission-required" data-absence-id="${l.id}">
                                <i class="fas fa-times"></i>&nbsp; Löschen
                            </button>
                    </td>
                </tr>
            `;
        }

        Stubegru.dom.querySelector("#absence_container").innerHTML = `
            <table class="table table-condensed table-hover" style="margin-bottom: 0;">
                <tbody>
                    ${html}
                </tbody>
            </table>
        `;
        UserUtils.updateAdminElements();
        this.registerButtonEvents();
    }

    registerButtonEvents() {
        Stubegru.dom.querySelectorAll(".absence-delete-button").forEach(elem => {
            const absenceId = elem.getAttribute("data-absence-id");
            elem.addEventListener("click", (event) => {
                event.stopPropagation();
                AbsenceModule.controller.handleDeleteAbsence(absenceId);
            });
        });
        Stubegru.dom.querySelectorAll(".absence-edit-button").forEach(elem => {
            const absenceId = elem.getAttribute("data-absence-id");
            elem.addEventListener("click", (event) => {
                event.stopPropagation();
                AbsenceModule.controller.showAbsenceModalForUpdate(absenceId);
            });
        });
        Stubegru.dom.querySelectorAll(".absence-row").forEach(elem => {
            const absenceUrl = elem.getAttribute("data-absence-url");
            elem.addEventListener("click", (event) => { window.open(absenceUrl, "_blank") });
        });
    }


}