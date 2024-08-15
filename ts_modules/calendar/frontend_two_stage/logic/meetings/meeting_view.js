import Alert from "../../../../../components/alert/alert.js";
import { Modal } from "../../../../../components/bootstrap/v3/ts_wrapper.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarModule from "../calendar_module.js";
class MeetingView {
    static channelDescriptions = {
        "personally": "Persönlich",
        "phone": "Telefon",
        "webmeeting": "Webmeeting",
        "digital": "Nur digital (Fon + Web)",
        "all": "Alle",
    };
    modal;
    async init() {
        this.modal = new Modal("#meeting_detail_view_modal");
        this.setUnsavedChanges(false);
        Stubegru.dom.querySelectorAll('.meeting-details').forEach(elem => Stubegru.dom.addEventListener(elem, "change", () => this.setUnsavedChanges(true)));
        Stubegru.dom.addEventListener("#meeting_detail_start", "change", CalendarModule.meetingView.setMeetingEndTimeByStartTime);
        //ask for unsaved changes
        this.modal.addEventListener('hide.bs.modal', this.askForUnsavedChanges);
        //Reset modal forms on hide event
        this.modal.addEventListener('hidden.bs.modal', this.resetAllForms);
        this.initMeetingDetailChannelDropdown();
        this.initAdvisorDropdown();
    }
    askForUnsavedChanges() {
        if (!CalendarModule.state.unsavedChanges) {
            return true;
        }
        return confirm("Es gibt ungesicherte Änderungen. Soll das Formular wirklich geschlossen werden?");
    }
    setUnsavedChanges(hasUnsavedChanges) {
        CalendarModule.state.unsavedChanges = hasUnsavedChanges;
        hasUnsavedChanges ?
            Stubegru.dom.querySelector("#calendar_modal_changes_info").innerHTML = `<i class="fas fa-circle" style="color: #d9534f"></i> Ungesicherte Änderungen` :
            Stubegru.dom.querySelector("#calendar_modal_changes_info").innerHTML = `<i class="fas fa-circle" style="color: #5cb85c"></i> Alle Änderungen gespeichert`;
        if (hasUnsavedChanges && CalendarModule.state.freeMeetingMode) {
            CalendarModule.meetingClientView.showAssignButtons(false, false, false, false);
            this.setInfoAlert("Es wurden Änderungen am Termin vorgenommen. Bitte Termin speichern bevor er an einen Kunden vergeben werden kann.");
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
        Stubegru.dom.querySelector("#meeting_detail_view_title").innerHTML = title;
    }
    /**
     * Resets the meetingDetail-, client-, room- and templateForm
     * Hides the info alert
     * Clear all buttons event listeners
     */
    resetAllForms = async () => {
        await this.resetMeetingDetailForm();
        CalendarModule.meetingClientView.resetClientForm();
        CalendarModule.roomView.resetRoomForm();
        CalendarModule.roomView.setRoomFormVisible(false);
        CalendarModule.mailTemplateView.resetTemplateForm();
        CalendarModule.mailTemplateView.setTemplateFormVisible(false);
        this.setInfoAlert("");
        CalendarModule.state.freeMeetingMode = false;
        CalendarModule.state.blockedMeeting = false;
        Stubegru.dom.removeEventListener(".calendar-footer-button");
        Stubegru.dom.removeEventListener(".calendar-assign-button");
        Stubegru.dom.removeEventListener("#calendar_meeting_detail_form", "submit");
        this.setUnsavedChanges(false);
    };
    /**
     * Sets the text for the info alert in calendarModal.
     * Alert is hidden if the text is empty or not given
     * @param {string} text Text to be displayed in the alert (HTML allowed)
     */
    setInfoAlert(text) {
        Stubegru.dom.setVisibility("#meeting_modal_info_alert", text && text.length > 0);
        Stubegru.dom.querySelector("#meeting_modal_info_alert").innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    }
    /**
     * Enable / disable buttons for a meeting
     * @param {boolean} save wether to enable the save button
     * @param {boolean} saveNext wether to show or hide the save&next button
     * @param {boolean} remove wether to enable the delete button
     * @param {boolean} cancel wether to enable the cancel button
     */
    enableFooterButtons(save, saveNext, remove, cancel) {
        Stubegru.dom.querySelectorAsInput("#meeting_save_button").disabled = !save;
        Stubegru.dom.querySelectorAsInput("#meeting_delete_button").disabled = !remove;
        Stubegru.dom.querySelectorAsInput("#meeting_cancel_button").disabled = !cancel;
        Stubegru.dom.setVisibility("#meeting_save_next_button", saveNext);
    }
    /**
     * Register eventhandler for click on the footer save button
     * This does automatically clear all currently registered events
     * Footer Save button acts as submit button for meeting detail form
     * @param {function} callback Function to be executed if the button is clicked
     */
    setFooterSaveButtonEvent(callback) {
        //Set action as form submit and NOT as button click to make use of checking for required inputs etc.
        Stubegru.dom.removeEventListener("#calendar_meeting_detail_form");
        Stubegru.dom.addEventListener("#calendar_meeting_detail_form", "submit", (event) => {
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
        Stubegru.dom.removeEventListener("#meeting_delete_button");
        Stubegru.dom.addEventListener("#meeting_delete_button", "click", callback);
    }
    /**
    * Reset all inputs in the Calendar meeting detail form
    */
    resetMeetingDetailForm = async () => {
        this.enableDetailMeetingForm(true);
        Stubegru.dom.querySelector('#calendar_meeting_detail_form').reset();
        //load from custom config
        //@ts-expect-error TODO: refactor customEvents to TS-component
        const meeting_detail_title = await stubegru.modules.customEvents.trigger("generateMeetingTitle");
        Stubegru.dom.querySelectorAsInput('#meeting_detail_title').value = meeting_detail_title;
        Stubegru.dom.querySelectorAsInput("#meeting_detail_owner").value = UserUtils.currentUser.id;
        Stubegru.dom.querySelectorAsInput("#meeting_detail_channel").value = "all";
        Stubegru.dom.querySelector("#meeting_detail_room").selectedIndex = 1; //Select first entry by default
        Stubegru.dom.querySelector("#meeting_detail_mail_template").selectedIndex = 1;
    };
    enableDetailMeetingForm(isEnabled) {
        Stubegru.dom.querySelectorAll('.meeting-details').forEach(elem => elem.disabled = !isEnabled);
    }
    getMeetingDetailData() {
        let meetingData = {};
        meetingData.date = Stubegru.dom.querySelectorAsInput('#meeting_detail_date').value;
        meetingData.start = Stubegru.dom.querySelectorAsInput('#meeting_detail_start').value;
        meetingData.end = Stubegru.dom.querySelectorAsInput('#meeting_detail_end').value;
        meetingData.title = Stubegru.dom.querySelectorAsInput('#meeting_detail_title').value;
        meetingData.ownerId = Stubegru.dom.querySelectorAsInput('#meeting_detail_owner').value;
        meetingData.room = Stubegru.dom.querySelectorAsInput('#meeting_detail_room').value;
        meetingData.template = Stubegru.dom.querySelectorAsInput('#meeting_detail_mail_template').value;
        meetingData.channel = Stubegru.dom.querySelectorAsInput('#meeting_detail_channel').value;
        return meetingData;
    }
    setMeetingDetailData(meeting) {
        Stubegru.dom.querySelectorAsInput('#meeting_detail_date').value = meeting.date;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_start').value = meeting.start;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_end').value = meeting.end;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_title').value = meeting.title;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_owner').value = meeting.ownerId;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_channel').value = meeting.channel;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_room').value = meeting.room;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_mail_template').value = meeting.template;
    }
    /**
     * If the value of the meeting start time input changes, this function is called to set the end time to an according value
     */
    setMeetingEndTimeByStartTime() {
        let startTime = Stubegru.dom.querySelectorAsInput("#meeting_detail_start").value;
        if (startTime.length == 5) {
            let hours = Number(startTime.substring(0, 2));
            let minutes = startTime.substring(3, 5);
            hours++;
            hours = hours < 10 ? `0${hours}` : hours;
            Stubegru.dom.querySelectorAsInput("#meeting_detail_end").value = hours + ":" + minutes;
        }
    }
    initMeetingDetailChannelDropdown() {
        let html = `<option value="">Bitte wählen...</option>`;
        const names = MeetingView.channelDescriptions;
        for (let channelId in names) {
            html += `<option value="${channelId}">${names[channelId]}</option>`;
        }
        Stubegru.dom.querySelector("#meeting_detail_channel").innerHTML = html;
    }
    async initAdvisorDropdown() {
        let ownId = UserUtils.currentUser.id;
        let userList = await UserUtils.getUserListByPermission("MEETING_ADVISOR");
        let selectHtml = "";
        for (const user of userList) {
            if (ownId == user.id) { //Add own entry at top (default)
                selectHtml = `<option value="${user.id}">${user.name}</option>` + selectHtml;
            }
            else {
                selectHtml += `<option value="${user.id}">${user.name}</option>`;
            }
        }
        Stubegru.dom.querySelector("#meeting_detail_owner").innerHTML = selectHtml;
    }
    async showBlockError(userName) {
        await Alert.alert({
            title: "Termin ist blockiert",
            text: `Dieser Termin wird bereits von einem anderen Nutzer bearbeitet. Daher kann dieser Termin aktuell nicht vergeben werden. Der Termin ist aktuell gesperrt durch: ${userName}.`,
            type: "error"
        });
    }
}
export default MeetingView;
