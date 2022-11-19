<?php

// Dieses Script speichert einen neuen Kalendereintrag
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permissionRequest("MEETINGS_WRITE");
$creatorId = $_SESSION["id"];

$date = $_POST["date"];
$ownerId = $_POST["ownerId"];
$room = $_POST["roomId"];
$start = $_POST["start"];
$end = $_POST["end"];
$title = $_POST["title"];
$template = $_POST["templateId"];

//Channel attribute will only be set by calendar2 frontend
$channel = isset($_POST["channel"]) ? $_POST["channel"] : "unknown";

$ownerName = getUserName($ownerId);

try {
    $insertStatement = $dbPdo->prepare("INSERT INTO `Termine` (`date`,`owner`,`ownerId`,`room`,`start`,`end`,`title`,`template`,`channel`) VALUES (:date,:ownerName,:ownerId,:room,:start,:end,:title,:template,:channel);");
    $insertStatement->bindValue(':date', $date);
    $insertStatement->bindValue(':ownerName', $ownerName);
    $insertStatement->bindValue(':ownerId', $ownerId);
    $insertStatement->bindValue(':room', $room);
    $insertStatement->bindValue(':start', $start);
    $insertStatement->bindValue(':end', $end);
    $insertStatement->bindValue(':title', $title);
    $insertStatement->bindValue(':template', $template);
    $insertStatement->bindValue(':channel', $channel);
    $insertStatement->execute();
    //Id des neu hinzugefügten Termins abrufen
    $dateId = $dbPdo->lastInsertId();
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    exit;
}
echo json_encode(array("status" => "success", "message" => "Der Termin wurde erstellt", "dateId" => $dateId));

