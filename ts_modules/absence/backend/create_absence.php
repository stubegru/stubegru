<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_WRITE");

$title = $_POST["title"];
$url = $_POST["url"];

$insertStatement = $dbPdo->prepare("INSERT INTO `quicklinks` (`title`,`url`) VALUES (:title,:url);");
$insertStatement->bindValue(':title', $title);
$insertStatement->bindValue(':url', $url);
$insertStatement->execute();
$absenceId = $dbPdo->lastInsertId();

echo json_encode(array("status" => "success", "message" => "Quicklink wurde erfolgreich gespeichert.", "insertId" => $absenceId));
