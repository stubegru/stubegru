<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("SPAM_FILTER_READ");

$spamFilterId = $_GET["id"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `spam_filter` WHERE id = :spamFilterId;");
$selectStatement->bindValue(':spamFilterId', $spamFilterId);
$selectStatement->execute();
$spamFilterData = $selectStatement->fetch(PDO::FETCH_ASSOC);

echo json_encode($spamFilterData);
