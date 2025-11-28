<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //<<<WARNING Only here for public access

$resultList;

if (isset($_GET["meetingId"])) {
    //select one specific meeting
    $meetingId =  $_GET["meetingId"];
    $selectStatement = $dbPdo->prepare("SELECT `id`, `date`, `owner`, `ownerId`,  `room`, `start`, `end`, `title`, `channel` FROM `Termine` WHERE id = :meetingId AND (teilnehmer IS NULL OR teilnehmer = '');");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
} else {
    //delete expired blocks
    $dbPdo->query("DELETE FROM `meeting_blocks` WHERE `timestamp` < (NOW() - INTERVAL 30 MINUTE);");

    //select all free meetings, exclude meetings on the same day
    $selectStatement = $dbPdo->query(
        "SELECT `id`, `date`, `owner`, `ownerId`, `room`, `start`, `end`, `title`, `channel`
         FROM `Termine`
         WHERE 
            (teilnehmer IS NULL OR teilnehmer = '')
            AND DATE(`date`) >= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
            AND `id` NOT IN (SELECT `meetingId` FROM `meeting_blocks`)
         ORDER BY `date`, `start`;"
    );
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode($resultList);
