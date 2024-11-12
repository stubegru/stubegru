<?php
// Dieses Script gibt alle zum Suchbegriff passenden Artikel und Tags zurück
$BASE_PATH = getenv("BASE_PATH");
require_once("$BASE_PATH/utils/auth_and_database.php");
permissionRequest("WIKI_READ");



$search = $_POST["searchQuery"];
$tagResults = array();
$headlineResults = array();
$textResults = array();


//Tags
$selectStatement = $dbPdo->prepare("SELECT * FROM `wiki_tags` WHERE `name` LIKE :search ORDER BY name;");
$selectStatement->bindValue(':search', "%$search%");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $rowArray = array();
    $rowArray["tagId"] = $row["id"];
    $rowArray["tagName"] = $row["name"];
    $tagResults[] = $rowArray;
}


//Headlines
$selectStatement = $dbPdo->prepare("SELECT LEFT(text,100) as textPrev ,id,heading FROM `wiki_artikel` WHERE `heading` LIKE :search ORDER BY heading;");
$selectStatement->bindValue(':search', "%$search%");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $rowArray = array();
    $rowArray["articleId"] = $row["id"];
    $rowArray["articleHeading"] = $row["heading"];
    $rowArray["articleText"] = strip_tags($row["textPrev"]);
    $headlineResults[] = $rowArray;
}

//Volltext
$selectStatement = $dbPdo->prepare("SELECT LEFT(text,100) as textPrev ,id,heading FROM `wiki_artikel` WHERE `text` LIKE :search ORDER BY heading;");
$selectStatement->bindValue(':search', "%$search%");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $rowArray = array();
    $rowArray["articleId"] = $row["id"];
    $rowArray["articleHeading"] = $row["heading"];
    $rowArray["articleText"] = strip_tags($row["textPrev"]);
    $textResults[] = $rowArray;
}

$finalArray = array("tags" => $tagResults, "headings" => $headlineResults, "text" => $textResults);

echo json_encode($finalArray);
