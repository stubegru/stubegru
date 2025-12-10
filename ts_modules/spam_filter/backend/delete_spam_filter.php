<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("SPAM_FILTER_WRITE");

$spamFilterId = $_POST["id"];

$deleteStatement = $dbPdo->prepare("DELETE FROM spam_filter WHERE id = :id");
$deleteStatement->bindValue(':id', $spamFilterId);
$deleteStatement->execute();

if ($deleteStatement->rowCount() > 0) {
    $status = array("status" => "success", "message" => "Spam Filter erfolgreich gelöscht.");
} else {
    $status = array("status" => "error", "message" => "Spam Filter konnte nicht gelöscht werden.");
}

echo json_encode($status);
