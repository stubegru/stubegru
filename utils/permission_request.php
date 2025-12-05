<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php";

/**
 * Check if the given permissionRequest is fulfilled by the currently logged-in user
 * This function will exit with a 401 Unauthorized header if the permission is not fulfilled
 * Do NOT echo/print sensitive information BEFORE calling this function
 */
function permissionRequest($permChannel)
{
    $result = permissionRequestWithoutExit($permChannel);

    if (empty($result["status"]) || $result["status"] != "success") {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode($result);
        exit;
    }
}


function permissionRequestWithoutExit($permChannel)
{
    global $dbPdo;
    //echo "Checking permissionRequest for $permChannel<br>";

    //If permissionChannel is not set or empty deny access
    if (empty($permChannel) || $permChannel == "") {
        return array("status" => "error", "message" => "Cannot grant access for empty permissionRequest", "permissionRequest" => $permChannel);
    }

    //get permissions according to the given permissionChannel
    $selectStatement = $dbPdo->prepare("SELECT * FROM `permission_requests` WHERE `name` = :permChannel;");
    $selectStatement->bindValue(':permChannel', $permChannel);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //check for empty permission List
    if ($resultList == false) {
        return array("status" => "error", "message" => "The permission request got an empty permission list. If you don't want to protect this action by any permission, use 'anybody' as required permission for this permissionRequest", "permissionRequest" => $permChannel);
    }

    foreach ($resultList as $row) {
        $permission = $row["permissionId"];
        //echo "Checking permission for $permission<br>";


        if (empty($permission) || $permission == "") {
            return array("status" => "error", "message" => "Cannot grant access for empty permission", "permission" => $permission, "permissionRequest" => $permChannel);
        }

        //If permission is "anybody" grant access allways
        if ($permission == "anybody") {
            continue;
        }

        //If user is not logged in, deny access
        if (session_status() == PHP_SESSION_NONE) {
            session_start(); //Session starten, falls sie noch nicht läuft
        }
        if (empty($_SESSION["id"]) || empty($_SESSION['application']) || $_SESSION["application"] != getenv("APPLICATION_ID")) {
            session_destroy(); // Destroy session from other sessions
            return array("status" => "error", "message" => "You are not logged in. This resource is only accessible for logged in users", "permission" => $permission, "permissionRequest" => $permChannel);
        }

        //If permission is "user" grant access now
        if ($permission == "user") {
            continue;
        }

        //Check for specific permission
        $own_id = $_SESSION["id"];
        $testStatement = $dbPdo->prepare("SELECT count(*) FROM `Nutzer`, `permissions`, `permissions_user` WHERE Nutzer.id = permissions_user.userId AND `permissions`.id = permissions_user.permissionId AND `permissions`.id = :permission AND Nutzer.id = :own_id;");
        $testStatement->bindValue(':permission', $permission);
        $testStatement->bindValue(':own_id', $own_id);
        $testStatement->execute();
        $rowNumbers = $testStatement->fetchColumn();
        if ($rowNumbers <= 0) {
            return array("status" => "error", "message" => "You have no permission to access this resource or action. Required permission: $permission", "permission" => $permission, "permissionRequest" => $permChannel);
        }
    }

    //return success if none of the checks before returned errors
    return array("status" => "success", "message" => "The permission request was fulfilled for: $permChannel", "permissionRequest" => $permChannel);
}
