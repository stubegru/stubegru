<?php
// Dieses Script löscht einen Nutzer

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("USER_WRITE");

$userId = $_POST["id"]; //Id des zu löschenden Nutzers


//Verknüpfung zwischen aktuellem User und Berechtigungen aufheben
$deleteStatement = $dbPdo->prepare("DELETE FROM `permissions_user` WHERE userId=:userId;");
$deleteStatement->bindValue(':userId', $userId);
$deleteStatement->execute();

//Verknüpfung zwischen aktuellem User und Benachrichtigung aufheben
$deleteStatement = $dbPdo->prepare("DELETE FROM `notification_type_user` WHERE userId=:userId;");
$deleteStatement->bindValue(':userId', $userId);
$deleteStatement->execute();

//Wiki Favoriten löschen
$deleteStatement = $dbPdo->prepare("DELETE FROM `wiki_link_favoriten` WHERE `nutzerId` = :userId;");
$deleteStatement->bindValue(':userId', $userId);
$deleteStatement->execute();

//Wiki gelesen Verknüpfungen löschen
$deleteStatement = $dbPdo->prepare("DELETE FROM `wiki_link_gelesen` WHERE `nutzerId` = :userId;");
$deleteStatement->bindValue(':userId', $userId);
$deleteStatement->execute();

//Nun tatsächlich den Nutzer löschen
$deleteStatement = $dbPdo->prepare("DELETE FROM Nutzer WHERE id=:userId;");
$deleteStatement->bindValue(':userId', $userId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Nutzer erfolgreich gelöscht. Alle Verküpfungen mit diesem Nutzer wurden ebenfalls gelöscht."));
