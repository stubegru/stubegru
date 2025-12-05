<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/ts_modules/calendar/backend/meetings/meeting_block_utils.php";
require_once "$BASE_PATH/utils/permission_request.php";

permissionRequest(isLoggedInUser() ? "MEETINGS_READ" : "CALENDAR_SELF_SERVICE");

try {
    $meetingId = $_POST["meetingId"];
    $blockResult = isMeetingBlock($meetingId);
    echo json_encode($blockResult);
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Es konnte nicht überprüft werden, ob der Termin durch eine andere Person gesperrt ist."));
    exit;
}

/**
 * Return values
 * 
 * status       : "success" | "error"
 * message      : human readable message
 * isBlocked    : true | false
 * blockId?     : userId that currently blocks the meeting (-1=anonymous)
 * blockName?   : userName to blockId
 */
