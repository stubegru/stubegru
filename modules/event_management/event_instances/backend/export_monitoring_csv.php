<?php

$eventInstanceInterface = [
    "id" => "",
    "name" => "",
    "category" => "",
    "isCancelled" => "",
    "assigneesInternal" => "",
    "startDate" => "",
    "startTime" => "",
    "endDate" => "",
    "endTime" => "",
    "location" => "",
    "cooperation" => "",
    "maxParticipants" => "",
    "notes" => "",
    "reminderInternal" => "",
    "participantsCount" => "",
    "expenseZSB" => "",
    "expenseSHK" => "",
    "monitoringNotes" => "",
    "assigneesPR" => "",
    "distributerPR" => "",
    "reminderPR" => "",
    "announcementPR" => "",
];

try {
    $BASE_PATH = getenv("BASE_PATH");
    require_once "$BASE_PATH/utils/auth_and_database.php";
    permissionRequest("EVENT_INSTANCE_READ");
    $ownId = $_SESSION["id"];

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



    /**********************************
     ***** HANDLE EVENT TYPES
     **********************************/

    //Define allowed event type props
    $ALLOWED_EVENT_TYPE_PROPERTIES = [
        "id",
        "name",
        "descriptionInternal",
        "descriptionExternal",
        "visible",
        "targetGroups",
        "assigneesInternal",
        "assigneesExternal"
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
            continue; //Ignore this property, if it is not in the list of allowed props
        }

        //Inject user data
        if ($attributeKey == "assigneesInternal" && !empty($attributeValue)) {
            $attributeValue = $userList[$attributeValue];
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


    //Fetch all event instance data from DB
    $selectStatement = $dbPdo->query("SELECT * FROM `event_mgmt_instances`;");
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //Iterate through fetched data snippets and build event instance datasets
    $eventInstanceList = array();
    foreach ($attributeRowList as $attributeRow) {
        $eventInstanceId = $attributeRow["eventInstanceId"];
        $attributeKey = $attributeRow["attributeKey"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

        //Inject user data
        if (($attributeKey == "assigneesInternal" || $attributeKey == "assigneesPR")  && !empty($attributeValue)) {
            $attributeValue = $userList[$attributeValue]["name"];
        }

        //Inject eventType data
        if ($attributeKey == "category" && !empty($attributeValue)) {
            $attributeValue = $eventTypeList[$attributeValue]["name"];
        }



        //check if that eventInstance is already present in the list
        if (empty($eventInstanceList[$eventInstanceId])) {
            $eventInstanceList[$eventInstanceId] = $eventInstanceInterface; //Create new event instance "object"
            $eventInstanceList[$eventInstanceId]["id"] = $eventInstanceId;
        }
        $eventInstance = &$eventInstanceList[$eventInstanceId];

        //Add current value as property to eventInstance Object. If this property is multiple -> create a pipe separated list of properties at that point.
        $valueField = &$eventInstance[$attributeKey];
        if ($isMultiple && !empty($valueField)) {
            $valueField .= " | " . $attributeValue; //Add new value to pipe separated list of values
        } else {
            $valueField = $attributeValue; //Add value as plain property
        }
    }

    //Return data as CSV File
    $output = fopen("php://output", 'w') or die("Can't open php://output");
    header("Content-Type:application/csv");
    header("Content-Disposition:attachment;filename=" . date("Y-m-d") . " Event Management Monitoring.csv");

    fputcsv($output, array_keys($eventInstanceInterface), ";"); //Write the header row (property names)
    foreach ($eventInstanceList as $csvLine) {
        fputcsv($output, $csvLine, ";"); //Write a single event instance dataset
    }

    fclose($output) or die("Can't close php://output");
} catch (\Throwable $th) {
    echo json_encode(array("status" => "error", "message" => $th->getMessage()));
    exit;
}
