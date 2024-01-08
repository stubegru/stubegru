<?php

try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_TYPE_WRITE");
    $ownId = $_SESSION["id"];

    if (isset($_POST["eventInstanceId"])) {
        $eventInstanceId = $_POST["eventInstanceId"];
    } else {
        throw new Exception("Die Id '" . $_POST['eventInstanceId'] . "' ist keine gültige Id für eine Veranstaltungskategorie.", 404);
    }

    $deleteStatement = $dbPdo->prepare("DELETE FROM `event_mgmt_types` WHERE eventInstanceId = :eventInstanceId;");
    $deleteStatement->bindValue(':eventInstanceId', $eventInstanceId);
    $deleteStatement->execute();

    echo json_encode(array("status" => "success", "message" => "Veranstaltungskategorie mit der id '$eventInstanceId' erfolgreich gelöscht."));

} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
