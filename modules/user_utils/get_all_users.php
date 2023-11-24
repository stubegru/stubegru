<?php
// Dieses Script gibt die Daten ALLER Nutzer zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("USER_READ");

$selectStatement = $dbPdo->query("SELECT `id`, `name`, `mail`, `account`, `role`, `erfassungsdatum`, `erfasser` FROM `Nutzer`;");
$userList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

//index by user's id
$resultList = array();
foreach ($userList as $user) {
   $resultList[$user["id"]] = $user;
}

echo json_encode($resultList);
