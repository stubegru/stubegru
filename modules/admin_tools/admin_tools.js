class AdminTools {

    mailLogTable;
    cronjobMailTable;

    static init() {
        AdminTools.initMailLogTable();
        AdminTools.renderMailLogTable();
        AdminTools.initCronjobMailTable();
        AdminTools.renderCronjobMailTable();
    }

    static async fetchCronjobMails() {
        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/mailing/get_cronjob_mails.php`);
        let mailList = await resp.json();
        return mailList;
    }

    static deleteCronjobMail(mailId) {
        deleteConfirm("Vorgemerkte Mail löschen", "Soll diese Mail wirklich gelöscht und somit nicht versendet werden?", async function () {
            let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/mailing/delete_cronjob_mail.php?mailId=${mailId}`);
            let parsedResp = await resp.json();
            setTimeout(() => stubegru.modules.alerts.alert(parsedResp), 100);
            AdminTools.renderCronjobMailTable();
        });
    }

    static registerCronjobMailDeleteButtons() {
        document.querySelectorAll(".cronjob-mail-delete-button").forEach((elem) => {
            let mailId = elem.getAttribute("data-mail-id");
            elem.addEventListener("click", () => AdminTools.deleteCronjobMail(mailId));
        })
    }

    static async renderCronjobMailTable() {
        let tableDataList = [];

        let mailList = await this.fetchCronjobMails();
        if (mailList.length < 1) { return; }

        for (const mail of mailList) {

            let actionButtons = `<button class="btn btn-danger cronjob-mail-delete-button pull-right" type="button" data-mail-id="${mail.id}" title="Diese Mail löschen und nicht versenden"><i class="fas fa-trash-alt"></i> Löschen</button>`;

            tableDataList.push({
                "date": mail.date,
                "recipient": mail.recipient,
                "subject": mail.subject,
                "attachmentName": mail.attachmentName,
                "type": mail.type,
                "action": actionButtons
            });
        }

        //Add table data and refresh
        AdminTools.cronjobMailTable.setData(tableDataList, null);

        //Keep sorting state consistent (the table plugin does not care about this...)
        let sort = AdminTools.cronjobMailTable._sorting;
        sort.currentCol = sort.currentCol == '' ? "date" : sort.currentCol;
        sort.dir = sort.dir == '' ? "asc" : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
        AdminTools.cronjobMailTable.sortData(sort.currentCol, sort.dir);
    }

    static initCronjobMailTable() {
        let tableOptions = {
            data: [],
            columns: {
                "date": "Geplantes Datum",
                "recipient": "Empfänger",
                "subject": "Betreff",
                "attachmentName": "Anhang",
                "type": "Typ",
                "action": ""
            },
            rowsPerPage: 10,
            pagination: true,
            nextText: "<i class='fas fa-angle-right'>",
            prevText: "<i class='fas fa-angle-left'>",
            searchField: document.getElementById("cronjobMailFilter"),
            tableDidUpdate: AdminTools.registerCronjobMailDeleteButtons
        };

        //@ts-expect-error
        AdminTools.cronjobMailTable = $('#cronjobMailTable').tableSortable(tableOptions);

        //Register clear filter button
        document.querySelector("#cronjobMailClearFilter").addEventListener("click", () => {
            document.querySelector("#cronjobMailFilter").value = "";
            document.querySelector("#cronjobMailFilter").dispatchEvent(new Event("input"));
        })
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
        if (logList.length < 1) { return; }
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
