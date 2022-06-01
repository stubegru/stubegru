<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$tagId = $_POST["tagId"];

$returnArray = array();

$selectStatement = $dbPdo->prepare("SELECT * FROM wiki_tags WHERE id =:tagId;");
$selectStatement->bindValue(':tagId', $tagId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $tagName = $row["name"];
    $returnArray["tagId"] = $tagId;
    $returnArray["tagName"] = $tagName;
}

//alle Artikel Datensätze, die in der wiki_link_artikel_tags Tabelle mit der übergebenen tag-Id verknüpft sind
$returnArray["articles"] = array();
$selectStatement = $dbPdo->prepare("SELECT wiki_artikel . *
FROM wiki_artikel, wiki_tags, wiki_link_artikel_tags
WHERE wiki_artikel.id = wiki_link_artikel_tags.artikelId
AND wiki_tags.id = wiki_link_artikel_tags.tagId
AND wiki_tags.id =:tagId;");
$selectStatement->bindValue(':tagId', $tagId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $titel = $row["heading"];
    $preview = $row["text"];
    $artikelId = $row["id"];
    $preview = substr($preview, 0, 400);
    $preview = strip_tags($preview); // strip_tags entfernt alle html tags in dem String
    $preview .= "...";
    $returnArray["articles"][] = array("title" => $titel, "preview" => $preview, "id" => $artikelId);
}

echo json_encode($returnArray);
