<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("QUICK_LINK_READ");

$quickLinkId = $_GET["id"];

$selectStatement = $dbPdo->prepare("SELECT `id`, `title`, `url` FROM `quicklinks` WHERE `id` = :quickLinkId;");
$selectStatement->bindValue(':quickLinkId', $quickLinkId);
$selectStatement->execute();
$result = $selectStatement->fetch(PDO::FETCH_ASSOC);

echo json_encode($result);