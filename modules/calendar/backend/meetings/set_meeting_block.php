<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_READ");
$own_id = $_SESSION['id'];

try {
    $meetingId = $_POST["meetingId"];
    $blockMeeting = $_POST["blockMeeting"] == 1 ? $own_id : 0;

    $selectStatement = $dbPdo->prepare("SELECT blocked FROM `Termine` WHERE id = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $alreadyBlocked = $selectStatement->fetchColumn();


    if ($blockMeeting != 0 && ($alreadyBlocked != 0 && $alreadyBlocked != $own_id)) {
        echo json_encode(array("status" => "error", "message" => "Der Termin ist bereits blockiert und konnte nicht erneut blockiert werden.", "blockId" => $alreadyBlocked));
        exit;
    }

    if ($blockMeeting == 0 && ($alreadyBlocked != $own_id && $alreadyBlocked != 0)) {
        echo json_encode(array("status" => "error", "message" => "Der Termin ist durch eine andere Person blockiert. Die Blockierung kann nicht aufgehoben werden.", "blockId" => $alreadyBlocked));
        exit;
    }

    $updateStatement = $dbPdo->prepare("UPDATE `Termine` SET blocked = :blockMeeting WHERE id = :meetingId");
    $updateStatement->bindValue(':blockMeeting', $blockMeeting);
    $updateStatement->bindValue(':meetingId', $meetingId);
    $updateStatement->execute();
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Der Termin konnte nicht blockiert werden."));
    exit;
}


echo json_encode(array("status" => "success", "message" => "Blockieren / Block aufheben erfolgreich"));
