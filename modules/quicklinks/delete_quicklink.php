<?php
// Dieses Script löscht einen Quicklink
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("admin");

$quicklinkId = $_POST["id"];

$deleteStatement = $dbPdo->prepare("DELETE FROM Quicklinks WHERE id=:quicklinkId;");
$deleteStatement->bindValue(':quicklinkId', $quicklinkId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "id" => $quicklinkId));
