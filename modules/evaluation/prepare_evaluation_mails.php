<?php
$BASE_URL = getenv("BASE_URL");
$BASE_PATH = getenv("BASE_PATH");
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";


function scheduleEvaluationMail($recipient, $meetingDate)
{
    global $dbPdo, $BASE_URL, $constants;

    if (empty($constants["CUSTOM_CONFIG"]["evaluationSurveyId"])) {
        throw new Exception("No evaluationSurveyId is set in custom/config.json. Cant send feedback mails!", 1);
        return;
    }

    $surveyId = $constants["CUSTOM_CONFIG"]["evaluationSurveyId"];

    //Read config value for how many days after the meeting the evaluation mail should be send, Defaults to 2 (days after)
    $xDays = isset($constants["CUSTOM_CONFIG"]["evaluationSurveyWaitDays"]) ? $constants["CUSTOM_CONFIG"]["evaluationSurveyWaitDays"] : "2";

    $uniqueKey = md5(rand(0, 1000000000)); //Key  generieren

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
    $mail_text = str_replace("{{evaluationLink}}", $surveyLink, $mail_text);

    $date = DateTime::createFromFormat('Y-m-d', $meetingDate);
    $date = date_add($date, DateInterval::createFromDateString("$xDays days"));
    $date = $date->format(("Y-m-d"));

    $insertStatement = $dbPdo->prepare("INSERT INTO `cronjob_mails`(`date`, `recipient`, `subject`, `body`, `attachmentName`, `attachmentContent`, `type`, `reference`) VALUES (:date, :recipient, :subject, :body, :attachmentName, :attachmentContent, :type, :reference)");
    $insertStatement->bindValue(':date', $date);
    $insertStatement->bindValue(':recipient', $recipient);
    $insertStatement->bindValue(':subject', $mail_betreff);
    $insertStatement->bindValue(':body', $mail_text);
    $insertStatement->bindValue(':attachmentName', "");
    $insertStatement->bindValue(':attachmentContent', "");
    $insertStatement->bindValue(':type', "evaluationSurvey");
    $insertStatement->bindValue(':reference', $uniqueKey);
    $insertStatement->execute();
}
