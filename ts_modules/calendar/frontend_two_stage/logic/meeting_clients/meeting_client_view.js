import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import AssignFeedbackModal from "../meetings/assign_feedback_modal.js";
import MeetingView from "../meetings/meeting_view.js";
export default class MeetingClientView {
    assignFeedbackModal;
    init() {
        Stubegru.dom.querySelectorAll(".meeting-client").forEach(elem => elem.addEventListener("change", () => CalendarModule.meetingView.setUnsavedChanges(true)));
        this.assignFeedbackModal = new AssignFeedbackModal();
    }
    resetClientForm = () => {
        this.enableClientForm(true);
        Stubegru.dom.querySelector("#calendarClientDataForm").reset();
    };
    enableClientForm(isEnabled) {
        Stubegru.dom.querySelectorAll('.meeting-client').forEach(elem => elem.disabled = !isEnabled);
    }
    setClientVisible(isVisible) {
        Stubegru.dom.slideToState("#calendarClientDataContainer", isVisible);
    }
    /**
     * Show / hide buttons for client assignment
     * @param {boolean} assign wether to show the assign button
     * @param {boolean} save wether to show the save button
     * @param {boolean} remove wether to show the delete button
     * @param {boolean} cancel wether to show the cancel button
     */
    showAssignButtons(assign, save, remove, cancel) {
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
    setAssignSaveButtonEvent(callback) {
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
    setAssignAssignButtonEvent(callback) {
        Stubegru.dom.removeEventListener("#calendarAssignAssignButton");
        Stubegru.dom.querySelector("#calendarAssignAssignButton").addEventListener("click", callback);
    }
    /**
     * Register eventhandler for click on the assign delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignDeleteButtonEvent(callback) {
        Stubegru.dom.removeEventListener("#calendarAssignDeleteButton");
        Stubegru.dom.querySelector("#calendarAssignDeleteButton").addEventListener("click", callback);
    }
    /**
     * Register eventhandler for click on the assign cancel button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignCancelButtonEvent(callback) {
        Stubegru.dom.removeEventListener("#calendarAssignCancelButton");
        Stubegru.dom.querySelector("#calendarAssignCancelButton").addEventListener("click", callback);
    }
    getClientData() {
        let clientData = {};
        clientData.name = Stubegru.dom.querySelectorAsInput("#calendarClientName").value;
        clientData.mail = Stubegru.dom.querySelectorAsInput("#calendarClientMail").value;
        clientData.phone = Stubegru.dom.querySelectorAsInput("#calendarClientPhone").value;
        clientData.formular = Stubegru.dom.querySelectorAsInput("#calendarClientSurvey").value;
        clientData.description = Stubegru.dom.querySelectorAsInput("#calendarClientIssue").value;
        clientData.channel = Stubegru.dom.querySelectorAsInput("#calendarClientChannel").value;
        return clientData;
    }
    setClientData = (client) => {
        this.initClientChannelDropdown(client.channel);
        Stubegru.dom.querySelectorAsInput('#calendarClientName').value = client.name;
        Stubegru.dom.querySelectorAsInput('#calendarClientMail').value = client.mail;
        Stubegru.dom.querySelectorAsInput('#calendarClientIssue').value = client.description;
        Stubegru.dom.querySelectorAsInput('#calendarClientSurvey').value = client.formular;
        Stubegru.dom.querySelectorAsInput('#calendarClientChannel').value = client.channel;
        Stubegru.dom.querySelectorAsInput('#calendarClientPhone').value = this.prettyPrintPhoneNumber(client.phone);
    };
    prettyPrintPhoneNumber(phone) {
        if (!/\d/.test(phone)) {
            return phone;
        } //Dont beautify if not contains any number
        let output = "";
        for (let index = 0; index < phone.length; index++) {
            let char = phone[index];
            output += char;
            if (index % 4 == 3) {
                output += " ";
            }
        }
        return output;
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
        Stubegru.dom.querySelector("#calendarClientChannel").innerHTML = html;
    }
}