<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";

if (!isset($_POST["id"])) {
    echo json_encode(array("status" => "error", "message" => "Keine gültige absenceId angegeben. Datensatz konnte nicht gelöscht werden."));
    exit;
}

$ownId = $_SESSION["id"];
$absenceId = $_POST["id"];


$selectStatement = $dbPdo->prepare("SELECT  `name`, `description` FROM `absence` WHERE `id` = :absenceId;");
$selectStatement->bindValue(':absenceId', $absenceId);
$selectStatement->execute();
$absenceData = $selectStatement->fetch(PDO::FETCH_ASSOC);
$name = $absenceData["name"];
$description = $absenceData["description"];

//Notification versenden
$text = "Es wurde eine Abwesenheit für $name gelöscht.<br> Bemerkung: $description.";
newNotification("ABSENCE", $absenceId, "Abwesenheit $name", $text, $ownId, "DELETE");

$deleteStatement = $dbPdo->prepare("DELETE FROM absence WHERE id = :absenceId;");
$deleteStatement->bindValue(':absenceId', $absenceId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Abwesenheit '$name' erfolgreich gelöscht"));
