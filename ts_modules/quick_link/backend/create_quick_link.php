<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICK_LINK_WRITE");

$title = $_POST["title"];
$url = $_POST["url"];

$insertStatement = $dbPdo->prepare("INSERT INTO `quicklinks` (`title`,`url`) VALUES (:title,:url);");
$insertStatement->bindValue(':title', $title);
$insertStatement->bindValue(':url', $url);
$insertStatement->execute();
$quickLinkId = $dbPdo->lastInsertId();

echo json_encode(array("status" => "success", "message" => "Quicklink wurde erfolgreich gespeichert.", "insertId" => $quickLinkId));
