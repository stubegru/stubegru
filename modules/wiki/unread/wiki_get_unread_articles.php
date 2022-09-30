<?php 
//gibt alle Artikel zurück, die noch nicht gelesen wurden

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");
$own_id = $_SESSION['id'];
$returnArray = array();


//Artiekldaten aus DB laden
//Die Abfrage sucht alle Artikeldaten aus der wiki_artikel Tabelle, wobei die artikelId in der wiki_artikel Tabelle existiert, aber keine Verknüpfung zu der Nutzerid in der wiki_link_gelesen Tabelle existiert
$selectStatement = $dbPdo->prepare("SELECT id,lastChanged,heading,LEFT(text,200) as preview FROM `wiki_artikel` WHERE wiki_artikel.id IN (SELECT id FROM wiki_artikel WHERE id NOT IN (SELECT artikelID FROM wiki_link_gelesen WHERE nutzerId = :own_id)) ORDER BY lastChanged DESC;");
$selectStatement->bindValue(':own_id', $own_id);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

if ($resultList != false) {
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