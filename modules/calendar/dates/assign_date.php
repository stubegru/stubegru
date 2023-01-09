<?php
//Mit diesem Script wird ein Termin an einen zu Beratenden vergeben | Mails werden an Berater und zu Beratenden gesendet | Terminblockierung wird aufgehoben

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
permissionRequest("ASSIGN_DATE");
$loggedInUserId = $_SESSION["id"];

//Post Parameter auslesen
$dateId = $_POST["dateId"];
$clientName = $_POST["name"];
$clientMailAdress = $_POST["mail"];
$clientPhone = $_POST["phone"];
$clientWantsFormular = $_POST["survey"];
$dateIssue = $_POST["issue"];

//Channel attribute will only be set by calendar2 frontend
$channel = isset($_POST["channel"]) ? $_POST["channel"] : "unknown";

//check for meeting block
$selectStatement = $dbPdo->prepare("SELECT blocked FROM `Termine` WHERE id = :meetingId;");
$selectStatement->bindValue(':meetingId', $dateId);
$selectStatement->execute();
$alreadyBlocked = $selectStatement->fetchColumn();

if ($alreadyBlocked != $loggedInUserId) {
    $blockUsername = getUserName($alreadyBlocked);
    echo json_encode(array("status" => "error", "message" => "Der Termin kann nicht vergeben werden. Dieser Termin wurde nicht durch den aktuellen Nutzer (Id: $loggedInUserId) blockiert, sondern durch: $blockUsername (Id: $alreadyBlocked)"));
    exit;
}


$insertStatement = $dbPdo->prepare("INSERT INTO `Beratene` (`name`,`mail`,`phone`,`formular`,`description`,`dateId`,`channel`) VALUES (:clientName,:clientMailAdress,:clientPhone,:clientWantsFormular,:dateIssue,:dateId,:channel);"); // Daten des zu Beratenden in DB speichern
$insertStatement->bindValue(':clientName', $clientName);
$insertStatement->bindValue(':clientMailAdress', $clientMailAdress);
$insertStatement->bindValue(':clientPhone', $clientPhone);
$insertStatement->bindValue(':clientWantsFormular', $clientWantsFormular);
$insertStatement->bindValue(':dateIssue', $dateIssue);
$insertStatement->bindValue(':channel', $channel);
$insertStatement->bindValue(':dateId', $dateId);
$insertStatement->execute();
$teilnehmerId = $dbPdo->lastInsertId();

$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET `teilnehmer` = :teilnehmerId  WHERE `id` = :dateId;"); // clientId dem Termin zuordnen
$updateStatement->bindValue(':teilnehmerId', $teilnehmerId);
$updateStatement->bindValue(':dateId', $dateId);
$updateStatement->execute();
//Der Termin wurde nun erfolgreich an dern zu Beratenden vergeben, ab hier folgt der Versand der Info Mails

//***************Daten für Mails sammeln************************
//Terminattribute aus DB abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id`=:dateId;");
$selectStatement->bindValue(':dateId', $dateId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $dateDateAmericanFormat = $row["date"];
    $dateDate = changeDateOrder($dateDateAmericanFormat, "-");
    $dateStartTime = substr($row["start"], 0, -3); //schneidet die letzten drei Zeichen (Die Sekunden Angaben der Uhrzeit) ab
    $dateEndTime = substr($row["end"], 0, -3); //schneidet die letzten drei Zeichen (Die Sekunden Angaben der Uhrzeit) ab
    $dateTitle = $row["title"];
    $dateOwnerId = $row["ownerId"];
    $dateOwnerName = $row["owner"];
    $dateRoomId = $row["room"];
    $dateTemplateId = $row["template"];
}

//Eintrag in der Feedback_mails DB hinzufügen, falls Feedback Formular gewünscht
if ($clientWantsFormular == "1") {
    $insertStatement = $dbPdo->prepare("INSERT INTO `Feedback_Mails` (`date`, `mail`) VALUES (:dateDateAmericanFormat , :clientMailAdress);");
    $insertStatement->bindValue(':dateDateAmericanFormat', $dateDateAmericanFormat);
    $insertStatement->bindValue(':clientMailAdress', $clientMailAdress);
    $insertStatement->execute();
    $articleId = $dbPdo->lastInsertId();
}

//Raumattribute aus DB abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Raeume` WHERE `id`=:dateRoomId;");
$selectStatement->bindValue(':dateRoomId', $dateRoomId);
$selectStatement->execute();
$roomObject = $selectStatement->fetch(PDO::FETCH_OBJ);

//Mailadresse des Beraters abrufen
$dateOwnerMailAdress = getUserMail($dateOwnerId);

//Mailtemplates abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Templates` WHERE `id`=:dateTemplateId;");
$selectStatement->bindValue(':dateTemplateId', $dateTemplateId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $templateText = $row["text"];
    $templateSubject = $row["betreff"];
}

//Channel in Klartext übersetzen
$channelDescriptions = array("personally" => "Persönlich", "phone" => "Telefon", "webmeeting" => "Webmeeting", "unknown" => "unknown");
$channelPrint = $channelDescriptions[$channel];

//variablen in den Templates einsetzen
$templateVariablen = array("{Termin_Titel}", "{Termin_Kanal}", "{Klient_Name}", "{Klient_Telefon}", "{Termin_Datum}", "{Termin_Uhrzeit}", "{Berater_Name}", "{Berater_Mail}", "{Raum_Kanal}", "{Raum_Nummer}", "{Raum_Etage}", "{Raum_Strasse}", "{Raum_Hausnummer}", "{Raum_PLZ}", "{Raum_Ort}", "{Raum_Link}", "{Raum_Passwort}", "{Raum_Telefon}");
$phpVariablen = array($dateTitle, $channelPrint, $clientName, $clientPhone, $dateDate, $dateStartTime, $dateOwnerName, $dateOwnerMailAdress, $roomObject->kanal, $roomObject->raumnummer, $roomObject->etage, $roomObject->strasse, $roomObject->hausnummer, $roomObject->plz, $roomObject->ort, $roomObject->link, $roomObject->passwort, $roomObject->telefon);

//***************ICS EVENT GENERIEREN*****************************
$eventUid = "STUBEGRU-" . getenv("APPLICATION_ID") . "-$dateId";
$eventStartUTC = gmdate("Ymd\THis\Z", strtotime($dateDateAmericanFormat . " " . $dateStartTime));
$eventEndUTC = gmdate("Ymd\THis\Z", strtotime($dateDateAmericanFormat . " " . $dateEndTime));
$eventSummary = $dateTitle;
$eventLocation = $roomObject->kanal . " - " . $roomObject->raumnummer .  $roomObject->link . " " . $roomObject->passwort;

$eventIcsString = generateEvent($eventUid, $eventStartUTC, $eventEndUTC, $eventSummary, "", $eventLocation, "0", "CONFIRMED");
$mailOptions = array("attachment" => array("name" => "event.ics", "content" => $eventIcsString));



//***************Mail an den Kunden senden************************
$clientMailSubject = str_replace($templateVariablen, $phpVariablen, $templateSubject);
$clientMailText = str_replace($templateVariablen, $phpVariablen, $templateText);

try {
    stubegruMail($clientMailAdress, $clientMailSubject, $clientMailText, $mailOptions);
} catch (Exception $e) {
    echo json_encode(array("status" => "warning", "message" => "Der Termin wurde erfolgreich vergeben. Allerdings konnte keine Mail an den Kunden und den Berater versendet werden."));
    exit;
}



//***************Mail an Berater versenden************************
$loggedInUserName = getUserName($loggedInUserId);
$loggedInUserMailAdress = getUserMail($loggedInUserId);

$AdvisorMailText = "<p>Guten Tag</p>
        <p>$loggedInUserName hat einen Termin bei Ihnen vergeben</p>
        <span style='font-weight: bold;'>$dateTitle am $dateDate von $dateStartTime bis $dateEndTime Uhr<br><br></span>
        <span style='font-weight: bold;'><br><table style='width: 400px;' class='table' border='1' cellpadding='1' cellspacing='1'>
        <tbody>
        <tr>
        <td>&nbsp;Name</td>
        <td> $clientName <br></td>
        </tr>
        <tr>
        <td>&nbsp;Mail</td>
        <td>&nbsp;<a href='mailto:$clientMailAdress'>$clientMailAdress</a></td>
        </tr>
        <tr>
        <td>&nbsp;Telefon</td>
        <td>&nbsp;$clientPhone</td>
        </tr>
        <tr>
        <td>&nbsp;Anliegen</td>
        <td>&nbsp;$dateIssue</td>
        </tr>
        </tbody>
        </table>
        </span>
        <p>&nbsp;</p>
        <p>Viele Gr&uuml;&szlig;e</p>";

$AdvisorMailSubject = "Termin vergeben am $dateDate";


try {
    stubegruMail($dateOwnerMailAdress, $AdvisorMailSubject, $AdvisorMailText, $mailOptions);
} catch (Exception $e) {
    echo json_encode(array("status" => "warning", "message" => "Der Termin wurde erfolgreich vergeben. Allerdings konnte keine Mail an den Berater versendet werden. Die Mail an den Kunden wurde bereits versendet."));
    exit;
}

//Terminblock freigeben
$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET blocked = '0' WHERE id = :meetingId");
$updateStatement->bindValue(':meetingId', $dateId);
$updateStatement->execute();

//Erfolg melden
echo json_encode(array("status" => "success", "message" => "Der Termin wurde erfolgreich vergeben. Es wurde eine Mail an den Berater und an den Kunden versendet."));
