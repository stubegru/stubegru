<?php
try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_TYPE_READ");
    $ownId = $_SESSION["id"];

    if (isset($_GET["eventInstanceId"])) {
        $eventInstanceId = $_GET["eventInstanceId"];
    } else {
        throw new Exception("Die Id '" . $_GET['eventInstanceId'] . "' ist keine gültige Id für eine Veranstaltungskategorie.", 404);
    }

    $selectStatement = $dbPdo->prepare("SELECT * FROM `event_mgmt_types` WHERE eventInstanceId = :eventInstanceId;");
    $selectStatement->bindValue(':eventInstanceId', $eventInstanceId);
    $selectStatement->execute();
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    if (count($attributeRowList) <= 0) {
        throw new Exception("Veranstaltungskategorie mit der id '$eventInstanceId' wurde nicht gefunden.", 404);
    }

    $eventInstance = array();
    $eventInstance["id"] = $eventInstanceId;

    foreach ($attributeRowList as $attributeRow) {
        $attributeKey = $attributeRow["attributeKey"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

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
    echo json_encode($eventInstance);
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
