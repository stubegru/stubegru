<?php

// Dieses Script versendet Bug oder Fehler Reports, wenn ein report gemeldet wird

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("WIKI_READ");
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$own_id = $_SESSION["id"];
$heute = date("Y-m-d");

$reportReason = $_POST["reportReason"];
$reportArticleId = $_POST["reportArticleId"];
$reportNotes = $_POST["reportNotes"];

//get article heading
$selectStatement = $dbPdo->prepare("SELECT heading FROM `wiki_artikel` WHERE id = :reportArticleId;");
$selectStatement->bindValue(':reportArticleId', $reportArticleId);
$selectStatement->execute();
$reportArticleName = $selectStatement->fetchColumn();

//get current users name
$own_name = getUserName($own_id);

$wikiLink = getenv(("BASE_URL")) . "?view=wiki_show_article&artikel=$reportArticleId";
$notificationText = "Es wurde ein Problem mit dem Wiki Artikel <b>$reportArticleName</b> gemeldet<br><br>
<b>Grund der Meldung:</b> $reportReason<br>
<b>Gemeldet von:</b> $own_name<br>
<b>Hinweis:</b> $reportNotes<br><br>
Der entsprechende Wiki Artikel ist hier zu finden:<br><a href='$wikiLink'>$reportArticleName</a>";
newNotification("WIKI_REPORT", $reportArticleId, $reportReason, $notificationText, $own_id, "INFO");

echo json_encode(array("status" => "success"));
