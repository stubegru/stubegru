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
     * Reset all inputs in the Calendar meeting mail template form
     */
    resetTemplateForm() {
        $(".meeting-template-input").val("");
        CKEDITOR.instances.mailTemplateEditor.setData(""); //reset WYSIWYG editor
    }

    setTemplateDropdown(templateList) {
        let selectHtml = "<option value=''>Bitte wählen...</option>";
        let postHtml;
        for (const template of templateList) {
            const ownId = stubegru.currentUser.id;
            const optionString = `<option value='${template.id}' title='${template.text}' id='templateSelectOption${template.id}'>${template.titel}</option>`
            if (ownId == template.ersteller) { //Add own entry at top
                selectHtml += optionString;
            } else {
                postHtml += optionString;
            }
        }
        selectHtml += postHtml;
        $("#calendarTemplate").html(selectHtml);
    }














    /**
    * Reset all inputs in the Calendar meeting room form
    */
    resetRoomForm() {
        $(".meeting-room-input").val("");
    }

    setRoomDropdown(roomList) {
        let ownId = stubegru.currentUser.id;
        const channelDescriptions = {
            "personally": "Persönlich",
            "phone": "Telefon",
            "webmeeting": "Webmeeting"
        };

        let selectHtml = "<option value=''>Bitte wählen...</option>";
        let postHtml;
        for (const room of roomList) {
            const optionString = `<option value='${room.id}' id='roomSelectOption${room.id}' data-channel='${room.kanal}' >[${channelDescriptions[room.kanal]}] ${room.titel}</option>`
            if (ownId == room.besitzer) { //Add own entry at top
                selectHtml += optionString;
            } else {
                postHtml += optionString;
            }
        }
        $("#calendarRoom").html(selectHtml + postHtml);
    }

    setRoomFormVisible(isVisible) {
        isVisible ?
            $("#newroom").slideDown() :
            $("#newroom").slideUp();
    }

    setRoomData(roomData) {
        $("#raum_id").val(roomData.id);
        $("#raum_kanal").val(roomData.kanal);
        $("#raum_titel").val(roomData.titel);
        $("#raum_nr").val(roomData.raumnummer);
        $("#raum_etage").val(roomData.etage);
        $("#raum_strasse").val(roomData.strasse);
        $("#raum_hausnr").val(roomData.hausnummer);
        $("#raum_plz").val(roomData.plz);
        $("#raum_ort").val(roomData.ort);
        $("#raum_link").val(roomData.link);
        $("#raum_passwort").val(roomData.passwort);
        $("#raum_telefon").val(roomData.telefon);
    }

    getRoomData() {
        let roomData = {};
        roomData.id = $("#raum_id").val();
        roomData.kanal = $("#raum_kanal").val();
        roomData.titel = $("#raum_titel").val();
        roomData.raumnummer = $("#raum_nr").val();
        roomData.etage = $("#raum_etage").val();
        roomData.strasse = $("#raum_strasse").val();
        roomData.hausnummer = $("#raum_hausnr").val();
        roomData.plz = $("#raum_plz").val();
        roomData.ort = $("#raum_ort").val();
        roomData.link = $("#raum_link").val();
        roomData.passwort = $("#raum_passwort").val();
        roomData.telefon = $("#raum_telefon").val();
        return roomData;
    }









    

    async initAdvisorDropdown() {
        let ownId = stubegru.currentUser.id;
        let userList = await stubegru.modules.userUtils.getUserByPermission("MEETING_ADVISOR");
        let selectHtml = "";
        for (const user of userList) {
            if (ownId == user.id) { //Add own entry at top (default)
                selectHtml = `<option value="${user.id}">${user.name}</option>` + selectHtml;
            } else {
                selectHtml += `<option value="${user.id}">${user.name}</option>`;
            }
        }
        $("#calendarOwner").html(selectHtml);

    }

}