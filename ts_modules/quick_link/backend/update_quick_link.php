<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICK_LINK_WRITE");

$quickLinkId = $_POST["id"];
$text = $_POST["text"];
$link = $_POST["link"];

$updateStatement = $dbPdo->prepare("UPDATE `Quicklinks` SET `text` = :text, `link` = :link WHERE `id` = :id;");
$updateStatement->bindValue(':text', $text);
$updateStatement->bindValue(':link', $link);
$updateStatement->bindValue(':id', $quickLinkId);
$updateStatement->execute();

echo json_encode(array("status" => "success", "message" => "Quicklink wurde erfolgreich aktualisiert."));
