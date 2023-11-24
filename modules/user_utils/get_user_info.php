<?php
// Dieses Script gibt die Daten zur übergebenen Nutzer id zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("USER_READ");

$userId = ($_GET["userId"]);
if ($userId == "currentUser") {$userId = $_SESSION['id'];}

$selectStatement = $dbPdo->prepare("SELECT `id`, `name`, `mail`, `account`, `role` FROM `Nutzer` WHERE id=:userId;");
$selectStatement->bindValue(':userId', $userId);
$selectStatement->execute();
$userData = $selectStatement->fetch(PDO::FETCH_ASSOC);

$userPermissions = array();
$selectStatement = $dbPdo->prepare("SELECT permissions.* FROM Nutzer, permissions, permissions_user WHERE Nutzer.id = permissions_user.userId AND permissions.id = permissions_user.permissionId AND Nutzer.id = :userId;");
$selectStatement->bindValue(':userId', $userId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $userPermissions[] = $row;
}
$userData["permissions"] = $userPermissions;

echo json_encode($userData);

