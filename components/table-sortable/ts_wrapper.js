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
        tableDidUpdate: undefined,
    };
    constructor(selector, columns, searchInput, searchClearBtn, rowsPerPage = 10, onUpdate) {
        this.options.columns = columns;
        this.options.searchField = searchInput;
        this.options.rowsPerPage = rowsPerPage;
        this.options.tableDidUpdate = onUpdate || function () { };
        //@ts-expect-error 
        this.table = $(selector).tableSortable(this.options);
        searchClearBtn.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.dispatchEvent(new Event("input"));
        });
    }
    update(data, sortingColumn, sortingDirection = "asc") {
        //Add table data and refresh
        this.table.setData(data, null);
        //Keep sorting state consistent (the table plugin does not care about this...)
        this.restoreSortState(sortingColumn, sortingDirection);
    }
    /**
     * This triggers the table to update sort.
     * This will only sort the table by given column and direction, if it was not sorted before by user.
     * If table was perviously sorted by user call this function to restore last (user defined) sorting order
     * @param column id of the sorting column
     * @param direction "asc" or "desc" for sorting direction
     */
    restoreSortState(column, direction = "asc") {
        let sort = this.table._sorting;
        sort.currentCol = sort.currentCol == '' ? column : sort.currentCol;
        let swappedDirection = direction == "asc" ? "desc" : "asc";
        sort.dir = sort.dir == '' ? swappedDirection : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
        this.table.sortData(sort.currentCol, sort.dir);
    }
}
