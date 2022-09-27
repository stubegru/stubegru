<?php
// Dieses Script löscht einen termin

function changeDateOrder($date, $seperator)
{
    $sep = explode($seperator, $date);
    return $sep[2] . "." . $sep[1] . "." . $sep[0];
}


$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/calendar/ical/ical_generator.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";
permission_required("beratung");
$dateId = $_POST["id"];

//***************Daten für Mails sammeln************************
//Terminattribute aus DB abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id`=:dateId;");
$selectStatement->bindValue(':dateId', $dateId);
$selectStatement->execute();
$meetingData = $selectStatement->fetch(PDO::FETCH_ASSOC);

if (!$meetingData) {
    echo json_encode(array("status" => "error", "message" => "Löschen des Termins fehlgeschlagen. Der Termin konnte nicht gefunden werden. Vermutlich wurde er bereits gelöscht."));
    exit;
}

$dateDateAmericanFormat = $meetingData["date"];
$dateDate = changeDateOrder($dateDateAmericanFormat, "-");
$dateStartTime = substr($meetingData["start"], 0, -3); //schneidet die letzten drei Zeichen (Die Sekunden Angaben der Uhrzeit) ab
$dateEndTime = substr($meetingData["end"], 0, -3); //schneidet die letzten drei Zeichen (Die Sekunden Angaben der Uhrzeit) ab
$dateTitle = $meetingData["title"];
$dateOwnerId = $meetingData["ownerId"];
$dateOwnerName = $meetingData["owner"];
$dateRoomId = $meetingData["room"];
$dateTemplateId = $meetingData["template"];
$clientId = $meetingData["teilnehmer"];

//Mailadresse des Beraters abrufen
$dateOwnerMailAdress = getUserAttribute($dateOwnerId, "mail");
//Mailadresse des Teilnehmers abrufen
$selectStatement = $dbPdo->prepare("SELECT mail FROM `Beratene` WHERE id = :clientId;");
$selectStatement->bindValue(':clientId', $clientId);
$selectStatement->execute();
$clientMailAdress = $selectStatement->fetchColumn();

//***************ICS EVENT GENERIEREN*****************************
$eventUid = "STUBEGRU-" . getenv("APPLICATION_ID") . "-$dateId";
$eventStartUTC = gmdate("Ymd\THis\Z", strtotime($dateDateAmericanFormat . " " . $dateStartTime));
$eventEndUTC = gmdate("Ymd\THis\Z", strtotime($dateDateAmericanFormat . " " . $dateEndTime));
$eventSummary = $dateTitle;

$eventIcsString = generateEvent($eventUid, $eventStartUTC, $eventEndUTC, $eventSummary, "", "", "100", "CANCELLED");

//***************Mails versenden************************
$mailSubject = "Termin abgesagt am $dateDate";
$mailText = "Der Termin am $dateDate wurde abgesagt.";

$mailOptions = array("attachment" => array("name" => "event.ics", "content" => $eventIcsString));

try {
    stubegruMail($dateOwnerMailAdress, $mailSubject, $mailText, $mailOptions);
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Der Termin wurde nicht gelöscht. Es konnten keine Mails zur Terminsabsage verschickt werden."));
    exit;
}

//***************TERMIN LÖSCHEN*****************************
$deleteStatement = $dbPdo->prepare("DELETE FROM `Beratene` WHERE `dateId` =:dateId;");
$deleteStatement->bindValue(':dateId', $dateId);
$deleteStatement->execute();
$deleteStatement = $dbPdo->prepare("DELETE FROM Termine WHERE id=:dateId;");
$deleteStatement->bindValue(':dateId', $dateId);
$deleteStatement->execute();

echo json_encode(array("status" => "success", "message" => "Termin erfolgreich gelöscht. Die Daten des Klienten wurden ebenfalls gelöscht. Es wurde eine Mail mit einer Terminabsage an den Eigentümer des Termins ($dateOwnerMailAdress) gesendet. Der Klient wurde NICHT benachrichtigt!"));
