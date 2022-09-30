<?php

// Dieses Script speichert einen neuen Eintrag für einen Quicklink
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICKLINK_WRITE");

$title = $_POST["title"];
$url = $_POST["url"];

$insertStatement = $dbPdo->prepare("INSERT INTO `Quicklinks` (`text`,`link`) VALUES (:title,:url);");
$insertStatement->bindValue(':title', $title);
$insertStatement->bindValue(':url', $url);
$insertStatement->execute();
$quickLinkId = $dbPdo->lastInsertId();

echo json_encode(array("status" => "success", "message" => "Quicklink wurde mit der id $quickLinkId eingefügt."));
