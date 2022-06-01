<?php
// Dieses Script löscht einen termin

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
$dateId = $_POST["id"];

//***************Daten für Mails sammeln************************
//Terminattribute aus DB abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id`=:dateId;");
$selectStatement->bindValue(':dateId', $dateId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $dateDateAmericanFormat = $row->date;
    $dateDate = changeDateOrder($dateDateAmericanFormat, "-");
    $dateStartTime = substr($row->start, 0, -3); //schneidet die letzten drei Zeichen (Die Sekunden Angaben der Uhrzeit) ab
    $dateEndTime = substr($row->end, 0, -3); //schneidet die letzten drei Zeichen (Die Sekunden Angaben der Uhrzeit) ab
    $dateTitle = $row["title"];
    $dateOwnerId = $row["ownerId"];
    $dateOwnerName = $row["owner"];
    $dateRoomId = $row["room"];
    $dateTemplateId = $row["template"];
    $clientId = $row["teilnehmer"];
}
//Mailadresse des Beraters abrufen
$dateOwnerMailAdress = getUserAttribute($dateOwnerId, "mail");
//Mailadresse des Teilnehmers abrufen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Nachrichten` WHERE id = :newsId;");
$selectStatement->bindValue(':newsId', $id);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {$clientMailAdress = $row["mail"];}

//***************ICS EVENT GENERIEREN*****************************
$eventUid = "STUBEGRU-" . getenv("APPLICATION_ID") . "-$dateId";
$eventStartUTC = gmdate("Ymd\THis\Z", strtotime($dateDateAmericanFormat . " " . $dateStartTime));
$eventEndUTC = gmdate("Ymd\THis\Z", strtotime($dateDateAmericanFormat . " " . $dateEndTime));
$eventSummary = $dateTitle;

$eventIcsString = generateEvent($eventUid, $eventStartUTC, $eventEndUTC, $eventSummary, "", "", "100", "CANCELLED");

//***************Mails versenden************************
$mailSubject = "Termin abgesagt am $dateDate";
$mailSubject = "=?utf-8?b?" . base64_encode($mailSubject) . "?=";
$mailFrom = getenv("INSTITUTION_MAIL_ADDRESS");
$mailText = "Der Termin am $dateDate wurde abgesagt.";

try {
    sendMailWithAttachment($mailFrom, $dateOwnerMailAdress, $mailSubject, $mailText, "event.ics", $eventIcsString);
    //sendMailWithAttachment($mailFrom, $clientMailAdress, $mailSubject, $mailText, "event.ics", $eventIcsString);
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

echo json_encode(array("status" => "success", "message" => "Termin erfolgreich gelöscht. Die Daten des Klienten wurden ebenfalls gelöscht. Es wurde eine Mail mit einer Terminabsage an den Eigentümer des Termins ($dateOwnerMailAdress) gesendet."));
