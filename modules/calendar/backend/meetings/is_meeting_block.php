<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permissionRequest("MEETINGS_READ");

try {
    $meetingId = $_POST["meetingId"];

    $selectStatement = $dbPdo->prepare("SELECT blocked FROM `Termine` WHERE id = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $alreadyBlocked = $selectStatement->fetchColumn();

    if($alreadyBlocked == 0){
        echo json_encode(array("status" => "success", "message" => "Der Termin ist nicht blockiert", "blockId" => $alreadyBlocked));
    }
    else{
        $blockUsername = getUserName($alreadyBlocked);
        echo json_encode(array("status" => "success", "message" => "Der Termin ist blockiert", "blockId" => $alreadyBlocked, "blockName" => $blockUsername));
    }
    
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Der Termin konnte nicht blockiert werden."));
    exit;
}
