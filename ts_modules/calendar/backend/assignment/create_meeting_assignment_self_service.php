<?php
//Mit diesem Script wird ein Termin an einen zu Beratenden vergeben | Mails werden an Berater und zu Beratenden gesendet | Terminblockierung wird aufgehoben

// ----------- 1. Includes ------------
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/ts_modules/calendar/backend/assignment/assignment_utils.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
require_once "$BASE_PATH/utils/permission_request.php";



permissionRequest("CALENDAR_SELF_SERVICE");

$toReturn = array();
$toReturn["status"] = "success";
$toReturn["clientData"] = array("status" => "warning");
$toReturn["assign"] = array("status" => "warning");
$toReturn["survey"] = array("status" => "warning");
$toReturn["clientMail"] = array("status" => "warning");
$toReturn["advisorMail"] = array("status" => "warning");



// ----------- 2. Post Parameter ------------
$meetingId = $_POST["meetingId"];

$clientData = array();
$clientData["name"] = $_POST["name"];
$clientData["description"] = $_POST["description"];
$clientData["mail"] = $_POST["mail"];
$clientData["phone"] = $_POST["phone"];
$clientData["survey"] = $_POST["formular"]; //!Naming!
$clientData["channel"] = $_POST["channel"];


// ----------- 3. Consistency checks ------------
//Meeting should now be blocked by the current user, if not -> exit;
//TODO: what if the current user IS logged in => check with $ANONYMOUS_BLOCK_ID will fail
$ANONYMOUS_BLOCK_ID = -1;
meetingShouldBeBlockedBy($meetingId, $ANONYMOUS_BLOCK_ID);

//Meeting must not be assigned yet, else -> exit
meetingShouldBeUnassigned($meetingId);


// ----------- 4. Assign Meeting ------------
//Insert client data
try {
    $clientData["id"] = saveClientData($meetingId, $clientData);
    $toReturn["clientData"]["status"] = "success";
    $toReturn["clientData"]["message"] = "Die Kundendaten wurden erfolgreich gespeichert.";
} catch (Exception $e) {
    $toReturn["status"] = "error";
    $toReturn["clientData"]["status"] = "error";
    $toReturn["clientData"]["message"] = "Die Kundendaten konnten nicht gespeichert werden. Die Terminvergabe wird abgebrochen.";
    echo json_encode($toReturn);
    exit;
}
//Add reference in meeting's table
try {
    $clientData["id"] = assignMeetingTo($meetingId, $clientData["id"]);
    $toReturn["assign"]["status"] = "success";
    $toReturn["assign"]["message"] = "Der Termin wurde erfolgreich an den Kunden <b>" . $clientData["name"] . "</b> vergeben.";
} catch (Exception $e) {
    $toReturn["status"] = "error";
    $toReturn["assign"]["status"] = "error";
    $toReturn["assign"]["message"] = "Der Termin konnte nicht an den Kunden vergeben werden. Die Terminvergabe wird abgebrochen.";
    echo json_encode($toReturn);
    exit;
}


// ----------- 5. Collect data for mails ------------
$meetingData = getMeetingData($meetingId);
$roomData = getRoomData($meetingData["room"]);

makeDataPretty($meetingData, $clientData);
$replaceList = getReplaceList($meetingData, $clientData, $roomData);



// ----------- 5.1 Schedule evaluation mail ------------
try {
    $toReturn["survey"]["message"] = "Auf Wunsch des Kunden wurde <b>keine</b> Mailadresse zum Feedbackfragebogen hinterlegt.";
    if ($clientData["survey"] == "1") {
        $toReturn["survey"]["message"] = "Die Mailadresse <b>" . $clientData["mail"] . "</b> wurde erfolgreich zum Feedbackfragebogen hinterlegt.";
        bookmarkEvaluationMail($meetingData["date"], $clientData["mail"]);
    }
    $toReturn["survey"]["status"] = "success";
} catch (Exception $e) {
    $toReturn["status"] = "warning";
    $toReturn["survey"]["message"] = "Die Mailadresse <b>" . $clientData["mail"] . "</b> konnte nicht für den Feedbackfragebogen hinterlegt werden.";
    $toReturn["survey"]["error"] = $e->getMessage();
}


// ----------- 6. Generate ICS File ------------
$icsAttachment = generateIcsAttachment($meetingData, $clientData, $roomData);



// ----------- 7.1 Get Client's Mail Content ------------
$clientMailContent = generateClientMailData($meetingData, $replaceList);
$toReturn["clientMail"]["content"] = $clientMailContent["text"];
$toReturn["clientMail"]["ics"] = $icsAttachment["content"];
$toReturn["clientMail"]["address"] = $clientData["mail"];

// ----------- 7.2 Send Client's Mail ------------
try {
    sendClientMail($meetingData, $clientData, $replaceList, $icsAttachment);
    $toReturn["clientMail"]["status"] = "success";
    $toReturn["clientMail"]["message"] = "Eine Bestätigungsmail wurde erfolgreich an <b>" . $clientData["mail"] . "</b> versandt.";
} catch (Exception $e) {
    $toReturn["status"] = "warning";
    $toReturn["clientMail"]["message"] = "Es konnte keine Bestätigungsmail an <b>" . $clientData["mail"] . "</b> versandt werden.";
}


// ----------- 8. Send advisor's mail ------------

try {
    sendAdvisorMail($meetingData, $replaceList, $icsAttachment);
    $toReturn["advisorMail"]["status"] = "success";
    $toReturn["advisorMail"]["message"] = "Eine Bestätigungsmail wurde erfolgreich an <b>" . $meetingData["ownerMail"] . "</b> versandt.";
} catch (Exception $e) {
    $toReturn["clientMail"]["message"] = "Es konnte keine Bestätigungsmail an <b>" . $meetingData["ownerMail"] . "</b> versandt werden.";
    $toReturn["status"] = "warning";
}


// ----------- 9. Unblock Meeting ------------
unblockMeeting($meetingId);


// ----------- 10. Return global feedback ------------
echo json_encode($toReturn);
