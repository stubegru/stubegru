<?php

// Dieses Script gibt html Text, mit allen Wiki Tags zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");
$own_id = $_SESSION['id'];
$returnArray = array();

$selectStatement = $dbPdo->prepare("SELECT * FROM `wiki_tags`;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $name = $row["name"];
    $id = $row["id"];
    $returnArray[] = array("name" => $name, "id" => $id);
}

echo json_encode($returnArray);
