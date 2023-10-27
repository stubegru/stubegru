<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("EVENT_TYPE_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
$ownId = $_SESSION["id"];

if (!isset($_POST["eventId"]) || !is_numeric($_POST["eventId"])) {
    echo json_encode(array("status" => "error", "message" => "Keine gültige eventId angegeben. Datensatz konnte nicht gelöscht werden."));
    exit;
} else {
    $eventId = $_POST["eventId"];
}


$selectStatement = $dbPdo->prepare("SELECT * FROM `veranstaltung` WHERE id = :eventId;");
$selectStatement->bindValue(':eventId', $eventId);
$selectStatement->execute();
$eventData = $selectStatement->fetch(PDO::FETCH_ASSOC);
$name = $eventData["name"];
$description = $eventData["description"];

//Notification versenden
$text = "Es wurde eine Veranstaltung für $name gelöscht.<br> Bemerkung: $description.";
newNotification("EVENT", $eventId, "Veranstaltung $name", $text, $ownId, "DELETE");

$deleteStatement = $dbPdo->prepare("DELETE FROM veranstaltung WHERE id = :eventId;");
$deleteStatement->bindValue(':eventId', $eventId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Veranstaltung '$name' erfolgreich gelöscht"));
