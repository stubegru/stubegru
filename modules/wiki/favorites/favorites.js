function fillFavoriteArticles() {


    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/favorites/wiki_get_favorite_articles.php`,

        success: function (data) {
            var json = JSON.parse(data);
            if (json.length > 0) {
                //Liste leeren
                $("#favoritenArtikelListe").html("");
                for (var i in json) {
                    let artikelLink = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${json[i].articleId}`;
                    let ausgabe = `
                    <li class="artikelItem">
                        <a href="${artikelLink}">
                            <artikelTitel>${json[i].heading}</artikelTitel>
                            <artikelPreview>${json[i].preview}</artikelPreview>
                        </a>
                    </li>`;
                    $("#favoritenArtikelListe").append(ausgabe);
                }

            } else { //Keine neuen Beiträge
                var ausgabe = '<li class = "artikelItem"><artikelTitel> Keine Favoriten gesetzt.  </artikelTitel>  </li>';
                $("#favoritenArtikelListe").html(ausgabe);
            }

        }
    });
}

fillFavoriteArticles();