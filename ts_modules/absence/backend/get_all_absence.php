<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_READ");

$selectStatement = $dbPdo->query("SELECT `id`, `title`, `url` FROM `quicklinks` ORDER BY `title` ASC;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);