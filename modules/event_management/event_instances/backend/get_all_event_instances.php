<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_INSTANCE_READ");
    $ownId = $_SESSION["id"];

    $selectStatement = $dbPdo->query("SELECT * FROM `event_mgmt_instances`;");
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    $eventInstanceList = array();

    foreach ($attributeRowList as $attributeRow) {
        $eventInstanceId = $attributeRow["eventInstanceId"];
        $attributeKey = $attributeRow["attributeKey"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

        if (empty($eventInstanceList[$eventInstanceId])) {
            $eventInstanceList[$eventInstanceId] = array(); //Create new event type "object"
            $eventInstanceList[$eventInstanceId]["id"] = $eventInstanceId;
        }
        $eventInstance = &$eventInstanceList[$eventInstanceId]; 
        
        //Add current value as property to eventInstance Object. If this property is multiple -> create a list of properties at that point.
        if ($isMultiple) {
            if (empty($eventInstance[$attributeKey])) {
                $eventInstance[$attributeKey] = array(); //Create new list of values 
            }
            $eventInstance[$attributeKey][] = $attributeValue; //Add new value to list of values
        } else {
            $eventInstance[$attributeKey] = $attributeValue; //Add value as plain property
        }
    }
    echo json_encode($eventInstanceList);
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
