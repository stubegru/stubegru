<?php
// Dieses Script gibt die Daten ALLER Nutzer zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("admin");

$toReturn = array();
$selectStatement = $dbPdo->prepare("SELECT * FROM Nutzer;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $toReturn[] = $row;
}

echo json_encode($toReturn);
