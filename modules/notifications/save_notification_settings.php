<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$own_id = $_SESSION["id"];
$json = $_POST["subList"];
$subList = json_decode($json,true);

//Remove all entries with current userId
$deleteStatement = $dbPdo->prepare("DELETE FROM `notification_type_user` WHERE userId = :userId;");
$deleteStatement->bindValue(':userId', $own_id);
$deleteStatement->execute();

//Insert new datasets
$insertStatement = $dbPdo->prepare("INSERT INTO `notification_type_user` (`userId`,`notificationType`,`online`,`mail`) VALUES (:userId,:type,:online,:mail);");

foreach ($subList as $channel) {
    $type = $channel["id"];
    $online = $channel["online"] ? "1" : "0";
    $mail = $channel["mail"] ? "1" : "0";

    $insertStatement->bindValue(':userId', $own_id);
    $insertStatement->bindValue(':type', $type);
    $insertStatement->bindValue(':online', $online);
    $insertStatement->bindValue(':mail', $mail);
    $insertStatement->execute();
}

echo json_encode(array("status" => "success", "message" => "Änderungen gespeichert!"));
