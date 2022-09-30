<?php
// Dieses Script gibt die Daten Raums als Json Objekt zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");

$raumId = $_POST["id"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Raeume` WHERE id=:raumId;");
$selectStatement->bindValue(':raumId', $raumId);
$selectStatement->execute();
$return = $selectStatement->fetch(PDO::FETCH_ASSOC);
echo json_encode($return);
