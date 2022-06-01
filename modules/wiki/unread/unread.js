function fillUnreadArticles() {

    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/unread/wiki_get_unread_articles.php`,

        success: function (data) {
            var json = JSON.parse(data);
            if (json.length > 0) {
                //Liste leeren
                $("#ungeleseneArtikelListe").html("");
                for (var i in json) {
                    let artikelLink = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${json[i].articleId}`;
                    let ausgabe = `
                    <li class="artikelItem">
                        <a href="${artikelLink}">
                            <artikelTitel>${json[i].heading}</artikelTitel>
                            <artikelPreview>${json[i].preview}</artikelPreview>
                        </a>
                    </li>`;
                    $("#ungeleseneArtikelListe").append(ausgabe);
                }

            } else { //Keine neuen Beiträge
                var ausgabe = '<li class = "artikelItem"><artikelTitel> Keine ungelesenen Beiträge  </artikelTitel>  </li>';
                $("#ungeleseneArtikelListe").html(ausgabe);
            }

        }
    });
}

fillUnreadArticles();