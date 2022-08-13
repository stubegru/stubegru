//**************************************Abwesenheit*********************************************
const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

refreshAbsenceView(); //Init absence view

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

function showAbsenceModal(id) {
    if (isNaN(id) == false) { //Wenn die id eine Nummer ist
        $.ajax({
            type: "POST",
            async: false,
            url: "../php/get_absence.php",
            data: {
                absenceId: id
            },
            success: function (data) {
                data = JSON.parse(data);
                var absence = data[0];
                $('#absence_name').val(absence.name);
                $('#absence_notes').val(absence.notice);
                var startdate = changeDateOrder(absence.startdate, "-");
                var enddate = changeDateOrder(absence.enddate, "-");
                $('#absence_start').val(startdate);
                $('#absence_end').val(enddate);
            }
        });
    }
    $("#absence_id").val(id);
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

            //check if the time of the absence is in the past or future
            const now = new Date();
            if (!absence.wholeDay && (absence.end < now || absence.start > now)) { absence.table = "future"; }
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
            }

            //check if the time of the absence is in the past or future
            const now = new Date();
            if (!absence.wholeDay && (absence.end < now || absence.start > now)) { absence.table = "future"; }


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
        absence.wholeDay = absence.wholeDay == "1";

        absence = setAbsenceEpoch(absence);
        absence = generateAbsenceStrings(absence);

        if (!absence) { continue; }

        let absenceHtml = `<tr><td>${absence.name}</td><td>${absence.description}</td><td>${absence.startString}</td><td>${absence.endString}</td><td>${absence.recurringString}</td><td><button class='absence-edit-button btn btn-default permission-beratung permission-required' data-absence-id='${absence.id}'><i class='fa fa-pencil-alt'></i></button></td><td><button class='absence-delete-button btn btn-danger permission-beratung permission-required' data-absence-id='${absence.id}'><i class='fa fa-times'></i></button></td></tr>`;

        $(`#absence_table_${absence.table}`).append(absenceHtml);
        //console.log(absence);
    }

    //register delete button actions
    $(".absence-delete-button").on("click",function(){
        let absenceId = $(this).attr("data-absence-id");
        deleteAbsence(absenceId);
    })

    stubegru.modules.userUtils.updateAdminElements()
}


function setAbsenceEpoch(absence) {
    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0);
    todayStart.setMinutes(0);
    todayStart.setSeconds(0);
    todayStart.setMilliseconds(0);

    const todayEnd = new Date();
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);
    todayEnd.setSeconds(59);
    todayEnd.setMilliseconds(9999);

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