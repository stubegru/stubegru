<?php
// Dieses Script gibt eine Liste aller Voreinstellungen für Benutzergruppen / Rollen zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$roles = array();
$selectStatement = $dbPdo->prepare("SELECT * FROM Rollen;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $roles[$row["id"]] = $row;

}

echo json_encode($roles);
