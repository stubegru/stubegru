<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_READ");

$absenceId = $_GET["id"];
$dbPdo->query("SET time_zone = '+0:00'"); //Set MySQL's timezone to UTC (+0:00)

$selectStatement = $dbPdo->prepare("SELECT `id`, `name`, `description`, `start`, `end`, `recurring`, `wholeDay` FROM `absence` WHERE `id` = :absenceId;");
$selectStatement->bindValue(':absenceId', $absenceId);
$selectStatement->execute();
$result = $selectStatement->fetch(PDO::FETCH_ASSOC);

$result["start"] .= "Z"; //Add trailing "Z" to match ISO UTC Strings
$result["end"] .= "Z"; //Add trailing "Z" to match ISO UTC Strings
$result["wholeDay"] = $result["wholeDay"] == 1; // 1|0 to true|false


echo json_encode($result);
