<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");

$selectStatement = $dbPdo->query("SELECT * FROM `Raeume` WHERE `aktiv`='1' ORDER BY titel ASC;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($resultList);
