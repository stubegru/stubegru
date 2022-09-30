<?php



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
