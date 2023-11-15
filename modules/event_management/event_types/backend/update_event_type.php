<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_TYPE_WRITE");
    $ownId = $_SESSION["id"];

    if (isset($_POST["eventTypeId"]) && is_numeric($_POST["eventTypeId"])) {
        $eventTypeId = $_POST["eventTypeId"];
    } else {
        throw new Exception("Die Id '" . $_POST['eventTypeId'] . "' ist keine gültige Id für eine Veranstaltungskategorie.", 404);
    }

    $jsonString = $_POST["eventTypeData"];
    $jsonList = json_decode($jsonString, true);

    //Remove old entries with this eventTypeId
    $deleteStatement = $dbPdo->prepare("DELETE FROM `event_mgmt_types` WHERE eventTypeId = :eventTypeId;");
    $deleteStatement->bindValue(':eventTypeId', $eventTypeId);
    $deleteStatement->execute();

    if ($deleteStatement->rowCount() <= 0) {
        throw new Exception("Die Veranstaltungskategorie mit der Id '" . $_POST['eventTypeId'] . "' konnte nicht gefunden werden.", 404);
    }

    //Insert new values
    $insertStatement = $dbPdo->prepare("INSERT INTO event_mgmt_types(eventTypeId, multiple, attributeKey, value) VALUES (:eventTypeId, :multiple, :attributeKey, :value)");

    foreach ($jsonList as $attributeData) {
        $attributeKey = $attributeData["key"];
        $attributeValue = $attributeData["value"];
        $isMultiple = $attributeData["isMultiple"] ? 1 : 0;

        $insertStatement->bindValue(':eventTypeId', $eventTypeId);
        $insertStatement->bindValue(':multiple', $isMultiple);
        $insertStatement->bindValue(':attributeKey', $attributeKey);
        $insertStatement->bindValue(':value', $attributeValue);
        $insertStatement->execute();
    }

    echo json_encode(array("status" => "success", "message" => "Veranstaltungskategorie mit der id '$eventTypeId' erfolgreich gespeichert.", "id" => $eventTypeId));
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
