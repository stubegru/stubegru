//**********************************Quicklinks*************************************
showQuicklinks();

function editQuicklinks() { //Editiermodus starten
    $("#collapseQuicklinks").collapse("show"); // Quicklinks Box aufklappen
    $(".edit-mode").slideToggle(); // Alle Elemente mit ".edit-mode" einblenden
}

function showQuicklinks() { //Quicklinks aus DB laden
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/quicklinks/get_quicklinks.php`,
        success: function (data) {
            let html = "";
            for (let item of data) {
                html += `<li><button class='btn btn-danger edit-mode permission-QUICKLINK_WRITE permission-required' style="margin:5px;" onclick='deleteQuicklink(${item.id})'><i class="fas fa-times"></i></button>
                <a href='${item.link}' target='_blank'>${item.text}</a>`;
            }
            $("#quicklinks").html(html);
            $(".edit-mode").slideUp();
        }
    });
}

function deleteQuicklink(id) {
    deleteConfirm("Quicklink löschen", "Soll der Quicklink wirklich gelöscht werden?", function () {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/quicklinks/delete_quicklink.php`,
            data: { id: id },
            success: function (data) {
                showQuicklinks();
                stubegru.modules.alerts.alert({
                    title: "Gelöscht!",
                    type: "success",
                    timer: 4000
                });
            }
        });
    });
}

function addQuicklink() { //neuen Quicklink in DB speichern
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/quicklinks/save_quicklink.php`,
        data: {
            title: $("#quicklinkTitel").val(),
            url: $("#quicklinkAdresse").val()
        },
        success: function (data) {
            resetQuicklinkForm();
            showQuicklinks();
            $("#quicklinkModal").modal("hide");
        }
    });
}

function resetQuicklinkForm() {
    $("#quicklinkTitel").val("");
    $("#quicklinkAdresse").val("");
}