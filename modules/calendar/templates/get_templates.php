<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION['id'];

$selectStatement = $dbPdo->query("SELECT * FROM `Templates` ORDER BY titel ASC;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($resultList);
