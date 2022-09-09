<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("beratung");
$own_id = $_SESSION['id'];

$id = $_POST["templateId"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Templates` WHERE id=:id;");
$selectStatement->bindValue(':id', $id);
$selectStatement->execute();
$result = $selectStatement->fetch(PDO::FETCH_ASSOC);
echo json_encode($result);
