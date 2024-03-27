class AdminTools {

    mailLogTable;

    static init() {
        AdminTools.initMailLogTable();
    }

    static async fetchMailLog() {
        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/mailing/get_mail_log.php`);
        let logList = await resp.json();
        return logList;
    }

    static async renderMailLogTable() {
        let tableDataList = [];
        let userList = await stubegru.modules.userUtils.getAllUsers();

        let logList = await this.fetchMailLog();
        for (const mail of logList) {
            let status = `<span class="label label-${mail.status == "OK" ? "success" : "danger"}">${mail.status}</span>`;
            let userName = (mail.initiator > 0) ? userList[mail.initiator].name : "Stubegru System";

            tableDataList.push({
                "timestamp": mail.timestamp,
                "recipient": mail.recipient,
                "subject": mail.subject,
                "attachmentName": mail.attachmentName,
                "status": status,
                "initiator": userName,
                "mailMethod": `<span class="label label-info">${mail.mailMethod}</span>` 
            });
        }

        //Add table data and refresh
        AdminTools.mailLogTable.setData(tableDataList, null);

        //Keep sorting state consistent (the table plugin does not care about this...)
        let sort = AdminTools.mailLogTable._sorting;
        sort.currentCol = sort.currentCol == '' ? "timestamp" : sort.currentCol;
        sort.dir = sort.dir == '' ? "asc" : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
        AdminTools.mailLogTable.sortData(sort.currentCol, sort.dir);
    }

    static initMailLogTable() {
        let tableOptions = {
            data: [],
            columns: {
                "timestamp": "Datum",
                "recipient": "Empfänger",
                "subject": "Betreff",
                "attachmentName": "Anhang",
                "status": "Status",
                "initiator": "Absender",
                "mailMethod": "Protokoll"
            },
            rowsPerPage: 10,
            pagination: true,
            nextText: "<i class='fas fa-angle-right'>",
            prevText: "<i class='fas fa-angle-left'>",
            searchField: document.getElementById("mailLogFilter"),
        };

        //@ts-expect-error
        AdminTools.mailLogTable = $('#mailLogTable').tableSortable(tableOptions);

        //Register clear filter button
        document.querySelector("#mailLogClearFilter").addEventListener("click", () => {
            document.querySelector("#mailLogFilter").value = "";
            document.querySelector("#mailLogFilter").dispatchEvent(new Event("input"));
        })
    }

}

AdminTools.init();
AdminTools.renderMailLogTable();
