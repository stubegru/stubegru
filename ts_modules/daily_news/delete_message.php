<?php
// Dieses Script löscht einen Nachricht
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("DAILY_NEWS_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";

$own_id = $_SESSION['id'];
$id = $_POST["id"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Nachrichten` WHERE id = :newsId;");
$selectStatement->bindValue(':newsId', $id);
$selectStatement->execute();
$row = $selectStatement->fetch(PDO::FETCH_ASSOC);

$titel = $row["titel"];
$inhalt = $row["inhalt"];

$deleteStatement = $dbPdo->prepare("DELETE FROM Nachrichten WHERE id = :newsId;");
$deleteStatement->bindValue(':newsId', $id);
$deleteStatement->execute();

//Notification versenden
$text = "Die Tagesaktuelle Info wurde gelöscht";
newNotification("DAILY_NEWS", $id, $titel, $text, $own_id, "DELETE");

echo json_encode(array("status" => "success", "message" => "Tagesaktuelle Info '$titel' wurde gelöscht."));
