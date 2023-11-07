/*
* Sortable tables for bootstrap 3.
* requires glyphicons and JQuery
* Taken from: https://github.com/davidjaenson/bootstrap-3-table-sortable
*/

(function($) {

    const TABLE_SORTER_ICON_CLASS = "fa";
    const TABLE_SORTER_SORT_ICON = "fa-sort";
    const TABLE_SORTER_SORT_ICON_DESC = "fa-sort-amount-up";
    const TABLE_SORTER_SORT_ICON_ASC = "fa-sort-amount-down-alt";
    const TABLE_SORTER_HIGHLIGHT = "text-info";

    var sortFunctions = {
        string: function(a, b) {
            if(a < b) {
                return -1;
            } else if(a === b) {
                return 0;
            } else {
                return 1;
            }
        },
        date: function(a, b) {
            return Date.parse(a) - Date.parse(b);
        },
        number: function(a, b) {
            return parseFloat(a) - parseFloat(b);
        }
    };

    var tableSort = function(table, index, order, sortFunction) {
        sortFunction = sortFunction || sortFunctions.string;
        var elements = [];
        var tbody = table.find('tbody') || table;
        var tr;
        if(table.children("thead").length > 0) {
            tr = $(table).find('tbody > tr');
        } else {
            // we need to handle the case when people use badly formatted html
            tr = $(table).find('tr:not(:first)');
        }

        tr.each(function() {
            elements.push(this);
        });

        tr.remove();
        
        elements.sort(function(a, b) {
            a = $(a).children('td:eq(' + index + ')');
            b = $(b).children('td:eq(' + index + ')');
            var r = sortFunction(a.text().toLowerCase(), b.text().toLowerCase());
            if(order === 'asc') {
                return r;
            } else {
                return -1*r;
            }
        });
        for(var i = 0; i < elements.length; ++i) {
            $(tbody).append(elements[i]);
        }
    };

    $.fn.tableSortable = function() {
        return this.each(function() {
            var table = $(this);
            var th = table.find('th');
            if(th.length === 0) {
                th = $(this).find('tr:eq(0)').children();
            }

            th.not('*[data-table-sortable-disable]').on('click', function() {
                var order = $(this).attr('data-table-sortable-order');
                var newOrder = order && order === 'asc' ? 'desc' : 'asc';
                th.find('.table-sortable-icon')
                    .removeClass(TABLE_SORTER_SORT_ICON_ASC)
                    .removeClass(TABLE_SORTER_SORT_ICON_DESC)
                    .removeClass(TABLE_SORTER_HIGHLIGHT)
                    .addClass(TABLE_SORTER_SORT_ICON)
                    .attr("title","Nach dieser Spalte sortieren");

                $(this).children("."+TABLE_SORTER_ICON_CLASS).removeClass(TABLE_SORTER_SORT_ICON);
                if(newOrder === 'asc') {
                    $(this).children("."+TABLE_SORTER_ICON_CLASS).addClass(TABLE_SORTER_SORT_ICON_ASC).addClass(TABLE_SORTER_HIGHLIGHT).attr("title","Aufsteigend sortiert (klicken für absteigende Sortierung)");
                } else {
                    $(this).children("."+TABLE_SORTER_ICON_CLASS).addClass(TABLE_SORTER_SORT_ICON_DESC).addClass(TABLE_SORTER_HIGHLIGHT).attr("title","Absteigend sortiert (klicken für aufsteigende Sortierung)");
                }

                var sortType = $(this).attr('data-table-sortable-type');

                tableSort($(this).parent().parent().parent(), $(this).index(), newOrder, sortFunctions[sortType]);

                $(this).attr('data-table-sortable-order', newOrder);
            }).append(`&nbsp;<span class="${TABLE_SORTER_ICON_CLASS} ${TABLE_SORTER_SORT_ICON} table-sortable-icon" style="cursor:pointer" title="Nach dieser Spalte sortieren"></span>`);

        });
    };

})($);
