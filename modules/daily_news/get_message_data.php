<?php

// Dieses Script gibt die Daten einer nachricht als Json Objekt zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/wiki/show_article/wikiword_helper.php";

$newsId = $_POST["messageId"];

$selectStatement = $dbPdo->prepare("SELECT * FROM `Nachrichten` WHERE id = :newsId;");
$selectStatement->bindValue(':newsId', $newsId);
$selectStatement->execute();
$row = $selectStatement->fetch(PDO::FETCH_ASSOC);

//Autolink Wikiwords
$row["inhalt"] = autolinkWikiwords($newsId, $row["inhalt"], "DAILY_NEWS");

echo json_encode($row);
