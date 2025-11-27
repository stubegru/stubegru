<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/user_utils/user_utils.php";

$isLoggedInUser = isLoggedInUser();
if ($isLoggedInUser) {
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("MEETINGS_READ");
} else {
    require_once "$BASE_PATH/utils/database_without_auth.php"; //<<used in self-service
}


try {
    $meetingId = $_POST["meetingId"];

    //delete expired blocks
    $dbPdo->query("DELETE FROM `meeting_blocks` WHERE `timestamp` < (NOW() - INTERVAL 30 MINUTE);");

    $selectStatement = $dbPdo->prepare("SELECT * FROM `meeting_blocks` WHERE meetingId = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $blockedRow = $selectStatement->fetch(PDO::FETCH_ASSOC);
    if ($blockedRow && isset($blockedRow['meetingId'])) {
        $alreadyBlocked = true;
        $blockUserId = $blockedRow['userId'];
    } else {
        $alreadyBlocked = false;
    }

    if ($alreadyBlocked == false) {
        echo json_encode(array("status" => "success", "message" => "Der Termin ist nicht blockiert", "isBlocked" => false));
    } else {
        $blockUserName = $blockUserId > 0 ? getUserName($blockUserId) : "Unbekannt (Self-Service)";
        $returnArray = array("status" => "success", "message" => "Der Termin ist blockiert", "isBlocked" => true);
        //add more sensitive info about blocking person if NOT in self-service-mode
        if ($isLoggedInUser === true) {
            $returnArray["blockId"] = $blockUserId;
            $returnArray["blockName"] = $blockUserName;
        }
        echo json_encode($returnArray);
    }
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Es konnte nicht überprüft werden, ob der Termin durch eine andere Person gesperrt ist."));
    exit;
}

/**
 * Return values
 * 
 * status       : "success" | "error"
 * message      : human readable message
 * isBlocked    : "true" | "false"
 * blockId?     : userId that currently blocks the meeting (0=anonymous)
 * blockName?   : userName to blockId
 */
