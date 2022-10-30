<?php
$BASE_PATH = getenv("BASE_PATH");

function getUserName($userId)
{
    global $dbPdo;

    $selectStatement = $dbPdo->prepare("SELECT `name` FROM `Nutzer` WHERE `id`=:userId;");
    $selectStatement->bindValue(":userId",$userId);
    $selectStatement->execute();
    $name = $selectStatement->fetchColumn();
    return $name;
}

function getUserMail($userId)
{
    global $dbPdo;

    $selectStatement = $dbPdo->prepare("SELECT `mail` FROM `Nutzer` WHERE `id`=:userId;");
    $selectStatement->bindValue(":userId",$userId);
    $selectStatement->execute();
    $mail = $selectStatement->fetchColumn();
    return $mail;
}

function getUserList()
{
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
