//Global Variables
stubegru.modules.notifications = {};
var notificationIdsFromLastRequest = [];
var notificationDetailViewActive = false;
var firstNotificationRequest = true;

//register menu entry for notifications
stubegru.modules.menubar.addItem("secondary", `<li><a title="Einstellen über welche Ereignisse du informiert wirst." onclick="showNotificationModal()"><i class="fa fa-envelope"></i>&nbsp;Benachrichtigungen konfigurieren</a></li>`, -990);

stubegru.modules.menubar.addItem("primary", `<li class="dropdown" id="notificationDropdown">
<a class="dropdown-toggle" href="#" aria-expanded="false" data-toggle="dropdown" id="notificationDropdownNavbarButton" title="Benachrichtigungen">
    <i class="fa fa-bell fa-fw"></i><span class="badge" id="notificationCountBadge"></span>
</a>
<ul class="dropdown-menu dropdown-messages" id="notificationDropdownList">
    <li>
        <div id="heading">
            <div class="heading-left">
                <h6 class="heading-title notifications-list-headline">Benachrichtigungen</h6>
            </div>
        </div>
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
        data: {
            notificationId: "all"
        },
        success: function (myNotifications) {
            var tempIdsFromCurrentRequest = [];
            var countUnreadNotifications = 0;

            //Clear Notifications List
            $("#privateMessagesList").html("");

            for (var i in myNotifications) {
                var singleNotification = myNotifications[i];
                var notificationId = singleNotification.notificationId;
                var triggerId = singleNotification.triggerId;
                var triggerType = singleNotification.triggerType;
                var triggerName = getTriggerName(triggerType);
                var userId = singleNotification.userId;
                var userName = singleNotification.userName;
                var action = singleNotification.action;
                var actionVerb = getActionDetails(action).verb;
                var actionIcon = getActionDetails(action).icon;
                var readState = singleNotification.readState;
                var readStateClass = (readState == 1) ? stubegru.constants.read : stubegru.constants.unread;
                if (readStateClass == stubegru.constants.unread) {
                    countUnreadNotifications++;
                }
                var timestamp = singleNotification.timestamp;
                var dateInWords = formatDate(new Date(timestamp), "DD.MM. hh:mm");
                var triggerInfoHeadline = singleNotification.triggerInfoHeadline;
                var triggerInfoText = singleNotification.triggerInfoText;
                var notificationHtml =
                    '   <li onclick="showNotificationDetailView(' + notificationId + ',event)" class="notification-item" data-notification-id="' + notificationId + '">' +
                    '       <div class="row">' +
                    '           <div class="col-xs-2">' +
                    '               <div class="notification-side-banner notification-' + readStateClass + '"></div>' +
                    '           </div>' +
                    '           <div class="col-xs-10">' +
                    '               <div class="notification-user-content">' +
                    '                   <p class="notification-user-info"><span class="label label-default">' + actionIcon + '&nbsp' + triggerName + ' ' + actionVerb + '</span><button onclick="deleteNotificationAndStopEventPropagation(event,' + notificationId + ')" id="notificationListDeleteButton' + notificationId + '" class="btn btn-danger pull-right" style="display:none;"><i class="fas fa-times"></i></button></p>' +
                    '                   <p>' + triggerInfoHeadline + '</p>' +
                    '                   <p class="notification-time">' + dateInWords + '</p>' +
                    '               </div>' +
                    '           </div>' +
                    '       </div>' +
                    '   </li>';

                //Add this Notification id to temp Array
                tempIdsFromCurrentRequest.push(notificationId);
                //Check wether this id is allready known in the notificationIdsFromLastRequest Array
                if (notificationIdsFromLastRequest.indexOf(notificationId) < 0 && firstNotificationRequest == false) {
                    //triggerPushNotification(notificationId, triggerName + " " + actionVerb, triggerInfoHeadline);
                }


                $("#privateMessagesList").append(notificationHtml);
            }

            //Temp Ids als last request ids setzen
            notificationIdsFromLastRequest = tempIdsFromCurrentRequest;
            firstNotificationRequest = false;

            //Anzahl der Ungelesenen Notifications anzeigen
            $("#notificationCountBadge").html(countUnreadNotifications);

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
    var actionIcon, actionVerb;
    switch (action) {
        case stubegru.constants.new:
            actionIcon = '<i class="fas fa-plus"></i>';
            actionVerb = "neu erstellt";
            break;
        case stubegru.constants.update:
            actionIcon = '<i class="fas fa-pencil-alt"></i>';
            actionVerb = "geändert";
            break;
        case stubegru.constants.delete:
            actionIcon = '<i class="fas fa-times-circle"></i>';
            actionVerb = "gelöscht";
            break;
        case stubegru.constants.info:
            actionIcon = '<i class="fas fa-info-cricle"></i>';
            actionVerb = "";
            break;
    }
    return {
        icon: actionIcon,
        verb: actionVerb
    };
}

function getTriggerName(triggerType) {
    switch (triggerType) {
        case stubegru.constants.reminder:
            return "Erinnerung Wiki Artikel";
            break;
        case stubegru.constants.report:
            return "Feedback";
            break;
        case stubegru.constants.article:
            return "Wiki Artikel";
            break;
        case stubegru.constants.news:
            return "Tagesaktuelle Info";
            break;
        case stubegru.constants.absence:
            return "Abwesenheit";
            break;
        case stubegru.constants.error:
            return "Technisches Problem";
            break;

    }
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
            if (data.status == stubegru.constants.success) {
                updateNotifications();
            } else {
                console.log(data.message);
            }

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
        data: {subList : JSON.stringify(subList)},
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


/*


  _   _       _   _  __ _           _   _               _____       _        _ _  __      ___               
 | \ | |     | | (_)/ _(_)         | | (_)             |  __ \     | |      (_) | \ \    / (_)              
 |  \| | ___ | |_ _| |_ _  ___ __ _| |_ _  ___  _ __   | |  | | ___| |_ __ _ _| |  \ \  / / _  _____      __
 | . ` |/ _ \| __| |  _| |/ __/ _` | __| |/ _ \| '_ \  | |  | |/ _ \ __/ _` | | |   \ \/ / | |/ _ \ \ /\ / /
 | |\  | (_) | |_| | | | | (_| (_| | |_| | (_) | | | | | |__| |  __/ || (_| | | |    \  /  | |  __/\ V  V / 
 |_| \_|\___/ \__|_|_| |_|\___\__,_|\__|_|\___/|_| |_| |_____/ \___|\__\__,_|_|_|     \/   |_|\___| \_/\_/  
                                                                                                            
                                                                                                            


*/


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

