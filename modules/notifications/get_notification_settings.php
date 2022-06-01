<?php

// Dieses Script lädt Benachrichtigungskonfigurationen aus der Db und stellt sie als JSON zur Verfügung

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION["id"];

$tempArray = array();

$selectStatement = $dbPdo->prepare("SELECT * FROM `Nutzer` WHERE id=:ownId;");
$selectStatement->bindValue(':ownId', $own_id);
$selectStatement->execute();
$row = $selectStatement->fetch(PDO::FETCH_ASSOC);

$tempArray["reminder"] = $row["notification_reminder"];
$tempArray["report"] = $row["notification_report"];
$tempArray["article"] = $row["notification_article"];
$tempArray["news"] = $row["notification_news"];
$tempArray["absence"] = $row["notification_absence"];
$tempArray["error"] = $row["notification_error"];

echo json_encode($tempArray);
