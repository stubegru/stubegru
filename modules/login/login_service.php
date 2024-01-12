<?php
$BASE_PATH = getenv("BASE_PATH");
require_once("$BASE_PATH/utils/database_without_auth.php"); //ACHTUNG: database_without_auth.php sollte normalerweise nie ohne authorization eingebunden werden. Hier Ausnahme, da der Nutzer beim Login noch nicht eingeloggt ist.

$user = $_POST["username"];
$passwort = $_POST["password"];

$selectStatement = $dbPdo->prepare("SELECT `id`, `passwort` FROM `Nutzer` WHERE `account` = :user;");
$selectStatement->bindValue(':user', $user);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);


if (count($resultList) > 0) {
    $row = $resultList[0];
    $id = $row["id"];
    $pwdHashDb = $row["passwort"];

    if (password_verify($passwort, $pwdHashDb)) {

        ini_set('session.gc_maxlifetime', 36000); // server should keep session data for AT LEAST 10 hours
        session_set_cookie_params(0); // each client should remember their session id till restart
        session_start();

        $_SESSION["id"] = $id;
        $_SESSION["application"] = getenv("APPLICATION_ID");

        $result = array("status" => "success");
    } else {
        $result = array('status' => "error");
    }
} else {
    $result = array('status' => "error");
}

echo json_encode($result);
