<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$selectStatement = $dbPdo->query("SELECT `titel`,`id`,`kanal` FROM `Raeume` WHERE `aktiv`='1';");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($resultList);
