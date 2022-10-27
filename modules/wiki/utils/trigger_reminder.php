<?php

// Dieses Script wird per Cronjob einmal täglich nachts ausgeführt und triggert ein Notification für alle fälligen Reminder
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";
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

    $wikiLink = getenv(("BASE_URL")) . "?view=wiki_show_article&artikel=$articleId";
    $notificationText = "Dieser Wiki Artikel hat eine Erinnerung ausgelöst<br>
    Hinweis: $articleReminderText<br><br>
    Der entsprechende Wiki Artikel ist hier zu finden:<br><a href='$wikiLink'>$articleHeading</a>";
    newNotification("WIKI_REMINDER", $articleId, $articleHeading, $notificationText, 0, "INFO");
}

//Bearbeitete reminder aus DB löschen
$updateStatement = $dbPdo->prepare("UPDATE `wiki_artikel` SET reminderDate='0000-00-00', reminderText=''  WHERE reminderDate <= :heute AND reminderDate > '0000-00-00';");
$updateStatement->bindValue(':heute', $heute);
$updateStatement->execute();

echo ("Alle heutigen Reminder für Wiki Artikel ausgelöst.");
