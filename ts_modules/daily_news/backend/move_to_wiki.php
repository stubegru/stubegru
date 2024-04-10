<?php

// Dieses Script löscht einen Nachricht und erstellt stattdessen einen Wiki Artikel mit diesem Inhalt
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MOVE_TO_WIKI");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";

$own_id = $_SESSION['id'];
$newsId = $_POST["id"];

$toReturn = array();

//***Daten der Tagesaktuellen Info abrufen***
$selectStatement = $dbPdo->prepare("SELECT * FROM `Nachrichten` WHERE id = :newsId");
$selectStatement->bindValue(':newsId', $newsId);
$selectStatement->execute();
$newsData = $selectStatement->fetch(PDO::FETCH_ASSOC);

$titel = $newsData["titel"];
$inhalt = $newsData["inhalt"];

//***Wiki Artikel erstellen***
//Prüfen, ob es schon einen Artikel mit dieser Überschrift gibt
$testStatement = $dbPdo->prepare("SELECT count(*) FROM `wiki_artikel` WHERE heading = :titel");
$testStatement->bindValue(':titel', $titel);
$testStatement->execute();
$rowNumbers = $testStatement->fetchColumn();

if ($rowNumbers > 0) {
    $toReturn["status"] = "error";
    $toReturn["message"] = "Es existiert bereits ein Artikel mit dieser Überschrift.";
} else {
    $insertStatement = $dbPdo->prepare("INSERT INTO `wiki_artikel` (`heading`,`text`) VALUES (:titel,:inhalt);");
    $insertStatement->bindValue(':titel', $titel);
    $insertStatement->bindValue(':inhalt', $inhalt);
    $insertStatement->execute();
    $articleId = $dbPdo->lastInsertId();

    //Tagesaktuelle Info löschen
    $deleteStatement = $dbPdo->prepare("DELETE FROM Nachrichten WHERE id = :newsId;");
    $deleteStatement->bindValue(':newsId', $newsId);
    $deleteStatement->execute();

    $wikiLink = getenv(("BASE_URL")) . "?view=wiki_show_article&artikel=$articleId";
    $text = "Die Tagesaktuelle Info <b>'$titel'</b> wurde gelöscht und in einen Wiki Artikel umgewandelt.<br>Der neue Wiki Artikel ist hier zu finden:<br><a href='$wikiLink'>$titel</a>";
    $notificationTitle = "Tagesaktuelle Info in Wiki Artikel umgewandelt";
    newNotification("MOVE_TO_WIKI", $articleId, $notificationTitle, $text, $own_id, "UPDATE");

    $toReturn["status"] = "success";
    $toReturn["message"] = $text;
    $toReturn["title"] = $notificationTitle;
    $toReturn["articleId"] = $articleId;
    $toReturn["mode"] = "alert";
}

echo json_encode($toReturn);
