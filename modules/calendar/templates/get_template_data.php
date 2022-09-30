<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");
$own_id = $_SESSION['id'];

$id = $_POST["templateId"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Templates` WHERE id=:id;");
$selectStatement->bindValue(':id', $id);
$selectStatement->execute();
$result = $selectStatement->fetch(PDO::FETCH_ASSOC);
echo json_encode($result);
