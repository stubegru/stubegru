<?php
// Dieses Script löscht einen Nutzer

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("admin");

$userId = $_POST["id"]; //Id des zu löschenden Nutzers


//Verknüpfung zwischen aktuellem User und Benachrichtigung aufheben
$deleteStatement = $dbPdo->prepare("DELETE FROM `Link_Benachrichtigungen_Nutzer` WHERE userId=:userId;");
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
$deleteStatement = $dbPdo->prepare("DELETE FROM Nutzer WHERE ID=:userId;");
$deleteStatement->bindValue(':userId', $userId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Nutzer erfolgreich gelöscht. Alle Verküpfungen mit diesem Nutzer wurden ebenfalls gelöscht."));
