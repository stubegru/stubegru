<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_READ");

$dbPdo->query("SET time_zone = '+0:00'"); //Set MySQL's timezone to UTC (+0:00)
$dbPdo->query("DELETE FROM `absence` WHERE recurring = '' AND end < NOW();"); //Delete past absence entries

$selectStatement = $dbPdo->query("SELECT `id`, `name`, `description`, `start`, `end`, `recurring`, `wholeDay` FROM `absence`;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $index => $resultItem) {
    $resultList[$index]["start"] .= "Z"; //Add trailing "Z" to match ISO UTC Strings
    $resultList[$index]["end"] .= "Z"; //Add trailing "Z" to match ISO UTC Strings
    $resultList[$index]["wholeDay"] = $resultItem["wholeDay"] == 1; // 1|0 to true|false
}

echo json_encode($resultList);
