<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("EVENT_TYPE_READ");
$ownId = $_SESSION["id"];

if (isset($_POST["eventId"])) {
    $eventId = $_POST["eventId"]; //"all" => alle
} else {
    echo json_encode(array("status" => "error", "message" => "veranstaltung mit der id $eventId konnte nicht abgerufen werden."));
    exit;
}

//Prüfen, ob alle oder ein bestimmter Datensatz geholt werden soll
if ($eventId == "all") {
    $selectStatement = $dbPdo->query("SELECT * FROM `veranstaltung` ORDER BY `name` ASC;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
    foreach ($resultList as $index => $resultItem) {
        $resultList[$index] = $resultItem;
    }
    echo json_encode($resultList);
} else if (is_numeric($eventId)) {
    $selectStatement = $dbPdo->prepare("SELECT * FROM `veranstaltung` WHERE id = :eventId ORDER BY `name` ASC;");
    $selectStatement->bindValue(':eventId', $eventId);
    $selectStatement->execute();
    $resultItem = $selectStatement->fetch(PDO::FETCH_ASSOC);
    echo json_encode($resultItem);

} else {
    echo json_encode(array("status" => "error", "message" => "Veranstaltung mit der id $eventId konnte nicht abgerufen werden."));
    exit;
}
