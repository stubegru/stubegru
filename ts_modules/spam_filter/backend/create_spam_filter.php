<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("SPAM_FILTER_WRITE");

$name = $_POST["name"];
$mail = $_POST["mail"];
$reason = $_POST["reason"];
$type = $_POST["type"];
$ip = $_POST["ip"];
$expires = $_POST["expires"];


$insertStatement = $dbPdo->prepare("INSERT INTO spam_filter (name, mail, reason, type, ip, expires, created) VALUES (:name, :mail, :reason, :type, :ip, :expires, CURRENT_TIMESTAMP)");
$insertStatement->bindValue(':name', $name);
$insertStatement->bindValue(':mail', $mail);
$insertStatement->bindValue(':reason', $reason);
$insertStatement->bindValue(':type', $type);
$insertStatement->bindValue(':ip', $ip);
$insertStatement->bindValue(':expires', $expires);
$insertStatement->execute();

if ($insertStatement->rowCount() > 0) {
    $status = array("status" => "success", "message" => "Spam Filter erfolgreich erstellt.");
} else {
    $status = array("status" => "error", "message" => "Spam Filter konnte nicht erstellt werden.");
}
echo json_encode($status);
