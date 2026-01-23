import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import MeetingView from "../meetings/meeting_view.js";
export default class MeetingClientView {
    init() {
        Stubegru.dom.querySelectorAll(".meeting-client").forEach(elem => Stubegru.dom.addEventListener(elem, "change", () => CalendarModule.meetingView.setUnsavedChanges(true)));
        this.loadPrivacyText();
    }
    async loadPrivacyText() {
        const text = await Stubegru.fetch.getText("ts_modules/calendar/backend/get_self_service_privacy_text.php");
        Stubegru.dom.querySelector("#self_service_privacy_text").innerHTML = text;
    }
    resetClientForm = () => {
        this.enableClientForm(true);
        Stubegru.dom.querySelector("#meeting_client_data_form").reset();
    };
    enableClientForm(isEnabled) {
        Stubegru.dom.querySelectorAll('.meeting-client').forEach(elem => elem.disabled = !isEnabled);
    }
    setClientVisible(isVisible) {
        Stubegru.dom.slideToState("#meeting_client_data_container", isVisible);
    }
    /**
     * Show / hide buttons for client assignment
     * @param {boolean} assign wether to show the assign button
     * @param {boolean} save wether to show the save button
     * @param {boolean} remove wether to show the delete button
     * @param {boolean} cancel wether to show the cancel button
     */
    showAssignButtons(assign, save, remove, cancel) {
        Stubegru.dom.setVisibility("#meeting_assign_assign_button", assign);
        Stubegru.dom.setVisibility("#meeting_assign_save_button", save);
        Stubegru.dom.setVisibility("#meeting_assign_cancel_button", cancel);
    }
    /**
  * Register eventhandler for click on the assign save button
  * This does automatically clear all currently registered events
  * Assign Save button acts as submit button for client detail form
  * @param {function} callback Function to be executed if the button is clicked
  */
    setAssignSaveButtonEvent(callback) {
        //Set action as form submit and NOT as button click to make use of checking for required inputs etc.
        Stubegru.dom.removeEventListener("#meeting_client_data_form");
        Stubegru.dom.addEventListener("#meeting_client_data_form", "submit", (event) => {
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
        Stubegru.dom.removeEventListener("#meeting_assign_assign_button");
        Stubegru.dom.addEventListener("#meeting_assign_assign_button", "click", callback);
    }
    /**
     * Register eventhandler for click on the assign delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignDeleteButtonEvent(callback) {
        Stubegru.dom.removeEventListener("#meeting_assign_delete_button");
        Stubegru.dom.addEventListener("#meeting_assign_delete_button", "click", callback);
    }
    /**
     * Register eventhandler for click on the assign cancel button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignCancelButtonEvent(callback) {
        Stubegru.dom.removeEventListener("#meeting_assign_cancel_button");
        Stubegru.dom.addEventListener("#meeting_assign_cancel_button", "click", callback);
    }
    getClientData() {
        let clientData = {};
        clientData.name = Stubegru.dom.querySelectorAsInput("#meeting_client_name").value;
        clientData.mail = Stubegru.dom.querySelectorAsInput("#meeting_client_mail").value;
        clientData.phone = Stubegru.dom.querySelectorAsInput("#meeting_client_phone").value;
        clientData.formular = Stubegru.dom.querySelectorAsInput("#meeting_client_survey").checked ? "1" : "0";
        clientData.description = Stubegru.dom.querySelectorAsInput("#meeting_client_issue").value;
        clientData.channel = Stubegru.dom.querySelectorAsInput("#meeting_client_channel").value;
        return clientData;
    }
    initClientChannelDropdown(meetingChannel) {
        let channelOptions = [];
        if (meetingChannel == "all") {
            channelOptions.push("personally", "phone", "webmeeting");
        }
        else if (meetingChannel == "digital") {
            channelOptions.push("phone", "webmeeting");
        }
        else {
            channelOptions.push(meetingChannel);
        }
        let html = `<option value="">Bitte wählen...</option>`;
        const names = MeetingView.channelDescriptions;
        for (let channelId of channelOptions) {
            html += `<option value="${channelId}">${names[channelId]}</option>`;
        }
        Stubegru.dom.querySelector("#meeting_client_channel").innerHTML = html;
    }
    showAssignmentFeedback(statusObject) {
        if (statusObject.status == "error") {
            let errorMsg = "Der Termin konnte leider nicht für Sie gebucht werden.";
            let phone = Stubegru.constants.CUSTOM_CONFIG.institutionPhone;
            if (phone) {
                errorMsg += ` Sollte das Problem weiterhin auftreten, vereinbaren Sie bitte einen Termin über unsere Hotline <b>${phone}</b>.`;
            }
            throw new Error(errorMsg);
        }
        //No error => Hide calendar, show Feedback Container
        Stubegru.dom.hide("#self_service_appointment_container");
        Stubegru.dom.show("#self_service_feedback_container");
        Stubegru.dom.querySelector("#self_service_mail_template").innerHTML = statusObject.clientMail.content;
        let mailFeedback;
        if (statusObject.clientMail.status == "success") {
            mailFeedback = `
            <i class="fas fa-envelope-open-text" style="color: #007bff;"></i>
            Sie erhalten in Kürze eine Bestätigung per E-Mail an:
            <b>${statusObject.clientMail.address}</b>`;
        }
        else {
            mailFeedback = `
            <i class="fas fa-exclamation-circle" style="color: #dc3545;"></i>
            Wir konnten <b>keine</b> Bestätigungsmail an Ihre angegebene Adresse schicken:
            <b>${statusObject.clientMail.address}</b>
            <br>
            Der Termin wurde trotzdem für Sie gebucht. Alle wichtigen Infos finden Sie auch im untenstehenden Text.`;
        }
        Stubegru.dom.querySelector("#self_service_feedback_client_mail").innerHTML = mailFeedback;
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
        // Scroll to top of the page to ensure feedback is visible
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}
