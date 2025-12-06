<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //<<used in self-service
require_once "$BASE_PATH/modules/user_utils/user_utils.php";

$isLoggedInUser = isLoggedInUser();

$ANONYMOUS_BLOCK_ID = -1;
$MEETING_BLOCK_LIFETIME = 30; //minutes


function deleteExpiredMeetingBlocks()
{
    global $dbPdo, $MEETING_BLOCK_LIFETIME;
    $dbPdo->query("DELETE FROM `meeting_blocks` WHERE `timestamp` < (NOW() - INTERVAL $MEETING_BLOCK_LIFETIME MINUTE);");
}

/**
 * Checks if a meeting block exists for the given meetingId.
 * Deletes expired meeting blocks before checking.
 * Returns an array with block status and, if logged in, user info.
 *
 * @param int $meetingId The ID of the meeting to check.
 * @return array [isBlocked, blockId?, blockName?] An array containing block status and optionally user info.
 */
function isMeetingBlock($meetingId, $forceAllData = false)
{
    global $dbPdo, $isLoggedInUser;
    $result = array("isBlocked" => true);
    deleteExpiredMeetingBlocks();

    $selectStatement = $dbPdo->prepare("SELECT * FROM `meeting_blocks` WHERE meetingId = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $blockedRow = $selectStatement->fetch(PDO::FETCH_ASSOC);
    if ($blockedRow && isset($blockedRow['meetingId'])) {
        $result["isBlocked"] = true;
        if ($forceAllData || $isLoggedInUser) {
            //give this enhanced info only to logged in users
            $result["blockId"] = $blockedRow['userId'];
            $result["blockName"] = getUserName($blockedRow['userId']) ?: "unknown (SelfService)";
        }
    } else {
        $result["isBlocked"] = false;
    }
    return $result;
}

function setMeetingBlock($meetingId, $userId, $block)
{
    global $dbPdo;
    if ($block) {
        $insertStatement = $dbPdo->prepare("INSERT INTO `meeting_blocks` (`meetingId`, `userId`, `timestamp`) VALUES (:meetingId, :userId, NOW())");
        $insertStatement->bindValue(':meetingId', $meetingId);
        $insertStatement->bindValue(':userId', $userId);
        $insertStatement->execute();
    } else {
        $deleteStatement = $dbPdo->prepare("DELETE FROM `meeting_blocks` WHERE `meetingId` = :meetingId");
        $deleteStatement->bindValue(':meetingId', $meetingId);
        $deleteStatement->execute();
    }
}

/**
 * Checks wether the meeting is blocked by the current user
 * Uses $_SESSION['id'] if set or $ANONYMOUS_BLOCK_ID
 * EXITs and echo error response if not "blocked by me"
 */
function meetingShouldBeBlockedByMe($meetingId)
{
    global $dbPdo, $ANONYMOUS_BLOCK_ID;
    $isLoggedInUser = isLoggedInUser();
    if ($isLoggedInUser && session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $userId = $isLoggedInUser ? $_SESSION['id'] : $ANONYMOUS_BLOCK_ID; //set userId to ANONYMOUS if user is not logged in

    $selectStatement = $dbPdo->prepare("SELECT * FROM `meeting_blocks` WHERE meetingId = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $blockedRow = $selectStatement->fetch(PDO::FETCH_ASSOC);
   
    if ($blockedRow == false) {
        echo json_encode(array("status" => "error", "message" => "Fehler bei der Terminbuchung. Termin wurde für Sie nicht zur Buchung vorgemerkt (no meeting block)."));
        exit;
    }


    if ($blockedRow['userId'] != $userId) {
        $blockUserId = $blockedRow['userId'];
        $blockUsername = getUserName($blockUserId);

        $toReturn = array("status" => "error");
        if ($isLoggedInUser) {
            $toReturn["message"] = "Der Termin kann nicht vergeben werden. Dieser Termin wurde nicht durch den aktuellen Nutzer (Id: $userId) blockiert, sondern durch: $blockUsername (Id: $blockUserId)";
        } else {
            $toReturn["message"] = "Der Termin kann nicht vergeben werden. Dieser Termin wurde von einem anderen Nutzer blockiert.";
        }
        echo json_encode($toReturn);
        exit;
    }
}
