<?php

function getEventInstance($eventInstanceId){
    global $dbPdo;

    $selectStatement = $dbPdo->prepare("SELECT * FROM `event_mgmt_instances` WHERE eventInstanceId = :eventInstanceId;");
    $selectStatement->bindValue(':eventInstanceId', $eventInstanceId);
    $selectStatement->execute();
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    if (count($attributeRowList) <= 0) {
        throw new Exception("Veranstaltung mit der id '$eventInstanceId' wurde nicht gefunden.", 404);
    }

    $eventInstance = eventInstancesAsArrays($attributeRowList)[$eventInstanceId];
    return $eventInstance;
}

function getAllEventInstances(){
    global $dbPdo;

    $selectStatement = $dbPdo->query("SELECT * FROM `event_mgmt_instances`;");
    $attributeRowList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    return eventInstancesAsArrays(($attributeRowList));
}

function eventInstancesAsArrays($attributeRowList){
    $eventInstanceList = [];

    foreach ($attributeRowList as $attributeRow) {
        $eventInstanceId = $attributeRow["eventInstanceId"];
        $attributeKey = $attributeRow["attributeKey"];
        $attributeValue = $attributeRow["value"];
        $isMultiple = $attributeRow["multiple"];

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

    return $eventInstanceList;
}