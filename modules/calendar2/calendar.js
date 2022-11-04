var liveSearchTimer;
$("#terminmodal").on('hidden.bs.modal', resetCalendarForm); //Reset terminmodal wenn es ausgeblendet wird
$('#collapseCalendar').on('shown.bs.collapse', () => { fullCalendarInstance.render(); })

$("#calendarSettingsForeignToggle").on("change", function (event) {
    console.log($(this).prop('checked'));
});

$(document).on('click', '#calendarSettingsDropdown', function (e) {
    e.preventDefault();
    e.stopPropagation();
});


const fullcalendarConfig = {
    initialView: 'dayGridMonth',
    //handleWindowResize: false,
    businessHours: {
        // days of week. an array of zero-based day of week integers (0=Sunday)
        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
        startTime: '08:00',
        endTime: '16:00'
    },
    weekends: false,
    headerToolbar: {
        start: 'dayGridMonth timeGridWeek',
        center: 'title',
        end: 'toggleStubegru toggleCaldav prev,next'
    },
    buttonText: {
        today: 'Heute',
        month: 'Monat',
        week: 'Woche',
        day: 'Tag',
        list: 'Liste'
    },
    eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false //use 24 hour syntax (17:00 instead of 5:00 pm)
    },
    eventClick: function (info) {
        info.jsEvent.preventDefault(); // don't let the browser navigate
        clickOnMeetingHandler(info.event.extendedProps);
    }
    
}
let fullCalendarInstance;


//Lade den Kalender
initFullcalendarView();
loadDates();
getRooms();
getTemplates();
getAdvisorsForCalendar();
CKEDITOR.replace('mailTemplateEditor'); //Richtexteditor initialisieren
resetCalendarForm();

function initFullcalendarView() {
    let calendarEl = document.getElementById('calendarViewContainer');
    fullCalendarInstance = new FullCalendar.Calendar(calendarEl, fullcalendarConfig);
    fullCalendarInstance.render();
}



async function resetCalendarForm() {
    let calendarTitle = "Beratungstermin";
    $('#calendarDate').val("");
    $('#calendarStart').val("");
    $('#calendarEnd').val("");
    $('#calendarTitle').val(calendarTitle);

    $('#calendarRoom').val("");
    $('#calendarTemplate').val("");

    $('#calendarClientName').val("");
    $('#calendarClientMail').val("");
    $('#calendarClientIssue').val("");
    $('#calendarClientPhone').val("");
    $('#calendarClientSurvey').val("Nein");

    resetRoomForm();
    resetTemplateForm();
    $("#calendarDeleteMeetingButton").off();//remove all eventhandler
    $(".terminmodal-input").prop('disabled', false);
}

function clickOnMeetingHandler(meeting) {
    //Show event details in modal
    $('#calendarDate').val(meeting.date);
    $('#calendarStart').val(meeting.start);
    $('#calendarEnd').val(meeting.end);
    $('#calendarTitle').val(meeting.title);
    $('#calendarOwner').val(meeting.ownerId);

    $('#calendarRoom').val(meeting.room);
    $('#calendarTemplate').val(meeting.template);

    if (meeting.teilnehmer) {
        $('#calendarClientName').val(meeting.teilnehmer.name);
        $('#calendarClientMail').val(meeting.teilnehmer.mail);
        $('#calendarClientIssue').val(meeting.teilnehmer.description);
        $('#calendarClientPhone').val(meeting.teilnehmer.phone);
        $('#calendarClientSurvey').val("");
    }

    resetRoomForm();
    resetTemplateForm();
    $(".terminmodal-input").prop('disabled', true);

    $("#calendarDeleteMeetingButton").off();//remove all eventhandler
    $("#calendarDeleteMeetingButton").on('click', () => { deleteDate(meeting.id) });

    $("#terminmodal").modal("show");
}


function loadDates() { //Lädt die Daten des aktuell angezeigten Zeitraums aus der DB und gibt diese an die addDatesToView() weiter.

    let startDate = new Date();
    startDate.setDate(1);
    startDate.setTime(startDate.getTime() - 1000 * 60 * 60 * 24);
    let timestampNextYear = new Date().getTime() + 1000 * 60 * 60 * 24 * 365;
    let endDate = new Date(timestampNextYear);
    endDate.setDate(30);

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/calendar/dates/get_meetings.php`,
        data: {
            start: formatDate(startDate, "YYYY-MM-DDThh:mm:ss"),
            end: formatDate(endDate, "YYYY-MM-DDThh:mm:ss"),
        },
        success: function (data) {
            fullCalendarInstance.removeAllEvents(); //Clear calendar
            let stubegruMeetings = data.stubegru;
            addStubegruMeetingsToFullcalendar(stubegruMeetings);
        }
    });

}





async function addStubegruMeetingsToFullcalendar(datesArray) {
    //Generate events for fullcalendar
    let ownUserId = stubegru.currentUser.id;
    let ownEvents = [];
    let othersEvents = [];

    for (let inDate of datesArray) {
        let outDate = {
            title: inDate.title,
            start: `${inDate.date}T${inDate.start}`,
            end: `${inDate.date}T${inDate.end}`,
            extendedProps: inDate
        };

        if (inDate.ownerId == ownUserId) { ownEvents.push(outDate); } else { othersEvents.push(outDate); }
    }

    //Generate and add Eventsource
    fullCalendarInstance.addEventSource({
        id: "stubegru-own-events",
        events: ownEvents,
        color: "#2196f3",
        classNames: ["pointer"]
    });

    fullCalendarInstance.addEventSource({
        id: "stubegru-others-events",
        events: othersEvents,
        color: "#999ca1",
        classNames: ["pointer"]
    });
}

//Setzt die End-Uhrzeit des Termins automatisch auf eine Stunde nach der Startzeit
function setDateEndTime() {
    let startTime = $("#calendarStart").val();
    if (startTime.length == 5) {
        let hours = startTime.substr(0, 2);
        let minutes = startTime.substr(3, 2);
        hours++;
        $("#calendarEnd").val(hours + ":" + minutes);
    }
}

async function saveMeeting() {
    //show spinner    
    $("#saveMeetingButton").html(`Termin wird gespeichert &nbsp;<i class="fas fa-circle-notch fa-spin"></i>`);
    $("#saveMeetingButton").attr("disabled", true);
    //Save Meeting
    let meeting = new FormData();
    meeting.append("date", $('#calendarDate').val());
    meeting.append("start", $('#calendarStart').val());
    meeting.append("end", $('#calendarEnd').val());
    meeting.append("title", $('#calendarTitle').val());
    meeting.append("ownerId", $('#calendarOwner').val());
    meeting.append("roomId", $('#calendarRoom').val());
    meeting.append("templateId", $('#calendarTemplate').val());

    let meetingResp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/dates/save_calendar_date.php`, {
        method: 'POST',
        body: meeting
    });

    //Process response
    meetingResp = await meetingResp.json();
    if (meetingResp.status != "success") {
        stubegru.modules.alerts.alert({
            title: "Termin konnte nicht gespeichert werden",
            text: meetingResp.message,
            type: "error"
        });
        return; //stop here, dont save client data
    }

    //Save Client data
    let client = new FormData();
    client.append("dateId", meetingResp.dateId);
    client.append("name", $("#calendarClientName").val());
    client.append("mail", $("#calendarClientMail").val());
    client.append("phone", $("#calendarClientPhone").val());
    client.append("survey", $("#calendarClientSurvey").val());
    client.append("issue", $("#calendarClientIssue").val());

    let clientResp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/dates/assign_date.php`, {
        method: 'POST',
        body: client
    });

    //Process response
    clientResp = await clientResp.json();
    if (clientResp.status != "success") {
        stubegru.modules.alerts.alert({
            title: "Termin konnte nicht vollständig vergeben werden",
            text: clientResp.message,
            type: "error"
        });
    }
    else {
        stubegru.modules.alerts.alert({
            title: "Termin vergeben",
            text: clientResp.message,
            type: "success"
        });
        loadDates();
        $("#terminmodal").modal("hide");
    }
    $("#saveMeetingButton").attr("disabled", false);
    $("#saveMeetingButton").html(`Termin speichern`);

}


function deleteDate(meetingId) { //Löscht den termin

    deleteConfirm("Termin löschen", "Soll der Termin wirklich gelöscht werden?", function () {

        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/calendar/dates/delete_date.php`,
            data: {
                id: meetingId
            },
            success: function (data) {
                stubegru.modules.alerts.alert({
                    title: "Termin löschen",
                    text: data.message,
                    type: data.status,
                    mode: "toast"
                });
                if (data.status == "success") {
                    loadDates();
                    $("#terminmodal").modal("hide"); //hides the modal
                }
            }
        });
    });

}

//********************************************************Berater**********************************************
async function getAdvisorsForCalendar() { //Lädt die Berater in die Dropdown auswahl

    let ownId = stubegru.currentUser.id;

    let userList = await stubegru.modules.userUtils.getUserByPermission("MEETING_ADVISOR");
    let selectHtml = "";
    for (const user of userList) {
        if (ownId == user.id) { //Add own entry at top (default)
            selectHtml = `<option value="${user.id}">${user.name}</option>` + selectHtml;
        } else {
            selectHtml += `<option value="${user.id}">${user.name}</option>`;
        }
    }

    $("#calendarOwner").html(selectHtml);

}



//********************************************************Räume**********************************************


//Verknüpfung Raumkanal zu Mailtemplates
$("#calendarRoom").on("change", function () {
    let channel = $(this).find(':selected').attr("data-channel");

    let roomTemplateAssignment = stubegru.constants.CUSTOM_CONFIG.roomTemplateAssignment;
    if (roomTemplateAssignment && roomTemplateAssignment[channel]) {
        const templateId = roomTemplateAssignment[channel];
        $("#calendarTemplate").val(templateId).change();
    }
})



async function getRooms() { //Lädt die Räume in die Dropdown auswahl

    let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/rooms/get_rooms.php`);
    let data = await resp.json();

    let ownId = stubegru.currentUser.id;
    const channelDescriptions = {
        "personally": "Persönlich",
        "phone": "Telefon",
        "webmeeting": "Webmeeting"
    };

    let selectHtml = "<option value=''>Bitte wählen...</option>";
    let postHtml;
    for (const room of data) {
        const optionString = `<option value='${room.id}' id='roomSelectOption${room.id}' data-channel='${room.kanal}' >[${channelDescriptions[room.kanal]}] ${room.titel}</option>`
        if (ownId == room.besitzer) { //Add own entry at top
            selectHtml += optionString;
        } else {
            postHtml += optionString;
        }
    }
    $("#calendarRoom").html(selectHtml + postHtml);

}


function saveRoom() { //speichert einen neuen Raum in die DB

    let raum = {};
    raum.id = $("#raum_id").val();
    raum.kanal = $("#raum_kanal").val();
    raum.titel = $("#raum_titel").val();
    raum.raumnummer = $("#raum_nr").val();
    raum.etage = $("#raum_etage").val();
    raum.strasse = $("#raum_strasse").val();
    raum.hausnummer = $("#raum_hausnr").val();
    raum.plz = $("#raum_plz").val();
    raum.ort = $("#raum_ort").val();
    raum.link = $("#raum_link").val();
    raum.passwort = $("#raum_passwort").val();
    raum.telefon = $("#raum_telefon").val();

    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/calendar/rooms/save_room.php`,
        data: raum,
        dataType: "json",
        success: async function (resp) {
            if (resp.status == "success") {
                stubegru.modules.alerts.alert({
                    title: "Raum gespeichert!",
                    text: resp.message,
                    type: "success"
                });
                await getRooms(); //Reload room to select
                $("#calendarRoom option[id='roomSelectOption" + resp.roomId + "']").attr("selected", "selected"); //Gespeicherter Raum wird ausgewählt
                resetRoomForm();
            }
            else {
                stubegru.modules.alerts.alert({
                    title: "Fehler",
                    text: resp.message,
                    type: "error"
                });
            }
        }

    });
}

function resetRoomForm() {
    $("#raum_id").val("");
    $("#raum_titel").val("");
    $("#raum_nr").val("");
    $("#raum_etage").val("");
    $("#raum_strasse").val("");
    $("#raum_hausnr").val("");
    $("#raum_plz").val("");
    $("#raum_ort").val("");
    $("#raum_link").val("");
    $("#raum_passwort").val("");
    $("#raum_telefon").val("");

    $("#newroom").slideUp();
}

function openRoomForm(mode) { //Öffnet die Raum Vorschau zum bearbeiten
    if (mode == "modify") {
        //Bestehenden Raum überarbeiten
        let raumId = $("#calendarRoom").val(); //Id des zu Raumes aus dem select auslesen
        if (raumId == null || raumId == "") {
            stubegru.modules.alerts.alert({
                title: "Raum bearbeiten:",
                text: "Bitte erst einen Raum auswählen",
                type: "warning",
                mode: "toast"
            });
            return;
        }

        $.ajax({
            type: "POST",
            url: `${stubegru.constants.BASE_URL}/modules/calendar/rooms/get_room_data.php`,
            data: { id: raumId },
            dataType: "json",
            success: function (resp) {
                $("#raum_id").val(resp.id);
                $("#raum_kanal").val(resp.kanal);
                $("#raum_titel").val(resp.titel);
                $("#raum_nr").val(resp.raumnummer);
                $("#raum_etage").val(resp.etage);
                $("#raum_strasse").val(resp.strasse);
                $("#raum_hausnr").val(resp.hausnummer);
                $("#raum_plz").val(resp.plz);
                $("#raum_ort").val(resp.ort);
                $("#raum_link").val(resp.link);
                $("#raum_passwort").val(resp.passwort);
                $("#raum_telefon").val(resp.telefon);

                $("#newroom").slideDown();

            }
        });
    } else {
        //Neuen Raum anlegen
        resetRoomForm();
        $("#raum_id").val("new");
        $("#newroom").slideDown();
    }
}

function deleteRoom() { //löscht einen Raum
    deleteConfirm("Raum löschen", "Soll dieser Raum wirklich gelöscht werden?", function () {

        $.ajax({
            type: "POST",
            url: `${stubegru.constants.BASE_URL}/modules/calendar/rooms/delete_room.php`,
            dataType: "json",
            data: { id: $("#raum_id").val() },
            success: function (resp) {
                stubegru.modules.alerts.alert({
                    title: "Hinweis",
                    text: resp.message,
                    type: resp.status
                });
                getRooms();
                resetRoomForm();
            }
        });
    });

}


//***********************************************Mail Templates**************************************************

async function getTemplates() { //Lädt templates aus der Db ins Dropdown

    let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/templates/get_templates.php`);
    let data = await resp.json();

    let selectHtml = "<option value=''>Bitte wählen...</option>";
    let postHtml;
    for (const template of data) {
        const ownId = stubegru.currentUser.id;
        const optionString = `<option value='${template.id}' title='${template.text}' id='templateSelectOption${template.id}'>${template.titel}</option>`
        if (ownId == template.ersteller) { //Add own entry at top
            selectHtml += optionString;
        } else {
            postHtml += optionString;
        }
    }
    selectHtml += postHtml;
    $("#calendarTemplate").html(selectHtml);

}


function saveTemplate() { //speichert Template in DB

    let templateData = {};
    templateData.title = $("#templateTitle").val();
    templateData.subject = $("#templateSubject").val();
    templateData.text = CKEDITOR.instances.mailTemplateEditor.getData();
    templateData.templateId = $("#templateId").val();


    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/calendar/templates/save_template.php`,
        data: templateData,
        success: async function (data) {
            stubegru.modules.alerts.alert({
                title: "Template speichern",
                text: data.message,
                type: data.status
            });
            if (data.status == "success") {
                await getTemplates();
                $("#calendarTemplate option[id='templateSelectOption" + data.optionId + "']").attr("selected", "selected"); //Gespeichertes Template wird wieder ausgewählt
                resetTemplateForm();
            }
        }
    });


}

function deleteTemplate() { //löscht ein Template
    deleteConfirm("Vorlage löschen", "Soll diese Vorlage wirklich gelöscht werden?", function () {
        const templateId = $("#templateId").val();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/calendar/templates/delete_template.php`,
            data: {
                templateId: templateId
            },
            success: function (data) {
                stubegru.modules.alerts.alert({
                    title: "Template löschen",
                    text: data.message,
                    type: data.status
                });
                getTemplates();
                resetTemplateForm();
            }
        });
    });

}






function resetTemplateForm() {
    $("#templateTitle").val("");
    $("#templateSubject").val("");
    CKEDITOR.instances.mailTemplateEditor.setData("");
    $("#newmail").slideUp();
}

function openTemplateForm(mode) { //Öffnet die Template Vorschau zum bearbeiten
    if (mode == "modify") {
        let templateId = $("#calendarTemplate").val();
        if (templateId == null || templateId == "") {
            stubegru.modules.alerts.alert({
                title: "Vorlage bearbeiten:",
                text: "Bitte erst eine Vorlage auswählen",
                type: "warning",
                mode: "toast"
            });
            return;
        }

        $('#templateId').val(templateId);
        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/calendar/templates/get_template_data.php`,
            data: {
                templateId: templateId
            },
            success: function (data) {
                $("#templateTitle").val(data.titel);
                $("#templateSubject").val(data.betreff);
                CKEDITOR.instances.mailTemplateEditor.setData(data.text);
            }
        });
    } else {
        resetTemplateForm();
        $("#templateId").val("new");
    }
    $("#newmail").slideDown();
}


