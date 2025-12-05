import Stubegru from '../../../../../components/stubegru_core/logic/stubegru.js';
import { Modal } from '../../../../../components/bootstrap/v3/ts_wrapper.js';
import CalendarModule from '../calendar_module.js';
export default class AssignFeedbackModal {
    modal;
    constructor() {
        this.modal = new Modal('#meeting_assign_feedback_modal');
    }
    resetAndShow() {
        Stubegru.dom.querySelector("#meeting_assign_feedback_modal .modal-body").innerHTML = `
                <ul class="list-group" id="assign_feedback_modal_detail_list">
                    <li class="list-group-item" data-task="clientData">
                        <i class="fas fa-spinner fa-spin"></i> Kundendaten gespeichert
                        <br>
                        <small></small>
                    </li>
                    <li class="list-group-item" data-task="assign">
                        <i class="fas fa-spinner fa-spin"></i> Termin mit Kunde verknüpft
                        <br><small></small>
                    </li>
                    <li class="list-group-item" data-task="survey">
                        <i class="fas fa-spinner fa-spin"></i> Mailversand für Feedbackfragebogen vorgemerkt
                        <br><small></small>
                    </li>
                    <li class="list-group-item" data-task="clientMail">
                        <i class="fas fa-spinner fa-spin"></i> Mail an Kunden versendet
                        <br><small></small>
                    </li>
                    <li class="list-group-item" data-task="advisorMail">
                        <i class="fas fa-spinner fa-spin"></i> Mail an Berater:in versendet
                        <br><small></small>
                    </li>
                </ul>
                <br>

                <ul class="list-group">
                <li class="list-group-item" data-task="overall">
                    <i class="fas fa-spinner fa-spin"></i> <b>Terminvergabe abschließen</b>
                    <br>
                    <small></small>
                </li>
                <br>
                <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fas fa-times"></i> Fenster schließen</button>
        `;
        this.modal.show();
    }
    async showFeedback(statusObject, meeting) {
        if (statusObject.status == "error") {
            CalendarModule.calendarView.assignFeedbackModal.resetAndShow();
            this.setTask("overall", "error", `${statusObject.message || ""}<br>Der Termin konnte nicht vergeben werden. Die Terminvergabe wurde abgebrochen!<br>Dieses Fenster kann nun geschlossen werden.`);
            this.setTask("clientData", statusObject.clientData?.status || "error", statusObject.clientData?.message || "Terminvergabe abgebrochen");
            this.setTask("assign", statusObject.assign?.status || "error", statusObject.assign?.message || "Terminvergabe abgebrochen");
            this.setTask("survey", statusObject.survey?.status || "error", statusObject.survey?.message || "Terminvergabe abgebrochen");
            this.setTask("clientMail", statusObject.clientMail?.status || "error", statusObject.clientMail?.message || "Terminvergabe abgebrochen");
            this.setTask("advisorMail", statusObject.advisorMail?.status || "error", statusObject.advisorMail?.message || "Terminvergabe abgebrochen");
            return;
        }
        //No error => Hide calendar, show Feedback Container
        Stubegru.dom.hide("#self_service_appointment_container");
        Stubegru.dom.show("#self_service_feedback_container");
        Stubegru.dom.querySelector("#self_service_mail_template").innerHTML = statusObject.clientMail.content;
        Stubegru.dom.querySelector("#self_service_feedback_client_mail").innerHTML = statusObject.clientMail.address;
        // Append download link for ICS file
        const icsContent = statusObject.clientMail.ics;
        if (icsContent) {
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'appointment.ics';
            downloadLink.className = 'btn btn-primary';
            downloadLink.innerHTML = '<i class="fas fa-download"></i> Termin als Kalenderdatei (.ics) herunterladen';
            Stubegru.dom.querySelector("#self_service_feedback_alert").appendChild(downloadLink);
        }
    }
    setTask(task, status, message) {
        let li = Stubegru.dom.querySelector(`#meeting_assign_feedback_modal li[data-task="${task}"]`);
        li.querySelector('small').innerHTML = message;
        if (status === "success") {
            li.classList.add('list-group-item-success');
            li.querySelector('i').className = "far fa-check-circle";
        }
        else if (status === "warning") {
            li.classList.add('list-group-item-warning');
            li.querySelector('i').className = "fas fa-exclamation-triangle";
        }
        else {
            li.classList.add('list-group-item-danger');
            li.querySelector('i').className = "far fa-times-circle";
        }
    }
}
