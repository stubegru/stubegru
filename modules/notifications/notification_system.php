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
    global $dbPdo;

    //Get assigned notification types by emitter channel
    $selectStatement = $dbPdo->prepare("SELECT notificationTypeId FROM `notification_emitter` WHERE name = :emitterChannel;");
    $selectStatement->bindValue(':emitterChannel', $emitterChannel);
    $selectStatement->execute();
    $typeList = $selectStatement->fetchAll(PDO::FETCH_COLUMN);
    if (empty($typeList)) {
        return array("status" => "warning", "message" => "No assigned notification type found for emitter channel: '$emitterChannel'");
    }

    $toReturn = array();
    $toReturn[] = sendNotificationMails($typeList, $emitterId, $title, $text, $userId, $action);
    $toReturn[] = createOnlineNotifications($typeList, $emitterId, $title, $text, $userId, $action);
    return $toReturn;
}


function createOnlineNotifications($typeList, $emitterId, $title, $text, $userId, $action)
{
    global $dbPdo;

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

function sendNotificationMails($typeList, $emitterId, $title, $text, $userId, $action)
{
    global $dbPdo, $BASE_PATH, $constants;
    $applicationName = isset($constants["CUSTOM_CONFIG"]["applicationName"]) ? $constants["CUSTOM_CONFIG"]["applicationName"] : "Stubegru";
    $emitterUserName = getUserName($userId);
    $selectStatement = $dbPdo->prepare("SELECT `name`,`description` FROM `notification_types` WHERE id = :type;");

    foreach ($typeList as $type) {
        //get notification type description
        $selectStatement->bindValue(':type', $type);
        $selectStatement->execute();
        $notificationTypeResult = $selectStatement->fetch(PDO::FETCH_ASSOC);

        $typeDescription = $notificationTypeResult["description"];
        $typeName = $notificationTypeResult["name"];

        //load mail template and replace variables
        $mail_text = loadStubegruMailtemplate("mail_template_notification.html");
        $variablen_im_text = array("{title}", "{text}", "{user_name}", "{trigger_type}", "{trigger_description}", "{application_name}", "{application_url}");
        $variablen_daten = array($title, $text, $emitterUserName, $typeName, $typeDescription, $applicationName, getenv("BASE_URL"));
        $mail_text = str_replace($variablen_im_text, $variablen_daten, $mail_text);
        
        $mail_betreff = extractMailSubject($mail_text,"mail_template_notification.html");

        //select recipients
        $selectRecipients = $dbPdo->prepare("SELECT mail FROM Nutzer WHERE id IN (SELECT userId FROM `notification_type_user` WHERE  notificationType = :notificationType AND `mail`='1');");
        $selectRecipients->bindValue(':notificationType', $type);
        $selectRecipients->execute();
        $recipientMailAdressList = $selectRecipients->fetchAll(PDO::FETCH_COLUMN);
        $subCount = count($recipientMailAdressList);
        
        foreach ($recipientMailAdressList as $address) {
            stubegruMail($address, $mail_betreff, $mail_text);
        }
        return array("status" => "success", "message" => "Created mail notification and sent to $subCount subscribers");
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
