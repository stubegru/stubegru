<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";

$ownId = $_SESSION["id"];

$absenceId = $_POST["id"];
$name = $_POST["name"];
$description = $_POST["description"];
$start = $_POST["start"];
$end = $_POST["end"];
$recurring = $_POST["recurring"];
$wholeDay = ($_POST["wholeDay"] == "true") ? 1 : 0;
$sendNotification = $_POST["sendNotification"];

//set timestamps to correct format
$start = substr($start, 0, -1); //cut off trailing "Z" from JS-ISO-String
$end = substr($end, 0, -1); //cut off trailing "Z" from JS-ISO-String
$dbPdo->query("SET time_zone = '+0:00'"); //Set MySQL's timezone to UTC (+0:00)

$updateStatement = $dbPdo->prepare("UPDATE `absence` SET `name`=:name,`description`=:description,`start`=:start,`end`=:end,`recurring`=:recurring,`wholeDay`=:wholeDay WHERE id=:absenceId;");
$updateStatement->bindValue(':absenceId', $absenceId);
$updateStatement->bindValue(':name', $name);
$updateStatement->bindValue(':description', $description);
$updateStatement->bindValue(':start', $start);
$updateStatement->bindValue(':end', $end);
$updateStatement->bindValue(':recurring', $recurring);
$updateStatement->bindValue(':wholeDay', $wholeDay);
$updateStatement->execute();

//Notification versenden
if ($sendNotification == "true") {
    $text = "Die Abwesenheit von $name wurde aktualisiert.<br> Bemerkung: $description.";
    newNotification("ABSENCE", $absenceId, "Abwesenheit $name", $text, $ownId, "UPDATE");
}

echo json_encode(array("status" => "success", "message" => "Abwesenheit aktualisiert"));
