//Objekt um Auto suggestion Vorschläge zu speichern
var autoSuggestObject = {};
let currentEditor;
let requestTimeout;

CKEDITOR.plugins.add('wikiword', {
    icons: 'wikiword',
    init: function (editor) {
        currentEditor = editor;
        addWWASModalToPage();

        editor.addCommand('addWikiword', {
            exec: addWikiword
        });

        editor.ui.addButton('Wikiword', {
            label: 'Wikiword einfügen',
            command: 'addWikiword',
            toolbar: 'insert'
        });

    }
});

function addWWASModalToPage() {

    let WWASModal = '<div id="WWASModal" class="modal fade" role="dialog" style="z-index:2000;">' +
        '<div class="modal-dialog">' +

        ' <!-- Modal content-->' +
        '<div class="modal-content">' +
        '    <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal">&times;</button>' +
        '<h4 class="modal-title">Wikiword einfügen</h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '    <p><input class="form-control" type="text" placeholder="Tippen für Vorschläge" id="WWASInput" autocomplete="off"></p>' +
        '    <p><div id="wikiWordAutoSuggestWindow" ><ul class="autoSuggestList" id="wikiWordAutoSuggestList"></ul></div></p>' +
        '</div>' +
        '</div>' +

        '</div>' +
        '</div>';
    $("body").prepend(WWASModal);

    $("#WWASInput").on("keyup",WWASInputKeyPress);
    $("#WWASModal").on("shown.bs.modal", () => {
        $("#WWASInput").focus();
    });
    $("#WWASModal").on("hidden.bs.modal", () => {
        $("#WWASInput").val("");
        $("#wikiWordAutoSuggestList").html("");
    });

}

function addWikiword() {
    $("#WWASModal").modal("show");
}



/*

 __        ___ _    _                       _               _                                          _   _             
 \ \      / (_) | _(_)_      _____  _ __ __| |   __ _ _   _| |_ ___    ___ _   _  __ _  __ _  ___  ___| |_(_) ___  _ __  
  \ \ /\ / /| | |/ / \ \ /\ / / _ \| '__/ _` |  / _` | | | | __/ _ \  / __| | | |/ _` |/ _` |/ _ \/ __| __| |/ _ \| '_ \ 
   \ V  V / | |   <| |\ V  V / (_) | | | (_| | | (_| | |_| | || (_) | \__ \ |_| | (_| | (_| |  __/\__ \ |_| | (_) | | | |
    \_/\_/  |_|_|\_\_| \_/\_/ \___/|_|  \__,_|  \__,_|\__,_|\__\___/  |___/\__,_|\__, |\__, |\___||___/\__|_|\___/|_| |_|
                                                                                 |___/ |___/                             

*/

function WWASInputKeyPress(event) {



    //Navigate through wWASW
    if (event.key == "ArrowDown") {

        if (autoSuggestObject.index + 1 < autoSuggestObject.headlineArray.length) { //If there is a next element
            autoSuggestObject.index++;
            markAutoSuggestListIndexElement();
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    } else if (event.key == "ArrowUp") {

        if (autoSuggestObject.index > 0) { //If there is a previous element
            autoSuggestObject.index--;
            markAutoSuggestListIndexElement();
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    } else if (event.key == "Enter") {

        let articleTitle = autoSuggestObject.headlineArray[autoSuggestObject.index].articleHeading;
        let articleId = autoSuggestObject.headlineArray[autoSuggestObject.index].articleId;
        currentEditor.insertText(`[wikiword|${articleId}|${articleTitle}]`);
        $("#WWASModal").modal("hide");

        event.preventDefault();
        event.stopImmediatePropagation();
    }

    //Search for matching article names
    else {
        var searchQuery = $("#WWASInput").val();
        triggerSearchForMatchingWikiWords(searchQuery);
    }

}

//Shedule server request, but cancel it if a new request is triggered in the next 500ms
function triggerSearchForMatchingWikiWords(searchQuery) {
    clearTimeout(requestTimeout);
    requestTimeout = setTimeout(() => { searchForMatchingWikiWords(searchQuery) }, 500);
}



function searchForMatchingWikiWords(searchQuery) {
    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/utils/wiki_search.php`,
        data: {
            searchQuery: searchQuery
        },
        success: function (data) {
            var json = JSON.parse(data);
            autoSuggestObject.headlineArray = json.headings;
            autoSuggestObject.index = 0;
            $("#wikiWordAutoSuggestList").html("");

            //Write matching suggestions in list
            let perfectMatch = false;
            const numberOfItems = Math.min(10, autoSuggestObject.headlineArray.length);//show max 10 suggestions 
            for (let i = 0; i < numberOfItems; i++) {
                const currentHeadline = autoSuggestObject.headlineArray[i].articleHeading;
                $("#wikiWordAutoSuggestList").append($(`<li class='wwasli' id='wwasli${i}'>${currentHeadline}</li>`));
                if (searchQuery.toLowerCase() == currentHeadline.toLowerCase()) { perfectMatch = true; }
            }

            //Add current searchquery as proposal for new wikiword
            if (!perfectMatch) {
                $("#wikiWordAutoSuggestList").append($(`<li class='wwasli wwasli-create-new' id='wwasli${numberOfItems}'>${searchQuery} <div style="text-align:right;">neu erstellen</div></li>`));
                autoSuggestObject.headlineArray.push({ articleHeading: searchQuery, articleId: "null" });
            }


            //show text if there is no matching
            if (autoSuggestObject.headlineArray.length == 0) {
                if (searchQuery == "") {
                    $("#wikiWordAutoSuggestList").append($("<li class='wwasli-info' > Tippen um Vorschläge zu erhalten</li>"));
                } else {
                    $("#wikiWordAutoSuggestList").append($("<li class='wwasli-info' > Keine passenden Wikiwords gefunden</li>"));
                }

                $("#wikiWordAutoSuggestList").append($("<li class='wwasli-info-close' > Esc zum Schließen</li>"));
            } else {
                $("#wikiWordAutoSuggestList").append($("<li class='wwasli-info-close' > Enter zum Bestätigen</li>"));
            }

            //Mark currently indexed Element
            markAutoSuggestListIndexElement();
        }
    });
}

function markAutoSuggestListIndexElement() {
    //Remove the active class from every list Item | wwasli = wikiWordAutoSuggestListItem
    $(".wwasli").removeClass("wwasliActive");
    $("#wwasli" + autoSuggestObject.index).addClass("wwasliActive");
}
