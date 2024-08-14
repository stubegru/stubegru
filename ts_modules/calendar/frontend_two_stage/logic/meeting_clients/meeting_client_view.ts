import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import { MeetingClient } from "../meeting_clients/meeting_client_service.js";
import AssignFeedbackModal from "../meetings/assign_feedback_modal.js";
import MeetingView from "../meetings/meeting_view.js";

export default class MeetingClientView {

    assignFeedbackModal: AssignFeedbackModal;

    init() {
        Stubegru.dom.querySelectorAll(".meeting-client").forEach(elem => Stubegru.dom.addEventListener(elem, "change", () => CalendarModule.meetingView.setUnsavedChanges(true)));
        this.assignFeedbackModal = new AssignFeedbackModal();
    }

    resetClientForm = () => {
        this.enableClientForm(true);
        (Stubegru.dom.querySelector("#calendarClientDataForm") as HTMLFormElement).reset();
    }

    enableClientForm(isEnabled) {
        Stubegru.dom.querySelectorAll('.meeting-client').forEach(elem => (elem as HTMLFormElement).disabled = !isEnabled);
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
        Stubegru.dom.addEventListener("#calendarClientDataForm", "submit", (event) => {
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
        Stubegru.dom.addEventListener("#calendarAssignAssignButton", "click", callback);
    }

    /**
     * Register eventhandler for click on the assign delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignDeleteButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#calendarAssignDeleteButton");
        Stubegru.dom.addEventListener("#calendarAssignDeleteButton", "click", callback);
    }

    /**
     * Register eventhandler for click on the assign cancel button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignCancelButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#calendarAssignCancelButton");
        Stubegru.dom.addEventListener("#calendarAssignCancelButton", "click", callback);
    }


    getClientData() {
        let clientData = {} as MeetingClient;
        clientData.name = Stubegru.dom.querySelectorAsInput("#calendarClientName").value;
        clientData.mail = Stubegru.dom.querySelectorAsInput("#calendarClientMail").value;
        clientData.phone = Stubegru.dom.querySelectorAsInput("#calendarClientPhone").value;
        clientData.formular = Stubegru.dom.querySelectorAsInput("#calendarClientSurvey").value;
        clientData.description = Stubegru.dom.querySelectorAsInput("#calendarClientIssue").value;
        clientData.channel = Stubegru.dom.querySelectorAsInput("#calendarClientChannel").value;
        return clientData;
    }

    setClientData = (client: MeetingClient) => {
        this.initClientChannelDropdown(client.channel);
        Stubegru.dom.querySelectorAsInput('#calendarClientName').value = client.name;
        Stubegru.dom.querySelectorAsInput('#calendarClientMail').value = client.mail;
        Stubegru.dom.querySelectorAsInput('#calendarClientIssue').value = client.description;
        Stubegru.dom.querySelectorAsInput('#calendarClientSurvey').value = client.formular;
        Stubegru.dom.querySelectorAsInput('#calendarClientChannel').value = client.channel;
        Stubegru.dom.querySelectorAsInput('#calendarClientPhone').value = this.prettyPrintPhoneNumber(client.phone);
    }

    prettyPrintPhoneNumber(phone: string) {
        if (!/\d/.test(phone)) { return phone; } //Dont beautify if not contains any number
        let output = "";
        for (let index = 0; index < phone.length; index++) {
            let char = phone[index];
            output += char;
            if (index % 4 == 3) { output += " "; }
        }
        return output;
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
        Stubegru.dom.querySelector("#calendarClientChannel").innerHTML = html;
    }
}