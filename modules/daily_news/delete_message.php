<?php
// Dieses Script löscht einen Nachricht
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("beratung");
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
newNotification($constants["news"], $id, $titel, $inhalt, "", $own_id, $constants["delete"]);

echo json_encode(array("status" => "success", "message" => "Tagesaktuelle Info '$titel' wurde gelöscht."));
