stubegru.modules.menubar.addDivider("secondary", 100);
stubegru.modules.menubar.addItem("secondary", `<li><a title="Liste mit allen Wiki Artikeln aufrufen" href="${stubegru.constants.BASE_URL}?view=wiki_list_articles"><i class="fas fa-list"></i>&nbsp;Liste aller Artikel</a></li>`, 101);
stubegru.modules.menubar.addItem("secondary", `<li><a title="Alle Wiki Artikel als gelesen markieren" onclick="stubegru.modules.wiki.wikiUtils.markAllAsRead()"><i class="fas fa-eye"></i>&nbsp;Alle Artikel gelesen</a></li>`, 102);
stubegru.modules.menubar.addItem("primary", `<li class="permission-WIKI_WRITE permission-required"><a title="Einen neuen Wiki Artikel erstellen" href="${stubegru.constants.BASE_URL}?view=wiki_edit_article&mode=create"><i class="fas fa-pencil-alt"></i>&nbsp;Neuer Artikel</a></li>`, 52);

//init modules object
if (!stubegru.modules.wiki) { stubegru.modules.wiki = {}; }
stubegru.modules.wiki.wikiUtils = {};

/*


 __          ___ _    _                       _     
 \ \        / (_) |  (_)                     | |    
  \ \  /\  / / _| | _____      _____  _ __ __| |___ 
   \ \/  \/ / | | |/ / \ \ /\ / / _ \| '__/ _` / __|
    \  /\  /  | |   <| |\ V  V / (_) | | | (_| \__ \
     \/  \/   |_|_|\_\_| \_/\_/ \___/|_|  \__,_|___/
                                                    
                                                    


*/


//Adds hyperlinks to all wikiwords, returns the changed string
//Wikiword syntax: [wikiword|<articleID>|<title>]
//e.g. [wikiword|583|Übersicht Hunderassen] will generate <a href="path/to/wiki.php?artikel=583" class="wikiword wikiword-exists">Übersicht Hunderassen</a>"
stubegru.modules.wiki.wikiUtils.handleWikiWords = async function (text) {

    //const allHeadings = await (await fetch(`${stubegru.constants.BASE_URL}/modules/wiki/utils/wiki_get_all_article_headings.php`)).json();

    //The Regular Expression to find Strings between the Brackets
    var findWikiwordsRegEx = /\[wikiword((\w|ä|Ä|ü|Ü|ö|Ö|ß|\"|\'|\§|\/|\€|\?|\!|\-|\(|\)|\,|\.|:|\|)*(\ )*)+]/g;

    //Replace the Wikiwords with Links
    text = text.replace(findWikiwordsRegEx, function (wikiword) {
        wikiword = wikiword.substring(1, wikiword.length - 1); //remove square brackets
        let pieces = wikiword.split("|");
        if (pieces.length != 3) { console.log(`Wikiword with bad syntax: [${wikiword}]`); return `[${wikiword}]`; }
        let articleId = pieces[1];
        let title = pieces[2];

        if (articleId == "null") {
            return `<a class='wikiword wikiword-exists-not' href='${stubegru.constants.BASE_URL}?view=wiki_edit_article&mode=create&heading=${encodeURI(title)}'>${title}</a>`;
        } else {
            return `<a class='wikiword wikiword-exists' href='${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${articleId}'>${title}</a>`;
        }
        //console.log("WIKIWORD: "+wikiword);
    });

    return text;
}

/*

  _____                _   _____      _       _   _             
 |  __ \              | | |  __ \    | |     | | (_)            
 | |__) |___  __ _  __| | | |__) |___| | __ _| |_ _  ___  _ __  
 |  _  // _ \/ _` |/ _` | |  _  // _ \ |/ _` | __| |/ _ \| '_ \ 
 | | \ \  __/ (_| | (_| | | | \ \  __/ | (_| | |_| | (_) | | | |
 |_|  \_\___|\__,_|\__,_| |_|  \_\___|_|\__,_|\__|_|\___/|_| |_|
                                                                
                                                                

*/

/**Mit dieser Funktion, können die "Gelesen"-Verknüpfungen gesetzt werden
 *@param articleId Für welchen Artikel die Verknüpfung angepasst werden soll. Nutze constants.all um verknüpfung für alle Artikel anzupassen
 *@param mode constants.read um als gelesen zu markieren, constants.unread um als ungelesen zu markieren
 *@param userId Für welchen Nutzer die Verknüpfung angepasst werden soll. Nutze constants.all um verknüpfung für alle Nutzer anzupassen. Nutze constants.currentUser um verknüpfung für den angemeldeten Nutzer anzupassen
 */
 stubegru.modules.wiki.wikiUtils.setReadState = async function (articleId, mode, userId) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            async: true,
            url: `${stubegru.constants.BASE_URL}/modules/wiki/utils/wiki_mark_as_read.php`,
            data: {
                articleId: articleId,
                mode: mode,
                userId: userId
            },
            success: resolve
        });
    });
}

stubegru.modules.wiki.wikiUtils.markAllAsRead = async function () {
    await stubegru.modules.wiki.wikiUtils.setReadState(stubegru.constants.all, stubegru.constants.read, stubegru.constants.currentUser);
    stubegru.modules.alerts.alert({
        title: "Alles gelesen",
        text: "Alle Artikel wurden als gelesen markiert.",
        type: "success"
    });
}
