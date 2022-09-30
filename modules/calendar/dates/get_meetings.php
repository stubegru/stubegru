<?php
// Dieses Script gibt alle Termine in einem großen JSON Array zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");
$own_id = $_SESSION['id'];

$startTime = $_POST["start"];
$endTime = $_POST["end"];

$calendars = array();
$calendars["stubegru"] = getStubegruMeetings($startTime, $endTime);
echo json_encode($calendars);

function getStubegruMeetings($startTime, $endTime)
{
    global $dbPdo;
    $finalArray = array();
    $selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `date` BETWEEN :startTime AND :endTime ORDER BY date, start;");
    $selectStatement->bindValue(':startTime', $startTime);
    $selectStatement->bindValue(':endTime', $endTime);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultList as $meetingData) {
        //Teilnehmer Informationen sammeln
        $clientId = $meetingData["teilnehmer"];
        if ($clientId != "") {
            $selectStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id = :clientId");
            $selectStatement->bindValue(':clientId', $clientId);
            $selectStatement->execute();
            $clientData = $selectStatement->fetch(PDO::FETCH_ASSOC);;
            $meetingData["teilnehmer"] = $clientData;
        }

        $finalArray[] = $meetingData;
    }
    return $finalArray;
}
