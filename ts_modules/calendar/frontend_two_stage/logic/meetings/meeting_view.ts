import { Modal } from "../../../../../components/bootstrap/v3/ts_wrapper.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";

const MC = CalendarModule.meetingController;
export default class MeetingView {

    static channelDescriptions = {
        "personally": "Persönlich",
        "phone": "Telefon",
        "webmeeting": "Webmeeting",
        "digital": "Nur digital (Fon + Web)",
        "all": "Alle",
    };

    modal: Modal;

    async init() {
        this.modal = new Modal("#terminmodal"); //TODO: Change naming

        this.setUnsavedChanges(false);
        this.initFomularChangeListener();
        //ask for unsaved changes
        this.modal.addEventListener('hide.bs.modal', this.askForUnsavedChanges);
        //Reset modal forms on hide event
        this.modal.addEventListener('hidden.bs.modal', this.resetAllForms);

        await this.initAdvisorDropdown();
        this.initMeetingDetailChannelDropdown();
    }

    askForUnsavedChanges() {
        if (!MC.state.unsavedChanges) { return true; }
        return confirm("Es gibt ungesicherte Änderungen. Soll das Formular wirklich geschlossen werden?");
    }

    setUnsavedChanges(hasUnsavedChanges: boolean) {
        MC.state.unsavedChanges = hasUnsavedChanges;
        hasUnsavedChanges ?
            Stubegru.dom.querySelector("#calendarModalChangesInfo").innerHTML = `<i class="fas fa-circle" style="color: #d9534f"></i> Ungesicherte Änderungen` :
            Stubegru.dom.querySelector("#calendarModalChangesInfo").innerHTML = `<i class="fas fa-circle" style="color: #5cb85c"></i> Alle Änderungen gespeichert`;

        if (hasUnsavedChanges && MC.state.freeMeetingMode) {
            this.showAssignButtons(false, false, false, false);
            this.setInfoAlert("Es wurden Änderungen am Termin vorgenommen. Bitte Termin speichern bevor er an einen Kunden vergeben werden kann.")
        }
    }

    /**
     * Show or hide the meeting appointment modal
     * @param {boolean} state true to show the modal, false to hide
     */
    setModalVisible(state) {
        state ? this.modal.show() : this.modal.hide();
    }

    /**
     * Set the modals title, displayed in it's header
     * @param {string} title 
     */
    setModalTitle(title) {
        Stubegru.dom.querySelector("#terminmodalTitle").innerHTML = title;
    }

    /**
     * Resets the meetingDetail-, client-, room- and templateForm
     * Hides the info alert
     * Clear all buttons event listeners
     */
    resetAllForms = async () => {
        await this.resetMeetingDetailForm();
        this.resetClientForm();
        CalendarModule.roomView.resetRoomForm();
        CalendarModule.roomView.setRoomFormVisible(false);
        CalendarModule.mailTemplateView.resetTemplateForm();
        CalendarModule.mailTemplateView.setTemplateFormVisible(false);
        this.setInfoAlert("");
        MC.state.freeMeetingMode = false;
        MC.state.blockedMeeting = false;
        Stubegru.dom.removeEventListener(".calendar-footer-button");
        Stubegru.dom.removeEventListener(".calendar-assign-button");
        Stubegru.dom.removeEventListener("#calendarMeetingDetailForm"); //TODO: Originally only the submit event was removed... Check if this is okay
        this.setUnsavedChanges(false);
    }

    initFomularChangeListener() {
        Stubegru.dom.querySelector('.meeting-details').addEventListener("change", () => this.setUnsavedChanges(true));
        Stubegru.dom.querySelector(".meeting-room-input").addEventListener("change", () => this.setUnsavedChanges(true));
        Stubegru.dom.querySelector(".meeting-template-input").addEventListener("change", () => this.setUnsavedChanges(true));
        Stubegru.dom.querySelector(".meeting-client").addEventListener("change", () => this.setUnsavedChanges(true));
        Stubegru.dom.querySelector("#calendarStart").addEventListener("change", this.setMeetingEndTimeByStartTime);
    }



    /**
     * Sets the text for the info alert in calendarModal.
     * Alert is hidden if the text is empty or not given
     * @param {string} text Text to be displayed in the alert (HTML allowed)
     */
    setInfoAlert(text?: string) {
        Stubegru.dom.setVisibility("#calendarModalInfoAlert", text && text.length > 0);
        Stubegru.dom.querySelector("#calendarModalInfoAlert").innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    }

    /**
     * Show / hide buttons for client assignment
     * @param {boolean} assign wether to show the assign button
     * @param {boolean} save wether to show the save button
     * @param {boolean} remove wether to show the delete button
     * @param {boolean} cancel wether to show the cancel button
     */
    showAssignButtons(assign: boolean, save: boolean, remove: boolean, cancel: boolean) {
        Stubegru.dom.setVisibility("#calendarAssignAssignButton", assign);
        Stubegru.dom.setVisibility("#calendarAssignSaveButton", save);
        Stubegru.dom.setVisibility("#calendarAssignDeleteButton", remove);
        Stubegru.dom.setVisibility("#calendarAssignCancelButton", cancel);
    }

    /**
  * Register eventhandler for click on the assign save button
  * This does automatically clear all currently registered events
  * Assign Save button acts as submit button for client detail form
  * @param {function} callback Function to be executed if the button is clicked
  */
    setAssignSaveButtonEvent(callback: (event: SubmitEvent) => void) {
        //Set action as form submit and NOT as button click to make use of checking for required inputs etc.
        Stubegru.dom.removeEventListener("#calendarClientDataForm");
        Stubegru.dom.querySelector("#calendarClientDataForm").addEventListener("submit", (event) => {
            event.preventDefault();
            callback(event);
        });
    }

    /**
     * Register eventhandler for click on the assign assign button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignAssignButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#calendarAssignAssignButton");
        Stubegru.dom.querySelector("#calendarAssignAssignButton").addEventListener("click", callback);
    }

    /**
     * Register eventhandler for click on the assign delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignDeleteButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#calendarAssignDeleteButton");
        Stubegru.dom.querySelector("#calendarAssignDeleteButton").addEventListener("click", callback);
    }

    /**
     * Register eventhandler for click on the assign cancel button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignCancelButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#calendarAssignCancelButton");
        Stubegru.dom.querySelector("#calendarAssignCancelButton").addEventListener("click", callback);
    }

    /**
     * Enable / disable buttons for a meeting
     * @param {boolean} save wether to enable the save button
     * @param {boolean} saveNext wether to show or hide the save&next button
     * @param {boolean} remove wether to enable the delete button
     * @param {boolean} cancel wether to enable the cancel button
     */
    enableFooterButtons(save: boolean, saveNext: boolean, remove: boolean, cancel: boolean) {
        Stubegru.dom.querySelectorAsInput("#calendarSaveMeetingButton").disabled = !save;
        Stubegru.dom.querySelectorAsInput("#calendarDeleteMeetingButton").disabled = !remove;
        Stubegru.dom.querySelectorAsInput("#calendarCancelButton").disabled = !cancel;
        Stubegru.dom.setVisibility("#calendarSaveNextMeetingButton", saveNext);
    }

    /**
     * Register eventhandler for click on the footer save button
     * This does automatically clear all currently registered events
     * Footer Save button acts as submit button for meeting detail form
     * @param {function} callback Function to be executed if the button is clicked
     */
    setFooterSaveButtonEvent(callback: (event: Event) => void) {
        //Set action as form submit and NOT as button click to make use of checking for required inputs etc.
        Stubegru.dom.removeEventListener("#calendarMeetingDetailForm");
        Stubegru.dom.querySelector("#calendarMeetingDetailForm").addEventListener("submit", (event) => {
            event.preventDefault();
            callback(event);
        });
    }

    /**
     * Register eventhandler for click on the footer delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setFooterDeleteButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#calendarDeleteMeetingButton");
        Stubegru.dom.querySelector("#calendarDeleteMeetingButton").addEventListener("click", callback);
    }


    /**
    * Reset all inputs in the Calendar meeting detail form
    */
    resetMeetingDetailForm = async () => {
        this.enableDetailMeetingForm(true);
        Stubegru.dom.querySelector('.meeting-details').val("");

        //load from custom config
        const calendarTitle = await stubegru.modules.customEvents.trigger("generateMeetingTitle");
        Stubegru.dom.querySelector('#calendarTitle').val(calendarTitle);
        Stubegru.dom.querySelector("#calendarOwner").val(stubegru.currentUser.id);
        Stubegru.dom.querySelector("#calendarChannel").val("all");
        Stubegru.dom.querySelector("#calendarRoom")[0].selectedIndex = 1; //Select first entry by default
        Stubegru.dom.querySelector("#calendarTemplate")[0].selectedIndex = 1;

    }

    enableDetailMeetingForm(isEnabled) {
        Stubegru.dom.querySelectorAsInput('.meeting-details').disabled = !isEnabled;
    }


    getMeetingDetailData() {
        let meetingData = {};
        meetingData["date"] = Stubegru.dom.querySelector('#calendarDate').val();
        meetingData["start"] = Stubegru.dom.querySelector('#calendarStart').val();
        meetingData["end"] = Stubegru.dom.querySelector('#calendarEnd').val();
        meetingData["title"] = Stubegru.dom.querySelector('#calendarTitle').val();
        meetingData["ownerId"] = Stubegru.dom.querySelector('#calendarOwner').val();
        meetingData["roomId"] = Stubegru.dom.querySelector('#calendarRoom').val();
        meetingData["templateId"] = Stubegru.dom.querySelector('#calendarTemplate').val();
        meetingData["channel"] = Stubegru.dom.querySelector('#calendarChannel').val();
        return meetingData;
    }

    setMeetingDetailData(meeting) {
        Stubegru.dom.querySelector('#calendarDate').val(meeting.date);
        Stubegru.dom.querySelector('#calendarStart').val(meeting.start);
        Stubegru.dom.querySelector('#calendarEnd').val(meeting.end);
        Stubegru.dom.querySelector('#calendarTitle').val(meeting.title);
        Stubegru.dom.querySelector('#calendarOwner').val(meeting.ownerId);
        Stubegru.dom.querySelector('#calendarChannel').val(meeting.channel);

        Stubegru.dom.querySelector('#calendarRoom').val(meeting.roomId);
        Stubegru.dom.querySelector('#calendarTemplate').val(meeting.templateId);
    }

    /**
     * If the value of the meeting start time input changes, this function is called to set the end time to an according value
     */
    setMeetingEndTimeByStartTime() {
        let startTime = Stubegru.dom.querySelector("#calendarStart").val();
        if (startTime.length == 5) {
            let hours = startTime.substr(0, 2);
            let minutes = startTime.substr(3, 2);
            hours++;
            hours = hours < 10 ? `0${hours}` : hours;
            Stubegru.dom.querySelector("#calendarEnd").val(hours + ":" + minutes);
        }
    }

    initMeetingDetailChannelDropdown() {
        let html = `<option value="">Bitte wählen...</option>`;
        const names = MeetingView.channelDescriptions;
        for (let channelId in names) {
            html += `<option value="${channelId}">${names[channelId]}</option>`;
        }
        Stubegru.dom.querySelector("#calendarChannel").html(html);
    }






    /**
    * Reset all inputs in the client data form
    */
    resetClientForm = () => {
        this.enableClientForm(true);
        Stubegru.dom.querySelector(".meeting-client").val("");
    }

    enableClientForm(isEnabled) {
        Stubegru.dom.querySelectorAsInput('.meeting-client').disabled = !isEnabled;
    }

    setClientVisible(isVisible) {
        isVisible ?
            Stubegru.dom.querySelector("#calendarClientDataContainer").slideDown() :
            Stubegru.dom.querySelector("#calendarClientDataContainer").slideUp();
    }


    getClientData() {
        let clientData = {};
        clientData["name"] = Stubegru.dom.querySelector("#calendarClientName").val();
        clientData["mail"] = Stubegru.dom.querySelector("#calendarClientMail").val();
        clientData["phone"] = Stubegru.dom.querySelector("#calendarClientPhone").val();
        clientData["survey"] = Stubegru.dom.querySelector("#calendarClientSurvey").val();
        clientData["issue"] = Stubegru.dom.querySelector("#calendarClientIssue").val();
        clientData["channel"] = Stubegru.dom.querySelector("#calendarClientChannel").val();
        return clientData;
    }

    setClientData = (client) => {
        this.initClientChannelDropdown(client.channel);
        Stubegru.dom.querySelector('#calendarClientName').val(client.name);
        Stubegru.dom.querySelector('#calendarClientMail').val(client.mail);
        Stubegru.dom.querySelector('#calendarClientIssue').val(client.description);
        Stubegru.dom.querySelector('#calendarClientSurvey').val(client.formular);
        Stubegru.dom.querySelector('#calendarClientChannel').val(client.channel);
        Stubegru.dom.querySelector('#calendarClientPhone').val(this.prettyPrintPhoneNumber(client.phone));
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
        const names = MeetingView.channelDescriptions;
        for (let channelId of channelOptions) {
            html += `<option value="${channelId}">${names[channelId]}</option>`;
        }
        Stubegru.dom.querySelector("#calendarClientChannel").html(html)
    }




















}