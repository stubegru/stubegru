<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$loggedInUserId = $_SESSION["id"];


$updateStatement = $dbPdo->prepare("UPDATE `Termine` SET blocked='0' WHERE blocked = :userId;");
$updateStatement->bindValue(':userId', $loggedInUserId);
$updateStatement->execute();

session_unset();
session_destroy();
$_SESSION = array();

echo json_encode(array("status" => "success", "message" => "User with id $loggedInUserId is logged off"));
