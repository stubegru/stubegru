<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //<<<ONLY FOR SELF SERVICE
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";

require_once "$BASE_PATH/ts_modules/calendar/backend/templates/template_variables.php";
require_once "$BASE_PATH/modules/evaluation/prepare_evaluation_mails.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";



$institutionName = isset($constants["CUSTOM_CONFIG"]["institutionName"]) ? $constants["CUSTOM_CONFIG"]["institutionName"] : "Stubegru";



function meetingShouldBeUnassigned($meetingId)
{
    global $dbPdo;
    $selectStatement = $dbPdo->prepare("SELECT teilnehmer FROM `Termine` WHERE id = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $alreadyAssigned = $selectStatement->fetchColumn();

    if ($alreadyAssigned != "") {
        echo json_encode(array("status" => "error", "message" => "Der Termin kann nicht vergeben werden. Dieser Termin wurde bereits an einen Kunden vergeben. Bitte Seite neu laden."));
        exit;
    }
}

function saveClientData($meetingId, $clientData)
{
    global $dbPdo;
    $insertStatement = $dbPdo->prepare("INSERT INTO `Beratene` (`name`,`mail`,`phone`,`formular`,`description`,`dateId`,`channel`) VALUES (:clientName,:clientMailAdress,:clientPhone,:clientWantsFormular,:meetingIssue,:meetingId,:channel);"); // Daten des zu Beratenden in DB speichern
    $insertStatement->bindValue(':clientName', $clientData["name"]);
    $insertStatement->bindValue(':clientMailAdress', $clientData["mail"]);
    $insertStatement->bindValue(':clientPhone', $clientData["phone"]);
    $insertStatement->bindValue(':clientWantsFormular', $clientData["survey"]);
    $insertStatement->bindValue(':meetingIssue', $clientData["description"]);
    $insertStatement->bindValue(':channel', $clientData["channel"]);
    $insertStatement->bindValue(':meetingId', $meetingId);
    $insertStatement->execute();
    $clientId = $dbPdo->lastInsertId();

    return $clientId;
}


function assignMeetingTo($meetingId, $clientId)
{
    global $dbPdo;
    $updateStatement = $dbPdo->prepare("UPDATE `Termine` SET `teilnehmer` = :teilnehmerId  WHERE `id` = :meetingId;"); // clientId dem Termin zuordnen
    $updateStatement->bindValue(':teilnehmerId', $clientId);
    $updateStatement->bindValue(':meetingId', $meetingId);
    $updateStatement->execute();
}

function getMeetingData($meetingId)
{
    global $dbPdo;
    $selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id`=:meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $result = $selectStatement->fetch(PDO::FETCH_ASSOC);

    return $result;
}

function getClientData($clientId)
{
    global $dbPdo;
    $clientStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id = :clientId");
    $clientStatement->bindValue(':clientId', $clientId);
    $clientStatement->execute();
    $clientData = $clientStatement->fetch(PDO::FETCH_ASSOC);

    return $clientData;
}

function getRoomData($roomId)
{
    global $dbPdo;
    $selectStatement = $dbPdo->prepare("SELECT * FROM `Raeume` WHERE `id`=:roomId;");
    $selectStatement->bindValue(':roomId', $roomId);
    $selectStatement->execute();
    $result = $selectStatement->fetch(PDO::FETCH_ASSOC);

    return $result;
}

function getTemplateData($templateId)
{
    global $dbPdo;
    $selectStatement = $dbPdo->prepare("SELECT * FROM `Templates` WHERE `id`=:templateId;");
    $selectStatement->bindValue(':templateId', $templateId);
    $selectStatement->execute();
    $result = $selectStatement->fetch(PDO::FETCH_ASSOC);

    return $result;
}

function bookmarkEvaluationMail($meetingDate, $mailAdress)
{
    if (!filter_var($mailAdress, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid mailadress '$mailAdress'. This mailadress could not be added for Feedbackmails", 1);
        return;
    }

    //from modules/evaluation/prepare_evaluation_mails.php
    scheduleEvaluationMail($mailAdress, $meetingDate);
}

function prettyChannelName($channel)
{
    $channelDescriptions = array("personally" => "Persönliches Gespräch", "phone" => "Telefonberatung", "webmeeting" => "Webmeeting", "unknown" => "unknown");
    return $channelDescriptions[$channel];
}

function makeDataPretty(&$meetingData, &$clientData)
{
    //Translate channel to human readable channel
    $clientData["channelPretty"] = prettyChannelName($clientData["channel"]);

    //Get advisor's mail address
    $meetingData["ownerMail"] = getUserMail($meetingData["ownerId"]);

    //Format date yyyy-mm-dd -> dd.mm.yyyy
    $meetingData["datePretty"] = DateTime::createFromFormat('Y-m-d', $meetingData["date"])->format('d.m.Y');

    //Format times to hh:mm:ss -> hh:mm
    $meetingData["startPretty"] =  substr($meetingData["start"], 0, -3);
    $meetingData["endPretty"] =  substr($meetingData["end"], 0, -3);
}


function getReplaceList($meetingData, $clientData, $roomData)
{
    //Add current users id
    $loggedInUserName = "Unbekannt";
    if (isset($_SESSION["id"])) {
        $loggedInUserId = $_SESSION["id"];
        $loggedInUserName = getUserName($loggedInUserId);
    }
    $extraData = array("currentUserName" => $loggedInUserName);

    //Prepare complete dataList
    $dataList = array();
    $dataList["meeting"] = $meetingData;
    $dataList["room"] = $roomData;
    $dataList["client"] = $clientData;
    $dataList["extra"] = $extraData;

    //Generate replace list
    $variables = getTemplateVariables();
    $replaceList = array();

    foreach ($variables as $v) {
        $cat = $v["category"];
        $prop = $v["property"];

        $replaceList[] = array(
            "search" => $v["placeholder"],
            "replace" => $dataList[$cat][$prop]
        );
    }

    return $replaceList;
}

function replaceVariables($text, $replaceList)
{
    foreach ($replaceList as $i) {
        $text = str_replace($i["search"], $i["replace"], $text);
    }
    return $text;
}

function generateIcsAttachment($meetingData, $clientData, $roomData, $isCancelled = false)
{
    global $constants;
    $replaceList = getReplaceList($meetingData, $clientData, $roomData);

    $eventId = "STUBEGRU-" . getenv("APPLICATION_ID") . "-" . $meetingData["id"];

    $startTimestampLocal = $meetingData["date"] . " " . $meetingData["start"];
    $startDateObject = DateTime::createFromFormat('Y-m-d H:i:s', $startTimestampLocal);
    $startTimestampUTC = gmdate("Ymd\THis\Z", $startDateObject->getTimestamp());

    $endTimestampLocal = $meetingData["date"] . " " . $meetingData["end"];
    $endDateObject = DateTime::createFromFormat('Y-m-d H:i:s', $endTimestampLocal);
    $endTimestampUTC = gmdate("Ymd\THis\Z", $endDateObject->getTimestamp());

    $eventSummary = $meetingData["title"];

    //Set event location
    $locationString = "";
    $eventChannel = $clientData["channel"] == "unknown" ? $roomData["kanal"] : $clientData["channel"];
    switch ($eventChannel) {
        case 'personally':
            $locationString = "Persönliches Gespräch in Raum " . $roomData["raumnummer"];
            break;
        case 'phone':
            $locationString = "Telefonisches Gespräch";
            break;
        case 'webmeeting':
            $locationString = "Webmeeting: " . $roomData["link"];
            break;
    }

    //Generate description text (with variables)
    $rawIcsDescription = loadStubegruMailtemplate("meeting_ics_template.txt");
    $eventDescription = replaceVariables($rawIcsDescription, $replaceList);

    if ($isCancelled) {
        $icsString = generateIcsString($eventId, $startTimestampUTC, $endTimestampUTC, $eventSummary, $eventDescription, $locationString, "100", "CANCELLED");
    } else {
        $icsString = generateIcsString($eventId, $startTimestampUTC, $endTimestampUTC, $eventSummary, $eventDescription, $locationString, "0", "CONFIRMED");
    }

    return array("name" => "event.ics", "content" => $icsString);
}


function generateIcsString($uid, $start, $end, $summary, $description, $location, $sequence, $status)
{
    $nowUTC = gmdate("Ymd\THis\Z");
    $eventData = array();

    $eventData[] = "BEGIN:VCALENDAR";
    $eventData[] = "VERSION:2.0";
    $eventData[] = "PRODID:-//stubegru.org/NONSGML Stubegru Calendar Module//EN";

    $eventData[] = "BEGIN:VTIMEZONE";
    $eventData[] = "TZID:Europe/Berlin";
    $eventData[] = "BEGIN:DAYLIGHT";
    $eventData[] = "TZOFFSETFROM:+0100";
    $eventData[] = "TZOFFSETTO:+0200";
    $eventData[] = "TZNAME:CEST";
    $eventData[] = "DTSTART:19700329T020000";
    $eventData[] = "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3";
    $eventData[] = "END:DAYLIGHT";
    $eventData[] = "BEGIN:STANDARD";
    $eventData[] = "TZOFFSETFROM:+0200";
    $eventData[] = "TZOFFSETTO:+0100";
    $eventData[] = "TZNAME:CET";
    $eventData[] = "DTSTART:19701025T030000";
    $eventData[] = "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10";
    $eventData[] = "END:STANDARD";
    $eventData[] = "END:VTIMEZONE";

    $eventData[] = "BEGIN:VEVENT";
    $eventData[] = "UID:$uid";
    $eventData[] = "DTSTART:$start";
    $eventData[] = "DTEND:$end";
    $eventData[] = "SUMMARY:$summary";
    $eventData[] = "DESCRIPTION:$description";
    $eventData[] = "DTSTAMP:$nowUTC";
    $eventData[] = "CREATED:$nowUTC";
    $eventData[] = "LAST-MODIFIED:$nowUTC";
    $eventData[] = "STATUS:$status";
    $eventData[] = "LOCATION:$location";
    $eventData[] = "SEQUENCE:$sequence";
    $eventData[] = "END:VEVENT";

    $eventData[] = "END:VCALENDAR";

    $icsString = implode("\r\n", $eventData);
    return $icsString;
}

function sendAdvisorMail($meetingData, $replaceList, $icsAttachment)
{
    $recipient = $meetingData["ownerMail"];
    $templateName = "assign_meeting_advisor_mail_template.html";
    sendMailWithVariables($recipient, $templateName, $replaceList, $icsAttachment);
}

function sendAdvisorCancelMail($meetingData, $replaceList, $icsAttachment)
{
    $recipient = getUserMail($meetingData["ownerId"]);
    $templateName = "cancel_meeting_advisor_mail_template.html";

    sendMailWithVariables($recipient, $templateName, $replaceList, $icsAttachment);
}

function sendClientCancelMail($recipient, $meetingData, $replaceList, $icsAttachment)
{
    $templateName = "cancel_meeting_client_mail_template.html";
    sendMailWithVariables($recipient, $templateName, $replaceList, $icsAttachment);
}

function sendMailWithVariables($recipient, $templateName, $replaceList, $icsAttachment)
{
    $mailOptions = array("attachment" => $icsAttachment);

    //Load default text from template file
    $mailTextRaw = loadStubegruMailtemplate($templateName);

    //Replace template variables
    $mailText = replaceVariables($mailTextRaw, $replaceList);

    //Set default subject 
    $mailSubjectRaw = extractMailSubject($mailText, $templateName);

    //Replace template variables
    $mailSubject = replaceVariables($mailSubjectRaw, $replaceList);

    stubegruMail($recipient, $mailSubject, $mailText, $mailOptions);
}

function generateClientMailData($meetingData, $replaceList)
{
    $templateData = getTemplateData($meetingData["template"]);
    $templateData["text"] = replaceVariables($templateData["text"], $replaceList);
    $templateData["betreff"] = replaceVariables($templateData["betreff"], $replaceList);
    return $templateData;
}

function sendClientMail($meetingData, $clientData, $replaceList, $icsAttachment)
{
    $templateData = generateClientMailData($meetingData, $replaceList);

    $clientMailOptions = array(
        "attachment" => $icsAttachment,
        "replyTo" => array("name" => $meetingData["owner"], "address" => $meetingData["ownerMail"])
    );

    stubegruMail($clientData["mail"], $templateData["betreff"], $templateData["text"], $clientMailOptions);
}

function removeClientData($clientId, $meetingId)
{
    global $dbPdo;
    $clientStatement = $dbPdo->prepare("DELETE FROM `Beratene` WHERE id = :clientId");
    $clientStatement->bindValue(':clientId', $clientId);
    $clientStatement->execute();

    $updateStatement = $dbPdo->prepare("UPDATE `Termine` SET `teilnehmer` = NULL  WHERE `id` = :meetingId;");
    $updateStatement->bindValue(':meetingId', $meetingId);
    $updateStatement->execute();
}


function logMeetingAssignment($name, $mail)
{
    global $dbPdo;
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $insertStatement = $dbPdo->prepare("INSERT INTO `self_service_log` (`ip`, `name`, `mail`, `created`) VALUES (:ip, :name, :mail, NOW())");
    $insertStatement->bindValue(':ip', $ip);
    $insertStatement->bindValue(':name', $name);
    $insertStatement->bindValue(':mail', $mail);
    $insertStatement->execute();
}

function createSpamFilterFromLog()
{
    global $dbPdo;

    $selectStatement = $dbPdo->prepare("SELECT * FROM `self_service_log`");
    $selectStatement->execute();
    $logEntries = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    createSpamFilterByIp($logEntries);
    createSpamFilterByMail($logEntries);
}


function createSpamFilterByIp($logEntries)
{
    global $dbPdo, $constants;
    $now = new DateTime(); // Get current time
    $ipCounts = []; // Prepare a map to count recent entries per IP

    // Read spam filter configuration from custom/config.json
    $maxMeetingsByIp = $constants["CUSTOM_CONFIG"]["selfServiceMaxMeetingsByIp"] ?? 3;
    $maxMeetingsByIpSeconds = $constants["CUSTOM_CONFIG"]["selfServiceMaxMeetingsByIpSeconds"] ?? 100;
    $maxMeetingsByIpExpireDays = $constants["CUSTOM_CONFIG"]["selfServiceMaxMeetingsByIpExpireDays"] ?? 14;

    //Count ips
    foreach ($logEntries as $entry) {
        $ip = $entry['ip'];
        $created = new DateTime($entry['created']);
        $interval = $now->getTimestamp() - $created->getTimestamp();

        if ($interval <= $maxMeetingsByIpSeconds) {
            if (!isset($ipCounts[$ip])) {
                $ipCounts[$ip] = 0;
            }
            $ipCounts[$ip]++;
        }
    }

    foreach ($ipCounts as $ip => $count) {
        if ($count > $maxMeetingsByIp) {
            $reason = "Zu viele Anfragen von dieser IP ($ip) innerhalb von $maxMeetingsByIpSeconds Sekunden.";
            $expires = (clone $now)->modify("+$maxMeetingsByIpExpireDays days")->format('Y-m-d');

            // Create new Spam-Filter rule
            $insertStatement = $dbPdo->prepare("INSERT INTO `spam_filter` (`name`, `reason`, `type`, `ip`, `mail`, `created`, `expires`, `initiator`) VALUES (:name, :reason, 'ip', :ip, '', NOW(), :expires, 'AUTO_DETECT')");
            $insertStatement->bindValue(':name', $ip);
            $insertStatement->bindValue(':reason', $reason);
            $insertStatement->bindValue(':ip', $ip);
            $insertStatement->bindValue(':expires', $expires);
            $insertStatement->execute();

            // Delete log entries for this IP from self_service_log
            $deleteStatement = $dbPdo->prepare("DELETE FROM `self_service_log` WHERE `ip` = :ip");
            $deleteStatement->bindValue(':ip', $ip);
            $deleteStatement->execute();
        }
    }
}

function createSpamFilterByMail($logEntries)
{
    global $dbPdo, $constants;
    $now = new DateTime(); // Get current time
    $mailCounts = [];

    // Read spam filter configuration from custom/config.json
    $maxMeetingsByMail = $constants["CUSTOM_CONFIG"]["selfServiceMaxMeetingsByMail"] ?? 3;
    $maxMeetingsByMailDays = $constants["CUSTOM_CONFIG"]["selfServiceMaxMeetingsByMailDays"] ?? 7;
    $maxMeetingsByMailExpireDays = $constants["CUSTOM_CONFIG"]["selfServiceMaxMeetingsByMailExpireDays"] ?? 7;

    // Count mails
    foreach ($logEntries as $entry) {
        $mail = $entry['mail'];
        $created = new DateTime($entry['created']);
        $intervalDays = ($now->getTimestamp() - $created->getTimestamp()) / (60 * 60 * 24);

        if ($intervalDays <= $maxMeetingsByMailDays) {
            if (!isset($mailCounts[$mail])) {
                $mailCounts[$mail] = 0;
            }
            $mailCounts[$mail]++;
        }
    }

    foreach ($mailCounts as $mail => $count) {
        if ($count > $maxMeetingsByMail) {
            $reason = "Zu viele Anfragen mit dieser Mailadresse ($mail) innerhalb von $maxMeetingsByMailDays Tagen.";
            $expires = (clone $now)->modify("+$maxMeetingsByMailExpireDays days")->format('Y-m-d');

            // Create new Spam-Filter rule
            $insertStatement = $dbPdo->prepare("INSERT INTO `spam_filter` (`name`, `reason`, `type`, `ip`, `mail`, `created`, `expires`, `initiator`) VALUES (:name, :reason, 'mail', '', :mail, NOW(), :expires, 'AUTO_DETECT')");
            $insertStatement->bindValue(':name', $mail);
            $insertStatement->bindValue(':reason', $reason);
            $insertStatement->bindValue(':mail', $mail);
            $insertStatement->bindValue(':expires', $expires);
            $insertStatement->execute();

            // Delete log entries for this mail from self_service_log
            $deleteStatement = $dbPdo->prepare("DELETE FROM `self_service_log` WHERE `mail` = :mail");
            $deleteStatement->bindValue(':mail', $mail);
            $deleteStatement->execute();
        }
    }
}
