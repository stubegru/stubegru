<?php
// Dieses Script löscht einen Nachricht
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MAIL_LOG");

try {
    $mailId = $_GET["mailId"];

    $deleteStatement = $dbPdo->prepare("DELETE FROM cronjob_mails WHERE id = :mailId;");
    $deleteStatement->bindValue(':mailId', $mailId);
    $deleteStatement->execute();

    echo json_encode(array("status" => "success", "message" => "Vorgemerkte Mail wurde gelöscht."));
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => "Vorgemerkte Mail konnte nicht gelöscht werden."));
}
