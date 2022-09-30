<?php 
//gibt alle Artikel zurück, die Favoriten sind

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");
$own_id = $_SESSION['id'];
$returnArray = array();


//Artiekldaten aus DB laden
$testStatement = $dbPdo->prepare("SELECT count(*) FROM `wiki_artikel` WHERE wiki_artikel.id  IN (SELECT artikelID FROM wiki_link_favoriten WHERE nutzerId = :own_id);");
$testStatement->bindValue(':own_id', $own_id);
$testStatement->execute();
$rowNumbers = $testStatement->fetchColumn();
if ($rowNumbers > 0) {
    $selectStatement = $dbPdo->prepare("SELECT id,lastChanged,heading,LEFT(text,200) as preview FROM `wiki_artikel` WHERE wiki_artikel.id  IN (SELECT artikelID FROM wiki_link_favoriten WHERE nutzerId = :own_id);");
    $selectStatement->bindValue(':own_id', $own_id);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultList as $row) {
        $heading = $row["heading"];
        $preview = $row["preview"];
        $date = $row["lastChanged"];
        $articleId = $row["id"];

        $rowArray = array();
        $rowArray["heading"] = $heading;
        $rowArray["preview"] = strip_tags($preview); // strip_tags entfernt alle html tags in dem String
        $rowArray["date"] = $date;
        $rowArray["articleId"] = $articleId;
        
        //ZeilenArray zum returnArray hinzufügen
        $returnArray[] = $rowArray;
    }
}

//Achtung, wenn in einem Array Eintrag ein Umlaut vorkommen funktioniert das nicht mehr.
echo json_encode($returnArray);
 
?>