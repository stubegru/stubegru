<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("SPAM_FILTER_READ");

$selectStatement = $dbPdo->query("SELECT * FROM `spam_filter`;");
$spamFilterData = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($spamFilterData);