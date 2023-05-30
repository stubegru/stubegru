<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_WRITE");

$dateId = $_POST["id"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id`=:dateId;");
$selectStatement->bindValue(':dateId', $dateId);
$selectStatement->execute();
$meetingData = $selectStatement->fetch(PDO::FETCH_ASSOC);

if (!$meetingData) {
    echo json_encode(array("status" => "error", "message" => "Löschen des Termins fehlgeschlagen. Der Termin konnte nicht gefunden werden. Vermutlich wurde er bereits gelöscht."));
    exit;
}

//check if this meeting is still assigned to anybody
if ($meetingData["teilnehmer"] != "") {
    $clientId = $meetingData["teilnehmer"];
    echo json_encode(array("status" => "error", "message" => "Löschen des Termins fehlgeschlagen. Der Termin ist noch noch an einen Kunden mit der ID '$clientId' vergeben. Bitte zuerst die Kundendaten löschen."));
    exit;
}

$deleteStatement = $dbPdo->prepare("DELETE FROM Termine WHERE id=:dateId;");
$deleteStatement->bindValue(':dateId', $dateId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Termin erfolgreich gelöscht."));
