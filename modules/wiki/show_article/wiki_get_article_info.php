<?php
//gibt Titel, Inhalt und Tags eines Artikels zurück

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/wiki/show_article/wikiword_helper.php";

$own_id = $_SESSION['id'];
$artikelId = $_POST["articleId"];

$tagsArray = array();
$myReturnArray = array();

//Artiekldaten aus DB laden
$selectStatement = $dbPdo->prepare("SELECT * FROM `wiki_artikel` WHERE id = :artikelId;");
$selectStatement->bindValue(':artikelId', $artikelId);
$selectStatement->execute();
$row = $selectStatement->fetch(PDO::FETCH_ASSOC);

if ($row == false) {
    $myReturnArray["status"] = "error";
    $myReturnArray["error"] = "Article $artikelId not found";
    exit;
}

$heading = $row["heading"];
$text = $row["text"];
$date = $row["lastChanged"];
$reminderDate = $row["reminderDate"];
$reminderText = $row["reminderText"];
$showInSidebar = $row["showInSidebar"];

$text = autolinkWikiwords($artikelId, $text, "WIKI_ARTICLE");

//zugehörige Tags laden
$selectStatement = $dbPdo->prepare("SELECT wiki_tags . *
FROM wiki_artikel, wiki_tags, wiki_link_artikel_tags
WHERE wiki_artikel.id = wiki_link_artikel_tags.artikelId
AND wiki_tags.id = wiki_link_artikel_tags.tagId
AND wiki_artikel.id =:artikelId ORDER BY wiki_tags.name");
$selectStatement->bindValue(':artikelId', $artikelId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $tagName = $row["name"];
    $tagId = $row["id"];
    $tagsArray[] = array("tagId" => $tagId, "tagName" => $tagName);
}

//Prüfen, ob Favorit
$testStatement = $dbPdo->prepare("SELECT count(*) FROM `wiki_link_favoriten` WHERE `nutzerId`='$own_id' AND `artikelId` = :artikelId;");
$testStatement->bindValue(':artikelId', $artikelId);
$testStatement->execute();
$rowNumbers = $testStatement->fetchColumn();
if ($rowNumbers > 0) {
    $myReturnArray["favorite"] = "true";
} else {
    $myReturnArray["favorite"] = "false";
}

$myReturnArray["status"] = "success";
$myReturnArray["tags"] = $tagsArray;
$myReturnArray["heading"] = $heading;
$myReturnArray["text"] = $text;
$myReturnArray["date"] = $date;
$myReturnArray["reminderDate"] = $reminderDate;
$myReturnArray["reminderText"] = $reminderText;
$myReturnArray["showInSidebar"] = $showInSidebar;


//Achtung, wenn in einem Array Eintrag ein Umlaut vorkommen funktioniert das nicht mehr.
echo json_encode($myReturnArray);
