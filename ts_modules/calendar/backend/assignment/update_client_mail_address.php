<?php
//Mit diesem Script wird die Mailadresse eines Beratenden geändert | Mails an den zu Beratenden werden erneut gesendet

// ----------- 1. Includes ------------
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/calendar/backend/assignment/assignment_utils.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permissionRequest("REMOVE_ASSIGNMENT");
$loggedInUserId = $_SESSION["id"];

$toReturn = array();
$toReturn["status"] = "success";
$toReturn["clientData"] = array("status" => "error");
$toReturn["assign"] = array("status" => "error");
$toReturn["survey"] = array("status" => "error");
$toReturn["clientMail"] = array("status" => "error");
$toReturn["advisorMail"] = array("status" => "error");


// ----------- 2. Post Parameter ------------
$meetingId = $_POST["meetingId"];
$clientMail = $_POST["clientMail"];


// ---------- 3. Get Meeting Data------------

$meetingData = getMeetingData($meetingId);
$clientId = $meetingData["teilnehmer"];

if (!$clientId) {
    $toReturn["status"] = "error";
    $toReturn["message"] = "Für dieses Meeting konnten keine gültigen Kundendaten gefunden werden";
    echo json_encode($toReturn);
    exit;
}


// ----------- 4. Update client data ------------
try {
    updateClientMail($clientId, $clientMail);
    $toReturn["clientData"]["status"] = "success";
    $toReturn["clientData"]["message"] = "Die Mailadresse wurden erfolgreich in den Kundendaten aktualisiert.";
} catch (Exception $e) {
    $toReturn["status"] = "error";
    $toReturn["clientData"]["message"] = "Die Kundendaten konnten nicht aktualisiert werden.";
    exit;
}

$toReturn["assign"]["status"] = "success";
$toReturn["assign"]["message"] = "Der Termin wurde bereits erfolgreich an den Kunden vergeben.";


// ----------- 5. Collect data for mails ------------
$clientData = getClientData($clientId);
$roomData = getRoomData($meetingData["room"]);

makeDataPretty($meetingData, $clientData);
$replaceList = getReplaceList($meetingData, $clientData, $roomData);



// ----------- 5.1 Schedule evaluation mail ------------
try {
    $toReturn["survey"]["message"] = "Auf Wunsch des Kunden wurde <b>keine</b> Mailadresse zum Feedbackfragebogen hinterlegt.";
    if ($clientData["formular"] == "1") {
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



// ----------- 7. Send Client's Mail ------------
try {
    sendClientMail($meetingData, $clientData, $replaceList, $icsAttachment);
    $toReturn["clientMail"]["status"] = "success";
    $toReturn["clientMail"]["message"] = "Eine Bestätigungsmail wurde erfolgreich an <b>" . $clientData["mail"] . "</b> versandt.";
} catch (Exception $e) {
    $toReturn["status"] = "warning";
    $toReturn["clientMail"]["message"] = "Es konnte keine Bestätigungsmail an <b>" . $clientData["mail"] . "</b> versandt werden.";
}


// ----------- 8. Send advisor's mail ------------

$toReturn["advisorMail"]["status"] = "success";
$toReturn["advisorMail"]["message"] = "Eine Bestätigungsmail an den Berater wurde <b>nicht erneut</b> versandt.";



// ----------- 9. Return global feedback ------------
echo json_encode($toReturn);
