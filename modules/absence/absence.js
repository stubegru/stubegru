//**************************************Abwesenheit*********************************************

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
        const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
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

function getAbsence() {

    $.ajax({
        type: "POST",
        dataType: "json",
        data: { absenceId: "all" },
        url: `${stubegru.constants.BASE_URL}/modules/absence/get_absence.php`,
        success: function (data) {
            for(let absence of data){
                absence.start = new Date(`${absence.start}Z`); //Add trailing "Z" to interpret as UTC time
                absence.end = new Date(`${absence.end}Z`); //Add trailing "Z" to interpret as UTC time
                console.log(absence);
            }

        }
    });


    
        // success: function (data) {
        //     data = JSON.parse(data);
        //     var nowDateObject = new Date();
        //     $('#absence_table_future').html("");
        //     $('#absence_table_today').html("");
        //     for (var i in data) {
        //         var startDateObject = new Date(data[i].startdate);
        //         var box;
        //         //Prüfen, in welche Box der Eintrag sortiert werden soll
        //         if (nowDateObject.getTime() < startDateObject.getTime()) {
        //             box = "#absence_table_future";
        //         } else {
        //             box = "#absence_table_today";
        //         }
        //         var startdate = changeDateOrder(data[i].startdate, "-");
        //         var enddate = changeDateOrder(data[i].enddate, "-");
        //         $(box).append(" <tr><td>" + data[i].name + "</td><td>" + data[i].notice + "</td><td>" + startdate + "</td><td>" + enddate + "</td><td><button class='btn btn-default admin' onclick='showAbsenceModal(" + data[i].id + ")'><span class='glyphicon glyphicon-pencil'></span></button></td><td><button class='btn btn-danger admin' onclick='deleteAbsence(" + data[i].id + ")'><span class='glyphicon glyphicon-remove'></span></button></td></tr>");
        //     }
        //     checkAdminLevel();
        // }
}


function deleteAbsence(id) {
    deleteConfirm("Abwesenheit löschen", "Soll der Eintrag wirklich gelöscht werden?", function () {
        $.ajax({
            type: "POST",
            async: false,
            url: "../php/delete_absence.php",
            data: {
                id: id
            },
            success: function (data) {
                data = JSON.parse(data);
                swal({
                    title: "Abwesenheit löschen",
                    text: data.message,
                    type: data.state,
                    timer: 4000
                });
            }
        });
        getAbsence();
    });
}

function toggleAbsenceView() {
    if (showOnlyCurrentAbsences) {
        $("#toggleAbsenceButton").html(" Nur aktuelle anzeigen");
        showOnlyCurrentAbsences = false;
    } else {
        $("#toggleAbsenceButton").html(" Alle anzeigen");
        showOnlyCurrentAbsences = true;
    }
    $("#absence_table_future").fadeToggle();
}