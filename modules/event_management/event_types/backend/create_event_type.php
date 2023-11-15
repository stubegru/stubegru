<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_TYPE_WRITE");
    $ownId = $_SESSION["id"];

    $jsonString = $_POST["eventTypeData"];
    $jsonList = json_decode($jsonString,true);

    $eventTypeId = uniqid(); //Generate a random and mostly unique id for this event type

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

    echo json_encode(array("status" => "success", "message" => "Veranstaltungskategorie mit der id '$eventTypeId' erfolgreich erstellt.", "id" => $eventTypeId));

} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
