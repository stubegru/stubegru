import { Modal } from '../../../components/bootstrap/v3/ts_wrapper.js';
import Stubegru from '../../../components/stubegru_core/logic/stubegru.js';
import StubegruToggle from '../../../components/stubegru_toggle/stubegru_toggle.js';
import UserUtils from '../../../components/user_utils/user_utils.js';
import AbsenceModule, { AbsenceEpochString, AbsenceObject, AbsenceObjectWithDisplayStrings, AbsenceObjectWithNtf, AbsenceRecurringString, AbsenceTableId } from "./absence_module.js";



export default class AbsenceView {
    modal: Modal;
    form: HTMLFormElement;

    viewFutureToggle: StubegruToggle;
    wholeDayToggle: StubegruToggle;
    recurringToggle: StubegruToggle;
    notificationToggle: StubegruToggle;

    recurringDayLabel: HTMLElement;
    recurringRhythmSelect: HTMLSelectElement;
    startDateInput: HTMLInputElement;

    static DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];


    constructor() {

        this.modal = new Modal('#absence_modal');
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);

        Stubegru.dom.querySelector("#absence_create_button").addEventListener("click", AbsenceModule.controller.showAbsenceModalForCreate);

        this.recurringDayLabel = Stubegru.dom.querySelector("#absence_modal_form_recurring_label");
        this.recurringRhythmSelect = Stubegru.dom.querySelector("#absence_modal_form_recurring_rhythm") as HTMLSelectElement;
        this.recurringRhythmSelect.addEventListener("change", () => {
            const value = this.recurringRhythmSelect.value as AbsenceRecurringString;
            Stubegru.dom.setVisibility("#absence_modal_form_recurring_label", (value == "weekly"));
        });
        this.startDateInput = Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_date");
        this.startDateInput.addEventListener("change", () => {
            const value = this.startDateInput.value;
            if (!value || value.length < 1) { this.recurringDayLabel.innerHTML = "Bitte Datum wählen..."; }
            else {
                let dayIndex = new Date(value).getDay();
                let dayName = AbsenceView.DAY_NAMES[dayIndex];
                this.recurringDayLabel.innerHTML = `Wiederholung jeden <b class="text-primary">${dayName}</b>`;
            }
        });

        this.viewFutureToggle = new StubegruToggle("#absence_modal_view_future_toggle");
        this.viewFutureToggle.onChange((state) => { Stubegru.dom.setVisibility("#absence_table_future", state) });

        this.wholeDayToggle = new StubegruToggle("#absence_modal_form_whole_day_toggle");
        this.wholeDayToggle.onChange(this.onWholeDayToggleChange);

        this.recurringToggle = new StubegruToggle("#absence_modal_form_recurring_toggle");
        this.recurringToggle.onChange((state) => Stubegru.dom.setVisibility(".absence-recurring-inputs", state));

        this.notificationToggle = new StubegruToggle("#absence_modal_notification_toggle");

        this.form = Stubegru.dom.querySelector('#absence_modal_form') as HTMLFormElement;
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

        //@ts-expect-error TODO: Do this without jQuery
        $('[data-toggle="tooltip"]').tooltip();
    }


    onWholeDayToggleChange(state: boolean) {
        Stubegru.dom.setVisibility(".absence-time-inputs", !state);
        Stubegru.dom.setVisibility(".absence-whole-day-inputs", state);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_date").required = state;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_time").required = !state;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_time").required = !state;
    }

    resetModalForm = () => {
        this.form.reset();
        this.wholeDayToggle.setState(false);
        this.recurringToggle.setState(false);
        this.notificationToggle.setState(false);
        this.recurringDayLabel.innerHTML = "";
    }


    setFormData(absence: AbsenceObject) {
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_id").value = absence.id;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_name").value = absence.name;
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_description").value = absence.description;

        this.wholeDayToggle.setState(absence.wholeDay);

        const start = new Date(absence.start);
        const end = new Date(absence.end);

        const absenceFormatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        const absenceFormatTime = (date: Date) => {
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
        };

        Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_date").value = absenceFormatDate(start);
        this.startDateInput.dispatchEvent(new Event("change"));
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_date").value = absenceFormatDate(end);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_time").value = absenceFormatTime(start);
        Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_time").value = absenceFormatTime(end);

        const recurringValue = absence.recurring;
        const isRecurring = recurringValue && recurringValue.length > 0;
        this.recurringToggle.setState(isRecurring);
        if (isRecurring) {
            this.recurringRhythmSelect.value = recurringValue;
            this.recurringRhythmSelect.dispatchEvent(new Event("change"));
        }

    }

    getFormData(): AbsenceObjectWithNtf {
        const isWholeDay = this.wholeDayToggle.getState();

        let startString, endString;
        const startDate = Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_date").value
        const startTime = Stubegru.dom.querySelectorAsInput("#absence_modal_form_start_time").value
        const endDate = Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_date").value
        const endTime = Stubegru.dom.querySelectorAsInput("#absence_modal_form_end_time").value
        if (isWholeDay) {
            //Use only date
            startString = startDate;
            endString = endDate;
        } else {
            //Use date and time
            startString = startDate + " " + startTime;
            endString = endDate + " " + endTime; //TEST: Use startdate here...?
        }
        startString = new Date(startString).toISOString();
        endString = new Date(endString).toISOString();

        const isRecurring = this.recurringToggle.getState();
        const recurringValue = isRecurring ? Stubegru.dom.querySelectorAsInput("#absence_modal_form_recurring_rhythm").value as AbsenceRecurringString : "";

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
        }
    }

    isEndTimeBeforeNow(absence: AbsenceObject): boolean {
        const now = new Date();
        const end = new Date(absence.end);
        const endTimeMillis = end.getTime() % (1000 * 60 * 60 * 24); //get milliseconds since 0:00
        const nowTimeMillis = now.getTime() % (1000 * 60 * 60 * 24);

        return (endTimeMillis < nowTimeMillis);
    }

    getAbsenceEpochByDate(absence: AbsenceObject) {
        const now = new Date();
        const start = new Date(absence.start);
        const end = new Date(absence.end);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 9999);

        let epoch: AbsenceEpochString = "present";

        if (end < todayStart) { epoch = "past"; }
        if (start > todayEnd) { epoch = "future"; }

        if (!absence.wholeDay && epoch == "present") {
            if (end < now) { epoch = "past"; }
            if (start > now) { epoch = "future"; }
        }

        return epoch;
    }



    getAbsenceWithDisplayStrings(absence: AbsenceObject): AbsenceObjectWithDisplayStrings {
        const formatDate = Stubegru.utils.formatDate;
        const start = new Date(absence.start);

        let epoch = this.getAbsenceEpochByDate(absence);
        let startString = formatDate(absence.start, "DD.MM.YYYY");
        let endString = formatDate(absence.end, "DD.MM.YYYY");
        let recurringLabelText = "";
        let tableId: AbsenceTableId = "present";

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
                    } else {
                        startString = formatDate(absence.start, "DD.MM.YYYY hh:mm");
                        endString = formatDate(absence.end, "DD.MM.YYYY hh:mm");
                    }
                } else {
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
                } else {
                    startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                    endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
                }

                //if the absence's timeslot has ended before the current time -> move to upcoming table
                if (this.isEndTimeBeforeNow(absence)) { tableId = "future"; }
            }

            if (epoch == "future") {
                tableId = "future";
                if (absence.wholeDay) {
                    startString = formatDate(absence.start, "ab DD.MM.YYYY");
                    endString = "";
                } else {
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
                } else {
                    //if the absence's timeslot has ended before the current time -> move to upcoming table
                    if (this.isEndTimeBeforeNow(absence)) { tableId = "future"; }
                }

                if (absence.wholeDay) {
                    startString = `Jeden ${AbsenceView.DAY_NAMES[dayOfWeek]}`;
                    endString = `Jeden ${AbsenceView.DAY_NAMES[dayOfWeek]}`;
                } else {
                    startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                    endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
                }
            }

            if (epoch == "future") {
                tableId = "future";
                if (absence.wholeDay) {
                    startString = formatDate(absence.start, "ab DD.MM.YYYY");
                    endString = "";
                } else {
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

    async renderListView(absenceList: AbsenceObject[]) {
        let htmlHolder = {
            present: "",
            future: "",
        }

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
        UserUtils.updateAdminElements()
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