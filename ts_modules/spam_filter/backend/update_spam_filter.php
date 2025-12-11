<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("SPAM_FILTER_WRITE");

$spamFilterId = $_POST["id"];
$name = $_POST["name"];
$mail = $_POST["mail"];
$reason = $_POST["reason"];
$type = $_POST["type"];
$ip = $_POST["ip"];
$expires = $_POST["expires"];

$updateStatement = $dbPdo->prepare("UPDATE spam_filter SET name = :name, mail = :mail, reason = :reason, type = :type, ip = :ip, expires = :expires WHERE id = :id");
$updateStatement->bindValue(':name', $name);
$updateStatement->bindValue(':mail', $mail);
$updateStatement->bindValue(':reason', $reason);
$updateStatement->bindValue(':type', $type);
$updateStatement->bindValue(':id', $spamFilterId);
$updateStatement->bindValue(':ip', $ip);
$updateStatement->bindValue(':expires', $expires);
$updateStatement->execute();

if ($updateStatement->rowCount() > 0) {
    $status = array("status" => "success", "message" => "Spam Filter erfolgreich aktualisiert.");
} else {
    $status = array("status" => "error", "message" => "Spam Filter konnte nicht aktualisiert werden.");
}
echo json_encode($status);
