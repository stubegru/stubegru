<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/ts_modules/calendar/backend/meetings/meeting_block_utils.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/utils/permission_request.php";
permissionRequest(isLoggedInUser() ? "MEETINGS_READ" : "CALENDAR_SELF_SERVICE");

$own_id = null;
$isLoggedInUser = isLoggedInUser();
if ($isLoggedInUser) {
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("MEETINGS_READ");
    $own_id = $_SESSION['id'];
} else {
    require_once "$BASE_PATH/utils/database_without_auth.php"; //<<used in self-service
}


try {
    $meetingId = $_POST["meetingId"];
    $blockMeeting = ($_POST["blockMeeting"] == 1);

    $blockResult = isMeetingBlock($meetingId, true);
    $alreadyBlocked = $blockResult["isBlocked"];
    $blockUserId = isset($blockResult["blockId"]) ? $blockResult["blockId"] : null;

    if ($blockMeeting) {
        //meeting should be blocked AND is already blocked BY another person => ERROR
        $allowReBlock = $alreadyBlocked && isset($own_id) && $blockUserId == $own_id; //allow re-blocking if this meeting is blocked by yourself
        $allowBlock = !$alreadyBlocked || $allowReBlock;
        if (!$allowBlock) {
            $returnArray = array("status" => "error", "message" => "Der Termin ist bereits blockiert und konnte nicht erneut blockiert werden.");
            if ($isLoggedInUser === true) {
                $returnArray["blockId"] = $blockUserId;
            }
            echo json_encode($returnArray);
            exit;
        }

        // Insert new block
        $setBlockUserId = $isLoggedInUser ? $own_id : $ANONYMOUS_BLOCK_ID; //set userId to ANONYMOUS if user is not logged in
        setMeetingBlock($meetingId, $setBlockUserId, true);
        echo json_encode(array("status" => "success", "message" => "Termin wurde erfolgreich blockiert"));
    } else {
        //meeting should be UN-blocked AND is already blocked BY another person => ERROR
        $isBlockedByMyself = $alreadyBlocked && isset($own_id) && $blockUserId == $own_id;
        $isBlockedByAnonymous = $alreadyBlocked && ($isLoggedInUser == false) && $blockUserId == $ANONYMOUS_BLOCK_ID;
        $allowUnblock = ($alreadyBlocked == false) || $isBlockedByMyself || $isBlockedByAnonymous;

        if (!$allowUnblock) {
            $returnArray = array("status" => "error", "message" => "Der Termin ist durch eine andere Person blockiert. Die Blockierung kann nicht aufgehoben werden.");
            if ($isLoggedInUser === true) {
                $returnArray["blockId"] = $blockUserId;
            }
            echo json_encode($returnArray);
            exit;
        }

        // Remove block
        setMeetingBlock($meetingId, null, false);
        echo json_encode(array("status" => "success", "message" => "Termin wurde erfolgreich freigegeben"));
    }
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Der Termin konnte nicht blockiert werden."));
    exit;
}
