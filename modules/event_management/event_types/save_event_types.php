<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("EVENT_TYPE_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$ownId = $_SESSION["id"];

$mode = $_POST["mode"];
if ($mode == "update") {
    $eventId = $_POST["id"];
}
$name = $_POST["name"];
$description = $_POST["description"];
$dbPdo->query("SET time_zone = '+0:00'"); //Set MySQL's timezone to UTC (+0:00)

$toReturn = array();


if ($mode == "create") {

    $insertStatement = $dbPdo->prepare("INSERT INTO `veranstaltung`(`name`, `description`) VALUES (:name,:description);");
    $insertStatement->bindValue(':name', $name);
    $insertStatement->bindValue(':description', $description);
    $insertStatement->execute();
    $newEventId = $dbPdo->lastInsertId();


    $toReturn["message"] = "Neue Veranstaltung hinzugefügt";
    $toReturn["id"] = $newEventId;
    $toReturn["status"] = "success";

} else if (is_numeric($eventId)) {

    $updateStatement = $dbPdo->prepare("UPDATE `veranstaltung` SET `name`=:name,`description`=:description WHERE id=:eventId;");
    $updateStatement->bindValue(':eventId', $eventId);
    $updateStatement->bindValue(':name', $name);
    $updateStatement->bindValue(':description', $description);

    $updateStatement->execute();

    $toReturn["message"] = "Änderungen der Veranstaltung gespeichert";
    $toReturn["status"] = "success";
} else {
    $toReturn["message"] = "Fehler beim speichern der Veranstaltung. Die übergebene Id 'eventId' ist ungültig.";
    $toReturn["status"] = "error";
}

echo json_encode($toReturn);

