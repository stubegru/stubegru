<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

function getUserAttribute($userId, $attribute)
{
    permissionRequest("USER_READ");
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

function getUserList()
{
    permissionRequest("USER_READ");
    global $dbPdo;
    $selectStatement = $dbPdo->query("SELECT `id`, `name`, `mail`, `account`, `role`, `erfassungsdatum`, `erfasser` FROM `Nutzer`;");
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //index by id
    $toReturn = array();
    foreach ($resultList as $row) {
        $toReturn[$row["id"]] = $row;
    }

    return $toReturn;
}
