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

$insertStatement = $dbPdo->prepare("INSERT INTO `absence`(`name`, `description`, `start`, `end`, `recurring`, `wholeDay`) VALUES (:name,:description,:start,:end,:recurring,:wholeDay);");
$insertStatement->bindValue(':name', $name);
$insertStatement->bindValue(':description', $description);
$insertStatement->bindValue(':start', $start);
$insertStatement->bindValue(':end', $end);
$insertStatement->bindValue(':recurring', $recurring);
$insertStatement->bindValue(':wholeDay', $wholeDay);
$insertStatement->execute();
$newAbsenceId = $dbPdo->lastInsertId();

//Notification versenden
if ($sendNotification == "true") {
    $text = "Es wurde eine neue Abwesenheit für $name erstellt.<br> Bemerkung: $description.";
    newNotification("ABSENCE", $newAbsenceId, "Abwesenheit $name", $text, $ownId, "CREATE");
}

echo json_encode(array("status" => "success", "message" => "Neue Abwesenheit hinzugefügt"));
