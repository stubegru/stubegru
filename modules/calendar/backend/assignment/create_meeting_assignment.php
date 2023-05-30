<?php
//Mit diesem Script wird ein Termin an einen zu Beratenden vergeben | Mails werden an Berater und zu Beratenden gesendet | Terminblockierung wird aufgehoben

// ----------- 1. Includes ------------
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/calendar/backend/assignment/assignment_utils.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
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

//Add current users id
$loggedInUserName = getUserName($loggedInUserId);
$extraData = array("currentUserName" => $loggedInUserName);

//Prepare complete dataList
$dataList = array();
$dataList["meeting"] = $meetingData;
$dataList["room"] = $roomData;
$dataList["client"] = $clientData;
$dataList["extra"] = $$extraData;

$replaceList = getReplaceList($dataList);


// ----------- 6. Generate ICS File ------------
$icsAttachment = generateIcsAttachment($dataList);



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

$AdvisorMailText = "TO BECOME BETTER";
//Load default text from template file
//Replace default text by text from custom/config.json
//Replace template variables

$AdvisorMailSubject = "Stubegru Termin vergeben am " . $meetingData["datePretty"];
//Set default subject 
//Replace default subject by subject from custom/config.json
//Replace template variables



try {
    $toReturn["advisorMail"] = array("address" => $meetingData["ownerMail"]);
    stubegruMail($meetingData["ownerMail"], $AdvisorMailSubject, $AdvisorMailText, $advisorMailOptions);
    $toReturn["advisorMail"]["status"] = "success";
} catch (Exception $e) {
    $toReturn["advisorMail"]["status"] = "error";
    $toReturn["status"] = "warning";
}


// ----------- 9. Unblock Meeting ------------
$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET blocked = '0' WHERE id = :meetingId");
$updateStatement->bindValue(':meetingId', $meetingId);
$updateStatement->execute();



// ----------- 10. Return global feedback ------------
echo json_encode($toReturn);
