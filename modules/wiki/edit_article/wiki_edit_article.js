//Speichert die per GET übergebene Artikel id
var currentArticleId;

//Speichert Alle Ids der Tags, die Aktuell dem Artikel zugeordnet sind
var currentTags = [];

//Speichert den Reminder des aktuellen Artikels
var currentReminder = {};

//Boolean, ob es ungespeicherte Änderungen gibt -> Wichtig für Warnung beim Verlassen ohne speichern
var unsavedChanges = false;

//timeout für die Live-Suche
var tagLiveSearchTimer;



/*
______                _                     _ 
| ___ \              | |                   | |
| |_/ /_ _  __ _  ___| |     ___   __ _  __| |
|  __/ _` |/ _` |/ _ \ |    / _ \ / _` |/ _` |
| | | (_| | (_| |  __/ |___| (_) | (_| | (_| |
\_|  \__,_|\__, |\___\_____/\___/ \__,_|\__,_|
            __/ |                             
           |___/                              

*/

CKEDITOR.replace('wikiArticleEditor', {
    extraPlugins: "wikiword",
    on: { instanceReady: initWikiEditPage }
}); //Richt text editor initialisieren und initWikiEditPage aufrufen, sobald der Eitor bereit ist
CKEDITOR.disableAutoInline = true;


//Beispielhafter Aufruf für das erstellen eines Artikels
//BASE_URL/?view=wiki_edit_article&mode=create&heading=neuertitel
//Aufruf für das bearbeiten eines Artikels
//BASE_URL/?view=wiki_edit_article&mode=edit&article=2

// Artikel Daten abrufen und eintragen, falls ein bestehender Artikel bearbeitet werden soll
function initWikiEditPage() {
    if (!getParam("mode")) {
        stubegru.modules.alerts.alert({
            text: "Der Artikel kann nicht bearbeitet werden. Bitte 'mode' in der URL angeben",
            title: "Fehler",
            type: "error",
            confirmButtonText: "Zurück",
        }, () => { window.history.back(); });
    }
    else {
        if (getParam("mode") == "edit") {
            getArticleData(getParam("article"));
        }
        else {
            $("#newArticleHeading").val(decodeURI(getParam("heading") || ""));
            currentArticleId = "create";
        }
    }
}

$("#wiki_tag_input").keyup(tryTagLiveSearch); //Muss nach der Tag initialisierung stehen
$('[data-toggle="tooltip"]').tooltip(); //Init Tooltips

$("#newArticleHeading").keyup(function () {
    //Bei Änderungen der Überschrift wird ohne speichern gewarnt
    unsavedChanges = true;
});

//Warnt den Nutzer, wenn er die Seite verlassen will ohne Änderungen zu speichern
window.onbeforeunload = function (e) {
    if (unsavedChanges == true) {
        return ' Sie haben ungespeicherte Änderungen - Möchten Sie die Seite wirklich verlassen?';
    }
};

$("#cancel_button").attr("href", `${stubegru.constants.BASE_URL}?view=wiki_start`);




/*
  _      _              _____                     _     
 | |    (_)            / ____|                   | |    
 | |     ___   _____  | (___   ___  __ _ _ __ ___| |__  
 | |    | \ \ / / _ \  \___ \ / _ \/ _` | '__/ __| '_ \ 
 | |____| |\ V /  __/  ____) |  __/ (_| | | | (__| | | |
 |______|_| \_/ \___| |_____/ \___|\__,_|_|  \___|_| |_|
                                                        
                                                        

*/



//Prüft, ob eine Suchanfrage an die Datenbank geschickt werden sollte. Wird immer aufgerufen, wenn eine Taste im input-Feld losgelassen wird
function tryTagLiveSearch() {
    if ($("#wiki_tag_input").val() == "") {
        //Falls das Such Input Feld leer ist, wird das Fenster mit dem Suchergebnis geleert und die Suchabfrage abgebrochen
        $("#tag_search_result").html("");
    } else {
        clearTimeout(tagLiveSearchTimer); //falls aktuell ein TimeOut für eine Live-Suche läuft wird dieses abgerbochen und...
        tagLiveSearchTimer = setTimeout(tagLiveSearch, 50); //... neu gestartet. Durch dieses verfahren wird die Live-Suche nicht öfter als alle 50ms ausgeführt somit wird der Server vor zu vielen Anfragen geschützt
    }
}


//Führt eine Suche nach allen Tags, die den übergeben String enthalten aus
function tagLiveSearch() {
    let aktuelleEingabe = $("#wiki_tag_input").val()

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/edit_article/wiki_tag_search.php`,
        data: {
            query: aktuelleEingabe
        },
        success: function (json) {
            var ausgabe = "";
            var tagExistiertSchon = false;

            for (let tagData of json) {
                if (aktuelleEingabe.toUpperCase() == tagData.tagName.toUpperCase()) { //Prüft, ob es schon einen Tag gibt, der genau mit der SUchanfrage übereinstimmt. ist dies der Fall wird der Tag Erstellen Button nicht mehr angezeigt
                    tagExistiertSchon = true;
                }
                ausgabe += `<div class = "btn btn-info tagCloud tagSearchResult" onclick="addTag(${tagData.tagId},'${tagData.tagName}')" data-tagId="${tagData.tagId}" title="Tag diesem Artikel zuordnen"><i class="fa fa-plus-circle"></i>${tagData.tagName}</div>`;
            }

            if (tagExistiertSchon == false) {
                //Create Tag Button vorne anhängen
                ausgabe = '<div class = "btn btn-success tagCloud tagSearchResult" onclick="createNewTag()" data-tagName="' + aktuelleEingabe + '" id="createTagButton"  title="Diesen Tag erstellen und dem Artikel zuordnen"><i class="fa fa-plus"></i>   ' + aktuelleEingabe + '</div> ' + ausgabe;
            }

            $("#tag_search_result").html(ausgabe);

        }
    });
}

/*


 _______  _______  _______  _______ 
|       ||   _   ||       ||       |
|_     _||  |_|  ||    ___||  _____|
  |   |  |       ||   | __ | |_____ 
  |   |  |       ||   ||  ||_____  |
  |   |  |   _   ||   |_| | _____| |
  |___|  |__| |__||_______||_______|


*/

//Add first tag in list on pressing "Enter"
$("#wiki_tag_input").on("keypress", (e) => {
    if (e.which == 13) { //keycode for Enter key
        $("#tag_search_result").children().first().click(); //Click the first button
    }
})

//Fügt einen bestehenden tag dem aktuellen Artikel hinzu
function addTag(tagId, tagName) {
    if (currentTags.indexOf(tagId) == -1) {
        currentTags.push(tagId);
        $("#wiki_tag_container").append("<div class='btn btn-primary btn-sm tagCloud assignedTag' data-tagId='" + tagId + "' >" + tagName + "   <i class='fa fa-close'></i></div>");
        $("#wiki_tag_input").val("").focus();

        unsavedChanges = true;

        //tag bei mOuse Over rot machen
        $(".assignedTag").mouseenter(function () {
            $(this).addClass("btn-danger");
        });
        $(".assignedTag").mouseleave(function () {
            $(this).removeClass("btn-danger");
        });
        //tag löschen, wenn man draufklickt
        $(".assignedTag").click(function () {
            deleteTag(this);
        });

    } else {
        stubegru.modules.alerts.alert({
            title: "Achtung",
            text: "Der Tag ist bereits zugeordnet",
            type: "warning"
        });
    }

}

//Löst einen Tag vom aktuellen Artikel. Der Tag an sich bleibt in der Datenbank erhalten
function deleteTag(tagObject) {
    tagObject = $(tagObject);
    var tagId = Number(tagObject.attr("data-tagId"));
    unsavedChanges = true;
    //Id löschen aus Array
    var index = currentTags.indexOf(tagId);
    if (index > -1) {
        currentTags.splice(index, 1);
    }
    tagObject.remove(); //Element aus dem DOM entfernen
}

//Erstellt einen komplett neuen Tag und fügt ihn in die Datenbank hinzu. Zudem wird der Tag dem aktuellen Artikel zugeordnet
function createNewTag() {
    var newTagName = $("#createTagButton").attr("data-tagName");

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/edit_article/wiki_create_tag.php`,
        data: {
            name: newTagName
        },
        success: function (json) {
            addTag(json.tagId, json.tagName);
        }
    });


}

/*
  _                     _                   _    _____                 
 | |                   | |                 | |  / ____|                
 | |     ___   __ _  __| |   __ _ _ __   __| | | (___   __ ___   _____ 
 | |    / _ \ / _` |/ _` |  / _` | '_ \ / _` |  \___ \ / _` \ \ / / _ \
 | |___| (_) | (_| | (_| | | (_| | | | | (_| |  ____) | (_| |\ V /  __/
 |______\___/ \__,_|\__,_|  \__,_|_| |_|\__,_| |_____/ \__,_| \_/ \___|
                                                                       
                                                                       

*/
//Speichert den Artikel und alle zugehörigen Daten in der Datenbank
function saveArticle() {

    if (currentArticleId == undefined) {
        stubegru.modules.alerts.alert({
            title: "Fehler beim Speichern",
            text: "Der Artikel konnte nicht gespeichert werden - Keine Id",
            type: "error"
        });
    } else {
        var articleData = {
            articleId: currentArticleId,
            articleHeading: $('#newArticleHeading').val(),
            articleText: CKEDITOR.instances.wikiArticleEditor.getData(),
            articleTags: JSON.stringify(currentTags),
            showInSidebar: $("#wiki_show_in_sidebar").prop("checked") ? 1 : 0,
            markAsUnread: $("#wiki_mark_as_unread").prop("checked") ? 1 : 0,
            reminderDate: currentReminder.date,
            reminderText: currentReminder.text
        };


        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/wiki/edit_article/wiki_save_article.php`,
            data: articleData,
            success: function (json) {
                if (json.status == "success") {
                    unsavedChanges = false;
                    window.location = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${json.articleId}`;
                } else {
                    stubegru.modules.alerts.alert({
                        title: "Fehler beim Speichern",
                        text: json.message,
                        type: "error"
                    });
                }
            }
        });
    }

}


//Lädt alle Artikeldaten aus der Datenbank und zeigt sie an
function getArticleData(articleId) {
    currentTags = [];

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/show_article/wiki_get_article_info.php`,
        data: {
            articleId: articleId
        },
        success: function (json) {
            if (json.status == "success") {
                $('#newArticleHeading').val(json.heading);//Titel setzen
                //Inhalt setzen
                CKEDITOR.instances.wikiArticleEditor.setData(json.text);
                //Tags darstellen
                for (var key in json.tags) {
                    var currentTag = json.tags[key];
                    currentTags.push(Number(currentTag.tagId));
                    $("#wiki_tag_container").append("<div class='btn btn-primary btn-sm tagCloud assignedTag' data-tagId='" + currentTag.tagId + "' >" + currentTag.tagName + "   <i class='fa fa-close'></i></div>");
                }

                //tag bei mOuse Over rot machen
                $(".assignedTag").mouseenter(function () {
                    $(this).addClass("btn-danger");
                });
                $(".assignedTag").mouseleave(function () {
                    $(this).removeClass("btn-danger");
                });
                //tag löschen, wenn man draufklickt
                $(".assignedTag").click(function () {
                    deleteTag(this);
                });

                //Reminder Daten Laden
                if (json.reminderDate == "0000-00-00" || json.reminderDate == null) {
                    currentReminder = {};
                    $("#reminderButton").html("Erinnerung erstellen");
                } else {
                    currentReminder.date = json.reminderDate;
                    currentReminder.text = json.reminderText;
                    $("#reminderButton").html("Erinnerung für den " + formatDate(currentReminder.date, "DD.MM.YYYY") + " bearbeiten");
                }

                //Artikel in der Sidebar anzeigen checkmark setzen
                if (json.showInSidebar == true) {
                    $('#wiki_show_in_sidebar').bootstrapToggle('on')
                }

                //Current article Id setzen
                currentArticleId = articleId;
            } else {
                //Fehler bei der Db Abfrage
                stubegru.modules.alerts.alert({
                    text: "Der Artikel wurde nicht gefunden und kann leider nicht bearbeitet werden.",
                    title: "Fehler",
                    type: "error",
                    confirmButtonText: "Zurück",
                }, () => { window.history.back(); });
            }
        }
    });
}

//löscht den aktuellen Artikel aus der Datenbank und entfernt alle Verknüpfungen mit diesem Artikel
function deleteArticle() {
    deleteConfirm("Artikel löschen", "Soll dieser Artikel wirklich gelöscht werden? Sie können den Vorgang nicht rückgängig machen.", function () {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/wiki/edit_article/wiki_delete_article.php`,
            data: {
                id: currentArticleId
            },
            success: function (json) {
                stubegru.modules.alerts.alert({
                    text: json.text,
                    title: json.message,
                    type: json.status,
                });
                if (json.status == "success") {
                    window.location = `${stubegru.constants.BASE_URL}?view=wiki_start`;
                }
            }
        });
    });

}



/*

  ____                _           _           
 |  _ \ ___ _ __ ___ (_)_ __   __| | ___ _ __ 
 | |_) / _ \ '_ ` _ \| | '_ \ / _` |/ _ \ '__|
 |  _ <  __/ | | | | | | | | | (_| |  __/ |   
 |_| \_\___|_| |_| |_|_|_| |_|\__,_|\___|_|   
                                              

*/

//Fügt die neu eingetragenen Reminder Daten ein
function addReminder() {
    currentReminder = {
        text: $("#reminderText").val(),
        date: $("#reminderDate").val()
    }

    //Modal schließen
    $("#reminderModal").modal("hide");
    $("#reminderButton").html("Erinnerung für den " + formatDate(currentReminder.date, "DD.MM.YYYY") + " bearbeiten");
    unsavedChanges = true;
}

//Reset bei Abbrechen des Modals
function resetReminderForm() {
    $("#reminderText").val(currentReminder.text);
    $("#reminderDate").val(currentReminder.date);
}

//Löscht den Reminder
function deleteReminder() {
    currentReminder = {} //Leeres Objekt

    //Modal schließen
    $("#reminderModal").modal("hide");
    $("#reminderButton").html("Erinnerung erstellen");
    unsavedChanges = true;
}

//Zeigt das Reminder-Modal an und lädt die aktuellen Werte ins Modal
function showReminderModal() {
    if (currentReminder.date == undefined) {
        $("#reminderText").val("Diesen Artikel bitte nochmal überarbeiten.");
        $("#reminderDate").val("");
    } else {
        $("#reminderText").val(currentReminder.text);
        $("#reminderDate").val(currentReminder.date);
    }

    $("#reminderModal").modal("show");
}
