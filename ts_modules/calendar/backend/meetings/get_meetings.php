<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
require_once "$BASE_PATH/ts_modules/calendar/backend/meetings/meeting_block_utils.php";

permissionRequest("MEETINGS_READ");
$own_id = $_SESSION['id'];

$resultList;

if (isset($_GET["meetingId"])) {
    //select one specific meeting
    $meetingId =  $_GET["meetingId"];
    $selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE id = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
} else {
    //select all available meetings
    $selectStatement = $dbPdo->query("SELECT * FROM `Termine` ORDER BY date, start;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
}


//Delete expired blocks
deleteExpiredMeetingBlocks();
//Get all remaining blocks
$blocks = [];
$blockStmt = $dbPdo->query("SELECT meetingId FROM `meeting_blocks`");
foreach ($blockStmt->fetchAll(PDO::FETCH_ASSOC) as $block) {
    $blocks[$block['meetingId']] = true;
}

//Get client infos
$clientStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id = :clientId");


foreach ($resultList as &$meetingData) {
    //Add isBlocked value
    $currentMeetingId = $meetingData['id'];
    $meetingData['isBlocked'] = isset($blocks[$currentMeetingId]);

    //Teilnehmer Informationen sammeln
    $clientId = $meetingData["teilnehmer"];
    if ($clientId != "") {
        $clientStatement->bindValue(':clientId', $clientId);
        $clientStatement->execute();
        $clientData = $clientStatement->fetch(PDO::FETCH_ASSOC);

        //remove client issue, phone and mail if this is not the owner account
        $censorData = isset($constants["CUSTOM_CONFIG"]["censorMeetingClientData"]) ? $constants["CUSTOM_CONFIG"]["censorMeetingClientData"] : true;
        if ($censorData && $own_id != $meetingData["ownerId"]) {
            $clientData["description"] = "*** Wird nur dem Beratenden angezeigt ***";
            $clientData["phone"] = "*** Wird nur dem Beratenden angezeigt ***";
            $clientData["mail"] = "*** Wird nur dem Beratenden angezeigt ***";
        }

        $meetingData["teilnehmer"] = $clientData;
    }
}

echo json_encode($resultList);
