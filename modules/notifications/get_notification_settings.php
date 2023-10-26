<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION["id"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `notification_type_user` WHERE userId = :userId;");
$selectStatement->bindValue(":userId", $own_id);
$selectStatement->execute();
$subList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

//convert sublist to array with notification types as keys
$subArray = array();
foreach ($subList as $sub) {
    $subArray[$sub["notificationType"]] = $sub;
    //echo "Added sub for " . $sub["notificationType"];
}

$selectStatement = $dbPdo->query("SELECT * FROM `notification_types`;");
$typeList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

//add info about online/mail subscription to typeList
foreach ($typeList as &$type) {
    $typeId = $type["id"];
    if (isset($subArray[$typeId])) {
        $type["online"] = $subArray[$typeId]["online"] ? true : false;
        $type["mail"] = $subArray[$typeId]["mail"] ? true : false;
    } else { //if this notificationType is not set for this user -> handle as NOT subscribed
        $type["online"] = false;
        $type["mail"] = false;
    }
}

echo json_encode($typeList);
