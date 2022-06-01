<?php

// Dieses Script gibt html Text, mit den Quicklinks zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION['id'];

$selectStatement = $dbPdo->query("SELECT * FROM `Quicklinks`;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);
