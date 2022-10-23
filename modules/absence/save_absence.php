<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$ownId = $_SESSION["id"];

$mode = $_POST["mode"];
if ($mode == "update") {
    $absenceId = $_POST["id"];
}
$name = $_POST["name"];
$description = $_POST["description"];
$start = $_POST["start"];
$end = $_POST["end"];
$recurring = $_POST["recurring"];
$wholeDay = $_POST["wholeDay"];
$notification = $_POST["notification"];

//set timestamps to correct format
$start = substr($start, 0, -1); //cut off trailing "Z" from JS-ISO-String
$end = substr($end, 0, -1); //cut off trailing "Z" from JS-ISO-String
$dbPdo->query("SET time_zone = '+0:00'"); //Set MySQL's timezone to UTC (+0:00)


$toReturn = array();


if ($mode == "create") {

    $insertStatement = $dbPdo->prepare("INSERT INTO `Abwesenheiten`(`name`, `description`, `start`, `end`, `recurring`, `wholeDay`) VALUES (:name,:description,:start,:end,:recurring,:wholeDay);");
    $insertStatement->bindValue(':name', $name);
    $insertStatement->bindValue(':description', $description);
    $insertStatement->bindValue(':start', $start);
    $insertStatement->bindValue(':end', $end);
    $insertStatement->bindValue(':recurring', $recurring);
    $insertStatement->bindValue(':wholeDay', $wholeDay);
    $insertStatement->execute();
    $newAbsenceId = $dbPdo->lastInsertId();

    //Notification versenden
    if ($notification == "1") {
        $text = "Es wurde eine neue Abwesenheit für $name erstellt.<br> Bemerkung: $description.";
        newNotification("ABSENCE",$newAbsenceId,"Abwesenheit $name",$text,$ownId,"CREATE");
    }

    $toReturn["message"] = "Neue Abwesenheit hinzugefügt";
    $toReturn["id"] = $newAbsenceId;
    $toReturn["status"] = "success";
} else if (is_numeric($absenceId)) {

    $updateStatement = $dbPdo->prepare("UPDATE `Abwesenheiten` SET `name`=:name,`description`=:description,`start`=:start,`end`=:end,`recurring`=:recurring,`wholeDay`=:wholeDay WHERE id=:absenceId;");
    $updateStatement->bindValue(':absenceId', $absenceId);
    $updateStatement->bindValue(':name', $name);
    $updateStatement->bindValue(':description', $description);
    $updateStatement->bindValue(':start', $start);
    $updateStatement->bindValue(':end', $end);
    $updateStatement->bindValue(':recurring', $recurring);
    $updateStatement->bindValue(':wholeDay', $wholeDay);
    $updateStatement->execute();

    //Notification versenden
    if ($notification == "1") {
        $text = "Die Abwesenheit von $name wurde aktualisiert.<br> Bemerkung: $description.";
        newNotification("ABSENCE",$absenceId,"Abwesenheit $name",$text,$ownId,"UPDATE");
    }

    $toReturn["message"] = "Änderungen der Abwesenheit gespeichert";
    $toReturn["status"] = "success";
} else {
    $toReturn["message"] = "Fehler beim speichern der Abwesenheit. Die übergebene Id '$absenceId' ist ungültig.";
    $toReturn["status"] = "error";
}

echo json_encode($toReturn);
