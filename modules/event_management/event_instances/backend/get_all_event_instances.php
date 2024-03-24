<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    require_once "$BASE_PATH/modules/event_management/event_instances/backend/event_instance_utils.php";
    permissionRequest("EVENT_INSTANCE_READ");
    
    $eventInstanceList = getAllEventInstances();
    echo json_encode($eventInstanceList);
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
