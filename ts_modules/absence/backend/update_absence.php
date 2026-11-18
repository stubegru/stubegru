<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_WRITE");

$absenceId = $_POST["id"];
$title = $_POST["title"];
$url = $_POST["url"];

$updateStatement = $dbPdo->prepare("UPDATE `quicklinks` SET `title` = :title, `url` = :url WHERE `id` = :id;");
$updateStatement->bindValue(':title', $title);
$updateStatement->bindValue(':url', $url);
$updateStatement->bindValue(':id', $absenceId);
$updateStatement->execute();

echo json_encode(array("status" => "success", "message" => "Quicklink wurde erfolgreich aktualisiert."));
