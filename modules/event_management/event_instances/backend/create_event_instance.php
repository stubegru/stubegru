<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    require_once "$BASE_PATH/modules/event_management/event_instances/mailing/mailing_utils.php";
    permissionRequest("EVENT_INSTANCE_WRITE");
    $ownId = $_SESSION["id"];

    $jsonString = $_POST["eventInstanceData"];
    $jsonList = json_decode($jsonString, true);

    $eventInstanceId = uniqid(); //Generate a random and mostly unique id for this event instance

    $insertStatement = $dbPdo->prepare("INSERT INTO event_mgmt_instances(eventInstanceId, multiple, attributeKey, value) VALUES (:eventInstanceId, :multiple, :attributeKey, :value)");

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

    //Send Mails to assignees
    try {
        handleMailingOnCreate($eventInstanceId);
    } catch (\Throwable $th) {
        echo json_encode(array("status" => "warning", "message" => "Die Veranstaltung wurde erfolgreich erstellt. Jedoch trat ein <b>Fehler</b> auf beim Versand der Mails an die Verantwortlichen:" . $th->getMessage(), "id" => $eventInstanceId));
        exit;
    }

    echo json_encode(array("status" => "success", "message" => "Veranstaltung mit der id '$eventInstanceId' erfolgreich erstellt. Es wurden Mails an die Verantwortlichen versendet und Erinnerungsmails vorgemerkt.", "id" => $eventInstanceId));
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
