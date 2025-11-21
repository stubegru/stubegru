<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");
$own_id = $_SESSION['id'];

try {
    $meetingId = $_POST["meetingId"];
    $blockMeeting = $_POST["blockMeeting"] == 1;

    //delete expired blocks
    $dbPdo->query("DELETE FROM `meeting_blocks` WHERE `timestamp` < (NOW() - INTERVAL 30 MINUTE);");

    //check for existing block
    $selectStatement = $dbPdo->prepare("SELECT * FROM `meeting_blocks` WHERE meetingId = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $blockedRow = $selectStatement->fetch(PDO::FETCH_ASSOC);
    $alreadyBlocked = false;
    if ($blockedRow && isset($blockedRow['meetingId'])) {
        $alreadyBlocked = true;
        $blockUserId = $blockedRow['userId'];
    }

    if ($blockMeeting) {
        //meeting should be blocked AND is already blocked BY another person => ERROR
        if ($alreadyBlocked == true && $blockUserId != $own_id) {
            echo json_encode(array("status" => "error", "message" => "Der Termin ist bereits blockiert und konnte nicht erneut blockiert werden.", "blockId" => $blockUserId));
            exit;
        }

        // Insert new block
        $insertStatement = $dbPdo->prepare("INSERT INTO `meeting_blocks` (`meetingId`, `userId`, `timestamp`) VALUES (:meetingId, :userId, NOW())");
        $insertStatement->bindValue(':meetingId', $meetingId);
        $insertStatement->bindValue(':userId', $own_id);
        $insertStatement->execute();
        echo json_encode(array("status" => "success", "message" => "Termin wurde erfolgreich blockiert"));

    } else {
        //meeting should be UN-blocked AND is already blocked BY another person => ERROR
        if ($alreadyBlocked == true && $blockUserId != $own_id) {
            echo json_encode(array("status" => "error", "message" => "Der Termin ist durch eine andere Person blockiert. Die Blockierung kann nicht aufgehoben werden.", "blockId" => $blockUserId));
            exit;
        }

        // Remove block
        $deleteStatement = $dbPdo->prepare("DELETE FROM `meeting_blocks` WHERE `meetingId` = :meetingId");
        $deleteStatement->bindValue(':meetingId', $meetingId);
        $deleteStatement->execute();
        echo json_encode(array("status" => "success", "message" => "Termin wurde erfolgreich freigegeben"));
    }
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Der Termin konnte nicht blockiert werden."));
    exit;
}


