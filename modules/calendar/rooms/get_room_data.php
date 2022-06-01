<?php
// Dieses Script gibt die Daten Raums als Json Objekt zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("beratung");

$raumId = $_POST["id"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Raeume` WHERE id=:raumId;");
$selectStatement->bindValue(':raumId', $raumId);
$selectStatement->execute();
$return = $selectStatement->fetch(PDO::FETCH_ASSOC);
echo json_encode($return);
