<?php

// Dieses Script wird per Cronjob einmal täglich nachts ausgeführt und versendet mails mit Links zur Beratung x Tage nach einem Beratungstermin
$BASE_URL = getenv("BASE_URL");
$BASE_PATH = getenv("BASE_PATH");
$surveyId = getenv("EVALUATION_SURVEY_ID");
$EVALUATION_MAIL_TEXT_PATH = "$BASE_PATH/custom/evaluation_mail_text.html";

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
    $INSTITUTION_NAME = getenv("INSTITUTION_NAME");
    $mail_betreff = "$INSTITUTION_NAME | Umfrage zu Ihrer Erfahrung";

    $mail_text = "Guten Tag,
    <br><br>
    Wir möchten Sie bitten sich einen kurzen Moment Zeit zu nehmen und uns ein paar Fragen zu unserer Leistung zu beantworten. Damit helfen Sie uns unseren Service zu verbessern.
    <br><br>
    Klicken Sie hierzu bitte auf den untenstehenden Link um den Fragebogen aufzurufen.
    <h4><a href='{{evaluationLink}}'>Hier geht es zum Fragebogen</a></h4>
    <br><br>
    Herzlichen Dank für Ihre Unterstützung und alles Gute!";

    //If a custom mail text template exists => use that instead of the default text
    if (file_exists($EVALUATION_MAIL_TEXT_PATH)) {
        $mail_text = file_get_contents($EVALUATION_MAIL_TEXT_PATH);
    }

    $surveyLink = "$BASE_URL/?view=evaluation&uniqueKey=$uniqueKey";
    $mail_text = str_replace(array("{{evaluationLink}}"), array($surveyLink), $mail_text);
    $mail_text .= getenv("INSTITUTION_MAIL_POSTFIX");

    //stubegruMail() is imported by cronjob.php
    stubegruMail($empfaenger, $mail_betreff, $mail_text);

    //Eintrag löschen
    $deleteStatement = $dbPdo->prepare("DELETE FROM Feedback_Mails WHERE id=:id;");
    $deleteStatement->bindValue(':id', $id);
    $deleteStatement->execute();


    //echo "Sende Mail an $empfaenger mit id $id und dem Key $uniqueKey<br>$mail_text";
}

echo "Alle Mails für die Evaluation versendet";
