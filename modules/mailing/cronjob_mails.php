<?php

// Dieses Script wird per Cronjob einmal täglich nachts ausgeführt und versendet Mails die für einen terminierten Versand vorgemerkt wurden.
$BASE_URL = getenv("BASE_URL");
$BASE_PATH = getenv("BASE_PATH");
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";

$today = date("Y-m-d");
$selectStatement = $dbPdo->query("SELECT * FROM `cronjob_mails` WHERE `date` <= '$today';");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {

    $mailJobId = $row["id"];
    $recipient = $row["recipient"];
    $subject = $row["subject"];
    $body = $row["body"];
    $attachmentName = $row["attachmentName"];
    $attachmentContent = $row["attachmentContent"];
    $type = $row["type"];

    //stubegruMail() is imported by cronjob.php
    if (empty($attachmentName)) {
        stubegruMail($recipient, $subject, $body);
    } else {
        $mailOptions = array("attachment" => array("name" => $attachmentName, "content" => $attachmentContent));
        stubegruMail($recipient, $subject, $body, $mailOptions);
    }

    //Eintrag löschen
    $deleteStatement = $dbPdo->prepare("DELETE FROM cronjob_mails WHERE id=:id;");
    $deleteStatement->bindValue(':id', $mailJobId);
    $deleteStatement->execute();
}

$count = count($resultList);
echo "Alle vorgemerkten Mails versendet ($count)";
