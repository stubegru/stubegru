<?php
//Mit diesem Script wird ein Termin an einen zu Beratenden vergeben | Mails werden an Berater und zu Beratenden gesendet | Terminblockierung wird aufgehoben

// ----------- 1. Includes ------------
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/calendar/dates/meeting_utils.php";
permissionRequest("ASSIGN_DATE");
$loggedInUserId = $_SESSION["id"];

$toReturn = array();
$toReturn["status"] = "success";


// ----------- 2. Post Parameter ------------
$meetingId = $_POST["dateId"];

$clientData = array();
$clientData["name"] = $_POST["name"];
$clientData["issue"] = $_POST["issue"];
$clientData["mail"] = $_POST["mail"];
$clientData["phone"] = $_POST["phone"];
$clientData["survey"] = $_POST["survey"];
$clientData["channel"] = isset($_POST["channel"]) ? $_POST["channel"] : "unknown"; //Channel attribute will only be set by calendar2 frontend


// ----------- 3. Consistency checks ------------
//Meeting should now be blocked by the current user, if not -> exit;
meetingShouldBeBlockedBy($meetingId, $loggedInUserId);

//Meeting must not be assigned yet, else -> exit
meetingShouldBeUnassigned($meetingId);


// ----------- 4. Assign Meeting ------------
//Insert client data and add reference in meeting's table
try {
    $clientData["id"] = assignMeetingTo($meetingId, $clientData);
    $toReturn["assign"] = array("status" => "success");
} catch (Exception $e) {
    $toReturn["status"] = "warning";
    $toReturn["assign"] = array("status" => "error");
}

//Add an entry in the Feedback_mails DB, if required
try {
    if ($clientWantsFormular == "1") {
        bookmarkFeedbackMail($meetingId, $mailAdress);
    }
    $toReturn["survey"] = array("status" => "success", "requested" => $clientWantsFormular);
} catch (Exception $e) {
    $toReturn["status"] = "warning";
    $toReturn["survey"] = array("status" => "error");
}


// ----------- 5. Collect data for mails ------------
$meetingData = getMeetingData($meetingId);
$roomData = getRoomData($meetingData["room"]);

//Translate channel to human readable channel
$clientData["channelPretty"] = prettyChannelName($clientData["channel"]);

//Get advisor's mail address
$meetingData["ownerMail"] = getUserMail($meetingData["ownerId"]);

//Format date to dd.mm.yyyy
$meetingData["datePretty"] = DateTime::createFromFormat('Y-m-d', $meetingData["date"])->format('d.m.Y');

$replaceList = getReplaceList($meetingData, $clientData, $roomData);


// ----------- 6. Generate ICS File ------------
$icsAttachment = generateIcsAttachment($meetingData, $clientData, $roomData, $replaceList);



// ----------- 7. Send Client's Mail ------------
$templateData = getTemplateData($meetingData["template"]);
$templateData["text"] = replaceVariables($templateData["text"], $replaceList);
$templateData["betreff"] = replaceVariables($templateData["betreff"], $replaceList);

$clientMailOptions = array(
    "attachment" => $icsAttachment,
    "replyTo" => array("name" => $meetingData["owner"], "address" => $meetingData["ownerMail"])
);

try {
    $toReturn["clientMail"] = array("template" => $templateData["title"], "address" => $clientData["mail"]);
    stubegruMail($clientData["mail"], $templateData["subject"], $templateData["text"], $clientMailOptions);
    $toReturn["clientMail"]["status"] = "success";
} catch (Exception $e) {
    $toReturn["clientMail"]["status"] = "error";
    $toReturn["status"] = "warning";
}


// ----------- 8. Send advisor's mail ------------

$advisorMailOptions = array("attachment" => $icsAttachment);
$loggedInUserName = getUserName($loggedInUserId);

$AdvisorMailText = "";

$AdvisorMailSubject = "Termin vergeben am $dateDate";


try {
    stubegruMail($dateOwnerMailAdress, $AdvisorMailSubject, $AdvisorMailText, $advisorMailOptions);
} catch (Exception $e) {
    echo json_encode(array("status" => "warning", "message" => "Der Termin wurde erfolgreich vergeben. Allerdings konnte keine Mail an den Berater versendet werden. Die Mail an den Kunden wurde bereits versendet."));
    exit;
}

//Terminblock freigeben
$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET blocked = '0' WHERE id = :meetingId");
$updateStatement->bindValue(':meetingId', $meetingId);
$updateStatement->execute();

//Erfolg melden
echo json_encode($toReturn);
