//Löscht einen Tag und alle Verknüpfungen mit den zugehörigen Artikeln
function deleteTag() {
    deleteConfirm("Tag löschen", "Soll dieser Tag wirklich gelöscht werden? Sie können den Vorgang nicht rückgängig machen.", function () {
        var tagId = getParam("tagId");
        if (tagId !== false) {
            $.ajax({
                type: "POST",
                url: `${stubegru.constants.BASE_URL}/modules/wiki/tag_view/wiki_delete_tag.php`,
                data: { tagId: tagId },
                success: function (data) {
                    window.location = `${stubegru.constants.BASE_URL}?view=wiki_start`;
                }
            });
        } else {
            stubegru.modules.alerts.alert({
                title: "Der Tag konnte nicht gelöscht werden",
                text: "Es wurde keine TagId übergeben. Bitte wenden Sie sich an den Administrator",
                type: "error"
            });
        }
    });
}

function showArticleListByTag() {

    let tagId = getParam("tagId");

    if (!tagId) {
        stubegru.modules.alerts.alert({
            title: "Fehler",
            text: "Es wurde keine Tag Id übergeben. Tag Details können nicht angezeigt werden.",
            type: "error"
        });
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/tag_view/wiki_get_tag_info.php`,
        data: { tagId: tagId },
        success: function (data) {
            $("#tagViewHeadingTagName").html(data.tagName); //set tagname in heading
            document.title = `${stubegru.constants.CUSTOM_CONFIG.applicationName} | Tag | ${data.tagName}`;

            $("#artikelListe").html("");

            for (let article of data.articles) {
                let link = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${article.id}`;
                let html = `
                <li class='artikelItem'>
                    <a href='${link}'>
                        <artikelTitel>${article.title}</artikelTitel>
                        <artikelPreview>${article.preview}</artikelPreview>
                    </a>
                </li>`;
                $("#artikelListe").append(html);
            }
        }
    });



}

showArticleListByTag();