<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
$own_id = $_SESSION['id'];
$notificationId = $_POST["notificationId"]; //"all" => alle

//[Aufräumen] Lösche alle Notifications, die älter als 2 Monate sind
require_once "$BASE_PATH/modules/notifications/delete_old_notifications.php";

//Prüfen, ob alle oder ein bestimmter Datensatz geholt werden soll
if ($notificationId == "all") {
    //hohle alle Benachrichtigungen
    $selectStatement = $dbPdo->prepare("SELECT notifications . * , notification_user.read FROM notifications, notification_user WHERE notifications.id = notification_user.notificationId AND notification_user.userId = :ownId ORDER BY `timestamp` DESC;");
    $selectStatement->bindValue(':ownId', $own_id);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
} else if (is_numeric($notificationId)) {
    //hohle eine spezielle Benachrichtigung
    $selectStatement = $dbPdo->prepare("SELECT notifications.* , notification_user.read FROM notifications, notification_user WHERE notifications.id=:notificationId AND notification_user.userId = :ownId LIMIT 1;");
    $selectStatement->bindValue(':ownId', $own_id);
    $selectStatement->bindValue(':notificationId', $notificationId);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
} else {
    echo json_encode(array("status" => "error", "message" => "Bitte eine id oder \"all\" als absenceId uebergeben"));
    exit;
}

//load details about notification types
$nTypesQuery = $dbPdo->query("SELECT * FROM notification_types;");
$nTypesList = $nTypesQuery->fetchAll(PDO::FETCH_ASSOC);
//index by id
$notificationTypes = array();
foreach ($nTypesList as $row) {
    $notificationTypes[$row["id"]] = $row;
}

$allUsers = getUserList(); //from user_utils.php

foreach ($resultList as &$row) {
    $row["userName"] = "unknown";
    if (isset($allUsers[$row["userId"]])) {
        $row["userName"] = $allUsers[$row["userId"]]["name"];
    }
    $row["read"] = $row["read"] ? true : false;
    $row["type"] = $notificationTypes[$row["type"]];
}

echo json_encode($resultList);
