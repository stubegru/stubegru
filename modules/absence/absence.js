//**************************************Abwesenheit*********************************************
const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

refreshAbsenceView(); //Init absence view
setInterval(refreshAbsenceView, 1000 * 60 * 15); //Refresh view every 15 minutes

$('[data-toggle="tooltip"]').tooltip(); 

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

//Reset modal on hide
$('#absenceModal').on('hidden.bs.modal', resetAbsenceForm);

function resetAbsenceForm() {
    document.getElementById("absenceForm").reset();
    $('#absence_whole_day_toggle').bootstrapToggle('off');
    $('#absence_recurring_toggle').bootstrapToggle('off');
    $('#absence_notification_toggle').bootstrapToggle('off');
    $("#absence_recurring_day_label").html("");

}

function saveAbsence() { //Abwesenheit an DB senden | wird aufgerufen über form-action
    let absence = {};

    if ($("#absence_id").val() == "new") {
        absence.mode = "create";
    } else {
        absence.mode = "update";
        absence.id = $("#absence_id").val();
    }

    absence.name = $("#absence_name").val();
    absence.description = $("#absence_description").val();

    if ($("#absence_whole_day_toggle").prop("checked")) {
        //with time
        const startTimestampString = `${$("#absence_date").val()} ${$("#absence_start_time").val()}`;
        const endTimestampString = `${$("#absence_date").val()} ${$("#absence_end_time").val()}`;
        absence.start = new Date(startTimestampString).toISOString();
        absence.end = new Date(endTimestampString).toISOString();
        absence.wholeDay = 0;
    }
    else {
        //only date
        absence.start = new Date($("#absence_date").val()).toISOString();
        absence.end = new Date($("#absence_end_date").val()).toISOString();
        absence.wholeDay = 1;
    }

    //recurring rule
    if ($("#absence_recurring_toggle").prop("checked")) {
        absence.recurring = $("#absence_recurring_rhythm").val();
    }
    else {
        absence.recurring = null;
    }

    //notification
    absence.notification = $("#absence_notification_toggle").prop("checked") ? 1 : 0;


    $.ajax({
        type: "POST",
        dataType: "json",
        data: absence,
        url: `${stubegru.constants.BASE_URL}/modules/absence/save_absence.php`,
        success: function (data) {
            stubegru.modules.alerts.alert({
                title: "Abwesenheit speichern",
                text: data.message,
                type: data.status
            });
            if (data.status == "success") { $("#absenceModal").modal("hide"); }
            refreshAbsenceView();
        },
        error: function (data) {
            stubegru.modules.alerts.alert({
                title: "Es ist ein Fehler aufgetreten",
                text: "Der Eintrag zur Abwesenheit konnte nicht gespeichert werden",
                type: "error"
            });
        }
    });
}

async function editAbsence(absenceId) {
    $("#absence_id").val(absenceId);

    if (absenceId != "new") {
        let absence = await getAbsence(absenceId);
        absence.wholeDay = absence.wholeDay == "1";
        let isRecurring = absence.recurring != "";

        $("#absence_name").val(absence.name);
        $("#absence_description").val(absence.description);
        $("#absence_whole_day_toggle").bootstrapToggle(absence.wholeDay ? 'off' : 'on');
        $("#absence_date").val(formatDate(absence.start, "YYYY-MM-DD")).trigger("change");
        if (absence.wholeDay) { $("#absence_end_date").val(formatDate(absence.end, "YYYY-MM-DD")); }
        if (!absence.wholeDay) { $("#absence_start_time").val(formatDate(absence.start, "hh:mm")); }
        if (!absence.wholeDay) { $("#absence_end_time").val(formatDate(absence.end, "hh:mm")); }
        $("#absence_recurring_toggle").bootstrapToggle(isRecurring ? 'on' : 'off');
        $("#absence_recurring_rhythm").val(isRecurring ? absence.recurring : "daily").trigger("change");
    }

    $("#absenceModal").modal("show");
}

async function getAbsence(absenceId) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: { absenceId: absenceId },
            url: `${stubegru.constants.BASE_URL}/modules/absence/get_absence.php`,
            success: resolve,
            error: reject
        });
    });

}

/**
 * Checks wether the passed absence's time slot has overlay with the current time
 * 
 * Returns "past" if the absence's time slot has already ended at the current time
 * 
 * Returns "present" if the absence's time slot has overlay with the current time
 * 
 * Returns "future" if the absence's time slot has not yet begun at the current time
 * 
 * A whole-day absence will always return "present"
 * This function cares about daylight saving time offsets between the absence's start date and today
 * This function does NOT check for dates or days of the week. It just checks for time!
 * @param {Object} absence 
 * @returns {string} "past","present","future"
 */
function getTimeslotTiming(absence) {
    if (absence.wholeDay) return "present"; //If absence is whole-day it matches every time

    const now = new Date();
    let startTimeMillis = absence.start.getTime() % (1000 * 60 * 60 * 24); //get milliseconds since 0:00
    let endTimeMillis = absence.end.getTime() % (1000 * 60 * 60 * 24); //get milliseconds since 0:00
    let nowTimeMillis = now.getTime() % (1000 * 60 * 60 * 24);

    //Handle daylight saving time offsets (crazy shit...)
    const dstOffset = now.getTimezoneOffset() - absence.start.getTimezoneOffset(); //Get offset between DST and not-DST in MINUTES
    startTimeMillis += dstOffset * 60 * 1000;
    endTimeMillis += dstOffset * 60 * 1000;

    if (endTimeMillis > nowTimeMillis && startTimeMillis < nowTimeMillis) { return "present"; }
    if (endTimeMillis > nowTimeMillis) { return "future"; }
    return "past";
}



function generateAbsenceStrings(absence) {
    absence.startString = formatDate(absence.start, "DD.MM.YYYY");
    absence.endString = formatDate(absence.end, "DD.MM.YYYY");
    absence.recurringString = "";
    absence.table = "present";

    //No recurring
    if (absence.recurring == "") {

        if (absence.epoch == "past") {
            console.warn(`Not recurring absence from the past. Ignoring...`);
            console.warn(absence);
            return;
        }

        //if not in the past just add to the corresponding table
        absence.table = absence.epoch;

        if (!absence.wholeDay) {
            if (absence.epoch == "future") {
                if (formatDate(absence.start, "YYYY-MM-DD") == formatDate(new Date(), "YYYY-MM-DD")) {
                    //Today, but the time is in the future
                    absence.startString = `Heute ${formatDate(absence.start, "hh:mm")}`;
                    absence.endString = `Heute ${formatDate(absence.end, "hh:mm")}`;
                    absence.table = "present"; //Show upcoming hourly absence in present table if it is today but time is in the future
                } else {
                    absence.startString = formatDate(absence.start, "DD.MM.YYYY hh:mm");
                    absence.endString = formatDate(absence.end, "DD.MM.YYYY hh:mm");
                }
            } else {
                absence.startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                absence.endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
            }
        }


    }

    //daily recurring
    if (absence.recurring == "daily") {
        absence.recurringString = `<span class="label label-info">Täglich</span>`;

        if (absence.epoch == "present" || absence.epoch == "past") {
            if (absence.wholeDay) {
                absence.startString = "Heute";
                absence.endString = "Heute";
            } else {
                absence.startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                absence.endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
            }

            //if the absence's timeslot has ended before the current time -> move to upcoming table
            if (getTimeslotTiming(absence) == "past") { absence.table = "future"; }
        }

        if (absence.epoch == "future") {
            absence.table = "future";
            if (absence.wholeDay) {
                absence.startString = formatDate(absence.start, "ab DD.MM.YYYY");
                absence.endString = "";
            } else {
                absence.startString = formatDate(absence.start, "ab DD.MM.YYYY hh:mm");
                absence.endString = formatDate(absence.end, "hh:mm");
            }
        }
    }

    //weekly recurring
    if (absence.recurring == "weekly") {
        let dayOfWeek = absence.start.getDay();
        let currentDayOfWeek = new Date().getDay();
        absence.recurringString = `<span class="label label-info">Jeden ${dayNames[dayOfWeek]}</span>`;

        if (absence.epoch == "present" || absence.epoch == "past") {

            //check if weekly recurring is today or not (set corresponding table)
            if (dayOfWeek != currentDayOfWeek) {
                absence.table = "future";
            } else {
                //if the absence's timeslot has ended before the current time -> move to upcoming table
                if (getTimeslotTiming(absence) == "past") { absence.table = "future"; }
            }

            if (absence.wholeDay) {
                absence.startString = `Jeden ${dayNames[dayOfWeek]}`;
                absence.endString = `Jeden ${dayNames[dayOfWeek]}`;
            } else {
                absence.startString = `${formatDate(absence.start, "hh:mm")} Uhr`;
                absence.endString = `${formatDate(absence.end, "hh:mm")} Uhr`;
            }
        }

        if (absence.epoch == "future") {
            absence.table = "future";
            if (absence.wholeDay) {
                absence.startString = formatDate(absence.start, "ab DD.MM.YYYY");
                absence.endString = "";
            } else {
                absence.startString = formatDate(absence.start, "ab DD.MM.YYYY hh:mm");
                absence.endString = formatDate(absence.end, "hh:mm");
            }
        }
    }
    return absence;
}

async function refreshAbsenceView() {

    let absenceList = await getAbsence("all");
    $("#absence_table_present").html("");
    $("#absence_table_future").html("");

    for (let absence of absenceList) {
        absence.start = new Date(absence.start);
        absence.end = new Date(absence.end);
        absence.wholeDay = (absence.wholeDay == "1");

        absence = setAbsenceEpoch(absence);
        absence = generateAbsenceStrings(absence);

        if (!absence) { continue; }

        let absenceHtml = `<tr><td>${absence.name}</td><td>${absence.description}</td><td>${absence.startString}</td><td>${absence.endString}</td><td>${absence.recurringString}</td><td><button class='absence-edit-button btn btn-default permission-ABSENCE_WRITE permission-required' data-absence-id='${absence.id}'><i class='fa fa-pencil-alt'></i></button></td><td><button class='absence-delete-button btn btn-danger permission-ABSENCE_WRITE permission-required' data-absence-id='${absence.id}'><i class='fa fa-times'></i></button></td></tr>`;

        $(`#absence_table_${absence.table}`).append(absenceHtml);
        //console.log(absence);
    }

    //register delete button actions
    $(".absence-delete-button").on("click", function () {
        let absenceId = $(this).attr("data-absence-id");
        deleteAbsence(absenceId);
    })

    //register edit button actions
    $(".absence-edit-button").on("click", function () {
        let absenceId = $(this).attr("data-absence-id");
        editAbsence(absenceId);
    })

    stubegru.modules.userUtils.updateAdminElements()
}


function setAbsenceEpoch(absence) {
    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 9999);

    absence.epoch = "present";

    if (absence.end < todayStart) { absence.epoch = "past"; }
    if (absence.start > todayEnd) { absence.epoch = "future"; }

    if (!absence.wholeDay && absence.epoch == "present") {
        if (absence.end < now) { absence.epoch = "past"; }
        if (absence.start > now) { absence.epoch = "future"; }
    }

    return absence;
}

function deleteAbsence(absenceId) {
    deleteConfirm("Abwesenheit löschen", "Soll diese Abwesenheit wirklich gelöscht werden?", function () {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: { absenceId: absenceId },
            url: `${stubegru.constants.BASE_URL}/modules/absence/delete_absence.php`,
            success: function (data) {
                stubegru.modules.alerts.alert({
                    title: "Abwesenheit löschen",
                    text: data.message,
                    type: data.status
                });
                refreshAbsenceView();
            }
        });
    });
}