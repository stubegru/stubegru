<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_TYPE_READ");
    $ownId = $_SESSION["id"];

    $selectStatement = $dbPdo->query("SELECT * FROM `event_mgmt_types`;");
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    $eventTypeList = array();

    foreach ($attributeRowList as $attributeRow) {
        $eventTypeId = $attributeRow["eventTypeId"];
        $attributeKey = $attributeRow["attributeKey"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

        if (empty($eventTypeList[$eventTypeId])) {
            $eventTypeList[$eventTypeId] = array(); //Create new event type "object"
            $eventTypeList[$eventTypeId]["id"] = $eventTypeId;
        }
        $eventType = &$eventTypeList[$eventTypeId]; 
        
        //Add current value as property to eventType Object. If this property is multiple -> create a list of properties at that point.
        if ($isMultiple) {
            if (empty($eventType[$attributeKey])) {
                $eventType[$attributeKey] = array(); //Create new list of values 
            }
            $eventType[$attributeKey][] = $attributeValue; //Add new value to list of values
        } else {
            $eventType[$attributeKey] = $attributeValue; //Add value as plain property
        }
    }
    echo json_encode($eventTypeList);
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
