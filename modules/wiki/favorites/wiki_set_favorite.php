<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");

$userId = $_SESSION["id"];
$articleId = $_POST["articleId"];
$mode = $_POST["action"]; //"remove" wenn Favorit entfernt werden soll,  "add" wenn Favorit hinzugefügt werden soll

$returnArray = array();

if ($mode == "add") {
    $insertStatement = $dbPdo->prepare("INSERT IGNORE INTO `wiki_link_favoriten` (`nutzerId`, `artikelId`) VALUES (:userId, :articleId);");
    $insertStatement->bindValue(':userId', $userId);
    $insertStatement->bindValue(':articleId', $articleId);
    $insertStatement->execute();
    $articleId = $dbPdo->lastInsertId();
    $returnArray["status"] = "success";
    $returnArray["action"] = "added";
} else if ($mode == "remove") {
    $deleteStatement = $dbPdo->prepare("DELETE FROM `wiki_link_favoriten` WHERE `nutzerId` = :userId AND `artikelId` = :articleId;");
    $deleteStatement->bindValue(':userId', $userId);
    $deleteStatement->bindValue(':articleId', $articleId);
    $deleteStatement->execute();
    $returnArray["status"] = "success";
    $returnArray["action"] = "removed";
} else {
    $returnArray["status"] = "error";
    $returnArray["message"] = "Please use 'add' or 'remove' as action";
}

echo json_encode($returnArray);
