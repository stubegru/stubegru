<?php

// Dieses Script speichert die Notification Einstellungen des Nutzers

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$reminder = $_POST["reminder"];
$report = $_POST["report"];
$article = $_POST["article"];
$news = $_POST["news"];
$absence = $_POST["absence"];
$error = $_POST["error"];

$own_id = $_SESSION["id"];

$updateStatement = $dbPdo->prepare("UPDATE `Nutzer` SET `notification_reminder`=:reminder,`notification_report`=:report,`notification_article`=:article,`notification_news`=:news,`notification_absence`=:absence,`notification_error`=:error WHERE id=:ownId;");
$updateStatement->bindValue(':reminder', $reminder);
$updateStatement->bindValue(':report', $report);
$updateStatement->bindValue(':article', $article);
$updateStatement->bindValue(':news', $news);
$updateStatement->bindValue(':absence', $absence);
$updateStatement->bindValue(':error', $error);
$updateStatement->bindValue(':reminder', $reminder);
$updateStatement->bindValue(':ownId', $own_id);
$updateStatement->execute();

echo json_encode(array("status" => "success", "message" => "Änderungen gespeichert!"));
