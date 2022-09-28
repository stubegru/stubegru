<?php

//Mit diesem Script werden Benachrichtigungen verwaltet. Sowohl Mail Benachrichtigungen als auch Online Notifications
$BASE_PATH = getenv("BASE_PATH");
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/database_without_auth.php"; //include dbconnect (without authorization.php for use in cronjob)
require_once "$BASE_PATH/modules/mailing/mailing.php";
require_once "$BASE_PATH/utils/constants.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";

function newNotification($trigger, $triggerId, $triggerInfoHeadline, $triggerInfoText, $triggerExtraInfo, $userId, $action)
{
    //Mails versenden
    sendNotificationMails($trigger, $triggerId, $triggerInfoHeadline, $triggerInfoText, $triggerExtraInfo, $userId, $action);
    //Online Notifications in DB speichern
    createOnlineNotifications($trigger, $triggerId, $triggerInfoHeadline, $triggerInfoText, $triggerExtraInfo, $userId, $action);
}

function createOnlineNotifications($trigger, $triggerId, $triggerInfoHeadline, $triggerInfoText, $triggerExtraInfo, $userId, $action)
{
    //SQL Connection bereit stellen
    global $dbPdo;

    //Füge Online Notifications in Benachrichtigungen Tabelle ein
    $insertStatement = $dbPdo->prepare("INSERT INTO `Benachrichtigungen`(`triggerType`, `triggerId`,`triggerInfoHeadline`, `triggerInfotext`,`triggerExtraInfo`, `userId`, `action`) VALUES (:trigger,:triggerId,:triggerInfoHeadline,:triggerInfoText,:triggerExtraInfo,:userId,:action);");
    $insertStatement->bindValue(':trigger', $trigger);
    $insertStatement->bindValue(':triggerId', $triggerId);
    $insertStatement->bindValue(':triggerInfoHeadline', $triggerInfoHeadline);
    $insertStatement->bindValue(':triggerInfoText', $triggerInfoText);
    $insertStatement->bindValue(':triggerExtraInfo', $triggerExtraInfo);
    $insertStatement->bindValue(':userId', $userId);
    $insertStatement->bindValue(':action', $action);
    $insertStatement->execute();
    // Id der eingefügten Notification auslesen
    $notificationId = $dbPdo->lastInsertId();

    //Hole alle Nutzer, die diesen trigger als Online Notification abonniert haben
    //Notification Level: 0:nichts 1:nur Online 2:nur Mail 3:Mail und Online
    $selectStatement = $dbPdo->query("SELECT * FROM `Nutzer` WHERE notification_$trigger='1' OR notification_$trigger='3';");
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    $insertStatement = $dbPdo->prepare("INSERT INTO `Link_Benachrichtigungen_Nutzer`(`notificationId`, `userId`, `read`) VALUES (:notificationId,:recipientUserId,'0');");

    foreach ($resultList as $row) {
        $recipientUserId = $row["id"];
        //Füge Benachrichtigungen <=> Nutzer <=> Gelesen Verknüpfung in Link_Benachrichtigungen_Nutzer ein
        $insertStatement->bindValue(':notificationId', $notificationId);
        $insertStatement->bindValue(':recipientUserId', $recipientUserId);
        $insertStatement->execute();
    }
}

function sendNotificationMails($trigger, $triggerId, $triggerInfoHeadline, $triggerInfoText, $triggerExtraInfo, $userId, $action)
{

    /***
     *     __      __        _       _     _              _       _ _   _       _ _     _
     *     \ \    / /       (_)     | |   | |            (_)     (_) | (_)     | (_)   (_)
     *      \ \  / /_ _ _ __ _  __ _| |__ | | ___ _ __    _ _ __  _| |_ _  __ _| |_ ___ _  ___ _ __ ___ _ __
     *       \ \/ / _` | '__| |/ _` | '_ \| |/ _ \ '_ \  | | '_ \| | __| |/ _` | | / __| |/ _ \ '__/ _ \ '_ \
     *        \  / (_| | |  | | (_| | |_) | |  __/ | | | | | | | | | |_| | (_| | | \__ \ |  __/ | |  __/ | | |
     *         \/ \__,_|_|  |_|\__,_|_.__/|_|\___|_| |_| |_|_| |_|_|\__|_|\__,_|_|_|___/_|\___|_|  \___|_| |_|
     *
     *
     */
    global $dbPdo;
    global $constants;
    global $BASE_PATH;
    $actionVerb = "";
    $introduction = "";
    $mainLine = "";
    $description = "";
    $mainButtonLink = "";
    $triggerUserName = getUserAttribute($userId, "name");


    /***
     *                   _   _              __      __       _
     *         /\       | | (_)             \ \    / /      | |
     *        /  \   ___| |_ _  ___  _ __    \ \  / /__ _ __| |__
     *       / /\ \ / __| __| |/ _ \| '_ \    \ \/ / _ \ '__| '_ \
     *      / ____ \ (__| |_| | (_) | | | |    \  /  __/ |  | |_) |
     *     /_/    \_\___|\__|_|\___/|_| |_|     \/ \___|_|  |_.__/
     *
     *
     */

    switch ($action) {
        case $constants["new"]:
            $actionVerb = "neu erstellt";
            break;
        case $constants["update"]:
            $actionVerb = "ge&auml;ndert";
            break;
        case $constants["delete"]:
            $actionVerb = "gel&ouml;scht";
            break;
        case $constants["info"]:
            $actionVerb = "";
            break;
    }

    /***
     *      _______   _                         _______
     *     |__   __| (_)                       |__   __|
     *        | |_ __ _  __ _  __ _  ___ _ __     | |_   _ _ __   ___  ___
     *        | | '__| |/ _` |/ _` |/ _ \ '__|    | | | | | '_ \ / _ \/ __|
     *        | | |  | | (_| | (_| |  __/ |       | | |_| | |_) |  __/\__ \
     *        |_|_|  |_|\__, |\__, |\___|_|       |_|\__, | .__/ \___||___/
     *                   __/ | __/ |                  __/ | |
     *                  |___/ |___/                  |___/|_|
     */

    switch ($trigger) {
        case $constants["reminder"]:
            $triggerTypeInWords = "Erinnerung Wiki Artikel";
            break;
        case $constants["report"]:
            $triggerTypeInWords = "Feedback";
            break;
        case $constants["article"]:
            $triggerTypeInWords = "Wiki Artikel";
            break;
        case $constants["news"]:
            $triggerTypeInWords = "Tagesaktuelle Info";
            break;
        case $constants["absence"]:
            $triggerTypeInWords = "Abwesenheit";
            break;
        case $constants["error"]:
            $triggerTypeInWords = "Technisches Problem";
            break;
        default:
            echo json_encode(array("status" => "error", "message" => "[Notification System] Cant create notification for trigger type '$trigger'."));
            exit;
    }
    /***
     *      _______        _                                    _
     *     |__   __|      | |                                  (_)
     *        | | _____  _| |_ ___    __ _  ___ _ __   ___ _ __ _  ___ _ __ ___ _ __
     *        | |/ _ \ \/ / __/ _ \  / _` |/ _ \ '_ \ / _ \ '__| |/ _ \ '__/ _ \ '_ \
     *        | |  __/>  <| ||  __/ | (_| |  __/ | | |  __/ |  | |  __/ | |  __/ | | |
     *        |_|\___/_/\_\\__\___|  \__, |\___|_| |_|\___|_|  |_|\___|_|  \___|_| |_|
     *                                __/ |
     *                               |___/
     */

    switch ($trigger) {
        case $constants["reminder"]:
            $introduction = "<h4>Folgender Artikel hat eine Erinnerung ausgel&ouml;st:</h4>";
            $mainButtonLink = $constants['BASE_URL'] . "?view=wiki_show_article&artikel=$triggerId";
            $mainLine = "<a href='$mainButtonLink'> $triggerInfoHeadline</a>";
            $description = $triggerInfoText;
            break;
        case $constants["report"]:
            $introduction = " <h4><span class='label label-warning'>" . $triggerExtraInfo . "</span></h4><i>" . $triggerUserName . "</i> hat ein Problem mit einem Wiki Artikel festgestellt.<br>Es geht um folgenden Artikel:";
            $mainButtonLink = $constants['BASE_URL'] . "?view=wiki_show_article&artikel=$triggerId";
            $mainLine = "<a href='$mainButtonLink'> $triggerInfoHeadline</a>";
            $description = $triggerInfoText;
            break;
        case $constants["article"]:
            $introduction = "<h4>Folgener Artikel im Wiki wurde " . $actionVerb . ":</h4>";
            $mainButtonLink = $constants['BASE_URL'] . "?view=wiki_show_article&artikel=$triggerId";
            $mainLine = "<a href='$mainButtonLink'> $triggerInfoHeadline</a>";
            $description = "";
            break;
        case $constants["news"]:
            $introduction = "<h4>Folgende Tagesaktuelle Info wurde " . $actionVerb . ":</h4>";
            $mainLine = $triggerInfoHeadline;
            $description = $triggerInfoText;
            break;
        case $constants["absence"]:
            $introduction = "<h4>Folgende Abwesenheitsnotiz wurde " . $actionVerb . ":</h4>";
            $mainLine = $triggerInfoHeadline;
            $description = $triggerInfoText;
            break;
        case $constants["error"]:
            $introduction = "<h4>Es ist folgender Fehler aufgetreten:</h4>";
            $mainLine = "<h2>" . $triggerInfoHeadline . "</h2>";
            $description = $triggerInfoText;
            break;
    }

    /***
     *      _______                   _       _         _           _
     *     |__   __|                 | |     | |       | |         | |
     *        | | ___ _ __ ___  _ __ | | __ _| |_ ___  | | __ _  __| | ___ _ __
     *        | |/ _ \ '_ ` _ \| '_ \| |/ _` | __/ _ \ | |/ _` |/ _` |/ _ \ '_ \
     *        | |  __/ | | | | | |_) | | (_| | ||  __/ | | (_| | (_| |  __/ | | |
     *        |_|\___|_| |_| |_| .__/|_|\__,_|\__\___| |_|\__,_|\__,_|\___|_| |_|
     *                         | |
     *                         |_|
     */

    $mail_text = file_get_contents("$BASE_PATH/modules/notifications/mail_template_notification.html");
    //Variblen im Template mit Daten füllen
    $variablen_im_text = array("{titel}", "{einleitung}", "{artikelUrl}", "{beschreibung}", "{application_name}", "{trigger_type}", "{admin_mail}");
    $variablen_daten = array($mainLine, $introduction, $mainButtonLink, $description, $constants["APPLICATION_NAME"], $triggerTypeInWords, $constants["ADMIN_MAIL"]);
    $mail_text = str_replace($variablen_im_text, $variablen_daten, $mail_text);

    //Hole alle Nutzer, die diesen trigger als Mail abonniert haben
    //Notification Level: 0:nichts 1:nur Online 2:nur Mail 3:Mail und Online
    $selectStatement = $dbPdo->query("SELECT * FROM `Nutzer` WHERE notification_$trigger='2' OR notification_$trigger='3';");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    $mail_betreff = $constants["APPLICATION_NAME"] . " - $triggerTypeInWords";

    foreach ($resultList as $row) {
        $recipientUserMail = $row["mail"];
        stubegruMail($recipientUserMail, $mail_betreff, $mail_text);
        //echo "Sending Mail to $recipientUserMail";
    }
}

//TEST!!!
/*$loggedInUserId = $_SESSION["id"];
newNotification($constants["report"],0,"Das ist die Überschrift","<h1>Das ist ein Titel</h1><br>Könnt ihr auch html?","Technischer Bug",$loggedInUserId,$constants["info"]);
newNotification($constants["reminder"],32,"Testartikel","Diesen Artikel bitte nochmal überarbeiten","",$loggedInUserId,$constants["info"]);
newNotification($constants["article"],32,"Testartikel","Dieser Artikel wurde überarbeitet","",$loggedInUserId,$constants["update"]);
newNotification($constants["news"],3,"zukünftig","Dieses seht ihr erst in der Zukunft.","",$loggedInUserId,$constants["new"]);
newNotification($constants["absence"],50,"Jürgen","Vom 30.07.2018 bis 23.12.2018 - Er kränkelt","",$loggedInUserId,$constants["delete"]);
newNotification($constants["error"],0,"Undefined Variable","In myScript.php on Line 34","",$loggedInUserId,$constants["info"]);
 */
