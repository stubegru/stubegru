class CalendarModal {
    /**
     * Show or hide the meeting appointment modal
     * @param {boolean} state true to show the modal, false to hide
     */
    showModal(state) {
        $("#terminmodal").modal(state ? "show" : "hide");
    }

    /**
     * Set the modals title, displayed in it's header
     * @param {string} title 
     */
    setTitle(title) {
        $("#terminmodalTitle").html(title);
    }

    /**
     * Reset all inputs in the Calendar meeting detail form
     */
    resetMeetingDetailForm() {
        $('.meeting-details').val("");

        //load from custom config
        const calendarTitle = stubegru.constants.CUSTOM_CONFIG.calendarMeetingTitle || "Beratungstermin";
        $('#calendarTitle').val(calendarTitle);
    }

    /**
     * Reset all inputs in the Calendar meeting room form
     */
    resetRoomForm() {
        $(".meeting-room-input").val("");
    }

    /**
     * Reset all inputs in the Calendar meeting mail template form
     */
    resetTemplateForm() {
        $(".meeting-template-input").val("");
        CKEDITOR.instances.mailTemplateEditor.setData(""); //reset WYSIWYG editor
    }

    /**
     * Reset all inputs in the client data form
     */
    resetClientForm() {
        $(".meeting-client").val("");
    }

    /**
     * Resets the meetingDetail-, client-, room- and templateForm
     */
    resetAllForms = ()=>{
        this.resetMeetingDetailForm();
        this.resetClientForm();
        this.resetRoomForm();
        this.resetTemplateForm();
    }

    /**
     * Show / hide buttons for client assignment
     * @param {boolean} assign wether to show the assign button
     * @param {boolean} save wether to show the save button
     * @param {boolean} remove wether to show the delete button
     * @param {boolean} cancel wether to show the cancel button
     */
    showAssignButtons(assign, save, remove, cancel) {
        sh($("#calendarAssignAssignButton"), assign);
        sh($("#calendarAssignSaveButton"), save);
        sh($("#calendarAssignDeleteButton"), remove);
        sh($("#calendarAssignCancelButton"), cancel);

        function sh(e, b) { b ? e.show() : e.hide(); }
    }

    /**
     * Show / hide buttons for a meeting
     * @param {boolean} saveAssign wether to show the save and assign button
     * @param {boolean} save wether to show the save button
     * @param {boolean} remove wether to show the delete button
     * @param {boolean} cancel wether to show the cancel button
     */
    showFooterButtons(saveAssign, save, remove, cancel) {
        sh($("#calendarSaveAssignMeetingButton"), saveAssign);
        sh($("#calendarSaveMeetingButton"), save);
        sh($("#calendarDeleteMeetingButton"), remove);
        sh($("#calendarCancelButton"), cancel);

        function sh(e, b) { b ? e.show() : e.hide(); }
    }

    /**
     * @returns {boolean} wether the current user has write permissions for calendar meetings
     */
    isCalendarWriteUser() {
        const writePermission = stubegru.modules.userUtils.permissionRequests.find(e => e.name == "MEETINGS_WRITE");
        return writePermission.access;
    }

    getMeetingData() {
        let meetingData = {};
        meetingData["date"] = $('#calendarDate').val();
        meetingData["start"] = $('#calendarStart').val();
        meetingData["end"] = $('#calendarEnd').val();
        meetingData["title"] = $('#calendarTitle').val();
        meetingData["ownerId"] = $('#calendarOwner').val();
        meetingData["roomId"] = $('#calendarRoom').val();
        meetingData["templateId"] = $('#calendarTemplate').val();
        return meetingData;
    }

    showMeetingData(meeting) {
        $('#calendarDate').val(meeting.date);
        $('#calendarStart').val(meeting.start);
        $('#calendarEnd').val(meeting.end);
        $('#calendarTitle').val(meeting.title);
        $('#calendarOwner').val(meeting.ownerId);

        $('#calendarRoom').val(meeting.room);
        $('#calendarTemplate').val(meeting.template);
    }

    getClientData() {
        let clientData = {};
        clientData["name"] = $("#calendarClientName").val();
        clientData["mail"] = $("#calendarClientMail").val();
        clientData["phone"] = $("#calendarClientPhone").val();
        clientData["survey"] = $("#calendarClientSurvey").val();
        clientData["issue"] = $("#calendarClientIssue").val();
        return clientData;
    }

    showClientData(client) {
        $('#calendarClientName').val(client.name);
        $('#calendarClientMail').val(client.mail);
        $('#calendarClientIssue').val(client.description);
        $('#calendarClientPhone').val(client.phone);
        $('#calendarClientSurvey').val("");
    }
}