<?php

// Dieses Script löscht die Verknüpfung des aktuellen Users zu einer Notification. Die Notification ist damit für den aktuellen User gelöscht.
$BASE_PATH = getenv("BASE_PATH");
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/utils/constants.php";

$own_id = $_SESSION['id'];
$notificationId = $_POST["notificationId"];

if (is_numeric($notificationId)) {
    //Verknüpfung zwischen aktuellem User und Benachrichtigung aufheben
    $deleteStatement = $dbPdo->prepare("DELETE FROM `notification_user` WHERE  notificationId=:notificationId AND userId=:ownId;");
    $deleteStatement->bindValue(':notificationId', $notificationId);
    $deleteStatement->bindValue(':ownId', $own_id);
    $deleteStatement->execute();
} else {
    if ($notificationId == $constants["all"]) {
        //Verknüpfung zwischen aktuellem User und Benachrichtigung aufheben
        $deleteStatement = $dbPdo->prepare("DELETE FROM `notification_user` WHERE userId=:ownId;");
        $deleteStatement->bindValue(':ownId', $own_id);
        $deleteStatement->execute();
    } else if ($notificationId == $constants["all_read"]) {
        //Verknüpfung zwischen aktuellem User und Benachrichtigung aufheben
        $deleteStatement = $dbPdo->prepare("DELETE FROM `notification_user` WHERE notification_user.read=1 AND userId=:ownId;");
        $deleteStatement->bindValue(':ownId', $own_id);
        $deleteStatement->execute();
    } else {
        echo json_encode(array("status" => "error", "message" => "Bitte gültige notification Id angeben [number|'all'|'all_read']"));
        exit;
    }
}

echo json_encode(array("status" => "success", "message" => "Notification für user gelöscht!"));
