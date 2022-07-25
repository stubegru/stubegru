//**************************************Abwesenheit*********************************************
$("#absence_whole_day_toggle").on("change", function () {
    if ($(this).prop('checked')) {
        $(".absence-whole-day-inputs").hide();
        $(".absence-time-inputs").show();
    }
    else {
        $(".absence-time-inputs").hide();
        $(".absence-whole-day-inputs").show();
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
            $(".absence-recurring-weekly-select").hide();
            break;
        case "weekly":
            $(".absence-recurring-weekly-select").show();
            break;
    }
});

function saveAbsence() { //Abwesenheit an DB senden | wird aufgerufen über form-action
    //Datumsformat an DB anpassen
    var startdate = changeDateOrder($('#absence_start').val(), ".");
    var enddate = changeDateOrder($('#absence_end').val(), ".");
    $.ajax({
        type: "POST",
        async: false,
        url: "../php/save_absence.php",
        data: {
            name: $('#absence_name').val(),
            notice: $('#absence_notes').val(),
            startdate: startdate,
            enddate: enddate,
            id: $('#absence_id').val()
        },
        success: function (data) {
            data = JSON.parse(data);
            swal("Abwesenheiten", data.message, data.state);
            getAbsence();
            $("#absenceModal").modal('hide');
            resetAbsenceForm();
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

function getAbsence() { //Abwesenheitsdaten aus der DB holen
    //Für die Hauptangestellten Daten
    $.ajax({
        type: "POST",
        async: false,
        url: "../php/get_absence.php",
        data: {
            absenceId: "all"
        },
        success: function (data) {
            data = JSON.parse(data);
            var nowDateObject = new Date();
            $('#absence_table_future').html("");
            $('#absence_table_today').html("");
            for (var i in data) {
                var startDateObject = new Date(data[i].startdate);
                var box;
                //Prüfen, in welche Box der Eintrag sortiert werden soll
                if (nowDateObject.getTime() < startDateObject.getTime()) {
                    box = "#absence_table_future";
                } else {
                    box = "#absence_table_today";
                }
                var startdate = changeDateOrder(data[i].startdate, "-");
                var enddate = changeDateOrder(data[i].enddate, "-");
                $(box).append(" <tr><td>" + data[i].name + "</td><td>" + data[i].notice + "</td><td>" + startdate + "</td><td>" + enddate + "</td><td><button class='btn btn-default admin' onclick='showAbsenceModal(" + data[i].id + ")'><span class='glyphicon glyphicon-pencil'></span></button></td><td><button class='btn btn-danger admin' onclick='deleteAbsence(" + data[i].id + ")'><span class='glyphicon glyphicon-remove'></span></button></td></tr>");
            }
            checkAdminLevel();
        }
    });
}

function resetAbsenceForm() {
    $('#absence_name').val("");
    $('#absence_notes').val("");
    $('#absence_start').val("");
    $('#absence_end').val("");
    $('#absence_id').val("");
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