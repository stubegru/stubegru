<?php

function loadMailtemplate($name){
    global $BASE_PATH;
    return file_get_contents("$BASE_PATH/custom/mail_templates/$name");
}

function replacePlaceholders($templateRaw,$eventInstance){
    foreach ($eventInstance as $key => $value) {
        $templateRaw = str_replace("{$key}", $value, $templateRaw);
    }
    return $templateRaw;
}


function generateIcsAttachment($eventInstance, $isCancelled = false)
{
    $eventId = "STUBEGRU-" . getenv("APPLICATION_ID") . "-" . $eventInstance["id"];

    $startTimestampLocal = $eventInstance["startDate"] . " " . $eventInstance["startTime"];
    $startDateObject = DateTime::createFromFormat('Y-m-d H:i:s', $startTimestampLocal);
    $startTimestampUTC = gmdate("Ymd\THis\Z", $startDateObject->getTimestamp());

    $endTimestampLocal = $eventInstance["endDate"] . " " . $eventInstance["endTime"];
    $endDateObject = DateTime::createFromFormat('Y-m-d H:i:s', $endTimestampLocal);
    $endTimestampUTC = gmdate("Ymd\THis\Z", $endDateObject->getTimestamp());

    $eventSummary = $eventInstance["name"];
    $eventLocation = $eventInstance["location"];
    $eventDescription = ""; //TODO set event description

    if ($isCancelled) {
        $icsString = generateIcsString($eventId, $startTimestampUTC, $endTimestampUTC, $eventSummary, $eventDescription, $eventLocation, "100", "CANCELLED");
    } else {
        $icsString = generateIcsString($eventId, $startTimestampUTC, $endTimestampUTC, $eventSummary, $eventDescription, $eventLocation, "0", "CONFIRMED");
    }

    return array("name" => "event.ics", "content" => $icsString);
}


function generateIcsString($uid, $start, $end, $summary, $description, $location, $sequence, $status)
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