<?php

function setRolePresetNotifications($userId, $roleId)
{
    global $dbPdo;
    //Load role presets
    $selectStatement = $dbPdo->prepare("SELECT * from `role_presets` WHERE `type` LIKE 'notification%' AND roleId=:role;");
    $selectStatement->bindValue(':role', $roleId);
    $selectStatement->execute();
    $result = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //Convert plain preset entries to datasets for notification_type_user table
    $presetData = array();
    foreach ($result as $row) {
        $notificationTypeId = $row["subjectId"];
        $channel = $row["type"];
        $channel = substr($channel, strpos($channel, "_") + 1);

        if ($channel == "online") {
            if (!isset($presetData[$notificationTypeId])) {
                $presetData[$notificationTypeId] = array("online" => 1, "mail" => 0);
            } else {
                $presetData[$notificationTypeId]["online"] = 1;
            }
        } else if ($channel == "mail") {
            if (!isset($presetData[$notificationTypeId])) {
                $presetData[$notificationTypeId] = array("online" => 0, "mail" => 1);
            } else {
                $presetData[$notificationTypeId]["mail"] = 1;
            }
        }
    }


    //Iterativ Abos setzen
    $insertStatement = $dbPdo->prepare("INSERT INTO `notification_type_user` (`userId`,`notificationType`,`online`,`mail`) VALUES (:userId,:notificationType,:onlineValue,:mailValue);");
    foreach ($presetData as $notificationType => $row) {
        $insertStatement->bindValue(':userId', $userId);
        $insertStatement->bindValue(':notificationType', $notificationType);
        $insertStatement->bindValue(':onlineValue', $row["online"]);
        $insertStatement->bindValue(':mailValue', $row["mail"]);
        $insertStatement->execute();
    }
}

/**
 * Check if theres already an account with this username
 * returns Error and exits the script if the username is already known
*/
function checkIfUsernameExists($username)
{
    global $dbPdo;
    $testStatement = $dbPdo->prepare("SELECT COUNT(*) from `Nutzer` WHERE account=:account;");
    $testStatement->bindValue(':account', $username);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers > 0) {
        echo json_encode(array("status" => "error", "message" => "Es existiert bereits ein Account mit dem Nutzernamen '$username'. Für einen neuen Account bitte einen anderen Nutzernamen wählen."));
        exit;
    }
}

function setPermissions($userId, $permissions)
{
    global $dbPdo;
    //Delete all existing permission links
    $deleteStatement = $dbPdo->prepare("DELETE FROM `permissions_user` WHERE `userId` = :userId;");
    $deleteStatement->bindValue(':userId', $userId);
    $deleteStatement->execute();

    //set new permission links
    $insertStatement = $dbPdo->prepare("INSERT INTO `permissions_user`(`userId`, `permissionId`) VALUES (:userId,:permissionId);");

    foreach ($permissions as $perm) {
        $insertStatement->bindValue(':userId', $userId);
        $insertStatement->bindValue(':permissionId', $perm);
        $insertStatement->execute();
    }
}
