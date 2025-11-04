<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //<<<WARNING Only here for public access

$resultList;

if (isset($_GET["meetingId"])) {
    //select one specific meeting
    $meetingId =  $_GET["meetingId"];
    $selectStatement = $dbPdo->prepare("SELECT `id`, `date`, `owner`, `ownerId`,  `room`, `start`, `end`, `title`, `channel` FROM `Termine` WHERE id = :meetingId AND teilnehmer IS NULL;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
} else {
    //select all free meetings, exclude meetings on the same day
    $selectStatement = $dbPdo->query(
        "SELECT `id`, `date`, `owner`, `ownerId`, `room`, `start`, `end`, `title`, `channel`
         FROM `Termine`
         WHERE teilnehmer IS NULL
           AND DATE(`date`) >= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
         ORDER BY `date`, `start`;"
    );
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode($resultList);
