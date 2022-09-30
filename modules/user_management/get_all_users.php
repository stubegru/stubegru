<?php
// Dieses Script gibt die Daten ALLER Nutzer zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("USER_READ");

$toReturn = array();
$selectStatement = $dbPdo->prepare("SELECT * FROM Nutzer;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $toReturn[] = $row;
}

echo json_encode($toReturn);
