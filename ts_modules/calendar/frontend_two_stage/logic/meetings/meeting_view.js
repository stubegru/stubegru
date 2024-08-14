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
        this.modal = new Modal("#terminmodal"); //TODO: Change naming
        this.setUnsavedChanges(false);
        Stubegru.dom.querySelectorAll('.meeting-details').forEach(elem => Stubegru.dom.addEventListener(elem, "change", () => this.setUnsavedChanges(true)));
        Stubegru.dom.addEventListener("#calendarStart", "change", CalendarModule.meetingView.setMeetingEndTimeByStartTime);
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
            Stubegru.dom.querySelector("#calendarModalChangesInfo").innerHTML = `<i class="fas fa-circle" style="color: #d9534f"></i> Ungesicherte Änderungen` :
            Stubegru.dom.querySelector("#calendarModalChangesInfo").innerHTML = `<i class="fas fa-circle" style="color: #5cb85c"></i> Alle Änderungen gespeichert`;
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
        Stubegru.dom.querySelector("#terminmodalTitle").innerHTML = title;
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
        Stubegru.dom.removeEventListener("#calendarMeetingDetailForm", "submit");
        this.setUnsavedChanges(false);
    };
    /**
     * Sets the text for the info alert in calendarModal.
     * Alert is hidden if the text is empty or not given
     * @param {string} text Text to be displayed in the alert (HTML allowed)
     */
    setInfoAlert(text) {
        Stubegru.dom.setVisibility("#calendarModalInfoAlert", text && text.length > 0);
        Stubegru.dom.querySelector("#calendarModalInfoAlert").innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    }
    /**
     * Enable / disable buttons for a meeting
     * @param {boolean} save wether to enable the save button
     * @param {boolean} saveNext wether to show or hide the save&next button
     * @param {boolean} remove wether to enable the delete button
     * @param {boolean} cancel wether to enable the cancel button
     */
    enableFooterButtons(save, saveNext, remove, cancel) {
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
    setFooterSaveButtonEvent(callback) {
        //Set action as form submit and NOT as button click to make use of checking for required inputs etc.
        Stubegru.dom.removeEventListener("#calendarMeetingDetailForm");
        Stubegru.dom.addEventListener("#calendarMeetingDetailForm", "submit", (event) => {
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
        Stubegru.dom.removeEventListener("#calendarDeleteMeetingButton");
        Stubegru.dom.addEventListener("#calendarDeleteMeetingButton", "click", callback);
    }
    /**
    * Reset all inputs in the Calendar meeting detail form
    */
    resetMeetingDetailForm = async () => {
        this.enableDetailMeetingForm(true);
        Stubegru.dom.querySelector('#calendarMeetingDetailForm').reset(); //TODO: Check if that also resets the embedded room and template forms
        //load from custom config
        //@ts-expect-error TODO: refactor customEvents to TS-component
        const calendarTitle = await stubegru.modules.customEvents.trigger("generateMeetingTitle");
        Stubegru.dom.querySelectorAsInput('#calendarTitle').value = calendarTitle;
        Stubegru.dom.querySelectorAsInput("#calendarOwner").value = UserUtils.currentUser.id;
        Stubegru.dom.querySelectorAsInput("#calendarChannel").value = "all";
        Stubegru.dom.querySelector("#calendarRoom").selectedIndex = 1; //Select first entry by default
        Stubegru.dom.querySelector("#calendarTemplate").selectedIndex = 1;
    };
    enableDetailMeetingForm(isEnabled) {
        Stubegru.dom.querySelectorAll('.meeting-details').forEach(elem => elem.disabled = !isEnabled);
    }
    getMeetingDetailData() {
        let meetingData = {};
        meetingData.date = Stubegru.dom.querySelectorAsInput('#calendarDate').value;
        meetingData.start = Stubegru.dom.querySelectorAsInput('#calendarStart').value;
        meetingData.end = Stubegru.dom.querySelectorAsInput('#calendarEnd').value;
        meetingData.title = Stubegru.dom.querySelectorAsInput('#calendarTitle').value;
        meetingData.ownerId = Stubegru.dom.querySelectorAsInput('#calendarOwner').value;
        meetingData.room = Stubegru.dom.querySelectorAsInput('#calendarRoom').value;
        meetingData.template = Stubegru.dom.querySelectorAsInput('#calendarTemplate').value;
        meetingData.channel = Stubegru.dom.querySelectorAsInput('#calendarChannel').value;
        return meetingData;
    }
    setMeetingDetailData(meeting) {
        Stubegru.dom.querySelectorAsInput('#calendarDate').value = meeting.date;
        Stubegru.dom.querySelectorAsInput('#calendarStart').value = meeting.start;
        Stubegru.dom.querySelectorAsInput('#calendarEnd').value = meeting.end;
        Stubegru.dom.querySelectorAsInput('#calendarTitle').value = meeting.title;
        Stubegru.dom.querySelectorAsInput('#calendarOwner').value = meeting.ownerId;
        Stubegru.dom.querySelectorAsInput('#calendarChannel').value = meeting.channel;
        Stubegru.dom.querySelectorAsInput('#calendarRoom').value = meeting.room;
        Stubegru.dom.querySelectorAsInput('#calendarTemplate').value = meeting.template;
    }
    /**
     * If the value of the meeting start time input changes, this function is called to set the end time to an according value
     */
    setMeetingEndTimeByStartTime() {
        let startTime = Stubegru.dom.querySelectorAsInput("#calendarStart").value;
        if (startTime.length == 5) {
            let hours = Number(startTime.substring(0, 2));
            let minutes = startTime.substring(3, 5); //TODO: Check if substr => substring refactor is correct
            hours++;
            hours = hours < 10 ? `0${hours}` : hours;
            Stubegru.dom.querySelectorAsInput("#calendarEnd").value = hours + ":" + minutes;
        }
    }
    initMeetingDetailChannelDropdown() {
        let html = `<option value="">Bitte wählen...</option>`;
        const names = MeetingView.channelDescriptions;
        for (let channelId in names) {
            html += `<option value="${channelId}">${names[channelId]}</option>`;
        }
        Stubegru.dom.querySelector("#calendarChannel").innerHTML = html;
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
        Stubegru.dom.querySelector("#calendarOwner").innerHTML = selectHtml;
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
