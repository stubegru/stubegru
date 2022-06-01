<?php
// Dieses Script gibt die Daten zur übergebenen Nutzer id zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$userId = ($_GET["userId"]);
if ($userId == "currentUser") {$userId = $_SESSION['id'];}

$selectStatement = $dbPdo->prepare("SELECT `id`, `name`, `mail`, `account`, `role`, `erfassungsdatum`, `erfasser`, `notification_reminder`, `notification_report`, `notification_article`, `notification_news`, `notification_absence`, `notification_error` FROM `Nutzer` WHERE id=:userId;");
$selectStatement->bindValue(':userId', $userId);
$selectStatement->execute();
$userData = $selectStatement->fetch(PDO::FETCH_ASSOC);

$userPermissions = array();
$selectStatement = $dbPdo->prepare("SELECT Rechte.* FROM Nutzer, Rechte, Link_Nutzer_Rechte WHERE Nutzer.id = Link_Nutzer_Rechte.userId AND Rechte.id = Link_Nutzer_Rechte.permissionId AND Nutzer.id = :userId;");
$selectStatement->bindValue(':userId', $userId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $userPermissions[] = $row;
}
$userData["permissions"] = $userPermissions;

echo json_encode($userData);

