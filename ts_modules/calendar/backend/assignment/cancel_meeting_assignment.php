<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/ts_modules/calendar/backend/assignment/assignment_utils.php";
permissionRequest("REMOVE_ASSIGNMENT");


// --- POST Params ---
$meetingId = $_POST["meetingId"];


// --- Load meeting data ---
$meetingData = getMeetingData($meetingId);
if (!$meetingData) {
    echo json_encode(array("status" => "error", "message" => "Löschen der Kundendaten fehlgeschlagen. Der Termin mit der Id '$meetingId' konnte nicht gefunden werden."));
    exit;
}


// --- Get Client-data from DB ---
$clientData = getClientData($meetingData["teilnehmer"]);
if (!$clientData) {
    $clientId = $meetingData["teilnehmer"];
    echo json_encode(array("status" => "error", "message" => "Löschen der Kundendaten fehlgeschlagen. Der Kundendatensatz mit der Id '$clientId' konnte nicht gefunden werden."));
    exit;
}


// --- Load room data ---
$roomData = getRoomData($meetingData["room"]);


// --- Remove data and refs in DB ---
removeClientData($meetingData["teilnehmer"], $meetingId);


// --- Get replace list
makeDataPretty($meetingData, $clientData);
$replaceList = getReplaceList($meetingData, $clientData, $roomData);


// --- Prepare ICS cancel event ---
$icsAttachment = generateIcsAttachment($meetingData, $clientData, $roomData, true);


// --- Send advisor mail ---
try {
    sendAdvisorCancelMail($meetingData, $replaceList, $icsAttachment);
} catch (\Throwable $th) {
    echo json_encode(array("status" => "warning", "message" => "Die Kundendaten wurden gelöscht und der Termin wurde erfolgreich freigegeben. Die Mails an der Beratenden und den Kunden konnten aber <b>nicht</b> versendet werden. "));
    exit;
}


// --- Send client mail ---
try {
    sendClientCancelMail($clientData["mail"], $meetingData, $replaceList, $icsAttachment);
} catch (\Throwable $th) {
    $clientMail = $clientData["mail"];
    echo json_encode(array("status" => "warning", "message" => "Die Kundendaten wurden gelöscht und der Termin wurde erfolgreich freigegeben. Die Mail an den Kunden ($clientMail) konnte <b>nicht</b> versendet werden."));
    exit;
}

//Erfolg melden
echo json_encode(array("status" => "success", "message" => "Der Kunde wurde erfolgreich von diesem Termin abgemeldet. Es wurde eine Mail mit einer Terminabsage an den Beratenden und an den Kunden versendet."));
