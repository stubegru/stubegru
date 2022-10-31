//*********************************************Telefonnotizen*************************************
refreshTelephoneRecipientsDropdown();
$('[data-toggle="tooltip"]').tooltip();

async function refreshTelephoneRecipientsDropdown() {
    const userList = await stubegru.modules.userUtils.getUserByPermission("RECEIVE_TELEPHONE_NOTE");
    $("#telephonenote_recipients").html("<option value=''>Bitte wählen...</option>"); //Clear old recipients
    for (const user of userList) {
        $("#telephonenote_recipients").append($('<option>', {
            value: user.mail,
            text: user.name
        }));
    }

}

function sendTelephoneNote() { 
    let note = {};
    note.name = $("#telephonenote_name").val();
    note.mnumber = $("#telephonenote_mnumber").val();
    note.phone = $("#telephonenote_phone").val();
    note.mail = $("#telephonenote_mail").val();
    note.note = $("#telephonenote_note").val();
    note.recipient = $("#telephonenote_recipients").val();
    note.issue = $("#telephonenote_issue").val();

    $.ajax({
        type: "POST",
        dataType: "json",
        data: note,
        url: `${stubegru.constants.BASE_URL}/modules/telephone_notes/send_telephone_note.php`,
        success: function (data) {
            stubegru.modules.alerts.alert({
                title: "Telefonnotiz",
                text: data.message,
                type: data.status
            });
            if (data.status == "success") { document.getElementById("telephonenote_form").reset(); }
        },
        error: function (data) {
            stubegru.modules.alerts.alert({
                title: "Es ist ein Fehler aufgetreten",
                text: "Die Telefonnotiz konnte nicht versendet werden",
                type: "error"
            });
        }
    });
    
}