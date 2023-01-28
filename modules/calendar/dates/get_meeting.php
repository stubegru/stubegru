<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");
$own_id = $_SESSION['id'];

$meetingId = $_GET["meetingId"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE id = :meetingId;");
$selectStatement->bindValue(':meetingId', $meetingId);
$selectStatement->execute();
$meetingData = $selectStatement->fetch(PDO::FETCH_ASSOC);

$clientId = $meetingData["teilnehmer"];
if ($clientId != "") {
        $clientStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id = :clientId");
        $clientStatement->bindValue(':clientId', $clientId);
        $clientStatement->execute();
        $clientData = $clientStatement->fetch(PDO::FETCH_ASSOC);

        //remove client issue, phone and mail if this is not the owner account
        if($own_id != $meetingData["ownerId"]){
            $clientData["description"] = "*** Wird nur dem Beratenden angezeigt ***";
            $clientData["phone"] = "*** Wird nur dem Beratenden angezeigt ***";
            $clientData["mail"] = "*** Wird nur dem Beratenden angezeigt ***";
        }

        $meetingData["teilnehmer"] = $clientData;
    }

echo json_encode($meetingData);
