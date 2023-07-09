<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";
require_once "$BASE_PATH/modules/calendar/backend/templates/template_variables.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";

$institutionName = isset($constants["CUSTOM_CONFIG"]["institutionName"]) ? $constants["CUSTOM_CONFIG"]["institutionName"] : "Stubegru";

function meetingShouldBeBlockedBy($meetingId, $userId)
{
    //check for meeting block
    global $dbPdo;
    $selectStatement = $dbPdo->prepare("SELECT blocked FROM `Termine` WHERE id = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $alreadyBlocked = $selectStatement->fetchColumn();

    if ($alreadyBlocked != $userId) {
        $blockUsername = getUserName($alreadyBlocked);
        echo json_encode(array("status" => "error", "message" => "Der Termin kann nicht vergeben werden. Dieser Termin wurde nicht durch den aktuellen Nutzer (Id: $userId) blockiert, sondern durch: $blockUsername (Id: $alreadyBlocked)"));
        exit;
    }
}

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

function bookmarkFeedbackMail($meetingId, $mailAdress)
{
    global $dbPdo;

    if (!filter_var($mailAdress, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid mailadress '$mailAdress'. This mailadress could not be added for Feedbackmails", 1);
        return;
    }

    $selectStatement = $dbPdo->prepare("SELECT `date` FROM `Termine` WHERE id = :meetingId;");
    $selectStatement->bindValue(':meetingId', $meetingId);
    $selectStatement->execute();
    $meetingDate = $selectStatement->fetchColumn();

    $insertStatement = $dbPdo->prepare("INSERT INTO `Feedback_Mails` (`date`, `mail`) VALUES (:meetingDate , :mailAdress);");
    $insertStatement->bindValue(':meetingDate', $meetingDate);
    $insertStatement->bindValue(':mailAdress', $mailAdress);
    $insertStatement->execute();
}

function prettyChannelName($channel)
{
    $channelDescriptions = array("personally" => "Persönliches Gespräch", "phone" => "Telefonberatung", "webmeeting" => "Webmeeting", "unknown" => "unknown");
    return $channelDescriptions[$channel];
}

function makeDataPretty(&$meetingData, &$clientData){
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
    $loggedInUserId = $_SESSION["id"];
    $loggedInUserName = getUserName($loggedInUserId);
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
    $rawIcsDescription = "";
    if (isset($constants["CUSTOM_CONFIG"]["icsDescriptionTemplate"])) {
        $rawIcsDescription = $constants["CUSTOM_CONFIG"]["icsDescriptionTemplate"];
    }
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

function unblockMeeting($meetingId)
{
    global $dbPdo;
    $updateStatement = $dbPdo->prepare("UPDATE `Termine` SET blocked = '0' WHERE id = :meetingId");
    $updateStatement->bindValue(':meetingId', $meetingId);
    $updateStatement->execute();
}

function sendAdvisorMail($meetingData, $replaceList, $icsAttachment)
{
    global $institutionName;
    $recipient = $meetingData["ownerMail"];
    $defaultSubject = "$institutionName Termin vergeben am " . $meetingData["datePretty"];
    $configKeySubject = "assignMeetingAdvisorMailSubject";
    $templateName = "assign_meeting_advisor_mail_template";
    $configKeyText = "assignMeetingAdvisorMailText";

    sendMailWithVariables($recipient, $defaultSubject, $configKeySubject, $templateName, $configKeyText, $replaceList, $icsAttachment);
}

function sendAdvisorCancelMail($meetingData, $replaceList, $icsAttachment)
{
    global $institutionName;
    $recipient = getUserMail($meetingData["ownerId"]);
    $defaultSubject = "$institutionName Termin abgesagt am " . $meetingData["datePretty"];
    $configKeySubject = "cancelMeetingAdvisorMailSubject";
    $templateName = "cancel_meeting_advisor_mail_template";
    $configKeyText = "cancelMeetingAdvisorMailText";

    sendMailWithVariables($recipient, $defaultSubject, $configKeySubject, $templateName, $configKeyText, $replaceList, $icsAttachment);
}

function sendClientCancelMail($recipient, $meetingData, $replaceList, $icsAttachment)
{
    global $institutionName;
    $defaultSubject = "$institutionName Termin abgesagt am " . $meetingData["datePretty"];
    $configKeySubject = "cancelMeetingClientMailSubject";
    $templateName = "cancel_meeting_client_mail_template";
    $configKeyText = "cancelMeetingClientMailText";

    sendMailWithVariables($recipient, $defaultSubject, $configKeySubject, $templateName, $configKeyText, $replaceList, $icsAttachment);
}

function sendMailWithVariables($recipient, $defaultSubject, $configKeySubject, $templateName, $configKeyText, $replaceList, $icsAttachment)
{
    global $BASE_PATH, $constants;
    $mailOptions = array("attachment" => $icsAttachment);

    //Load default text from template file
    $mailTextRaw = file_get_contents("$BASE_PATH/modules/calendar/backend/templates/default_mail_texts/$templateName.html");
    //Replace default text by text from custom/config.json
    if (isset($constants["CUSTOM_CONFIG"][$configKeyText])) {
        $mailTextRaw = $constants["CUSTOM_CONFIG"][$configKeyText];
    }
    //Replace template variables
    $mailText = replaceVariables($mailTextRaw, $replaceList);

    //Set default subject 
    $mailSubjectRaw = $defaultSubject;
    //Replace default subject by subject from custom/config.json
    if (isset($constants["CUSTOM_CONFIG"][$configKeySubject])) {
        $mailSubjectRaw = $constants["CUSTOM_CONFIG"][$configKeySubject];
    }
    //Replace template variables
    $mailSubject = replaceVariables($mailSubjectRaw, $replaceList);

    stubegruMail($recipient, $mailSubject, $mailText, $mailOptions);
}

function sendClientMail($meetingData, $clientData, $replaceList, $icsAttachment)
{
    $templateData = getTemplateData($meetingData["template"]);
    $templateData["text"] = replaceVariables($templateData["text"], $replaceList);
    $templateData["betreff"] = replaceVariables($templateData["betreff"], $replaceList);

    $clientMailOptions = array(
        "attachment" => $icsAttachment,
        "replyTo" => array("name" => $meetingData["owner"], "address" => $meetingData["ownerMail"])
    );

    stubegruMail($clientData["mail"], $templateData["betreff"], $templateData["text"], $clientMailOptions);
}

function removeFeedbackMail($mailAdress)
{
    global $dbPdo;
    $feedbackStatement = $dbPdo->prepare("DELETE FROM `Feedback_Mails` WHERE mail = :clientMailAdress;");
    $feedbackStatement->bindValue(':clientMailAdress', $mailAdress);
    $feedbackStatement->execute();
}

function removeClientData($clientId, $meetingId)
{
    global $dbPdo;
    $clientStatement = $dbPdo->prepare("DELETE FROM `Beratene` WHERE id = :clientId");
    $clientStatement->bindValue(':clientId', $clientId);
    $clientStatement->execute();

    $updateStatement = $dbPdo->prepare("UPDATE `Termine` SET `teilnehmer` = ''  WHERE `id` = :meetingId;");
    $updateStatement->bindValue(':meetingId', $meetingId);
    $updateStatement->execute();
}
