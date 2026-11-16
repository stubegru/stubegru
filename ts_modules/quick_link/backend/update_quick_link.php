<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICK_LINK_WRITE");

$quickLinkId = $_POST["id"];
$title = $_POST["title"];
$url = $_POST["url"];

$updateStatement = $dbPdo->prepare("UPDATE `quicklinks` SET `title` = :title, `url` = :url WHERE `id` = :id;");
$updateStatement->bindValue(':title', $title);
$updateStatement->bindValue(':url', $url);
$updateStatement->bindValue(':id', $quickLinkId);
$updateStatement->execute();

echo json_encode(array("status" => "success", "message" => "Quicklink wurde erfolgreich aktualisiert."));
