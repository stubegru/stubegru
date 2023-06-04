class AssignFeedbackModal {

    static resetAndShow() {
        $("#calendarAssignFeedbackModal .modal-body").html(`
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
        `);
        
        $('#calendarAssignFeedbackModal').modal('show');
    }

    static showFeedback(statusObject) {
        AssignFeedbackModal.setTask("clientData",statusObject.clientData.status,statusObject.clientData.message);
        AssignFeedbackModal.setTask("assign",statusObject.assign.status,statusObject.assign.message);
        AssignFeedbackModal.setTask("survey",statusObject.survey.status,statusObject.survey.message);
        AssignFeedbackModal.setTask("clientMail",statusObject.clientMail.status,statusObject.clientMail.message);
        AssignFeedbackModal.setTask("advisorMail",statusObject.advisorMail.status,statusObject.advisorMail.message);
    
    }

    static setTask(task,status,message){
        let li = $(`#calendarAssignFeedbackModal li[data-task="${task}"]`);
        li.children(`small`).html(message);

        if(status == "success"){
            li.addClass(`list-group-item-success`);
            li.children(`i`).attr("class","far fa-check-circle");
        }else{
            li.addClass(`list-group-item-danger`);
            li.children(`i`).attr("class", "far fa-times-circle");
        }
    }

}