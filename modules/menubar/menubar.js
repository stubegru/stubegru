stubegru.modules.menubar = {}


stubegru.modules.menubar.entries = {};
stubegru.modules.menubar.entries.primary = [];
stubegru.modules.menubar.entries.secondary = [];
stubegru.modules.menubar.postRenderHooks = [];

const menuSecondaryContainerHtml = `
<li class="dropdown">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="fas fa-lg fa-bars"></i></a>
    <ul class="dropdown-menu" id="menubarSecondaryItemContainer"></ul>
</li>`;

/**
 * Adds a callback that is called every time the menubar is re-rendered
 * Use to add dynamic content to menu items
 * @param {string} name name of the hook
 * @param {function} callback function to be executed
 * @param {number} priority Order in which the hooks are executed, smaller value means higher priority, default: 0
 */
stubegru.modules.menubar.registerPostRenderHook = function (name, callback, priority) {
    priority = priority || 0;
    //add new hook
    stubegru.modules.menubar.postRenderHooks.push({
        name: name,
        callback: callback,
        priority: priority,
    })
    //sort list by priority
    stubegru.modules.menubar.postRenderHooks.sort((a, b) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0));
}

stubegru.modules.menubar.executePostRenderHooks = function () {
    for (const hook of stubegru.modules.menubar.postRenderHooks) {
        //console.log(`Executing post render hook: ${hook.name}`);
        hook.callback();
    }
}


stubegru.modules.menubar.render = function () {
    let orderedPrimary = stubegru.modules.menubar.entries.primary.sort((a, b) => a.index - b.index)
    let primaryString = "";
    orderedPrimary.forEach((entry) => primaryString += `<!--Primary menu entry with index ${entry.index}-->\n${entry.html}`)
    $(`#menubarPrimaryItemContainer`).html(primaryString + menuSecondaryContainerHtml);

    let orderedSecondary = stubegru.modules.menubar.entries.secondary.sort((a, b) => a.index - b.index)
    let secondarystring = "";
    orderedSecondary.forEach((entry) => secondarystring += `<!--Secondary menu entry with index ${entry.index}-->\n${entry.html}`)
    $(`#menubarSecondaryItemContainer`).html(secondarystring);

    stubegru.modules.menubar.executePostRenderHooks();
}

/**
 * Add an item to the menubar shown ontop of all pages
 * @param {string} level "primary" or "secondary"
 * @param {string} html html content of this menu item. e.g. <li><a href="#">Link</a></li>
 * @param {number} index position index in the menu. Lower indexes are at the top/left
 */
stubegru.modules.menubar.addItem = function (level, html, index) {
    try {
        let entry = {
            html: html,
            index: index || 0
        }
        stubegru.modules.menubar.entries[level].push(entry);
        stubegru.modules.menubar.render();
    }
    catch (e) {
        throw new Error(`[Menubar] Can't add item with level ${level}. Use "primary" or "secondary" as level.`)
    }
}

/**
 * Add a divider to menubar
 * @param {string} level "primary" or "secondary"
 * @param {number} index position index in the menu. Lower indexes are at the top/left
 */
stubegru.modules.menubar.addDivider = function (level, index) {
    stubegru.modules.menubar.addItem(level, "<li class='divider'></li>", index);
}

//Set logo
let logoPath = stubegru.constants["BASE_URL"] + (stubegru.constants.CUSTOM_CONFIG.favicon || "/assets/images/favicon.png");
$("#menubarLogoLink").attr("href", stubegru.constants["BASE_URL"]);
$("#menubarLogoImg").attr("src", logoPath);
$("#menubarLogoImg").attr("title", stubegru.constants.CUSTOM_CONFIG.applicationName);

//Add default Menu Entries
stubegru.modules.menubar.addDivider("secondary", 999);
stubegru.modules.menubar.addItem("secondary", `<li><a onclick='doUserLogout()'><i class="fas fa-sign-out-alt"></i>&nbsp;Logout</a></li>`, 1000);
stubegru.modules.menubar.addItem("primary", `<li><a title="Dashboard aufrufen" href="${stubegru.constants.BASE_URL}?view=dashboard"><i class="fas fa-tasks"></i>&nbsp;Dashboard</a></li>`, 50);


function doUserLogout() {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/login/logout.php`,
        success: function (data) {
            if (data.status == "success") { window.location.href = `${stubegru.constants.BASE_URL}/?view=login&logout=true` }
        }
    });
}



/*
  _      _              _____                     _     
 | |    (_)            / ____|                   | |    
 | |     ___   _____  | (___   ___  __ _ _ __ ___| |__  
 | |    | \ \ / / _ \  \___ \ / _ \/ _` | '__/ __| '_ \ 
 | |____| |\ V /  __/  ____) |  __/ (_| | | | (__| | | |
 |______|_| \_/ \___| |_____/ \___|\__,_|_|  \___|_| |_|
                                                        
                                                        

*/


var activeObject = {
    "index": 0,
    "activeObjectList": []
};

//Move through search results with up and down key
$("#navbarSearchInput").keydown(function (event) {
    if (event.key == "ArrowDown") {
        visualActiveObject(activeObject.index + 1);
    } else if (event.key == "ArrowUp") {
        visualActiveObject(activeObject.index - 1);
    }
});



$("#navbarSearchInput").keyup(function (keyevent) {
    if (!(keyevent.key == "ArrowUp" || keyevent.key == "ArrowDown" || keyevent.key == "ArrowLeft" || keyevent.key == "ArrowRight" || keyevent.key == "Enter")) {
        tryWikiSearch();
    }
    if (keyevent.key == "Enter") {
        let link = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${activeObject.activeObjectList[activeObject.index].articleId}`;
        window.location.href = link;
    }
});

function visualActiveObject(index) {
    if (index >= 0 && index < activeObject.activeObjectList.length) {
        $("li[data-index=" + activeObject.index + "]").removeClass("activeObjectColor");
        activeObject.index = index;
        $("li[data-index=" + index + "]").addClass("activeObjectColor");
    }

}

var wikiSearchTimer;

$("#navbarSearchInput").click(function (e) {
    e.stopPropagation();
    $("#navbarSearchInput").css("width", "50%");
    $("#wikiSearchResult").css("width", "50%");
    $("#navbarSearchInput").css("border-radius", "20px");
    $("#navbarSearchInput").attr("data-activated", "true");

});

$(document).click(function () {
    if ($("#navbarSearchInput").attr("data-activated") == "true") {
        $("#wikiSearchResult").slideUp(400, function () {
            $("#navbarSearchInput").css("width", "30%");
            $("#wikiSearchResult").css("width", "30%");
            $("#navbarSearchInput").css("border-radius", "3px");
            $("#navbarSearchInput").attr("data-activated", "false");
            $("#wikiSearchResult").html("");
            $("#navbarSearchInput").val("");
        });
    }
});


function tryWikiSearch() {
    if ($("#navbarSearchInput").val() == "") {
        $("#wikiSearchResult").html("");
        $("#wikiSearchResult").slideUp();
    } else {
        clearTimeout(wikiSearchTimer);
        wikiSearchTimer = setTimeout(wikiSearch, 50); //to prevent server overflow the live search request is fired after 50 ms
    }
}

function wikiSearch() {

    var aktuelleEingabe = $("#navbarSearchInput").val();
    $.ajax({
        type: "POST",
        async: true,
        url: `${stubegru.constants.BASE_URL}/modules/wiki/utils/wiki_search.php`,
        data: {
            searchQuery: aktuelleEingabe
        },
        success: function (data) {
            var json = JSON.parse(data);
            var tagAusgabe = "<div id='searchResultTags'>";
            var tagArray = json.tags;
            var headlineArray = json.headings;
            var textArray = json.text;
            activeObject.activeObjectList = headlineArray.concat(textArray);
            var headlineAusgabe = "<ul class='artikelListe'>";

            //Gemeinsame Zählvariable für headlineArray und textArray
            iterator = 0;


            if (headlineArray.length > 0) {
                headlineAusgabe += "<li class='searchDivider'>Treffer im Titel</li>";
                for (iterator; iterator < headlineArray.length; iterator++) {
                    headlineAusgabe += `<a href='${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=` + headlineArray[iterator].articleId + "'><li class='artikelItem' data-index='" +
                        iterator + "'><artikelTitel>" + headlineArray[iterator].articleHeading + "</artikelTitel></li></a>";
                }
            }



            if (textArray.length > 0) {
                headlineAusgabe += "<li class='searchDivider'>Treffer im Volltext</li>";
                for (var i = iterator; i < textArray.length + iterator; i++) {
                    headlineAusgabe += `<a href='${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=` + textArray[i - iterator].articleId + "'><li class='artikelItem' data-index='" +
                        (i) + "'><artikelTitel>" + textArray[i - iterator].articleHeading + "</artikelTitel></li></a>";
                }
            }
            headlineAusgabe += "</ul>";


            if (tagArray.length > 0) {
                tagAusgabe += "<div class='searchDivider'>Treffer in Tags</div>";
                for (var i = 0; i < tagArray.length; i++) {
                    tagAusgabe += `<a class = "btn btn-default tagCloud" href="${stubegru.constants.BASE_URL}?view=wiki_show_tag&tagId=${tagArray[i].tagId}">${tagArray[i].tagName}</a>`;
                }
            }
            tagAusgabe += "</div>";





            $("#wikiSearchResult").html("");
            $("#wikiSearchResult").append(headlineAusgabe);
            $("#wikiSearchResult").append(tagAusgabe);
            visualActiveObject(0);
            $("#wikiSearchResult").slideDown();

        }
    });
}
