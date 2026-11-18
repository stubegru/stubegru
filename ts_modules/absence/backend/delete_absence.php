<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_WRITE");

$absenceId = $_POST["id"];

$deleteStatement = $dbPdo->prepare("DELETE FROM `quicklinks` WHERE id=:absenceId;");
$deleteStatement->bindValue(':absenceId', $absenceId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Der Quicklink wurde gelöscht."));
