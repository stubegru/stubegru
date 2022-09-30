<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("ABSENCE_READ");
$ownId = $_SESSION["id"];

if (isset($_POST["absenceId"])) {
    $absenceId = $_POST["absenceId"]; //"all" => alle
} else {
    echo json_encode(array("status" => "error", "message" => "Abwesenheit mit der id $absenceId konnte nicht abgerufen werden."));
    exit;
}

$today = date("Y-m-d");
$dbPdo->query("DELETE FROM `Abwesenheiten` WHERE recurring = '' AND end < '$today';"); //Delete past absence entries

$dbPdo->query("SET time_zone = '+0:00'"); //Set MySQL's timezone to UTC (+0:00)

//Prüfen, ob alle oder ein bestimmter Datensatz geholt werden soll
if ($absenceId == "all") {
    $selectStatement = $dbPdo->query("SELECT * FROM `Abwesenheiten` ORDER BY `start` ASC;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
    foreach ($resultList as $index => $resultItem) {
        $resultItem["start"] = $resultItem["start"] . "Z"; //Add trailing "Z" to match ISO UTC Strings
        $resultItem["end"] = $resultItem["end"] . "Z"; //Add trailing "Z" to match ISO UTC Strings
        $resultList[$index] = $resultItem;
    }
    echo json_encode($resultList);

} else if (is_numeric($absenceId)) {
    $selectStatement = $dbPdo->prepare("SELECT * FROM `Abwesenheiten` WHERE id = :absenceId ORDER BY `start` ASC;");
    $selectStatement->bindValue(':absenceId', $absenceId);
    $selectStatement->execute();
    $resultItem = $selectStatement->fetch(PDO::FETCH_ASSOC);
    $resultItem["start"] = $resultItem["start"] . "Z"; //Add trailing "Z" to match ISO UTC Strings
    $resultItem["end"] = $resultItem["end"] . "Z"; //Add trailing "Z" to match ISO UTC Strings
    echo json_encode($resultItem);

} else {
    echo json_encode(array("status" => "error", "message" => "Abwesenheit mit der id $absenceId konnte nicht abgerufen werden."));
    exit;
}
