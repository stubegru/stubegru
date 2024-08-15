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
        (Stubegru.dom.querySelector("#meeting_client_data_form") as HTMLFormElement).reset();
    }

    enableClientForm(isEnabled) {
        Stubegru.dom.querySelectorAll('.meeting-client').forEach(elem => (elem as HTMLFormElement).disabled = !isEnabled);
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
    showAssignButtons(assign: boolean, save: boolean, remove: boolean, cancel: boolean) {
        Stubegru.dom.setVisibility("#meeting_assign_assign_button", assign);
        Stubegru.dom.setVisibility("#meeting_assign_save_button", save);
        Stubegru.dom.setVisibility("#meeting_assign_delete_button", remove);
        Stubegru.dom.setVisibility("#meeting_assign_cancel_button", cancel);
    }

    /**
  * Register eventhandler for click on the assign save button
  * This does automatically clear all currently registered events
  * Assign Save button acts as submit button for client detail form
  * @param {function} callback Function to be executed if the button is clicked
  */
    setAssignSaveButtonEvent(callback: (event: SubmitEvent) => void) {
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
    setAssignAssignButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#meeting_assign_assign_button");
        Stubegru.dom.addEventListener("#meeting_assign_assign_button", "click", callback);
    }

    /**
     * Register eventhandler for click on the assign delete button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignDeleteButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#meeting_assign_delete_button");
        Stubegru.dom.addEventListener("#meeting_assign_delete_button", "click", callback);
    }

    /**
     * Register eventhandler for click on the assign cancel button
     * This does automatically clear all currently registered events
     * @param {function} callback Function to be executed if the button is clicked
     */
    setAssignCancelButtonEvent(callback: (event: Event) => void) {
        Stubegru.dom.removeEventListener("#meeting_assign_cancel_button");
        Stubegru.dom.addEventListener("#meeting_assign_cancel_button", "click", callback);
    }


    getClientData() {
        let clientData = {} as MeetingClient;
        clientData.name = Stubegru.dom.querySelectorAsInput("#meeting_client_name").value;
        clientData.mail = Stubegru.dom.querySelectorAsInput("#meeting_client_mail").value;
        clientData.phone = Stubegru.dom.querySelectorAsInput("#meeting_client_phone").value;
        clientData.formular = Stubegru.dom.querySelectorAsInput("#meeting_client_survey").value;
        clientData.description = Stubegru.dom.querySelectorAsInput("#meeting_client_issue").value;
        clientData.channel = Stubegru.dom.querySelectorAsInput("#meeting_client_channel").value;
        return clientData;
    }

    setClientData = (client: MeetingClient) => {
        this.initClientChannelDropdown(client.channel);
        Stubegru.dom.querySelectorAsInput('#meeting_client_name').value = client.name;
        Stubegru.dom.querySelectorAsInput('#meeting_client_mail').value = client.mail;
        Stubegru.dom.querySelectorAsInput('#meeting_client_issue').value = client.description;
        Stubegru.dom.querySelectorAsInput('#meeting_client_survey').value = client.formular;
        Stubegru.dom.querySelectorAsInput('#meeting_client_channel').value = client.channel;
        Stubegru.dom.querySelectorAsInput('#meeting_client_phone').value = this.prettyPrintPhoneNumber(client.phone);
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
        Stubegru.dom.querySelector("#meeting_client_channel").innerHTML = html;
    }
}