<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");

$query = $_GET["query"];

$clientStatement = $dbPdo->prepare("SELECT Termine.*, Beratene.name FROM Termine, Beratene WHERE Termine.teilnehmer = Beratene.id AND Termine.teilnehmer IN (SELECT Beratene.id FROM `Beratene` WHERE name LIKE :searchQuery);");
$clientStatement->bindValue(':searchQuery', "%$query%");
$clientStatement->execute();
$data = $clientStatement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);
