<?php
$BASE_PATH = getenv("BASE_PATH");
$INSTITUTION_NAME = getenv("INSTITUTION_NAME");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/calendar/ical/ical_generator.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";
permissionRequest("REMOVE_ASSIGNMENT");
$loggedInUserId = $_SESSION["id"];

$dateId = $_POST["dateId"];

//Get Meeting-data from DB
$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id`=:dateId;");
$selectStatement->bindValue(':dateId', $dateId);
$selectStatement->execute();
$meetingData = $selectStatement->fetch(PDO::FETCH_ASSOC);

//Add owner mailadress
$meetingData["ownerMail"] = getUserMail($meetingData["ownerId"]);

//Get Client-data from DB
$clientStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id = :clientId");
$clientStatement->bindValue(':clientId', $meetingData["teilnehmer"]);
$clientStatement->execute();
$clientData = $clientStatement->fetch(PDO::FETCH_ASSOC);

//Remove entry in feedback-mails table
$feedbackStatement = $dbPdo->prepare("DELETE FROM `Feedback_Mails` WHERE mail = :clientMailAdress;");
$feedbackStatement->bindValue(':clientMailAdress', $clientData["mail"]);
$feedbackStatement->execute();

//Remove Client-data
$clientStatement = $dbPdo->prepare("DELETE FROM `Beratene` WHERE id = :clientId");
$clientStatement->bindValue(':clientId', $meetingData["teilnehmer"]);
$clientStatement->execute();

//Update Meeting-data
$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET `teilnehmer` = ''  WHERE `id` = :dateId;");
$updateStatement->bindValue(':dateId', $dateId);
$updateStatement->execute();

//Mail to Client
$clientMailBody = loadMailTemplate("cancel_client_mail_template.html");
stubegruMail($clientData["mail"], "Terminabsage - $INSTITUTION_NAME", $clientMailBody);

//Mail to Meeting-owner (with ics cancel event)
$ownerMailBody = loadMailTemplate("cancel_owner_mail_template.html");
stubegruMail($meetingData["ownerMail"], "Terminabsage - $INSTITUTION_NAME", $ownerMailBody);

//Erfolg melden
echo json_encode(array("status" => "success", "message" => "Der Kunde wurde erfolgreich von diesem Termin abgemeldet. Es wurde eine Mail mit einer Terminabsage an den Berater und an den Kunden versendet."));



function loadMailTemplate($fileName)
{
    global $BASE_PATH, $meetingData, $clientData;
    $mailBodyRaw = file_get_contents("$BASE_PATH/modules/calendar/dates/$fileName");
    $templateVariables = array("{Termin_Titel}", "{Klient_Name}", "{Klient_Telefon}", "{Klient_Mail}", "{Termin_Datum}", "{Termin_Uhrzeit}", "{Berater_Name}", "{Berater_Mail}");
    $templateValues = array($meetingData["title"], $clientData["name"], $clientData["phone"], $clientData["mail"], $meetingData["date"], $meetingData["start"], $meetingData["owner"], $meetingData["ownerMail"]);
    $mailBodyWithData = str_replace($templateVariables, $templateValues, $mailBodyRaw);
    return $mailBodyWithData;
}