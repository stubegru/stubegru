<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICK_LINK_WRITE");

$text = $_POST["text"];
$link = $_POST["link"];

$insertStatement = $dbPdo->prepare("INSERT INTO `Quicklinks` (`text`,`link`) VALUES (:text,:link);");
$insertStatement->bindValue(':text', $text);
$insertStatement->bindValue(':link', $link);
$insertStatement->execute();
$quickLinkId = $dbPdo->lastInsertId();

echo json_encode(array("status" => "success", "message" => "Quicklink wurde erfolgreich gespeichert.", "insertId" => $quickLinkId));
