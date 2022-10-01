<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //Dont use this without auth normally!!!
require_once "$BASE_PATH/utils/permission_request.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";

$surveyId = $_POST["surveyId"];
$userHash = $_POST["userHash"];
$uniqueKey = $_POST["uniqueKey"];
$answers = $_POST["answers"];

//Get survey data from DB
$testStatement = $dbPdo->prepare("SELECT * FROM survey_survey WHERE id =:surveyId;");
$testStatement->bindValue(':surveyId', $surveyId);
$testStatement->execute();
$surveyData = $testStatement->fetch(PDO::FETCH_ASSOC);
if ($surveyData == false) {
    header("HTTP/1.1 404 The requested resource was not found");
    echo json_encode(array("status" => "error", "message" => "Could not find any survey with id $surveyId"));
    exit;
}

//Check for survey's auth permission
$permission = $surveyData["auth"];
permissionRequest($permission); //Exit with 401 if permission is not fulfilled

//Check for unique key
if ($surveyData["uniqueKey"] == "1") {
    $testStatement = $dbPdo->prepare("SELECT * FROM survey_keys WHERE surveyId =:surveyId AND uniqueKey = :uniqueKey;");
    $testStatement->bindValue(':surveyId', $surveyId);
    $testStatement->bindValue(':uniqueKey', $uniqueKey);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers > 0) {
        //valid key -> continue but remove this key
        $keyData = $testStatement->fetch(PDO::FETCH_ASSOC);
        $keyId = $keyData["id"];
        $deleteStatement = $dbPdo->prepare("DELETE FROM survey_keys WHERE id = ':keyId';");
        $deleteStatement->bindValue(':keyId', $keyId);
        $deleteStatement->execute();
    } else {
        //no valid key -> exit with 401
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(array("status" => "error", "message" => "401 Unauthorized - No valid unique answer key provided", "permission" => "uniqueKey"));
        exit;
    }
}

//save answers to db
$answerArray = json_decode($answers, true);
foreach ($answerArray as $currentAnswer) {
    $questionId = $currentAnswer["questionId"];
    $questionValue = isset($currentAnswer["value"]) ? $currentAnswer["value"] : "";

    $optionId = 0;
    if (isset($currentAnswer["optionId"]) && $currentAnswer["optionId"] != "") {
        $optionId = $currentAnswer["optionId"];
    }
    
    $insertStatement = $dbPdo->prepare("INSERT INTO `survey_answers`(`questionId`, `userHash`, `value`, `optionId`, `surveyId`) VALUES (:questionId,:userHash,:questionValue,:optionId,:surveyId);");
    $insertStatement->bindValue(':questionId', $questionId);
    $insertStatement->bindValue(':userHash', $userHash);
    $insertStatement->bindValue(':questionValue', $questionValue);
    $insertStatement->bindValue(':optionId', $optionId);
    $insertStatement->bindValue(':surveyId', $surveyId);
    $insertStatement->execute();
    $articleId = $dbPdo->lastInsertId();
}

echo json_encode(array("status" => "success", "message" => "Antworten erfolgreich gespeichert"));
