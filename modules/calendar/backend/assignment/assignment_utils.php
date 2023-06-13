<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";
require_once "$BASE_PATH/modules/calendar/backend/templates/template_variables.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";

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

function getReplaceList($dataList)
{
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

function generateIcsAttachment($dataList)
{
    global $constants;
    $replaceList = getReplaceList($dataList);

    $meetingData = $dataList["meeting"];
    $clientData = $dataList["client"];
    $roomData = $dataList["room"];


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

    $icsString = generateIcsString($eventId, $startTimestampUTC, $endTimestampUTC, $eventSummary, $eventDescription, $locationString, "0", "CONFIRMED");

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
    global $BASE_PATH, $constants;
    $advisorMailOptions = array("attachment" => $icsAttachment);

    //Load default text from template file
    $advisorMailTextRaw = file_get_contents("$BASE_PATH/modules/calendar/backend/templates/default_mail_texts/assign_meeting_advisor_mail_template.html");
    //Replace default text by text from custom/config.json
    if (isset($constants["CUSTOM_CONFIG"]["assignMeetingAdvisorMailText"])) {
        $advisorMailTextRaw = $constants["CUSTOM_CONFIG"]["assignMeetingAdvisorMailText"];
    }
    //Replace template variables
    $advisorMailText = replaceVariables($advisorMailTextRaw, $replaceList);

    //Set default subject 
    $advisorMailSubjectRaw = "Stubegru Termin vergeben am " . $meetingData["datePretty"];
    //Replace default subject by subject from custom/config.json
    if (isset($constants["CUSTOM_CONFIG"]["assignMeetingAdvisorMailSubject"])) {
        $advisorMailSubjectRaw = $constants["CUSTOM_CONFIG"]["assignMeetingAdvisorMailSubject"];
    }
    //Replace template variables
    $advisorMailSubject = replaceVariables($advisorMailSubjectRaw, $replaceList);

    stubegruMail($meetingData["ownerMail"], $advisorMailSubject, $advisorMailText, $advisorMailOptions);
}

function sendClientMail($meetingData,$clientData,$replaceList,$icsAttachment)
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
