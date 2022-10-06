<?php
// Dieses Script gibt die Daten ALLER Nutzer zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("USER_READ");

$selectStatement = $dbPdo->query("SELECT `id`, `name`, `mail`, `account`, `role`, `erfassungsdatum`, `erfasser` FROM `Nutzer`;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultLists);
