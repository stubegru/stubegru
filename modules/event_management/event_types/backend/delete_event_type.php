<?php

try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_TYPE_WRITE");
    $ownId = $_SESSION["id"];

    if (isset($_POST["eventTypeId"])) {
        $eventTypeId = $_POST["eventTypeId"];
    } else {
        throw new Exception("Die Id '" . $_POST['eventTypeId'] . "' ist keine gültige Id für eine Veranstaltungskategorie.", 404);
    }

    $deleteStatement = $dbPdo->prepare("DELETE FROM `event_mgmt_types` WHERE eventTypeId = :eventTypeId;");
    $deleteStatement->bindValue(':eventTypeId', $eventTypeId);
    $deleteStatement->execute();

    echo json_encode(array("status" => "success", "message" => "Veranstaltungskategorie mit der id '$eventTypeId' erfolgreich gelöscht."));

} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
