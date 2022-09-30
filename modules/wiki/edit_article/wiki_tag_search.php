<?php
// Dieses Script gibt alle zum Suchbegriff passenden Tags zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");
$own_id = $_SESSION['id'];

$search = $_POST["query"];
$finalArray = array();

$selectStatement = $dbPdo->prepare("SELECT * FROM `wiki_tags` WHERE `name` LIKE :search ORDER BY name;");
$selectStatement->bindValue(':search', "%$search%");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $rowArray = array();
    $rowArray["tagId"] = $row["id"];
    $rowArray["tagName"] = $row["name"];
    $finalArray[] = $rowArray;
}

echo json_encode($finalArray);
