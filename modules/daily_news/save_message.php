<?php

// Dieses Script speichert einen neuen Eintrag für Tagesaktuelle Infos
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("DAILY_NEWS_WRITE");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
$erfasser = $_SESSION["id"];
$erfassungsdatum = date("d.m.Y");

$titel = $_POST["title"];
$inhalt = $_POST["text"];
$beginn = $_POST["start"];
$ende = $_POST["end"];
$prioritaet = $_POST["priority"];
$newsId = $_POST["id"];

$prioritaet = $prioritaet == "true" ? 1 : 0;
$toReturn = array();


if ($newsId == "new") {

    $insertStatement = $dbPdo->prepare("INSERT INTO `Nachrichten` (`titel`,`inhalt`,`beginn`,`ende`,`erfasser`,`erfassungsdatum`,`prioritaet`) VALUES (:titel,:inhalt,:beginn,:ende,:erfasser,:erfassungsdatum,:prioritaet)");
    $insertStatement->bindValue(':titel', $titel);
    $insertStatement->bindValue(':inhalt', $inhalt);
    $insertStatement->bindValue(':beginn', $beginn);
    $insertStatement->bindValue(':ende', $ende);
    $insertStatement->bindValue(':erfasser', $erfasser);
    $insertStatement->bindValue(':erfassungsdatum', $erfassungsdatum);
    $insertStatement->bindValue(':prioritaet', $prioritaet);
    $insertStatement->execute();
    $newMessageId = $dbPdo->lastInsertId();

    //Notification versenden
    newNotification($constants["news"], $newMessageId, $titel, $inhalt, "", $erfasser, $constants["new"]);

    $toReturn["message"] = "Neue Tagesaktuelle Info hinzugefügt";
    $toReturn["status"] = "success";

} else if (is_numeric($newsId)) {

    $updateStatement = $dbPdo->prepare("UPDATE `Nachrichten` SET titel=:titel, inhalt=:inhalt, beginn=:beginn, ende=:ende, prioritaet=:prioritaet, erfassungsdatum=:erfassungsdatum WHERE id=:newsId;");
    $updateStatement->bindValue(':titel', $titel);
    $updateStatement->bindValue(':inhalt', $inhalt);
    $updateStatement->bindValue(':beginn', $beginn);
    $updateStatement->bindValue(':ende', $ende);
    $updateStatement->bindValue(':prioritaet', $prioritaet);
    $updateStatement->bindValue(':erfassungsdatum', $erfassungsdatum);
    $updateStatement->bindValue(':newsId', $newsId);
    $updateStatement->execute();

    //Notification versenden
    newNotification($constants["news"], $newsId, $titel, $inhalt, "", $erfasser, $constants["update"]);

    $toReturn["message"] = "Tagesaktuelle Info gespeichert";
    $toReturn["status"] = "success";

} else {
    $toReturn["message"] = "Fehler beim speichern der Tagesaktuellen Info. Die übergebene Id '$newsId' ist ungültig.";
    $toReturn["status"] = "error";
}

echo json_encode($toReturn);
