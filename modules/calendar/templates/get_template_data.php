<?php


// Dieses Script gibt die Daten ienes Templates als Json Objekt zurück



$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("beratung");
$own_id = $_SESSION['id'];

$uebergabe=($_POST["get_Data"]);

$id = $uebergabe[0];



$selectStatement = $dbPdo->prepare("SELECT * FROM `Templates` WHERE id=:id;");
$selectStatement->bindValue(':id', $id);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
$rows = array();

foreach ($resultList as $row) {
    $rows[] = $row;
}

echo json_encode($rows);



?>