<?php
// Dieses Script löscht ein Template
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_WRITE");

$id=$_POST["templateId"]; //Id des zu löschenden Templates

$deleteStatement = $dbPdo->prepare("DELETE FROM Templates WHERE id=:id;");
$deleteStatement->bindValue(':id', $id);
$deleteStatement->execute();
echo json_encode(array("status" => "success", "message" => "Template gelöscht"));
