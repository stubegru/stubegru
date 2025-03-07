<?php
//Liefert alle Artikel Datensätze

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");

$selectStatement = $dbPdo->prepare("SELECT heading,lastChanged,id,visited FROM wiki_artikel ORDER BY heading ASC;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);
