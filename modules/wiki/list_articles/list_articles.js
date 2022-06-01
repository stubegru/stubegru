function showAllArticlesList() {

    $.ajax({
        type: "GET",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/list_articles/wiki_get_articles_list.php`,
        success: function (data) {
            for (let article of data) {
                let link = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${article.id}`;
                let html = `
                <li class='artikelItem'>
                    <a href='${link}'>
                        <div class='row'>
                            <div class='col-md-9'>
                                <artikelTitel>${article.heading}</artikelTitel>
                            </div>
                            <div class='col-md-3 text-right'>
                                <artikelTitel>${article.lastChanged}</artikelTitel>
                            </div>
                        </div>        
                    </a>
                </li>`
                $("#artikelListe").append(html);
            }
        }
    });

}

showAllArticlesList();


