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

$ownerName = getUserAttribute($ownerId, "name");

$insertStatement = $dbPdo->prepare("INSERT INTO `Termine` (`date`,`owner`,`ownerId`,`room`,`start`,`end`,`title`,`template`) VALUES (:date,:ownerName,:ownerId,:room,:start,:end,:title,:template);");
$insertStatement->bindValue(':date', $date);
$insertStatement->bindValue(':ownerName', $ownerName);
$insertStatement->bindValue(':ownerId', $ownerId);
$insertStatement->bindValue(':room', $room);
$insertStatement->bindValue(':start', $start);
$insertStatement->bindValue(':end', $end);
$insertStatement->bindValue(':title', $title);
$insertStatement->bindValue(':template', $template);
$insertStatement->execute();
//Id des neu hinzugefügten Termins abrufen
$dateId = $dbPdo->lastInsertId();

echo json_encode(array("status" => "success", "message" => "Der Termin wurde erstellt", "dateId" => $dateId));
