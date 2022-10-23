//Global Variables
stubegru.modules.notifications = {};

//register menu entry for notifications
stubegru.modules.menubar.addItem("secondary", `<li><a title="Einstellen über welche Ereignisse du informiert wirst." onclick="showNotificationModal()"><i class="fa fa-envelope"></i>&nbsp;Benachrichtigungen konfigurieren</a></li>`, -990);

stubegru.modules.menubar.addItem("primary", `<li class="dropdown" id="notificationDropdown">
<a class="dropdown-toggle" href="#" aria-expanded="false" data-toggle="dropdown" id="notificationDropdownNavbarButton" title="Benachrichtigungen">
    <i class="fa fa-bell fa-fw"></i><span class="badge" id="notificationCountBadge"></span>
</a>
<ul class="dropdown-menu dropdown-messages" id="notificationDropdownList">
    <li>
        <div class="text-center notification-headline"><i class="fa fa-bell fa-fw"></i>&nbsp;<b>Benachrichtigungen</b></div>
        <ul class="notification-list" id="privateMessagesList">
        </ul>
    </li>

    <li class="divider"></li>
    <li>
        <div class="btn-group-full-width btn-group" role="group">
            <button class="btn btn-half btn-danger" onclick="deleteNotificationAndStopEventPropagation(event,'all')">Alle löschen</button>
            <button class="btn btn-half btn-danger" onclick="deleteNotificationAndStopEventPropagation(event,'all_read')">Gelesene Löschen</button>
        </div>
    </li>
</ul>
</li>`, 100);



function updateNotifications() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/notifications/get_notifications.php`,
        data: { notificationId: "all" },
        success: function (notificationList) {

            let unreadCounter = 0;

            //Clear Notifications List
            $("#privateMessagesList").html("");

            for (let n of notificationList) {
                if (n.read == false) { unreadCounter++ } //count unread notifications
                const action = getActionDetails(n.action);

                const notificationHtml = `
                <li class="notification-item" data-notification-id="${n.id}">
                    <div class="row">
                        <div class="col-xs-2">
                            <div class="notification-side-banner notification-${n.read ? "read" : "unread"}"></div>
                        </div>
                        <div class="col-xs-10">
                            <div class="notification-user-content">
                                <p class="notification-user-info">
                                    <span class="label label-default"> ${action.icon} &nbsp; ${n.type.name} ${action.verb} </span>
                                    <span class="pull-right">${formatTimespan(n.timestamp)}</span>
                                </p>
                                <p> ${n.title} </p>
                            </div>
                        </div>
                    </div>
                </li>`;
                $("#privateMessagesList").append(notificationHtml);
            }

            //Show count of unread notifications in menubar
            $("#notificationCountBadge").html(unreadCounter);

            //Eventlistener zum Delete Button einblenden registrieren
            $(".notification-item").mouseenter(function () {
                var currentNotificationId = $(this).attr("data-notification-id");
                $("#notificationListDeleteButton" + currentNotificationId).fadeIn("fast");
            });
            $(".notification-item").mouseleave(function () {
                var currentNotificationId = $(this).attr("data-notification-id");
                $("#notificationListDeleteButton" + currentNotificationId).fadeOut("fast");
            });
            //Toggle des ReadState initialisieren
            $(".notification-side-banner").click(function (event) {
                //Click Event stoppen
                event.preventDefault();
                event.stopPropagation();
                //Notification Id auslesen
                var currentNotificationId = $(this).closest("li").attr("data-notification-id");
                //ReadState auslesen
                if ($(this).hasClass("notification-read")) {
                    var newReadState = stubegru.constants.unread;
                } else {
                    var newReadState = stubegru.constants.read;
                }
                //Readstatus setzen
                setNotificationReadState(currentNotificationId, newReadState);
            });
        }
    });
}



function getActionDetails(action) {
    let actionIcon, actionVerb;
    switch (action) {
        case "CREATE":
            actionIcon = '<i class="fas fa-plus"></i>';
            actionVerb = "neu erstellt";
            break;
        case "UPDATE":
            actionIcon = '<i class="fas fa-pencil-alt"></i>';
            actionVerb = "geändert";
            break;
        case "DELETE":
            actionIcon = '<i class="fas fa-times-circle"></i>';
            actionVerb = "gelöscht";
            break;
        case "INFO":
            actionIcon = '<i class="fas fa-info-circle"></i>';
            actionVerb = "";
            break;
    }
    return {
        icon: actionIcon,
        verb: actionVerb
    };
}

function deleteNotificationAndStopEventPropagation(event, notificationId) {
    event.preventDefault();
    event.stopPropagation();
    deleteNotification(notificationId);
}

function deleteNotification(notificationId) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/notifications/delete_notification.php`,
        data: {
            notificationId: notificationId
        },
        success: function (data) {
            if (data.status == stubegru.constants.success) {
                updateNotifications();
            } else {
                console.log(data.message);
            }
        }

    });

}

function setNotificationReadState(notificationId, markAs) {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/notifications/set_notification_read_state.php`,
        data: {
            notificationId: notificationId,
            markAs: markAs
        },
        success: function (data) {
            if (data.status == "success") {
                updateNotifications();
            } else { console.log(data.message); }
        }

    });
}


$('#notificationDropdown').on(
    "hide.bs.dropdown",
    function (event) {
        if (notificationDetailViewActive == true) {
            //Lässt das Dropdown mit den Notifications offen
            return false;
        } else {
            //Schließt das Dropdown mit den Notifications
            return true;
        }

    });

/*


  _   _       _   _  __ _           _   _               __  __           _       _
 | \ | |     | | (_)/ _(_)         | | (_)             |  \/  |         | |     | |
 |  \| | ___ | |_ _| |_ _  ___ __ _| |_ _  ___  _ __   | \  / | ___   __| | __ _| |
 | . ` |/ _ \| __| |  _| |/ __/ _` | __| |/ _ \| '_ \  | |\/| |/ _ \ / _` |/ _` | |
 | |\  | (_) | |_| | | | | (_| (_| | |_| | (_) | | | | | |  | | (_) | (_| | (_| | |
 |_| \_|\___/ \__|_|_| |_|\___\__,_|\__|_|\___/|_| |_| |_|  |_|\___/ \__,_|\__,_|_|




*/
stubegru.modules.notifications.subscriptions = [];

function showNotificationModal() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/notifications/get_notification_settings.php`,
        success: function (data) {
            stubegru.modules.notifications.subscriptions = data;
            let titleHtml = "";
            let onlineHtml = "";
            let mailHtml = "";
            for (let channel of data) {
                titleHtml += `<th class="col-md-2 text-center">${channel.name}&nbsp;<i class="fa fa-info-circle" aria-hidden="true" data-toggle="tooltip"  title="${channel.description}" style="color:#4fafd3; cursor:help"></i></th>`;
                onlineHtml += `<td class="text-center"><input data-toggle="toggle" type="checkbox" ${channel.online ? "checked" : ""} id="notification_toggle_online_${channel.id}" class="notification-toggle notification-toggle-online"></td>`;
                mailHtml += `<td class="text-center"><input data-toggle="toggle" type="checkbox" ${channel.mail ? "checked" : ""} id="notification_toggle_mail_${channel.id}" class="notification-toggle notification-toggle-mail"></td>`;
            }

            let html = `<table class="table table-bordered" style="border-collapse:separate;">
            <thead><tr><th class="col-md-2"></th>
                ${titleHtml}
            </tr></thead><tbody><tr><td><b>Info</b></td>
                ${onlineHtml}
            </tr><tr><td><b>Info per Mail</b></td>
                ${mailHtml}
            </tr></tbody></table>`;

            $("#notificationCustomSettings").html(html);
            $(".notification-toggle").bootstrapToggle();
        }
    });
    $("#notificationModal").modal("show");
}



function saveNotificationSettings() {
    let subList = stubegru.modules.notifications.subscriptions;

    for (let channel of subList) {
        channel.online = $("#notification_toggle_online_" + channel.id).prop("checked");
        channel.mail = $("#notification_toggle_mail_" + channel.id).prop("checked");
    }


    //Send json to Database
    $.ajax({
        type: "POST",
        dataType: "json",
        data: { subList: JSON.stringify(subList) },
        url: `${stubegru.constants.BASE_URL}/modules/notifications/save_notification_settings.php`,
        success: function (data) {
            stubegru.modules.alerts.alert({
                title: "",
                text: data.message,
                type: data.status
            });
            $("#notificationModal").modal("hide");
        }
    });
}





function showNotificationDetailView(notificationId, event) {
    notificationDetailViewActive = true;
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/notifications/get_notifications.php`,
        data: {
            notificationId: notificationId
        },
        success: function (myNotifications) {
            var singleNotification = myNotifications[0];

            var notificationId = singleNotification.notificationId;
            var triggerId = singleNotification.triggerId;
            var triggerType = singleNotification.triggerType;
            var triggerName = getTriggerName(triggerType);
            var userId = singleNotification.userId;
            var userName = singleNotification.userName;
            var action = singleNotification.action;
            var actionVerb = getActionDetails(action).verb;
            var readState = stubegru.constants.unread;
            var timestamp = singleNotification.timestamp;
            var dateInWords = formatDate(new Date(timestamp), "DD.MM. hh:mm");
            var triggerInfoHeadline = singleNotification.triggerInfoHeadline;
            var triggerInfoText = singleNotification.triggerInfoText;
            var triggerExtraInfo = singleNotification.triggerExtraInfo;


            var introduction, mainLine, description;

            switch (triggerType) {
                case stubegru.constants.reminder:
                    introduction = "<h4>Folgender Artikel hat eine Erinnerung ausgelöst:</h4>";
                    mainLine = `<h4><a href="${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${triggerId}">${triggerInfoHeadline}</a></h4>`;
                    description = triggerInfoText;
                    break;
                case stubegru.constants.report:
                    introduction = " <h4><span class='label label-warning'>" + triggerExtraInfo + "</span></h4><br><br><i>" + userName + "</i> hat ein Problem mit einem Wiki Artikel festgestellt.<br>Es geht um folgenden Artikel:";
                    mainLine = `<h4><a href="${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${triggerId}">${triggerInfoHeadline}</a></h4>`;
                    description = triggerInfoText;
                    break;
                case stubegru.constants.article:
                    introduction = "<h4>Folgener Artikel im Wiki wurde " + actionVerb + ":</h4>";
                    mainLine = `<h4><a href="${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${triggerId}">${triggerInfoHeadline}</a></h4>`;
                    if (action == stubegru.constants.delete) {
                        mainLine = ' <h4><a onclick="openDeletedArticleAlert()">' + triggerInfoHeadline + '</a></h4>';
                    }
                    description = "";
                    break;
                case stubegru.constants.news:
                    introduction = "<h4>Folgende Tagesaktuelle Info wurde " + actionVerb + ":</h4>";
                    mainLine = "<h2>" + triggerInfoHeadline + "</h2>";
                    description = triggerInfoText;
                    break;
                case stubegru.constants.absence:
                    introduction = "<h4>Folgende Abwesenheitsnotiz wurde " + actionVerb + ":</h4>";
                    mainLine = "<h2>" + triggerInfoHeadline + "</h2><br><h3><span class='label label-default'>" + triggerExtraInfo + "</span></h3>";
                    description = triggerInfoText;
                    break;
                case stubegru.constants.error:
                    introduction = "<h4>Es ist folgender Fehler aufgetreten:</h4>";
                    mainLine = "<h2>" + triggerInfoHeadline + "</h2>";
                    description = triggerInfoText;
                    break;
            }

            //$("#ndvIcon").html(actionIcon);
            $("#ndvType").html(triggerName + " " + actionVerb);
            $("#ndvDate").html(timestamp);
            $("#ndvIntroduction").html(introduction);
            $("#ndvMainLine").html(mainLine);
            $("#ndvDescription").html(description);

            //Gelöscht Button initialisieren
            $("#deleteNotificationFromModal").click(function () {
                deleteNotification(notificationId);
            });


            $("#notificationDetailView").modal("show");

            //Diese Notification als gelesen markieren
            setNotificationReadState(notificationId, stubegru.constants.read);
        }

    });
}


function openDeletedArticleAlert() {
    stubegru.modules.alerts.alert({
        text: "Der Artikel wurde gelöscht. Wie soll der denn jetzt aufgerufen werden?",
        title: "Ähemm...",
        type: "warning"
    });
}

$("#notificationDetailView").on("hidden.bs.modal", function () {
    notificationDetailViewActive = false;
})




//Intervall für regelmäßiges Notification Prüfen aktivieren, alle 5 Minuten
setInterval(updateNotifications, 5 * 60 * 1000);
setTimeout(updateNotifications, 3000); //refresh Notifications, sometimes direct loading failes due to unknown (and magic) reasons
setTimeout(updateNotifications, 5000); //refresh once again (just to be really safe)


/**
 * Format Date to timespan-string
 * Showing the hours (hh:mm) if timespan is lower than one day
 * Showing number of days if they are lower than 7
 * Showing date else
 * @param {Date|string} date date
 */
function formatTimespan(date) {
    function addZero(num) {
        if (num < 10) { return `0${num}` }
        return String(num);
    }


    let past = "vor";

    if (!(date instanceof Date)) { date = new Date(date); }
    let dateMillis = date.getTime();
    let nowMillis = new Date().getTime();
    let span = nowMillis - dateMillis;

    if (span < 0) { span = Math.abs(span); past = "in"; } //handle future dates

    if (span < 1000 * 60 * 60) { //shorter than one hour
        let minutes = Math.floor(span / (1000 * 60));
        return `${past} ${minutes} min`;
    }

    if (span < 1000 * 60 * 60 * 24) { //shorter than one day
        let hours = Math.floor(span / (1000 * 60 * 60));
        return `${past} ${hours} Stunden`;
    }

    if (span < 1000 * 60 * 60 * 24 * 7) { //shorter than seven days
        let days = Math.floor(span / (1000 * 60 * 60 * 24));
        return `${past} ${days} Tagen`;
    }

    //more than seven days...
    return `${addZero(date.getDate())}.${addZero(date.getMonth() + 1)}.${date.getFullYear()}`;
}
