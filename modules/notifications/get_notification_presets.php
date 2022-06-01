<?php

// Dieses Script lädt Voreinstellungen für Benachrichtigungskonfigurationen aus der Db und stellt sie als JSON zur Verfügung
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$toReturn = array();
$selectStatement = $dbPdo->query("SELECT * from `Rollen`;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $tempArray = array();
    $tempArray["name"] = $row["name"];
    $tempArray["reminder"] = $row["notification_reminder"];
    $tempArray["report"] = $row["notification_report"];
    $tempArray["article"] = $row["notification_article"];
    $tempArray["news"] = $row["notification_news"];
    $tempArray["absence"] = $row["notification_absence"];
    $tempArray["error"] = $row["notification_error"];
    $toReturn[] = $tempArray;
}

echo json_encode($toReturn);
