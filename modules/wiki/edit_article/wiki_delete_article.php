<?php
// Dieses Script löscht einen Artikel
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$own_id = $_SESSION['id'];

$id = $_POST["id"]; //Id des zu löschenden Artikels

$selectStatement = $dbPdo->prepare("SELECT * FROM `wiki_artikel` WHERE id=:newsId;");
$selectStatement->bindValue(':newsId', $id);
$selectStatement->execute();
$row = $selectStatement->fetch(PDO::FETCH_ASSOC);
if($row == false) {
    $toReturn = array();
    $toReturn["status"] = "error";
    $toReturn["message"] = "Der Artikel mit der ID $id konnte nicht gefunden werden.";
    echo json_encode($toReturn);
    exit;
}
    $titel = $row["heading"];
    //do sth with the data...
    $deleteStatement = $dbPdo->prepare("DELETE FROM wiki_artikel WHERE id = :newsId;");
    $deleteStatement->bindValue(':newsId', $id);
    $deleteStatement->execute();

    $deleteStatement = $dbPdo->prepare("DELETE FROM wiki_link_artikel_tags WHERE artikelId = :newsId;");
    $deleteStatement->bindValue(':newsId', $id);
    $deleteStatement->execute();

    $deleteStatement = $dbPdo->prepare("DELETE FROM wiki_link_favoriten WHERE artikelId = :newsId;");
    $deleteStatement->bindValue(':newsId', $id);
    $deleteStatement->execute();

    $deleteStatement = $dbPdo->prepare("DELETE FROM wiki_link_gelesen WHERE artikelId = :newsId;");
    $deleteStatement->bindValue(':newsId', $id);
    $deleteStatement->execute();

    //Notification versenden
    $notificationText = "Dieser Wiki Artikel wurde gelöscht.";
    newNotification("WIKI_ARTICLE", $id, $titel, $notificationText, $own_id, "DELETE");

    $toReturn = array();
    $toReturn["status"] = "success";
    $toReturn["title"] = "Gelöscht";
    $toReturn["message"] = "Der Artikel wurde erfolgreich gelöscht. Alle Verknüpfungen mit diesem Artikel wurden entfernt.";
    echo json_encode($toReturn);


