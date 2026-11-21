import { Modal } from '../../../components/bootstrap/v3/ts_wrapper.js';
import Stubegru from '../../../components/stubegru_core/logic/stubegru.js';
import StubegruToggle from '../../../components/stubegru_toggle/stubegru_toggle.js';
import UserUtils from '../../../components/user_utils/user_utils.js';
import AbsenceModule from "./absence_module.js";
export default class AbsenceView {
    modal;
    form;
    viewFutureToggle;
    wholeDayToggle;
    recurringToggle;
    notificationToggle;
    recurringDayLabel;
    constructor() {
        this.modal = new Modal('#absence_modal');
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        Stubegru.dom.querySelector("#absence_create_button").addEventListener("click", AbsenceModule.controller.showAbsenceModalForCreate);
        this.recurringDayLabel = Stubegru.dom.querySelector("#absence_modal_form_recurring_label");
        this.viewFutureToggle = new StubegruToggle("#absence_modal_view_future_toggle");
        this.wholeDayToggle = new StubegruToggle("#absence_modal_form_whole_day_toggle");
        this.recurringToggle = new StubegruToggle("#absence_modal_form_recurring_toggle");
        this.notificationToggle = new StubegruToggle("#absence_modal_notification_toggle");
        this.form = Stubegru.dom.querySelector('#absence_modal_form');
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
        this.wholeDayToggle.setState(false);
        this.recurringToggle.setState(false);
        this.notificationToggle.setState(false);
        this.recurringDayLabel.innerHTML = "";
    };
    setFormData(absence) {
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value = absence.id;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_name").value = absence.name;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_description").value = absence.description;
        this.wholeDayToggle.setState(absence.wholeDay);
        const start = new Date(absence.start);
        const end = new Date(absence.end);
        const absenceFormatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        const absenceFormatTime = (date) => {
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
        };
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_date").value = absenceFormatDate(start);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_date").value = absenceFormatDate(end);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_time").value = absenceFormatTime(start);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_time").value = absenceFormatTime(end);
        const recurringValue = absence.recurring;
        const isRecurring = recurringValue != null;
        this.recurringToggle.setState(isRecurring);
        if (isRecurring) {
            Stubegru.dom.querySelectorAsInput("#absence_modal_form_recurring").value = recurringValue;
            this.recurringDayLabel.innerHTML = recurringValue; //TODO: Set pretty text
        }
    }
    getFormData() {
        const isWholeDay = this.wholeDayToggle.getState();
        let startString, endString;
        const startDate = Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_date").value;
        const startTime = Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_time").value;
        const endDate = Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_date").value;
        const endTime = Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_time").value;
        if (isWholeDay) {
            //Use only date
            startString = startDate;
            endString = endDate;
        }
        else {
            //Use date and time
            startString = startDate + " " + startTime;
            endString = endDate + " " + endTime;
        }
        startString = new Date(startString).toISOString();
        endString = new Date(endString).toISOString();
        const isRecurring = this.recurringToggle.getState();
        const recurringValue = isRecurring ? Stubegru.dom.querySelectorAsInput("#absence_modal_form_recurring").value : null;
        const sendNotification = this.notificationToggle.getState();
        return {
            id: Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value,
            name: Stubegru.dom.querySelectorAsInput("#absence_modal_form_name").value,
            description: Stubegru.dom.querySelectorAsInput("#absence_modal_form_description").value,
            start: startString,
            end: endString,
            recurring: recurringValue,
            wholeDay: isWholeDay,
            sendNotification: sendNotification
        };
    }
    async renderListView(absenceList) {
        let html = "";
        for (let l of absenceList) {
            html += `
                TODO: TO BE GENERATED 
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
            elem.addEventListener("click", (event) => { window.open(absenceUrl, "_blank"); });
        });
    }
}
