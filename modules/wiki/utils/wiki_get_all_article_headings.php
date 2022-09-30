<?php

// Dieses Script gibt eine JSON Objekt mit den Titeln aller Wiki Artikel

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");

$toReturn = array();

$selectStatement = $dbPdo->prepare("SELECT heading FROM `wiki_artikel`;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $heading = $row["heading"];
    $toReturn[] = $heading;
}

echo json_encode($toReturn);


?>