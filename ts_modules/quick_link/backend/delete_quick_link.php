<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICK_LINK_WRITE");

$quickLinkId = $_POST["id"];

$deleteStatement = $dbPdo->prepare("DELETE FROM `quicklinks` WHERE id=:quickLinkId;");
$deleteStatement->bindValue(':quickLinkId', $quickLinkId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Der Quicklink wurde gelöscht."));
