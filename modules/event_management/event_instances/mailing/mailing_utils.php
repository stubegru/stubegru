<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";
require_once "$BASE_PATH/modules/event_management/event_instances/backend/event_instance_utils.php";


function handleMailingOnCreate($eventInstanceId)
{
    $eventInstance = getEventInstance($eventInstanceId);
    $userList = getUserList();

    //Trigger Mail for assignees
    $assigneeRecipients = buildRecipients($eventInstance["assigneesInternal"], $userList);
    triggerEventMail("event_create_assignee.html", $assigneeRecipients, $eventInstance, $userList, "CONFIRMED");
    scheduleReminderMail("event_reminder_assignee.html", $assigneeRecipients, $eventInstance, $userList, "eventInstanceReminderAssignee",  $eventInstance["reminderInternal"]);

    //Trigger Mail for PR
    $prRecipients = buildRecipients($eventInstance["assigneesPR"], $userList);
    triggerEventMail("event_create_pr.html", $prRecipients, $eventInstance, $userList, "CONFIRMED");
    scheduleReminderMail("event_reminder_pr.html", $assigneeRecipients, $eventInstance, $userList, "eventInstanceReminderPR",  $eventInstance["reminderPR"]);
}

function handleMailingOnCancel($eventInstanceId)
{
    $eventInstance = getEventInstance($eventInstanceId);
    $userList = getUserList();

    //Trigger Mail for assignees
    $assigneeRecipients = buildRecipients($eventInstance["assigneesInternal"], $userList);
    triggerEventMail("event_cancel.html", $assigneeRecipients, $eventInstance, $userList, "CANCELLED");

    //Trigger Mail for PR
    $prRecipients = buildRecipients($eventInstance["assigneesPR"], $userList);
    triggerEventMail("event_cancel.html", $prRecipients, $eventInstance, $userList, "CANCELLED");

    removeScheduledMail($eventInstanceId);
}

function buildRecipients($idList, $userList)
{
    $addressCollector = array();
    foreach ($idList as $userId) {
        $addressCollector[] = $userList[$userId]["mail"];
    }
    return implode(", ", $addressCollector);
}

function triggerEventMail($templateName, $recipient, $eventInstance, $userList, $icsState)
{
    $templateRaw = loadMailtemplate($templateName);
    $mailSubject = extractMailSubject($templateRaw, $templateName);
    $eventInstance = beautifyEventInstance($eventInstance, $userList);
    $mailBody = replacePlaceholders($templateRaw, $eventInstance);

    if ($icsState) {
        $icsAttachment = generateEventIcsAttachment($eventInstance, ($icsState == "CANCELLED"));
        $mailOptions = array("attachment" => $icsAttachment);
        stubegruMail($recipient, $mailSubject, $mailBody, $mailOptions);
    } else {
        stubegruMail($recipient, $mailSubject, $mailBody);
    }
}

function scheduleReminderMail($templateName, $recipient, $eventInstance, $userList, $type, $daysBefore)
{
    global $dbPdo;

    if (isset($daysBefore) && $daysBefore >= 0) {
        $date = DateTime::createFromFormat('Y-m-d', $eventInstance["startDate"]);
        $date = date_sub($date, DateInterval::createFromDateString("$daysBefore days"));
        $date = $date->format(("Y-m-d"));

        $templateRaw = loadMailtemplate($templateName);
        $mailSubject = extractMailSubject($templateRaw, $templateName);
        $eventInstance = beautifyEventInstance($eventInstance, $userList);
        $mailBody = replacePlaceholders($templateRaw, $eventInstance);

        $insertStatement = $dbPdo->prepare("INSERT INTO `cronjob_mails`(`date`, `recipient`, `subject`, `body`, `attachmentName`, `attachmentContent`, `type`, `reference`) VALUES (:date, :recipient, :subject, :body, :attachmentName, :attachmentContent, :type, :reference)");
        $insertStatement->bindValue(':date', $date);
        $insertStatement->bindValue(':recipient', $recipient);
        $insertStatement->bindValue(':subject', $mailSubject);
        $insertStatement->bindValue(':body', $mailBody);
        $insertStatement->bindValue(':attachmentName', "");
        $insertStatement->bindValue(':attachmentContent', "");
        $insertStatement->bindValue(':type', $type);
        $insertStatement->bindValue(':reference', $eventInstance["id"]);
        $insertStatement->execute();
    }
}

function removeScheduledMail($eventInstanceId)
{
    global $dbPdo;
    $deleteStatement = $dbPdo->prepare("DELETE FROM cronjob_mails WHERE reference = :eventInstanceId;");
    $deleteStatement->bindValue(':eventInstanceId', $eventInstanceId);
    $deleteStatement->execute();
}


function loadMailtemplate($name)
{
    global $BASE_PATH;
    return file_get_contents("$BASE_PATH/custom/mail_templates/$name");
}

function extractMailSubject($templateRaw, $templateName)
{
    $dom = new DOMDocument;
    $dom->loadHTML($templateRaw);
    foreach ($dom->getElementsByTagName('meta') as $node) {
        $name = $node->getAttribute('name');
        $content = $node->getAttribute('content');
        if ($name == "subject") {
            return $content;
        }
    }
    trigger_error("No subject found in the mail template '$templateName'. Make sure to set the meta tag: &lt;meta name='subject' content='mySubject'&gt;", E_USER_WARNING);
    return "";
}

function getUserList()
{
    global $dbPdo;

    //Select all user data
    $selectStatement = $dbPdo->query("SELECT `id`, `name`, `mail` FROM `Nutzer`;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //index by user's id
    $userList = array();
    foreach ($resultList as $user) {
        $userList[$user["id"]] = $user;
    }
    return $userList;
}

function beautifyEventInstance($eventInstance, $userList)
{
    //de-reference user ids to user names
    $eventInstance["assigneesInternal"] = dereferenceUserIds($eventInstance["assigneesInternal"], $userList);
    $eventInstance["assigneesPR"] = dereferenceUserIds($eventInstance["assigneesPR"], $userList);

    //convert arrays to comma separated lists
    foreach ($eventInstance as $key => $value) {
        if (is_array($value)) {
            $eventInstance[$key] = implode(", ", $value);
        }
    }

    return $eventInstance;
}

function dereferenceUserIds($idList, $userList)
{
    $userNames = array();
    foreach ($idList as $userId) {
        $userNames[] = $userList[$userId]["name"];
    }
    return $userNames;
}



function replacePlaceholders($templateRaw, $eventInstance)
{
    foreach ($eventInstance as $key => $value) {
        $templateRaw = str_replace("{" . $key . "}", $value, $templateRaw);
    }
    return $templateRaw;
}


function generateEventIcsAttachment($eventInstance, $isCancelled = false)
{
    $eventId = "STUBEGRU-" . getenv("APPLICATION_ID") . "-" . $eventInstance["id"];

    $startTimestampLocal = $eventInstance["startDate"] . " " . $eventInstance["startTime"];
    $startDateObject = DateTime::createFromFormat('Y-m-d H:i', $startTimestampLocal);
    $startTimestampUTC = gmdate("Ymd\THis\Z", $startDateObject->getTimestamp());

    $endTimestampLocal = $eventInstance["endDate"] . " " . $eventInstance["endTime"];
    $endDateObject = DateTime::createFromFormat('Y-m-d H:i', $endTimestampLocal);
    $endTimestampUTC = gmdate("Ymd\THis\Z", $endDateObject->getTimestamp());

    $eventSummary = $eventInstance["name"];
    $eventLocation = $eventInstance["location"];
    $eventDescription = ""; //TODO set event description

    if ($isCancelled) {
        $icsString = generateEventIcsString($eventId, $startTimestampUTC, $endTimestampUTC, $eventSummary, $eventDescription, $eventLocation, "100", "CANCELLED");
    } else {
        $icsString = generateEventIcsString($eventId, $startTimestampUTC, $endTimestampUTC, $eventSummary, $eventDescription, $eventLocation, "0", "CONFIRMED");
    }

    return array("name" => "event.ics", "content" => $icsString);
}


function generateEventIcsString($uid, $start, $end, $summary, $description, $location, $sequence, $status)
{
    $nowUTC = gmdate("Ymd\THis\Z");
    $eventData = array();

    $eventData[] = "BEGIN:VCALENDAR";
    $eventData[] = "VERSION:2.0";
    $eventData[] = "PRODID:-//stubegru.org/NONSGML Stubegru Event Management Module//EN";

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
