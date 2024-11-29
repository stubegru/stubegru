import Stubegru from "../stubegru_core/logic/stubegru.js";
export class TableSortable {
    table;
    options = {
        data: [],
        columns: {},
        rowsPerPage: undefined,
        pagination: true,
        nextText: "<i class='fas fa-angle-right'>",
        prevText: "<i class='fas fa-angle-left'>",
        searchField: undefined,
    };
    constructor(selector, columns, searchInput, searchClearBtn, rowsPerPage = 10) {
        this.options.columns = columns;
        this.options.searchField = searchInput;
        this.options.rowsPerPage = rowsPerPage;
        //@ts-expect-error 
        this.table = Stubegru.dom.querySelector(selector).tableSortable(tableOptions);
        searchClearBtn.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.dispatchEvent(new Event("input"));
        });
    }
    update(data, sortingColumn, sortingDirection = "asc") {
        //Add table data and refresh
        this.table.setData(data, null);
        //Keep sorting state consistent (the table plugin does not care about this...)
        this.setSortState(sortingColumn, sortingDirection);
    }
    setSortState(column, direction = "asc") {
        //TEST: Test if sorting direction is correct
        let sort = this.table._sorting;
        sort.currentCol = sort.currentCol == '' ? column : sort.currentCol;
        sort.dir = sort.dir == '' ? direction : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
        this.table.sortData(sort.currentCol, sort.dir);
    }
}
