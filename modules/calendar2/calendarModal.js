class CalendarModal {
    /**
     * Show or hide the meeting appointment modal
     * @param {boolean} state true to show the modal, false to hide
     */
    setModalVisible(state) {
        $("#terminmodal").modal(state ? "show" : "hide");
    }

    /**
     * Set the modals title, displayed in it's header
     * @param {string} title 
     */
    setModalTitle(title) {
        $("#terminmodalTitle").html(title);
    }



    /**
     * Resets the meetingDetail-, client-, room- and templateForm
     */
    resetAllForms = () => {
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
     * Enable / disable buttons for a meeting
     * @param {boolean} save wether to enable the save button
     * @param {boolean} saveClose wether to enable the save&close button
     * @param {boolean} remove wether to enable the delete button
     * @param {boolean} cancel wether to enable the cancel button
     */
    enableFooterButtons(save, saveClose, remove, cancel) {
        $("#calendarSaveMeetingButton").prop("disabled", !save);
        $("#calendarSaveCloseMeetingButton").prop("disabled", !saveClose);
        $("#calendarDeleteMeetingButton").prop("disabled", !remove);
        $("#calendarCancelButton").prop("disabled", !cancel);
    }

    /**
     * @returns {boolean} wether the current user has write permissions for calendar meetings
     */
    isCalendarWriteUser() {
        const writePermission = stubegru.modules.userUtils.permissionRequests.find(e => e.name == "MEETINGS_WRITE");
        return writePermission.access;
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

    enableDetailMeetingForm(isEnabled) {
        $('.meeting-details').prop("disabled", !isEnabled);
    }


    getMeetingDetailData() {
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

    setMeetingDetailData(meeting) {
        $('#calendarDate').val(meeting.date);
        $('#calendarStart').val(meeting.start);
        $('#calendarEnd').val(meeting.end);
        $('#calendarTitle').val(meeting.title);
        $('#calendarOwner').val(meeting.ownerId);

        $('#calendarRoom').val(meeting.room);
        $('#calendarTemplate').val(meeting.template);
    }






    /**
   * Reset all inputs in the client data form
   */
    resetClientForm() {
        $(".meeting-client").val("");
    }

    enableClientForm(isEnabled) {
        $('.meeting-client').prop("disabled", !isEnabled);
    }

    setClientVisible(isVisible) {
        isVisible ?
            $("#calendarClientDataContainer").slideDown() :
            $("#calendarClientDataContainer").slideUp();
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

    setClientData(client) {
        $('#calendarClientName').val(client.name);
        $('#calendarClientMail').val(client.mail);
        $('#calendarClientIssue').val(client.description);
        $('#calendarClientPhone').val(client.phone);
        $('#calendarClientSurvey').val("");
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

}