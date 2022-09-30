<?php

// Dieses Script löscht einen Artikel

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_WRITE");

$tagId = $_POST["tagId"];

//Artikel aus der wiki_artikel Tabelle löschen
$deleteStatement = $dbPdo->prepare("DELETE FROM wiki_tags WHERE id=:tagId;");
$deleteStatement->bindValue(':tagId', $tagId);
$deleteStatement->execute();

//Verknüpfung aus der Artikel <-> Tag Tabelle löschen
$deleteStatement = $dbPdo->prepare("DELETE FROM wiki_link_artikel_tags WHERE tagId=:tagId;");
$deleteStatement->bindValue(':tagId', $tagId);
$deleteStatement->execute();

echo json_encode(array("status" => "success"));
