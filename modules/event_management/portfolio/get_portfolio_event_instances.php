<?php
try {
    //Get DB access without authorization
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/database_without_auth.php";

    //Read filter query
    $filterQuery = isset($_GET["filter"]) ? $_GET["filter"] : "";

    /**********************************
     ***** HANDLE EVENT TYPES
     **********************************/

    //Define allowed event type props
    $ALLOWED_EVENT_TYPE_PROPERTIES = [
        "name",
        "id",
        "descriptionInternal",
        "descriptionExternal",
        "targetGroups",
        "assigneesInternal"
    ];

    //Select all event type data
    $selectStatement = $dbPdo->query("SELECT * FROM `event_mgmt_types`;");
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
    $eventTypeList = array();

    //Convert to associative array
    foreach ($attributeRowList as $attributeRow) {
        $eventTypeId = $attributeRow["eventTypeId"];
        $attributeKey = $attributeRow["attributeKey"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

        if (array_search($attributeKey, $ALLOWED_EVENT_TYPE_PROPERTIES) === false) {
            continue; //Ignore this property, if it is not in the lit of allowed props
        }

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

    /**********************************
     ***** HANDLE USER DATA
     **********************************/

    //Select all user data
    $selectStatement = $dbPdo->query("SELECT `id`, `name`, `mail` FROM `Nutzer`;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //index by user's id
    $userList = array();
    foreach ($resultList as $user) {
        $userList[$user["id"]] = $user;
    }

    //Select all event instance data matching the filter
    //for each instance:
    //build json:
    //filtering properties
    //adding category data
    //adding user data


    /**********************************
     ***** HANDLE EVENT INSTANCES
     **********************************/

    //Define allowed event type props
    $ALLOWED_EVENT_INSTANCE_PROPERTIES = [
        "id",
        "name",
        "category",
        "isCancelled",
        "assigneesInternal",
        "startDate",
        "startTime",
        "endDate",
        "endTime",
        "location",
        "cooperation",
        "maxParticipants",
        "notes",
        "reminderInternal",
        "participantsCount",
        "expenseZSB",
        "expenseSHK",
        "monitoringNotes",
        "assigneesPR",
        "distributerPR",
        "reminderPR",
        "announcementPR"
    ];

    $selectStatement = $dbPdo->query("SELECT * FROM `event_mgmt_instances`;");
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    $eventInstanceList = array();

    foreach ($attributeRowList as $attributeRow) {
        $eventInstanceId = $attributeRow["eventInstanceId"];
        $attributeKey = $attributeRow["attributeKey"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

        //Filter for allowed props
        if (array_search($attributeKey, $ALLOWED_EVENT_INSTANCE_PROPERTIES) === false) {
            continue; //Ignore this property, if it is not in the lit of allowed props
        }

        //Inject user data
        if ($attributeKey == "assigneesInternal" && !empty($attributeValue)) {
            $attributeValue = $userList[$attributeValue];
        }

        //Inject event type data
        if ($attributeKey == "category" && !empty($attributeValue)) {
            $attributeValue = $eventTypeList[$attributeValue];
        }

        if (empty($eventInstanceList[$eventInstanceId])) {
            $eventInstanceList[$eventInstanceId] = array(); //Create new event instance "object"
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
