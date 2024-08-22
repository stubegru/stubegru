import Alert from "../../../../../components/alert/alert.js";
import { Modal } from "../../../../../components/bootstrap/v3/ts_wrapper.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
import { Meeting } from "./meeting_service.js";

export default class MeetingView {

    static channelDescriptions = {
        "personally": "Persönlich vor Ort",
        "phone": "Telefon",
        "webmeeting": "Webmeeting",
        "digital": "Nur digital (Fon + Web)",
        "all": "Persönlich, Telefon oder Webmeeting",
    };

    modal: Modal;

    async init() {
        this.modal = new Modal("#meeting_detail_view_modal");

        this.setUnsavedChanges(false);
        //ask for unsaved changes
        this.modal.addEventListener('hide.bs.modal', this.askForUnsavedChanges);
        //Reset modal forms on hide event
        this.modal.addEventListener('hidden.bs.modal', this.resetAllForms);

    }


    askForUnsavedChanges() {
        if (!CalendarModule.state.unsavedChanges) { return true; }
        return confirm("Es gibt ungesicherte Änderungen. Soll das Formular wirklich geschlossen werden?");
    }

    setUnsavedChanges(hasUnsavedChanges: boolean) {
        CalendarModule.state.unsavedChanges = hasUnsavedChanges;
        hasUnsavedChanges ?
            Stubegru.dom.querySelector("#calendar_modal_changes_info").innerHTML = `<i class="fas fa-circle" style="color: #d9534f"></i> Ungesicherte Änderungen` :
            Stubegru.dom.querySelector("#calendar_modal_changes_info").innerHTML = `<i class="fas fa-circle" style="color: #5cb85c"></i> Alle Änderungen gespeichert`;
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
        this.setInfoAlert("");
        Stubegru.dom.removeEventListener(".calendar-footer-button");
        Stubegru.dom.removeEventListener(".calendar-assign-button");
        Stubegru.dom.removeEventListener("#calendar_meeting_detail_form", "submit");
        this.setUnsavedChanges(false);
    }

    /**
     * Sets the text for the info alert in calendarModal.
     * Alert is hidden if the text is empty or not given
     * @param {string} text Text to be displayed in the alert (HTML allowed)
     */
    setInfoAlert(text?: string) {
        Stubegru.dom.setVisibility("#meeting_modal_info_alert", text && text.length > 0);
        Stubegru.dom.querySelector("#meeting_modal_info_alert").innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    }






    /**
    * Reset all inputs in the Calendar meeting detail form
    */
    resetMeetingDetailForm = async () => {
        (Stubegru.dom.querySelector('#calendar_meeting_detail_form') as HTMLFormElement).reset();
    }

    enableDetailMeetingForm(isEnabled) {
        Stubegru.dom.querySelectorAll('.meeting-details').forEach(elem => (elem as HTMLInputElement).disabled = !isEnabled);
    }



    setMeetingDetailData(meeting: Meeting) {
        Stubegru.dom.querySelectorAsInput('#meeting_detail_date').value = meeting.date;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_start').value = meeting.start;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_end').value = meeting.end;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_title').value = meeting.title;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_owner').value = meeting.owner;
        Stubegru.dom.querySelectorAsInput('#meeting_detail_channel').value = MeetingView.channelDescriptions[meeting.channel];
    }

    async showBlockError() {
        await Alert.alert({
            title: "Termin ist blockiert",
            text: `Dieser Termin wird bereits von einem anderen Nutzer bearbeitet. Daher kann dieser Termin aktuell nicht vergeben werden.`,
            type: "error"
        });
    }


}