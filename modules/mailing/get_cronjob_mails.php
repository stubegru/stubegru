<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MAIL_LOG");

try {
    $selectStatement = $dbPdo->query("SELECT `id`, `date`, `recipient`, `subject`, `attachmentName`, `type`, `reference` FROM `cronjob_mails` ORDER BY `date` DESC;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($resultList);

} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => "Vorgemerkte Mails konnten nicht geladen werden."));
    exit;
}
