<?php

// Dieses Script wird per Cronjob einmal täglich nachts ausgeführt und versendet mails mit Links zur Beratung x Tage nach einem Beratungstermin
$BASE_URL = getenv("BASE_URL");
$BASE_PATH = getenv("BASE_PATH");
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";

if (empty($constants["CUSTOM_CONFIG"]["evaluationSurveyId"])){
    throw new Exception("No evaluationSurveyId is set in custom/config.json. Cant send feedback mails!", 1);
    exit;
}
$surveyId = $constants["CUSTOM_CONFIG"]["evaluationSurveyId"];


$beforeXDays = date("Y-m-d", strtotime("-2 days")); //Datum vor x=2 Tagen

$selectStatement = $dbPdo->query("SELECT * FROM `Feedback_Mails` WHERE `date` <= '$beforeXDays';");
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {

    $id = $row["id"];
    $empfaenger = $row["mail"];
    $date = $row["date"];

    do {
        $uniqueKey = md5(rand(0, 1000000000)); //Key  generieren
        //Prüfen, ob key noch nicht in DB vorhanden

        $testStatement = $dbPdo->prepare("SELECT count(*) FROM `survey_keys` WHERE `uniqueKey` = :uniqueKey AND `surveyId` = :surveyId;");
        $testStatement->bindValue(':uniqueKey', $uniqueKey);
        $testStatement->bindValue(':surveyId', $surveyId);
        $testStatement->execute();
        $rowNumbers = $testStatement->fetchColumn();
    } while ($rowNumbers > 0); //Solange neu generieren, bis key noch nicht vorhanden ist

    //Key in Datenbank schreiben
    $insertStatement = $dbPdo->prepare("INSERT INTO `survey_keys` (`uniqueKey`,`surveyId`) VALUES (:uniqueKey,:surveyId);");
    $insertStatement->bindValue(':uniqueKey', $uniqueKey);
    $insertStatement->bindValue(':surveyId', $surveyId);
    $insertStatement->execute();

    //Mail versenden
    $institutionName = isset($constants["CUSTOM_CONFIG"]["institutionName"]) ? $constants["CUSTOM_CONFIG"]["institutionName"] : "Stubegru";
    $mail_betreff = "$institutionName | Umfrage zu Ihrer Erfahrung";

    $mail_text_default = "Guten Tag,
    <br><br>
    Wir möchten Sie bitten sich einen kurzen Moment Zeit zu nehmen und uns ein paar Fragen zu unserer Leistung zu beantworten. Damit helfen Sie uns unseren Service zu verbessern.
    <br><br>
    Klicken Sie hierzu bitte auf den untenstehenden Link um den Fragebogen aufzurufen.
    <h4><a href='{{evaluationLink}}'>Hier geht es zum Fragebogen</a></h4>
    <br><br>
    Herzlichen Dank für Ihre Unterstützung und alles Gute!";

    //If a custom mail text template exists => use that instead of the default text
    $mail_text = isset($constants["CUSTOM_CONFIG"]["evaluationMailText"]) ? $constants["CUSTOM_CONFIG"]["evaluationMailText"] : $mail_text_default;

    $surveyLink = "$BASE_URL/?view=evaluation&uniqueKey=$uniqueKey";
    $mail_text = str_replace(array("{{evaluationLink}}"), array($surveyLink), $mail_text);

    //stubegruMail() is imported by cronjob.php
    stubegruMail($empfaenger, $mail_betreff, $mail_text);

    //Eintrag löschen
    $deleteStatement = $dbPdo->prepare("DELETE FROM Feedback_Mails WHERE id=:id;");
    $deleteStatement->bindValue(':id', $id);
    $deleteStatement->execute();


    //echo "Sende Mail an $empfaenger mit id $id und dem Key $uniqueKey<br>$mail_text";
}

echo "Alle Mails für die Evaluation versendet";
