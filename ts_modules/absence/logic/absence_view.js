import { Modal } from '../../../components/bootstrap/v3/ts_wrapper.js';
import Stubegru from '../../../components/stubegru_core/logic/stubegru.js';
import StubegruToggle from '../../../components/stubegru_toggle/stubegru_toggle.js';
import UserUtils from '../../../components/user_utils/user_utils.js';
import AbsenceModule from "./absence_module.js";
class AbsenceView {
    modal;
    form;
    viewFutureToggle;
    wholeDayToggle;
    recurringToggle;
    notificationToggle;
    recurringDayLabel;
    static DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    constructor() {
        this.modal = new Modal('#absence_modal');
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        Stubegru.dom.querySelector("#absence_create_button").addEventListener("click", AbsenceModule.controller.showAbsenceModalForCreate);
        this.recurringDayLabel = Stubegru.dom.querySelector("#absence_modal_form_recurring_label");
        this.viewFutureToggle = new StubegruToggle("#absence_modal_view_future_toggle");
        this.wholeDayToggle = new StubegruToggle("#absence_modal_form_whole_day_toggle");
        this.recurringToggle = new StubegruToggle("#absence_modal_form_recurring_toggle");
        this.notificationToggle = new StubegruToggle("#absence_modal_notification_toggle");
        this.form = Stubegru.dom.querySelector('#absence_modal_form');
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            const absenceId = Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value;
            if (absenceId == "new") {
                AbsenceModule.controller.handleCreateAbsence();
            }
            else {
                AbsenceModule.controller.handleUpdateAbsence();
            }
        });
        this.resetModalForm();
        //TODO: Init toggel event listner
        //TODO: Init recurring select > label event listner
        /*
        //toggle future table
$("#absence_view_future_toggle").on("change", function () {
    if ($(this).prop('checked')) { $("#absence_table_future").show(); }
    else { $("#absence_table_future").hide(); }
});

//Show/hide Elements on toggle change in modal
$("#absence_whole_day_toggle").on("change", function () {
    if ($(this).prop('checked')) {
        //show time inputs
        $(".absence-whole-day-inputs").hide();
        $("#absence_end_date").prop("required", false);

        $(".absence-time-inputs").show();
        $("#absence_start_time").prop("required", true);
        $("#absence_end_time").prop("required", true);
    }
    else {
        //show date inputs
        $(".absence-time-inputs").hide();
        $("#absence_start_time").prop("required", false);
        $("#absence_end_time").prop("required", false);

        $(".absence-whole-day-inputs").show();
        $("#absence_end_date").prop("required", true);
    }
});

$("#absence_recurring_toggle").on("change", function () {
    if ($(this).prop('checked')) {
        $(".absence-recurring-inputs").show();
    }
    else {
        $(".absence-recurring-inputs").hide();
    }
});

$("#absence_recurring_rhythm").on("change", function () {
    switch ($(this).val()) {
        case "daily":
            $("#absence_recurring_day_label").hide();
            break;
        case "weekly":
            $("#absence_recurring_day_label").show();
            break;
    }
});

//show recurring day of the week
$("#absence_date").on("change", function () {
    const input = $(this).val();
    if (input == "") {
        $("#absence_recurring_day_label").html("Bitte Datum wählen...");
    } else {
        let dayIndex = new Date(input).getDay();
        let weekDay = dayNames[dayIndex];
        $("#absence_recurring_day_label").html(`Wiederholung jeden <b class="text-primary">${weekDay}</b>`);
    }
});
        */
        // TODO: $('[data-toggle="tooltip"]').tooltip();
    }
    resetModalForm = () => {
        this.form.reset();
        this.wholeDayToggle.setState(false);
        this.recurringToggle.setState(false);
        this.notificationToggle.setState(false);
        this.recurringDayLabel.innerHTML = "";
    };
    setFormData(absence) {
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value = absence.id;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_name").value = absence.name;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_description").value = absence.description;
        this.wholeDayToggle.setState(absence.wholeDay);
        const start = new Date(absence.start);
        const end = new Date(absence.end);
        const absenceFormatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        const absenceFormatTime = (date) => {
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
        };
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_date").value = absenceFormatDate(start);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_date").value = absenceFormatDate(end);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_time").value = absenceFormatTime(start);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_time").value = absenceFormatTime(end);
        const recurringValue = absence.recurring;
        const isRecurring = recurringValue != null;
        this.recurringToggle.setState(isRecurring);
        if (isRecurring) {
            Stubegru.dom.querySelectorAsInput("#absence_modal_form_recurring").value = recurringValue;
            this.recurringDayLabel.innerHTML = recurringValue; //TODO: Set pretty text
        }
    }
    getFormData() {
        const isWholeDay = this.wholeDayToggle.getState();
        let startString, endString;
        const startDate = Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_date").value;
        const startTime = Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_time").value;
        const endDate = Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_date").value;
        const endTime = Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_time").value;
        if (isWholeDay) {
            //Use only date
            startString = startDate;
            endString = endDate;
        }
        else {
            //Use date and time
            startString = startDate + " " + startTime;
            endString = endDate + " " + endTime;
        }
        startString = new Date(startString).toISOString();
        endString = new Date(endString).toISOString();
        const isRecurring = this.recurringToggle.getState();
        const recurringValue = isRecurring ? Stubegru.dom.querySelectorAsInput("#absence_modal_form_recurring").value : null;
        const sendNotification = this.notificationToggle.getState();
        return {
            id: Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value,
            name: Stubegru.dom.querySelectorAsInput("#absence_modal_form_name").value,
            description: Stubegru.dom.querySelectorAsInput("#absence_modal_form_description").value,
            start: startString,
            end: endString,
            recurring: recurringValue,
            wholeDay: isWholeDay,
            sendNotification: sendNotification
        };
    }
    isEndTimeBeforeNow(absence) {
        const now = new Date();
        const end = new Date(absence.end);
        const endTimeMillis = end.getTime() % (1000 * 60 * 60 * 24); //get milliseconds since 0:00
        const nowTimeMillis = now.getTime() % (1000 * 60 * 60 * 24);
        return (endTimeMillis < nowTimeMillis);
    }
    getAbsenceEpochByDate(absence) {
        const now = new Date();
        const start = new Date(absence.start);
        const end = new Date(absence.end);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 9999);
        let epoch = "present";
        if (end < todayStart) {
            epoch = "past";
        }
        if (start > todayEnd) {
            epoch = "future";
        }
        if (!absence.wholeDay && epoch == "present") {
            if (end < now) {
                epoch = "past";
            }
            if (start > now) {
                epoch = "future";
            }
        }
        return epoch;
    }
    getAbsenceWithDisplayStrings(absence) {
        const formatDate = Stubegru.utils.formatDate;
        const start = new Date(absence.start);
        let epoch = this.getAbsenceEpochByDate(absence);
        let startString = formatDate(absence.start, "DD.MM.YYYY");
        let endString = formatDate(absence.end, "DD.MM.YYYY");
        let recurringLabelText = "";
        let tableId = "present";
        //No recurring
        if (absence.recurring == "") {
            if (epoch == "past") {
                console.warn(`Not recurring absence from the past. Ignoring...`);
                console.warn(absence);
                return;
            }
            //if not in the past just add to the corresponding table
            tableId = epoch;
            if (!absence.wholeDay) {
                if (epoch == "future") {
                    if (formatDate(absence.start, "YYYY-MM-DD") == formatDate(new Date(), "YYYY-MM-DD")) {
                        //Today, but the time is in the future
                        startString = `Heute ${formatDate(absence.start, "hh:mm")}`;
                        endString = `Heute ${formatDate(absence.end, "hh:mm")}`;
                        tableId = "present"; //Show upcoming hourly absence in present table if it is today but time is in the future
                    }
                    else {
                        startString = formatDate(absence.start, "DD.MM.YYYY hh:mm");
                        endString = formatDate(absence.end, "DD.MM.YYYY hh:mm");
                    }
                }
                else {
                    startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                    endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
                }
            }
        }
        //daily recurring
        if (absence.recurring == "daily") {
            recurringLabelText = `<span class="label label-info">Täglich</span>`;
            if (epoch == "present" || epoch == "past") {
                if (absence.wholeDay) {
                    startString = "Heute";
                    endString = "Heute";
                }
                else {
                    startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                    endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
                }
                //if the absence's timeslot has ended before the current time -> move to upcoming table
                if (this.isEndTimeBeforeNow(absence)) {
                    tableId = "future";
                }
            }
            if (epoch == "future") {
                tableId = "future";
                if (absence.wholeDay) {
                    startString = formatDate(absence.start, "ab DD.MM.YYYY");
                    endString = "";
                }
                else {
                    startString = formatDate(absence.start, "ab DD.MM.YYYY hh:mm");
                    endString = formatDate(absence.end, "hh:mm");
                }
            }
        }
        //weekly recurring
        if (absence.recurring == "weekly") {
            let dayOfWeek = start.getDay();
            let currentDayOfWeek = new Date().getDay();
            recurringLabelText = `<span class="label label-info">Jeden ${AbsenceView.DAY_NAMES[dayOfWeek]}</span>`;
            if (epoch == "present" || epoch == "past") {
                //check if weekly recurring is today or not (set corresponding table)
                if (dayOfWeek != currentDayOfWeek) {
                    tableId = "future";
                }
                else {
                    //if the absence's timeslot has ended before the current time -> move to upcoming table
                    if (this.isEndTimeBeforeNow(absence)) {
                        tableId = "future";
                    }
                }
                if (absence.wholeDay) {
                    startString = `Jeden ${AbsenceView.DAY_NAMES[dayOfWeek]}`;
                    endString = `Jeden ${AbsenceView.DAY_NAMES[dayOfWeek]}`;
                }
                else {
                    startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                    endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
                }
            }
            if (epoch == "future") {
                tableId = "future";
                if (absence.wholeDay) {
                    startString = formatDate(absence.start, "ab DD.MM.YYYY");
                    endString = "";
                }
                else {
                    startString = formatDate(absence.start, "ab DD.MM.YYYY hh:mm");
                    endString = formatDate(absence.end, "hh:mm");
                }
            }
        }
        return {
            ...absence,
            startString,
            endString,
            recurringLabelText,
            tableId,
            epoch
        };
    }
    async renderListView(absenceList) {
        let htmlHolder = {
            present: "",
            future: "",
        };
        for (let inputAbsence of absenceList) {
            let a = this.getAbsenceWithDisplayStrings(inputAbsence);
            let absenceHtml = `
                <tr>
                    <td>${a.name}</td>
                    <td>${a.description}</td>
                    <td>${a.startString}</td>
                    <td>${a.endString}</td>
                    <td>${a.recurringLabelText}</td>
                    <td>
                        <button class='absence-edit-button btn btn-default permission-ABSENCE_WRITE permission-required' data-absence-id='${a.id}'>
                            <i class='fa fa-pencil-alt'></i>
                        </button>
                    </td>
                    <td>
                        <button class='absence-delete-button btn btn-danger permission-ABSENCE_WRITE permission-required' data-absence-id='${a.id}'>
                            <i class='fa fa-times'></i>
                        </button>
                    </td>
                </tr>`;
            htmlHolder[a.tableId] += absenceHtml;
        }
        Stubegru.dom.querySelector("#absence_table_present").innerHTML = htmlHolder.present;
        Stubegru.dom.querySelector("#absence_table_future").innerHTML = htmlHolder.future;
        this.registerButtonEvents();
        UserUtils.updateAdminElements();
    }
    registerButtonEvents() {
        Stubegru.dom.querySelectorAll(".absence-delete-button").forEach(elem => {
            const absenceId = elem.getAttribute("data-absence-id");
            elem.addEventListener("click", () => {
                AbsenceModule.controller.handleDeleteAbsence(absenceId);
            });
        });
        Stubegru.dom.querySelectorAll(".absence-edit-button").forEach(elem => {
            const absenceId = elem.getAttribute("data-absence-id");
            elem.addEventListener("click", () => {
                AbsenceModule.controller.showAbsenceModalForUpdate(absenceId);
            });
        });
    }
}
export default AbsenceView;
