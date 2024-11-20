<?php
// Dieses Script gibt eine Liste aller bekannten Erlaubnis-Stufen zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("USER_READ");

$selectStatement = $dbPdo->query("SELECT * FROM `permissions`;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);