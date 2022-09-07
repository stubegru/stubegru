<?php

/**
 * Check if the given permission is fullfilled by the currently logged-in user
 * This function will exit with a 401 Unauthorized header if the permission is not fullfilled
 * Do NOT echo/print sensitive information BEFORE calling this function
 */
function permission_required($permission)
{
    //If permission is not set or empty deny access
    if (empty($permission) || $permission == "") {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(array("status" => "error", "message" => "Cannot grant access for empty permission", "permission" => $permission));
        exit;
    }

    //If permission is "anybody" grant access allways
    if ($permission == "anybody") {
        return true;
    }

    //If user is not logged in, deny access
    if (!isset($_SESSION["id"])) {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(array("status" => "error", "message" => "401 Unauthorized", "permission" => "user"));
        exit;
    }

    //Check for specific permission
    global $dbPdo;
    $own_id = $_SESSION["id"];
    $testStatement = $dbPdo->prepare("SELECT count(*) FROM Nutzer, Rechte, Link_Nutzer_Rechte WHERE Nutzer.id = Link_Nutzer_Rechte.userId AND Rechte.id = Link_Nutzer_Rechte.permissionId AND Rechte.id = :permission AND Nutzer.id = :own_id;");
    $testStatement->bindValue(':permission', $permission);
    $testStatement->bindValue(':own_id', $own_id);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers <= 0) {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(array("status" => "error", "message" => "401 Unauthorized", "permission" => $permission));
        exit;
    } else {
        return true;
    }
}


function getUserAttribute($userId, $attribute)
{
    global $dbPdo;

    $selectStatement = $dbPdo->prepare("SELECT `$attribute` FROM `Nutzer` WHERE `ID`=:userId;");
    $selectStatement->bindValue(':userId', $userId);
    $selectStatement->execute();
    $result = $selectStatement->fetchColumn();
    
    if (isset($result)) {
        return $result;
    } else {
        return null;
    }
}
