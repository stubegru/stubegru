<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";

$surveyId = $_GET["surveyId"];

$testStatement = $dbPdo->prepare("SELECT * FROM survey_survey WHERE id =:surveyId");
$testStatement->bindValue(':surveyId', $surveyId);
$testStatement->execute();
$surveyData = $testStatement->fetch(PDO::FETCH_ASSOC);
//Check if there is valid survey data
if (!$surveyData) {
    header("HTTP/1.1 404 The requested resource was not found");
    echo json_encode(array("status" => "error", "message" => "Could not find any survey with id $surveyId"));
    exit;
}

$surveyName = $surveyData["title"];

//Check for auth (defined in survey data)
$permission = $surveyData["adminAuth"];
permission_required($permission);

//init questionArrayList
$csvHeaderList = array();
$csvHeaderList[0] = "userHash"; //first column is the userHash
$csvHeaderListIndex = 1;

//get list of all questions connected to this survey
$questionObjectList = array();
$selectStatement = $dbPdo->prepare("SELECT * FROM `survey_questions` WHERE `surveyId` = :surveyId");
$selectStatement->bindValue(':surveyId', $surveyId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $questionData) {
    $questionId = $questionData["id"];
    $questionTitle = $questionData["title"];

    $csvHeaderList[$csvHeaderListIndex] = $questionTitle; //Add questions title to csvHeader
    $questionObjectList[$questionId] = array("title" => $questionTitle, "id" => $questionId, "csvIndex" => $csvHeaderListIndex); //generate reference from questionId to csvHeaderIndex
    $csvHeaderListIndex++;
}
$csvColumnCount = $csvHeaderListIndex;

//get answers from db
$userList = array();
$selectStatement = $dbPdo->prepare("SELECT * FROM `survey_answers` WHERE `surveyId` = :surveyId");
$selectStatement->bindValue(':surveyId', $surveyId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $answerData) {
    $userHash = $answerData["userHash"];
    $questionId = $answerData["questionId"];
    $value = $answerData["value"];

    if (empty($userList[$userHash])) {
        $userList[$userHash] = array_fill(0, $csvColumnCount, "");;
        $userList[$userHash][0] = $userHash;
    }
    $csvListIndex = $questionObjectList[$questionId]["csvIndex"];
    $userList[$userHash][$csvListIndex] = $value;
}


//create overall csv map
$csvMap = array();
$csvMap[0] = $csvHeaderList;
foreach ($userList as $userEntry) {
    $csvMap[] = $userEntry;
}

// 4 ---Return data or status---
//Return data as CSV File
$output = fopen("php://output", 'w') or die("Can't open php://output");
header("Content-Type:application/csv");
header("Content-Disposition:attachment;filename=$surveyName.csv");
foreach ($csvMap as $csvLine) {
    fputcsv($output, $csvLine, ";");
}
fclose($output) or die("Can't close php://output");
