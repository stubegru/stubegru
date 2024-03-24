<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    require_once "$BASE_PATH/modules/event_management/event_instances/backend/event_instance_utils.php";
    permissionRequest("EVENT_INSTANCE_READ");
    $ownId = $_SESSION["id"];

    if (isset($_GET["eventInstanceId"])) {
        $eventInstanceId = $_GET["eventInstanceId"];
    } else {
        throw new Exception("Die Id '" . $_GET['eventInstanceId'] . "' ist keine gültige Id für eine Veranstaltung.", 404);
    }

    $eventInstance = getAllEventInstances($eventInstanceId);
    echo json_encode($eventInstance);
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
