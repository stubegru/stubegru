<?php
// Dieses Script gibt eine Liste aller bekannten Erlaubnis-Stufen zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$permissions = array();
$selectStatement = $dbPdo->prepare("SELECT * FROM Rechte;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $permissions[] = $row;
}

echo json_encode($permissions);
