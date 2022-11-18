class CalendarModal {

    static channelDescriptions = {
        "personally": "Persönlich",
        "phone": "Telefon",
        "webmeeting": "Webmeeting",
        "digital": "Nur digital (Fon + Web)",
        "all": "Alle",
    };

    async init() {

        //Set meeting end time if the start value changes
        $("#calendarStart").on("change", this.setMeetingEndTimeByStartTime);
        //Reset modal forms on hide event
        $("#terminmodal").on('hidden.bs.modal', CalendarController.modal.resetAllForms);

        await Room.fetchRooms();
        this.setRoomDropdown(Room.roomList);
        this.initRoomEditButtons();

        await MailTemplate.fetchMailTemplates();
        this.setTemplateDropdown(MailTemplate.mailTemplateList);
        this.initTemplateEditButtons();

        await CalendarController.modal.initAdvisorDropdown();
        this.initMeetingDetailChannelDropdown();

        //Init richtext editor for mail templates
        CKEDITOR.replace('mailTemplateEditor');
    }



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
        this.setInfoAlert(false);
    }

    /**
     * Sets the text for the info alert in calendarModal.
     * Alert is hidden if the text is empty ro not given
     * @param {string} text Text to be displayed in the alert (HTML allowed)
     */
    setInfoAlert(text) {
        (text && text.length > 0) ?
            $("#calendarModalInfoAlert").show() :
            $("#calendarModalInfoAlert").hide();
        $("#calendarModalInfoAlert").html(text);
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
    * Reset all inputs in the Calendar meeting detail form
    */
    resetMeetingDetailForm = () => {
        this.enableDetailMeetingForm(true);
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
        meetingData["channel"] = $('#calendarChannel').val();
        return meetingData;
    }

    setMeetingDetailData(meeting) {
        $('#calendarDate').val(meeting.date);
        $('#calendarStart').val(meeting.start);
        $('#calendarEnd').val(meeting.end);
        $('#calendarTitle').val(meeting.title);
        $('#calendarOwner').val(meeting.ownerId);
        $('#calendarChannel').val(meeting.channel);

        $('#calendarRoom').val(meeting.room);
        $('#calendarTemplate').val(meeting.template);
    }

    /**
     * If the value of the meeting start time input changes, this function is called to set the end time to an according value
     */
    setMeetingEndTimeByStartTime() {
        let startTime = $("#calendarStart").val();
        if (startTime.length == 5) {
            let hours = startTime.substr(0, 2);
            let minutes = startTime.substr(3, 2);
            hours++;
            $("#calendarEnd").val(hours + ":" + minutes);
        }
    }

    initMeetingDetailChannelDropdown() {
        let html = `<option value="">Bitte wählen...</option>`;
        const names = CalendarModal.channelDescriptions;
        for (let channelId in names) {
            html += `<option value="${channelId}">${names[channelId]}</option>`;
        }
        $("#calendarChannel").html(html);
    }






    /**
   * Reset all inputs in the client data form
   */
    resetClientForm = () => {
        this.enableClientForm(true);
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
        clientData["channel"] = $("#calendarClientChannel").val();
        return clientData;
    }

    setClientData = (client) => {
        this.initClientChannelDropdown(client.channel);
        $('#calendarClientName').val(client.name);
        $('#calendarClientMail').val(client.mail);
        $('#calendarClientIssue').val(client.description);
        $('#calendarClientPhone').val(client.phone);
        $('#calendarClientSurvey').val("");
        $('#calendarClientChannel').val(client.channel);
    }

    initClientChannelDropdown(meetingChannel) {
        let channelOptions = [];

        if (meetingChannel == "all") { channelOptions.push("personally", "phone", "webmeeting"); }
        else if (meetingChannel == "digital") { channelOptions.push("phone", "webmeeting"); }
        else { channelOptions.push(meetingChannel); }

        let html = `<option value="">Bitte wählen...</option>`;
        const names = CalendarModal.channelDescriptions;
        for (let channelId of channelOptions) {
            html += `<option value="${channelId}">${names[channelId]}</option>`;
        }
        $("#calendarClientChannel").html(html)
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

    initTemplateEditButtons() {
        $("#calendarEditTemplateButton").on("click", () => {
            const templateId = $("#calendarTemplate").val();

            if (templateId == null || templateId == "") {
                stubegru.modules.alerts.alert({
                    title: "Mailvorlage bearbeiten:",
                    text: "Bitte erst eine Mailvorlage auswählen",
                    type: "warning",
                    mode: "toast"
                });
                return;
            }

            const template = MailTemplate.getById(templateId);
            this.setTemplateData(template);
            this.setTemplateFormVisible(true);
        });

        $("#calendarNewTemplateButton").on("click", () => {
            this.resetTemplateForm();
            $("#templateId").val("new");
            this.setTemplateFormVisible(true);
        });

        $("#calendarSaveTemplateButton").on("click", async () => {
            let templateId = $("#templateId").val();
            let resp;

            if (templateId == "new") {
                //create new Template
                resp = await MailTemplate.createOnServer(this.getTemplateData());
                templateId = resp.optionId;
            } else {
                //update existing Template
                let template = MailTemplate.getById(templateId);
                template.applyProperties(this.getTemplateData());
                resp = await template.updateOnServer();
            }

            stubegru.modules.alerts.alert({
                title: "Mailvorlage speichern",
                text: resp.message,
                type: resp.status
            });
            if (resp.status != "success") { return }

            //Refresh template list
            await MailTemplate.fetchMailTemplates();
            this.setTemplateDropdown(MailTemplate.mailTemplateList);
            this.resetTemplateForm();
            this.setTemplateFormVisible(false);

            //auto-select previously edited/created template
            $("#calendarTemplate").val(templateId);
        });

        $("#calendarCancelTemplateButton").on("click", () => {
            this.resetTemplateForm();
            this.setTemplateFormVisible(false);
        });

        $("#calendarDeleteTemplateButton").on("click", () => {
            deleteConfirm("Mailvorlage löschen", "Soll diese Mailvorlage wirklich gelöscht werden?", async () => {
                let templateId = $("#templateId").val();
                if (templateId != "new") {
                    let template = MailTemplate.getById(templateId);
                    let resp = await template.deleteOnServer();

                    stubegru.modules.alerts.alert({
                        title: "Mailvorlage Löschen",
                        text: resp.message,
                        type: resp.status
                    });
                    if (resp.status != "success") { return }


                    await MailTemplate.fetchMailTemplates();
                    this.setTemplateDropdown(MailTemplate.mailTemplateList);
                }
                this.resetTemplateForm();
                this.setTemplateFormVisible(false);
            });
        });
    }

    setTemplateFormVisible(isVisible) {
        isVisible ?
            $("#newmail").slideDown() :
            $("#newmail").slideUp();
    }

    getTemplateData() {
        let templateData = {};
        templateData.id = $("#templateId").val();
        templateData.titel = $("#templateTitle").val();
        templateData.betreff = $("#templateSubject").val();
        templateData.text = CKEDITOR.instances.mailTemplateEditor.getData();
        return templateData;
    }

    setTemplateData(templateData) {
        $("#templateId").val(templateData.id);
        $("#templateTitle").val(templateData.titel);
        $("#templateSubject").val(templateData.betreff);
        CKEDITOR.instances.mailTemplateEditor.setData(templateData.text)
    }










    /**
    * Reset all inputs in the Calendar meeting room form
    */
    resetRoomForm() {
        $(".meeting-room-input").val("");
    }

    setRoomDropdown(roomList) {
        let ownId = stubegru.currentUser.id;

        let selectHtml = "<option value=''>Bitte wählen...</option>";
        let postHtml;
        for (const room of roomList) {
            const optionString = `<option value='${room.id}'>${room.titel}</option>`
            ownId == room.besitzer ? selectHtml += optionString : postHtml += optionString; //Add own entries at top
        }
        $("#calendarRoom").html(selectHtml + postHtml);
    }

    initRoomEditButtons() {
        $("#calendarEditRoomButton").on("click", () => {
            const roomId = $("#calendarRoom").val();

            if (roomId == null || roomId == "") {
                stubegru.modules.alerts.alert({
                    title: "Raum bearbeiten:",
                    text: "Bitte erst einen Raum auswählen",
                    type: "warning",
                    mode: "toast"
                });
                return;
            }

            const room = Room.getById(roomId);
            this.setRoomData(room);
            this.setRoomFormVisible(true);
        });

        $("#calendarNewRoomButton").on("click", () => {
            this.resetRoomForm();
            $("#raum_id").val("new");
            this.setRoomFormVisible(true);
        });

        $("#calendarSaveRoomButton").on("click", async () => {
            let roomId = $("#raum_id").val();
            let resp;

            if (roomId == "new") {
                //create new Room
                resp = await Room.createOnServer(this.getRoomData());
                roomId = resp.roomId;
            } else {
                //update existing Room
                let room = Room.getById(roomId);
                room.applyProperties(this.getRoomData());
                resp = await room.updateOnServer();
            }

            stubegru.modules.alerts.alert({
                title: "Raum Speichern",
                text: resp.message,
                type: resp.status
            });
            if (resp.status != "success") { return }

            //Refresh room list
            await Room.fetchRooms();
            this.setRoomDropdown(Room.roomList);
            this.resetRoomForm();
            this.setRoomFormVisible(false);

            //auto-select previously edited/created room
            $("#calendarRoom").val(roomId);
        });

        $("#calendarCancelRoomButton").on("click", () => {
            this.resetRoomForm();
            this.setRoomFormVisible(false);
        });

        $("#calendarDeleteRoomButton").on("click", () => {
            deleteConfirm("Raum löschen", "Soll dieser Raum wirklich gelöscht werden?", async () => {
                let roomId = $("#raum_id").val();
                if (roomId != "new") {
                    let room = Room.getById(roomId);
                    let resp = await room.deleteOnServer();

                    stubegru.modules.alerts.alert({
                        title: "Raum Löschen",
                        text: resp.message,
                        type: resp.status
                    });
                    if (resp.status != "success") { return }


                    await Room.fetchRooms();
                    this.setRoomDropdown(Room.roomList);
                }
                this.resetRoomForm();
                this.setRoomFormVisible(false);
            });
        });
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