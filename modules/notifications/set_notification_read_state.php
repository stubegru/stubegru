<?php

// Dieses Script markiert eine Notification für den aktuellen Nutzer als Gelesen oder ungelesen

$BASE_PATH = getenv("BASE_PATH");
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/utils/constants.php";

$own_id = $_SESSION['id'];
$notificationId=$_POST["notificationId"];
$markAs = $_POST["markAs"];

//read = 1 | unread = 0
$markAsBoolean = ($markAs == $constants["read"]) ? 1 : 0;

//Verknüpfung zwischen aktuellem User und Benachrichtigung aufheben
$updateStatement = $dbPdo->prepare("UPDATE `Link_Benachrichtigungen_Nutzer` SET `read`=:markAsBoolean WHERE userId=:ownId AND notificationId=:notificationId;");
$updateStatement->bindValue(':markAsBoolean', $markAsBoolean);
$updateStatement->bindValue(':ownId', $own_id);
$updateStatement->bindValue(':notificationId', $notificationId);
$updateStatement->execute();

echo json_encode(array("status" => "success", "message" => "Notification als $markAs markiert"));

?>