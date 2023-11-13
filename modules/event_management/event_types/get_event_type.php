<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_TYPE_READ");
    $ownId = $_SESSION["id"];

    if (isset($_GET["eventTypeId"]) && is_numeric($_GET["eventTypeId"])) {
        $eventTypeId = $_GET["eventTypeId"];
    } else {
        throw new Exception("Die Id '" . $_GET['eventTypeId'] . "' ist keine gültige Id für eine Veranstaltungskategorie.", 404);
    }

    $selectStatement = $dbPdo->prepare("SELECT * FROM `event_mgmt_types` WHERE eventTypeId = :eventTypeId;");
    $selectStatement->bindValue(':eventTypeId', $eventTypeId);
    $selectStatement->execute();
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    if (count($attributeRowList) <= 0) {
        throw new Exception("Veranstaltungskategorie mit der id '$eventTypeId' wurde nicht gefunden.", 404);
    }

    $eventType = array();
    $eventType["id"] = $eventTypeId;

    foreach ($attributeRowList as $attributeRow) {
        $attributeId = $attributeRow["attributeId"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

        //Add current value as property to eventType Object. If this property is multiple -> create a list of properties at that point.
        if ($isMultiple) {
            if (empty($eventType[$attributeId])) {
                $eventType[$attributeId] = array(); //Create new list of values 
            }
            $eventType[$attributeId][] = $attributeValue; //Add new value to list of values
        } else {
            $eventType[$attributeId] = $attributeValue; //Add value as plain property
        }
    }
    echo json_encode($eventType);
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
