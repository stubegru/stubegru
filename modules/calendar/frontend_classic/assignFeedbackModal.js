class AssignFeedbackModal {

    static resetAndShow() {
        $("#calendarAssignFeedbackModal .modal-body").html(`
                <ul class="list-group">
                    <li class="list-group-item" data-task="meeting">
                        <i class="fas fa-spinner fa-spin"></i> Termin erstellt
                        <br>
                        <small></small>
                    </li>
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
        `);

        $('#calendarAssignFeedbackModal').modal('show');
    }

    static async showFeedback(statusObject) {
       
        if (statusObject.status == "error") {
            AssignFeedbackModal.setTask("overall", "error", `${statusObject.message || ""}<br>Der Termin konnte nicht vergeben werden. Die Terminvergabe wurde abgebrochen!<br>Dieses Fenster kann nun geschlossen werden.`);
            AssignFeedbackModal.setTask("clientData", "warning", "Terminvergabe abgebrochen");
            AssignFeedbackModal.setTask("assign", "warning", "Terminvergabe abgebrochen");
            AssignFeedbackModal.setTask("survey", "warning", "Terminvergabe abgebrochen");
            AssignFeedbackModal.setTask("clientMail", "warning", "Terminvergabe abgebrochen");
            AssignFeedbackModal.setTask("advisorMail", "warning", "Terminvergabe abgebrochen");
            return;
        }

        AssignFeedbackModal.setTask("clientData", statusObject.clientData.status, statusObject.clientData.message);
        await AssignFeedbackModal.wait(500);
        AssignFeedbackModal.setTask("assign", statusObject.assign.status, statusObject.assign.message);
        await AssignFeedbackModal.wait(500);
        AssignFeedbackModal.setTask("survey", statusObject.survey.status, statusObject.survey.message);
        await AssignFeedbackModal.wait(500);
        AssignFeedbackModal.setTask("clientMail", statusObject.clientMail.status, statusObject.clientMail.message);
        await AssignFeedbackModal.wait(500);
        AssignFeedbackModal.setTask("advisorMail", statusObject.advisorMail.status, statusObject.advisorMail.message);
        await AssignFeedbackModal.wait(500);

        if (statusObject.status == "success") {
            AssignFeedbackModal.setTask("overall", "success", `Die Terminvergabe war erfolgreich`);
        }
        else {
            AssignFeedbackModal.setTask("overall", "warning", `Der Termin wurde vergeben. Es konnten allerdings nicht alle zugehörigen Daten korrekt bearbeitet werden. Siehe detaillierte Auflistung oben.`);
        }

    }

    static async showMeetingFeedback(statusObject) {
        AssignFeedbackModal.setTask("meeting", statusObject.status, statusObject.message);

        if (statusObject.status == "error") {
            AssignFeedbackModal.setTask("overall", "error", `${statusObject.message || ""}<br>Der Termin konnte nicht erstellt werden. Die Terminvergabe wurde abgebrochen!<br>Dieses Fenster kann nun geschlossen werden.`);
            AssignFeedbackModal.setTask("clientData", "warning", "Termin konnte nicht erstellt werden");
            AssignFeedbackModal.setTask("assign", "warning", "Termin konnte nicht erstellt werden");
            AssignFeedbackModal.setTask("survey", "warning", "Termin konnte nicht erstellt werden");
            AssignFeedbackModal.setTask("clientMail", "warning", "Termin konnte nicht erstellt werden");
            AssignFeedbackModal.setTask("advisorMail", "warning", "Termin konnte nicht erstellt werden");
        }
    }

    static setTask(task, status, message) {
        let li = $(`#calendarAssignFeedbackModal li[data-task="${task}"]`);
        li.children(`small`).html(message);

        if (status == "success") {
            li.addClass(`list-group-item-success`);
            li.children(`i`).attr("class", "far fa-check-circle");
        } else {
            if (status == "warning") {
                li.addClass(`list-group-item-warning`);
                li.children(`i`).attr("class", "fas fa-exclamation-triangle");
            } else {
                li.addClass(`list-group-item-danger`);
                li.children(`i`).attr("class", "far fa-times-circle");
            }
        }
    }

    static async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

}