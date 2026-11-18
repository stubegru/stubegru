<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
$ownId = $_SESSION["id"];

if (!isset($_POST["absenceId"]) || !is_numeric($_POST["absenceId"])) {
    echo json_encode(array("status" => "error", "message" => "Keine gültige absenceId angegeben. Datensatz konnte nicht gelöscht werden."));
    exit;
} else {
    $absenceId = $_POST["absenceId"];
}


$selectStatement = $dbPdo->prepare("SELECT * FROM `Abwesenheiten` WHERE id = :absenceId;");
$selectStatement->bindValue(':absenceId', $absenceId);
$selectStatement->execute();
$absenceData = $selectStatement->fetch(PDO::FETCH_ASSOC);
$name = $absenceData["name"];
$description = $absenceData["description"];

//Notification versenden
$text = "Es wurde eine Abwesenheit für $name gelöscht.<br> Bemerkung: $description.";
newNotification("ABSENCE",$absenceId,"Abwesenheit $name",$text,$ownId,"DELETE");

$deleteStatement = $dbPdo->prepare("DELETE FROM Abwesenheiten WHERE id = :absenceId;");
$deleteStatement->bindValue(':absenceId', $absenceId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Abwesenheit '$name' erfolgreich gelöscht"));
