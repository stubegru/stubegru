<?php
// Dieses Script gibt eine Liste mit allen Tagesaktuellen Infos zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/wiki/show_article/wikiword_helper.php";

$user = $_SESSION["id"];
$currentDate = date("Y-m-d");

//Lösche alle abgelaufenen Nachrichten (Aufräumen)
$deleteStatement = $dbPdo->prepare("DELETE FROM `Nachrichten` WHERE ende < :currentDate;");
$deleteStatement->bindValue(':currentDate', $currentDate);
$deleteStatement->execute();

//Liste aller Nachrichten abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Nachrichten` ORDER BY prioritaet DESC, beginn DESC;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    //autolink wikiwords for each entry
    $row["inhalt"] = autolinkWikiwords($row["id"], $row["inhalt"], "DAILY_NEWS");
}

echo json_encode($resultList);
