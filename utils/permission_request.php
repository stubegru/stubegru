<?php
/**
 * Check if the given permissionRequest is fulfilled by the currently logged-in user
 * This function will exit with a 401 Unauthorized header if the permission is not fulfilled
 * Do NOT echo/print sensitive information BEFORE calling this function
 */
function permissionRequest($permChannel)
{
    global $dbPdo;
    //echo "Checking permissionRequest for $permChannel<br>";

    //If permissionChannel is not set or empty deny access
    if (empty($permChannel) || $permChannel == "") {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(array("status" => "error", "message" => "Cannot grant access for empty permissionRequest", "permissionRequest" => $permChannel));
        exit;
    }

    //get permissions according to the given permissionChannel
    $selectStatement = $dbPdo->prepare("SELECT * FROM `permission_requests` WHERE `name` = :permChannel;");
    $selectStatement->bindValue(':permChannel', $permChannel);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //check for empty permission List
    if($resultList == false){
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(array("status" => "error", "message" => "The permission request got an empty permission list. If you don't want to protect this action by any permission, use 'anybody' as required permission for this permissionRequest", "permissionRequest" => $permChannel));
        exit;
    }

    foreach ($resultList as $row) {
        $permission = $row["permissionId"];
        //echo "Checking permission for $permission<br>";


        if (empty($permission) || $permission == "") {
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(array("status" => "error", "message" => "Cannot grant access for empty permission", "permission" => $permission));
            exit;
        }

        //If permission is "anybody" grant access allways
        if ($permission == "anybody") {
            continue;
        }

        //If user is not logged in, deny access
        if (empty($_SESSION["id"])) {
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(array("status" => "error", "message" => "This resource is only accessible for logged in users", "permission" => "user"));
            exit;
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
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(array("status" => "error", "message" => "401 Unauthorized", "permission" => $permission));
            exit;
        }
    }


    return true; //Return true if none of the tests before rejected the access
}
