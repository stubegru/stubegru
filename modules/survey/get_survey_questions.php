<?php //Important, use this allways at the start!!!

// Get all survey questions with answer options for a specific survey defined by surveyId

// 1 ---Include utils---
//Init SQL Connection
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //Dont use this normally!!!
require_once "$BASE_PATH/utils/permission_request.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";

// 2 ---Read parameter---
//Get surveyId from POST Parameter
$surveyId = $_GET["surveyId"];
$uniqueKey = "";
if (isset($_GET["uniqueKey"])) {
    $uniqueKey = $_GET["uniqueKey"];
}

// 3 ---Individual Logic / DB Access---
//Get survey data from SURVEY_SURVEY table (SQL)
$returnArray = array();

$testStatement = $dbPdo->prepare("SELECT * FROM survey_survey WHERE id =:surveyId");
$testStatement->bindValue(':surveyId', $surveyId);
$testStatement->execute();
$surveyData = $testStatement->fetch(PDO::FETCH_ASSOC);
//Check if there is valid survey data
if ($surveyData == false) {
    header("HTTP/1.1 404 The requested resource was not found");
    echo json_encode(array("status" => "error", "message" => "Could not find any survey with id $surveyId"));
    exit;
}

//Check for auth (defined in survey data)
$permission = $surveyData["auth"];
permissionRequest($permission);
//=> if not: exit and return 401 Unauthorized
//=> if yes: (check for unique key)
$uniqueKeyRequired = $surveyData["uniqueKey"];

if ($uniqueKeyRequired == "1") {
    $testStatement = $dbPdo->prepare("SELECT * FROM survey_keys WHERE surveyId =:surveyId AND uniqueKey = :uniqueKey");
    $testStatement->bindValue(':surveyId', $surveyId);
    $testStatement->bindValue(':uniqueKey', $uniqueKey);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers > 0) {
        $surveyData["validKey"] = "1";
    } else {
        $surveyData["validKey"] = "0";
    }
}

//Get all questions from SURVEY_QUESTION table (SQL)
$surveyData["questions"] = array();
$selectStatement = $dbPdo->prepare("SELECT * FROM `survey_questions` WHERE `surveyId` = :surveyId");
$selectStatement->bindValue(':surveyId', $surveyId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $questionData) {
    //For each question
    $questionId = $questionData["id"];
    $questionData["options"] = array();
    //Get answer options for this question from SURVEY_ANSWER_OPTIONS table (SQL)
    $selectStatement = $dbPdo->prepare("SELECT * FROM `survey_answer_options` WHERE `questionId` = :questionId");
    $selectStatement->bindValue(':questionId', $questionId);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultList as $answerOptionData) {
        //Add data to array
        $questionData["options"][] = $answerOptionData;
    }
    //Add question data as new row in surveyData["questions"]
    $surveyData["questions"][$questionId] = $questionData;
}

// 4 ---Return data or status---
//Return data from array as JSON
echo json_encode($surveyData);
