<?php

try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    require_once "$BASE_PATH/modules/event_management/event_instances/mailing/mailing_utils.php";
    permissionRequest("EVENT_INSTANCE_WRITE");
    $ownId = $_SESSION["id"];

    if (isset($_GET["eventInstanceId"])) {
        $eventInstanceId = $_GET["eventInstanceId"];
    } else {
        throw new Exception("Die Id '" . $_GET['eventInstanceId'] . "' ist keine gültige Id für eine Veranstaltung.", 404);
    }

    handleMailingOnCancel($eventInstanceId);

    echo json_encode(array("status" => "success", "message" => "Die Veranstaltung wurde erfolgreich abgesagt. Mails für das Absagen der Veranstaltung wurden erfolgreich an die verantwortlichen Menschen und an die PR Menschen versendet. Diese Veranstaltung bleibt weiterhin (als abgesagt) in der Liste sichtbar.", "mode" => "alert", "title" => "Veranstaltung abgesagt!"));

} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
