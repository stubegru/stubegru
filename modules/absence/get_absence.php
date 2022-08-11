<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$ownId = $_SESSION["id"];

if (isset($_POST["absenceId"])) {
    $absenceId = $_POST["absenceId"]; //"all" => alle
} else {
    echo json_encode(array("status" => "error", "message" => "Abwesenheit mit der id $absenceId konnte nicht abgerufen werden."));
    exit;
}

//TODO Wie vergangene abwesenheiten löschen???
//mysqli_query($mysqli, "DELETE FROM `Abwesenheit` WHERE enddate < '$now' ;"); //Lösche alle abgelaufenen abwesenheiten

$dbPdo->query("SET time_zone = '+0:00'"); //Set MySQL's timezone to UTC (+0:00)

//Prüfen, ob alle oder ein bestimmter Datensatz geholt werden soll
if ($absenceId == "all") {
    $selectStatement = $dbPdo->query("SELECT * FROM `Abwesenheiten` ORDER BY `start` ASC;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
} else if (is_numeric($absenceId)) {
    $selectStatement = $dbPdo->prepare("SELECT * FROM `Abwesenheiten` WHERE id = :absenceId ORDER BY `start` ASC;");
    $selectStatement->bindValue(':absenceId', $absenceId);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
} else {
    echo json_encode(array("status" => "error", "message" => "Abwesenheit mit der id $absenceId konnte nicht abgerufen werden."));
    exit;
}

echo json_encode($resultList);
