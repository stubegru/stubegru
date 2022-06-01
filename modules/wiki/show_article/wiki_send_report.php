<?php

// Dieses Script versendet Bug oder Fehler Reports, wenn ein report gemeldet wird

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$userId = $_SESSION["id"];
$heute = date("Y-m-d");

$reportReason = $_POST["reportReason"];
$reportArticleId = $_POST["reportArticleId"];
$reportNotes = $_POST["reportNotes"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `wiki_artikel` WHERE id = :reportArticleId;");
$selectStatement->bindValue(':reportArticleId', $reportArticleId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $reportArticleName = $row["heading"];
    newNotification($constants["report"], $reportArticleId, $reportArticleName, $reportNotes, $reportReason, $userId, $constants["info"]);
}


echo json_encode(array("status" => "success"));
