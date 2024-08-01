import { Modal } from "../../../../components/bootstrap/v3/ts_wrapper.js";

export default class CalendarModal {

    static channelDescriptions = {
        "personally": "Persönlich",
        "phone": "Telefon",
        "webmeeting": "Webmeeting",
        "digital": "Nur digital (Fon + Web)",
        "all": "Alle",
    };

    modal:Modal;

    async init() {
        this.modal = new Modal("#terminmodal"); //TODO: Change naming


        this.setUnsavedChanges(false);
        this.initFomularChangeListener();
        //ask for unsaved changes
        $("#terminmodal").on('hide.bs.modal', this.askForUnsavedChanges);
        //Reset modal forms on hide event
        $("#terminmodal").on('hidden.bs.modal', this.resetAllForms);

        await Room.fetchRooms();
        this.setRoomDropdown(Room.roomList);
        this.initRoomEditButtons();

        await MailTemplate.fetchMailTemplates();
        this.setTemplateDropdown(MailTemplate.mailTemplateList);
        this.initTemplateEditButtons();

        await this.initAdvisorDropdown();
        this.initMeetingDetailChannelDropdown();

        //Init richtext editor for mail templates
        CKEDITOR.replace('mailTemplateEditor', { height: "400px" });
    }

    askForUnsavedChanges = () => {
        if (!this.unsavedChanges) { return true; }
        return confirm("Es gibt ungespeicherte Änderungen. Soll das Formular wirklich geschlossen werden?");
    }

    setUnsavedChanges = (unsavedChanges) => {
        this.unsavedChanges = unsavedChanges;
        unsavedChanges ?
            $("#calendarModalChangesInfo").html(`<i class="fas fa-circle" style="color: #d9534f"></i> Ungespeicherte Änderungen`) :
            $("#calendarModalChangesInfo").html(`<i class="fas fa-circle" style="color: #5cb85c"></i> Alle Änderungen gespeichert`);

        if (unsavedChanges && CalendarController.freeMeetingMode) {
            this.showAssignButtons(false, false, false, false);
            this.setInfoAlert("Es wurden Änderungen am Termin vorgenommen. Bitte Termin speichern bevor er an einen Kunden vergeben werden kann.")
        }
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
     * Hides the info alert
     * Clear all buttons event listeners
     */
    resetAllForms = async () => {
        await this.resetMeetingDetailForm();
        this.resetClientForm();
        this.resetRoomForm();
        this.setRoomFormVisible(false);
        this.resetTemplateForm();
        this.setTemplateFormVisible(false);
        this.setInfoAlert(false);
        CalendarController.freeMeetingMode = false;
        CalendarController.blockedMeeting = false;
        $(".calendar-footer-button").off();
        $(".calendar-assign-button").off();
        $("#calendarMeetingDetailForm").off("submit");
        this.setUnsavedChanges(false);
    }

    initFomularChangeListener() {
        $('.meeting-details').on("change", () => CalendarController.modal.setUnsavedChanges(true));
        $(".meeting-room-input").on("change", () => CalendarController.modal.setUnsavedChanges(true));
        $(".meeting-template-input").on("change", () => CalendarController.modal.setUnsavedChanges(true));
        $(".meeting-client").on("change", () => CalendarController.modal.setUnsavedChanges(true));
        $("#calendarStart").on("change", this.setMeetingEndTimeByStartTime);
    }



    /**
     * Sets the text for the info alert in calendarModal.
     * Alert is hidden if the text is empty or not given
     * @param {string} text Text to be displayed in the alert (HTML allowed)
     */
    setInfoAlert(text) {
        (text && text.length > 0) ?
            $("#calendarModalInfoAlert").show() :
            $("#calendarModalInfoAlert").hide();
        $("#calendarModalInfoAlert").html(`<i class="fas fa-info-circle"></i> ${text}`);
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
  * Register eventhandler for click on the assign save button
  * This does automatically clear all currently registered events
  * Assign Save button acts as submit button for client detail form
  * @param {function} callback Function to be executed if the button is clicked
  */
    setAssignSaveButtonEvent(callback) {
        //Set action as form submit and NOT as button click to make use of checking for required inputs etc.
        $("#calendarClientDataForm").off("submit");
        $("#calendarClientDataForm").on("submit", (event) => {
            event.preventDefault();
            callback(event);
        });
    }

    /**
     * Register eventhandler for click on the assign assign button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignAssignButtonEvent(callback) {
        $("#calendarAssignAssignButton").off();
        $("#calendarAssignAssignButton").on("click", callback);
    }

    /**
     * Register eventhandler for click on the assign delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignDeleteButtonEvent(callback) {
        $("#calendarAssignDeleteButton").off();
        $("#calendarAssignDeleteButton").on("click", callback);
    }

    /**
     * Register eventhandler for click on the assign cancel button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignCancelButtonEvent(callback) {
        $("#calendarAssignCancelButton").off();
        $("#calendarAssignCancelButton").on("click", callback);
    }

    /**
     * Enable / disable buttons for a meeting
     * @param {boolean} save wether to enable the save button
     * @param {boolean} saveNext wether to show or hide the save&next button
     * @param {boolean} remove wether to enable the delete button
     * @param {boolean} cancel wether to enable the cancel button
     */
    enableFooterButtons(save, saveNext, remove, cancel) {
        $("#calendarSaveMeetingButton").prop("disabled", !save);
        $("#calendarDeleteMeetingButton").prop("disabled", !remove);
        $("#calendarCancelButton").prop("disabled", !cancel);
        saveNext ? $("#calendarSaveNextMeetingButton").show() : $("#calendarSaveNextMeetingButton").hide();
    }

    /**
     * Register eventhandler for click on the footer save button
     * This does automatically clear all currently registered events
     * Footer Save button acts as submit button for meeting detail form
     * @param {function} callback Function to be executed if the button is clicked
     */
    setFooterSaveButtonEvent(callback) {
        //Set action as form submit and NOT as button click to make use of checking for required inputs etc.
        $("#calendarMeetingDetailForm").off("submit");
        $("#calendarMeetingDetailForm").on("submit", (event) => {
            event.preventDefault();
            callback(event);
        });
    }

    /**
     * Register eventhandler for click on the footer delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setFooterDeleteButtonEvent(callback) {
        $("#calendarDeleteMeetingButton").off();
        $("#calendarDeleteMeetingButton").on("click", callback);
    }


    /**
    * Reset all inputs in the Calendar meeting detail form
    */
    resetMeetingDetailForm = async () => {
        this.enableDetailMeetingForm(true);
        $('.meeting-details').val("");

        //load from custom config
        const calendarTitle = await stubegru.modules.customEvents.trigger("generateMeetingTitle");
        $('#calendarTitle').val(calendarTitle);
        $("#calendarOwner").val(stubegru.currentUser.id);
        $("#calendarChannel").val("all");
        $("#calendarRoom")[0].selectedIndex = 1; //Select first entry by default
        $("#calendarTemplate")[0].selectedIndex = 1;

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

        $('#calendarRoom').val(meeting.roomId);
        $('#calendarTemplate').val(meeting.templateId);
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
            hours = hours < 10 ? `0${hours}` : hours;
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
        $('#calendarClientSurvey').val(client.formular);
        $('#calendarClientChannel').val(client.channel);
        $('#calendarClientPhone').val(this.prettyPrintPhoneNumber(client.phone));
    }

    prettyPrintPhoneNumber(phone) {
        if (!/\d/.test(phone)) { return phone; } //Dont beautify if not contains any number
        let output = "";
        for (const index in phone) {
            let char = phone[index];
            output += char;
            if (index % 4 == 3) { output += " "; }
        }
        return output;
    }

    showBlockError(userName, callback) {
        callback = callback || function () { };
        swal({
            title: "Termin ist blockiert",
            text: `Dieser Termin wird bereits von einem anderen Nutzer bearbeitet. Daher kann dieser Termin aktuell nicht vergeben werden. Der Termin ist aktuell gesperrt durch: ${userName}.`,
            type: "error"
        }, callback);
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

    async initTemplateEditButtons() {
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

        $("#calendarTemplateForm").on("submit", async (event) => {
            event.preventDefault();
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
            $("#calendarTemplate").trigger("change");
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


        //Show available template variables
        const templateVariableList = await MailTemplate.getTemplateVariables();
        let templateVariableObject = {
            meeting: { title: "Termin", items: [] },
            room: { title: "Beratungsraum", items: [] },
            client: { title: "Kunde", items: [] },
            extra: { title: "Sonstiges", items: [] }
        };

        for (const t of templateVariableList) { templateVariableObject[t.category].items.push(t); }

        let varHtml = ``;
        for (const categoryId in templateVariableObject) {
            const category = templateVariableObject[categoryId];
            varHtml += `<h4><b>${category.title}</b></h4><ul style="padding-inline-start: 10px">`;
            for (const t of category.items) {
                varHtml += `<li>
                                <b>${t.placeholder}</b> <br>
                                <small>${t.description}</small>
                            </li>`;
            }
            varHtml += `</ul><br>`;
        }

        $("#calendarTemplateVariablesContainer").html(varHtml);
    }

    setTemplateFormVisible(isVisible) {
        if (isVisible){
            $("#newmail").slideDown();
            this.setUnsavedChanges(true); //this is not always correct, but seems to be useful
        }else{
            $("#newmail").slideUp();
        }
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










    

}