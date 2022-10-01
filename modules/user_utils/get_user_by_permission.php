<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$permission = $_GET["permission"];

$selectStatement = $dbPdo->prepare("SELECT Nutzer.name, Nutzer.id, Nutzer.mail, Nutzer.account FROM Nutzer, permissions, permissions_user WHERE Nutzer.id = permissions_user.userId AND permissions.id = permissions_user.permissionId AND permissions.id = :permission ORDER BY Nutzer.name ASC;");
$selectStatement->bindValue(':permission', $permission);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);
