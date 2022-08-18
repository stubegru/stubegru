<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$permission = $_GET["permission"];

$selectStatement = $dbPdo->prepare("SELECT Nutzer.name, Nutzer.id, Nutzer.mail, Nutzer.account FROM Nutzer, Rechte, Link_Nutzer_Rechte WHERE Nutzer.id = Link_Nutzer_Rechte.userId AND Rechte.id = Link_Nutzer_Rechte.permissionId AND Rechte.id = :permission ORDER BY Nutzer.name ASC;");
$selectStatement->bindValue(':permission', $permission);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);
