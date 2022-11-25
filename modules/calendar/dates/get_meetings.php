<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");
$own_id = $_SESSION['id'];

$selectStatement = $dbPdo->query("SELECT * FROM `Termine` ORDER BY date, start;");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

$clientStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id = :clientId");
foreach ($resultList as &$meetingData) {
    //Teilnehmer Informationen sammeln
    $clientId = $meetingData["teilnehmer"];
    if ($clientId != "") {
        $clientStatement->bindValue(':clientId', $clientId);
        $clientStatement->execute();
        $clientData = $clientStatement->fetch(PDO::FETCH_ASSOC);

        //remove client issue if this is not the owner account
        if($own_id != $meetingData["ownerId"]){
            $clientData["description"] = "*** Wird nur dem Beratenden angezeigt ***";
        }

        $meetingData["teilnehmer"] = $clientData;
    }
}

echo json_encode($resultList);
