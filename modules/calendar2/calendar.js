var liveSearchTimer;



CalendarController.init();





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


    //Process response
    if (meetingResp.status != "success") {
        stubegru.modules.alerts.alert({
            title: "Termin konnte nicht gespeichert werden",
            text: meetingResp.message,
            type: "error"
        });
        return; //stop here, dont save client data
    }

    //Save Client data
    

    //Process response
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




//********************************************************Räume**********************************************


// //Verknüpfung Raumkanal zu Mailtemplates
// $("#calendarRoom").on("change", function () {
//     let channel = $(this).find(':selected').attr("data-channel");

//     let roomTemplateAssignment = stubegru.constants.CUSTOM_CONFIG.roomTemplateAssignment;
//     if (roomTemplateAssignment && roomTemplateAssignment[channel]) {
//         const templateId = roomTemplateAssignment[channel];
//         $("#calendarTemplate").val(templateId).change();
//     }
// })


// if(mode == "modify") {
//     //Bestehenden Raum überarbeiten
//     let raumId = $("#calendarRoom").val(); //Id des zu Raumes aus dem select auslesen
//     if (raumId == null || raumId == "") {
//         stubegru.modules.alerts.alert({
//             title: "Raum bearbeiten:",
//             text: "Bitte erst einen Raum auswählen",
//             type: "warning",
//             mode: "toast"
//         });
//         return;
//     }


// //room saved
//         if(resp.status == "success") {
//         stubegru.modules.alerts.alert({
//             title: "Raum gespeichert!",
//             text: resp.message,
//             type: "success"
//         });
//         await getRooms(); //Reload room to select
//         $("#calendarRoom option[id='roomSelectOption" + resp.roomId + "']").attr("selected", "selected"); //Gespeicherter Raum wird ausgewählt
//         resetRoomForm();
//     }
//         else {
//         stubegru.modules.alerts.alert({
//             title: "Fehler",
//             text: resp.message,
//             type: "error"
//         });
//     }


//***********************************************Mail Templates**************************************************

async function getTemplates() { //Lädt templates aus der Db ins Dropdown

    let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/templates/get_templates.php`);
    let data = await resp.json();

    

}


function saveTemplate() { //speichert Template in DB

    let templateData = {};
 


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


