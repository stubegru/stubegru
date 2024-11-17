let allArticlesListSortableTable;
initAllArticlesList();

function initAllArticlesList() {
    let tableOptions = {
        data: [],
        columns: {
            id: "Id",
            heading: "Titel",
            lastChanged: "Letzte Änderung",
            visited: "Aufrufe",
        },
        rowsPerPage: 50,
        pagination: true,
        nextText: "<i class='fas fa-angle-right'>",
        prevText: "<i class='fas fa-angle-left'>",
        searchField: document.getElementById("allArticlesListFilter"),
        //tableDidUpdate: EventInstanceView.onUpdateListView
    };

    allArticlesListSortableTable = $('#allArticlesTable').tableSortable(tableOptions);

    document.querySelector("#allArticlesListFilterClear").addEventListener("click", () => {
        document.querySelector("#allArticlesListFilter").value = "";
        document.querySelector("#allArticlesListFilter").dispatchEvent(new Event("input"));
    })

    showAllArticlesList();

}



async function showAllArticlesList() {
    let tableDataList = [];

    let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/wiki/list_articles/wiki_get_articles_list.php`);
    let articleList = await resp.json();

    for (let article of articleList) {
        let articleLink = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${article.id}`;
        article.heading = `<a title="${article.heading}" href='${articleLink}'>${article.heading}</a>`;

        tableDataList.push(article);
    }

    //Add table data and refresh
    allArticlesListSortableTable.setData(tableDataList, null);

    //Keep sorting state consistent (the table plugin does not care about this...)
    let sort = allArticlesListSortableTable._sorting;
    sort.currentCol = sort.currentCol == '' ? "lastChanged" : sort.currentCol;
    sort.dir = sort.dir == '' ? "asc" : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
    allArticlesListSortableTable.sortData(sort.currentCol, sort.dir);

}



