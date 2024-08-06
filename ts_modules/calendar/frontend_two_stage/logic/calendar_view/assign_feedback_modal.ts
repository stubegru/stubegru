import Stubegru from '../../../../../components/stubegru_core/logic/stubegru.js';
import { Modal } from '../../../../../components/bootstrap/v3/ts_wrapper.js';

export default class AssignFeedbackModal {
    modal: Modal;

    init() {
        this.modal = new Modal('#calendar_assign_feedback_modal'); >>>change in html
    }

    resetAndShow() {
        Stubegru.dom.querySelector("#calendarAssignFeedbackModal .modal-body").innerHTML = `
                <ul class="list-group">
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

    async showFeedback(statusObject) {

        if (statusObject.status == "error") {
            this.setTask("overall", "error", `${statusObject.message || ""}<br>Der Termin konnte nicht vergeben werden. Die Terminvergabe wurde abgebrochen!<br>Dieses Fenster kann nun geschlossen werden.`);
            this.setTask("clientData", "warning", "Terminvergabe abgebrochen");
            this.setTask("assign", "warning", "Terminvergabe abgebrochen");
            this.setTask("survey", "warning", "Terminvergabe abgebrochen");
            this.setTask("clientMail", "warning", "Terminvergabe abgebrochen");
            this.setTask("advisorMail", "warning", "Terminvergabe abgebrochen");
            return;
        }

        this.setTask("clientData", statusObject.clientData.status, statusObject.clientData.message);
        await Stubegru.utils.wait(500);
        this.setTask("assign", statusObject.assign.status, statusObject.assign.message);
        await Stubegru.utils.wait(500);
        this.setTask("survey", statusObject.survey.status, statusObject.survey.message);
        await Stubegru.utils.wait(500);
        this.setTask("clientMail", statusObject.clientMail.status, statusObject.clientMail.message);
        await Stubegru.utils.wait(500);
        this.setTask("advisorMail", statusObject.advisorMail.status, statusObject.advisorMail.message);
        await Stubegru.utils.wait(500);

        if (statusObject.status == "success") {
            this.setTask("overall", "success", `Die Terminvergabe war erfolgreich`);
        }
        else {
            this.setTask("overall", "warning", `Der Termin wurde vergeben. Es konnten allerdings nicht alle zugehörigen Daten korrekt bearbeitet werden. Siehe detaillierte Auflistung oben.`);
        }
    }

    setTask(task, status, message) {
        let li = Stubegru.dom.querySelector(`#calendarAssignFeedbackModal li[data-task="${task}"]`);
        (li.querySelector('small') as HTMLElement).innerHTML = message;

        if (status === "success") {
            li.classList.add('list-group-item-success');
            (li.querySelector('i') as HTMLElement).className = "far fa-check-circle";
        } else if (status === "warning") {
            li.classList.add('list-group-item-warning');
            (li.querySelector('i') as HTMLElement).className = "fas fa-exclamation-triangle";
        } else {
            li.classList.add('list-group-item-danger');
            (li.querySelector('i') as HTMLElement).className = "far fa-times-circle";
        }
    }

}