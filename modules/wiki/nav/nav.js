function showSidebarNav() {

    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/nav/wiki_get_sidebar_nav.php`,
        success: async function (data) {
            var json = JSON.parse(data);
            for (var i in json) {
                let text = await stubegru.modules.wiki.wikiUtils.handleWikiWords(json[i])
                $("#sideBarNav").append(text);
            }
        }
    });
}

showSidebarNav();