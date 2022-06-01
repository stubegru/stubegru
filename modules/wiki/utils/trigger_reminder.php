<?php

// Dieses Script wird per Cronjob einmal täglich nachts ausgeführt und triggert ein Notification für alle fälligen Reminder
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
$heute = date("Y-m-d");

$selectStatement = $dbPdo->prepare("SELECT * FROM `wiki_artikel` WHERE reminderDate <= :heute AND reminderDate > '0000-00-00';");
$selectStatement->bindValue(':heute', $heute);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $articleId = $row["id"];
    $articleHeading = $row["heading"];
    $articleReminderText = $row["reminderText"];
    newNotification($constants["reminder"], $articleId, $articleHeading, $articleReminderText, "", $constants["nobody"], $constants["info"]);
}

//Bearbeitete reminder aus DB löschen
$updateStatement = $dbPdo->prepare("UPDATE `wiki_artikel` SET reminderDate='0000-00-00', reminderText=''  WHERE reminderDate <= :heute AND reminderDate > '0000-00-00';");
$updateStatement->bindValue(':heute', $heute);
$updateStatement->execute();

echo ("Alle heutigen Reminder für Wiki Artikel ausgelöst.");
