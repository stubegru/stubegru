<?php
$BASE_PATH = getenv("BASE_PATH");
$INSTITUTION_NAME = getenv("INSTITUTION_NAME");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/calendar/ical/ical_generator.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";
permissionRequest("REMOVE_ASSIGNMENT");
$loggedInUserId = $_SESSION["id"];

$meetingId = $_POST["meetingId"];

//Get Meeting-data from DB
$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id`=:meetingId;");
$selectStatement->bindValue(':meetingId', $meetingId);
$selectStatement->execute();
$meetingData = $selectStatement->fetch(PDO::FETCH_ASSOC);

if (!$meetingData) {
    echo json_encode(array("status" => "error", "message" => "Löschen der Kundendaten fehlgeschlagen. Der Termin mit der Id '$meetingId' konnte nicht gefunden werden."));
    exit;
}

//Add owner mailadress
$meetingData["ownerMail"] = getUserMail($meetingData["ownerId"]);

//Get Client-data from DB
$clientStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id = :clientId");
$clientStatement->bindValue(':clientId', $meetingData["teilnehmer"]);
$clientStatement->execute();
$clientData = $clientStatement->fetch(PDO::FETCH_ASSOC);

if (!$clientData) {
    $clientId = $meetingData["teilnehmer"];
    echo json_encode(array("status" => "error", "message" => "Löschen der Kundendaten fehlgeschlagen. Der Kundendatensatz mit der Id '$clientId' konnte nicht gefunden werden."));
    exit;
}

//Remove entry in feedback-mails table
$feedbackStatement = $dbPdo->prepare("DELETE FROM `Feedback_Mails` WHERE mail = :clientMailAdress;");
$feedbackStatement->bindValue(':clientMailAdress', $clientData["mail"]);
$feedbackStatement->execute();

//Remove Client-data
$clientStatement = $dbPdo->prepare("DELETE FROM `Beratene` WHERE id = :clientId");
$clientStatement->bindValue(':clientId', $meetingData["teilnehmer"]);
$clientStatement->execute();

//Update Meeting-data
$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET `teilnehmer` = ''  WHERE `id` = :meetingId;");
$updateStatement->bindValue(':meetingId', $meetingId);
$updateStatement->execute();

//Prepare ICS cancel event
$eventUid = "STUBEGRU-" . getenv("APPLICATION_ID") . "-$meetingId";
$eventStartUTC = gmdate("Ymd\THis\Z", strtotime($meetingData["date"] . " " . $meetingData["start"]));
$eventEndUTC = gmdate("Ymd\THis\Z", strtotime($meetingData["date"] . " " . $meetingData["end"]));
$eventSummary = $meetingData["title"];
$eventIcsString = generateEvent($eventUid, $eventStartUTC, $eventEndUTC, $eventSummary, "", "", "100", "CANCELLED");
$mailOptions = array("attachment" => array("name" => "event.ics", "content" => $eventIcsString));

//Mail to Client (with ics cancel event)
$clientMailBody = loadMailTemplate("cancel_client_mail_template.html");
stubegruMail($clientData["mail"], "Terminabsage - $INSTITUTION_NAME", $clientMailBody, $mailOptions);

//Mail to Meeting-owner (with ics cancel event)
$ownerMailBody = loadMailTemplate("cancel_owner_mail_template.html");
stubegruMail($meetingData["ownerMail"], "Terminabsage - $INSTITUTION_NAME", $ownerMailBody, $mailOptions);

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
