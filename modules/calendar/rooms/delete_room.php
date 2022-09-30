<?php
// Dieses Script löscht einen Raum
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_WRITE");

$raumId = $_POST["id"];
$deleteStatement = $dbPdo->prepare("DELETE FROM Raeume WHERE id=:raumId;");
$deleteStatement->bindValue(':raumId', $raumId);
$deleteStatement->execute();


echo json_encode(array("status" => "success", "message" => "Löschen erfolgreich."));
