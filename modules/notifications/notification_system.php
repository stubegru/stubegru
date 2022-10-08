<?php

//Mit diesem Script werden Benachrichtigungen verwaltet. Sowohl Mail Benachrichtigungen als auch Online Notifications
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //include dbconnect (without authorization.php for use in cronjob)
require_once "$BASE_PATH/modules/mailing/mailing.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";

/**
 * Create a new global notification and deliver to all subscribers via mail or online notification
 * @param $emitterChannel Channel this notification is emitted to. Relations in `notification_emitter` table assign notification types to each channel
 * @param $emitterId Id of the object emitting this notification
 * @param $action CREATE|UPDATE|DELETE|INFO
 * @param $title title of the notification
 * @param $text content of the notification. HTML may be used here
 * @param $userId the user that triggered this notification
 */
function newNotification($emitterChannel, $emitterId, $title, $text, $userId, $action)
{
    $toReturn = array();
    //$toReturn[] = sendNotificationMails($emitterChannel, $emitterId, $title, $text, $userId, $action);
    $toReturn[] = createOnlineNotifications($emitterChannel, $emitterId, $title, $text, $userId, $action);
    return $toReturn;
}


function createOnlineNotifications($emitterChannel, $emitterId, $title, $text, $userId, $action)
{
    global $dbPdo;

    //Get assigned notification types by emitter channel
    $selectStatement = $dbPdo->prepare("SELECT notificationTypeId FROM `notification_emitter` WHERE name = :emitterChannel;");
    $selectStatement->bindValue(':emitterChannel', $emitterChannel);
    $selectStatement->execute();
    $typeList = $selectStatement->fetchAll(PDO::FETCH_COLUMN);
    if (empty($typeList)) {
        return array("status" => "warning", "message" => "No assigned notification type found for emitter channel: '$emitterChannel'");
    }


    $notificationInsert = $dbPdo->prepare("INSERT INTO `notifications`(`type`, `emitterId`, `userId`, `action`, `title`, `text`) VALUES  (:type,:emitterId,:userId,:action,:title,:text);");

    foreach ($typeList as $type) {
        $notificationInsert->bindValue(':type', $type);
        $notificationInsert->bindValue(':emitterId', $emitterId);
        $notificationInsert->bindValue(':userId', $userId);
        $notificationInsert->bindValue(':action', $action);
        $notificationInsert->bindValue(':title', $title);
        $notificationInsert->bindValue(':text', $text);
        $notificationInsert->execute();
        $notificationId = $dbPdo->lastInsertId();

        $selectRecipients = $dbPdo->prepare("SELECT userId FROM `notification_type_user` WHERE  notificationType = :notificationType AND `online`='1';");
        $selectRecipients->bindValue(':notificationType', $type);
        $selectRecipients->execute();
        $recipientList = $selectRecipients->fetchAll(PDO::FETCH_COLUMN);

        $insertStatement = $dbPdo->prepare("INSERT INTO `notification_user`(`notificationId`, `userId`) VALUES (:notificationId,:recipientId);");
        foreach ($recipientList as $recipientId) {
            $insertStatement->bindValue(':notificationId', $notificationId);
            $insertStatement->bindValue(':recipientId', $recipientId);
            $insertStatement->execute();
        }
    }
    return array("status" => "success", "message" => "Created online notification with id $notificationId and assigned to subscribers");
}

function sendNotificationMails($emitterChannel, $emitterId, $title, $text, $extraInfo, $userId, $action)
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
    $emitterChannelUserName = getUserAttribute($userId, "name");


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

    switch ($emitterChannel) {
        case $constants["reminder"]:
            $emitterChannelTypeInWords = "Erinnerung Wiki Artikel";
            break;
        case $constants["report"]:
            $emitterChannelTypeInWords = "Feedback";
            break;
        case $constants["article"]:
            $emitterChannelTypeInWords = "Wiki Artikel";
            break;
        case $constants["news"]:
            $emitterChannelTypeInWords = "Tagesaktuelle Info";
            break;
        case $constants["absence"]:
            $emitterChannelTypeInWords = "Abwesenheit";
            break;
        case $constants["error"]:
            $emitterChannelTypeInWords = "Technisches Problem";
            break;
        default:
            echo json_encode(array("status" => "error", "message" => "[Notification System] Cant create notification for trigger type '$emitterChannel'."));
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

    switch ($emitterChannel) {
        case $constants["reminder"]:
            $introduction = "<h4>Folgender Artikel hat eine Erinnerung ausgel&ouml;st:</h4>";
            $mainButtonLink = $constants['BASE_URL'] . "?view=wiki_show_article&artikel=$emitterId";
            $mainLine = "<a href='$mainButtonLink'> $title</a>";
            $description = $text;
            break;
        case $constants["report"]:
            $introduction = " <h4><span class='label label-warning'>" . $extraInfo . "</span></h4><i>" . $emitterChannelUserName . "</i> hat ein Problem mit einem Wiki Artikel festgestellt.<br>Es geht um folgenden Artikel:";
            $mainButtonLink = $constants['BASE_URL'] . "?view=wiki_show_article&artikel=$emitterId";
            $mainLine = "<a href='$mainButtonLink'> $title</a>";
            $description = $text;
            break;
        case $constants["article"]:
            $introduction = "<h4>Folgener Artikel im Wiki wurde " . $actionVerb . ":</h4>";
            $mainButtonLink = $constants['BASE_URL'] . "?view=wiki_show_article&artikel=$emitterId";
            $mainLine = "<a href='$mainButtonLink'> $title</a>";
            $description = "";
            break;
        case $constants["news"]:
            $introduction = "<h4>Folgende Tagesaktuelle Info wurde " . $actionVerb . ":</h4>";
            $mainLine = $title;
            $description = $text;
            break;
        case $constants["absence"]:
            $introduction = "<h4>Folgende Abwesenheitsnotiz wurde " . $actionVerb . ":</h4>";
            $mainLine = $title;
            $description = $text;
            break;
        case $constants["error"]:
            $introduction = "<h4>Es ist folgender Fehler aufgetreten:</h4>";
            $mainLine = "<h2>" . $title . "</h2>";
            $description = $text;
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
    $variablen_daten = array($mainLine, $introduction, $mainButtonLink, $description, $constants["APPLICATION_NAME"], $emitterChannelTypeInWords, $constants["ADMIN_MAIL"]);
    $mail_text = str_replace($variablen_im_text, $variablen_daten, $mail_text);

    //Hole alle Nutzer, die diesen trigger als Mail abonniert haben
    //Notification Level: 0:nichts 1:nur Online 2:nur Mail 3:Mail und Online
    $selectStatement = $dbPdo->query("SELECT * FROM `Nutzer` WHERE notification_$emitterChannel='2' OR notification_$emitterChannel='3';");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    $mail_betreff = $constants["APPLICATION_NAME"] . " - $emitterChannelTypeInWords";

    foreach ($resultList as $row) {
        $recipientUserMail = $row["mail"];
        stubegruMail($recipientUserMail, $mail_betreff, $mail_text);
        //echo "Sending Mail to $recipientUserMail";
    }
}

//TEST!!!
//echo json_encode(newNotification("WIKI_REPORT", 0, "Das ist die Überschrift", "<h1>Das ist ein Titel</h1><br>Könnt ihr auch html?", 1, "INFO"));
/*
newNotification($constants["reminder"],32,"Testartikel","Diesen Artikel bitte nochmal überarbeiten","",$loggedInUserId,$constants["info"]);
newNotification($constants["article"],32,"Testartikel","Dieser Artikel wurde überarbeitet","",$loggedInUserId,$constants["update"]);
newNotification($constants["news"],3,"zukünftig","Dieses seht ihr erst in der Zukunft.","",$loggedInUserId,$constants["new"]);
newNotification($constants["absence"],50,"Jürgen","Vom 30.07.2018 bis 23.12.2018 - Er kränkelt","",$loggedInUserId,$constants["delete"]);
newNotification($constants["error"],0,"Undefined Variable","In myScript.php on Line 34","",$loggedInUserId,$constants["info"]);
 */
