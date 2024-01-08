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

    $jsonString = $_POST["eventInstanceData"];
    $jsonList = json_decode($jsonString, true);

    //Remove old entries with this eventInstanceId
    $deleteStatement = $dbPdo->prepare("DELETE FROM `event_mgmt_types` WHERE eventInstanceId = :eventInstanceId;");
    $deleteStatement->bindValue(':eventInstanceId', $eventInstanceId);
    $deleteStatement->execute();

    if ($deleteStatement->rowCount() <= 0) {
        throw new Exception("Die Veranstaltungskategorie mit der Id '" . $_POST['eventInstanceId'] . "' konnte nicht gefunden werden.", 404);
    }

    //Insert new values
    $insertStatement = $dbPdo->prepare("INSERT INTO event_mgmt_types(eventInstanceId, multiple, attributeKey, value) VALUES (:eventInstanceId, :multiple, :attributeKey, :value)");

    foreach ($jsonList as $attributeData) {
        $attributeKey = $attributeData["key"];
        $attributeValue = $attributeData["value"];
        $isMultiple = $attributeData["isMultiple"] ? 1 : 0;

        $insertStatement->bindValue(':eventInstanceId', $eventInstanceId);
        $insertStatement->bindValue(':multiple', $isMultiple);
        $insertStatement->bindValue(':attributeKey', $attributeKey);
        $insertStatement->bindValue(':value', $attributeValue);
        $insertStatement->execute();
    }

    echo json_encode(array("status" => "success", "message" => "Veranstaltungskategorie mit der id '$eventInstanceId' erfolgreich gespeichert.", "id" => $eventInstanceId));
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
