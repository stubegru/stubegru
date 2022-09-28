var currentArticleId;
var currentArticleName;
var currentArticleIsFavorite;

//Prüfen, ob eine ArtikelId als artikel Parameter übergeben wird
if (getParam("artikel")) {
    currentArticleId = getParam("artikel");
    loadArticleData();
    //Überprüfen, ob eine ArtikelId als id Parameter übergeben wird
}
//Überprüfen, ob ein Artikelname als Parameter übergeben wird
else if (getParam("name")) {
    getArticleByName(getParam("name"));
} else {
    $("#articleText").html("Dieser Artikel existiert nicht...");
    stubegru.modules.alerts.alert({
        title: "Artikel nicht gefunden",
        text: `Es wurde kein Name und keine ID übergeben. Der Artikel kann nicht aufgerufen werden.`,
        type: "error"
    });
}





/*

     _         _   _ _        _   _           _            
    / \   _ __| |_(_) | _____| | | | __ _  __| | ___ _ __  
   / _ \ | '__| __| | |/ / _ \ | | |/ _` |/ _` |/ _ \ '_ \ 
  / ___ \| |  | |_| |   <  __/ | | | (_| | (_| |  __/ | | |
 /_/   \_\_|   \__|_|_|\_\___|_| |_|\__,_|\__,_|\___|_| |_|
                                                           

*/


function loadArticleData() {
    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/show_article/wiki_get_article_info.php`,
        data: { articleId: currentArticleId },
        dataType: "json",
        success: async function (json) {
            if (json.status == "success") {

                //Titel
                currentArticleName = json.heading;
                $('#articleHeading').html(currentArticleName);
                //Seitentitel anpassen
                document.title = `${stubegru.constants["APPLICATION_NAME"]} | Wiki Artikel | ${json.heading}`;

                //Inhalt laden und Wikiwords verarbeiten
                var articleText = json.text;

                //Wikiword Links generieren
                articleText = await handleWikiWords(articleText);

                //Inhaltstext anzeigen
                $('#articleText').html(articleText);

                //Datum anzeigen
                var datum = new Date(json.date);
                datum = formatDate(datum, "DD.MM.YYYY hh:mm");
                $('#articleDate').html("Letzte Änderung: <b>" + datum + "</b>");

                //Edit Button richtig verlinken
                $("#articleEditButton").attr("href", `${stubegru.constants.BASE_URL}?view=wiki_edit_article&mode=edit&article=${currentArticleId}`);

                //Favorit-Button färben
                if (json.favorite == "true") {
                    currentArticleIsFavorite = true;
                    $("#favoriteButton").removeClass("btn-default");
                    $("#favoriteButton").addClass("btn-warning");
                } else if (json.favorite == "false") {
                    currentArticleIsFavorite = false;
                    $("#favoriteButton").addClass("btn-default");
                    $("#favoriteButton").removeClass("btn-warning");
                }

                //Tags darstellen
                var ausgabe = "";
                for (var key in json.tags) {
                    ausgabe += `<a type='button' class='btn btn-default btn-sm tagCloud' href='${stubegru.constants.BASE_URL}?view=wiki_show_tag&tagId=${json.tags[key].tagId}'>${json.tags[key].tagName}</a>`;
                }
                //Ausgabe anzeigen
                $("#articleTags").html(ausgabe);

                //Artikel als gelesen markieren
                setReadState(currentArticleId, stubegru.constants.read, stubegru.constants.currentUser);

            } else { //Fehler bei der Db Abfrage
                $("#articleText").html("Dieser Artikel existiert nicht...");
                stubegru.modules.alerts.alert({
                    title: "Artikel existiert nicht",
                    text: `Dieser Wiki Artikel (ID ${currentArticleId}) konnte nicht gefunden werden.`,
                    type: "error"
                });
            }
        }
    });
}





function getArticleByName(articleName) {

    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/show_article/wiki_get_article_id_by_name.php`,
        data: { articleName: articleName },
        dataType: "json",
        success: function (json) {
            //Prüfen, ob Artikel mit übergebenem Namen existiert
            if (json.articleFound === true) {
                //Wenn ja, diesen Artikel laden
                currentArticleId = json.articleId;
                loadArticleData();
            } else {


                //Wenn nein, einen neuen Artikel mit dem Namen als Überschrift erstellen
                stubegru.modules.alerts.alert({
                    title: "Artikel existiert nicht!",
                    text: "Der Artikel scheint noch nicht zu existieren. Möchtest du den Artikel jetzt erstellen?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Artikel erstellen",
                    cancelButtonText: "Abbrechen",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            window.location = `${stubegru.constants.BASE_URL}?view=wiki_edit_article&mode=create&heading=${articleName}`;
                        } else {
                            window.history.back();
                        }
                    });


            }
        }
    });
}



/*
  ______                    _ _            
 |  ____|                  (_) |           
 | |__ __ ___   _____  _ __ _| |_ ___  ___ 
 |  __/ _` \ \ / / _ \| '__| | __/ _ \/ __|
 | | | (_| |\ V / (_) | |  | | ||  __/\__ \
 |_|  \__,_| \_/ \___/|_|  |_|\__\___||___/
                                           
                                           

*/

function toggleFavorite() {
    let action = currentArticleIsFavorite ? "remove" : "add";

    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/favorites/wiki_set_favorite.php`,
        data: {
            action: action,
            articleId: currentArticleId
        },
        dataType: "json",
        success: function (data) {
            if (data.action == "added") {
                $("#favoriteButton").removeClass("btn-default");
                $("#favoriteButton").addClass("btn-warning");
                currentArticleIsFavorite = true;
            } else if (data.action = "removed") {
                currentArticleIsFavorite = false;
                $("#favoriteButton").removeClass("btn-warning");
                $("#favoriteButton").addClass("btn-default");
            }
        }
    });
}


/*

  ____                       _   
 |  _ \ ___ _ __   ___  _ __| |_ 
 | |_) / _ \ '_ \ / _ \| '__| __|
 |  _ <  __/ |_) | (_) | |  | |_ 
 |_| \_\___| .__/ \___/|_|   \__|
           |_|                   

*/

function showReportModal() {
    $("#report_article_name").html(currentArticleName);
    $("#report_article_id").val(currentArticleId);
    $("#reportModal").modal("show");
}

function sendReportForm() {
    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/show_article/wiki_send_report.php`,
        data: {
            reportArticleId: $("#report_article_id").val(),
            reportNotes: $("#report_notes").val(),
            reportReason: $("#report_reason").val()
        },
        success: function (data) {
            stubegru.modules.alerts.alert({
                title: "Feedback wurde gesendet",
                text: "Danke für deine Hilfe!",
                type: "success"
            });
            resetReportForm();
            $("#reportModal").modal("hide");
        }
    });

}

function resetReportForm() {
    $("#report_article_name").val("");
    $("#report_article_id").val("");
    $("#report_notes").val("");
}
