<?php
//Mit diesem Script wird ein Termin an einen zu Beratenden vergeben | Mails werden an Berater und zu Beratenden gesendet | Terminblockierung wird aufgehoben

function changeDateOrder($date, $seperator)
{
    $sep = explode($seperator, $date);
    return $sep[2] . "." . $sep[1] . "." . $sep[0];
}

function sendMailWithAttachment($from, $to, $subject, $message, $filename, $attachment)
{

    $content = chunk_split(base64_encode($attachment));

    // a random hash will be necessary to send mixed content
    $uid = md5(time());
    // carriage return type (RFC)
    $eol = "\r\n";

    // header
    $header = "From: $from\r\n";
    $header .= "MIME-Version: 1.0\r\n";
    $header .= "Content-Type: multipart/mixed; boundary=\"" . $uid . "\"\r\n\r\n";

// message & attachment
    $nmessage = "--" . $uid . "\r\n";
    $nmessage .= "Content-type:text/html; charset=utf-8\r\n";
    $nmessage .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $nmessage .= $message . "\r\n\r\n";
    $nmessage .= "--" . $uid . "\r\n";
    $nmessage .= "Content-Type: application/octet-stream; name=\"" . $filename . "\"\r\n";
    $nmessage .= "Content-Transfer-Encoding: base64\r\n";
    $nmessage .= "Content-Disposition: attachment; filename=\"" . $filename . "\"\r\n\r\n";
    $nmessage .= $content . "\r\n\r\n";
    $nmessage .= "--" . $uid . "--";

    //SEND Mail
    return mail($to, $subject, $nmessage, $header);
}

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/calendar/ical/ical_generator.php";
permission_required("beratung");
$loggedInUserId = $_SESSION["id"];

//Post Parameter auslesen
$dateId = $_POST["dateId"];
$clientName = $_POST["name"];
$clientMailAdress = $_POST["mail"];
$clientPhone = $_POST["phone"];
$clientWantsFormular = $_POST["survey"];
$dateIssue = $_POST["issue"];

$insertStatement = $dbPdo->prepare("INSERT INTO `Beratene` (`name`,`mail`,`phone`,`formular`,`description`,`dateId`) VALUES (:clientName,:clientMailAdress,:clientPhone,:clientWantsFormular,:dateIssue,:dateId);"); // Daten des zu Beratenden in DB speichern
$insertStatement->bindValue(':clientName', $clientName);
$insertStatement->bindValue(':clientMailAdress', $clientMailAdress);
$insertStatement->bindValue(':clientPhone', $clientPhone);
$insertStatement->bindValue(':clientWantsFormular', $clientWantsFormular);
$insertStatement->bindValue(':dateIssue', $dateIssue);
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
if ($clientWantsFormular == "yes") {
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
$dateOwnerMailAdress = getUserAttribute($dateOwnerId, "mail");

//Mailtemplates abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Templates` WHERE `id`=:dateTemplateId;");
$selectStatement->bindValue(':dateTemplateId', $dateTemplateId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $templateText = $row["text"];
    $templateSubject = $row["betreff"];
}

//Standardsignatur an Mailtext anhängen
$templateText .= getenv("INSTITUTION_MAIL_POSTFIX");

//variablen in den Templates einsetzen
$templateVariablen = array("{Termin_Titel}", "{Klient_Name}", "{Klient_Telefon}", "{Termin_Datum}", "{Termin_Uhrzeit}", "{Berater_Name}", "{Berater_Mail}", "{Raum_Kanal}", "{Raum_Nummer}", "{Raum_Etage}", "{Raum_Strasse}", "{Raum_Hausnummer}", "{Raum_PLZ}", "{Raum_Ort}", "{Raum_Link}", "{Raum_Passwort}", "{Raum_Telefon}");
$phpVariablen = array($dateTitle, $clientName, $clientPhone, $dateDate, $dateStartTime, $dateOwnerName, $dateOwnerMailAdress, $roomObject->kanal, $roomObject->raumnummer, $roomObject->etage, $roomObject->strasse, $roomObject->hausnummer, $roomObject->plz, $roomObject->ort, $roomObject->link, $roomObject->passwort, $roomObject->telefon);

//***************ICS EVENT GENERIEREN*****************************
$eventUid = "STUBEGRU-" . getenv("APPLICATION_ID") . "-$dateId";
$eventStartUTC = gmdate("Ymd\THis\Z",strtotime($dateDateAmericanFormat." ".$dateStartTime));
$eventEndUTC = gmdate("Ymd\THis\Z",strtotime($dateDateAmericanFormat." ".$dateEndTime));
$eventSummary = $dateTitle;
$eventLocation = $roomObject->kanal . " - " . $roomObject->raumnummer .  $roomObject->link . " " . $roomObject->passwort;

$eventIcsString = generateEvent($eventUid, $eventStartUTC, $eventEndUTC, $eventSummary, "", $eventLocation, "0", "CONFIRMED");


//***************Mail an den Kunden senden************************
$clientMailSubject = str_replace($templateVariablen, $phpVariablen, $templateSubject);
$clientMailSubject = "=?utf-8?b?" . base64_encode($clientMailSubject) . "?="; //Sonderzeichen konvertieren
$clientMailText = str_replace($templateVariablen, $phpVariablen, $templateText);
$clientMailHeader[] = 'MIME-Version: 1.0';
$clientMailHeader[] = "From: " . getenv("INSTITUTION_MAIL_ADDRESS");
$clientMailHeader[] = "Reply-To: $dateOwnerName <$dateOwnerMailAdress>";
$clientMailHeader[] = 'Content-type: text/html; charset="utf-8"';
$clientMailHeader[] = 'X-Mailer: PHP/' . phpversion();
$clientMailHeaderString = implode("\r\n", $clientMailHeader);

try {mail($clientMailAdress, $clientMailSubject, $clientMailText, $clientMailHeaderString);} catch (Exception $e) {
    echo json_encode(array("status" => "warning", "message" => "Der Termin wurde erfolgreich vergeben. Allerdings konnte keine Mail an den Kunden versendet werden."));
    exit;
}



//***************Mail an Berater versenden************************
$loggedInUserName = getUserAttribute($loggedInUserId, "name");
$loggedInUserMailAdress = getUserAttribute($loggedInUserId, "mail");

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
        <p>Viele Gr&uuml;&szlig;e</p>
        <p>Information Studium</p>";

$AdvisorMailSubject = "Termin vergeben am $dateDate";
$AdvisorMailSubject = "=?utf-8?b?" . base64_encode($AdvisorMailSubject) . "?=";
$AdvisorMailFrom = getenv("INSTITUTION_MAIL_ADDRESS");

try {sendMailWithAttachment($AdvisorMailFrom, $dateOwnerMailAdress, $AdvisorMailSubject, $AdvisorMailText, "event.ics", $eventIcsString);} catch (Exception $e) {
    echo json_encode(array("status" => "warning", "message" => "Der Termin wurde erfolgreich vergeben. Allerdings konnte keine Mail an den Berater versendet werden. Die Mail an den Kunden wurde bereits versendet."));
    exit;
}

//Erfolg melden
echo json_encode(array("status" => "success", "message" => "Der Termin wurde erfolgreich vergeben. Es wurde eine Mail an den Berater und an den Kunden versendet."));
