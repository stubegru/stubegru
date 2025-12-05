<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/ts_modules/calendar/backend/meetings/meeting_block_utils.php";

permissionRequest("MEETINGS_WRITE");

$meetingId = $_POST["id"];
$date = $_POST["date"];
$ownerId = $_POST["ownerId"];
$room = $_POST["room"];
$start = $_POST["start"];
$end = $_POST["end"];
$title = $_POST["title"];
$template = $_POST["template"];

//Channel attribute will only be set by calendar2 frontend
$channel = isset($_POST["channel"]) ? $_POST["channel"] : "unknown";

//check for meeting block
$blockResult = isMeetingBlock($meetingId);
if ($blockResult["isBlocked"]) {
    echo json_encode(array("status" => "error", "message" => "Die Änderungen konnten nicht gespeichert werden. Dieser Termin kann aktuell nicht bearbeitet werden, da er durch einen anderen Nutzer zur Terminvergabe blockiert wurde."));
    exit;
}

//check if this meeting is still assigned to anybody
$selectStatement = $dbPdo->prepare("SELECT teilnehmer FROM `Termine` WHERE `id`=:meetingId;");
$selectStatement->bindValue(':meetingId', $meetingId);
$selectStatement->execute();
$meetingData = $selectStatement->fetch(PDO::FETCH_ASSOC);
if ($meetingData["teilnehmer"] != "") {
    $clientId = $meetingData["teilnehmer"];
    echo json_encode(array("status" => "error", "message" => "Der Termin kann nicht mehr bearbeitet werden. Der Termin ist bereits an einen Kunden vergeben."));
    exit;
}


$ownerName = getUserName($ownerId);

$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET `date`=:date,`owner`=:owner,`ownerId`=:ownerId,`room`=:room,`start`=:start,`end`=:end,`title`=:title,`template`=:template, `channel` = :channel WHERE id = :meetingId;");
$updateStatement->bindValue(':date', $date);
$updateStatement->bindValue(':owner', $ownerName);
$updateStatement->bindValue(':ownerId', $ownerId);
$updateStatement->bindValue(':room', $room);
$updateStatement->bindValue(':start', $start);
$updateStatement->bindValue(':end', $end);
$updateStatement->bindValue(':title', $title);
$updateStatement->bindValue(':template', $template);
$updateStatement->bindValue(':meetingId', $meetingId);
$updateStatement->bindValue(':channel', $channel);
$updateStatement->execute();

echo json_encode(array("status" => "success", "message" => "Der Termin wurde erfolgreich aktualisiert"));
