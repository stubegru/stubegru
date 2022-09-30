<?php
// Dieses Script gibt html Text aller Artikel zurück, die den Falg showInSidebar in der wiki_article tabelle gesetzt haben
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");
require_once "$BASE_PATH/modules/wiki/show_article/wikiword_helper.php";

$toReturn = array();

$selectStatement = $dbPdo->prepare("SELECT `id`,`text` FROM `wiki_artikel` WHERE showInSidebar = '1';");
// $selectStatement->bindValue(':newsId', $id);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $text = $row["text"];
    $artikelId = $row["id"];
    
    $text = autolinkWikiwords($artikelId,$text,"WIKI_ARTICLE");
    
    $toReturn[] = $text;
}

echo json_encode($toReturn);


?>