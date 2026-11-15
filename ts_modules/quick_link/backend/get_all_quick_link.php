<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICK_LINK_READ");

$selectStatement = $dbPdo->query("SELECT `id`, `text`, `link` FROM `Quicklinks`;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);